import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import RsvpTable from '../../src/components/RsvpTable.astro';
import type { MeetingGroup } from '../../src/lib/rsvp-grouping';

async function render(groups: MeetingGroup[]): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(RsvpTable, { props: { groups } });
}

const group: MeetingGroup = {
  meeting: 'Fall Kickoff',
  rsvps: [
    {
      id: 1,
      name: 'Ada Lovelace',
      email: 'ada@wisc.edu',
      meeting: 'Fall Kickoff',
      created_at: '2026-07-10T15:30:00.000Z',
    },
  ],
};

describe('RsvpTable', () => {
  it('shows an empty state when there are no groups', async () => {
    const html = await render([]);
    expect(html).toContain('No RSVPs yet.');
    expect(html).not.toContain('<table');
  });

  it('labels each meeting and renders its RSVP rows', async () => {
    const html = await render([group]);
    expect(html).not.toContain('No RSVPs yet.');
    expect(html).toContain('Fall Kickoff');
    expect(html).toContain('Ada Lovelace');
    expect(html).toContain('ada@wisc.edu');
  });

  it('renders a section per meeting', async () => {
    const html = await render([
      group,
      {
        meeting: 'Spring Finale',
        rsvps: [
          {
            id: 2,
            name: 'Grace Hopper',
            email: 'grace@wisc.edu',
            meeting: 'Spring Finale',
            created_at: '2026-07-12T15:30:00.000Z',
          },
        ],
      },
    ]);
    expect(html).toContain('Fall Kickoff');
    expect(html).toContain('Spring Finale');
    expect(html).toContain('Grace Hopper');
  });
});
