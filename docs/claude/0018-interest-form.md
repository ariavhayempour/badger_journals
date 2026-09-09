# 0018 — Interest Form

Implements the public Interest Form tab and backend. Allows users to submit their first name, last name, year in school, and `@wisc.edu` email to express interest in joining Badger Journals.

## Data flow

```
InterestForm.astro (scoped <script>)
  → validateInterestForm()  (client-side pre-submit feedback)
  → fetch POST /api/interest  { firstName, lastName, yearInSchool, email }
      → checkAbuse()  (honeypot + rate limiting)
      → validateInterestForm()  (server is the authority — re-runs the same rules)
      → insertInterestForm()  → INSERT into interest_forms
          → 23505 unique-violation → duplicate
  ← 201 ok | 400 errors | 409 duplicate | 429 rate_limited | 500 server
```

## Validation rules

`src/lib/interest-validation.ts` provides the single source of truth:
- `firstName`: non-empty string, max length 120 characters (`MAX_NAME`)
- `lastName`: non-empty string, max length 120 characters (`MAX_NAME`)
- `yearInSchool`: non-empty string, max length 50 characters
- `email`: required, matches `@wisc.edu` regex `/^[^\s@]+@([a-z0-9-]+\.)*wisc\.edu$/i`, max length 254 characters (`MAX_EMAIL`)

All fields are required.

## API contract — `POST /api/interest`

`src/pages/api/interest.ts`, `prerender = false`. Response format:

| Condition | Status | Body |
|---|---|---|
| Valid, inserted | `201` | `{ ok: true }` |
| Validation errors | `400` | `{ ok: false, errors: [{ field, message }] }` |
| Malformed / absent JSON | `400` | `{ ok: false, code: 'invalid', errors: [] }` |
| Duplicate (email already submitted) | `409` | `{ ok: false, code: 'duplicate' }` |
| Rate limited | `429` | `{ ok: false, code: 'rate_limited' }` |
| Unexpected failure | `500` | `{ ok: false, code: 'server' }` |

## Database schema

`migrations/0007_interest_forms.sql`:
- `interest_forms` table: `id`, `first_name`, `last_name`, `year_in_school`, `email`, `created_at`.
- `UNIQUE (email)` constraint guarantees one submission per email and maps Postgres `23505` to HTTP `409`.
- Index `interest_forms_created_at_idx` on `created_at DESC`.
