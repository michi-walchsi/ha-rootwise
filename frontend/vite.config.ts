import { defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

// One ES module with a content hash in its name: a new version gets a new URL,
// so browsers and the companion app never run a stale card.
export default defineConfig({
  define: { __VERSION__: JSON.stringify(pkg.version) },
  build: {
    outDir: "../custom_components/rootwise/www",
    emptyOutDir: true,
    target: "es2022",
    reportCompressedSize: false,
    rollupOptions: {
      input: "src/index.ts",
      output: {
        format: "es",
        entryFileNames: "rootwise-cards.[hash].js",
        codeSplitting: false,
      },
    },
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
  },
});
