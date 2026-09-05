/**
 * `pnpm preflight` — configuration check for a self-hosted NetLet.
 *
 * Reports what is ready and what is missing, in the order it has to be fixed,
 * so setting the Mac mini up is one command rather than a guess about which
 * step silently failed. Checks configuration only; `pnpm shopify:probe` is the
 * one that calls Shopify for real.
 *
 * Exits non-zero if anything blocking is wrong, so it can gate a deploy script.
 */
import "dotenv/config";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

type Status = "ok" | "warn" | "blocked";
type Check = { status: Status; title: string; detail: string; fix?: string };

const checks: Check[] = [];
const add = (status: Status, title: string, detail: string, fix?: string) =>
  checks.push({ status, title, detail, fix });

/* ------------------------------------------------------------- toolchain --- */

const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor >= 20) {
  add("ok", "Node", `v${process.versions.node}`);
} else {
  add("blocked", "Node", `v${process.versions.node} is too old — 20 or newer is required`,
    "brew install node");
}

try {
  const pnpmVersion = execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim();
  add("ok", "pnpm", `v${pnpmVersion}`);
} catch {
  add("blocked", "pnpm", "not on PATH",
    "corepack enable && corepack prepare pnpm@latest --activate");
}

/* --------------------------------------------------------- configuration --- */

const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim() ?? "";
if (!domain) {
  add("blocked", "SHOPIFY_STORE_DOMAIN", "not set — there is no catalog without it",
    "Set it to your myshopify domain, e.g. netlet.myshopify.com");
} else if (/^https?:\/\//i.test(domain) || domain.endsWith("/") || domain.includes("/")) {
  // A pasted admin URL is the usual shape here, and it produces a confusing
  // fetch failure rather than an obvious configuration error.
  add("blocked", "SHOPIFY_STORE_DOMAIN", `"${domain}" includes a scheme or path`,
    "Use the bare host only: netlet.myshopify.com");
} else {
  const shape = domain.endsWith(".myshopify.com") ? "" : "  (not a .myshopify.com host — fine if it is a custom Storefront domain)";
  add("ok", "SHOPIFY_STORE_DOMAIN", domain + shape);
}

const token = process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN?.trim() ?? "";
if (!token) {
  add("blocked", "SHOPIFY_STOREFRONT_API_ACCESS_TOKEN", "not set — there is no catalog without it",
    "Shopify admin -> Settings -> Apps and sales channels -> Develop apps -> your app -> Configuration -> Storefront API");
} else if (token.startsWith("shpat_") || token.startsWith("shpca_") || token.startsWith("shppa_")) {
  // The single most common mix-up, and it fails as a bare 401 with no hint.
  add("blocked", "SHOPIFY_STOREFRONT_API_ACCESS_TOKEN", "this is an Admin API token, not a Storefront one",
    "Admin tokens start with shpat_. Take the token from the Storefront API tab of the same app instead.");
} else {
  add("ok", "SHOPIFY_STOREFRONT_API_ACCESS_TOKEN", `set (${token.length} characters)`);
}

// Checked after the values themselves: under launchd the environment can come
// from the plist instead, and a missing .env is then merely informational.
const envPath = path.join(ROOT, ".env");
if (existsSync(envPath)) {
  add("ok", ".env", "present");
} else if (domain && token) {
  add("ok", ".env", "absent, but the Shopify values are set in the environment");
} else {
  add("blocked", ".env", "missing, and nothing is set in the environment either",
    "cp .env.example .env, then fill in the two Shopify values");
}

if (process.env.DATABASE_URL?.trim()) {
  add("ok", "DATABASE_URL", "set — accounts, saved items and order tracking are on");
} else {
  add("warn", "DATABASE_URL", "not set — browsing, cart and checkout still work; sign-in, saved items, delivery preference and order tracking stay dark",
    "Optional. Set it later and run pnpm db:push");
}

if (process.env.JWT_SECRET?.trim() || !process.env.DATABASE_URL?.trim()) {
  if (process.env.DATABASE_URL?.trim()) add("ok", "JWT_SECRET", "set");
} else {
  add("blocked", "JWT_SECRET", "a database is configured but sessions cannot be signed",
    "Set JWT_SECRET to a long random string: openssl rand -base64 32");
}

/* ------------------------------------------------------------- firebase --- */

// All four or none: with any one missing the server quietly uses the local
// password digest instead, which looks like "Firebase isn't working" rather
// than like a typo. Naming the missing ones is the whole point of this check.
const firebaseVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_API_KEY",
] as const;
const firebaseMissing = firebaseVars.filter(name => !process.env[name]?.trim());

if (firebaseMissing.length === 0) {
  const key = process.env.FIREBASE_PRIVATE_KEY ?? "";
  if (!key.includes("BEGIN PRIVATE KEY")) {
    add("blocked", "FIREBASE_PRIVATE_KEY", "does not look like a PEM private key",
      "Copy the private_key value from the service-account JSON verbatim, in double quotes");
  } else if (!key.includes("\\n") && !key.includes("\n")) {
    add("blocked", "FIREBASE_PRIVATE_KEY", "is a single line with no newlines — every signature will fail",
      'Keep the JSON\'s \\n escapes: FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"');
  } else {
    add("ok", "Firebase", `accounts are stored in project ${process.env.FIREBASE_PROJECT_ID}`);
  }
} else if (firebaseMissing.length === firebaseVars.length) {
  add("warn", "Firebase", "not set — registration and sign-in use the local password digest instead",
    "Optional. docs/FIREBASE.md has the fifteen-minute setup");
} else {
  add("blocked", "Firebase", `partly set: ${firebaseMissing.join(", ")} missing, so the local password path is used instead`,
    "Set all four, or clear them all to stay on the local path — see docs/FIREBASE.md");
}

/* ---------------------------------------------------------------- build --- */

const serverBundle = path.join(ROOT, "dist", "index.js");
const clientIndex = path.join(ROOT, "dist", "public", "index.html");
if (existsSync(serverBundle) && existsSync(clientIndex)) {
  add("ok", "Build", "dist/index.js and dist/public are present");
} else {
  add("warn", "Build", "not built yet", "pnpm install && pnpm build");
}

/* ----------------------------------------------------------------- port --- */

const port = Number.parseInt(process.env.PORT || "3000", 10);
const portFree = await new Promise<boolean>((resolve) => {
  const probe = net.createServer();
  probe.once("error", () => resolve(false));
  probe.once("listening", () => probe.close(() => resolve(true)));
  probe.listen(port);
});
if (portFree) {
  add("ok", "Port", `${port} is free`);
} else {
  // Not blocking: this is exactly what a healthy, already-running NetLet looks like.
  add("warn", "Port", `${port} is in use — NetLet may already be running`,
    `lsof -nP -iTCP:${port} -sTCP:LISTEN  shows what is holding it`);
}

/* --------------------------------------------------------------- report --- */

const mark = { ok: "  ok  ", warn: " warn ", blocked: "BLOCKED" } as const;
console.log("\nNetLet preflight\n");
for (const check of checks) {
  console.log(`[${mark[check.status]}] ${check.title}`);
  console.log(`           ${check.detail}`);
  if (check.fix && check.status !== "ok") console.log(`           -> ${check.fix}`);
}

const blocked = checks.filter((check) => check.status === "blocked");
console.log("");
if (blocked.length) {
  console.log(`${blocked.length} thing${blocked.length === 1 ? "" : "s"} to fix before NetLet can serve a catalog:`);
  for (const check of blocked) console.log(`  - ${check.title}`);
  console.log("\nSee DEPLOYMENT.md for the full walkthrough.");
  process.exit(1);
}

console.log("Configuration looks right. Next:");
console.log("  pnpm shopify:probe    confirm Shopify answers with real products");
console.log("  pnpm build            if the build check above said otherwise");
console.log("  pnpm start            serve on http://localhost:" + port + "/");
