import { defineCollection, z } from "astro:content";

const author = defineCollection({
  schema: ({ image }) =>
    z.object({
      firstname: z.string(),
      lastname: z.string(),
      avatar: image().refine((img) => img.width >= 96, {
        message: "Author avatar image must be at least 96 pixels wide!",
      }),
      // socials
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
    }),
});

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    authors: z.array(z.string()).default(["anonymous"]), // the same as the filename without the extension
    topics: z.array(z.string()).default([]), // the same as the filename without the extension
    title: z.string(),
    draft: z.boolean().default(false),
    description: z.string(),
    // Transform string to Date object
    pubDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    updatedDate: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    heroImage: z.string().optional(),
  }),
});

const topic = defineCollection({
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { blog, author, topic };
