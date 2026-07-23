import { isBotSubmission } from './honeypot';
import { WINDOW_MS, windowStart, bucketKey, isOverLimit } from './rate-limit';
import { hitRateLimit } from '../db/rate-limit';

// Context each route hands the guard.
export interface AbuseContext {
  body: unknown;
  endpoint: string;
  clientAddress?: string;
}

// Fallback key when the runtime can't supply a client IP, so the limiter still functions.
const SENTINEL_IP = 'unknown';

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Returns a short-circuit Response when a request should be blocked, else null to continue.
export async function checkAbuse({ body, endpoint, clientAddress }: AbuseContext): Promise<Response | null> {
  // Honeypot first, so bot noise never burns a rate-limit slot. Silent-accept: bots see the
  // normal success shape and no row is written.
  if (isBotSubmission(body)) return json({ ok: true }, 201);

  try {
    const now = Date.now();
    const start = windowStart(now);
    const key = bucketKey(endpoint, clientAddress ?? SENTINEL_IP, now);
    const count = await hitRateLimit(
      key,
      new Date(start).toISOString(),
      new Date(start + WINDOW_MS).toISOString(),
    );
    if (isOverLimit(count)) return json({ ok: false, code: 'rate_limited' }, 429);
  } catch {
    // Fail open: a limiter outage must never block legitimate submissions.
    return null;
  }

  return null;
}
