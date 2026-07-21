import { describe, it, expect } from 'vitest';
import team from '../src/pages/team.astro?raw';
import createNextDigest from '../src/pages/create-next-digest.astro?raw';

const styleBlock = (src: string): string => src.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';

// Only pages with bespoke lists carry scoped styles; prose pages already fit the shared editorial template (docs/claude/code-notes.md).
const STYLED = [
  { name: 'team', src: team, grid: /grid/ },
  { name: 'create-next-digest', src: createNextDigest, grid: /\.areas[\s\S]*?grid/ },
];

describe('T5 — per-page editorial layout', () => {
  for (const page of STYLED) {
    const style = styleBlock(page.src);

    it(`${page.name} carries a token-only scoped style with no raw hex`, () => {
      expect(page.src).toMatch(/<style>[\s\S]*<\/style>/);
      expect(style).toMatch(/var\(--/);
      expect(style).not.toMatch(/#[0-9a-f]{3,6}/i);
    });

    it(`${page.name} lays its bespoke list out as a grid`, () => {
      expect(style).toMatch(page.grid);
    });
  }
});
