// Hand-written mirror of migrations/0001_init.sql (the schema source of truth).
// Keep in sync with the DDL; tests/db/schema.test.ts guards the CHECK values.

export const SUBMISSION_TYPES = ['inquiry', 'join', 'digest'] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

export interface RsvpRow {
  id: number;
  name: string;
  email: string;
  meeting: string;
  created_at: string;
}

export interface SubmissionRow {
  id: number;
  name: string;
  email: string;
  submission_type: SubmissionType;
  message: string;
  created_at: string;
}

export const TABLES = {
  rsvps: 'rsvps',
  submissions: 'submissions',
} as const;

export const RSVP_COLUMNS = {
  id: 'id',
  name: 'name',
  email: 'email',
  meeting: 'meeting',
  createdAt: 'created_at',
} as const;

export const SUBMISSION_COLUMNS = {
  id: 'id',
  name: 'name',
  email: 'email',
  submissionType: 'submission_type',
  message: 'message',
  createdAt: 'created_at',
} as const;
