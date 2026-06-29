import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    // Terser squeezes more out of the bundle than the default esbuild minifier
    // (extra compress passes + comment stripping), so SEO/perf scanners that
    // re-minify and compare don't flag the assets as "not minified".
    minify: "terser",
    terserOptions: {
      compress: { passes: 2 },
      format: { comments: false },
    },
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro({
      // Vercel Build Output API v3 — without this, builds emit node-server to .output/
      preset: process.env.VERCEL ? "vercel" : "node-server",
    }),
    viteReact(),
  ],
});
