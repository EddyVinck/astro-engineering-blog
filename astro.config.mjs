import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
import { SITE_URL } from "./src/consts.ts";

// https://astro.build/config
export default defineConfig({
  output: "",
  adapter: netlify({
    edgeMiddleware: false,
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
