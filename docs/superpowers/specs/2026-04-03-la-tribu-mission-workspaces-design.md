# La Tribu — Mission Workspaces Reconversion

**Date:** 2026-04-03
**Status:** Implemented
**Scope:** Complete the mission-centric reconversion of La Tribu (Community page) with API plumbing, mission detail pages, and citizen participation flow.

---

## Context

La Tribu (`/community`) is being reconverted from a generic community board into a mission-driven civic workspace. Work already done (uncommitted on `main`):

- **Type system:** `MissionSlug`, `TemporalOrder`, `InitiativeState`, `CitizenRole` in `shared/strategic-initiatives.ts`
- **Mission registry:** `shared/mission-registry.ts` — 5 national missions with full metadata (whatHurts, whatWeGuarantee, citizenCanDo, cellCanDo, KPIs, plans, temporal milestones)
- **Frontend metadata:** `client/src/lib/initiative-utils.ts` — `MISSION_META`, `MISSION_ORDER`, `TEMPORAL_META`, `STATE_META`, `CITIZEN_ROLE_META`, helper functions
- **Schema:** `shared/schema.ts` — `missionSlug` column on `communityPosts`, `memberCount` field
- **Community.tsx:** "Misiones Nacionales" hero section with 5 clickable cards, mission post query, filter logic
- **Migration script:** `scripts/migrate-community-mission.ts` (adds `mission_slug` column)
- **Seed script:** `scripts/seed-missions.ts` (creates 5 mission posts with milestones and citizen tasks)
- **Components:** `CitizenRoleBadge.tsx` for role display
- **Backup:** `Community.backup.tsx` preserves pre-reconversion state

### What's missing

1. API doesn't expose `missionSlug`/`memberCount` in responses
2. DB migration and seed likely not run against Neon
3. Mission cards link to generic `InitiativeDetail` — no mission-specific experience
4. Most strategic initiatives lack mission-centric classification fields
5. No citizen participation flow (join mission, pick role, claim tasks)

---

## Phase B: API + DB Completion

### B1. Run migration and seed

- Execute `scripts/migrate-community-mission.ts` against Neon (adds `mission_slug` column)
- Execute `scripts/seed-missions.ts` to create 5 mission workspace posts with milestones and citizen tasks
- Verify with `SELECT id, title, mission_slug FROM community_posts WHERE type = 'mission'`

### B2. API wiring (`api/index.mjs`)

- Include `missionSlug` and `memberCount` in community post GET responses (both list `GET /api/community` and detail `GET /api/community/:id`)
- Add `GET /api/missions` endpoint:
  - Returns the 5 missions from DB (`type = 'mission'`) joined with static metadata from mission-registry
  - Response shape: `{ slug, number, label, postId, memberCount, milestoneCount, taskCount }`
  - Sort by mission number
- When `?type=mission`, sort results by mission number (not createdAt)

### B3. Classify all strategic initiatives

- Fill in mission-centric fields for every initiative in `shared/strategic-initiatives.ts`:
  - `missionSlug` (required), `secondaryMissionSlug` (optional)
  - `temporalOrder`: emergencia | transicion | permanencia
  - `priority`: alta | media | diferida
  - `state`: verde | ambar | rojo
  - `stateDecision`: short text
  - `citizenRoles`: array from CitizenRole
  - `citizenAsk`, `mainRisk`, `stateCapacity`, `socialCapacity`
- Currently done: PLANAGRO, PLAN24CN. Remaining: all others.
- Source: `Iniciativas Estrategicas/MATRIZ_MISIONES_Y_PLANES_ES.md` and `PLAN_MAESTRO_RECONSTRUCCION_ARGENTINA_ES.md`

---

## Phase A: Mission Workspaces

### A1. New route and page

- Add `/mision/:slug` route in `App.tsx` pointing to lazy-loaded `MisionDetalle`
- Update mission card `onClick` in `Community.tsx` to navigate to `/mision/${slug}` (slug-based, not post ID)
- `MisionDetalle.tsx` resolves the mission by slug: static data from `MISSIONS` registry + dynamic data from API

### A2. MisionDetalle — three-scroll structure

Following the same pattern as LifeAreaDetail (Donde estas / Que podes hacer / Como vas):

**Section 1: "Donde Duele"**
- Mission `whatHurts` narrative as hero text
- Shock stats row: member count, active tasks, milestones completed
- Available citizen roles as `CitizenRoleBadge` components
- "Sumarme a esta mision" CTA (or "Ya sos parte" if member)

**Section 2: "Que Hacemos"**
- `MissionTimeline.tsx` — milestones grouped by temporal phase (Emergencia 0-90d / Transicion 3-24m / Consolidacion 1-3a) with status indicators (pending/in-progress/complete)
- Linked PLANs: cards for each strategic initiative where `missionSlug` matches, using `getInitiativesByMission()`, linking to `/iniciativas/:slug`
- `MissionTaskBoard.tsx` — active citizen tasks with title, description, priority badge, "Tomar tarea" button for logged-in members

**Section 3: "Como Vamos"**
- KPI names from mission registry displayed as placeholder cards (no real values yet)
- Member list with roles (from membership data)
- `whatWeWontPromiseYet` as transparency block
- `pauseConditions` as guardrails display

### A3. New components

**`MissionTimeline.tsx`**
- Props: `milestones: Milestone[]` (from API), `mission: MissionDefinition`
- Groups milestones by temporal label
- Each milestone: title, description, status dot (pending=gray, in-progress=amber, complete=green)
- Uses existing GlassCard + SmoothReveal

**`MissionTaskBoard.tsx`**
- Props: `tasks: Task[]`, `userMembership: Membership | null`
- Grid of task cards with priority color, description, assignee if claimed
- "Tomar tarea" calls `POST /api/community/:postId/tasks/:taskId/claim`
- "Completar" calls `PATCH /api/community/:postId/tasks/:taskId` with `status: 'done'`

---

## Phase C: Citizen Participation (woven into Phase A)

### C1. Join mission with role

- "Sumarme" button on MisionDetalle triggers a role-selection modal
- Modal shows the mission's `citizenRoles` as selectable badges with descriptions from `CITIZEN_ROLE_META`
- On confirm: calls existing membership join endpoint, passing `role` in metadata/settings
- API: store selected role in `community_members.permissions` JSON or add a `role` text column if cleaner

### C2. Task claim and complete

- API endpoints:
  - `POST /api/community/:postId/tasks/:taskId/claim` — sets assignee to current user, status to 'in-progress'
  - `PATCH /api/community/:postId/tasks/:taskId` — update status (done/todo), only by assignee or post owner
- Only mission members can claim tasks
- A user can only have 3 active (in-progress) tasks per mission to prevent hoarding

### C3. Membership role display

- On MisionDetalle member list, show each member's chosen role badge
- On La Tribu mission cards, show role distribution as mini dots or counts

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `client/src/pages/MisionDetalle.tsx` | Mission workspace page (3-section scroll) |
| `client/src/components/MissionTimeline.tsx` | Temporal milestones timeline |
| `client/src/components/MissionTaskBoard.tsx` | Citizen task board with claim/complete |

### Modified files
| File | Changes |
|------|---------|
| `api/index.mjs` | Expose missionSlug/memberCount, `GET /api/missions`, task claim/complete endpoints |
| `shared/schema.ts` | Role field on memberships if needed |
| `shared/strategic-initiatives.ts` | Classify all remaining initiatives with mission fields |
| `client/src/App.tsx` | Add `/mision/:slug` route |
| `client/src/pages/Community.tsx` | Update mission card onClick to slug-based URL |

### Untouched
| File | Reason |
|------|--------|
| `shared/mission-registry.ts` | Already complete |
| `client/src/lib/initiative-utils.ts` | Already has all needed metadata/helpers |
| `client/src/components/CitizenRoleBadge.tsx` | Already complete |
| `scripts/migrate-community-mission.ts` | Run as-is |
| `scripts/seed-missions.ts` | Run as-is |

---

## Out of Scope

- KPI actual values / real dashboards (placeholder display only)
- Cell/circle organizational hierarchy
- Notifications for mission activity (existing notification system untouched)
- Role-specific permissions on task visibility
- Mission-to-mission dependency graphs
- Editing or creating new missions from the UI (admin-only via scripts)

---

## Design Constraints

- Dark theme: `bg-[#0a0a0a]`, glassmorphism patterns, existing component library
- Spanish (rioplatense) throughout
- Routing via wouter, data via @tanstack/react-query
- Existing GlassCard, SmoothReveal, PowerCTA, ShockStats, FluidBackground components
- Code-split with React.lazy() for new page
