import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { src } from './mock-path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { type InterestFormInput } from '../src/lib/interest-validation';
import InterestForm from '../src/components/InterestForm.astro';

const valid: InterestFormInput = {
  firstName: 'Bucky',
  lastName: 'Badger',
  yearInSchool: 'Junior',
  email: 'bucky@wisc.edu',
};

async function postInterest(
  bodyText: string,
  insertImpl: (input: InterestFormInput) => Promise<{ status: 'ok' } | { status: 'duplicate' }> = async () => ({
    status: 'ok',
  }),
  hitImpl: (key: string) => Promise<number> = async () => 1,
) {
  vi.resetModules();
  process.env.DATABASE_URL = 'postgres://fake:fake@localhost:5432/fake';

  const insertInterestForm = vi.fn(insertImpl);
  const hitRateLimit = vi.fn(hitImpl);

  vi.doMock(src('db/interest'), () => ({ insertInterestForm }));
  vi.doMock(src('db/rate-limit'), () => ({ hitRateLimit }));
  vi.doMock(src('db/client'), () => ({ sql: vi.fn() }));

  const { POST } = await import('../src/pages/api/interest');
  const request = new Request('http://localhost/api/interest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: bodyText,
  });
  const res = await POST({ request, clientAddress: '1.2.3.4' } as never);
  return { res, insertInterestForm };
}

describe('POST /api/interest', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://fake:fake@localhost:5432/fake';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('returns 201 ok for a valid submission and inserts it', async () => {
    const { res, insertInterestForm } = await postInterest(JSON.stringify(valid));
    expect(res.status).toBe(201);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(await res.json()).toEqual({ ok: true });
    expect(insertInterestForm).toHaveBeenCalledWith(valid);
  });

  it('returns 400 with field errors for invalid input and does not insert', async () => {
    const { res, insertInterestForm } = await postInterest(JSON.stringify({ ...valid, email: 'foo@gmail.com' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errors.map((e: { field: string }) => e.field)).toContain('email');
    expect(insertInterestForm).not.toHaveBeenCalled();
  });

  it('returns 409 duplicate when the insert reports a duplicate', async () => {
    const { res } = await postInterest(JSON.stringify(valid), async () => ({ status: 'duplicate' }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, code: 'duplicate' });
  });

  it('returns 500 server when the insert throws unexpectedly', async () => {
    const { res } = await postInterest(JSON.stringify(valid), async () => {
      throw new Error('db failure');
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, code: 'server' });
  });

  it('returns 400 without throwing on malformed JSON', async () => {
    const { res, insertInterestForm } = await postInterest('{ invalid json');
    expect(res.status).toBe(400);
    expect((await res.json()).ok).toBe(false);
    expect(insertInterestForm).not.toHaveBeenCalled();
  });

  it('returns 429 rate_limited when over the limit and does not insert', async () => {
    const { res, insertInterestForm } = await postInterest(JSON.stringify(valid), undefined, async () => 6);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, code: 'rate_limited' });
    expect(insertInterestForm).not.toHaveBeenCalled();
  });
});

async function renderForm(): Promise<string> {
  return (await AstroContainer.create()).renderToString(InterestForm);
}

describe('InterestForm.astro component', () => {
  it('renders a native submittable form targeting /api/interest', async () => {
    const html = await renderForm();
    expect(html).toMatch(/<form[^>]*action="\/api\/interest"/);
    expect(html).toMatch(/<form[^>]*method="post"/i);
    expect(html).toMatch(/<button[^>]*type="submit"/);
  });

  it('contains inputs for firstName, lastName, yearInSchool, and email', async () => {
    const html = await renderForm();
    for (const field of ['firstName', 'lastName', 'yearInSchool', 'email']) {
      expect(html).toMatch(new RegExp(`name="${field}"`));
    }
  });

  it('associates inputs with labels', async () => {
    const html = await renderForm();
    for (const field of ['firstName', 'lastName', 'yearInSchool', 'email']) {
      const input = new RegExp(`name="${field}"[^>]*id="([^"]+)"|id="([^"]+)"[^>]*name="${field}"`).exec(html);
      expect(input, `input for ${field}`).not.toBeNull();
      const id = input![1] ?? input![2];
      expect(html).toMatch(new RegExp(`<label[^>]*for="${id}"`));
    }
  });

  it('includes a honeypot field', async () => {
    const html = await renderForm();
    expect(html).toMatch(/<input[^>]*name="company"/);
  });
});
