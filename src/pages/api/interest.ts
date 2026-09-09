import type { APIRoute } from 'astro';
import { validateInterestForm, type InterestFormInput } from '../../lib/interest-validation';
import { checkAbuse } from '../../lib/abuse-guard';
import { insertInterestForm } from '../../db/interest';

export const prerender = false;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'invalid', errors: [] }, 400);
  }

  const blocked = await checkAbuse({ body, endpoint: 'interest', clientAddress });
  if (blocked) return blocked;

  const input = coerceInput(body);
  const errors = validateInterestForm(input);
  if (errors.length > 0) return json({ ok: false, errors }, 400);

  try {
    const result = await insertInterestForm(input);
    if (result.status === 'duplicate') return json({ ok: false, code: 'duplicate' }, 409);
    return json({ ok: true }, 201);
  } catch {
    // Swallow the error detail — never log the submitted email (PII).
    return json({ ok: false, code: 'server' }, 500);
  }
};

function coerceInput(body: unknown): InterestFormInput {
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  return {
    firstName: typeof b.firstName === 'string' ? b.firstName : '',
    lastName: typeof b.lastName === 'string' ? b.lastName : '',
    yearInSchool: typeof b.yearInSchool === 'string' ? b.yearInSchool : '',
    email: typeof b.email === 'string' ? b.email : '',
  };
}
