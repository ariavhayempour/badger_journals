import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SUBMISSION_TYPES } from '../../src/db/schema';

const migrationPath = fileURLToPath(
  new URL('../../migrations/0001_init.sql', import.meta.url),
);
const migration = readFileSync(migrationPath, 'utf8');

describe('schema ↔ DDL sync', () => {
  it('SUBMISSION_TYPES equals the submission_type CHECK values in the migration', () => {
    const check = migration.match(/submission_type[\s\S]*?IN\s*\(([^)]*)\)/i);
    expect(check, 'submission_type CHECK constraint not found in migration').not.toBeNull();

    const checkValues = [...check![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(checkValues).toEqual([...SUBMISSION_TYPES]);
  });
});
