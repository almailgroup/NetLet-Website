import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { applySecurity, apiRateLimit, authRateLimit } from "./security";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Before any route, so a blocked request never reaches application code.
  applySecurity(app);
  // 50mb was inherited from a template that proxied file uploads. Nothing here
  // accepts a file: the largest body the API sees is a cart mutation. Leaving
  // it meant any unauthenticated caller could make the process buffer 50MB per
  // request. 256kb is generous for JSON and bounded.
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ limit: "256kb", extended: true }));
  // Liveness. The tunnel and any uptime monitor need one URL that answers
  // without touching Shopify or the database, so a red check means this
  // process is down rather than a dependency being slow.
  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
  });

  // tRPC API
  app.use("/api/trpc/auth.login", authRateLimit);
  app.use("/api/trpc/auth.register", authRateLimit);
  app.use("/api/trpc", apiRateLimit);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = Number.parseInt(process.env.PORT || "3000", 10);

  // Scanning for a free port is a development convenience. In production the
  // port is a contract: the tunnel or reverse proxy in front of this process is
  // pointed at exactly one. Drifting to the next free port there would take the
  // storefront off the internet while leaving a healthy-looking process behind,
  // which is the worst kind of outage to diagnose. Fail loudly instead.
  const isDevelopment = process.env.NODE_ENV === "development";
  const port = isDevelopment ? await findAvailablePort(preferredPort) : preferredPort;

  if (isDevelopment && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code !== "EADDRINUSE") throw error;
    console.error(
      `Port ${port} is already in use. Stop whatever is holding it, or set PORT to a free one.`
    );
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
