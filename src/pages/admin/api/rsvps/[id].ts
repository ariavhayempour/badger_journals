import type { APIRoute } from 'astro';
import { validateRsvpEdit } from '../../../../lib/rsvp-validation';
import { updateRsvp, deleteRsvp } from '../../../../db/rsvp';

export const prerender = false;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = parseInt(params.id || '', 10);
  if (isNaN(id)) return json({ ok: false }, 400);

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name : '';
  const email = typeof body?.email === 'string' ? body.email : '';

  const errors = validateRsvpEdit({ name, email });
  if (errors.length > 0) return json({ ok: false, errors }, 400);

  try {
    const result = await updateRsvp(id, { name, email });
    if (result.status === 'not_found') return json({ ok: false }, 404);
    if (result.status === 'duplicate') return json({ ok: false, code: 'duplicate' }, 409);
    return json({ ok: true, rsvp: result.rsvp }, 200);
  } catch (e) {
    return json({ ok: false }, 500);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '', 10);
  if (isNaN(id)) return json({ ok: false }, 400);

  try {
    await deleteRsvp(id);
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ ok: false }, 500);
  }
};
