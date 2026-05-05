import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Canonical site URL for SEO tags/sitemaps. Do not rely on proxy headers at runtime.
  site: "https://www.climatrade.store",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
