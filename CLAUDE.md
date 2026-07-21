# Badger Journals (Astro + Vercel Web App)

<!-- Keep this file concise. Details in docs/claude/ -->

## Tech Stack

- Language: TypeScript (strict mode, `astro/tsconfigs/strict`)
- Framework: Astro 5 with `output: 'server'` (SSR via `@astrojs/vercel`)
- Runtime: Node 20+
- Package manager: pnpm (11.4.0)
- Test runner: Vitest
- Hosting / CI: Vercel (GitHub → Vercel auto-deploy on `main`)
- Key dirs: `src/pages/`, `src/pages/api/`, `tests/`

## Purpose

- Badger Journals — the UW-Madison club's website
- Componentized Astro (SSR) app with real per-page URLs

## Development Workflow

First time: `pnpm install`.

```bash
# Build/Run
pnpm dev              # Dev server (http://localhost:4321)
pnpm build            # astro check + astro build (the gate: must exit 0, zero TS errors)
pnpm preview          # Preview the production build locally

# Test (run before PR)
pnpm test             # Vitest

# Quality
pnpm typecheck        # astro check (type check without emitting)
```

## Code Style

- TypeScript strict mode, no `any` in committed code; explicit types on public boundaries
- 2-space indent, single quotes, trailing commas
- kebab-case filenames, one component/route per file
- API routes return `Response` objects with explicit status + content-type; set
  `export const prerender = false` on per-request SSR routes
- Comments: default to one concise line for a non-obvious why; push anything longer
  into `docs/claude/` (see rule 2). No multi-paragraph doc-comment essays, no
  restating what the code does, no comment rot
- Ask before adding any dependency beyond Astro + `@astrojs/vercel` + Vitest,
  changing the package manager, adding a UI framework integration (React etc.),
  adding `vercel.json` overrides, or introducing environment variables or secrets

## Documentation

<!-- Claude reads these when relevant -->

- `docs/claude/` - all project documentation (architecture, decisions, structure)

## Working Rules

Read and follow all of them.

### 1. Read this file first

Always read this `CLAUDE.md` at the start of every session, and again whenever
context is cleared. Understand the guidelines below and follow them throughout
the session.

### 2. Documentation lives in `docs/claude/`

All project documentation belongs in Markdown files under `docs/claude/`. Keep
code comments to a single concise line — enough to clarify intent, never more.
Push anything longer into the docs.

### 3. Review the docs before acting

Before planning or building anything, review the relevant files in
`docs/claude/` to understand existing dependencies, decisions, and structure.
Let the docs inform the plan.

### 4. Never commit, stage, or push

Do not run `git add`, `git commit`, or `git push` — ever, unless I give explicit
one-time permission for a specific action. When a task is complete, tell me so
and stop; I will commit manually.

### 5. Planning artifacts stay untracked

All planning artifacts — the `tasks/` folder, `SPEC.md`, `plan.md`, `todo.md` —
always remain untracked. Never stage or commit them.

### 6. No co-author tags in commits

When you are granted one-time permission to commit under rule 4, never include
co-author trailers (e.g. `Co-Authored-By:`) in the commit message.

## Common Mistakes

<!-- Add entries when Claude does something wrong -->

- Run `pnpm build` (includes `astro check`) and `pnpm test` before declaring a task done
- Add code-file comments longer than one line into a respective `docs/claude` file. 
