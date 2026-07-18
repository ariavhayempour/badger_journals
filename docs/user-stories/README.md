# Badger Journals — User Stories

Epic: **Re-platform Badger Journals to Astro + Vercel with RSVP and admin inbox backend.**

Rebuild the club's legacy single-file `index.html` as a componentized Astro (SSR via Vercel adapter) + React-islands app with a full UW-Madison brand redesign, real per-page URLs, a Postgres-backed RSVP + submission store, and an authenticated admin dashboard.

## Stories

| # | Story | Points | Confidence | Depends on |
|---|-------|--------|-----------|-----------|
| [001](001.md) | Scaffold Astro + Vercel foundation | 3 | High | — |
| [002](002.md) | Componentized pages with real per-page URLs | 5 | Med | 001 |
| [003](003.md) | UW-Madison brand redesign | 5 | Med | 001, 002 |
| [004](004.md) | Optimize + self-host imagery | 3 | Med | 002 |
| [005](005.md) | Accessibility + responsive standards | 5 | Med | 002, 003 |
| [006](006.md) | Provision Postgres + submission data store | 3 | Med | 001 |
| [007](007.md) | Meetings calendar from repo data | 3 | Med | 002 |
| [008](008.md) | RSVP to a meeting | 5 | Med | 006, 007 |
| [009](009.md) | Unified inquiry / join / start-a-digest flow | 5 | Med | 006 |
| [010](010.md) | Spam + abuse protection on submission endpoints | 5 | Med | 008, 009 |
| [011](011.md) | Admin authentication | 5 | **Low** | 001 |
| [012](012.md) | Admin dashboard (RSVPs + inquiry inbox) | 3 | Med | 006, 008, 009, 011 |

**Total ≈ 50 points.** No story reached the 8-point mandatory-decomposition threshold; each is independently shippable.

## Risk hotspot

- **011 (Admin auth)** — LOW confidence: mechanism is undecided and security-critical. Run a time-boxed spike (hosted provider vs custom session) before locking its estimate; it can escalate to 8 if custom sessions are chosen.

## Open decisions to close early

- Postgres provider: Vercel Postgres vs Neon (story 006)
- Rate-limit backing store: e.g. Vercel KV / Upstash (story 010)
- Admin auth mechanism + admin count (story 011)
- wisc.edu email: format/domain validation only, or ownership verification via confirmation email? (stories 008, 009)
- Typography: carry the serif identity (Playfair Display / Cormorant Garamond / Libre Baskerville) or modernize? (story 003)
- Meetings view: chronological list vs full month-grid widget (story 007)
