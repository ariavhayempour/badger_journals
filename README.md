# Badger Journals

The website for **Badger Journals**, a student-run journal club at UW–Madison making
cutting-edge research accessible. Built on **Astro 5** (SSR) with **React** islands and
**Tailwind CSS 4**, backed by **Neon** Postgres, and deployed to **Vercel**.

The site has two registers:

- **Public** — a marketing/brand surface (home, meetings, team, contact, submissions) where
  visitors learn about the club, see meeting logistics, and RSVP or submit in a couple of clicks.
- **`/admin`** — a Clerk-authenticated dashboard where officers manage events, review RSVPs,
  and triage submissions.

See [`PRODUCT.md`](PRODUCT.md) for the product brief and [`docs/claude/`](docs/claude/) for
architecture and per-feature decision records.

## Tech stack

- **Astro 5** with `output: 'server'` (SSR via the `@astrojs/vercel` adapter)
- **React 19** islands (`@astrojs/react`) with **shadcn/ui** + **Base UI** components
- **Tailwind CSS 4** (`@tailwindcss/vite`), self-hosted fonts via `@fontsource`
- **Clerk** (`@clerk/astro`) for hosted admin auth
- **Neon** serverless Postgres (`@neondatabase/serverless`) with raw SQL migrations — no ORM
- **Vitest** for the test suite; **Lighthouse CI** for performance/a11y gates
- TypeScript strict mode throughout

## Prerequisites

- **Node.js 22+** (`engines.node` is `>=22`; the `db:migrate` / `db:check` scripts rely on
  Node 22 native TypeScript stripping and the global `WebSocket`)
- **pnpm** (the committed package manager — the lockfile is pnpm's)

Enable pnpm with Corepack if you don't have it:

```bash
corepack enable
```

## Setup

```bash
pnpm install
cp .env.example .env    # then fill in real values (see Environment below)
```

### Environment

Local dev reads `.env` (and `.env.local`); both are gitignored — never commit real values.
See [`.env.example`](.env.example) for the full list.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (injected as a Vercel secret in prod) |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (public, exposed to the client) |
| `CLERK_SECRET_KEY` | Clerk secret key (server-only) |
| `PUBLIC_CLERK_SIGN_IN_URL` | Canonical sign-in path — the embedded admin login (`/admin/login`) |

Pull the Vercel-managed values locally with `npx vercel env pull .env`. Admins are
provisioned via Clerk Restricted mode — there is no public self-serve sign-up.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start the local dev server at http://localhost:4321 |
| `pnpm build` | Production build — runs `astro check` then `astro build`; the gate, must exit 0 with **zero TypeScript errors** |
| `pnpm typecheck` | Type-check only (`astro check`), no build output |
| `pnpm test` | Run the Vitest suite once |
| `pnpm preview` | Serve the production build locally |
| `pnpm db:migrate` | Apply pending SQL migrations (reads `DATABASE_URL`) |
| `pnpm db:check` | Connectivity check against `DATABASE_URL` (insert → read → delete) |

### Quick health check

With the dev server running, the SSR health route proves per-request rendering:

```bash
curl http://localhost:4321/api/health
# {"status":"ok","time":"2026-07-18T23:34:36.499Z"}
```

The `time` value changes on every request.

## Database & migrations

The durable data layer is **Neon** serverless Postgres (via the Vercel Marketplace
integration), accessed with `@neondatabase/serverless` and raw SQL migrations under
[`migrations/`](migrations/) — no ORM. Credentials come from `DATABASE_URL` (a Vercel env
secret; `.env` locally, never committed).

```bash
npx vercel env pull .env                                   # get DATABASE_URL locally
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm db:migrate       # apply migrations (unpooled url)
pnpm db:check                                              # connectivity check
```

Full details — provisioning, secret handling, the schema, and how to add a migration — are
in [`docs/claude/0006-database.md`](docs/claude/0006-database.md).

## Project structure

```
.
├── astro.config.mjs        Astro config: server output, Vercel adapter, Clerk, React, Tailwind
├── tsconfig.json           extends astro/tsconfigs/strict
├── vitest.config.ts        Vitest wired to Astro's Vite config
├── components.json         shadcn/ui config
├── lighthouserc.json       Lighthouse CI budgets
├── migrations/             raw SQL migrations (0001_init.sql, …), applied in order
├── scripts/                migrate.ts, db-check.ts (Node 22 native TS)
├── docs/claude/            architecture + per-feature decision records
└── src/
    ├── middleware.ts       Clerk auth context + the /admin redirect gate
    ├── layouts/            BaseLayout (public shell) + AdminLayout
    ├── pages/
    │   ├── index.astro     home (+ meetings, team, contact, create-next-digest)
    │   ├── api/            SSR endpoints: health, rsvp, inquiry
    │   └── admin/          dashboard, events, rsvps, submissions, login (+ admin APIs)
    ├── components/         Astro + React (islands under ui/, admin/)
    ├── db/                 Neon client + query modules (event, rsvp, submission, rate-limit)
    ├── lib/                validation, guards, abuse protection, calendar/meeting helpers
    ├── data/               static typed content (team roster, research areas)
    └── styles/global.css   Tailwind entry + brand tokens (UW Cardinal red anchor)
```

Public pages render statically where they can; `/`, `/meetings`, every `/admin` route, and
all `/api` endpoints set `prerender = false` for per-request SSR.

## Deployment

Hosting is **Vercel**, with continuous deployment from GitHub:

1. In Vercel, import this GitHub repository (framework preset: **Astro**, Node **22**).
2. Vercel builds with the `@astrojs/vercel` adapter for SSR on serverless functions.
3. Every push to **`main`** triggers an automatic production deployment at the live URL
   (`https://www.badgerjournals.org`).

The Neon integration injects `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) and the Clerk
integration supplies the `CLERK_*` keys into the Vercel environment; set the Vercel
project's build Node version to **22** to match `engines.node`. Verify a deploy by hitting
the live `/` (expect HTTP 200) and `/api/health` twice (the `time` value should differ
between requests, confirming SSR in production).
