import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateRsvp, type RsvpInput } from '../src/lib/rsvp-validation';

const valid: RsvpInput = { name: 'Bucky Badger', email: 'bucky@wisc.edu', meeting: '2026-09-12-kickoff' };

// Errors are keyed by field so callers can map them to inputs.
const fields = (input: RsvpInput): string[] => validateRsvp(input).map((e) => e.field);

describe('validateRsvp — name', () => {
  it('flags an empty name', () => {
    expect(fields({ ...valid, name: '' })).toContain('name');
  });

  it('flags a whitespace-only name', () => {
    expect(fields({ ...valid, name: '   ' })).toContain('name');
  });

  it('accepts a name with surrounding whitespace', () => {
    expect(fields({ ...valid, name: '  Bucky  ' })).not.toContain('name');
  });
});

describe('validateRsvp — email', () => {
  it('rejects a non-wisc domain', () => {
    expect(fields({ ...valid, email: 'foo@gmail.com' })).toContain('email');
  });

  it('rejects wisc.edu as a non-final domain label', () => {
    expect(fields({ ...valid, email: 'foo@wisc.edu.evil.com' })).toContain('email');
  });

  it('rejects an empty local part', () => {
    expect(fields({ ...valid, email: '@wisc.edu' })).toContain('email');
  });

  it('accepts a bare wisc.edu address', () => {
    expect(fields({ ...valid, email: 'netid@wisc.edu' })).not.toContain('email');
  });

  it('accepts a wisc.edu subdomain address', () => {
    expect(fields({ ...valid, email: 'a@cs.wisc.edu' })).not.toContain('email');
  });
});

describe('validateRsvp — meeting', () => {
  it('flags an empty meeting slug', () => {
    expect(fields({ ...valid, meeting: '' })).toContain('meeting');
  });
});

describe('validateRsvp — valid input', () => {
  it('returns no errors for a valid RSVP', () => {
    expect(validateRsvp(valid)).toEqual([]);
  });
});

// --- Task 3: insertRsvp DB helper (client mocked, no live DB) ---

type SqlImpl = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;

// Load insertRsvp with src/db/client's `sql` replaced by a spy, so no real DB is touched.
async function withMockedSql(impl: SqlImpl) {
  vi.resetModules();
  const sql = vi.fn(impl);
  vi.doMock('../src/db/client', () => ({ sql }));
  const { insertRsvp } = await import('../src/db/rsvp');
  return { insertRsvp, sql };
}

afterEach(() => {
  vi.doUnmock('../src/db/client');
  vi.resetModules();
});

describe('insertRsvp', () => {
  const input: RsvpInput = { name: 'Bucky', email: 'bucky@wisc.edu', meeting: '2026-09-12-kickoff' };

  it('returns ok on a successful insert', async () => {
    const { insertRsvp } = await withMockedSql(async () => []);
    expect(await insertRsvp(input)).toEqual({ status: 'ok' });
  });

  it('maps a 23505 unique-violation to duplicate', async () => {
    const { insertRsvp } = await withMockedSql(async () => {
      throw Object.assign(new Error('duplicate key'), { code: '23505' });
    });
    expect(await insertRsvp(input)).toEqual({ status: 'duplicate' });
  });

  it('propagates any non-unique-violation error', async () => {
    const { insertRsvp } = await withMockedSql(async () => {
      throw Object.assign(new Error('connection reset'), { code: '08006' });
    });
    await expect(insertRsvp(input)).rejects.toThrow('connection reset');
  });

  it('passes values as parameters, never concatenated into the SQL text', async () => {
    const { insertRsvp, sql } = await withMockedSql(async () => []);
    await insertRsvp(input);
    const [strings, ...values] = sql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    expect(values).toEqual([input.name, input.email, input.meeting]);
    expect(strings.join('')).not.toContain(input.email);
  });
});
