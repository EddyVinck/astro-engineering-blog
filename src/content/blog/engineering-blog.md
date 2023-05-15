---
title: "README: What's included in this Engineering Blog template?"
topics: ["docs"]
authors:
  - eddy-vinck
description: "How to get started with your new engineering blog"
pubDate: "April 24 2023"
heroImage: "/img/readme.jpg"
---

# Astro Starter Kit: Engineering Blog

This template was built to easily create an engineering blog for one or multiple authors.

Demo: https://astro-engineering-blog.netlify.app/

## Getting started

```
npm create astro@latest -- --template eddyvinck/astro-engineering-blog
```

### Configuration

Edit the values in `src/consts.ts` to match your brand or company:

```ts
export const BRAND = "Acme";
export const SITE_TITLE = "Acme Engineering";
export const SITE_URL = "https://astro-engineering-blog.netlify.app";
export const SITE_DESCRIPTION = "Welcome to the Acme Engineering blog!";
export const PAGINATION_POSTS_PER_PAGE = 5;
```

Change any lines or add more in the `<head>` tags in `src/components/BaseHead.astro`, like the favicon:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

You can also update the colors in `tailwind.config.css`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        header: "#f86423",
        "header-foreground": "#000",
        link: "#f86423",
        primary: {
          500: "#f86423",
          600: "#db5215",
        },
        "primary-foreground": "#000",
      },
```

## Features

- ✅ Easy configuration
- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Uses [`astro:assets`](https://docs.astro.build/en/guides/assets/) for optimized images
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support
- ✅ Search functionality
- ✅ Author system
- ✅ Multiple authors per post (co-authoring)
- ✅ Topics
- ✅ Blog pagination
- ✅ Blog drafts

## Technologies used

- Astro as the framework tying everything together
- Solid.js for search (all `.tsx` files) and any other features that require JavaScript
- Tailwind CSS for styling
- Fuse.js for search logic
- Everything is written in TypeScript 💙

## Thank you ❤️

- Astro team & all the other library authors
- The maintainers of the [Astro blog template](https://github.com/withastro/astro/tree/latest/examples/blog?on=github) which was used as a base for this template
- [FrontValue](https://frontvalue.nl/), for letting me work on this template during work hours

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## CLI Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

### Learn more about Astro

Check out [the documentation](https://docs.astro.build) or jump into the [Discord server](https://astro.build/chat).
