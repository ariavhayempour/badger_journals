import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { EventRow } from '../src/db/schema';

// Fixed far-past / far-future so assertions never depend on the real clock.
const PAST: EventRow = {
  id: 1,
  slug: '2000-01-01-retro',
  date: '2000-01-01',
  title: 'Retro kickoff',
  time: '5:00 PM',
  location: 'Old Hall 100',
  created_at: '2000-01-01T00:00:00Z',
};
const FUTURE: EventRow = {
  id: 2,
  slug: '2099-12-31-future',
  date: '2099-12-31',
  title: 'Future session',
  time: '6:00 PM',
  location: 'Chamberlin Hall 2103',
  created_at: '2099-01-01T00:00:00Z',
};

// Render the page against seeded rows by mocking the DB read (no live DB in CI).
async function renderWith(rows: EventRow[]): Promise<string> {
  vi.resetModules();
  vi.doMock('../src/db/event', () => ({ listEvents: async () => rows }));
  const { default: Meetings } = await import('../src/pages/meetings.astro');
  const html = await (await AstroContainer.create()).renderToString(Meetings);
  vi.doUnmock('../src/db/event');
  return html;
}

describe('/meetings page shell', () => {
  it('renders its own title, meta, and heading', async () => {
    const html = await renderWith([]);
    expect(html).toContain('<title>Meetings · Badger Journals</title>');
    expect(html).toContain('property="og:title" content="Meetings"');
    expect(html).toContain('>Meetings</h1>');
  });
});

describe('/meetings render', () => {
  it('renders a meeting date as a <time datetime> plus each present detail', async () => {
    const html = await renderWith([FUTURE]);
    expect(html).toContain('datetime="2099-12-31"');
    expect(html).toContain(FUTURE.title!);
    expect(html).toContain(FUTURE.time!);
    expect(html).toContain(FUTURE.location!);
  });

  it('shows a far-past meeting under "Past meetings", never in the upcoming list', async () => {
    const html = await renderWith([PAST, FUTURE]);
    expect(html).toContain('Past meetings');
    // The past date appears after the "Past meetings" heading, not before it.
    const heading = html.indexOf('Past meetings');
    expect(html.indexOf('datetime="2000-01-01"')).toBeGreaterThan(heading);
    expect(html.indexOf('datetime="2099-12-31"')).toBeLessThan(heading);
  });

  it('renders the empty state when there are no upcoming meetings', async () => {
    expect(await renderWith([])).toContain('Stay tuned for upcoming meetings!');
    // All-past: empty state still shows, and the past section renders beneath it.
    const allPast = await renderWith([PAST]);
    expect(allPast).toContain('Stay tuned for upcoming meetings!');
    expect(allPast).toContain('Past meetings');
  });

  it('exposes an RSVP form keyed to each upcoming meeting, but not to past meetings', async () => {
    const html = await renderWith([FUTURE, PAST]);
    expect(html).toContain('action="/api/rsvp"');
    expect(html).toContain(`value="${FUTURE.slug}"`); // form wired to the upcoming meeting's slug
    expect(html).not.toContain(`value="${PAST.slug}"`); // past meetings get no form
  });

  it('renders no form in the empty state or an all-past list', async () => {
    expect(await renderWith([])).not.toMatch(/<form/i);
    expect(await renderWith([PAST])).not.toMatch(/<form/i);
  });
});
