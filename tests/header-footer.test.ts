import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import HeaderCmp from '../src/components/Header.astro';
import FooterCmp from '../src/components/Footer.astro';
import header from '../src/components/Header.astro?raw';
import footer from '../src/components/Footer.astro?raw';

const styleBlock = (src: string): string => src.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';

describe('T3 — branded Header (scoped styles, tokens only)', () => {
  it('carries a scoped <style> block', () => {
    expect(header).toMatch(/<style>[\s\S]*<\/style>/);
  });

  it('sets the wordmark in the display serif', () => {
    expect(styleBlock(header)).toMatch(/var\(--font-display\)/);
  });

  it('applies a cardinal brand accent to the masthead', () => {
    expect(styleBlock(header)).toMatch(/var\(--color-cardinal/);
  });

  it('uses tokens only — no raw hex in the scoped styles', () => {
    expect(styleBlock(header)).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('compiles and scopes its styling onto rendered elements', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeaderCmp);
    expect(html).toMatch(/data-astro-cid/);
  });

  it('links to the admin dashboard from the primary nav', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeaderCmp);
    expect(html).toMatch(/<a[^>]*href="\/admin\/dashboard"[^>]*>[^<]*Admin/);
  });
});

describe('T3 — branded Footer (scoped styles, tokens only)', () => {
  it('carries a scoped <style> block', () => {
    expect(footer).toMatch(/<style>[\s\S]*<\/style>/);
  });

  it('uses tokens for its branding (with a cardinal accent) and no raw hex', () => {
    const style = styleBlock(footer);
    expect(style).toMatch(/var\(--color-cardinal/);
    expect(style).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('compiles and scopes its styling onto rendered elements', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FooterCmp);
    expect(html).toMatch(/data-astro-cid/);
  });
});
