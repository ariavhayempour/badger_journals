import type { APIRoute } from 'astro';
import { deleteInterestForm } from '../../../../db/interest';

export const prerender = false;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '', 10);
  if (isNaN(id)) return json({ ok: false }, 400);

  try {
    await deleteInterestForm(id);
    return json({ ok: true }, 200);
  } catch {
    return json({ ok: false }, 500);
  }
};
