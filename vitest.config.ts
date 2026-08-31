import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    // Every layer, so a test cannot be silently skipped by living beside the
    // code it covers. The previous server-only glob is why shared/ tests never
    // ran and why unrelated suites were filed under server/.
    include: ["{server,shared,client}/**/*.{test,spec}.{ts,tsx}"],
  },
});
