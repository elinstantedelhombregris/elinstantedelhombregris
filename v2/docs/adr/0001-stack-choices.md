# ADR 0001 — Stack choices

**Status:** Accepted · 2026-05-08

## Context

The v1 codebase (`/SocialJusticeHub/`) accumulated 182 npm dependencies, three different map stacks, two charting libraries, two AI provider integrations, and an in-browser ML runtime. We're rebuilding v2 from scratch and need to lock the stack on day one to avoid the same drift.

## Decision

We adopt the following stack. Each line is a single, non-negotiable choice for v2 unless a future ADR supersedes it.

### Languages & runtime
- **TypeScript 5.6+** with `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- **Node 20+** (LTS). `.nvmrc` pins major version.
- **pnpm 10+** as the package manager and workspace tool.

### Frontend
- **React 18** (not 19; ecosystem maturity).
- **Vite 5** for the build. No webpack, no Next.js. SSG via Vite SSR for marketing/blog pages, client SPA for everything else.
- **wouter** for routing — small, hooks-friendly, what v1 used.
- **Tailwind 3** for styling. Single CSS framework.
- **Radix primitives** + **cva** + **clsx + tailwind-merge** for components. shadcn/ui-style, but locally authored — we don't pull in the shadcn CLI.
- **lucide-react** for icons (one set).
- **framer-motion** for animations.
- **@tanstack/react-query** for server state.
- **react-hook-form + zod** for forms.

### Backend
- **Express 4** + standard middleware: helmet, cors, express-rate-limit, cookie-parser.
- **bcryptjs** (cost 12) + **jsonwebtoken**.
- **pino** logger (no `console.*` in app code).
- Validation via **zod** schemas shared with the client through `@v2/shared`.

### Database
- **Postgres on Neon** (serverless). One project per environment.
- **Drizzle ORM** + **drizzle-kit** + **drizzle-zod**.
- Schema split per domain. Repository pattern. No god-class.

### AI
- **Groq** as the default LLM provider (via `fetch`, no SDK).
- **`@anthropic-ai/sdk`** loaded lazily, behind an `AICompleter` interface seam.
- No two-providers-side-by-side without an interface boundary.

### Maps & charts (one of each)
- **maplibre-gl** + **react-map-gl** for maps.
- **recharts** for charts.

### Email
- **Resend** for transactional email.

### Testing
- **Vitest** for unit and integration.
- **Supertest** for HTTP integration.
- **@testing-library/react** for component tests.
- **Playwright** for end-to-end.

### Tooling
- **ESLint 9** flat config + **typescript-eslint** strict-type-checked + **Prettier 3** with the Tailwind plugin.
- **commitlint** with Conventional Commits.
- **size-limit** for bundle budgets in CI.

## Consequences

**Good:**
- Single map library, single chart library — bundle stays small, code review stays focused.
- Type safety enforced from commit #1; we don't pay technical debt later.
- pnpm workspace makes it cheap to extract shared packages as patterns emerge.

**Bad:**
- Three new contributors over the next year will each ask "why not Next.js?" — we'll point them here.
- We're betting Neon's branching keeps working for ephemeral CI databases. If Neon raises pricing or kills branching, we re-evaluate.
- React 19 is shipping but its ecosystem (testing libraries, Radix peer deps) hasn't caught up. We'll revisit in 6 months.

## Out of scope for this ADR

- 2FA library choice (`speakeasy` is the obvious pick; will land in a follow-up ADR if there's any nuance).
- Avatar upload storage (data URI vs. S3-compatible) — separate ADR when we get to user profiles.
- Heavy/optional features (`three`, `@xenova/transformers`, `@ar-js-org/ar.js`, `ethers`) each get their own ADR justifying the bundle weight before we install them.
