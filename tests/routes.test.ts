import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Mission from '../src/pages/mission.astro';
import Team from '../src/pages/team.astro';
import Meetings from '../src/pages/meetings.astro';
import CreateNextDigest from '../src/pages/create-next-digest.astro';
import Contact from '../src/pages/contact.astro';

// These fully-static pages carry the AC-1/2/3 title+meta guarantees that are testable here.
const STATIC_PAGES = [
  { name: 'mission', Comp: Mission, title: 'Mission · Badger Journals', h1: 'Mission' },
  { name: 'team', Comp: Team, title: 'Our Team · Badger Journals', h1: 'Our Team' },
  { name: 'meetings', Comp: Meetings, title: 'Meetings · Badger Journals', h1: 'Meetings' },
  { name: 'create-next-digest', Comp: CreateNextDigest, title: 'Create the Next Digest · Badger Journals', h1: 'Create the Next Digest' },
  { name: 'contact', Comp: Contact, title: 'Contact Us · Badger Journals', h1: 'Contact Us' },
];

async function render(Comp: (typeof STATIC_PAGES)[number]['Comp']): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Comp);
}

describe('static route rendering', () => {
  for (const page of STATIC_PAGES) {
    it(`/${page.name} renders its own title, meta, and heading`, async () => {
      const html = await render(page.Comp);
      expect(html).toContain(`<title>${page.title}</title>`);
      expect(html).toContain(`property="og:title" content="${page.h1}"`);
      expect(html).toContain(`>${page.h1}</h1>`); // dev build injects data-astro-* attrs on <h1>

    });
  }

  it('gives every page a distinct title', async () => {
    const titles = await Promise.all(
      STATIC_PAGES.map(async (p) => {
        const html = await render(p.Comp);
        return /<title>([^<]*)<\/title>/.exec(html)?.[1];
      }),
    );
    expect(new Set(titles).size).toBe(STATIC_PAGES.length);
  });
});

describe('contact page (forms deferred to 008/009)', () => {
  it('renders both sections without any form elements', async () => {
    const html = await render(Contact);
    expect(html).toContain('Get Involved');
    expect(html).toContain('Start a New Digest');
    expect(html).not.toMatch(/<form|<input|<textarea/);
  });
});
