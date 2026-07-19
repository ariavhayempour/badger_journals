import { describe, it, expect } from 'vitest';

// Content Layer's getCollection() only populates during `astro build`/`dev`, not in the
// Vitest runtime, so integrity is validated against the source markdown (loaded raw via
// Vite's import.meta.glob) — which is exactly what AC-4 ("no legacy content lost") is about.
const reviewFiles = import.meta.glob('../src/content/reviews/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const digestFiles = import.meta.glob('../src/content/digests/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const DIGESTS = ['cardiovascular', 'cancer', 'neuroscience'];

const EXPECTED_REVIEW_SLUGS = [
  'novel-biomarkers-heart-failure',
  'sglt2-inhibitors-cardiac-protection',
  'tumor-microenvironments-immunotherapy-resistance',
  'kras-mutations-pancreatic-cancer',
  'neuroinflammation-alzheimers',
  'optogenetics-neural-circuits',
].sort();

const slugFrom = (path: string) => path.split('/').pop()!.replace(/\.md$/, '');
const slugsOf = (files: Record<string, string>) => Object.keys(files).map(slugFrom).sort();

describe('reviews collection source', () => {
  it('contains exactly the six migrated reviews', () => {
    expect(slugsOf(reviewFiles)).toEqual(EXPECTED_REVIEW_SLUGS);
  });

  it('every review declares a valid digest, authors, and an excerpt', () => {
    for (const src of Object.values(reviewFiles)) {
      const digest = src.match(/^digest:\s*(\S+)/m)?.[1];
      expect(DIGESTS).toContain(digest);
      expect(src).toMatch(/^authors:/m);
      expect(src).toMatch(/^excerpt:\s*\S+/m);
    }
  });
});

describe('digests collection source', () => {
  it('contains the three digests, each with a description', () => {
    expect(slugsOf(digestFiles)).toEqual([...DIGESTS].sort());
    for (const src of Object.values(digestFiles)) {
      expect(src).toMatch(/^description:\s*\S+/m);
    }
  });
});
