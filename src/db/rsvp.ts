import { sql } from './client';
import type { RsvpInput } from '../lib/rsvp-validation';

export type InsertRsvpResult = { status: 'ok' } | { status: 'duplicate' };

// Postgres unique_violation — the (email, meeting) constraint is the race arbiter.
const UNIQUE_VIOLATION = '23505';

// Insert-and-catch rather than check-then-insert, so concurrent RSVPs can't slip
// between a existence check and the write.
export async function insertRsvp(input: RsvpInput): Promise<InsertRsvpResult> {
  try {
    await sql`INSERT INTO rsvps (name, email, meeting) VALUES (${input.name.trim()}, ${input.email.trim()}, ${input.meeting})`;
    return { status: 'ok' };
  } catch (err) {
    if (isUniqueViolation(err)) return { status: 'duplicate' };
    throw err;
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}
