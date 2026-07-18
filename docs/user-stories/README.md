# Badger Journals — User Stories

Epic: **Re-platform Badger Journals to Astro + Vercel with RSVP and admin inbox backend.**

Rebuild the club's legacy single-file `index.html` as a componentized Astro (SSR via Vercel adapter) + React-islands app with a full UW-Madison brand redesign, real per-page URLs, a Postgres-backed RSVP + submission store, and an authenticated admin dashboard.

## Stories

| # | Story | Points | Confidence | Depends on |
|---|-------|--------|-----------|-----------|
| [001](001-astro-vercel-foundation.md) | Scaffold Astro + Vercel foundation | 3 | High | — |
| [002](002-componentized-pages-real-urls.md) | Componentized pages with real per-page URLs | 5 | Med | 001 |
| [003](003-uw-madison-brand-redesign.md) | UW-Madison brand redesign | 5 | Med | 001, 002 |
| [004](004-optimize-self-host-imagery.md) | Optimize + self-host imagery | 3 | Med | 002 |
| [005](005-accessibility-responsive.md) | Accessibility + responsive standards | 5 | Med | 002, 003 |
| [006](006-provision-postgres-data-store.md) | Provision Postgres + submission data store | 3 | Med | 001 |
| [007](007-meetings-calendar.md) | Meetings calendar from repo data | 3 | Med | 002 |
| [008](008-rsvp-to-meeting.md) | RSVP to a meeting | 5 | Med | 006, 007 |
| [009](009-unified-inquiry-submission-flow.md) | Unified inquiry / join / start-a-digest flow | 5 | Med | 006 |
| [010](010-spam-abuse-protection.md) | Spam + abuse protection on submission endpoints | 5 | Med | 008, 009 |
| [011](011-admin-authentication.md) | Admin authentication | 5 | **Low** | 001 |
| [012](012-admin-dashboard.md) | Admin dashboard (RSVPs + inquiry inbox) | 3 | Med | 006, 008, 009, 011 |

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
