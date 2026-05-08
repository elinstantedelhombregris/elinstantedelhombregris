# Instructions for an AI agent starting a similar project from scratch

A drop-in instruction set for an AI coding agent (Claude Code, Cursor, etc.) building a new full-stack civic / community / governance platform. Each rule encodes a lesson learned from `REPORT_THIS_PROJECT_IS_UTTER_SHIT.md` — every "do this" prevents a specific failure mode that the previous project actually hit.

Copy this verbatim into the new project's `CLAUDE.md` (or `AGENTS.md` / `.cursorrules`) and treat it as standing law.

---

## How to use this document

- These are **defaults the agent applies without asking**. Departures require a one-line written justification in the PR description.
- Where a rule lists a number (line counts, dep counts, test ratios), treat it as a hard threshold. Crossing it triggers a refactor, not a pass.
- Rules are ordered by how expensive they are to fix later. Earlier rules cost more to violate.

---

# 1. Project layout

## 1.1 One project root, one `package.json`, one `node_modules`
- The repository **is** the app. No nested "real project lives here" subdirectory.
- If you find yourself adding a top-level `client/` next to a `<subdir>/client/`, **stop and ask** — you are about to create the dual-`node_modules` problem that takes years to clean up.

## 1.2 Name the package after the product on day one
- `package.json` `"name"` field gets the real product name in the first commit. Never ship `"name": "rest-express"` or any scaffold default.

## 1.3 Standard top-level directories — no exceptions
```
/
├── apps/web/                  # Frontend (or just /client if monorepo isn't needed yet)
├── apps/api/                  # Backend (or /server)
├── packages/shared/           # Shared types, schemas, validation
├── packages/db/               # Drizzle schema, migrations, repositories
├── docs/                      # Architecture, ADRs, API contracts
├── scripts/
│   ├── build/                 # Build-time scripts only
│   ├── migrations/            # One-shot migration scripts
│   ├── content/               # Content-pipeline scripts
│   └── _archive/              # Historical scripts kept for reference
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```
- If the project is single-app and small, collapse `apps/web` and `apps/api` into `client/` and `server/`. But **pick once on day one** and don't drift.

## 1.4 Files that NEVER get committed
- No `*.backup`, `*.bak`, `*-old.tsx`, `Component.backup.tsx`. Use git history.
- No `*.log` (`backend.log`, `frontend.log`).
- No `*.pid`.
- No `local.db`, `*.sqlite`, `*.db`. Period.
- No build artifacts (`dist/`, `build/`).
- No `.DS_Store`, `Thumbs.db`.
- Add a strict `.gitignore` in commit #1 and verify with `git ls-files | grep -E '\.(log|pid|backup|db|sqlite)$'` before commit #2.

## 1.5 Documentation lives in `docs/`, not in the repo root
- The repo root has `README.md`, `LICENSE`, `CLAUDE.md`, `package.json`, and config files. That's it.
- Business plans, product design docs, manifestos, persona documents → `docs/` or an external knowledge base. Don't ship 339 KB of strategy docs in the repo root.

---

# 2. Database & schema

## 2.1 One database engine. Period.
- Production is Postgres? Local development is **Postgres**, via Docker Compose or Neon branches.
- **Never maintain parallel schemas** for SQLite + Postgres. The drift will eat you. The "easy local fallback" is a trap.
- Neon's branching model (free dev branches in seconds) makes the SQLite-fallback excuse obsolete.

## 2.2 Schema is split by domain from file 1
- One file per domain, not one 3,000-line file with 100 tables.
- ```
  packages/db/schema/
  ├── index.ts          // re-exports
  ├── users.ts
  ├── auth.ts
  ├── content.ts
  ├── community.ts
  ├── ...
  ```
- Drizzle is fine with this. Re-export from `index.ts`.

## 2.3 Hard cap: 200 lines per schema file, 25 tables per domain
- If a domain hits 25 tables, it's two domains. Split before you commit.

## 2.4 Migrations are first-class
- Every schema change ships with a migration in the same PR.
- Never `db:push` against production. Push is for local dev only; prod uses generated migrations.
- Keep a `MIGRATIONS.md` in `packages/db/` documenting any non-trivial migration that requires downtime, backfill, or coordination.

## 2.5 Repository pattern from day one
- **No 5,000-line `storage.ts` god-class.** Ever.
- One repository module per domain:
  ```
  packages/db/repositories/
  ├── users.ts          // export class UsersRepository
  ├── community.ts
  ├── ...
  ```
- Repositories return typed domain objects, not raw rows.
- Hard cap: **400 lines per repository file**. Hit the cap → split.

---

# 3. Backend architecture

## 3.1 Slice by feature, never by layer
- Wrong: `controllers/`, `services/`, `models/`.
- Right: `features/auth/`, `features/community/`, `features/blog/`, each containing routes, handlers, services, validation.

## 3.2 Hard caps on backend file size
- **Routes file: 300 LOC.** No exceptions. Hit the cap → split.
- **Service file: 400 LOC.** Hit the cap → split.
- **Single Express handler: 60 LOC.** Bigger handlers extract a service function.
- **Never** allow a `routes.ts` that registers other route files AND defines its own handlers. Pick one role.

## 3.3 No god-imports
- The "main" routes file should only register feature modules:
  ```ts
  registerAuthRoutes(app);
  registerCommunityRoutes(app);
  registerBlogRoutes(app);
  ```
- It contains zero `app.get(...)` calls of its own.

## 3.4 Validation at the edge, types in the core
- All inbound requests validated with Zod at the route boundary.
- Inside the service layer, you work with `z.infer<typeof X>` types — no `req.body: any`.
- Error messages in the user's UI language (Spanish here, English by default elsewhere). Codify in `shared/validation-messages.ts`.

## 3.5 One AI provider seam
- If the project uses LLMs, define an interface in `services/ai/index.ts`:
  ```ts
  export interface AICompleter {
    complete(messages: Message[], opts?: Opts): Promise<Completion>;
  }
  ```
- Implementations: `services/ai/groq.ts`, `services/ai/anthropic.ts`, etc.
- Pick **one default**. Never dynamic-import an SDK that's in `dependencies` to "make it optional" — it isn't optional, it's lying.

## 3.6 Logger from day one, no `console.*`
- A 50-line `logger.ts` with `debug/info/warn/error` levels, log-level controlled by env var, no-op for `debug/info` in production.
- ESLint rule `no-console: error` from commit #1.
- The "I'll switch to a real logger later" plan never materializes. There will be 363 `console.log`s by month six.

---

# 4. Frontend architecture

## 4.1 Hard caps on page/component size
- **Page component: 300 LOC.** Bigger → extract sections into colocated `pages/Foo/sections/*.tsx`.
- **Reusable component: 200 LOC.** Bigger → split.
- **Hook file: 150 LOC.** Bigger → split into multiple hooks.
- The previous project shipped a 1,644-line page. That's the failure mode this rule prevents.

## 4.2 Route layouts, not flat Switches
- Group routes by section (`/community/*`, `/blog/*`, `/profile/*`).
- Have a `<RequireAuth>` wrapper component on day one, even if it's a one-liner. The day you need to add auth-gating to 30 routes, you'll either have it everywhere or you'll edit 30 files.
- For wouter: nest `<Route>` declarations under section components. For react-router: use nested route layouts.

## 4.3 Code-split every page
- Every route component is `React.lazy(() => import(...))`. Day one, not "when bundle size becomes a problem."

## 4.4 Data fetching pattern
- One pattern across the app. Pick `@tanstack/react-query`. No fetching inside `useEffect` for production data.
- Query keys are typed and centralized in `lib/queryKeys.ts`.
- Mutations use the same pattern with optimistic updates where it matters.

## 4.5 No content blobs in TypeScript
- Long-form content (blog posts, manifestos, course lessons, essays) lives in **Markdown/MDX files**, loaded at build time.
- The previous project had a 3,336-LOC `blogContent.ts` and a 3,781-LOC `strategic-initiatives.ts`. That's content-as-code, and it doesn't scale.
- Set up a content pipeline (e.g., gray-matter + remark) before writing the third hand-coded post.

## 4.6 One language, one design system, picked on day one
- Pick one CSS framework (Tailwind), one component library (shadcn/Radix, MUI, etc.), one icon set (`lucide-react`), one animation library (Framer Motion). Don't mix.
- If a designer asks for a new chart, they get the existing chart library, not a second one.

---

# 5. Authentication & security (non-negotiable)

## 5.1 No JWT in localStorage. Ever.
- Auth tokens live in `httpOnly`, `Secure`, `SameSite=Lax` cookies. From commit #1.
- The "we'll migrate later" plan generates a 12-file refactor that gets deferred. Avoid it forever by starting right.
- Add CSRF protection (double-submit cookie or per-session token) for state-changing requests.

## 5.2 Auth tokens have short TTLs and refresh
- Access token: 15 minutes.
- Refresh token: 30 days, rotation on use, stored in a separate cookie.
- Refresh-token revocation table in Postgres (don't trust JWT alone for revocation).

## 5.3 Password hashing
- `bcrypt` (cost 12+) or `argon2id`. No SHA, no MD5, no plain.
- Rate-limit `/login` separately from general API.

## 5.4 Security middleware ships in PR #1
- `helmet` with a real CSP — no `'unsafe-eval'`, minimal `'unsafe-inline'` (only what Tailwind/styled-components actually need), no third-party CDN allowlists if you can self-host.
- `cors` with an explicit allowlist (no `*` in production).
- `express-rate-limit` general + auth-specific.
- Body size cap of 1 MB by default. Raise per-route only when needed.
- Response redaction for `password`, `token`, `secret` fields in logs.

## 5.5 Secrets management
- `.env.example` checked in with placeholder values.
- `.env` and `.env.local` in `.gitignore` from commit #1.
- Production secrets in the deploy provider's secret store (Vercel, Fly, Railway, etc.) — never in the repo.
- One `JWT_SECRET`, one `SESSION_SECRET`, one `DB_URL`. Rotate on incident.

---

# 6. Testing (non-negotiable)

## 6.1 No code without a test
- The first PR that adds a route also adds an integration test for that route.
- The bar is **one test per route** at minimum: happy path, auth-failure, validation-failure.
- Use Vitest + `supertest` for backend, Vitest + Testing Library for components.

## 6.2 Integration tests hit a real database
- Use a Postgres test branch (Neon's branching is built for this) or a per-suite Docker Postgres container.
- Mocks are for external services you can't reach (Stripe, third-party APIs). Mocks are **not** for your own database.

## 6.3 Tests run in CI, gating merges
- Day-one CI matrix: `lint`, `type-check`, `test:unit`, `test:integration`, `build`. All required.
- The previous project had a `verify:full` that ran content audits but no behavior tests. Don't repeat that.

## 6.4 Test ratio target
- Minimum: 1 integration test per backend route.
- Minimum: 1 component test per non-trivial component (skip for pure presentation).
- Track LOC test:LOC code ratio. Below 1:10 is a red flag.

## 6.5 Smoke test the deployed environment
- A `tests/smoke/production.test.ts` that runs against `staging` and `production` after deploy. Login flow, public-data fetch, write-then-read of a single user object.

---

# 7. Dependencies

## 7.1 Hard cap: 60 production dependencies
- The previous project had **182**. Most projects ship with 20-40.
- Every new `dependencies` entry needs a one-line justification in the PR description.

## 7.2 Pick one of each
- **One** map library. (Don't ship Leaflet AND Maplibre AND deck.gl.)
- **One** chart library. (Don't ship Recharts AND Nivo.)
- **One** email provider. (Don't ship Nodemailer AND Resend.)
- **One** session store. (Don't ship `connect-pg-simple` AND `memorystore`.)
- **One** AI SDK as default; others behind a feature flag if needed.
- **One** blockchain SDK if you actually need blockchain (don't ship `ethers` AND `web3`).

## 7.3 Bundle visualizer on day one
- Add `rollup-plugin-visualizer` and check `dist/stats.html` after every significant feature.
- Set bundle size budgets in CI (`size-limit` or equivalent). Initial budget: 250 KB gzipped JS for the homepage.

## 7.4 Heavy clients require explicit justification
- Three.js, in-browser transformers, AR libraries, blockchain libraries — each ships hundreds of KB to every user.
- Each one requires a written `docs/adr/NNN-why-we-ship-X.md` Architecture Decision Record explaining why and what feature depends on it.

## 7.5 Dependency audit quarterly
- `npm outdated`, `npm audit`, manual review. Drop anything that hasn't been touched in 12 months and isn't load-bearing.

---

# 8. Tooling

## 8.1 ESLint + Prettier from commit #1
- ESLint with `@typescript-eslint/recommended` and `@typescript-eslint/recommended-type-checked`.
- Prettier with project-wide config.
- Pre-commit hook (`lint-staged` + `husky`) runs both on changed files.
- CI runs `lint --max-warnings 0` on all files.

## 8.2 TypeScript `strict: true`, no exceptions
- `tsconfig.json` ships with `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true` from day one.
- ESLint rule `@typescript-eslint/no-explicit-any: error`. **No `: any`.**
- `@ts-ignore` is banned; if you need to bypass the type system, it's `@ts-expect-error` with a comment explaining why and a tracking issue.

## 8.3 `.editorconfig` exists
- Enforces line endings, indent size, trailing whitespace. End of conversation.

## 8.4 Conventional Commits
- `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`. The format is enforced via `commitlint`.
- This makes auto-changelogs and release tooling work.

---

# 9. Build & deploy

## 9.1 The build script is a TypeScript orchestrator, not a bash one-liner
- If `package.json` "build" has more than three `&&`, refactor to `scripts/build/index.ts`.
- Independent steps run in parallel. Failures isolate so you know which step failed.
- Each step is content-hash cached.

## 9.2 Serverless function size budget
- If deploying to Vercel/Lambda, the serverless bundle has a budget: 5 MB max.
- Monitor cold start. Above 1.5 s, split the function or move off serverless.
- Split heavyweight features (AI inference, blockchain, AR) into their own functions or off-platform workers.

## 9.3 No long-running work in serverless functions
- Cron jobs, AI generation pipelines, batch processing → background queue (Inngest, Trigger.dev, BullMQ + Redis).
- A 30-second `maxDuration` will not save you from a slow LLM call.

## 9.4 Staging environment = production environment
- Same database engine, same storage backend, same auth flow. Staging is just a smaller branch.
- Never have "it works locally with SQLite" as a pass condition for a feature.

---

# 10. Repo hygiene

## 10.1 Verify cleanliness before every commit
- The agent runs `git status` and `git ls-files` before committing and refuses to commit:
  - Files matching `*.log`, `*.pid`, `*.backup`, `*.db`, `*.sqlite`
  - Anything in `node_modules/`, `dist/`, `build/`, `coverage/`
  - Files larger than 1 MB unless explicitly approved (use Git LFS for assets)

## 10.2 No "removed" comments, no zombie code
- If code is deleted, it's deleted. No `// removed for now`. Git history is the archive.
- Unused imports, dead code paths, `if (false)` blocks → removed in the same PR they become dead.

## 10.3 Scripts are organized and documented
- Every script in `scripts/` has a one-line header comment explaining its purpose and when it should be run.
- Migration scripts that have been applied move to `scripts/_archive/` within 30 days.

## 10.4 Single source of truth for environment variables
- `env.example` is exhaustive: every variable the app reads is listed with a description.
- No "secret env var nobody knows about" — the codebase has one helper that reads env, and it complains loudly if a required var is missing.

---

# 11. Process & workflow

## 11.1 Spec → plan → implementation
- Non-trivial features ship in three stages:
  1. **Spec** in `docs/specs/YYYY-MM-DD-feature-name.md` — the why and what.
  2. **Plan** in `docs/plans/YYYY-MM-DD-feature-name.md` — numbered tasks, each with verification.
  3. **Implementation** — one PR per task or per logically grouped set of tasks.
- This was the previous project's workflow and it was the *good* part. Keep it.

## 11.2 PRs stay small
- Target: <400 LOC of diff per PR (excluding generated code, snapshots, lock files).
- A 2,000-line PR isn't a feature, it's a takeover. Slice it.

## 11.3 ADRs for non-obvious choices
- `docs/adr/0001-why-postgres.md`, `docs/adr/0002-why-wouter-not-react-router.md`, etc.
- Three sentences minimum: context, decision, consequences. Future-you (and future-AI) will thank you.

## 11.4 The agent does not delete user data without confirmation
- Migrations that drop columns, scripts that wipe tables, force-pushes to shared branches → require an explicit `confirm: true` flag or human approval.
- "I assumed it was safe" is the agent equivalent of `git push --force` to main.

## 11.5 Deferred work goes into the issue tracker, not into memory
- "We'll do X post-launch" → opens an issue with a deadline, not a comment in a Markdown file titled "Post-launch follow-ups."
- An issue with a milestone gets done. A note in MEMORY.md gets forgotten.

---

# 12. AI-agent-specific guardrails

These are rules for the AI agent itself, not for the codebase.

## 12.1 Read CLAUDE.md every session
- Before any non-trivial action, the agent re-reads `CLAUDE.md` and the most recent ADR. Project memory is not a substitute for the source-of-truth document.

## 12.2 Verify before claiming completion
- Before saying "done":
  - Run `npm run lint`, `npm run type-check`, `npm run test`.
  - Paste the actual output.
  - If a test was added, run it specifically and confirm it passes.
- "I think this works" without verification is unacceptable.

## 12.3 No silent dependency additions
- If a task seems to require a new dependency, the agent **stops and asks**. Adding `lodash`, `axios`, or any of the heavy libraries listed in §7.4 without confirmation is a violation.

## 12.4 No silent destructive actions
- The agent does not run `git reset --hard`, `git push --force`, `rm -rf`, `DROP TABLE`, or equivalent without explicit approval.
- The agent does not delete files outside its working set without listing them and asking.

## 12.5 When the agent disagrees with the human
- It says so, in one paragraph, and then does what the human said.
- Performative agreement ("great point!") followed by sycophantic implementation is worse than disagreement.

## 12.6 When the agent is unsure
- It says "I don't know" or "I need to verify X first." It does not fabricate file paths, function names, or library APIs.
- Before recommending a function/file/flag from memory, it greps for the current name. The codebase changes faster than memory does.

---

# Quick checklist for the very first commit

Before the first `git commit`, verify all of the below:

- [ ] `package.json` `"name"` is the real product name
- [ ] `.gitignore` includes `*.log`, `*.pid`, `*.backup`, `*.db`, `*.sqlite`, `node_modules/`, `dist/`, `.env*`
- [ ] `tsconfig.json` has `"strict": true`
- [ ] ESLint config exists with `no-explicit-any: error` and `no-console: error`
- [ ] Prettier config exists
- [ ] `.editorconfig` exists
- [ ] CI config (`.github/workflows/ci.yml`) runs lint, type-check, test, build
- [ ] `README.md` explains how to run the project locally
- [ ] `CLAUDE.md` (this document, or a tailored version) is checked in
- [ ] `env.example` is checked in; `.env` is NOT
- [ ] Logger module exists (no raw `console.*`)
- [ ] Auth uses httpOnly cookies (no localStorage tokens)
- [ ] Drizzle schema is split by domain, not in one file
- [ ] Repository pattern is in place (no monolithic storage class)
- [ ] At least one integration test exists, hitting a real Postgres database
- [ ] One map library, one chart library, one email provider — picked

If any box is unchecked, fix it before merging the bootstrap PR. **Bootstrap debt is the most expensive kind.** What you get wrong on day one becomes the path of least resistance forever.

---

# Final note for the agent

The last project this document was distilled from is a **good project carrying bad infrastructure**. The mission, the writing, the design vision were all serious work. What dragged it down was infrastructure decisions made under time pressure: dual schemas to "keep local dev easy," tokens in localStorage to "ship the auth flow today," god-files because "let's just add this one more route here for now."

Each decision saved 30 minutes and cost months. **Your job is to refuse those trades.** When the human says "just add it to `routes.ts`, we'll split later" — the answer is no, we split now, because there is no later that's cheaper than now.

You are the discipline the previous project lacked. Be that.
