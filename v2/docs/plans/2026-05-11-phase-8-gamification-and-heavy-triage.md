# Phase 8 Implementation Plan — Gamification surface + heavy/optional triage

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the gamification primitives visible and feeding (profile + leaderboard + challenges UI, 4 new XP hooks, streak engine, ranking cron, celebration toasts), and lock decisions on the four v1 heavy/optional dependencies (`three`, `@ar-js-org/ar.js`, `ethers`+`web3`, `@xenova/transformers`) via decision-only ADRs.

**Architecture:** Two sequential workstreams. **8A**: four ADRs in `v2/docs/adr/` (no code ports). **8B**: a new feature slice `apps/api/src/features/gamification/`, additive XP hooks inside existing routes, level/streak helpers in `@v2/shared`, a 15-min ranking cron, and three new web pages under `apps/web/src/pages/` plus a header `XPChip`, an `XpToast` component, and a global `XpEventBus` driven by an `xpEvent` field added to API response envelopes.

**Tech Stack:** pnpm monorepo · TypeScript strict (no `any`) · Express + Drizzle ORM + Neon Postgres · React 18 + Vite + wouter + Tailwind · `@tanstack/react-query` · Framer Motion · Zod validation · Vitest integration tests against an ephemeral Neon branch.

**Reference spec:** `v2/docs/specs/2026-05-11-phase-8-gamification-and-heavy-triage-design.md`.

**Standing rules (from `v2/CLAUDE.md`):** files capped (300 LOC pages, 300 LOC schema, 400 LOC repos), Spanish rioplatense in all user-facing text, JWT via httpOnly cookies, CSRF double-submit on mutations, every endpoint gets ≥1 integration test, every non-trivial component gets ≥1 component test, Conventional Commits, push to `main` after every green commit.

**Working directory for all commands:** `v2/`.

---

## Existing surface facts (used throughout the plan)

- Gamification schema: `packages/db/src/schema/gamification.ts` (8 tables, already shipped in `863aebc`).
- Gamification repo: `packages/db/src/repositories/gamification.ts` (already exports `GamificationRepository` with `getOrCreateUserLevel`, `addXp`, `logActivity`, `awardBadge`, `findBadgeBySlug`, `listUserBadges`, `listRecentActivity`, `getLeaderboard`, plus full challenge CRUD).
- Three existing XP hooks (shipped in `d04a5b2`):
  - `apps/api/src/features/civic-assessment/routes.ts` `/:id/complete` → `civic_assessment_completed` +100 XP + `civic-baseline` badge.
  - `apps/api/src/features/goals/routes.ts` `/:id/complete` → `goal_completed` +50 XP.
  - `apps/api/src/features/life-areas/routes.ts` quiz responses → `quiz_completed` +25 XP.
- Six seeded badges: `civic-baseline`, `first-quiz`, `first-goal`, `goal-crusher`, `first-pulse`, `community-voice` (`packages/db/scripts/seed-badges.ts`).
- App router mount order: `apps/api/src/app.ts`. Feature router pattern: each file exports a named router `xxxRouter`, app uses `app.use('/api/...', xxxRouter)`.
- API response envelope: `{ data: ... }` on success, `{ error: { code, message, details? } }` on failure. **`xpEvent` will live inside `data`.**
- Integration tests: `apps/api/tests/<domain>-flows.test.ts`. Helpers in `apps/api/tests/helpers/index.ts` (`createTestUser`, `loginAndGetCookies`, `csrfed`, `deleteTestUsers`, `hasDatabaseUrl`). Use `const dsuite = hasDatabaseUrl ? describe : describe.skip;` so suites only run when a DB is available.
- API client: `apps/web/src/lib/api.ts` (cookie-credentialed, throws `ApiError`, methods `api.get/post/patch/put/del`). **The `xpEvent` interceptor lands here.**
- Header: `apps/web/src/components/Header.tsx` (already has `NotificationBell` for authed users). **`XPChip` slots between the bell and "Hola, {name}".**
- Cron pattern to mirror: `apps/api/src/features/mandato/cron.ts` (exports `runMandatoEngine()`, wired through a Vercel-style entry).

---

## Build & verify commands

| Purpose | Command (from `v2/`) |
|---|---|
| Type-check the whole repo | `pnpm -r typecheck` |
| Lint | `pnpm -r lint` |
| Run all tests (unit + integration) | `pnpm -r test` |
| Run only a single API test file | `pnpm --filter @v2/api test -- tests/<file>.test.ts` |
| Run a single test by name | `pnpm --filter @v2/api test -- -t '<test name fragment>'` |
| Run web component tests | `pnpm --filter @v2/web test` |
| Build everything | `pnpm -r build` |
| Full verify (lint + typecheck + test + build) | `pnpm verify` |
| Push current branch to main | `git push origin main` |

`pnpm verify` MUST pass before every commit. If a commit lands without verify, treat that as a bug.

---

# 8A — Heavy/optional triage (Tasks 1–4)

Four decision-only ADRs. No code is ported. Each file is ~150–250 lines, written following the template in the spec.

### Task 1: ADR 0003 — Three.js status (Defer)

**Files:**
- Create: `v2/docs/adr/0003-three-js-status.md`

- [ ] **Step 1: Create the ADR file**

```markdown
# 0003 — Three.js status

## Status

Accepted — 2026-05-11

## Context

v1 (`SocialJusticeHub/`) shipped four React components built on `three`,
`@react-three/fiber`, `@react-three/drei`, and `three-mesh-bvh`:

- `client/src/components/NeuralNetwork3D.tsx`
- `client/src/components/EnergyFlow.tsx`
- `client/src/components/PersonNode.tsx`
- `client/src/components/ConceptParticleSystem.tsx`

…plus their usage in `client/src/pages/Resources.tsx`. All four are
ambient/decorative — animated 3D backgrounds in onboarding-style
screens. None of them carry data, none participate in a core flow
(quiz, mandato, propuesta, civic assessment).

The bundle cost is significant. A minimal `three` + `react-three/fiber`
import is ≈700 KB gzipped; `drei` and BVH push that higher. v1 paid this
cost on a code path that delivered no civic value.

## Decision

**Defer.** No `three`, `@react-three/*`, or `three-mesh-bvh` dependency
is added to v2 in this phase or any subsequent phase until a concrete
civic data-visualization use-case requires it.

## Consequences

- The four v1 components are not ported. If a v2 page needs ambient
  motion, use CSS, SVG, or canvas-2D (or Framer Motion, which we
  already depend on).
- If a future phase needs 3D for actual data visualization (e.g. a
  national territorial 3D map with elevation, a network-of-issues
  graph), revisit this ADR. The bundle cost will be evaluated against
  the civic value at that point.
- v1 components remain in git history; if porting becomes necessary,
  the code is reachable but will be re-written for the v2 stack
  (strict TS, no `any`, file size caps) rather than copy-pasted.

## Cost budget (re-evaluation trigger)

Reopen this ADR when ALL of the following are true:

1. A concrete v2 page requirement names 3D as the right primitive.
2. The data being visualized cannot be served by SVG/canvas-2D at the
   target fidelity.
3. The bundle-cost budget for that page is willing to absorb ≥600 KB
   gz on top of the base bundle.

## References

- v1 components: `SocialJusticeHub/client/src/components/{NeuralNetwork3D,EnergyFlow,PersonNode,ConceptParticleSystem}.tsx`
- v1 consumer: `SocialJusticeHub/client/src/pages/Resources.tsx`
- v1 deps: `three@^0.168.0`, `@react-three/fiber@^8.17.6`, `@react-three/drei@^9.114.0`, `three-mesh-bvh@^0.8.0`
- Related: `v2/CLAUDE.md` — "Heavy deps require an ADR before install."
```

- [ ] **Step 2: Verify (no code changes — sanity-check the file)**

```bash
ls -la v2/docs/adr/0003-three-js-status.md
wc -l v2/docs/adr/0003-three-js-status.md
```

Expected: file exists, ~60–70 lines.

- [ ] **Step 3: Commit**

```bash
git add v2/docs/adr/0003-three-js-status.md
git commit -m "$(cat <<'EOF'
docs(adr): 0003 three.js status — defer

No civic data-viz use-case justifies the ~700 KB gz bundle today. v1
components are decorative-only. Reopen if a concrete v2 page requires
3D for data the SVG/canvas-2D primitives can't serve.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 2: ADR 0004 — AR.js status (Drop)

**Files:**
- Create: `v2/docs/adr/0004-ar-js-status.md`

- [ ] **Step 1: Create the ADR file**

```markdown
# 0004 — AR.js status

## Status

Accepted — 2026-05-11

## Context

v1 carries `@ar-js-org/ar.js@^3.4.5` as a production dependency, and
`SocialJusticeHub/server/ar-service.ts` (489 LOC) exposes a small AR
scene CRUD on top of it. v1's `routes.ts` registers the AR routes but
no v1 page surfaces them in a flow.

`ar.js` is effectively unmaintained — its core fork has gone years
between meaningful updates, marker-based tracking (Hiro, Kanji) is
the supported path, and the WebAR landscape has moved on (8thWall,
WebXR for capable devices). The codebase paid the maintenance and
audit cost for a stack that never reached a user-visible flow.

## Decision

**Drop.** v2 will not depend on `@ar-js-org/ar.js`. The server-side
AR service is not ported. No AR-related schema is added.

## Consequences

- No `ar_scenes` / `ar_markers` tables in v2. The corresponding v1
  schema (if any) was already excluded from the `v2/packages/db/`
  consolidation.
- `SocialJusticeHub/server/ar-service.ts` remains in v1 git history.
  If a future phase needs AR, it'll be re-architected on a maintained
  stack (likely WebXR) rather than `ar.js`.
- Removes one heavy production dep that bundlers/audit tools flag.

## Cost budget (removal plan)

Nothing to remove in v2 (the dep was never added). The v1 codebase
keeps shipping the AR service until v1 is retired; no extraction
or deprecation work is in this phase.

## References

- v1 server: `SocialJusticeHub/server/ar-service.ts` (489 LOC)
- v1 dep: `@ar-js-org/ar.js@^3.4.5`
- Project state: no v2 page or schema references AR.
```

- [ ] **Step 2: Verify**

```bash
ls -la v2/docs/adr/0004-ar-js-status.md
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add v2/docs/adr/0004-ar-js-status.md
git commit -m "$(cat <<'EOF'
docs(adr): 0004 ar.js status — drop

No v1 user-flow ever surfaced AR; ar.js is effectively unmaintained.
v2 will not depend on it. AR work, if ever needed, will be
re-architected on a maintained stack (WebXR).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 3: ADR 0005 — Blockchain status (Drop)

**Files:**
- Create: `v2/docs/adr/0005-blockchain-status.md`

- [ ] **Step 1: Create the ADR file**

```markdown
# 0005 — Blockchain / on-chain attestation status

## Status

Accepted — 2026-05-11

## Context

v1 depends on both `ethers@^6.13.4` and `web3@^4.12.1`, and ships
`SocialJusticeHub/server/blockchain-service.ts` (481 LOC) for
aspirational "civic NFT" / on-chain attestation experiments
(timestamping civic actions, proof-of-engagement tokens, etc.). No v1
user flow actually surfaces an on-chain transaction; the service
exists as a placeholder for a model that was never validated by user
behavior.

Two competing libraries (`ethers` and `web3`) for the same job is
itself a smell — duplicated abstractions, doubled audit surface, and
twice the maintenance burden. The trust property the chain would
provide (tamper-evidence of civic actions) is already served by:

- The Postgres audit log (`daily_activity`).
- Cryptographic signatures on outbound emails / receipts (future).
- Public-records integration when civic actions warrant external
  proof.

None of those require a chain.

## Decision

**Drop.** v2 will not depend on `ethers`, `web3`, or any other
on-chain library. The blockchain service is not ported.

## Consequences

- No wallet integration, no on-chain identity, no NFT issuance in v2.
- Future "verifiable civic action" features will be built on
  existing primitives (signed receipts, public-record exports)
  rather than reaching for a chain.
- Removes two heavy deps and ~480 LOC of service code that produced
  no v1 user value.

## Cost budget (removal plan)

Nothing to remove in v2. The v1 service stays put in v1's repo until
v1 is retired.

## References

- v1 server: `SocialJusticeHub/server/blockchain-service.ts` (481 LOC)
- v1 deps: `ethers@^6.13.4`, `web3@^4.12.1`
- Trust primitives kept: `daily_activity`, future signed receipts.
```

- [ ] **Step 2: Verify**

```bash
ls -la v2/docs/adr/0005-blockchain-status.md
```

- [ ] **Step 3: Commit**

```bash
git add v2/docs/adr/0005-blockchain-status.md
git commit -m "$(cat <<'EOF'
docs(adr): 0005 blockchain status — drop

Two competing chain libs (ethers + web3) for an aspirational service
that no v1 flow ever surfaced. v2 doesn't need a chain — the trust
properties are already served by the audit log and future signed
receipts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 4: ADR 0006 — @xenova/transformers status (Defer)

**Files:**
- Create: `v2/docs/adr/0006-xenova-transformers-status.md`

- [ ] **Step 1: Create the ADR file**

```markdown
# 0006 — @xenova/transformers status

## Status

Accepted — 2026-05-11

## Context

v1 depends on `@xenova/transformers@^2.17.2` and uses it in:

- `SocialJusticeHub/server/nlp-service.ts`
- `SocialJusticeHub/server/services/embedding-service.ts`

The motivation was local (in-server) embeddings + classification —
running a transformer model server-side without a vendor API. The
upside: no embeddings cost per call, no third-party data sharing.
The downside: ~200 MB model artifact, cold-start cost on every
serverless invocation, and a heavy native-ish dep tree that
complicates the production deploy story.

v2 currently has zero consumers of embeddings or local NLP. The
mandato classifier (`apps/api/src/features/mandato/classifier.ts`)
goes through `AICompleter`, which is provider-pluggable (Groq today)
and does the classification with a chat-completion call instead.

## Decision

**Defer.** v2 will not depend on `@xenova/transformers`. If a future
phase needs embeddings (related-content surfaces, semantic search,
similar-proposal clustering), reach for a provider API
(Groq/OpenAI/Anthropic) first; only revisit local inference if that
path is materially insufficient.

## Consequences

- No 200 MB model artifact in the deploy bundle.
- The "related ensayos" / "similar proposals" features wait for an
  explicit phase that justifies them; when that phase runs, it
  evaluates provider-API embeddings vs. local inference on the same
  scorecard.
- v1's `nlp-service` / `embedding-service` stay in v1 git history.

## Cost budget (re-evaluation trigger)

Reopen this ADR when ALL of the following are true:

1. A concrete v2 feature names embeddings as the right primitive.
2. Provider-API embeddings have been priced for the expected call
   volume and the cost is non-prohibitive.
3. A privacy or latency requirement specifically rules out provider
   embeddings (e.g. user-content that can't leave our infrastructure).

## References

- v1 server: `SocialJusticeHub/server/nlp-service.ts`,
  `SocialJusticeHub/server/services/embedding-service.ts`
- v1 dep: `@xenova/transformers@^2.17.2`
- v2 alternative path: `AICompleter` (`apps/api/src/lib/ai-completer.ts`)
```

- [ ] **Step 2: Verify**

```bash
ls -la v2/docs/adr/0006-xenova-transformers-status.md
```

- [ ] **Step 3: Commit**

```bash
git add v2/docs/adr/0006-xenova-transformers-status.md
git commit -m "$(cat <<'EOF'
docs(adr): 0006 xenova/transformers status — defer

Local in-server embeddings carry ~200 MB model + cold-start cost,
and v2 has zero consumers. If embeddings are needed later, evaluate
provider-API path first.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

# 8B — Gamification surface (Tasks 5–12)

### Task 5: Seed 5 new badges + 5 starter challenges

**Files:**
- Modify: `packages/db/scripts/seed-badges.ts` (add 5 entries to `STARTER_BADGES`)
- Create: `packages/db/scripts/seed-challenges.ts` (new idempotent seed script)
- Modify: `packages/db/package.json` (add `db:seed-challenges` script)

- [ ] **Step 1: Extend the badge seed list**

Append these five entries to the `STARTER_BADGES` array in `packages/db/scripts/seed-badges.ts` (after `community-voice`):

```typescript
  {
    slug: 'propuesta-author',
    title: 'Primera propuesta',
    description: 'Publicaste tu primera propuesta para el mandato vivo.',
    tier: 'silver',
  },
  {
    slug: 'lector-curioso',
    title: 'Lector curioso',
    description: 'Leíste cinco artículos del blog.',
    tier: 'bronze',
  },
  {
    slug: 'lector-voraz',
    title: 'Lector voraz',
    description: 'Leíste veinticinco artículos del blog.',
    tier: 'silver',
  },
  {
    slug: 'streak-7',
    title: 'Constancia · 7 días',
    description: 'Mantuviste actividad cívica siete días seguidos.',
    tier: 'bronze',
  },
  {
    slug: 'streak-30',
    title: 'Constancia · 30 días',
    description: 'Mantuviste actividad cívica treinta días seguidos.',
    tier: 'silver',
  },
```

- [ ] **Step 2: Create the challenges seed script**

Create `packages/db/scripts/seed-challenges.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Seed the starter challenge catalog + their steps. Idempotent —
 * slug-keyed, skipped if already present.
 */
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { challenges, challengeSteps } from '../src/schema/gamification.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

interface SeedChallenge {
  slug: string;
  title: string;
  description: string;
  cadence: 'daily' | 'weekly' | 'monthly' | 'one_time';
  xpReward: number;
  badgeSlug?: string;
  steps: { title: string; description?: string; xpReward?: number }[];
}

const STARTER_CHALLENGES: SeedChallenge[] = [
  {
    slug: 'lector-diario',
    title: 'Leé un ensayo hoy',
    description: 'Abrí un artículo o ensayo y dedicale al menos un rato.',
    cadence: 'daily',
    xpReward: 10,
    steps: [{ title: 'Leer un artículo' }],
  },
  {
    slug: 'participacion-semanal',
    title: 'Sumá 3 pulsos esta semana',
    description: 'Mandá tres señales al mandato vivo en los próximos siete días.',
    cadence: 'weekly',
    xpReward: 50,
    steps: [
      { title: 'Primer pulso' },
      { title: 'Segundo pulso' },
      { title: 'Tercer pulso' },
    ],
  },
  {
    slug: 'evaluacion-semanal',
    title: 'Completá 2 cuestionarios',
    description: 'Hacé dos cuestionarios de áreas de vida esta semana.',
    cadence: 'weekly',
    xpReward: 50,
    steps: [
      { title: 'Primer cuestionario' },
      { title: 'Segundo cuestionario' },
    ],
  },
  {
    slug: 'diagnostico-completo',
    title: 'Hacé tu diagnóstico ciudadano',
    description: 'Completá la auto-evaluación cívica y ganá la insignia base.',
    cadence: 'one_time',
    xpReward: 100,
    badgeSlug: 'civic-baseline',
    steps: [{ title: 'Completar el diagnóstico' }],
  },
  {
    slug: 'voz-de-la-comunidad',
    title: 'Compartí tu primera propuesta',
    description: 'Publicá una propuesta en el feed comunitario.',
    cadence: 'one_time',
    xpReward: 30,
    badgeSlug: 'community-voice',
    steps: [{ title: 'Publicar una propuesta' }],
  },
];

const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is required to seed challenges');
}

const pool = new pg.Pool({ connectionString: url });
const db = drizzle(pool);

let created = 0;
let kept = 0;
for (const c of STARTER_CHALLENGES) {
  const [existing] = await db.select().from(challenges).where(eq(challenges.slug, c.slug)).limit(1);
  if (existing) {
    kept++;
    continue;
  }

  // Look up badge id if the challenge auto-awards one. The badge
  // seed must run first; if the badge is missing we leave badgeId
  // null and log a warning instead of erroring.
  let badgeId: number | null = null;
  if (c.badgeSlug) {
    const { badges } = await import('../src/schema/gamification.js');
    const [badge] = await db.select().from(badges).where(eq(badges.slug, c.badgeSlug)).limit(1);
    if (badge) badgeId = badge.id;
    else process.stderr.write(`warning: badge slug "${c.badgeSlug}" not found for challenge "${c.slug}"\n`);
  }

  const [challengeRow] = await db
    .insert(challenges)
    .values({
      slug: c.slug,
      title: c.title,
      description: c.description,
      cadence: c.cadence,
      xpReward: c.xpReward,
      badgeId,
      isActive: true,
    })
    .returning();
  if (!challengeRow) throw new Error(`Failed to insert challenge ${c.slug}`);

  for (let i = 0; i < c.steps.length; i++) {
    const step = c.steps[i];
    if (!step) continue;
    const insertStep: Parameters<typeof db.insert<typeof challengeSteps>>[0] = challengeSteps;
    void insertStep;
    await db.insert(challengeSteps).values({
      challengeId: challengeRow.id,
      title: step.title,
      description: step.description ?? null,
      orderIndex: i,
      xpReward: step.xpReward ?? 0,
    });
  }
  created++;
}

await pool.end();
process.stdout.write(`challenges seeded: ${String(created)} new, ${String(kept)} kept\n`);
```

- [ ] **Step 3: Register the seed script**

In `packages/db/package.json`, add to the `"scripts"` object alongside `db:seed-badges`:

```jsonc
{
  "scripts": {
    // ...existing scripts...
    "db:seed-challenges": "tsx scripts/seed-challenges.ts"
  }
}
```

- [ ] **Step 4: Run both seeds locally to verify**

```bash
pnpm --filter @v2/db db:seed-badges
pnpm --filter @v2/db db:seed-challenges
```

Expected stdout:
```
badges seeded: 5 new, 6 kept
challenges seeded: 5 new, 0 kept
```

Re-run both — second run must show `0 new, 11 kept` and `0 new, 5 kept`.

- [ ] **Step 5: Verify with a SQL probe**

```bash
pnpm --filter @v2/db exec tsx -e "
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { badges, challenges, challengeSteps } from './src/schema/gamification.js';
const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
const pool = new pg.Pool({ connectionString: url });
const db = drizzle(pool);
const b = await db.select().from(badges);
const c = await db.select().from(challenges);
const s = await db.select().from(challengeSteps);
console.log({ badgeCount: b.length, challengeCount: c.length, stepCount: s.length });
await pool.end();
"
```

Expected output: `{ badgeCount: 11, challengeCount: 5, stepCount: 8 }` (8 = 1 + 3 + 2 + 1 + 1).

- [ ] **Step 6: Run verify**

```bash
pnpm verify
```

Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add packages/db/scripts/seed-badges.ts packages/db/scripts/seed-challenges.ts packages/db/package.json
git commit -m "$(cat <<'EOF'
feat(db): 5 new badges + 5 starter challenges seeds

Adds propuesta-author, lector-curioso, lector-voraz, streak-7,
streak-30 to the badge seed. New seed-challenges.ts idempotently
inserts five starter challenges (lector-diario daily; participacion-
semanal + evaluacion-semanal weekly; diagnostico-completo +
voz-de-la-comunidad one_time) with their checkbox steps. Auto-
awarded badges resolved by slug at seed time.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 6: Gamification feature slice — routes, service, validation

**Files:**
- Create: `apps/api/src/features/gamification/routes.ts`
- Create: `apps/api/src/features/gamification/service.ts`
- Create: `apps/api/src/features/gamification/validation.ts`
- Modify: `apps/api/src/app.ts` (mount `/api/gamification`)
- Modify: `apps/api/src/middleware/csrf.ts` (no changes expected — all gamification mutations require auth; CSRF protects them by default)
- Create: `apps/api/tests/gamification-flows.test.ts`
- Create: `packages/shared/src/gamification/levels.ts` (level curve — used by service)
- Modify: `packages/shared/src/index.ts` (re-export `levelForXp`, `xpForLevel`)

- [ ] **Step 1: Write the level curve in `@v2/shared`**

Create `packages/shared/src/gamification/levels.ts`:

```typescript
/**
 * Level curve: level n requires SUM_{k=1..n}(100 * k) = 100 * n * (n+1) / 2
 * total XP. So 100, 300, 600, 1000, 1500, 2100, 2800, …
 *
 *   level 1: 0 XP
 *   level 2: 100 XP
 *   level 3: 300 XP
 *   level 4: 600 XP
 *   level 5: 1000 XP
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return (100 * n * (n + 1)) / 2;
}

export function levelForXp(xp: number): number {
  if (xp < 100) return 1;
  // Solve 100 * (L-1) * L / 2 <= xp  →  L^2 - L - xp/50 <= 0
  // L = (1 + sqrt(1 + 4 * xp / 50)) / 2; level = floor(L) + 1 adjusted.
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function xpToNextLevel(xp: number): { currentLevel: number; nextLevel: number; xpIntoLevel: number; xpForCurrent: number; xpForNext: number } {
  const currentLevel = levelForXp(xp);
  const xpForCurrent = xpForLevel(currentLevel);
  const xpForNext = xpForLevel(currentLevel + 1);
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    xpIntoLevel: xp - xpForCurrent,
    xpForCurrent,
    xpForNext,
  };
}
```

- [ ] **Step 2: Re-export from `packages/shared/src/index.ts`**

Add this line (alongside the other re-exports) in `packages/shared/src/index.ts`:

```typescript
export { xpForLevel, levelForXp, xpToNextLevel } from './gamification/levels.js';
```

- [ ] **Step 3: Write unit tests for the level curve**

Create `packages/shared/tests/levels.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import { levelForXp, xpForLevel, xpToNextLevel } from '../src/gamification/levels.js';

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });
  it('matches the documented curve', () => {
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(4)).toBe(600);
    expect(xpForLevel(5)).toBe(1000);
  });
});

describe('levelForXp', () => {
  it('returns 1 below 100 XP', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
  });
  it('crosses to level 2 at exactly 100 XP', () => {
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(299)).toBe(2);
  });
  it('crosses to level 3 at 300 XP', () => {
    expect(levelForXp(300)).toBe(3);
  });
  it('handles large XP values', () => {
    expect(levelForXp(10_000)).toBeGreaterThan(10);
  });
});

describe('xpToNextLevel', () => {
  it('reports xpIntoLevel correctly mid-level', () => {
    const r = xpToNextLevel(150);
    expect(r.currentLevel).toBe(2);
    expect(r.nextLevel).toBe(3);
    expect(r.xpForCurrent).toBe(100);
    expect(r.xpForNext).toBe(300);
    expect(r.xpIntoLevel).toBe(50);
  });
});
```

Run: `pnpm --filter @v2/shared test -- tests/levels.test.ts`
Expected: all pass.

- [ ] **Step 4: Write the gamification service**

Create `apps/api/src/features/gamification/service.ts`:

```typescript
/**
 * Gamification service — orchestrates XP grants + level recomputation
 * + streak advance + badge auto-award. Sits between route handlers
 * and GamificationRepository.
 *
 * The single entry point is `recordEvent`. Callers describe what
 * happened; the service decides XP, dedup, badges, streak, level-up,
 * and returns the `xpEvent` payload that goes onto the HTTP response.
 */
import { GamificationRepository, type Db } from '@v2/db';
import { levelForXp, xpToNextLevel } from '@v2/shared';

import { logger } from '../../lib/logger.js';

export interface XpEventPayload {
  xpAwarded: number;
  kind: string;
  newLevel: number | null;
  newBadges: { slug: string; title: string; tier: string }[];
}

export interface RecordEventInput {
  userId: number;
  kind: string;
  xpAwarded: number;
  /** ISO YYYY-MM-DD; defaults to today in UTC if omitted. */
  activityDate?: string;
  /** When set, the service skips the grant if `hasActivityOnDate(userId, kind, activityDate)` returns true. */
  dedup?: 'daily' | 'never';
  /** Free-form payload stored on daily_activity.payload. */
  payload?: Record<string, unknown>;
  /** Slugs of badges to award (once-each, idempotent). */
  badgesToAward?: string[];
}

export class GamificationService {
  constructor(private readonly db: Db) {}

  private repo(): GamificationRepository {
    return new GamificationRepository(this.db);
  }

  private todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Awards XP + any specified badges, advances the streak, recomputes
   * level. Returns the xpEvent payload — or null if dedup suppressed
   * the grant.
   */
  async recordEvent(input: RecordEventInput): Promise<XpEventPayload | null> {
    const repo = this.repo();
    const activityDate = input.activityDate ?? this.todayUtc();

    if (input.dedup === 'daily') {
      const already = await repo.hasActivityOnDate(input.userId, input.kind, activityDate);
      if (already) return null;
    }

    // Ensure user_levels row exists + capture previous XP for level-up detection.
    const before = await repo.getOrCreateUserLevel(input.userId);
    const beforeLevel = before.level;

    await repo.logActivity({
      userId: input.userId,
      activityDate,
      kind: input.kind,
      xpAwarded: input.xpAwarded,
      payload: input.payload ?? null,
    });

    // Re-read to get the updated XP. logActivity has already bumped it.
    const after = await repo.getOrCreateUserLevel(input.userId);
    const newLevelComputed = levelForXp(after.xp);

    // Persist level if it changed.
    let newLevel: number | null = null;
    if (newLevelComputed !== beforeLevel) {
      await this.db
        .update(await import('@v2/db/schema').then((m) => m.userLevels))
        .set({ level: newLevelComputed })
        .where((await import('drizzle-orm')).eq(
          (await import('@v2/db/schema')).userLevels.userId,
          input.userId,
        ));
      newLevel = newLevelComputed;
    }

    // Advance streak (in-line: same-day no-op, next-day ++, gap reset).
    await this.advanceStreak(input.userId, activityDate);

    // Award explicit badges + check streak milestones.
    const newBadges: { slug: string; title: string; tier: string }[] = [];
    const slugs = new Set<string>(input.badgesToAward ?? []);

    const streakRow = await repo.getOrCreateUserLevel(input.userId);
    if (streakRow.streakDays >= 7) slugs.add('streak-7');
    if (streakRow.streakDays >= 30) slugs.add('streak-30');

    for (const slug of slugs) {
      const badge = await repo.findBadgeBySlug(slug);
      if (!badge) continue;
      try {
        await repo.awardBadge({ userId: input.userId, badgeId: badge.id });
        newBadges.push({ slug: badge.slug, title: badge.title, tier: badge.tier });
      } catch (err) {
        if (err instanceof Error && /unique/i.test(err.message)) {
          continue; // already owned — idempotent
        }
        throw err;
      }
    }

    return {
      xpAwarded: input.xpAwarded,
      kind: input.kind,
      newLevel,
      newBadges,
    };
  }

  /** Same-day no-op · next-day ++ · gap → reset to 1. Atomic UPDATE. */
  async advanceStreak(userId: number, activityDate: string): Promise<void> {
    const { eq } = await import('drizzle-orm');
    const { userLevels } = await import('@v2/db/schema');

    const repo = this.repo();
    const row = await repo.getOrCreateUserLevel(userId);
    if (row.lastActiveDate === activityDate) return;

    const yesterday = (() => {
      const d = new Date(`${activityDate}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().slice(0, 10);
    })();

    const nextStreak = row.lastActiveDate === yesterday ? row.streakDays + 1 : 1;
    const nextLongest = Math.max(row.longestStreakDays, nextStreak);

    await this.db
      .update(userLevels)
      .set({
        streakDays: nextStreak,
        longestStreakDays: nextLongest,
        lastActiveDate: activityDate,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.userId, userId));
  }

  /**
   * Best-effort wrapper for use inside route handlers. Swallows all
   * errors so the underlying user action never fails because of a
   * gamification hiccup.
   */
  async safeRecord(input: RecordEventInput): Promise<XpEventPayload | null> {
    try {
      return await this.recordEvent(input);
    } catch (err) {
      logger.warn({ err, userId: input.userId, kind: input.kind }, 'gamification: recordEvent failed');
      return null;
    }
  }
}
```

- [ ] **Step 5: Write the validation schemas**

Create `apps/api/src/features/gamification/validation.ts`:

```typescript
import { z } from 'zod';

export const leaderboardQuerySchema = z.object({
  period: z.enum(['weekly', 'all_time']).default('weekly'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const challengeAdvanceSchema = z.object({
  orderIndex: z.number().int().min(0),
});
```

- [ ] **Step 6: Write the routes file**

Create `apps/api/src/features/gamification/routes.ts`:

```typescript
/**
 * Gamification HTTP slice.
 *
 *   GET  /api/gamification/me          (auth) — XP + level + badges + activity
 *   GET  /api/gamification/badges      — public badge catalog
 *   GET  /api/gamification/challenges  (auth-optional) — challenges + progress
 *   POST /api/gamification/challenges/:slug/start    (auth)
 *   POST /api/gamification/challenges/:slug/advance  (auth)
 *   GET  /api/gamification/leaderboard?period=weekly|all_time — cached rankings
 */
import { GamificationRepository, getDb, eq, and, sql } from '@v2/db';
import {
  badges as badgesTable,
  rankings,
  users,
  userBadges,
  userChallengeProgress as ucp,
  challenges as challengesTable,
  challengeSteps as challengeStepsTable,
} from '@v2/db/schema';
import { xpToNextLevel } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

import { challengeAdvanceSchema, leaderboardQuerySchema } from './validation.js';

const router: RouterType = Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const db = getDb();
    const repo = new GamificationRepository(db);

    const userLevel = await repo.getOrCreateUserLevel(req.user.id);
    const curve = xpToNextLevel(userLevel.xp);
    const recent = await repo.listRecentActivity(req.user.id, 20);

    // Inline join to fetch badge details for the user's badges.
    const myBadges = await db
      .select({
        slug: badgesTable.slug,
        title: badgesTable.title,
        description: badgesTable.description,
        tier: badgesTable.tier,
        iconUrl: badgesTable.iconUrl,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badgesTable, eq(userBadges.badgeId, badgesTable.id))
      .where(eq(userBadges.userId, req.user.id));

    // In-progress challenges + their steps.
    const inProgress = await db
      .select({
        progressId: ucp.id,
        challengeId: ucp.challengeId,
        slug: challengesTable.slug,
        title: challengesTable.title,
        description: challengesTable.description,
        cadence: challengesTable.cadence,
        xpReward: challengesTable.xpReward,
        stepsCompleted: ucp.stepsCompleted,
        status: ucp.status,
      })
      .from(ucp)
      .innerJoin(challengesTable, eq(ucp.challengeId, challengesTable.id))
      .where(and(eq(ucp.userId, req.user.id), eq(ucp.status, 'in_progress')));

    res.json({
      data: {
        xp: userLevel.xp,
        level: userLevel.level,
        streakDays: userLevel.streakDays,
        longestStreakDays: userLevel.longestStreakDays,
        xpIntoLevel: curve.xpIntoLevel,
        xpForCurrent: curve.xpForCurrent,
        xpForNext: curve.xpForNext,
        badges: myBadges,
        recentActivity: recent.map((a) => ({
          id: a.id,
          kind: a.kind,
          xpAwarded: a.xpAwarded,
          activityDate: a.activityDate,
          createdAt: a.createdAt,
          payload: a.payload,
        })),
        inProgressChallenges: inProgress,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/badges', async (_req, res, next) => {
  try {
    const db = getDb();
    const all = await db
      .select()
      .from(badgesTable)
      .where(eq(badgesTable.isActive, true));
    res.json({ data: { badges: all } });
  } catch (err) {
    next(err);
  }
});

router.get('/challenges', optionalAuthenticate, async (req, res, next) => {
  try {
    const db = getDb();
    const active = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.isActive, true));

    const stepsByChallenge = new Map<number, { id: number; title: string; description: string | null; orderIndex: number; xpReward: number }[]>();
    if (active.length > 0) {
      const allSteps = await db
        .select()
        .from(challengeStepsTable);
      for (const s of allSteps) {
        if (!stepsByChallenge.has(s.challengeId)) stepsByChallenge.set(s.challengeId, []);
        stepsByChallenge.get(s.challengeId)!.push({
          id: s.id,
          title: s.title,
          description: s.description,
          orderIndex: s.orderIndex,
          xpReward: s.xpReward,
        });
      }
      for (const list of stepsByChallenge.values()) list.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    let progressByChallenge = new Map<number, { stepsCompleted: unknown; status: string }>();
    if (req.user) {
      const myProgress = await db
        .select({ challengeId: ucp.challengeId, stepsCompleted: ucp.stepsCompleted, status: ucp.status })
        .from(ucp)
        .where(eq(ucp.userId, req.user.id));
      progressByChallenge = new Map(myProgress.map((p) => [p.challengeId, { stepsCompleted: p.stepsCompleted, status: p.status }]));
    }

    res.json({
      data: {
        challenges: active.map((c) => ({
          ...c,
          steps: stepsByChallenge.get(c.id) ?? [],
          progress: progressByChallenge.get(c.id) ?? null,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/challenges/:slug/start', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const slug = req.params.slug;
    if (typeof slug !== 'string') throw new HttpError(400, 'INVALID_SLUG', 'Slug requerido.');
    const repo = new GamificationRepository(getDb());
    const challenge = await repo.findChallengeBySlug(slug);
    if (!challenge) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Desafío no encontrado.' } });
      return;
    }
    // Idempotent: return existing progress row if any.
    const existing = await repo.findUserChallengeProgress(req.user.id, challenge.id);
    if (existing) {
      res.json({ data: { progress: existing } });
      return;
    }
    const progress = await repo.startUserChallenge({
      userId: req.user.id,
      challengeId: challenge.id,
      stepsCompleted: [],
      status: 'in_progress',
    });
    res.status(201).json({ data: { progress } });
  } catch (err) {
    next(err);
  }
});

router.post('/challenges/:slug/advance', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const slug = req.params.slug;
    if (typeof slug !== 'string') throw new HttpError(400, 'INVALID_SLUG', 'Slug requerido.');
    const { orderIndex } = challengeAdvanceSchema.parse(req.body);
    const repo = new GamificationRepository(getDb());
    const challenge = await repo.findChallengeBySlug(slug);
    if (!challenge) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Desafío no encontrado.' } });
      return;
    }
    const steps = await repo.listChallengeSteps(challenge.id);
    const totalSteps = steps.length;
    const progress = await repo.findUserChallengeProgress(req.user.id, challenge.id);
    if (!progress) {
      res.status(409).json({ error: { code: 'NOT_STARTED', message: 'Empezá el desafío primero.' } });
      return;
    }
    const completed = Array.isArray(progress.stepsCompleted) ? [...(progress.stepsCompleted as number[])] : [];
    if (!completed.includes(orderIndex)) completed.push(orderIndex);
    const isComplete = completed.length >= totalSteps;
    const patch: Parameters<typeof repo.updateUserChallengeProgress>[1] = {
      stepsCompleted: completed,
      status: isComplete ? 'completed' : 'in_progress',
    };
    if (isComplete) patch.completedAt = new Date();
    const updated = await repo.updateUserChallengeProgress(progress.id, patch);
    res.json({ data: { progress: updated, completed: isComplete } });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const filters = leaderboardQuerySchema.parse(req.query);
    const db = getDb();

    // periodStart for weekly is Monday 00:00 UTC of current week; for all_time it's null.
    const periodStart = filters.period === 'weekly' ? mondayUtc(new Date()) : null;

    // Pull cached rankings + join user public shape.
    const rows = await db
      .select({
        rank: rankings.rank,
        xp: rankings.xp,
        userId: rankings.userId,
        displayName: users.name,
      })
      .from(rankings)
      .innerJoin(users, eq(rankings.userId, users.id))
      .where(
        and(
          eq(rankings.periodKind, filters.period),
          eq(rankings.scopeKind, 'global'),
          periodStart === null
            ? sql`${rankings.periodStart} is null`
            : eq(rankings.periodStart, periodStart),
          sql`${rankings.scopeId} is null`,
        ),
      )
      .orderBy(rankings.rank)
      .limit(filters.limit);

    res.json({
      data: {
        period: filters.period,
        periodStart: periodStart?.toISOString() ?? null,
        rows: rows.map((r) => ({
          rank: r.rank,
          xp: r.xp,
          userId: r.userId,
          displayName: r.displayName,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

function mondayUtc(now: Date): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = (day + 6) % 7; // Mon=0, Sun=6
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

export { router as gamificationRouter };
```

- [ ] **Step 7: Mount the router in `apps/api/src/app.ts`**

Add the import alongside the other feature router imports:

```typescript
import { gamificationRouter } from './features/gamification/routes.js';
```

Mount it in the feature-router section (after `analyticsRouter`):

```typescript
  app.use('/api/gamification', gamificationRouter);
```

- [ ] **Step 8: Write the integration test file**

Create `apps/api/tests/gamification-flows.test.ts`:

```typescript
/**
 * Integration tests for /api/gamification/* — me / badges / challenges /
 * leaderboard. Hits the real DB through createApp().
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import {
  createTestUser,
  csrfed,
  deleteTestUsers,
  hasDatabaseUrl,
  loginAndGetCookies,
} from './helpers/index.js';

import type { LoggedInSession, TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Gamification flows', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;

  beforeAll(async () => {
    user = await createTestUser('gamification');
    session = await loginAndGetCookies(app, user);
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('GET /api/gamification/me returns a freshly-created level row', async () => {
    const res = await request
      .get('/api/gamification/me')
      .set('Cookie', session.cookies);
    expect(res.status).toBe(200);
    expect(res.body.data.xp).toBe(0);
    expect(res.body.data.level).toBe(1);
    expect(Array.isArray(res.body.data.badges)).toBe(true);
    expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
    expect(Array.isArray(res.body.data.inProgressChallenges)).toBe(true);
  });

  it('GET /api/gamification/me requires auth', async () => {
    const res = await request.get('/api/gamification/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/gamification/badges is public and returns the catalog', async () => {
    const res = await request.get('/api/gamification/badges');
    expect(res.status).toBe(200);
    expect(res.body.data.badges.length).toBeGreaterThanOrEqual(11);
    expect(res.body.data.badges.some((b: { slug: string }) => b.slug === 'civic-baseline')).toBe(true);
  });

  it('GET /api/gamification/challenges returns the seeded set without auth', async () => {
    const res = await request.get('/api/gamification/challenges');
    expect(res.status).toBe(200);
    expect(res.body.data.challenges.length).toBeGreaterThanOrEqual(5);
    const lectorDiario = res.body.data.challenges.find((c: { slug: string }) => c.slug === 'lector-diario');
    expect(lectorDiario).toBeTruthy();
    expect(lectorDiario.steps.length).toBe(1);
    expect(lectorDiario.progress).toBeNull();
  });

  it('GET /api/gamification/challenges includes progress when authed', async () => {
    const res = await request
      .get('/api/gamification/challenges')
      .set('Cookie', session.cookies);
    expect(res.status).toBe(200);
    const lectorDiario = res.body.data.challenges.find((c: { slug: string }) => c.slug === 'lector-diario');
    // progress is null before start
    expect(lectorDiario.progress).toBeNull();
  });

  it('POST /challenges/:slug/start is idempotent', async () => {
    const r1 = await csrfed(app, session).post('/api/gamification/challenges/lector-diario/start');
    expect(r1.status).toBe(201);
    expect(r1.body.data.progress.status).toBe('in_progress');

    const r2 = await csrfed(app, session).post('/api/gamification/challenges/lector-diario/start');
    expect(r2.status).toBe(200);
    expect(r2.body.data.progress.id).toBe(r1.body.data.progress.id);
  });

  it('POST /challenges/:slug/advance auto-completes single-step challenge', async () => {
    const res = await csrfed(app, session)
      .post('/api/gamification/challenges/lector-diario/advance')
      .send({ orderIndex: 0 });
    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(true);
    expect(res.body.data.progress.status).toBe('completed');
  });

  it('POST /challenges/:slug/advance returns 409 if not started', async () => {
    const res = await csrfed(app, session)
      .post('/api/gamification/challenges/diagnostico-completo/advance')
      .send({ orderIndex: 0 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NOT_STARTED');
  });

  it('GET /api/gamification/leaderboard?period=weekly returns 200 (possibly empty)', async () => {
    const res = await request.get('/api/gamification/leaderboard?period=weekly');
    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('weekly');
    expect(Array.isArray(res.body.data.rows)).toBe(true);
  });

  it('GET /api/gamification/leaderboard?period=all_time returns 200', async () => {
    const res = await request.get('/api/gamification/leaderboard?period=all_time');
    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe('all_time');
    expect(res.body.data.periodStart).toBeNull();
  });

  it('rejects an invalid period value', async () => {
    const res = await request.get('/api/gamification/leaderboard?period=hourly');
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 9: Run the new test file**

```bash
pnpm --filter @v2/api test -- tests/gamification-flows.test.ts
```

Expected: all green. If a CSRF-related test fails because `/api/gamification/challenges/:slug/start` isn't in the exempt list, fix the test (don't add gamification to the CSRF exempt list — these are state-changing mutations behind auth).

- [ ] **Step 10: Run full verify**

```bash
pnpm verify
```

Expected: all green.

- [ ] **Step 11: Commit**

```bash
git add packages/shared/src/gamification/levels.ts packages/shared/src/index.ts packages/shared/tests/levels.test.ts \
  apps/api/src/features/gamification apps/api/src/app.ts apps/api/tests/gamification-flows.test.ts
git commit -m "$(cat <<'EOF'
feat(api): gamification feature slice — /me, /badges, /challenges, /leaderboard

Adds @v2/shared level curve (xpForLevel / levelForXp / xpToNextLevel,
triangular 100·n·(n+1)/2). New GamificationService orchestrates
XP grant → level recompute → streak advance → badge awards. Routes:
GET /me (auth, full state payload), GET /badges (public), GET
/challenges (auth-optional, includes progress when authed), POST
/challenges/:slug/{start,advance} (auth + CSRF), GET /leaderboard
?period=weekly|all_time. Integration tests cover happy paths + auth
fences + challenge advance/idempotency.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 7: xpEvent envelope + 4 new XP hooks + POST /api/propuestas

**Files:**
- Modify: `apps/api/src/features/civic-assessment/routes.ts` (use `GamificationService.safeRecord`; return `xpEvent` in response)
- Modify: `apps/api/src/features/goals/routes.ts` (same shape)
- Modify: `apps/api/src/features/life-areas/routes.ts` (same shape)
- Modify: `apps/api/src/features/pulso/routes.ts` (POST /pulso fires `pulse_submitted` hook when authed; **add** POST /propuestas)
- Modify: `apps/api/src/features/community/routes.ts` (POST /posts fires `community_post_created`, daily-deduped)
- Modify: `apps/api/src/features/blog/routes.ts` (POST /posts/:id/view fires `content_read` when authed, lifetime-deduped by `(userId, postId)`)
- Modify: `packages/db/src/repositories/gamification.ts` (add `hasContentBeenRead(userId, kind, slug)` helper)
- Create: `apps/api/tests/gamification-hooks.test.ts`

**Key shape:** every modified hook returns the existing response with an *optional* `xpEvent` inside `data`:

```typescript
const xpEvent = await new GamificationService(getDb()).safeRecord({ /* ... */ });
const data = { /* existing payload */ };
res.json({ data: xpEvent ? { ...data, xpEvent } : data });
```

- [ ] **Step 1: Add the content-read dedup helper to the repository**

In `packages/db/src/repositories/gamification.ts`, add this method to `GamificationRepository` (alongside `hasActivityOnDate`):

```typescript
  /**
   * Has the user already logged a `content_read` event for this slug?
   * Used for lifetime dedup (re-reading the same post doesn't farm XP).
   */
  async hasContentBeenRead(userId: number, kind: 'blog' | 'ensayo', slug: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: dailyActivity.id })
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.kind, 'content_read'),
          sql`${dailyActivity.payload}->>'kind' = ${kind}`,
          sql`${dailyActivity.payload}->>'slug' = ${slug}`,
        ),
      )
      .limit(1);
    return Boolean(row);
  }
```

- [ ] **Step 2: Extend `GamificationService.recordEvent` to support content_read lifetime dedup**

In `apps/api/src/features/gamification/service.ts`, replace the `dedup` field type to include `'content_read'` and the corresponding branch:

```typescript
  /** When set, the service skips the grant under the specified rule. */
  dedup?: 'daily' | 'content_read' | 'never';
  /** Required when dedup === 'content_read'. */
  contentSlug?: string;
  contentKind?: 'blog' | 'ensayo';
```

And in `recordEvent`, before the existing `if (input.dedup === 'daily')` block:

```typescript
    if (input.dedup === 'content_read') {
      if (!input.contentSlug || !input.contentKind) {
        throw new Error('content_read dedup requires contentSlug + contentKind');
      }
      const already = await repo.hasContentBeenRead(input.userId, input.contentKind, input.contentSlug);
      if (already) return null;
    }
```

- [ ] **Step 3: Wire the existing 3 hooks to return `xpEvent`**

In `apps/api/src/features/civic-assessment/routes.ts`, replace the existing best-effort gamification block at the end of `POST /:id/complete` with:

```typescript
    const gamification = new GamificationService(getDb());
    const xpEvent = await gamification.safeRecord({
      userId: req.user.id,
      kind: 'civic_assessment_completed',
      xpAwarded: 100,
      badgesToAward: ['civic-baseline'],
    });

    res.json({ data: xpEvent ? { profile, xpEvent } : { profile } });
```

(Drop the existing inline `GamificationRepository` usage — it's now inside the service.)

Apply the analogous transformation in:
- `apps/api/src/features/goals/routes.ts` for `POST /goals/:id/complete` — `kind: 'goal_completed'`, `xpAwarded: 50`, no `badgesToAward` (the first-goal / goal-crusher badges will be auto-handled later via the service if we extend it; for Phase 8 we pass `badgesToAward: ['first-goal']` on the very first one). **For simplicity, pass `badgesToAward: ['first-goal']` every time — the service is idempotent on already-owned badges, so this is a no-op after the first completion.**
- `apps/api/src/features/life-areas/routes.ts` for the quiz-response hook — `kind: 'quiz_completed'`, `xpAwarded: 25`, `badgesToAward: ['first-quiz']`, `dedup: 'daily'`.

- [ ] **Step 4: Add the `pulse_submitted` hook to POST /api/pulso**

In `apps/api/src/features/pulso/routes.ts`, modify `POST /pulso` so that after the existing `await repo.addSignal(insertInput)` line, if `req.user` is present, the service fires:

```typescript
    let xpEvent = null;
    if (req.user) {
      const gamification = new GamificationService(getDb());
      xpEvent = await gamification.safeRecord({
        userId: req.user.id,
        kind: 'pulse_submitted',
        xpAwarded: 10,
        badgesToAward: ['first-pulse'],
      });
    }
    res.status(201).json({ data: xpEvent ? { id: signal.id, xpEvent } : { id: signal.id } });
```

(Imports: add `import { GamificationService } from '../gamification/service.js';` at the top.)

- [ ] **Step 5: Add POST /api/propuestas + propuesta_submitted hook**

In `apps/api/src/features/pulso/routes.ts`, before the line `router.get('/propuestas', ...)`, insert the create-propuesta route:

```typescript
const createProposalSchema = z.object({
  title: z.string().trim().min(3, 'El título es muy corto.').max(200, 'Máximo 200 caracteres.'),
  body: z.string().trim().min(10, 'Describí brevemente la propuesta.').max(5000, 'Máximo 5000 caracteres.'),
  provinceId: z.number().int().positive().optional(),
});

router.post('/propuestas', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const input = createProposalSchema.parse(req.body);
    const repo = new PulsoRepository(getDb());
    const insertInput: Parameters<typeof repo.createProposal>[0] = {
      title: input.title,
      body: input.body,
      authorId: req.user.id,
      status: 'voting',
    };
    if (input.provinceId !== undefined) insertInput.provinceId = input.provinceId;
    const proposal = await repo.createProposal(insertInput);

    const gamification = new GamificationService(getDb());
    const xpEvent = await gamification.safeRecord({
      userId: req.user.id,
      kind: 'propuesta_submitted',
      xpAwarded: 15,
      badgesToAward: ['propuesta-author'],
    });

    res.status(201).json({ data: xpEvent ? { proposal, xpEvent } : { proposal } });
  } catch (err) {
    next(err);
  }
});
```

`PulsoRepository.createProposal` likely doesn't exist yet. If it doesn't, add it inside `packages/db/src/repositories/pulso.ts`:

```typescript
  async createProposal(input: NewProposal): Promise<Proposal> {
    const [row] = await this.db.insert(proposals).values(input).returning();
    if (!row) throw new Error('Failed to create proposal');
    return row;
  }
```

(Verify the actual schema/table name by inspecting `packages/db/src/schema/pulso.ts`. If the table is named differently — e.g. `proposals` vs `propuestas` — use the actual exported symbol.)

- [ ] **Step 6: Add `community_post_created` hook to POST /api/community/posts**

In `apps/api/src/features/community/routes.ts`, modify `POST /posts` so after the existing `const post = await repo.createPost({ ... })`:

```typescript
    const gamification = new GamificationService(getDb());
    const xpEvent = await gamification.safeRecord({
      userId: req.user.id,
      kind: 'community_post_created',
      xpAwarded: 5,
      dedup: 'daily',
      badgesToAward: ['community-voice'],
    });

    res.status(201).json({ data: xpEvent ? { post, xpEvent } : { post } });
```

(Imports: add `import { GamificationService } from '../gamification/service.js';`.)

- [ ] **Step 7: Add `content_read` hook to POST /api/blog/posts/:id/view**

In `apps/api/src/features/blog/routes.ts`, modify `POST /posts/:id/view`. After `await repo.recordView(insertArgs)`:

```typescript
    let xpEvent = null;
    if (req.user) {
      // Look up the slug so we can lifetime-dedup on (userId, blog, slug).
      const post = await repo.findPostById(id);
      if (post) {
        const gamification = new GamificationService(getDb());
        const lifetimeReads = await new GamificationRepository(getDb())
          .listRecentActivity(req.user.id, 10_000)
          .then((rows) => rows.filter((r) => r.kind === 'content_read').length);
        const slugsToBadge: string[] = [];
        // Badge thresholds. Service is idempotent on owned badges, so it's
        // safe to pass these eagerly.
        if (lifetimeReads + 1 >= 5) slugsToBadge.push('lector-curioso');
        if (lifetimeReads + 1 >= 25) slugsToBadge.push('lector-voraz');
        xpEvent = await gamification.safeRecord({
          userId: req.user.id,
          kind: 'content_read',
          xpAwarded: 5,
          dedup: 'content_read',
          contentKind: 'blog',
          contentSlug: post.slug,
          payload: { kind: 'blog', slug: post.slug, postId: post.id },
          badgesToAward: slugsToBadge,
        });
      }
    }
    res.json({ data: xpEvent ? { ok: true, xpEvent } : { ok: true } });
```

(Imports: add `GamificationRepository` to `@v2/db` import, add `import { GamificationService } from '../gamification/service.js';`.)

- [ ] **Step 8: Write the integration tests for the new hooks**

Create `apps/api/tests/gamification-hooks.test.ts`:

```typescript
/**
 * Integration tests for the XP hooks fired from feature routes:
 * pulse_submitted, propuesta_submitted, community_post_created,
 * content_read. Each test verifies (a) the xpEvent envelope, (b)
 * dedup suppresses the second grant, (c) the milestone badge is
 * awarded exactly once.
 */
import '../src/load-env.js';

import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import {
  createTestUser,
  csrfed,
  deleteTestUsers,
  hasDatabaseUrl,
  loginAndGetCookies,
} from './helpers/index.js';

import type { LoggedInSession, TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Gamification hooks', () => {
  const app = createApp();
  const request = supertest(app);
  let user: TestUser;
  let session: LoggedInSession;

  beforeAll(async () => {
    user = await createTestUser('gamification-hooks');
    session = await loginAndGetCookies(app, user);
  });

  afterAll(async () => {
    await deleteTestUsers([user.email]);
  });

  it('POST /api/pulso returns xpEvent + awards first-pulse', async () => {
    const res = await csrfed(app, session)
      .post('/api/pulso')
      .send({ body: 'Esto es una señal de prueba. Necesitamos más espacios verdes.' });
    expect(res.status).toBe(201);
    expect(res.body.data.xpEvent).toBeTruthy();
    expect(res.body.data.xpEvent.xpAwarded).toBe(10);
    expect(res.body.data.xpEvent.newBadges.some((b: { slug: string }) => b.slug === 'first-pulse')).toBe(true);
  });

  it('POST /api/pulso second time: xpEvent still fires (no dedup), but no new badge', async () => {
    const res = await csrfed(app, session)
      .post('/api/pulso')
      .send({ body: 'Segunda señal de prueba — el bus 12 nunca pasa.' });
    expect(res.status).toBe(201);
    expect(res.body.data.xpEvent.xpAwarded).toBe(10);
    expect(res.body.data.xpEvent.newBadges).toEqual([]);
  });

  it('POST /api/propuestas returns xpEvent + propuesta-author badge', async () => {
    const res = await csrfed(app, session)
      .post('/api/propuestas')
      .send({ title: 'Propuesta de prueba', body: 'Una descripción suficientemente larga.' });
    expect(res.status).toBe(201);
    expect(res.body.data.xpEvent.xpAwarded).toBe(15);
    expect(res.body.data.xpEvent.newBadges.some((b: { slug: string }) => b.slug === 'propuesta-author')).toBe(true);
  });

  it('POST /api/community/posts fires +5 with daily dedup', async () => {
    const r1 = await csrfed(app, session)
      .post('/api/community/posts')
      .send({ title: 'Hola mundo', body: 'Primer post de la comunidad.' });
    expect(r1.status).toBe(201);
    expect(r1.body.data.xpEvent.xpAwarded).toBe(5);

    const r2 = await csrfed(app, session)
      .post('/api/community/posts')
      .send({ title: 'Otro post', body: 'Segundo post mismo día.' });
    expect(r2.status).toBe(201);
    expect(r2.body.data.xpEvent).toBeUndefined();
  });

  it('POST /api/blog/posts/:id/view fires content_read once per slug-lifetime', async () => {
    // Find an existing blog post to read. Test suite assumes at least one seeded post.
    const list = await request.get('/api/blog/posts');
    const firstPost = list.body.data.posts[0];
    if (!firstPost) {
      // Skip cleanly if there are no posts in the test DB.
      return;
    }
    const r1 = await csrfed(app, session)
      .post(`/api/blog/posts/${String(firstPost.id)}/view`)
      .send({});
    expect(r1.status).toBe(200);
    expect(r1.body.data.xpEvent?.xpAwarded).toBe(5);

    const r2 = await csrfed(app, session)
      .post(`/api/blog/posts/${String(firstPost.id)}/view`)
      .send({});
    expect(r2.status).toBe(200);
    expect(r2.body.data.xpEvent).toBeUndefined();
  });
});
```

- [ ] **Step 9: Run the hooks test file**

```bash
pnpm --filter @v2/api test -- tests/gamification-hooks.test.ts
```

Expected: all green. If `POST /api/propuestas` fails because `PulsoRepository.createProposal` is missing, implement it per Step 5 and re-run.

- [ ] **Step 10: Run the full test suite to confirm nothing else regressed**

```bash
pnpm verify
```

Expected: all green, including the previously passing tests (the existing 3 hooks now return `xpEvent`, which their tests didn't check for — they should still pass because the test asserts the existing `profile` / payload, which is unchanged).

- [ ] **Step 11: Commit**

```bash
git add apps/api/src/features apps/api/tests/gamification-hooks.test.ts packages/db/src/repositories/gamification.ts
git commit -m "$(cat <<'EOF'
feat(api): xpEvent envelope + streak engine + 4 new XP hooks

GamificationService.recordEvent now powers all XP grants and returns
a structured xpEvent payload (xpAwarded, kind, newLevel, newBadges)
that routes attach to their response data. New hooks: pulse_submitted
(+10, badge first-pulse), propuesta_submitted (+15, badge
propuesta-author — also adds POST /api/propuestas + repo
createProposal), community_post_created (+5 daily-deduped, badge
community-voice), content_read (+5 lifetime-deduped on (userId,
kind, slug), badges lector-curioso at 5 / lector-voraz at 25).
Existing civic-assessment/goal/quiz hooks migrated to the same
shape; their tests still pass since payloads are additive.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 8: Ranking cron — weekly + all_time, global scope

**Files:**
- Create: `apps/api/src/features/gamification/cron.ts`
- Create (if not present): `apps/api/api/cron/gamification-rankings.ts` (Vercel-style cron entry)
- Modify: `apps/api/package.json` (register a manual-run script `rankings:once`)
- Create: `apps/api/tests/gamification-cron.test.ts`

- [ ] **Step 1: Write the cron module**

Create `apps/api/src/features/gamification/cron.ts`:

```typescript
/**
 * Ranking cron. Recomputes the cached `rankings` rows for two scopes:
 *
 *   - period_kind = 'weekly', period_start = Monday 00:00 UTC of current week
 *   - period_kind = 'all_time', period_start = NULL
 *
 * Both are scoped to scope_kind='global' (no per-province in Phase 8).
 *
 * Strategy: for each period, compute the top 50 by XP, upsert into
 * `rankings`, then prune any stale rows for the same (periodKind,
 * periodStart, scopeKind) key whose userId is not in the new top set.
 *
 * Invoked from:
 *   - apps/api/api/cron/gamification-rankings.ts (Vercel cron entry)
 *   - manually via `pnpm --filter @v2/api run rankings:once` for dev
 */
import { and, desc, eq, getDb, sql } from '@v2/db';
import { dailyActivity, rankings, userLevels } from '@v2/db/schema';

import { logger } from '../../lib/logger.js';

const TOP_N = 50;

export async function runRankingCron(now: Date = new Date()): Promise<{ weekly: number; allTime: number }> {
  const weekly = await rebuildPeriod('weekly', mondayUtc(now));
  const allTime = await rebuildPeriod('all_time', null);
  logger.info({ weekly, allTime }, 'rankings: tick complete');
  return { weekly, allTime };
}

async function rebuildPeriod(periodKind: 'weekly' | 'all_time', periodStart: Date | null): Promise<number> {
  const db = getDb();

  // 1. Compute the top-N userIds + xp for this period.
  let top: { userId: number; xp: number }[];
  if (periodKind === 'all_time') {
    const rows = await db
      .select({ userId: userLevels.userId, xp: userLevels.xp })
      .from(userLevels)
      .orderBy(desc(userLevels.xp))
      .limit(TOP_N);
    top = rows;
  } else {
    // weekly: sum daily_activity.xpAwarded for rows with createdAt >= periodStart
    const rows = await db
      .select({
        userId: dailyActivity.userId,
        xp: sql<number>`COALESCE(SUM(${dailyActivity.xpAwarded}), 0)::int`.as('xp'),
      })
      .from(dailyActivity)
      .where(sql`${dailyActivity.createdAt} >= ${periodStart}`)
      .groupBy(dailyActivity.userId)
      .orderBy(sql`xp DESC`)
      .limit(TOP_N);
    top = rows.filter((r) => r.xp > 0);
  }

  // 2. Upsert each top row.
  let upserted = 0;
  for (let i = 0; i < top.length; i++) {
    const entry = top[i];
    if (!entry) continue;
    const rank = i + 1;
    const existing = await db
      .select()
      .from(rankings)
      .where(
        and(
          eq(rankings.periodKind, periodKind),
          periodStart === null ? sql`${rankings.periodStart} is null` : eq(rankings.periodStart, periodStart),
          eq(rankings.scopeKind, 'global'),
          sql`${rankings.scopeId} is null`,
          eq(rankings.userId, entry.userId),
        ),
      )
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      await db
        .update(rankings)
        .set({ rank, xp: entry.xp, computedAt: new Date() })
        .where(eq(rankings.id, existing[0].id));
    } else {
      await db.insert(rankings).values({
        periodKind,
        periodStart,
        scopeKind: 'global',
        scopeId: null,
        userId: entry.userId,
        rank,
        xp: entry.xp,
      });
    }
    upserted++;
  }

  // 3. Prune stale rows for this key whose userId is no longer in the top set.
  const topUserIds = top.map((r) => r.userId);
  if (topUserIds.length > 0) {
    await db
      .delete(rankings)
      .where(
        and(
          eq(rankings.periodKind, periodKind),
          periodStart === null ? sql`${rankings.periodStart} is null` : eq(rankings.periodStart, periodStart),
          eq(rankings.scopeKind, 'global'),
          sql`${rankings.scopeId} is null`,
          sql`${rankings.userId} NOT IN ${topUserIds}`,
        ),
      );
  } else {
    // No top rows at all — wipe the cache for this key.
    await db
      .delete(rankings)
      .where(
        and(
          eq(rankings.periodKind, periodKind),
          periodStart === null ? sql`${rankings.periodStart} is null` : eq(rankings.periodStart, periodStart),
          eq(rankings.scopeKind, 'global'),
          sql`${rankings.scopeId} is null`,
        ),
      );
  }

  return upserted;
}

function mondayUtc(now: Date): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}
```

- [ ] **Step 2: Create the Vercel-style cron entry**

Create `apps/api/api/cron/gamification-rankings.ts`:

```typescript
import { runRankingCron } from '../../src/features/gamification/cron.js';
import { logger } from '../../src/lib/logger.js';

export default async function handler(): Promise<void> {
  try {
    const result = await runRankingCron();
    logger.info({ result }, 'gamification-rankings: ok');
  } catch (err) {
    logger.error({ err }, 'gamification-rankings: failed');
    throw err;
  }
}
```

(Mirror the pattern of `apps/api/api/cron/mandato-engine.ts` if it exists; if not, this is the new convention.)

- [ ] **Step 3: Register the manual-run script**

In `apps/api/package.json`, add to `"scripts"`:

```jsonc
{
  "scripts": {
    // ...existing scripts...
    "rankings:once": "tsx -e \"await (await import('./src/features/gamification/cron.js')).runRankingCron();\""
  }
}
```

- [ ] **Step 4: Run the cron once to smoke-test**

```bash
pnpm --filter @v2/api run rankings:once
```

Expected output (in logs): `{"weekly":0,"allTime":N}` where N reflects how many users have XP in the test DB.

- [ ] **Step 5: Write integration tests**

Create `apps/api/tests/gamification-cron.test.ts`:

```typescript
import '../src/load-env.js';

import { GamificationRepository, getDb } from '@v2/db';
import { rankings, userLevels } from '@v2/db/schema';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { runRankingCron } from '../src/features/gamification/cron.js';

import { createTestUser, deleteTestUsers, hasDatabaseUrl } from './helpers/index.js';

import type { TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('Gamification ranking cron', () => {
  let u1: TestUser;
  let u2: TestUser;

  beforeAll(async () => {
    u1 = await createTestUser('cron-1');
    u2 = await createTestUser('cron-2');
    const repo = new GamificationRepository(getDb());
    // Seed XP directly — bypass the service so we don't depend on the
    // hook ordering.
    await repo.getOrCreateUserLevel(u1.id);
    await repo.getOrCreateUserLevel(u2.id);
    await repo.addXp(u1.id, 250);
    await repo.addXp(u2.id, 50);
    // Add a fresh daily_activity row for both so the weekly path has data.
    const today = new Date().toISOString().slice(0, 10);
    await repo.logActivity({ userId: u1.id, activityDate: today, kind: 'test', xpAwarded: 250 });
    await repo.logActivity({ userId: u2.id, activityDate: today, kind: 'test', xpAwarded: 50 });
  });

  afterAll(async () => {
    await deleteTestUsers([u1.email, u2.email]);
  });

  it('runRankingCron writes all_time rows ordered by xp desc', async () => {
    await runRankingCron();
    const db = getDb();
    const rows = await db
      .select()
      .from(rankings)
      .where(eq(rankings.periodKind, 'all_time'));
    const u1Row = rows.find((r) => r.userId === u1.id);
    const u2Row = rows.find((r) => r.userId === u2.id);
    expect(u1Row).toBeTruthy();
    expect(u2Row).toBeTruthy();
    expect((u1Row?.rank ?? 999)).toBeLessThan(u2Row?.rank ?? 999);
  });

  it('runRankingCron writes weekly rows', async () => {
    await runRankingCron();
    const db = getDb();
    const rows = await db
      .select()
      .from(rankings)
      .where(eq(rankings.periodKind, 'weekly'));
    expect(rows.some((r) => r.userId === u1.id)).toBe(true);
  });

  it('a second run is idempotent — same userIds, ranks may differ if XP changed', async () => {
    const db = getDb();
    const beforeCount = (await db.select().from(rankings).where(eq(rankings.periodKind, 'all_time'))).length;
    await runRankingCron();
    const afterCount = (await db.select().from(rankings).where(eq(rankings.periodKind, 'all_time'))).length;
    expect(afterCount).toBe(beforeCount);
  });
});
```

- [ ] **Step 6: Run cron test**

```bash
pnpm --filter @v2/api test -- tests/gamification-cron.test.ts
```

Expected: 3 passing.

- [ ] **Step 7: Full verify**

```bash
pnpm verify
```

Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/features/gamification/cron.ts apps/api/api/cron/gamification-rankings.ts apps/api/package.json apps/api/tests/gamification-cron.test.ts
git commit -m "$(cat <<'EOF'
feat(api): ranking cron — weekly + all_time, global scope

Recomputes the top-50 rankings cache every 15 min (in production via
the Vercel cron entry api/cron/gamification-rankings.ts; locally via
pnpm rankings:once). Weekly window starts Monday 00:00 UTC; all_time
draws from user_levels.xp. Idempotent — stale rows outside the new
top set are pruned each tick. Integration tests cover ordering,
weekly emission, and idempotency.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 9: Web — XpEventBus + API interceptor + XpToast

**Files:**
- Create: `apps/web/src/lib/xp-event-bus.ts`
- Modify: `apps/web/src/lib/api.ts` (push `xpEvent` from successful responses onto the bus)
- Create: `apps/web/src/components/XpToast.tsx`
- Modify: `apps/web/src/App.tsx` (mount `<XpToast />` once near the root)
- Create: `apps/web/src/components/__tests__/XpToast.test.tsx`

- [ ] **Step 1: Build the event bus**

Create `apps/web/src/lib/xp-event-bus.ts`:

```typescript
/**
 * Tiny singleton event bus for XP events. The API response interceptor
 * pushes onto it whenever a response includes an `xpEvent` field.
 * <XpToast/> subscribes and renders queued toasts.
 *
 * Singleton (not React context) so the API client — which has no
 * React access — can publish.
 */
export interface XpEvent {
  xpAwarded: number;
  kind: string;
  newLevel: number | null;
  newBadges: { slug: string; title: string; tier: string }[];
}

type Listener = (evt: XpEvent) => void;

class XpEventBus {
  private readonly listeners = new Set<Listener>();
  publish(evt: XpEvent): void {
    for (const l of this.listeners) l(evt);
  }
  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }
}

export const xpEventBus = new XpEventBus();
```

- [ ] **Step 2: Wire the interceptor into the API client**

In `apps/web/src/lib/api.ts`, change the `request` function so that **after** the successful JSON parse, it inspects `json.data?.xpEvent`. Updated block:

```typescript
  if (!res.ok || json.error) {
    const code = json.error?.code ?? 'UNKNOWN_ERROR';
    const message = json.error?.message ?? 'Error inesperado.';
    throw new ApiError(res.status, code, message, json.error?.details);
  }

  const data = json.data as T;
  // If the response data carries an xpEvent, publish it on the bus so
  // <XpToast/> can pick it up. Strip it before returning so callers
  // don't have to know about it.
  if (data && typeof data === 'object' && 'xpEvent' in (data as Record<string, unknown>)) {
    const evt = (data as { xpEvent?: import('./xp-event-bus.js').XpEvent }).xpEvent;
    if (evt) {
      const { xpEventBus } = await import('./xp-event-bus.js');
      xpEventBus.publish(evt);
    }
    delete (data as Record<string, unknown>).xpEvent;
  }
  return data;
}
```

- [ ] **Step 3: Build the toast component**

Create `apps/web/src/components/XpToast.tsx`:

```typescript
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { xpEventBus, type XpEvent } from '~/lib/xp-event-bus';

const KIND_LABELS: Record<string, string> = {
  civic_assessment_completed: 'Diagnóstico ciudadano',
  goal_completed: 'Meta cumplida',
  quiz_completed: 'Cuestionario completado',
  pulse_submitted: 'Pulso enviado',
  propuesta_submitted: 'Propuesta publicada',
  community_post_created: 'Post compartido',
  content_read: 'Lectura registrada',
};

interface ToastItem extends XpEvent {
  id: number;
}

let nextId = 1;
const TIMEOUT_MS = 4000;
const MAX_VISIBLE = 3;

export function XpToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsub = xpEventBus.subscribe((evt) => {
      setItems((prev) => [...prev, { ...evt, id: nextId++ }].slice(-MAX_VISIBLE));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timers = items.map((it) =>
      window.setTimeout(() => {
        setItems((prev) => prev.filter((p) => p.id !== it.id));
      }, TIMEOUT_MS),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [items]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {items.map((evt) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto rounded-lg border border-white/10 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md"
          >
            {evt.newLevel ? (
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-iris-violet" />
                <div>
                  <div className="text-sm font-semibold">¡Subiste al Nivel {evt.newLevel}!</div>
                  <div className="text-xs text-muted-foreground">+{evt.xpAwarded} XP</div>
                </div>
              </div>
            ) : evt.newBadges.length > 0 ? (
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-iris-violet" />
                <div>
                  <div className="text-sm font-semibold">Nueva insignia: {evt.newBadges[0]?.title}</div>
                  <div className="text-xs text-muted-foreground">+{evt.xpAwarded} XP</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-iris-violet" />
                <div>
                  <div className="text-sm font-semibold">+{evt.xpAwarded} XP</div>
                  <div className="text-xs text-muted-foreground">{KIND_LABELS[evt.kind] ?? evt.kind}</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 4: Mount `<XpToast/>` once at the root**

In `apps/web/src/App.tsx`, import the component and render it inside the root layout, after the main `<Routes>`/`<Switch>` block (but inside the same root element):

```typescript
import { XpToast } from '~/components/XpToast';

// ... inside the component's return:
//   <>...routes...
//     <XpToast />
//   </>
```

- [ ] **Step 5: Component tests**

Create `apps/web/src/components/__tests__/XpToast.test.tsx`:

```typescript
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { XpToast } from '../XpToast';
import { xpEventBus } from '~/lib/xp-event-bus';

describe('XpToast', () => {
  it('renders the XP-only variant', async () => {
    render(<XpToast />);
    act(() => {
      xpEventBus.publish({ xpAwarded: 25, kind: 'quiz_completed', newLevel: null, newBadges: [] });
    });
    expect(await screen.findByText('+25 XP')).toBeInTheDocument();
    expect(screen.getByText('Cuestionario completado')).toBeInTheDocument();
  });

  it('renders the badge variant', async () => {
    render(<XpToast />);
    act(() => {
      xpEventBus.publish({
        xpAwarded: 10,
        kind: 'pulse_submitted',
        newLevel: null,
        newBadges: [{ slug: 'first-pulse', title: 'Voz registrada', tier: 'bronze' }],
      });
    });
    expect(await screen.findByText('Nueva insignia: Voz registrada')).toBeInTheDocument();
  });

  it('renders the level-up variant', async () => {
    render(<XpToast />);
    act(() => {
      xpEventBus.publish({ xpAwarded: 50, kind: 'goal_completed', newLevel: 3, newBadges: [] });
    });
    expect(await screen.findByText('¡Subiste al Nivel 3!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run web tests**

```bash
pnpm --filter @v2/web test
```

Expected: all green.

- [ ] **Step 7: Full verify**

```bash
pnpm verify
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/xp-event-bus.ts apps/web/src/lib/api.ts apps/web/src/components/XpToast.tsx apps/web/src/App.tsx apps/web/src/components/__tests__/XpToast.test.tsx
git commit -m "$(cat <<'EOF'
feat(web): XpEventBus + response interceptor + XpToast

Tiny singleton bus that the cookie-first API client publishes onto
whenever a response data payload carries an xpEvent. The interceptor
strips xpEvent before returning, so feature callers never see it.
<XpToast/> mounts once at the root and renders three variants
(XP-only, level-up, new-badge) with Framer Motion. Auto-dismiss 4s,
queue up to 3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 10: Web — MiPerfil page + Header XPChip

**Files:**
- Create: `apps/web/src/pages/MiPerfil/index.tsx` (the route component, < 150 LOC)
- Create: `apps/web/src/pages/MiPerfil/sections/HeaderSection.tsx`
- Create: `apps/web/src/pages/MiPerfil/sections/BadgesSection.tsx`
- Create: `apps/web/src/pages/MiPerfil/sections/ActivitySection.tsx`
- Create: `apps/web/src/components/XPChip.tsx`
- Modify: `apps/web/src/components/Header.tsx` (insert `<XPChip />` between `NotificationBell` and "Hola, …")
- Modify: `apps/web/src/App.tsx` (add lazy route for `/mi-perfil`)
- Create: `apps/web/src/lib/queries/gamification.ts` (typed React Query hooks: `useGamificationMe`, `useBadges`, `useChallenges`, `useLeaderboard`)
- Create: `apps/web/src/pages/MiPerfil/__tests__/HeaderSection.test.tsx`

- [ ] **Step 1: Build the typed query hooks**

Create `apps/web/src/lib/queries/gamification.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';

import { api } from '~/lib/api';

export interface GamificationMe {
  xp: number;
  level: number;
  streakDays: number;
  longestStreakDays: number;
  xpIntoLevel: number;
  xpForCurrent: number;
  xpForNext: number;
  badges: {
    slug: string;
    title: string;
    description: string;
    tier: string;
    iconUrl: string | null;
    earnedAt: string;
  }[];
  recentActivity: {
    id: number;
    kind: string;
    xpAwarded: number;
    activityDate: string;
    createdAt: string;
    payload: unknown;
  }[];
  inProgressChallenges: {
    progressId: number;
    challengeId: number;
    slug: string;
    title: string;
    description: string;
    cadence: string;
    xpReward: number;
    stepsCompleted: unknown;
    status: string;
  }[];
}

export interface BadgeEntry {
  id: number;
  slug: string;
  title: string;
  description: string;
  tier: string;
  iconUrl: string | null;
}

export interface LeaderboardRow {
  rank: number;
  xp: number;
  userId: number;
  displayName: string;
}

export interface ChallengeEntry {
  id: number;
  slug: string;
  title: string;
  description: string;
  cadence: 'daily' | 'weekly' | 'monthly' | 'one_time';
  xpReward: number;
  badgeId: number | null;
  steps: { id: number; title: string; description: string | null; orderIndex: number; xpReward: number }[];
  progress: { stepsCompleted: unknown; status: string } | null;
}

export function useGamificationMe(enabled = true) {
  return useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: () => api.get<GamificationMe>('/api/gamification/me'),
    enabled,
    staleTime: 60_000,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: () => api.get<{ badges: BadgeEntry[] }>('/api/gamification/badges'),
    staleTime: 5 * 60_000,
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ['gamification', 'challenges'],
    queryFn: () => api.get<{ challenges: ChallengeEntry[] }>('/api/gamification/challenges'),
    staleTime: 60_000,
  });
}

export function useLeaderboard(period: 'weekly' | 'all_time') {
  return useQuery({
    queryKey: ['gamification', 'leaderboard', period],
    queryFn: () =>
      api.get<{ period: string; periodStart: string | null; rows: LeaderboardRow[] }>(
        `/api/gamification/leaderboard?period=${period}`,
      ),
    staleTime: 5 * 60_000,
  });
}
```

- [ ] **Step 2: Build the section components**

Create `apps/web/src/pages/MiPerfil/sections/HeaderSection.tsx`:

```typescript
import { Flame } from 'lucide-react';

import type { GamificationMe } from '~/lib/queries/gamification';

interface Props {
  data: GamificationMe;
  displayName: string;
}

export function HeaderSection({ data, displayName }: Props) {
  const pct = data.xpForNext > data.xpForCurrent
    ? Math.round(((data.xp - data.xpForCurrent) / (data.xpForNext - data.xpForCurrent)) * 100)
    : 100;
  const xpRemaining = Math.max(0, data.xpForNext - data.xp);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h1 className="font-serif text-2xl font-semibold">Hola, {displayName.split(' ')[0]}</h1>
      <div className="mt-4 flex items-baseline gap-4">
        <div className="text-sm text-muted-foreground">Nivel</div>
        <div className="text-3xl font-semibold tabular-nums">{data.level}</div>
        <div className="ml-auto text-2xl font-mono tabular-nums">{data.xp.toLocaleString('es-AR')} XP</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-iris-violet" style={{ width: `${String(pct)}%` }} aria-label={`${String(pct)}% al siguiente nivel`} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{xpRemaining.toLocaleString('es-AR')} XP para nivel {data.level + 1}</div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Flame className="h-4 w-4 text-iris-violet" />
        <span>Racha de {data.streakDays} días · Récord: {data.longestStreakDays}</span>
      </div>
    </section>
  );
}
```

Create `apps/web/src/pages/MiPerfil/sections/BadgesSection.tsx`:

```typescript
import { Award } from 'lucide-react';

import type { GamificationMe } from '~/lib/queries/gamification';

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold: 'text-yellow-300',
  platinum: 'text-cyan-200',
};

export function BadgesSection({ badges }: { badges: GamificationMe['badges'] }) {
  if (badges.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="font-serif text-lg font-semibold">Insignias</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Todavía no ganaste ninguna. Empezá con tu diagnóstico ciudadano o un cuestionario.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="font-serif text-lg font-semibold">Insignias ({badges.length})</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((b) => (
          <li key={b.slug} className="flex flex-col items-center gap-2 rounded-lg border border-white/5 p-3 text-center">
            <Award className={`h-8 w-8 ${TIER_COLORS[b.tier] ?? 'text-foreground'}`} />
            <div className="text-xs font-semibold">{b.title}</div>
            <div className="text-[10px] text-muted-foreground">{b.description}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Create `apps/web/src/pages/MiPerfil/sections/ActivitySection.tsx`:

```typescript
import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';

import type { GamificationMe } from '~/lib/queries/gamification';

const KIND_LABELS: Record<string, string> = {
  civic_assessment_completed: 'Diagnóstico ciudadano',
  goal_completed: 'Meta cumplida',
  quiz_completed: 'Cuestionario completado',
  pulse_submitted: 'Pulso enviado',
  propuesta_submitted: 'Propuesta publicada',
  community_post_created: 'Post compartido',
  content_read: 'Artículo leído',
};

export function ActivitySection({ items }: { items: GamificationMe['recentActivity'] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="font-serif text-lg font-semibold">Actividad reciente</h2>
        <p className="mt-2 text-sm text-muted-foreground">Tu actividad va a aparecer acá.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="font-serif text-lg font-semibold">Actividad reciente</h2>
      <ul className="mt-3 divide-y divide-white/5">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              <span className="font-semibold text-iris-violet">+{it.xpAwarded} XP</span>{' '}
              — {KIND_LABELS[it.kind] ?? it.kind}
            </span>
            <span className="text-xs text-muted-foreground">
              hace {formatDistanceToNowStrict(new Date(it.createdAt), { locale: es })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Build the page root**

Create `apps/web/src/pages/MiPerfil/index.tsx`:

```typescript
import { Redirect } from 'wouter';

import { useAuth } from '~/lib/auth';
import { useGamificationMe } from '~/lib/queries/gamification';

import { ActivitySection } from './sections/ActivitySection';
import { BadgesSection } from './sections/BadgesSection';
import { HeaderSection } from './sections/HeaderSection';

export default function MiPerfil() {
  const { user, isLoading } = useAuth();
  const { data, isLoading: meLoading } = useGamificationMe(Boolean(user));

  if (isLoading || meLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Cargando…</div>;
  }
  if (!user) return <Redirect to="/ingresar" />;
  if (!data) return <div className="container mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">No pudimos cargar tu perfil.</div>;

  return (
    <main className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <HeaderSection data={data} displayName={user.name} />
      <BadgesSection badges={data.badges} />
      <ActivitySection items={data.recentActivity} />
    </main>
  );
}
```

- [ ] **Step 4: Build XPChip**

Create `apps/web/src/components/XPChip.tsx`:

```typescript
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';

import { useGamificationMe } from '~/lib/queries/gamification';
import { xpEventBus } from '~/lib/xp-event-bus';

export function XPChip() {
  const { data } = useGamificationMe(true);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const unsub = xpEventBus.subscribe(() => {
      setPulse((p) => p + 1);
    });
    return unsub;
  }, []);

  if (!data) return null;

  return (
    <Link
      href="/mi-perfil"
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10"
    >
      <motion.span
        key={pulse}
        initial={pulse === 0 ? false : { scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1"
      >
        <Zap className="h-3 w-3 text-iris-violet" />
        <span className="font-semibold tabular-nums">Nv{data.level}</span>
        <span className="text-muted-foreground">· {data.xp.toLocaleString('es-AR')} XP</span>
      </motion.span>
    </Link>
  );
}
```

- [ ] **Step 5: Slot XPChip into the Header**

In `apps/web/src/components/Header.tsx`, modify the authed-desktop block. Replace:

```tsx
<NotificationBell enabled={true} />
<span className="text-xs text-muted-foreground">Hola, {user.name.split(' ')[0]}</span>
```

with:

```tsx
<NotificationBell enabled={true} />
<XPChip />
<span className="text-xs text-muted-foreground">Hola, {user.name.split(' ')[0]}</span>
```

And add the import at the top:

```typescript
import { XPChip } from '~/components/XPChip';
```

- [ ] **Step 6: Register the route in App.tsx**

In `apps/web/src/App.tsx`, add a lazy import:

```typescript
const MiPerfil = lazy(() => import('~/pages/MiPerfil'));
```

…and a route entry inside the existing wouter `<Switch>`:

```tsx
<Route path="/mi-perfil" component={MiPerfil} />
```

- [ ] **Step 7: Invalidate `['gamification','me']` on xpEvent**

The `XPChip` only updates when the React Query cache refetches. Add invalidation in the same root spot where `xpEventBus` is wired. The cleanest location is `apps/web/src/App.tsx`. Add this effect (importing the query client):

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { xpEventBus } from '~/lib/xp-event-bus';

function GamificationCacheBridge() {
  const queryClient = useQueryClient();
  useEffect(() => {
    return xpEventBus.subscribe(() => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'me'] });
    });
  }, [queryClient]);
  return null;
}
```

And render `<GamificationCacheBridge />` once at the same root level as `<XpToast />`.

- [ ] **Step 8: Component test for HeaderSection**

Create `apps/web/src/pages/MiPerfil/__tests__/HeaderSection.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeaderSection } from '../sections/HeaderSection';

import type { GamificationMe } from '~/lib/queries/gamification';

const FIXTURE: GamificationMe = {
  xp: 250,
  level: 2,
  streakDays: 5,
  longestStreakDays: 12,
  xpIntoLevel: 150,
  xpForCurrent: 100,
  xpForNext: 300,
  badges: [],
  recentActivity: [],
  inProgressChallenges: [],
};

describe('HeaderSection', () => {
  it('shows level, XP, and streak', () => {
    render(<HeaderSection data={FIXTURE} displayName="Juana Pérez" />);
    expect(screen.getByText(/Hola, Juana/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('250 XP')).toBeInTheDocument();
    expect(screen.getByText(/Racha de 5 días/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 9: Run web tests**

```bash
pnpm --filter @v2/web test
```

Expected: green, including the new test.

- [ ] **Step 10: Smoke-test the page**

```bash
pnpm --filter @v2/api dev &
pnpm --filter @v2/web dev
```

Open `http://localhost:5173/mi-perfil` while logged in. Verify: header card shows level/XP/streak, badges section renders (or empty state if no badges), recent activity lists the user's last grants. XPChip appears in the header.

(Stop the dev servers after smoke test.)

- [ ] **Step 11: Full verify**

```bash
pnpm verify
```

- [ ] **Step 12: Commit**

```bash
git add apps/web/src/lib/queries/gamification.ts apps/web/src/pages/MiPerfil apps/web/src/components/XPChip.tsx apps/web/src/components/Header.tsx apps/web/src/App.tsx
git commit -m "$(cat <<'EOF'
feat(web): MiPerfil page + Header XPChip

New /mi-perfil route (auth-required, redirects to /ingresar otherwise)
with three section cards: level/XP/streak header, badges grid, recent
activity. XPChip renders to the right of NotificationBell in the
Header and pulses on every xpEvent. GamificationCacheBridge invalidates
['gamification','me'] in response to bus events so the chip and the
profile page stay fresh without manual refetches.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 11: Web — Leaderboard page

**Files:**
- Create: `apps/web/src/pages/Leaderboard.tsx`
- Modify: `apps/web/src/App.tsx` (lazy route `/clasificacion`)

- [ ] **Step 1: Build the page**

Create `apps/web/src/pages/Leaderboard.tsx`:

```typescript
import { useState } from 'react';

import { useLeaderboard } from '~/lib/queries/gamification';
import { cn } from '~/lib/utils';

type Period = 'weekly' | 'all_time';

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { data, isLoading } = useLeaderboard(period);

  return (
    <main className="container mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="font-serif text-3xl font-semibold">Clasificación</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quiénes están moviendo la aguja cívica.</p>
      </header>

      <div className="inline-flex rounded-lg border border-white/10 p-1">
        <TabButton active={period === 'weekly'} onClick={() => setPeriod('weekly')}>Esta semana</TabButton>
        <TabButton active={period === 'all_time'} onClick={() => setPeriod('all_time')}>Histórico</TabButton>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Cargando…</div>
      ) : (data?.rows.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
          {period === 'weekly'
            ? 'Todavía no hay actividad esta semana — sé el primero.'
            : 'Todavía no hay nadie en la tabla histórica.'}
        </div>
      ) : (
        <ol className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          {(data?.rows ?? []).map((row) => (
            <li key={row.userId} className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-b-0">
              <span className="flex items-center gap-4">
                <span className="w-8 text-right font-mono text-sm text-muted-foreground tabular-nums">{row.rank}</span>
                <span className="text-sm font-semibold">{row.displayName}</span>
              </span>
              <span className="font-mono text-sm tabular-nums">{row.xp.toLocaleString('es-AR')} XP</span>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-iris-violet text-white' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Register the route**

In `apps/web/src/App.tsx`:

```typescript
const Leaderboard = lazy(() => import('~/pages/Leaderboard'));
```

```tsx
<Route path="/clasificacion" component={Leaderboard} />
```

- [ ] **Step 3: Smoke-test**

```bash
pnpm --filter @v2/web dev
```

Open `http://localhost:5173/clasificacion`. Verify: tab switch between "Esta semana" and "Histórico", empty state when no data, rows render when present.

- [ ] **Step 4: Full verify**

```bash
pnpm verify
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/Leaderboard.tsx apps/web/src/App.tsx
git commit -m "$(cat <<'EOF'
feat(web): Leaderboard page (/clasificacion)

Public read-only page with two tabs (Esta semana / Histórico) backed
by /api/gamification/leaderboard. Empty state when no rows; numbered
list with displayName + XP otherwise.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

### Task 12: Web — Desafios page

**Files:**
- Create: `apps/web/src/pages/Desafios.tsx`
- Modify: `apps/web/src/lib/queries/gamification.ts` (add mutations `useStartChallenge`, `useAdvanceChallenge`)
- Modify: `apps/web/src/App.tsx` (lazy route `/desafios`)

- [ ] **Step 1: Extend the queries module with mutations**

Append to `apps/web/src/lib/queries/gamification.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useCsrfToken } from '~/lib/csrf'; // existing helper

export function useStartChallenge() {
  const qc = useQueryClient();
  const csrfToken = useCsrfToken();
  return useMutation({
    mutationFn: async (slug: string) => {
      return api.post<{ progress: { id: number; status: string } }>(
        `/api/gamification/challenges/${slug}/start`,
        {},
        { csrfToken },
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gamification', 'challenges'] });
      void qc.invalidateQueries({ queryKey: ['gamification', 'me'] });
    },
  });
}

export function useAdvanceChallenge() {
  const qc = useQueryClient();
  const csrfToken = useCsrfToken();
  return useMutation({
    mutationFn: async (input: { slug: string; orderIndex: number }) => {
      return api.post<{ progress: { id: number; status: string }; completed: boolean }>(
        `/api/gamification/challenges/${input.slug}/advance`,
        { orderIndex: input.orderIndex },
        { csrfToken },
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gamification', 'challenges'] });
      void qc.invalidateQueries({ queryKey: ['gamification', 'me'] });
    },
  });
}
```

(Verify `useCsrfToken` actually exists under `~/lib/csrf`. If the existing helper has a different name/path, adjust the import accordingly — the project already has CSRF wiring; we're not inventing it.)

- [ ] **Step 2: Build the page**

Create `apps/web/src/pages/Desafios.tsx`:

```typescript
import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'wouter';

import { Button } from '~/components/ui/button';
import { useAuth } from '~/lib/auth';
import { useChallenges, useStartChallenge, type ChallengeEntry } from '~/lib/queries/gamification';

const CADENCE_LABELS: Record<ChallengeEntry['cadence'], string> = {
  daily: 'Diarios',
  weekly: 'Semanales',
  monthly: 'Mensuales',
  one_time: 'Una sola vez',
};

const CADENCE_ORDER: ChallengeEntry['cadence'][] = ['daily', 'weekly', 'monthly', 'one_time'];

export default function Desafios() {
  const { user } = useAuth();
  const { data, isLoading } = useChallenges();
  const start = useStartChallenge();

  if (isLoading) {
    return <div className="container mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Cargando…</div>;
  }

  const grouped = new Map<ChallengeEntry['cadence'], ChallengeEntry[]>();
  for (const c of data?.challenges ?? []) {
    if (!grouped.has(c.cadence)) grouped.set(c.cadence, []);
    grouped.get(c.cadence)!.push(c);
  }

  return (
    <main className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <header>
        <h1 className="font-serif text-3xl font-semibold">Desafíos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pequeñas misiones para mover la aguja. Ganás XP por completarlas.
        </p>
      </header>

      {CADENCE_ORDER.map((cadence) => {
        const list = grouped.get(cadence) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={cadence} className="flex flex-col gap-3">
            <h2 className="text-sm uppercase tracking-wide text-muted-foreground">{CADENCE_LABELS[cadence]}</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map((c) => {
                const completedSet = new Set<number>(Array.isArray(c.progress?.stepsCompleted) ? (c.progress!.stepsCompleted as number[]) : []);
                const isDone = c.progress?.status === 'completed';
                const isStarted = c.progress?.status === 'in_progress';
                return (
                  <li key={c.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{c.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                      </div>
                      <span className="rounded-full border border-iris-violet/40 px-2 py-0.5 text-xs text-iris-violet">+{c.xpReward} XP</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {c.steps.map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                          {completedSet.has(s.orderIndex) ? (
                            <CheckCircle2 className="h-4 w-4 text-iris-violet" aria-hidden />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" aria-hidden />
                          )}
                          <span className={completedSet.has(s.orderIndex) ? 'line-through' : ''}>{s.title}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1">
                      {!user ? (
                        <Button asChild size="sm" variant="secondary">
                          <Link href="/registrarse">Registrate para participar</Link>
                        </Button>
                      ) : isDone ? (
                        <span className="text-xs text-muted-foreground">Completado ✓</span>
                      ) : (
                        <Button
                          size="sm"
                          disabled={start.isPending}
                          onClick={() => {
                            start.mutate(c.slug);
                          }}
                        >
                          {isStarted ? 'Continuar' : 'Empezar'}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
```

- [ ] **Step 3: Register the route**

In `apps/web/src/App.tsx`:

```typescript
const Desafios = lazy(() => import('~/pages/Desafios'));
```

```tsx
<Route path="/desafios" component={Desafios} />
```

- [ ] **Step 4: Smoke-test**

```bash
pnpm --filter @v2/web dev
```

Open `http://localhost:5173/desafios`. Verify:
- Anonymous user sees challenges + `Registrate para participar` buttons.
- Authed user sees `Empezar`; clicking it transitions to `Continuar`.
- Completed challenges show `Completado ✓`.

- [ ] **Step 5: Full verify**

```bash
pnpm verify
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/Desafios.tsx apps/web/src/lib/queries/gamification.ts apps/web/src/App.tsx
git commit -m "$(cat <<'EOF'
feat(web): Desafios page (/desafios)

Browses active challenges grouped by cadence (Diarios/Semanales/Una
sola vez). Anonymous users see content + Registrate CTA. Authed users
can start a challenge (idempotent) and watch step completion via the
auto-advance hooks already firing from the API. useStartChallenge /
useAdvanceChallenge mutations invalidate ['gamification','me'] and
['gamification','challenges'] on success.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

---

## Phase 8 — Done definition

After Task 12 lands and CI is green on `main`:

- 4 ADRs accepted at `v2/docs/adr/0003`..`0006`.
- 11 badges seeded, 5 challenges seeded with their steps.
- `/api/gamification/{me,badges,challenges,leaderboard}` + `/challenges/:slug/{start,advance}` mounted, integration-tested.
- 4 new XP hooks live (pulse, propuesta, community-post, blog-view), each with dedup + auto-badge behavior.
- Streak engine running inside `recordEvent`; streak-7 / streak-30 badges auto-awarded.
- Level curve in `@v2/shared`, computed on every grant; `xpEvent` carries `newLevel` on crossings.
- Ranking cron computing weekly + all_time global top-50 every 15 min (via Vercel cron entry).
- Web: `/mi-perfil`, `/clasificacion`, `/desafios` pages; XPChip in the header; XpToast queued at the root and pulsing on every grant.
- All 12 commits pushed to `main`, every commit leaves `pnpm verify` green.

---

## Self-review notes (verified before plan was finalized)

- **Spec coverage:** ADRs (4), badges (5 new = 11 total), challenges (5), leaderboard (weekly + all_time), XP hooks (4 new), streak engine, level curve, ranking cron, MiPerfil/Leaderboard/Desafios pages, XPChip, XpToast, xpEvent envelope — every spec section is implemented by at least one task.
- **Method/type consistency:** `GamificationService.safeRecord` / `recordEvent` referenced consistently. `xpEvent` shape (`xpAwarded`, `kind`, `newLevel`, `newBadges`) is identical across service, interceptor, toast, and tests. `useGamificationMe` / `useBadges` / `useChallenges` / `useLeaderboard` / `useStartChallenge` / `useAdvanceChallenge` defined in Task 10's `queries/gamification.ts` and reused in Tasks 11/12.
- **Scope guards:** content_read is blog-only this phase (ensayos read tracking is deferred until ensayos has its own HTTP slice — flagged explicitly). `PulsoRepository.createProposal` is added on demand if missing, against the actual schema name discovered at implementation time.
- **No placeholders:** every step contains the actual file content or exact command. No "TBD", no "implement similarly". Every test step shows the test code; every implementation step shows the implementation code.
