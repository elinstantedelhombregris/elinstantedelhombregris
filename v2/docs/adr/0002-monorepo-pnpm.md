# ADR 0002 — pnpm workspace inside a single subfolder of the parent repo

**Status:** Accepted · 2026-05-08

## Context

The v1 app lives at `/Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub/` inside a parent git repo that also holds essays, brand documents, and a (mostly stale) outer Express scaffold at the root. The user's plan is to keep v1 untouched and build v2 in parallel, then cut over via a directory rename when ready.

We had three options for where to put v2:

1. **Sibling git repo** — `~/Desktop/ElInstantedelHombreGris-v2/`. Total isolation; cross-repo coordination is annoying.
2. **Monorepo restructure** — promote the parent to `/apps/legacy/` + `/apps/web/`. Cleanest long-term but invasive: every existing tool (Vercel project, GitHub Actions, IDE workspaces) has hard-coded the v1 paths.
3. **Subfolder inside the existing repo** — `v2/`, organized internally as a pnpm workspace.

## Decision

Option 3. v2 lives at `/v2/` inside the existing repo, organized as a pnpm workspace with `apps/`, `packages/`, `content/`, `docs/`, `scripts/`, `tests/`.

Cutover plan: when v2 is feature-parity, rename `SocialJusticeHub/` to `_archive/SocialJusticeHub/`, rename `v2/` to the project root layout, and point Vercel at the new directory.

## Consequences

**Good:**
- The live v1 app keeps its Vercel project, its CI, its IDE configs untouched.
- v2 has its own real CI, its own pnpm lockfile, its own dep graph. They don't collide.
- A `git log v2/` gives a clean history of the rebuild.

**Bad / known friction:**
- husky doesn't fit cleanly. v2 lives inside the parent's `.git`, so installing husky from `v2/` either fails to find `.git` or pollutes the parent's `core.hooksPath` (and would then fire pre-commit hooks for v1 commits too). We dropped husky entirely; CI is the lint/test gate. (See the dropping commit and the corresponding note in CLAUDE.md.)
- Editor tools that auto-detect a project root sometimes resolve to the parent root and pull in v1 configs. Workaround: open `v2/` as the editor's workspace root.
- pnpm install runs against the v2 workspace; if you accidentally `pnpm install` from the parent, pnpm tries to install the parent's stale Replit scaffold and pollutes its `node_modules`. Always run pnpm from inside `v2/`.

## Out of scope

- Promoting to a multi-app monorepo with v1 inside is doable but doesn't earn its complexity. v1 is frozen; we don't need shared tooling between the two apps.
