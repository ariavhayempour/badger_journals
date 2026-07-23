import { sql } from './client';

// Atomic fixed-window increment: one round-trip decides allow/deny under concurrency, returning the key's new count.
export async function hitRateLimit(key: string, windowStart: string, expiresAt: string): Promise<number> {
  await pruneExpired();
  const rows = (await sql`
    INSERT INTO rate_limit_hits (key, window_start, count, expires_at)
    VALUES (${key}, ${windowStart}, 1, ${expiresAt})
    ON CONFLICT (key) DO UPDATE SET count = rate_limit_hits.count + 1
    RETURNING count`) as { count: number }[];
  return rows[0]?.count ?? 0;
}

// Best-effort housekeeping; a failure here must never block a submission.
async function pruneExpired(): Promise<void> {
  try {
    await sql`DELETE FROM rate_limit_hits WHERE expires_at < now()`;
  } catch {
    // Row TTL is an optimization, not correctness-critical — ignore and continue.
  }
}
