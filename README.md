# Badger Journals

Web platform for Badger Journals, built on **Astro 5** (SSR) and deployed to **Vercel**.

This repository is currently the project scaffold: a placeholder home route, a per-request
SSR health route, and a green test harness. Branding, forms, and the submission backend arrive
in later stories.

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
```

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
integration), accessed with `@neondatabase/serverless` and raw SQL migrations — no ORM.
Credentials come from `DATABASE_URL` (a Vercel env secret; `.env` locally, never committed).

```bash
npx vercel env pull .env                                   # get DATABASE_URL locally
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm db:migrate       # apply migrations (unpooled url)
node --env-file=.env --experimental-strip-types scripts/db-check.ts   # connectivity check
```

Full details — provisioning, secret handling, the schema, and how to add a migration — are
in [`docs/claude/0006-database.md`](docs/claude/0006-database.md).

## Project structure

```
.
├── astro.config.mjs        Astro config: server output + Vercel adapter
├── tsconfig.json           extends astro/tsconfigs/strict
├── vitest.config.ts        Vitest wired to Astro's Vite config
├── pnpm-workspace.yaml     pnpm settings (build-script approval, vite dedupe)
├── package.json
├── pnpm-lock.yaml
├── src/
│   └── pages/
│       ├── index.astro     placeholder home route (returns 200)
│       └── api/
│           └── health.ts   SSR route, rendered per request
└── tests/
    └── health.test.ts      smoke test for the health route
```

## Deployment

Hosting is **Vercel**, with continuous deployment from GitHub:

1. In Vercel, import this GitHub repository (framework preset: **Astro**, Node **22**).
2. Vercel builds with the `@astrojs/vercel` adapter for SSR on serverless functions.
3. Every push to **`main`** triggers an automatic production deployment at the project's live URL.

The Neon integration injects `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) into the Vercel
environment; set the Vercel project's build Node version to **22** to match `engines.node`.
Verify a deploy by hitting the live `/` (expect HTTP 200) and `/api/health` twice (the `time`
value should differ between requests, confirming SSR in production).
