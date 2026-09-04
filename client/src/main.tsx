import { loadAnalytics } from "@/lib/analytics";
import { DEMO_MODE } from "@/lib/demoMode";
import { demoLink } from "@/lib/demoLink";
import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

/**
 * An expired or missing session surfaces as UNAUTHED_ERR_MSG. There is no portal
 * to bounce to now that sign-in is in-app, so the cached user is simply cleared
 * and the UI falls back to its signed-out state.
 */
const clearSessionIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (error.message !== UNAUTHED_ERR_MSG) return;
  queryClient.setQueryData([["auth", "me"], { type: "query" }], null);
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    clearSessionIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    clearSessionIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    // The static demo build has no `/api/trpc` to talk to, so a local link
    // resolves every procedure from fixtures instead. See lib/demoLink.ts.
    DEMO_MODE
      ? demoLink
      : httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          fetch(input, init) {
            return globalThis.fetch(input, {
              ...(init ?? {}),
              credentials: "include",
            });
          },
        }),
  ],
});

loadAnalytics();

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
