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
