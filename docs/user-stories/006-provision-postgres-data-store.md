# 006: Provision Postgres and the submission data store

## Story

As a developer, I want a Postgres database with schemas for RSVPs and inquiries, so that later features have a durable, structured place to persist member submissions.

## Acceptance Criteria

- A Postgres database is provisioned and reachable from the deployed Vercel environment
- Tables exist to store RSVPs ({name, email, meeting, timestamp}) and inquiry/submission records
- Database credentials are supplied via environment secrets and never committed to the repo
- A documented migration process creates/updates the schema reproducibly
- A connectivity check confirms the app can read and write a test record in production

## Technical Notes

- Greenfield first-time DB setup; external integration (Vercel Postgres / Neon) + env-secret handling + reproducible migration process is the effort, not the schema (small)
- Gates stories 008, 009, 010, and 012
- Open decision to close before starting: Vercel Postgres vs Neon
- Affected files (create): `src/db/{client,schema}.ts`, `migrations/*.sql`, `.env.example`, `scripts/db-check.ts`, README migration docs

## Points: 3
