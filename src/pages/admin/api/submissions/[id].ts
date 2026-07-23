import type { APIRoute } from 'astro';
import { markSubmissionRead, deleteSubmission } from '../../../../db/submission';

export const prerender = false;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const PATCH: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '', 10);
  if (isNaN(id)) return json({ ok: false }, 400);

  try {
    await markSubmissionRead(id);
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ ok: false }, 500);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '', 10);
  if (isNaN(id)) return json({ ok: false }, 400);

  try {
    await deleteSubmission(id);
    return json({ ok: true }, 200);
  } catch (e) {
    return json({ ok: false }, 500);
  }
};
