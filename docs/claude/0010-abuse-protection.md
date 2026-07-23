# 0010 — Spam & abuse protection

Implements story `docs/user-stories/0010.md`: a defense-in-depth pass over the two public write
routes (`/api/rsvp`, `/api/inquiry`) adding three independent layers — a honeypot field,
server-side length caps, and a Neon-backed fixed-window rate limiter. Spec: `SPEC.md` (root,
untracked). No new dependency, no new secret, no `vercel.json`. Layers are independent so any
one can fail without disabling the others.

## Guard order (per request)

Both routes run the same pipeline; the shared guard is `src/lib/abuse-guard.ts`:

```
parse JSON → coerce → checkAbuse(honeypot → rate limit) → validate → insert
```

`checkAbuse({ body, endpoint, clientAddress })` returns a short-circuit `Response` (blocked) or
`null` (continue). Honeypot is checked **before** the rate-limit write so bot noise never burns
a rate-limit slot. Validation and insert are unchanged from 0008/0009 and run only when the
guard returns `null`.

## Honeypot (`src/lib/honeypot.ts`)

Hidden field name `company`. `isBotSubmission(body)` is true only when `body.company` is a
non-empty string after trim — so blank human submissions always pass. Both forms render it as a
visually-hidden input (`position:absolute; left:-9999px`) that is `aria-hidden="true"`,
`tabindex="-1"`, and `autocomplete="off"`, so assistive tech and the keyboard tab order never
reach it; only autofilling bots populate it.

**Silent accept:** a filled honeypot returns the normal success shape (`201 { ok: true }`)
**without** any DB write. Bots see success and don't retry or adapt; the story's reject and
never-written criteria are both satisfied without tipping off the bot with a distinct error.

The forms' scoped `<script>` sends `company` alongside the real payload (empty for humans) so
the server sees the field; it is kept out of the typed validation input so the validators'
signatures are unchanged.

## Length caps (`src/lib/limits.ts`)

`MAX_NAME = 120`, `MAX_EMAIL = 254`, `MAX_MESSAGE = 5000`. Both validators
(`rsvp-validation.ts`, `submission-validation.ts`) reject over-cap values on the trimmed length
with a field error, after the existing empty/format checks (so an empty field reports "required"
rather than a length error). The server is authoritative; the forms also carry matching
`maxlength` attributes sourced from the same constants for UX, but never rely on them.

## Rate limiter (fixed window, Neon-backed, fail-open)

**Policy** (`src/lib/rate-limit.ts`, pure, clock injected): `WINDOW_MS = 60_000`,
`MAX_HITS = 5`. `windowStart(nowMs)` floors to the window; `bucketKey(endpoint, ip, nowMs)`
scopes one counter per endpoint + client + window; `isOverLimit(count)` is `count > MAX_HITS`,
so five requests per window are allowed and the sixth is blocked.

**Store** (`src/db/rate-limit.ts` + `migrations/0002_rate_limit.sql`): the
`rate_limit_hits(key, window_start, count, expires_at)` table backs an atomic upsert —
`INSERT … ON CONFLICT (key) DO UPDATE SET count = count + 1 RETURNING count` — so the
allow/deny decision is one round-trip and correct under concurrency (no check-then-write race).
Expired buckets are pruned opportunistically (`DELETE … WHERE expires_at < now()`) as a
best-effort side call that can never block a submission. All values are parameterized, never
concatenated into SQL text. `src/db/schema.ts` mirrors the table; `tests/db/schema.test.ts`
guards against DDL drift.

**Fail-open:** the guard wraps the entire rate-limit path in a `try/catch` and returns `null`
(allow) on any thrown error — a limiter or DB outage must never block legitimate submissions.
When the runtime can't supply a client IP, the key falls back to a constant sentinel so the
limiter still functions (globally) rather than throwing.

## API contract additions

Both routes gain one status on top of the 0008/0009 contract; everything else is unchanged:

| Condition | Status | Body |
|---|---|---|
| Honeypot filled | `201` | `{ ok: true }` (no DB write) |
| Over rate limit | `429` | `{ ok: false, code: 'rate_limited' }` |

Both forms handle `429` in the scoped `<script>`: a clear message in the `role="status"` region
with **typed values preserved** (no reset) so the user can retry after the window.

## Testing & verification

- Pure libs (`honeypot`, `limits`, `rate-limit` policy, both validators) are unit-tested
  directly — deterministic, no DB, clock injected.
- The `hitRateLimit` upsert is tested with `src/db/client` mocked, asserting parameterization.
- Route tests mock the db modules and call `POST({ request, clientAddress })`, covering honeypot
  silent-accept, `429` over-limit, under-limit pass-through, and fail-open on limiter throw.
- `tests/db/schema.test.ts` asserts `RATE_LIMIT_COLUMNS` match the `0002` DDL.
- CI has no live DB (per 0006): atomic-upsert-under-concurrency and real `429`/fail-open are
  verified out-of-band against Neon (`DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm db:migrate`).

## Out of scope

CSRF, CAPTCHA, email-ownership verification, IP allow/deny lists, admin-configurable limits, a
cleanup cron (cleanup is opportunistic in the upsert), `vercel.json` changes, and extracting the
shared `WISC_EMAIL` regex (still deferred, per 0009).
