import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const DIGESTS = ['cardiovascular', 'cancer', 'neuroscience'] as const;

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    date: z.string(), // legacy display format, e.g. 'March 2025'
    digest: z.enum(DIGESTS),
    excerpt: z.string(),
  }),
});

const digests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/digests' }),
  schema: z.object({
    name: z.string(),
    slug: z.enum(DIGESTS),
    description: z.string(),
  }),
});

export const collections = { reviews, digests };
