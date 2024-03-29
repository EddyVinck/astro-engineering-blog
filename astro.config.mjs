import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
import { SITE_URL } from "./src/consts";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  adapter: netlify({
    edgeMiddleware: false,
    imageCDN: false, // Blog hero image doesn't seem to work with this enabled
  }),
  site: SITE_URL,
  integrations: [
    mdx(),
    sitemap(),
    solidJs({
      include: "**.tsx",
    }),
    tailwind(),
  ],
});
