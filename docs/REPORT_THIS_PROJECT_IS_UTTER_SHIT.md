# This project is utter shit

A comprehensive, blunt-but-fair analysis of `El Instante del Hombre Gris / SocialJusticeHub` as it stands on **2026-05-07**.

The title is the user's words, not a real value judgment of the mission. The platform exists for a serious cause (¡BASTA! popular governance for Argentina). The *codebase*, however, is carrying an enormous amount of drag, and pretending otherwise would be unhelpful. What follows is everything that's wrong, ranked by severity, with concrete remediation for each item.

---

## TL;DR

- **~123,000 lines of app code, 3 tests.** The `tests/` directory has exactly two smoke files and one unit test for pagination. There is no behavioural safety net.
- **Three god-files own the entire backend:** `server/storage.ts` (5,516 LOC), `server/routes.ts` (5,317 LOC), `shared/schema.ts` (3,337 LOC, 101 tables). Touching anything risks blast radius across half the app.
- **Two parallel database schemas drift apart in the open** — Postgres has 101 tables, SQLite has 86. Nobody is enforcing parity.
- **JWT lives in `localStorage` in 12 places** — XSS-exposed and tracked as a "post-launch follow-up" instead of being fixed.
- **Two `node_modules` directories** (1.4 GB + 170 MB), two `vite.config.ts` files (one is empty), and a `local.db` committed despite `.gitignore` saying `*.db`.
- **No ESLint, no Prettier, no `.editorconfig`**, and 236 `: any` annotations in TypeScript.
- **182 npm dependencies** include three different mapping stacks (Leaflet, Maplibre, deck.gl), full Three.js, in-browser ML (`@xenova/transformers`), AR.js, ethers, and web3 — almost certainly more than the product needs.
- **Backup files** (`Community.backup.tsx`, `LaVision.tsx.backup`) and **log files** (`backend.log`, `frontend.log`, `backend.pid`) are committed to source control.

This is a project that grew organically and never paid down. The mission is intact; the engineering substrate is bloated, undertested, and structurally fragile. None of the issues below are unfixable. Most can be cleared in 1–3 day chunks of disciplined work.

---

## How big this codebase actually is

| Layer | LOC | Notes |
|---|---|---|
| `client/src/**` | 82,871 | 59 page components, 71 routes |
| `server/**` | 22,472 | 32 files, 258 Express handlers |
| `shared/**` | 17,296 | 101-table Drizzle schema + content blobs |
| **Total app code** | **122,639** | |
| Test files | 3 | `auth-flow.test.ts`, `harness.smoke.test.ts`, `pagination.test.ts` |
| Scripts dir | 73 files | A graveyard of one-shot migrations and content tools |
| `node_modules` | 1.4 GB (`SocialJusticeHub/`) + 170 MB (root) | Two installs, accidentally |
| Dependencies | 182 in `package.json` | Many of them whales |

A two-person engineering team would not own this surface area comfortably. A solo maintainer with AI assistance is going to feel it every week.

---

# Critical issues (fix or feel pain)

## 1. Three god-files run the entire backend

| File | LOC | Role |
|---|---|---|
| `server/storage.ts` | **5,516** | Single `DatabaseStorage` class containing data-access for nearly every feature |
| `server/routes.ts` | **5,317** | 169 handlers in one file, on top of feature modules it imports |
| `shared/schema.ts` | **3,337** | 101 `pgTable` definitions in one flat file |

These are not "large files" — they are the **entire backend folded into three pages**. Every new feature pushes them larger. Every refactor risks unintended changes. Type inference slows down. Code review becomes impossible. Git diffs become unreadable.

**Why it's bad:** Cognitive load is monotonically increasing, and there is no architectural seam where a new contributor (human or AI) can specialize. The fact that there *are* per-feature `routes-*.ts` modules makes this worse, not better — `routes.ts` is now the 5,300-line *exception* to a pattern the project already started.

**Fix path:**
1. Slice `routes.ts` by domain (blog, community, profile, mandate, AR, blockchain, gamification…) into `routes-*.ts` modules. The pattern already exists — finish it.
2. Split `storage.ts` into per-domain repository modules (`storage/users.ts`, `storage/blog.ts`, `storage/initiatives.ts`, `storage/mandato.ts`…). The single `DatabaseStorage` class is the actual root cause of the bloat.
3. Split `shared/schema.ts` by domain. Drizzle has no problem with multi-file schemas; you just re-export from an index.

This is 2–4 days of disciplined slicing with `npm run check` between every commit. It pays back forever.

## 2. Three test files for 123,000 lines of code

```
tests/smoke/auth-flow.test.ts
tests/smoke/harness.smoke.test.ts
tests/unit/pagination.test.ts
```

That's it. The `verify:full` script chains seven steps but six of them are *content* validation (`courses:audit`, `courses:lint-content`, `courses:qa`). Behavioural correctness of 258 API endpoints is enforced by a single auth smoke test.

**Why it's bad:** Every change is a coin flip. AI assistance makes this *worse* — fast diffs without tests means regressions land silently. The `local.db` SQLite drift below would be caught by an integration test in 30 seconds.

**Fix path:**
- Add Vitest integration tests for each `routes-*.ts` module, hitting a real Postgres test database (Neon branches make this trivial). Start with the five routes the product can't survive losing: auth, life-areas, civic-assessment, courses, blog.
- Aim for one happy-path + one auth-failure + one validation-failure test per route module. That's ~30 tests covering ~80% of the actually-load-bearing logic.

## 3. Dual schema drift — Postgres ↔ SQLite

- `shared/schema.ts` (Postgres): **101** `pgTable` definitions
- `shared/schema-sqlite.ts`: **86** `sqliteTable` definitions

A 15-table gap. The "local dev fallback" is *not* the same database as production. Code that works locally doesn't necessarily work in production. Code that works in production isn't always testable locally. This is the worst kind of subtle bug source: divergent behavior across environments.

**Fix path:** Pick one. Either:
- **Drop SQLite entirely.** Use Neon branches for local dev (Neon's whole pitch is fast branching). Delete `schema-sqlite.ts`, `local.db`, all sqlite codepaths in `server/db.ts`. ~1 day of work, removes thousands of lines.
- **Or generate SQLite schema from Postgres schema.** A code-generation script forces parity. Higher effort, lower ROI.

The dual-maintenance approach is what you have today, and it's already broken.

## 4. JWT in localStorage in 12 places

```bash
$ grep -rE "localStorage\.(set|get)Item.*[Tt]oken" client/src/ | wc -l
12
```

JWTs in `localStorage` are readable by any JavaScript that runs on your origin. One XSS — including from a third-party script you load — and every user's auth token is exfiltrated. This is documented in your own memory as a "post-launch follow-up" with `~1.5h` estimated and the mitigation listed as "rotate `JWT_SECRET` in Vercel before launch."

**Why it's bad:** Rotating the secret invalidates tokens once. It does not address the underlying class of vulnerability. The product has user-generated content (blog posts, comments, community posts, AR scenes) — exactly the surface where an XSS lands.

**Fix path:**
- Move tokens to `httpOnly`, `Secure`, `SameSite=Lax` cookies.
- Refactor `lib/queryClient.ts` to drop the `Authorization: Bearer` header and rely on cookies.
- Add a CSRF token for state-changing requests (double-submit cookie or per-session token).
- This is the "1.5h" task in `project_post_launch_jwt_cookies.md`. **Stop deferring it.**

## 5. Repo hygiene is genuinely bad

- `client/src/pages/Community.backup.tsx` and `client/src/pages/LaVision.tsx.backup` are committed. Backup files belong in git history, not `git ls-files`.
- `local.db` (4 MB SQLite) is committed despite `.gitignore` listing both `*.db` and `local.db` explicitly. That means `git add -f` was used at some point.
- `backend.log` (87 KB) and `frontend.log` (18 KB) are committed.
- `backend.pid` is committed.
- `package.json` is named `"rest-express"` — the default Replit-Express scaffold name.
- Two `vite.config.ts` files exist. The one at the repository root is **0 bytes**.
- Two `node_modules` directories: 1.4 GB in `SocialJusticeHub/` and 170 MB at the repo root, suggesting historical confusion about where the project actually lives.

**Why it's bad:** Each one is small. Together they tell every new contributor "nobody is paying attention to this repo's hygiene," which licenses further sloppiness.

**Fix path:**
- `git rm` every backup file, log file, PID file, and `local.db`.
- Delete the empty root-level `vite.config.ts`. Decide whether the root-level `client/`, `server/`, `api/`, `node_modules/`, `package.json`, `vite.config.ts`, and `local.db` are stale and should be removed wholesale, or are intentional.
- Rename the package: `"name": "social-justice-hub"` (or whatever the product name is).

## 6. No linter, no formatter

- No `.eslintrc*`, no `eslint.config.*`, no `prettier.config.*`, no `.editorconfig`.
- `tsc` runs and passes, but **236 `: any` annotations** are scattered through the app code. There are only **2** `@ts-ignore`/`@ts-expect-error` directives, meaning these `any`s aren't suppressing inference — they're disabling it on purpose.
- 363 `console.*` calls (323 server, 40 client). No structured logger.

**Why it's bad:** Style debates eat code review bandwidth that doesn't exist. `any` propagates through functions and turns TypeScript into a slower JavaScript. Console logs in production cost real money in serverless billing and bury actual errors.

**Fix path:**
- Add ESLint with `@typescript-eslint/recommended` and Prettier. Run them in CI alongside `npm run check`.
- Add an ESLint rule to ban `: any` (warn first, error after a sweep).
- Replace `console.*` with a thin logger that no-ops in production for everything below `warn`.

---

# High-severity issues

## 7. Dependency surface is enormous and partially redundant

182 dependencies. Notable bloat:

| Concern | What's installed | Comment |
|---|---|---|
| Maps | `leaflet` + `maplibre-gl` + `react-map-gl` + `@deck.gl/*` (4 packages) + `sigma` + `graphology` | Three (arguably four) different map/graph stacks ship to clients. |
| 3D | `three` (26 MB), `@react-three/fiber`, `@react-three/drei` | One product feature uses 3D? Two? |
| AR | `@ar-js-org/ar.js` | `server/ar-service.ts` is 489 LOC; how many users actually scan AR markers? |
| In-browser ML | `@xenova/transformers` | Ships an entire transformer runtime to the user's browser. |
| Blockchain | `ethers` + `web3` | Both. Only used in `server/blockchain-service.ts`. Pick one. |
| AI SDKs | `@anthropic-ai/sdk` + Groq via fetch | Anthropic SDK is dynamically imported in coaching, the primary path is Groq. |
| Charts | `recharts` + `@nivo/chord` + `@nivo/sankey` | Two charting libraries. |
| PDF | `html2pdf.js` | Common ad-hoc bloat. |

**Why it's bad:** Bundle size, install time, attack surface, supply-chain risk, and CI minutes all scale with this.

**Fix path:**
- Audit which features each heavy dep powers. If `@xenova/transformers` powers one feature, evaluate doing it server-side or removing the feature.
- Pick one map stack and one chart stack. Migrate the lesser-used to the chosen one and delete the duplicates.
- Drop `web3` if `ethers` covers the use case (it does).
- Use the Vite bundle visualizer (`rollup-plugin-visualizer`) to actually see what's shipping.

## 8. App.tsx is a flat 71-route Switch

`client/src/App.tsx` declares 71 `<Route>` elements in a single `<Switch>`. No route layout grouping. No nested layouts. Auth-gating is presumably duplicated in every page that needs it.

**Why it's bad:** Adding a "logged-in users only" wrapper means editing 30+ routes. Adding a new shared layout (e.g., a sidebar for `/mandato/*` pages) means hand-editing every route in that prefix.

**Fix path:**
- Group routes by section (`/mandato/*`, `/iniciativas/*`, `/cursos/*`, `/blog/*`, `/perfil/*`).
- Introduce a `<RequireAuth>` and `<RequireOnboardingComplete>` wrapper component.
- This is `wouter`-friendly; it doesn't require a router migration.

## 9. Pages are too big

```
1644  client/src/pages/InitiativeDetail.tsx
1156  client/src/pages/UnaRutaParaArgentina.tsx
 811  client/src/pages/KitDePrensa.tsx
 799  client/src/pages/Manifiesto.tsx
 799  client/src/pages/LaSemillaDeBasta.tsx
 791  client/src/pages/UserProfile.tsx
 766  client/src/pages/Community.tsx
 730  client/src/pages/MandatoPublico.tsx
 713  client/src/pages/UserDashboard.tsx
 705  client/src/pages/ChallengeDetail.tsx
 705  client/src/pages/ElMandatoVivo.tsx
```

A 1,644-line React page is one human's working memory limit *exceeded*. These pages mix data-fetching, state, derived state, layout, animation orchestration, and presentational JSX. A change to one section requires reading the other ten.

**Fix path:**
- For each >700-line page, extract sections into colocated `pages/InitiativeDetail/Sections/*.tsx` components.
- Move React Query hooks into `hooks/useInitiativeDetail.ts` etc. so the page is composition, not orchestration.

## 10. The 73-script graveyard

`scripts/` has 73 files. Some are part of the build (`prerender-*.ts`, `build-ensayos.ts`, `course-route-manifest.ts`). Most are one-shot migrations, audits, and seed scripts — many surely obsolete.

**Why it's bad:** New contributors can't tell which scripts are live and which are archaeology. Running a six-month-old migration script against a current database is a foot-gun.

**Fix path:**
- Sort scripts into `scripts/build/`, `scripts/migrations/`, `scripts/content/`, `scripts/diagnostic/`.
- Move clearly-historical migrations into `scripts/_archive/` or delete them outright (the migration was either applied or it doesn't matter).

## 11. The build script is a bash one-liner masquerading as a build

```json
"build": "vite build && tsx scripts/course-route-manifest.ts --out=dist/public/course-route-manifest.json && tsx scripts/prerender-course-seo.ts && tsx scripts/prerender-blog-seo.ts && tsx scripts/build-ensayos.ts && tsx scripts/prerender-ensayos-seo.ts && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && esbuild server/vercel-handler.ts --platform=node --packages=external --bundle --format=esm --outfile=api/index.mjs"
```

Eight sequential steps, no parallelism, no caching, no failure isolation. If `prerender-blog-seo` crashes, you have to read the terminal scrollback to figure out which one.

**Fix path:**
- Move to a tiny task runner (npm scripts → a `build.ts` orchestrator, or `concurrently` + per-step scripts).
- Cache the prerender outputs by content hash so they only re-run when content changes.
- Run independent steps in parallel.

---

# Medium-severity issues

## 12. The Postgres schema is one 3,337-line file with 101 tables

Beyond the file size, this hints at domain models that are *organized by happenstance*. A 101-table schema for a single product implies either (a) an enormous product, or (b) feature creep that never paid back through schema consolidation. Given the product description, it's (b).

**Action:** When slicing `schema.ts`, take inventory: which tables haven't been written to in 90 days? Which are read-only seed data that should live in code, not Postgres? Which were prototypes that never got removed?

## 13. The build chains seven steps before bundling, but the bundle is a Vercel function with `maxDuration: 30`

`api/index.mjs` is the entire Express app bundled into a single serverless function with a 30-second timeout. Cold starts on a 22k-LOC server bundle with `@anthropic-ai/sdk`, `ethers`, `web3`, `@xenova/transformers` (likely tree-shakeable but still), `nodemailer`, `passport`, `helmet`, etc., are going to hurt.

**Action:** Measure cold start and bundle size of `api/index.mjs`. If it's >5 MB or cold starts exceed 1.5 s, split off heavyweight handlers (AR, blockchain, coaching) into separate Vercel functions, or move them off Vercel entirely.

## 14. Storage layer is one class

Per the topology, `server/storage.ts` exports a single `DatabaseStorage` class. This is the data layer for blog, community, life areas, courses, civic assessment, mandato, gamification, AR, and blockchain. Every test that wants to mock or fixture data must mock this giant blob.

**Action:** Repository-per-domain. `BlogRepository`, `CommunityRepository`, etc. The class today has the *worst* property of god-objects: implicit coupling with no module boundary.

## 15. AI integration is split between two providers without a clear seam

- `server/services/coaching-service.ts` dynamically imports `@anthropic-ai/sdk`, comment notes "must be installed separately."
- `server/services/mandato-engine.ts` imports Anthropic statically.
- Per CLAUDE.md, the primary AI path is **Groq (Llama 3.3)**.

**Why it's bad:** Two AI providers, two integration patterns (dynamic and static import), no abstraction. The "dynamically import because it's optional" comment is misleading — the package is in `dependencies`, not `optionalDependencies`.

**Action:** Define an `AICompleter` interface (`complete(messages, opts)`) with Groq and Anthropic implementations. Pick one as default. The dynamic import dance can go.

## 16. CSP allows `'unsafe-inline'` and `'unsafe-eval'` in development, plus `unpkg.com` in production

`server/middleware.ts` ships a working CSP, which is more than most projects do — credit where due. But:

- `'unsafe-inline'` for styles is permanent (Tailwind doesn't need this; you're shipping inline styles somewhere).
- `unpkg.com` is permanently allowed for Leaflet's CSS/JS in production. Pin Leaflet via npm and remove the third-party origin.

**Action:** Audit inline style usage; bundle Leaflet via npm; tighten CSP. Each removed CSP exception is a real reduction in XSS leverage.

## 17. 236 `any`s and 2 ts-ignores

```bash
$ grep -rE ":\s*any\b" server/ client/src/ shared/ | wc -l
236
$ grep -rE "@ts-ignore|@ts-expect-error|@ts-nocheck" server/ client/src/ shared/ | wc -l
2
```

The `any`s are deliberate, not last-resort escapes. Each one is a place where TypeScript's value evaporated.

**Action:** Lint rule `@typescript-eslint/no-explicit-any` set to `warn`. Sweep them in batches by domain.

## 18. No CI for tests

GitHub Actions runs on push/PR per CLAUDE.md, but only:
1. `npm run check` (TypeScript)
2. `npm run check:routes` (route duplication guard)
3. `npm run build` (production build)

No `test:unit`. No `test:smoke`. The route-duplication guard exists *because the project keeps duplicating routes*. That's a band-aid for an organizational problem (god-files).

**Action:** Add `npm run test:unit` and `npm run test:smoke` to the CI matrix. Once the test suite from item #2 lands, this is free.

## 19. Two separate `node_modules` and ambiguous project root

The repo root has `client/`, `server/`, `api/`, `package.json`, `vite.config.ts` (empty), `node_modules/` (170 MB) — and CLAUDE.md says "All active development happens inside `SocialJusticeHub/`."

**Action:** Decide whether the root-level scaffolding is dead. If yes, delete it. If it's used for something (deploy preview? an alt build?), document why in CLAUDE.md.

## 20. 363 `console.*` calls and no log levels

In serverless, every `console.log` is billed cycles and storage. In the browser, leftover logs leak implementation detail and slow rendering on hot paths.

**Action:** Wrap with a minimal logger that no-ops `debug`/`info` in production.

---

# Low-severity but worth fixing

## 21. Spanish/English code mixing
The pattern is fine and documented in CLAUDE.md (UI is rioplatense Spanish, identifiers are English or mixed). But page names like `IniciativaDocumento.tsx` next to `InitiativeDetail.tsx` confuse the directory listing. Pick one identifier language and stick with it.

## 22. `tsconfig.json` is 765 bytes
That's about right, but verify `strict: true` is on. If `noImplicitAny` is off, that's where the 236 `any`s come from.

## 23. The "branding/content" files are huge and live alongside code
- `shared/blogContent.ts` — 3,336 LOC
- `shared/strategic-initiatives.ts` — 3,781 LOC
- `client/src/content/ensayos.generated.ts` — 1,930 LOC

Generated content is fine; hand-maintained content blobs in `.ts` files are fragile. Move human-edited content to Markdown/MDX or a CMS, leaving only the loader code in TypeScript.

## 24. `email.ts` ships both `nodemailer` and `resend`
Two email providers in `dependencies`. Pick one.

## 25. SEO prerender pipeline is bespoke
Three separate prerender scripts (`prerender-course-seo.ts`, `prerender-blog-seo.ts`, `prerender-ensayos-seo.ts`) doing similar work. A single SSG step (or Astro's content collections, or `react-router-dom`'s SSR) would replace all three.

## 26. `connect-pg-simple` and `memorystore` both installed
You only need one session store at a time.

## 27. `speakeasy` (TOTP) and the existence of `two-factor.ts`
2FA is implemented. Is it gated behind a feature flag? Is it actually exposed to users? If not, delete the 2FA dead code until you ship it.

## 28. `BUSINESS_PLAN_MONETIZATION_2026.md` and `PDR_SISTEMA_TRIBUS.md` in the repo
14 KB of business plan and 339 KB (!) of product design doc inside `SocialJusticeHub/`. Move docs to the existing `docs/` directory or to Notion. Don't ship them in the repo root.

---

# How this should be improved (priority-ordered roadmap)

The order matters: do the cheap risk reducers first, the structural work second.

## Week 1 — Stop the bleeding (low effort, high value)
1. **Delete junk from git:** `Community.backup.tsx`, `LaVision.tsx.backup`, `local.db`, `backend.log`, `frontend.log`, `backend.pid`. Commit history retains them; the working tree shouldn't.
2. **Decide root-vs-`SocialJusticeHub` once.** Delete the empty root `vite.config.ts` and the stale outer `client/`/`server/`/`api/`/`node_modules/` if they aren't used.
3. **Add ESLint + Prettier + a CI job for them.** Configure to warn on `: any`.
4. **Add `npm test` to GitHub Actions.** Even with three tests, the suite must run.
5. **Rotate `JWT_SECRET` AND start the cookies migration in the same PR.** Don't let the rotation become an excuse to defer.

## Weeks 2–3 — Meaningful test coverage
6. **One Vitest integration suite per `routes-*.ts` module**, hitting a Neon test branch. Target the five core domains first: auth, life-areas, civic-assessment, courses, blog.
7. **Decide on the SQLite story.** Recommend deletion. If kept, add a parity check script in CI.
8. **Carve a logger** (`server/lib/logger.ts`) and replace `console.*` mechanically.

## Weeks 4–6 — Slice the god-files
9. **Split `server/routes.ts` (5,317 LOC)** into `routes-blog.ts`, `routes-community.ts`, `routes-profile.ts`, `routes-mandate.ts`, `routes-ar.ts`, `routes-blockchain.ts`, `routes-feedback.ts`. The pattern already exists.
10. **Split `server/storage.ts` (5,516 LOC)** into per-domain repository modules, each with its own type exports. Tests written in step 6 protect this refactor.
11. **Split `shared/schema.ts` (3,337 LOC)** by domain. Re-export from `shared/schema/index.ts`.

## Weeks 7–8 — Frontend cleanup
12. **Group `App.tsx` routes** by section. Introduce `<RequireAuth>` once, use it everywhere.
13. **Carve the >700-line pages** into colocated section components.
14. **Bundle visualizer + dependency audit.** Drop `web3` (keep `ethers`), drop one of `recharts`/`@nivo`, drop one of `nodemailer`/`resend`, drop one of `connect-pg-simple`/`memorystore`. Decide whether `@xenova/transformers`, AR.js, and full Three.js earn their bundle weight.

## Ongoing
- Move human-edited content out of `shared/*.ts` into Markdown/MDX.
- Replace bespoke prerender scripts with a single SSG step.
- Keep test count growing with every new feature; prefer "one integration test per route" as the bar.

---

# What's actually good

To be fair, not everything is bad:

- **The `routes-*.ts` pattern exists.** It hasn't been finished, but the seam is there and the right shape.
- **Security middleware is present and reasoned-about.** Helmet with a real CSP, CORS allowlist, `express-rate-limit` (general + auth-specific), 10 MB body cap, response redaction in `server/index.ts` for sensitive keys. Most projects don't get this far.
- **`React.lazy` for every page.** Code-splitting is real.
- **Drizzle ORM, Zod validation, JWT-based auth, helmet, CSP** — the choices are individually defensible.
- **The mission, the documentation in `docs/superpowers/specs/`, the spec-then-plan-then-implement workflow** — all of this is the *good* kind of weird. The `MANIFIESTO_HOMBRE_GRIS.md`, `PERFIL_HOMBRE_GRIS.md`, `Iniciativas Estratégicas/`, and `Ensayos/` show real intellectual investment and a coherent vision.
- **Spanish (rioplatense) UI throughout** is respected consistently. That is rare and disciplined.

The codebase isn't shit because the people building it don't care. It's shit because **caring about everything at once produces a different kind of debt than caring about nothing**: the debt of overgrowth. Every pull-request added, never subtracted. The remedy isn't more discipline going forward — it's a pruning sprint, then proportional discipline.

---

## One-line summary

> A serious civic-tech project carrying a Replit-scaffold-name, three god-files, two divergent database schemas, JWT-in-localStorage, three test files for ~123k LOC of code, and 1.4 GB of `node_modules` in a directory the README doesn't even mention is the actual project root.

Fix the top five items in the roadmap and this becomes a defensible, maintainable platform. Ignore them and the next twelve months will be spent fighting the codebase instead of shipping features.
