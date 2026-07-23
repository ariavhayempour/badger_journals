import { sql } from './client';
import type { SubmissionInput } from '../lib/submission-validation';

// No duplicate handling — `submissions` has no unique constraint; errors propagate to the route.
export async function insertSubmission(input: SubmissionInput): Promise<void> {
  await sql`INSERT INTO submissions (name, email, submission_type, message)
            VALUES (${input.name.trim()}, ${input.email.trim()}, ${input.type}, ${input.message.trim()})`;
}
