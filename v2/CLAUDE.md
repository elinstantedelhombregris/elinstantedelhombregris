# CLAUDE.md — v2

These are the standing instructions for any AI coding assistant (Claude, Cursor, Copilot, etc.) working inside `v2/`. They are stricter than the `../CLAUDE.md` rules that apply to the live `SocialJusticeHub/` app.

The full rationale is in `../docs/AI_AGENT_GREENFIELD_INSTRUCTIONS.md`. This file is the action-shaped digest.

## The rule of v2

**Build the way the live app should have been built.** Every shortcut taken in v1 — JWT in localStorage, god-files, no tests, dual schemas, 182 deps — is a deliberate "no" here. If you find yourself about to take one, stop and write an ADR explaining why this case is different.

## Hard rules (no exceptions)

### Type safety
- TypeScript `strict: true` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` are on.
- ESLint rule `@typescript-eslint/no-explicit-any: error`. **No `: any`.**
- ESLint rule `no-console: error`. Use the logger (`apps/api/src/lib/logger.ts`).
- `@ts-ignore` is banned. If you must, use `@ts-expect-error` with a comment.

### Auth & security
- **JWT lives in httpOnly cookies.** Never `localStorage.setItem('authToken', ...)`. Already-existing helper: `apps/api/src/features/auth/tokens.ts`.
- CSRF protected via double-submit cookie + `X-CSRF-Token` header for every state-changing API call.
- bcrypt cost 12 for password hashing.
- Helmet with strict CSP — don't add third-party CDN allowances; bundle locally.

### Database
- One database engine: Postgres (Neon).
- Schema split by domain in `packages/db/src/schema/<domain>.ts`. ≤ 300 LOC per file.
- Repository pattern: `packages/db/src/repositories/<domain>.ts`. ≤ 400 LOC per file. Repositories return typed domain rows, not raw query results.
- Migrations are first-class. Every schema change ships a migration in the same PR. Never `db:push` against production.
- v2's database is project `cool-bird-63087148`. The v1 production database (`sparkling-field-92271073`) is **off-limits** — never touch it from v2 code.

### Backend
- Feature slices: `apps/api/src/features/<domain>/{routes,service,validation,types}.ts`.
- Validation at the edge with Zod (schemas live in `packages/shared/src/validation/`).
- One Express handler per HTTP route. Big handlers extract to a service function.
- Single logger module. No `console.*`.

### Frontend
- One CSS framework (Tailwind), one component library (Radix primitives + cva), one icon set (lucide), one animation library (framer-motion).
- Code-split every page via `lazy()`.
- Long-form content lives in MDX under `content/`, never as multi-thousand-line `.ts` files.
- Pages cap at 300 LOC. If a page grows, slice into `pages/Foo/sections/*.tsx`.
- API calls go through `apps/web/src/lib/api.ts` which sets `credentials: 'include'`.

### Testing (non-negotiable)
- Every new endpoint gets ≥ 1 integration test.
- Integration tests hit a real Postgres (Neon test branch in CI).
- Every non-trivial component gets ≥ 1 component test.
- `pnpm verify` (lint + type-check + test + build) must pass before commit.

### Dependencies
- 60-dep cap on production deps.
- One of each: one map lib, one chart lib, one email provider, one session store.
- Heavy deps (`three`, `@xenova/transformers`, `@ar-js-org/ar.js`, `ethers`, etc.) require an ADR before install.

### Repo hygiene
- No `*.backup`, `*.log`, `*.pid`, `*.db` committed.
- No `node_modules/` outside the standard pnpm tree.
- Conventional Commits, scope-aware (`feat(api):`, `fix(web):`, etc.).

## Workspace map

```
v2/
├── apps/
│   ├── web/                # React + Vite frontend
│   └── api/                # Express + Drizzle backend
├── packages/
│   ├── db/                 # Drizzle schema + repositories + migrations
│   ├── shared/             # Zod schemas + content registries
│   ├── ui/                 # (planned) shared component library
│   └── config/{eslint,typescript,prettier}
├── content/                # MDX (blog, ensayos, courses, manifiesto, planes)
├── docs/{architecture,adr,demos}
├── scripts/{build,content,migration,diagnostic,_archive}
├── tests/e2e/              # Playwright
└── .github/workflows/      # CI from commit #1
```

## Key paths

| Concern | Where |
|---|---|
| Environment config (single source) | `apps/api/src/lib/config.ts` |
| Logger | `apps/api/src/lib/logger.ts` |
| Express app factory (importable in tests) | `apps/api/src/app.ts` |
| Auth: tokens, cookies | `apps/api/src/features/auth/tokens.ts` |
| Auth middleware | `apps/api/src/middleware/auth.ts` |
| CSRF middleware | `apps/api/src/middleware/csrf.ts` |
| Drizzle schema barrel | `packages/db/src/schema/index.ts` |
| Drizzle client (singleton) | `packages/db/src/client.ts` |
| Zod validation barrel | `packages/shared/src/validation/index.ts` |
| Cookie-first API client (web) | `apps/web/src/lib/api.ts` |
| React Query client | `apps/web/src/lib/query-client.ts` |
| `cn()` class merge helper | `apps/web/src/lib/utils.ts` |

## Workflow for non-trivial changes

1. **Spec** in `docs/specs/YYYY-MM-DD-feature.md` — the why and what.
2. **Plan** as a numbered checklist (commit it to `docs/plans/` if multi-day).
3. **Implementation** — one commit per task on the checklist.
4. **PR / commit** — only after `pnpm verify` is green.

## Spanish (rioplatense) conventions

- All user-facing text in **Spanish, voseo dialect**: "vos", "mirá", "pará".
- Validation messages, UI labels, error responses — everything.
- Component names and identifiers stay English-or-mixed (`HeroSection`, `BastaPrincipio`).

## When you're unsure

- Read this file again.
- Check `docs/adr/` for prior decisions.
- Read `../docs/REPORT_THIS_PROJECT_IS_UTTER_SHIT.md` to remind yourself which v1 mistake we're avoiding.
- If still unsure: ask the user. Never invent behavior.
