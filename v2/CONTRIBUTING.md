# Contributing to v2

Welcome. This document explains how to set up, work on, and ship changes to the v2 rebuild of *El Instante del Hombre Gris*.

> **About v2:** This directory is a parallel rebuild of `/SocialJusticeHub/`, the live production app. Until cutover, v2 is **local-only** and never deployed. Nothing you do here affects current users.

## Prerequisites

- **Node 20+** (use `nvm use` — picks up `.nvmrc`)
- **pnpm 9+** (`corepack enable` then `corepack prepare pnpm@10.16.1 --activate`)
- A `.env` file at `v2/.env` (copy `env.example`, ask a maintainer for the dev secrets, or wire your own Neon project)

## First-time setup

```bash
cd v2
nvm use
pnpm install
cp env.example .env  # fill in DATABASE_URL + JWT_SECRET + SESSION_SECRET
pnpm dev             # starts web on :5173 and api on :4000
```

Visit http://localhost:5173 — you should see the ¡BASTA! hero.

## Daily workflow

```bash
pnpm dev              # start everything
pnpm lint             # ESLint
pnpm type-check       # TypeScript across the workspace
pnpm test             # unit + integration
pnpm test:e2e         # Playwright (requires chromium, run `pnpm exec playwright install` once)
pnpm verify           # the full CI gate locally: lint + type-check + test + build
pnpm format           # Prettier write
```

## Code style

- **TypeScript everywhere.** No `.js` source files. Strict mode is on, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **No `: any` annotations.** ESLint enforces `@typescript-eslint/no-explicit-any: error`. If you absolutely need to escape the type system, use `@ts-expect-error` with a one-line comment and a tracking note.
- **No `console.*`.** Use the API logger (`apps/api/src/lib/logger.ts`) on the server. The browser side avoids logs in production code.
- **No JWT in localStorage.** Auth tokens live in httpOnly cookies. The frontend reads only the CSRF token (a separate, non-httpOnly cookie) when issuing state-changing requests. See `apps/api/src/features/auth/tokens.ts`.

## File-size hard caps

These are enforced socially (and by ESLint where possible). If you blow through a cap, slice the file.

| Layer | Cap | Notes |
|---|---|---|
| Express route file | 300 LOC | More than that = split by sub-domain. |
| Service file | 400 LOC | Same. |
| Single Express handler | 60 LOC | Extract a service function instead. |
| React page component | 300 LOC | Move sections to `pages/Foo/sections/*`. |
| Reusable component | 200 LOC | |
| Hook file | 150 LOC | |
| DB schema file | 300 LOC | One domain per file; re-export from `index.ts`. |
| Repository file | 400 LOC | One per domain. |

## Branching + commits

- Work on `main` for now (no live deploy yet).
- One commit per logical change.
- **Conventional Commits** are enforced via commitlint:
  ```
  feat(auth): add 2FA enrollment flow
  fix(api): correct CORS preflight cache TTL
  docs(adr): record decision on map library
  refactor(db): split mandato schema into per-domain files
  ```
- Allowed types: `feat fix docs style refactor perf test build ci chore revert`.
- Allowed scopes (commitlint warns, doesn't fail): `v2 web api db shared ui config content docs scripts tests auth deps`.

## Pull requests

Until the project goes public:
- Push to `main` directly is fine for solo work.
- For collaborative work, open a PR. CI must be green before merge.
- Keep PRs small. Target < 400 LOC of diff (excluding generated files and lockfile changes).

## Testing rules

- **Every new endpoint gets at least one integration test** (happy path minimum; auth-failure and validation-failure are strongly preferred).
- **Every non-trivial component gets at least one component test.**
- **Don't mock the database.** Integration tests hit a real Neon test branch (CI provisions one per run starting in Phase 1).

## Architecture decisions

When you make a non-obvious choice — picking a library, designing a security boundary, deciding what to defer — write an ADR:

```bash
$ touch docs/adr/00NN-short-title.md
```

Three sections, three sentences each: **Context**, **Decision**, **Consequences**. Number sequentially, never edit a published ADR (write a follow-up that supersedes it).

## When in doubt

Read these in order:
1. `CLAUDE.md` (in this directory) — the rule set the project was built to.
2. `docs/architecture/README.md` — the high-level shape.
3. `docs/adr/` — past decisions and why.
4. `../docs/REPORT_THIS_PROJECT_IS_UTTER_SHIT.md` — the v1 audit, the reason v2 exists.

## Safety: what you should NOT touch

- `/SocialJusticeHub/` — the live app. v2 work must not modify it. CI guards against it.
- `v2/.env` — never commit. Already in `.gitignore`.
- The v1 production Neon project (`sparkling-field-92271073`). v2 uses a separate project (`cool-bird-63087148`). All migrations target v2 only.

## Asking for help

Open a GitHub issue with the label `question`, or ping a maintainer. Pull requests welcome.
