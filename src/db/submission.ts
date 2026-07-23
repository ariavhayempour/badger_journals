import { sql } from './client';
import type { SubmissionInput } from '../lib/submission-validation';
import type { SubmissionRow } from './schema';

// Newest first — backed by submissions_created_at_idx (created_at DESC).
export async function listSubmissions(): Promise<SubmissionRow[]> {
  return (await sql`
    SELECT id, name, email, submission_type, message, created_at
    FROM submissions
    ORDER BY created_at DESC
  `) as SubmissionRow[];
}

// No duplicate handling — `submissions` has no unique constraint; errors propagate to the route.
export async function insertSubmission(input: SubmissionInput): Promise<void> {
  await sql`INSERT INTO submissions (name, email, submission_type, message)
            VALUES (${input.name.trim()}, ${input.email.trim()}, ${input.type}, ${input.message.trim()})`;
}
