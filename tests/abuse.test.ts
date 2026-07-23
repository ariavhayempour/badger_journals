import { describe, it, expect, vi, afterEach } from 'vitest';
import { isBotSubmission, HONEYPOT_FIELD } from '../src/lib/honeypot';
import { validateRsvp } from '../src/lib/rsvp-validation';
import { validateSubmission } from '../src/lib/submission-validation';
import { MAX_NAME, MAX_EMAIL, MAX_MESSAGE } from '../src/lib/limits';
import { WINDOW_MS, MAX_HITS, windowStart, bucketKey, isOverLimit } from '../src/lib/rate-limit';

// --- isBotSubmission (pure) ---

describe('isBotSubmission', () => {
  it('is true when the honeypot field holds a non-empty string', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: 'Acme Inc' })).toBe(true);
  });

  it('is true when the honeypot value is padded but non-empty', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: '  x  ' })).toBe(true);
  });

  it('is false when the honeypot field is whitespace only', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: '   ' })).toBe(false);
  });

  it('is false when the honeypot field is an empty string', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: '' })).toBe(false);
  });

  it('is false when the honeypot field is absent', () => {
    expect(isBotSubmission({ name: 'Bucky' })).toBe(false);
  });

  it('is false when the honeypot field is a non-string', () => {
    expect(isBotSubmission({ [HONEYPOT_FIELD]: 42 })).toBe(false);
  });

  it('is false for a non-object body', () => {
    expect(isBotSubmission(null)).toBe(false);
    expect(isBotSubmission('company=x')).toBe(false);
    expect(isBotSubmission(undefined)).toBe(false);
  });
});

// --- Route coverage: honeypot silent-accept on both endpoints ---

afterEach(() => {
  vi.doUnmock('../src/db/rsvp');
  vi.doUnmock('../src/db/submission');
  vi.doUnmock('../src/db/rate-limit');
  vi.doUnmock('../src/db/client');
  vi.resetModules();
});

type Limiter = () => Promise<number>;

// Under-limit by default so the guard proceeds past the rate-limit check.
async function postRsvp(body: unknown, rateLimit: Limiter = async () => 1) {
  vi.resetModules();
  const insertRsvp = vi.fn(async () => ({ status: 'ok' as const }));
  vi.doMock('../src/db/rsvp', () => ({ insertRsvp }));
  const hitRateLimit = vi.fn(rateLimit);
  vi.doMock('../src/db/rate-limit', () => ({ hitRateLimit }));
  const { POST } = await import('../src/pages/api/rsvp');
  const request = new Request('http://localhost/api/rsvp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const res = await POST({ request, clientAddress: '1.2.3.4' } as never);
  return { res, insertRsvp, hitRateLimit };
}

async function postInquiry(body: unknown, rateLimit: Limiter = async () => 1) {
  vi.resetModules();
  const insertSubmission = vi.fn(async () => undefined);
  vi.doMock('../src/db/submission', () => ({ insertSubmission }));
  const hitRateLimit = vi.fn(rateLimit);
  vi.doMock('../src/db/rate-limit', () => ({ hitRateLimit }));
  const { POST } = await import('../src/pages/api/inquiry');
  const request = new Request('http://localhost/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const res = await POST({ request, clientAddress: '1.2.3.4' } as never);
  return { res, insertSubmission };
}

// --- Length caps (server-side authoritative) ---

const emailAtCap = (): string => {
  const email = `${'a'.repeat(MAX_EMAIL - '@wisc.edu'.length)}@wisc.edu`;
  expect(email.length).toBe(MAX_EMAIL);
  return email;
};

describe('length caps — validateRsvp', () => {
  const valid = { name: 'Bucky', email: 'bucky@wisc.edu', meeting: 'm' };

  it('rejects a name longer than MAX_NAME', () => {
    const errs = validateRsvp({ ...valid, name: 'a'.repeat(MAX_NAME + 1) });
    expect(errs.map((e) => e.field)).toContain('name');
  });

  it('accepts a name exactly at MAX_NAME', () => {
    const errs = validateRsvp({ ...valid, name: 'a'.repeat(MAX_NAME) });
    expect(errs.map((e) => e.field)).not.toContain('name');
  });

  it('rejects an email longer than MAX_EMAIL', () => {
    const errs = validateRsvp({ ...valid, email: `${'a'.repeat(MAX_EMAIL)}@wisc.edu` });
    expect(errs.map((e) => e.field)).toContain('email');
  });

  it('accepts an email exactly at MAX_EMAIL', () => {
    const errs = validateRsvp({ ...valid, email: emailAtCap() });
    expect(errs.map((e) => e.field)).not.toContain('email');
  });
});

describe('length caps — validateSubmission', () => {
  const valid = { name: 'Bucky', email: 'bucky@wisc.edu', type: 'inquiry' as const, message: 'Hi' };

  it('rejects a name longer than MAX_NAME', () => {
    const errs = validateSubmission({ ...valid, name: 'a'.repeat(MAX_NAME + 1) });
    expect(errs.map((e) => e.field)).toContain('name');
  });

  it('rejects an email longer than MAX_EMAIL', () => {
    const errs = validateSubmission({ ...valid, email: `${'a'.repeat(MAX_EMAIL)}@wisc.edu` });
    expect(errs.map((e) => e.field)).toContain('email');
  });

  it('rejects a message longer than MAX_MESSAGE', () => {
    const errs = validateSubmission({ ...valid, message: 'a'.repeat(MAX_MESSAGE + 1) });
    expect(errs.map((e) => e.field)).toContain('message');
  });

  it('accepts boundary values exactly at each cap', () => {
    const errs = validateSubmission({
      name: 'a'.repeat(MAX_NAME),
      email: emailAtCap(),
      type: 'inquiry',
      message: 'a'.repeat(MAX_MESSAGE),
    });
    expect(errs).toEqual([]);
  });
});

describe('honeypot — POST /api/rsvp', () => {
  const valid = { name: 'Bucky Badger', email: 'bucky@wisc.edu', meeting: '2026-09-12-kickoff' };

  it('silently accepts a filled honeypot with 201 { ok: true } and does not insert', async () => {
    const { res, insertRsvp } = await postRsvp({ ...valid, company: 'Acme' });
    expect(res.status).toBe(201);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(await res.json()).toEqual({ ok: true });
    expect(insertRsvp).not.toHaveBeenCalled();
  });

  it('processes normally when the honeypot is empty', async () => {
    const { res, insertRsvp } = await postRsvp({ ...valid, company: '' });
    expect(res.status).toBe(201);
    expect(insertRsvp).toHaveBeenCalledWith(valid);
  });
});

describe('honeypot — POST /api/inquiry', () => {
  const valid = { name: 'Bucky Badger', email: 'bucky@wisc.edu', type: 'inquiry', message: 'Hello there.' };

  it('silently accepts a filled honeypot with 201 { ok: true } and does not insert', async () => {
    const { res, insertSubmission } = await postInquiry({ ...valid, company: 'Acme' });
    expect(res.status).toBe(201);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(await res.json()).toEqual({ ok: true });
    expect(insertSubmission).not.toHaveBeenCalled();
  });

  it('processes normally when the honeypot is empty', async () => {
    const { res, insertSubmission } = await postInquiry({ ...valid, company: '' });
    expect(res.status).toBe(201);
    expect(insertSubmission).toHaveBeenCalledWith(valid);
  });
});

// --- Rate-limit policy (pure, clock injected) ---

describe('rate-limit policy', () => {
  it('floors the window start to WINDOW_MS', () => {
    expect(windowStart(WINDOW_MS * 3 + 1234)).toBe(WINDOW_MS * 3);
  });

  it('builds a deterministic bucket key from endpoint, ip, and window', () => {
    const now = WINDOW_MS * 5 + 10;
    expect(bucketKey('rsvp', '1.2.3.4', now)).toBe(`rsvp:1.2.3.4:${WINDOW_MS * 5}`);
    expect(bucketKey('rsvp', '1.2.3.4', now)).toBe(bucketKey('rsvp', '1.2.3.4', now + 5));
  });

  it('separates buckets across endpoints and windows', () => {
    expect(bucketKey('rsvp', 'ip', 0)).not.toBe(bucketKey('inquiry', 'ip', 0));
    expect(bucketKey('rsvp', 'ip', 0)).not.toBe(bucketKey('rsvp', 'ip', WINDOW_MS));
  });

  it('is over limit only beyond MAX_HITS', () => {
    expect(isOverLimit(MAX_HITS)).toBe(false);
    expect(isOverLimit(MAX_HITS + 1)).toBe(true);
  });
});

// --- hitRateLimit DB helper (client mocked, no live DB) ---

type SqlImpl = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;

describe('hitRateLimit', () => {
  it('increments atomically and returns the new count', async () => {
    vi.resetModules();
    const impl: SqlImpl = async () => [{ count: 3 }];
    const sql = vi.fn(impl);
    vi.doMock('../src/db/client', () => ({ sql }));
    const { hitRateLimit } = await import('../src/db/rate-limit');
    expect(await hitRateLimit('k', 'WSTART', 'EXP')).toBe(3);
    vi.doUnmock('../src/db/client');
  });

  it('passes values as parameters, never concatenated into the SQL text', async () => {
    vi.resetModules();
    const impl: SqlImpl = async () => [{ count: 1 }];
    const sql = vi.fn(impl);
    vi.doMock('../src/db/client', () => ({ sql }));
    const { hitRateLimit } = await import('../src/db/rate-limit');
    await hitRateLimit('rsvp:1.2.3.4:60000', 'WSTART', 'EXP');
    const insert = sql.mock.calls.find((call) => call[0].join('').includes('INSERT INTO rate_limit_hits'));
    expect(insert, 'insert call').toBeDefined();
    const [strings, ...values] = insert!;
    expect(values).toEqual(['rsvp:1.2.3.4:60000', 'WSTART', 'EXP']);
    expect(strings.join('')).not.toContain('rsvp:1.2.3.4:60000');
    vi.doUnmock('../src/db/client');
  });
});

// --- Rate limit at the route: over-limit, under-limit, fail-open ---

describe('rate limit — POST /api/rsvp', () => {
  const valid = { name: 'Bucky Badger', email: 'bucky@wisc.edu', meeting: '2026-09-12-kickoff' };

  it('returns 429 when the limiter reports over-limit and does not insert', async () => {
    const { res, insertRsvp } = await postRsvp(valid, async () => MAX_HITS + 1);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, code: 'rate_limited' });
    expect(insertRsvp).not.toHaveBeenCalled();
  });

  it('proceeds when under the limit', async () => {
    const { res, insertRsvp } = await postRsvp(valid, async () => MAX_HITS);
    expect(res.status).toBe(201);
    expect(insertRsvp).toHaveBeenCalled();
  });

  it('fails open when the limiter throws — the submission still succeeds', async () => {
    const { res, insertRsvp } = await postRsvp(valid, async () => {
      throw new Error('db down');
    });
    expect(res.status).toBe(201);
    expect(insertRsvp).toHaveBeenCalled();
  });
});

describe('rate limit — POST /api/inquiry', () => {
  const valid = { name: 'Bucky Badger', email: 'bucky@wisc.edu', type: 'inquiry', message: 'Hello there.' };

  it('returns 429 when the limiter reports over-limit and does not insert', async () => {
    const { res, insertSubmission } = await postInquiry(valid, async () => MAX_HITS + 1);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, code: 'rate_limited' });
    expect(insertSubmission).not.toHaveBeenCalled();
  });

  it('proceeds when under the limit', async () => {
    const { res, insertSubmission } = await postInquiry(valid, async () => MAX_HITS);
    expect(res.status).toBe(201);
    expect(insertSubmission).toHaveBeenCalled();
  });

  it('fails open when the limiter throws — the submission still succeeds', async () => {
    const { res, insertSubmission } = await postInquiry(valid, async () => {
      throw new Error('db down');
    });
    expect(res.status).toBe(201);
    expect(insertSubmission).toHaveBeenCalled();
  });
});
