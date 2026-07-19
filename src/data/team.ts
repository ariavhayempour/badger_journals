export interface Member {
  name: string;
  role: string;
  major: string;
}

export interface TeamGroup {
  title: string;
  members: Member[];
}

// Roster migrated verbatim from the legacy Team page.
export const team: TeamGroup[] = [
  {
    title: 'Executive Board',
    members: [
      { name: 'Ty Weaver', role: 'President & Founder', major: 'Molecular Biology, Class of 2028' },
      { name: 'Jedd Jang', role: 'Vice President & Co-Founder', major: 'Biochemistry, Class of 2028' },
      { name: 'Sunay Patel', role: 'Treasurer', major: 'Political & Data Science, Class of 2028' },
      { name: 'Grant Kastman', role: 'Secretary', major: 'Biochemistry, Class of 2028' },
    ],
  },
  {
    title: 'Digest Leadership',
    members: [
      { name: 'Ty Weaver & Jedd Jang', role: 'Cardiovascular Digest Directors', major: 'Molecular Biology & Biochemistry, Class of 2028' },
      { name: 'Adit Bhootra', role: 'Cancer Digest Director', major: 'Biology, Class of 2028' },
      { name: 'Mia Ngo', role: 'Neuroscience Digest Director', major: 'Neuroscience, Class of 2028' },
    ],
  },
  {
    title: 'Outreach & Media',
    members: [
      { name: 'Kevin Tran', role: 'Outreach Chair', major: 'Neuroscience, Class of 2028' },
      { name: 'Emily Au', role: 'Media Chair', major: 'Neurobiology, Class of 2028' },
      { name: 'TBD', role: 'Media Chair', major: 'TBD' },
    ],
  },
];
