import { defineCollection, z } from "astro:content";

const author = defineCollection({
  schema: z.object({
    firstname: z.string(),
    lastname: z.string(),
    avatar: z.string().optional(),
    // socials
    twitter: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
  }),
});

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    authorId: z.string().default("anonymous"), // the same as the filename without the extension
    title: z.string(),
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

export const collections = { blog, author };
