// Pure fixed-window rate-limit policy. No node:*/DB imports; the clock is passed in
// so buckets stay deterministic and unit-testable.

export const WINDOW_MS = 60_000;
export const MAX_HITS = 5;

// Floor the instant to the start of its fixed window.
export function windowStart(nowMs: number): number {
  return Math.floor(nowMs / WINDOW_MS) * WINDOW_MS;
}

// One counter per endpoint + client + window.
export function bucketKey(endpoint: string, ip: string, nowMs: number): string {
  return `${endpoint}:${ip}:${windowStart(nowMs)}`;
}

// MAX_HITS requests are allowed per window; the next one is over.
export function isOverLimit(count: number): boolean {
  return count > MAX_HITS;
}
