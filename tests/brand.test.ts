import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import BaseLayout from '../src/layouts/BaseLayout.astro';
import Header from '../src/components/Header.astro';
import Footer from '../src/components/Footer.astro';
import layout from '../src/layouts/BaseLayout.astro?raw';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = `${dir}/${name}`;
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe('T6 — legacy color regression guard', () => {
  // Mirrors the DoD grep: `grep -ri '8b1a1a\|crimson' src/` must be empty.
  it('has no #8b1a1a or crimson anywhere under src/', () => {
    const offenders = walk(srcDir).filter((file) => {
      const content = readFileSync(file, 'utf8').toLowerCase();
      return content.includes('8b1a1a') || content.includes('crimson');
    });
    expect(offenders).toEqual([]);
  });
});

describe('T6 — BaseLayout wires the branded system', () => {
  it('imports the design tokens, global base, and self-hosted fonts', () => {
    expect(layout).toMatch(/styles\/tokens\.css/);
    expect(layout).toMatch(/styles\/global\.css/);
    expect(layout).toMatch(/@fontsource\/playfair-display/);
    expect(layout).toMatch(/@fontsource\/inter/);
  });

  it('renders the branded header and footer chrome on every page', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Home', description: 'Badger Journals.', path: '/' },
      slots: { default: '<p>page body</p>' },
    });
    expect(html).toContain('class="brand"'); // masthead wordmark
    expect(html).toContain('Madison, WI, 53706'); // footer
    expect(html).toContain('<p>page body</p>'); // slotted content
  });
});

describe('T6 — Header/Footer render their branded structure', () => {
  it('Header renders the wordmark and scoped branding', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);
    // Decorative logo <img> precedes the wordmark inside .brand, so allow markup between (docs/claude/code-notes.md).
    expect(html).toMatch(/class="brand"[\s\S]*?Badger Journals/);
    expect(html).toMatch(/data-astro-cid/); // scoped brand styles compiled onto the chrome
  });

  it('Footer renders the branded footer with scoped branding', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);
    expect(html).toContain('Badger Journals');
    expect(html).toContain('Socials');
    expect(html).toMatch(/data-astro-cid/);
  });
});
