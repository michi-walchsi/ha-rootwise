import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

// Local playground: the cards with a fake Home Assistant, light and dark,
// for design checks and screenshots. Not part of the build.
export default defineConfig({
  root: "sandbox",
  define: { __VERSION__: JSON.stringify(`${pkg.version}-sandbox`) },
  server: { port: 5199, strictPort: true },
});
