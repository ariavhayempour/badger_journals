export interface Meeting {
  date: string; // ISO YYYY-MM-DD; the sole required field, sorted lexicographically
  title?: string; // topic/paper for the session
  time?: string; // human string, e.g. '6:00 PM'
  location?: string; // e.g. 'Chamberlin Hall 2103'
}

// Developer-edited source of truth; edit and redeploy to change the page. May be empty.
export const meetings: Meeting[] = [
  // { date: '2026-09-12', title: 'Kickoff & journal club intro', time: '6:00 PM', location: 'Chamberlin Hall 2103' },
  // { date: '2026-09-26', title: 'Cardiovascular digest deep-dive', time: '6:00 PM', location: 'Chamberlin Hall 2103' },
];
