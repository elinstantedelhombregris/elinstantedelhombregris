# Phase 8 — Gamification surface + heavy/optional triage

**Date:** 2026-05-11
**Status:** Approved (pending user review of this spec)
**Phase:** 8 of the v2 rebuild

---

## Goal

Make the gamification primitives visible and feeding, and lock decisions on the four v1 heavy/optional dependencies before any future phase considers porting them.

The schema and repository already exist (`packages/db/src/schema/gamification.ts` — 8 tables; `packages/db/src/repositories/gamification.ts`; commits `863aebc`, `d04a5b2`). Three XP hooks are already wired (`goal_completed +50`, `quiz_completed +25`, `civic_completed +100` + `civic-baseline` badge). Six starter badges are seeded. **The user can earn XP today and never see it** — Phase 8 fixes that and extends the feeding surface.

## Shape

Two workstreams, sequential within the phase:

1. **8A — Heavy/optional triage.** Four decision-only ADRs (no code ports this phase).
2. **8B — Gamification surface.** API feature slice + web pages + header chip + toasts + new XP hooks + challenge engine + leaderboard cron.

## Out of scope

- Porting any v1 heavy code into v2 (each ADR decides keep/drop/defer; ports happen in future phases if ever).
- Per-province leaderboards (revisit when user count justifies it).
- Monthly leaderboards (weekly + all-time only).
- Profile editing (only profile viewing — name/avatar editing is its own concern).
- Push notifications for badges (the in-app toast is sufficient).

---

## 8A — Heavy/optional triage (decision-only ADRs)

Four ADRs under `v2/docs/adr/`, written first because they're cheap, independent, and clear the air before the multi-day surface work. Each ~150–250 lines, committed individually.

### ADR template

```
# NNNN — <Dep> status
## Status: Proposed | Accepted (date)
## Context  (≤150 words — what v1 uses it for, why this matters)
## Decision  (Keep | Drop | Defer)
## Consequences  (what changes / doesn't change in v2)
## Cost budget  (bundle KB if keep · removal plan if drop · re-eval trigger if defer)
## References  (v1 file paths, GitHub issues if any)
```

### The four ADRs

| # | File | Dep | v1 usage | Default decision |
|---|---|---|---|---|
| 0003 | `0003-three-js-status.md` | `three`, `@react-three/{fiber,drei}`, `three-mesh-bvh` | 4 React components (`NeuralNetwork3D`, `EnergyFlow`, `PersonNode`, `ConceptParticleSystem`) + Resources page — ambient/decorative 3D viz | **Defer.** ≈700 KB gz bundle. No core-flow usage. Re-evaluate when a concrete civic data-viz use-case needs 3D. |
| 0004 | `0004-ar-js-status.md` | `@ar-js-org/ar.js` + `server/ar-service.ts` (489 LOC) | AR marker scenes | **Drop.** No clear civic use-case ever materialized. AR.js is effectively unmaintained. Reversible — schema not yet ported; v1 code remains in git history. |
| 0005 | `0005-blockchain-status.md` | `ethers` + `web3` + `server/blockchain-service.ts` (481 LOC) | Aspirational on-chain attestation / "civic NFT" experiments | **Drop.** Civic engagement doesn't need a chain. Two competing libs is itself a smell. Trust solved by audit log + Postgres. |
| 0006 | `0006-xenova-transformers-status.md` | `@xenova/transformers` in `server/nlp-service.ts`, `services/embedding-service.ts` | Embeddings for content similarity / classification | **Defer.** Real value if we ever do "related ensayos" or "similar proposals" — but no current consumer. If/when we want embeddings, an API (Groq/OpenAI) is lighter than a local 200 MB model. |

Defaults are recommendations; the act of writing each ADR is the chance to flip if the deeper read warrants it.

---

## 8B — Gamification surface

### API feature slice

`apps/api/src/features/gamification/{routes,service,validation}.ts`. Mounted under `/api/gamification`. All routes auth-required except `GET /badges`, `GET /challenges`, `GET /leaderboard` (which are read-only public surfaces). CSRF applies to mutations only.

#### Routes

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/gamification/me` | Current user's `{ xp, level, streakDays, longestStreakDays, recentActivity[20], badges[], inProgressChallenges[] }`. Single payload for header chip + profile page. |
| `GET`  | `/api/gamification/badges` | Public badge catalog: all active badges (slug, title, description, iconUrl, tier). |
| `GET`  | `/api/gamification/challenges` | Active challenges + user's progress on each. Anonymous users get challenges without progress. |
| `POST` | `/api/gamification/challenges/:slug/start` | Insert `user_challenge_progress` row, status `in_progress`. Idempotent on the unique `(userId, challengeId)` index. |
| `POST` | `/api/gamification/challenges/:slug/advance` | Mark a step completed by `orderIndex`. Auto-completes the challenge when all steps done → awards XP + optional badge via `logActivity`. |
| `GET`  | `/api/gamification/leaderboard?period=weekly\|all_time&limit=50` | Latest cached ranking rows for the requested period, global scope, joined to a public user shape (`{ id, displayName, avatarUrl?, xp, rank }`). |

### XP/badge hooks — additions on top of the existing 3

Every hook calls `gamification.logActivity({ userId, activityDate, kind, xpAwarded, payload })`. `logActivity` already creates `user_levels` and bumps XP. Errors are caught and logged — they must never block the underlying action (same pattern as the three already-shipped hooks).

| Hook site | `kind` | XP | Dedup | Auto-badge |
|---|---|---|---|---|
| `POST /api/pulso/signals` | `pulse_submitted` | +10 | — | `first-pulse` (once-ever) |
| `POST /api/iniciativas/propuestas` | `propuesta_submitted` | +15 | — | `propuesta-author` *(new)* |
| `POST /api/community/posts` | `community_post_created` | +5 | daily-deduped via `hasActivityOnDate` | `community-voice` (once-ever) |
| Client `POST /api/blog/posts/:slug/read` (fired after 30s on page) | `content_read` (payload: `{ kind, slug }`) | +5 | lifetime-deduped on `(userId, kind, slug)` | `lector-curioso` at 5 reads · `lector-voraz` at 25 reads |

Total XP grant points after Phase 8: **7** (3 existing + 4 new).

### Badge catalog — additions on top of the existing 6

| New slug | Title | Tier | Trigger |
|---|---|---|---|
| `propuesta-author` | Primera propuesta | silver | First `propuesta_submitted` |
| `lector-curioso` | Lector curioso | bronze | 5th `content_read` |
| `lector-voraz` | Lector voraz | silver | 25th `content_read` |
| `streak-7` | Constancia · 7 días | bronze | `streakDays` hits 7 |
| `streak-30` | Constancia · 30 días | silver | `streakDays` hits 30 |

Total badges seeded: **11**.

### Streak engine

`logActivity` is the choke-point. New helper `advanceStreak(userId, activityDate)` runs inside the same transaction:
- If `lastActiveDate === activityDate`: no-op (already active today).
- If `lastActiveDate === yesterday`: `streakDays++`; update `longestStreakDays` if exceeded.
- Else: `streakDays = 1`.
- Always set `lastActiveDate = activityDate`.

Single atomic update on `user_levels`. Streak badges (`streak-7`, `streak-30`) auto-awarded here using `awardBadge` with `onConflictDoNothing` semantics.

### Starter challenges (seeded)

Five challenges, rioplatense Spanish, idempotent seed in `packages/db/scripts/seed-challenges.ts`:

| Slug | Cadence | XP | Steps | Title |
|---|---|---|---|---|
| `lector-diario` | daily | 10 | 1 step (read 1 ensayo) | Leé un ensayo hoy |
| `participacion-semanal` | weekly | 50 | 3 steps (each: submit 1 pulso) | Sumá 3 pulsos esta semana |
| `evaluacion-semanal` | weekly | 50 | 2 steps (each: completar 1 cuestionario) | Completá 2 cuestionarios |
| `diagnostico-completo` | one_time | 100 | 1 step (complete civic-baseline) | Hacé tu diagnóstico ciudadano |
| `voz-de-la-comunidad` | one_time | 30 | 1 step (post 1 community proposal) | Compartí tu primera propuesta |

Advance flow: each XP hook server-side checks for any active `user_challenge_progress` rows whose challenge has a step matching the action's `kind`, and marks the lowest unfilled `orderIndex` complete. When all steps are filled, the challenge auto-completes (status → `completed`, `completedAt` set, XP + optional badge granted via `logActivity`). The client also has a `POST /challenges/:slug/advance` route available for manual UI affordances (currently unused by the seeded set, but the engine supports both paths).

### Response envelope — `xpEvent`

Every endpoint that fires an XP hook returns its existing response **plus** an optional `xpEvent` field:

```jsonc
{
  // ...existing response fields...
  "xpEvent": {
    "xpAwarded": 25,
    "kind": "quiz_completed",
    "newLevel": null,           // or e.g. 3 if a level-up happened
    "newBadges": [{"slug":"first-quiz","title":"Primera evaluación","tier":"bronze"}]
  }
}
```

`xpEvent` is **only present when XP was actually granted** (dedup suppresses both XP and the envelope). The web client reads it and triggers the toast. No extra round trip.

### Level curve

`level` derived from `xp` via a deterministic function in `packages/shared/src/gamification/levels.ts`:
- Level n requires `100 * n * (n+1) / 2` total XP (triangular: 100 → 300 → 600 → 1000 → 1500 …).
- `levelForXp(xp): number` and `xpForLevel(level): number` exported.
- `logActivity` recomputes level on every grant; `newLevel` populated in `xpEvent` when it crosses.

### Ranking cron

`apps/api/src/features/gamification/cron.ts`. Registered with the same cron mechanism `mandato/cron.ts` uses. Runs every 15 min:
1. For each period:
   - `weekly`: `periodStart` = Monday 00:00 UTC of current week. XP = `SUM(daily_activity.xpAwarded)` for rows in that week.
   - `all_time`: `periodStart` = `NULL`. XP = `user_levels.xp`.
2. Compute top 50 by XP, scope `global`, scopeId `NULL`.
3. Upsert into `rankings` keyed on `(periodKind, periodStart, scopeKind, scopeId, userId)`.
4. Delete stale rows for the same key whose rank is no longer in the top 50.

Idempotent. Integration-tested with a frozen clock.

---

## Web surface

### Pages

#### `MiPerfil.tsx` → `/mi-perfil`

Auth-required (redirects to `/login` if anonymous). Sliced into `pages/MiPerfil/sections/{HeaderSection,BadgesSection,ActivitySection}.tsx` to stay under the 300-LOC page cap.

```
┌─────────────────────────────────────────────────┐
│ Hola, {displayName}                             │
│ ─────────────────────────────────────────────── │
│  Nivel 4              1240 XP                   │
│  ▓▓▓▓▓▓▓▓░░░░  260 XP para nivel 5             │
│  🔥 Racha de 5 días · Récord: 12                │
├─────────────────────────────────────────────────┤
│  Insignias (5)                          Ver todas │
│  [🏛️] [✓] [📝] [🌱] [🔥] …                       │
├─────────────────────────────────────────────────┤
│  Actividad reciente                             │
│  · +25 XP — Cuestionario completado · hace 2h   │
│  · +50 XP — Meta semanal cumplida · ayer        │
│  · +100 XP — Diagnóstico ciudadano · hace 3 días│
│  ...                                            │
└─────────────────────────────────────────────────┘
```

#### `Leaderboard.tsx` → `/clasificacion`

Public read, no auth required. Tabs: "Esta semana" / "Histórico". Top 50 rows: rank · avatar/initials · displayName · XP. Empty state: "Todavía no hay actividad esta semana — sé el primero" with a link to civic actions.

#### `Desafios.tsx` → `/desafios`

Three sections by cadence (Diarios / Semanales / Una sola vez). Each card: title, description, XP reward, step list with checkmarks, `Empezar` / `Continuar` / `Completado` button. Anonymous users see challenges but the button reads `Registrate para participar` and links to `/register`.

### Header integration

`apps/web/src/components/Header.tsx` carries `NotificationBell` already. Add an **`XPChip`** to its right, visible only when authenticated:

```
[🔔]  ⚡ Nv4 · 1240 XP  ▾
```

Click → dropdown with `Mi perfil` · `Clasificación` · `Desafíos`. The chip plays a 1s pulse (Framer Motion) when `xpEvent` lands. Reads from `useQuery(['gamification','me'])`.

### Celebration toast — `XpToast`

`apps/web/src/components/XpToast.tsx`. Listens to a tiny context (`XpEventBus`) populated by the response interceptor in `apps/web/src/lib/api.ts`. Three variants:
- **XP only:** `+25 XP` + kind translated to Spanish ("Cuestionario completado").
- **Level up:** larger card with confetti, `bloom` Framer variant, "¡Subiste al Nivel 5!"
- **New badge:** icon + title + tier, "Nueva insignia: Primera propuesta".

Auto-dismiss 4s. Stack up to 3, queue the rest.

### API client wiring

`apps/web/src/lib/api.ts` (cookie-credentialed fetch) gets exactly one addition: after parsing a JSON response, if `xpEvent` is present, push it onto `XpEventBus` before returning. Every feature gets toast support for free; no per-call wiring.

### React Query freshness

| Key | staleTime | Invalidated on |
|---|---|---|
| `['gamification','me']` | 60s | any mutation that returned `xpEvent` |
| `['gamification','leaderboard', period]` | 5 min | (none — cron is the source of truth) |
| `['gamification','challenges']` | 60s | challenge `start` / `advance` |

### Routing

`App.tsx` already lazy-loads pages. Add three `lazy()` entries and three `<Route>` matches in wouter for `/mi-perfil`, `/clasificacion`, `/desafios`.

---

## Testing matrix

CLAUDE.md is non-negotiable: every new endpoint gets ≥ 1 integration test; every non-trivial component gets ≥ 1 component test.

| Surface | Tests |
|---|---|
| Gamification API routes (×6) | happy + auth-failure + validation-failure per route → ~18 tests |
| New XP hooks (×4) | fires-once + dedup-suppresses + badge-awarded-once → ~12 tests |
| Streak engine | same-day no-op · next-day advance · gap reset → 3 tests |
| Streak badge awards | first crossing of 7 · first crossing of 30 · idempotent re-cross → 3 tests |
| Level curve | boundary cases for first 5 levels + level-up `xpEvent` payload → ~6 tests |
| Ranking cron | weekly fresh · all_time fresh · stale-pruning · empty period → 4 tests |
| Web: `XpToast` | 3 variants render → 3 tests |
| Web: `XPChip` | auth/anon/pulse-on-event → 3 tests |
| Web: `MiPerfil` sections | render with mocked queries → 3 tests |

All tests run inside the existing Vitest setup with the CI Neon branch for integration tests.

---

## Commit cadence

Each commit leaves `pnpm verify` green and is pushed to `main` (per the project's standing branching rule).

1. `docs(adr): 0003 three.js status — defer`
2. `docs(adr): 0004 ar.js status — drop`
3. `docs(adr): 0005 blockchain status — drop`
4. `docs(adr): 0006 xenova/transformers status — defer`
5. `feat(db): 5 new badges + 5 starter challenges seeds`
6. `feat(api): gamification feature slice — /me, /badges, /challenges, /leaderboard`
7. `feat(api): xpEvent envelope + streak engine + 4 new XP hooks`
8. `feat(api): ranking cron — weekly + all_time, global scope`
9. `feat(web): XpEventBus + response interceptor + XpToast`
10. `feat(web): MiPerfil page + Header XPChip`
11. `feat(web): Leaderboard page (/clasificacion)`
12. `feat(web): Desafios page (/desafios)`

Test commits are absorbed into the per-commit deliverable where they fit; a tail `test(gamification):` commit is added only if integration coverage is materially expanded after the feature commits.

---

## References

- v2 architecture map: `v2/docs/architecture/README.md`
- v2 standing rules: `v2/CLAUDE.md`
- Gamification schema: `v2/packages/db/src/schema/gamification.ts` (commit `863aebc`)
- Gamification repository: `v2/packages/db/src/repositories/gamification.ts`
- Existing XP hooks + seed script: commit `d04a5b2`
- Existing cron pattern to mirror: `v2/apps/api/src/features/mandato/cron.ts`
- v1 heavy-dep files referenced by the ADRs:
  - `SocialJusticeHub/client/src/components/{NeuralNetwork3D,EnergyFlow,PersonNode,ConceptParticleSystem}.tsx`
  - `SocialJusticeHub/client/src/pages/Resources.tsx`
  - `SocialJusticeHub/server/ar-service.ts`
  - `SocialJusticeHub/server/blockchain-service.ts`
  - `SocialJusticeHub/server/nlp-service.ts`
  - `SocialJusticeHub/server/services/embedding-service.ts`
