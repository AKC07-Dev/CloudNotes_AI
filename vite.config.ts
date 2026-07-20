// @lovable.dev/vite-tanstack-config already includes:
// - tanstackStart
// - viteReact
// - tailwindcss
// - tsConfigPaths
// - nitro
// - componentTagger
// - VITE env injection
// - React/TanStack dedupe

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Use src/server.ts as SSR entry
    server: {
      entry: "server",
    },
  },

  vite: {
    // Keep normal Vite settings here if needed
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
