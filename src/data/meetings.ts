export interface Meeting {
  id: string; // URL-safe slug, e.g. '2026-09-12-kickoff'; stable identity for RSVPs
  date: string; // ISO YYYY-MM-DD; sorted lexicographically
  title?: string; // topic/paper for the session
  time?: string; // human string, e.g. '6:00 PM'
  location?: string; // e.g. 'Chamberlin Hall 2103'
}

// Developer-edited source of truth; edit and redeploy to change the page. May be empty.
export const meetings: Meeting[] = [
  // { id: '2026-09-12-kickoff', date: '2026-09-12', title: 'Kickoff & journal club intro', time: '6:00 PM', location: 'Chamberlin Hall 2103' },
  // { id: '2026-09-26-cardiovascular', date: '2026-09-26', title: 'Cardiovascular digest deep-dive', time: '6:00 PM', location: 'Chamberlin Hall 2103' },
];

export interface SplitMeetings {
  upcoming: Meeting[];
  past: Meeting[];
}

// Split by build-day: upcoming (>= today) ascending, past (< today) descending. ISO dates compare lexicographically.
export function splitMeetings(all: Meeting[], todayISO: string): SplitMeetings {
  const byDateAsc = (a: Meeting, b: Meeting): number => a.date.localeCompare(b.date);
  const upcoming = all.filter((m) => m.date >= todayISO).sort(byDateAsc);
  const past = all
    .filter((m) => m.date < todayISO)
    .sort(byDateAsc)
    .reverse();
  return { upcoming, past };
}
