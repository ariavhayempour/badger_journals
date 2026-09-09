import { sql } from './client';
import type { InterestFormInput } from '../lib/interest-validation';
import type { InterestFormRow } from './schema';

export type InsertInterestResult = { status: 'ok' } | { status: 'duplicate' };

const UNIQUE_VIOLATION = '23505';

export async function listInterestForms(): Promise<InterestFormRow[]> {
  return (await sql`
    SELECT id, first_name, last_name, year_in_school, email, created_at
    FROM interest_forms
    ORDER BY created_at DESC
  `) as InterestFormRow[];
}

export async function insertInterestForm(input: InterestFormInput): Promise<InsertInterestResult> {
  try {
    await sql`
      INSERT INTO interest_forms (first_name, last_name, year_in_school, email)
      VALUES (${input.firstName.trim()}, ${input.lastName.trim()}, ${input.yearInSchool.trim()}, ${input.email.trim()})
    `;
    return { status: 'ok' };
  } catch (err) {
    if (isUniqueViolation(err)) return { status: 'duplicate' };
    throw err;
  }
}

export async function deleteInterestForm(id: number): Promise<void> {
  await sql`DELETE FROM interest_forms WHERE id = ${id}`;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}
