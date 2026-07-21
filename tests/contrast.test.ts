import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const tokens = readFileSync(fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)), 'utf8');

// Assert WCAG 2.1 AA (4.5:1) directly from token values — axe's contrast rule can't run under jsdom (docs/claude/code-notes.md).
const AA_NORMAL = 4.5;

function hex(token: string): string {
  const m = new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{6})`).exec(tokens);
  if (!m) throw new Error(`token --${token} not found in tokens.css`);
  return m[1];
}

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(color: string): number {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function ratio(fg: string, bg: string): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// Foreground text over background, as painted across the six pages + chrome.
const PAIRS = [
  { label: 'body ink on paper', fg: 'color-ink', bg: 'color-paper' },
  { label: 'card ink on muted', fg: 'color-ink', bg: 'color-paper-muted' },
  { label: 'link cardinal on paper', fg: 'color-cardinal', bg: 'color-paper' },
  { label: 'link/role cardinal on muted', fg: 'color-cardinal', bg: 'color-paper-muted' },
  { label: 'hover cardinal-dark on paper', fg: 'color-cardinal-dark', bg: 'color-paper' },
  { label: 'hover cardinal-dark on muted', fg: 'color-cardinal-dark', bg: 'color-paper-muted' },
];

describe('contrast — token pairs meet WCAG AA (4.5:1)', () => {
  for (const { label, fg, bg } of PAIRS) {
    it(`${label} ≥ ${AA_NORMAL}:1`, () => {
      expect(ratio(hex(fg), hex(bg))).toBeGreaterThanOrEqual(AA_NORMAL);
    });
  }
});
