# 002 — Componentized pages architecture

Implements story `docs/user-stories/002.md`: the legacy single-file `index.html` SPA
(client-side `showPage()` toggle) rebuilt as componentized Astro pages, each with a real,
directly-loadable URL. Spec: `SPEC.md` (root, untracked).

## Layout & SEO

- `src/layouts/BaseLayout.astro` is the one shell every page uses. Props `{title,
  description, path}`. It renders the `<head>` (via `SEO`), `Header`, a `<main><slot/>`,
  and `Footer`.
- `src/components/SEO.astro` emits `<title>{title} · Badger Journals</title>`, the meta
  description, Open Graph tags, and an **absolute** canonical/`og:url` built from
  `Astro.site`. `site` is set in `astro.config.mjs` (`https://badger-journals.vercel.app`);
  SEO also has an in-code fallback base so the value stays absolute when `Astro.site` is
  unset (e.g. the Vitest container runtime).

## Information architecture (nav)

The legacy nav omitted Digests and Reviews — those pages were reachable only via JS with
no visible link. `Header.astro` now links everything:

- **Digests ▾** — a CSS-only `<details>`/`<summary>` disclosure (no JS, no framework)
  linking to the three digest pages.
- Flat links: Reviews, Meetings, Mission, Team, Create the Next Digest, Contact.

All nav entries are real `<a href>`, so browser back/forward works natively (AC-5).

## Content model

`src/content.config.ts` defines two glob-loader collections (Astro 5 Content Layer):

- `reviews` — 6 entries in `src/content/reviews/*.md`; schema `{title, authors[], date,
  digest, excerpt}`. Slug = filename.
- `digests` — 3 entries in `src/content/digests/*.md`; schema `{name, slug, description}`.

Team roster and expansion research-areas are plain typed modules (`src/data/team.ts`,
`src/data/research-areas.ts`) — small, static, no need for a collection.

### Reviews are metadata-only (by design)

The legacy site's review "cards" carried only title/authors/date/excerpt — there were no
full article bodies and the cards weren't clickable. So:

- `reviews/[slug].astro` (via `getStaticPaths`) renders the metadata + excerpt as the page
  body — an honest stub. A full-text `body` can be added per entry later without changing
  the route.
- `ReviewCard.astro` (shared by digest pages and `/reviews`) links each card to its
  `/reviews/:slug` page — the AC-1 "each review has its own URL" upgrade over the legacy
  non-clickable cards.
- `/reviews` lists **all 6** reviews (legacy showed a curated 3); listing all satisfies
  AC-4 "no content lost".

## Rendering

Every page sets `export const prerender = true` — all 16 routes (10 named + 6 review
details) are static HTML. The `@astrojs/vercel` SSR adapter stays configured for later
stories (006+); nothing in 002 needs per-request rendering.

## Testing notes

- Components and static pages are tested with Astro's Container API
  (`experimental_AstroContainer`) in Vitest.
- **Content Layer limitation:** `getCollection()` is empty in the Vitest runtime (the store
  only populates during `astro dev/build`). Therefore:
  - Content integrity is validated against the source markdown via `import.meta.glob`
    (`tests/content.test.ts`) — exactly what AC-4 cares about.
  - Collection-driven routes (hub, digests, reviews) are verified against the prerendered
    build output as part of the build gate, not via the container.
- Dev/container renders inject `data-astro-source-*` attributes on elements; these are
  stripped in the production build. Tests match element text tolerant of attributes.

## Deferrals (owned by later stories)

- Visual brand redesign — the legacy crimson/serif design (Playfair Display / Cormorant
  Garamond / Libre Baskerville, `--crimson #8B1A1A`) is **not** ported. Story 003.
- Imagery (hub photo, logo, team SVG) — story 004.
- Accessibility/responsive standards — story 005.
- Meetings calendar (interactive JS month grid) — story 007. 002 ships the meeting-details
  text only.
- Join / Start-a-Digest / interest **forms** — dropped in 002 (legacy posted to Formspree);
  return with the submission stories 008/009. Contact + Create-the-Next-Digest keep their
  headers and copy.
