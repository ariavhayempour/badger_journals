import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { splitMeetings, type Meeting } from '../src/data/meetings';

// Fixed far-past / far-future so assertions never depend on the real clock.
const PAST: Meeting = { id: '2000-01-01-retro', date: '2000-01-01', title: 'Retro kickoff', time: '5:00 PM', location: 'Old Hall 100' };
const FUTURE: Meeting = { id: '2099-12-31-future', date: '2099-12-31', title: 'Future session', time: '6:00 PM', location: 'Chamberlin Hall 2103' };
const TODAY = '2050-06-15'; // between PAST and FUTURE

// Render the page against a seeded meetings array by mocking the data module.
async function renderWith(meetings: Meeting[]): Promise<string> {
  vi.resetModules();
  vi.doMock('../src/data/meetings', async () => {
    const actual = await vi.importActual<typeof import('../src/data/meetings')>('../src/data/meetings');
    return { ...actual, meetings };
  });
  const { default: Meetings } = await import('../src/pages/meetings.astro');
  const html = await (await AstroContainer.create()).renderToString(Meetings);
  vi.doUnmock('../src/data/meetings');
  return html;
}

describe('splitMeetings — pure ordering/split logic', () => {
  it('sorts upcoming ascending and past descending from unordered input', () => {
    const input: Meeting[] = [
      { id: 'm-2050-08-01', date: '2050-08-01' },
      { id: 'm-2050-07-01', date: '2050-07-01' },
      { id: 'm-2050-01-01', date: '2050-01-01' },
      { id: 'm-2050-03-01', date: '2050-03-01' },
    ];
    const { upcoming, past } = splitMeetings(input, TODAY);
    expect(upcoming.map((m) => m.date)).toEqual(['2050-07-01', '2050-08-01']);
    expect(past.map((m) => m.date)).toEqual(['2050-03-01', '2050-01-01']);
  });

  it('places a far-future meeting in upcoming and a far-past meeting in past', () => {
    const { upcoming, past } = splitMeetings([FUTURE, PAST], TODAY);
    expect(upcoming).toEqual([FUTURE]);
    expect(past).toEqual([PAST]);
  });

  it('treats a meeting dated exactly today as upcoming', () => {
    const { upcoming, past } = splitMeetings([{ id: 'm-today', date: TODAY }], TODAY);
    expect(upcoming).toHaveLength(1);
    expect(past).toHaveLength(0);
  });

  it('returns empty upcoming when every meeting is past', () => {
    expect(splitMeetings([PAST], TODAY).upcoming).toHaveLength(0);
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

  // Upcoming meetings now carry an RSVP form, superseding the earlier static-only invariant.
  it('exposes an RSVP form keyed to each upcoming meeting, but not to past meetings', async () => {
    const html = await renderWith([FUTURE, PAST]);
    expect(html).toContain('action="/api/rsvp"');
    expect(html).toContain(`value="${FUTURE.id}"`); // form wired to the upcoming meeting's slug
    expect(html).not.toContain(`value="${PAST.id}"`); // past meetings get no form
  });

  it('renders no form in the empty state or an all-past list', async () => {
    expect(await renderWith([])).not.toMatch(/<form/i);
    expect(await renderWith([PAST])).not.toMatch(/<form/i);
  });
});
