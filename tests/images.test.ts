import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import index from '../src/pages/index.astro?raw';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));
const imagesDir = fileURLToPath(new URL('../src/assets/images', import.meta.url));

// Source guards scan text/code files only — binary assets under src/assets/ are excluded.
const TEXT_EXT = /\.(astro|ts|tsx|js|mjs|cjs|css|md|json)$/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = `${dir}/${name}`;
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function textSources(): string[] {
  return walk(srcDir).filter((file) => TEXT_EXT.test(file));
}

describe('T1 — self-hosted image assets are staged', () => {
  it('has campus.jpg, logo.jpg, and a placeholder avatar under src/assets/images/', () => {
    const files = readdirSync(imagesDir);
    expect(files).toContain('campus.jpg');
    expect(files).toContain('logo.jpg');
    const hasPlaceholder =
      files.includes('placeholder-avatar.jpg') ||
      files.includes('placeholder-avatar.png');
    expect(hasPlaceholder).toBe(true);
  });
});

describe('T1 — image source guards', () => {
  it('has no data: image URI anywhere in src/ (no base64 inlining)', () => {
    const offenders = textSources().filter((file) =>
      /data:image\//i.test(readFileSync(file, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  it('references no content image from an external host in src/', () => {
    const external = /https?:\/\/[^"'`\s)]+\.(png|jpe?g|gif|webp|avif|svg)/i;
    const offenders = textSources().filter((file) =>
      external.test(readFileSync(file, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  it('gives every <Image>/<img> in src/ an alt attribute (empty allowed for decorative)', () => {
    const tag = /<(img|Image)\b[\s\S]*?\/?>/g;
    const offenders: string[] = [];
    for (const file of textSources().filter((f) => f.endsWith('.astro'))) {
      const content = readFileSync(file, 'utf8');
      for (const match of content.matchAll(tag)) {
        if (!/\balt\s*=/.test(match[0])) {
          offenders.push(`${file}: ${match[0].slice(0, 60)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('T2 — campus hero on the home page', () => {
  it('imports the self-hosted campus asset', () => {
    expect(index).toMatch(/import\s+\w+\s+from\s+['"][^'"]*assets\/images\/campus\.jpg['"]/);
  });

  it('renders the hero via astro:assets <Image>', () => {
    expect(index).toMatch(/import\s*\{\s*Image\s*\}\s*from\s*['"]astro:assets['"]/);
    expect(index).toMatch(/<Image\b/);
  });

  it('prioritizes the hero as the LCP element (eager + fetchpriority high)', () => {
    const image = index.match(/<Image\b[\s\S]*?\/?>/)?.[0] ?? '';
    expect(image).toMatch(/loading=["']eager["']/);
    expect(image).toMatch(/fetchpriority=["']high["']/);
  });

  it('serves the hero responsively with widths and sizes', () => {
    const image = index.match(/<Image\b[\s\S]*?\/?>/)?.[0] ?? '';
    expect(image).toMatch(/\bwidths=/);
    expect(image).toMatch(/\bsizes=/);
  });

  it('gives the hero descriptive alt text', () => {
    const image = index.match(/<Image\b[\s\S]*?\/?>/)?.[0] ?? '';
    expect(image).toMatch(/alt=["'][^"']*campus[^"']*["']/i);
  });
});
