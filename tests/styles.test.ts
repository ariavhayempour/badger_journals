import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Read stylesheet sources from disk — Vite resolves `*.css?raw` to an empty module (docs/claude/code-notes.md).
import layout from '../src/layouts/BaseLayout.astro?raw';

const read = (rel: string): string =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const tokens = read('../src/styles/tokens.css');
const global = read('../src/styles/global.css');

describe('T1 — design tokens (src/styles/tokens.css)', () => {

  it('defines the Cardinal Red brand color and its dark variant', () => {
    expect(tokens).toMatch(/--color-cardinal:\s*#c5050c/i);
    expect(tokens).toMatch(/--color-cardinal-dark:\s*#[0-9a-f]{3,6}/i);
  });

  it('defines the neutral ink/paper scale', () => {
    for (const name of ['--color-ink', '--color-paper', '--color-paper-muted', '--color-rule']) {
      expect(tokens).toContain(name);
    }
  });

  it('defines display + body font family tokens', () => {
    expect(tokens).toMatch(/--font-display:[^;]*Playfair Display/);
    expect(tokens).toMatch(/--font-body:[^;]*Inter/);
  });

  it('defines a type scale and spacing/shape tokens', () => {
    for (const name of ['--step-0', '--step-4', '--space-4', '--radius', '--shadow-1']) {
      expect(tokens).toContain(name);
    }
  });

  it('never reintroduces the legacy crimson', () => {
    expect(tokens.toLowerCase()).not.toContain('#8b1a1a');
  });
});

describe('T1 — global base (src/styles/global.css)', () => {
  it('consumes tokens for body typography and links (no raw hex)', () => {
    expect(global).toMatch(/var\(--font-body\)/);
    expect(global).toMatch(/var\(--color-cardinal/);
    expect(global).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('provides shared :hover, :active, and :focus-visible interaction states', () => {
    expect(global).toContain(':hover');
    expect(global).toContain(':active');
    expect(global).toContain(':focus-visible');
  });

  it('does not hand-roll @font-face — font delivery is owned by @fontsource (T2)', () => {
    expect(global).not.toMatch(/^\s*@font-face/m);
  });
});

describe('T4 — editorial template (src/styles/global.css)', () => {
  it('constrains main content to a readable measure', () => {
    expect(global).toMatch(/main\s*\{[\s\S]*?max-width/);
  });

  it('spaces stacked page sections for consistent rhythm (T5)', () => {
    expect(global).toMatch(/main\s*>\s*\*\s*\+\s*section\s*\{[\s\S]*?margin-top/);
  });
});

describe('T2 — self-hosted fonts via @fontsource', () => {
  it('imports the Latin-subset Playfair Display display weights (600, 700)', () => {
    expect(layout).toMatch(/@fontsource\/playfair-display\/latin-600\.css/);
    expect(layout).toMatch(/@fontsource\/playfair-display\/latin-700\.css/);
  });

  it('imports the Latin-subset Inter body weights (400, 500, 600)', () => {
    expect(layout).toMatch(/@fontsource\/inter\/latin-400\.css/);
    expect(layout).toMatch(/@fontsource\/inter\/latin-500\.css/);
    expect(layout).toMatch(/@fontsource\/inter\/latin-600\.css/);
  });

  it('makes no external font requests (no Google Fonts hosts in the styling layer)', () => {
    for (const src of [layout, global, tokens]) {
      expect(src).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    }
  });
});

describe('T1 — BaseLayout wires the styling layer once', () => {
  it('imports both the tokens and global base stylesheets', () => {
    expect(layout).toMatch(/import\s+['"][^'"]*styles\/tokens\.css['"]/);
    expect(layout).toMatch(/import\s+['"][^'"]*styles\/global\.css['"]/);
  });
});
