import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // lib/* are framework-agnostic and dependency-injected, so they run in plain node.
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // `server-only` is a build-time guard for the Next bundler; it is a no-op in tests.
      "server-only": new URL("./test/stubs/server-only.ts", import.meta.url).pathname,
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});
