import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SUBMISSION_TYPES, RATE_LIMIT_COLUMNS } from '../../src/db/schema';

const readMigration = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../../migrations/${name}`, import.meta.url)), 'utf8');

const migration = readMigration('0001_init.sql');
const rateLimitMigration = readMigration('0002_rate_limit.sql');

describe('schema ↔ DDL sync', () => {
  it('SUBMISSION_TYPES equals the submission_type CHECK values in the migration', () => {
    const check = migration.match(/submission_type[\s\S]*?IN\s*\(([^)]*)\)/i);
    expect(check, 'submission_type CHECK constraint not found in migration').not.toBeNull();

    const checkValues = [...check![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(checkValues).toEqual([...SUBMISSION_TYPES]);
  });

  it('RATE_LIMIT_COLUMNS mirror the rate_limit_hits columns in the migration', () => {
    const block = rateLimitMigration.match(/CREATE TABLE rate_limit_hits\s*\(([\s\S]*?)\);/i);
    expect(block, 'rate_limit_hits table not found in migration').not.toBeNull();

    const ddlColumns = [...block![1].matchAll(/^\s*([a-z_]+)\s+(?:TEXT|TIMESTAMPTZ|INTEGER)\b/gim)].map((m) => m[1]);
    expect(ddlColumns.sort()).toEqual([...Object.values(RATE_LIMIT_COLUMNS)].sort());
  });
});
