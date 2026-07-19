import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ReviewCard from '../src/components/ReviewCard.astro';
import cardSource from '../src/components/ReviewCard.astro?raw';

const cardStyle = cardSource.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';

const sample = {
  slug: 'novel-biomarkers-heart-failure',
  title: 'Novel Biomarkers in Early Detection of Heart Failure',
  authors: ['Jane Doe', 'John Smith'],
  date: 'March 2025',
  digest: 'cardiovascular' as const,
  excerpt: 'A review of recent research identifying novel protein and genetic biomarkers.',
};

describe('ReviewCard.astro', () => {
  it('renders the review title, authors, and excerpt', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ReviewCard, { props: sample });
    expect(html).toContain(sample.title);
    expect(html).toContain('Jane Doe');
    expect(html).toContain('John Smith');
    expect(html).toContain(sample.excerpt);
  });

  it('links to the review detail page by slug', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ReviewCard, { props: sample });
    expect(html).toContain('href="/reviews/novel-biomarkers-heart-failure"');
  });
});

describe('T4 — ReviewCard editorial card styling', () => {
  it('carries a scoped <style> block', () => {
    expect(cardSource).toMatch(/<style>[\s\S]*<\/style>/);
  });

  it('sets the card title in the display serif', () => {
    expect(cardStyle).toMatch(/var\(--font-display\)/);
  });

  it('uses a hairline rule and a hover state', () => {
    expect(cardStyle).toMatch(/var\(--color-rule\)/);
    expect(cardStyle).toContain(':hover');
  });

  it('uses tokens only — no raw hex in the scoped styles', () => {
    expect(cardStyle).not.toMatch(/#[0-9a-f]{3,6}/i);
  });
});
