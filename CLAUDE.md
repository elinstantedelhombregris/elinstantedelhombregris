# El Instante del Hombre Gris

Argentine civic engagement platform built around the **!BASTA!** popular governance framework.
All active development happens inside `SocialJusticeHub/`.

## Quick Reference

```bash
cd SocialJusticeHub

# Development
npm run dev              # Start dev server (Express + Vite, port 3001)

# Verification (run before committing)
npm run check            # TypeScript type check (tsc --noEmit)
npm run check:routes     # Route duplication guard
npm run verify           # check + check:routes + build
npm run verify:full      # verify + courses:audit + courses:qa + smoke test

# Build
npm run build            # Vite + esbuild + prerender SEO pages

# Database
npm run db:push          # Drizzle push schema to Neon
```

## Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18 + TypeScript + Vite + Tailwind 3 + shadcn/ui + Framer Motion |
| Backend   | Express + Drizzle ORM + PostgreSQL (Neon serverless) |
| Routing   | **wouter** (NOT react-router) |
| Data      | @tanstack/react-query |
| Auth      | JWT + Passport + bcrypt |
| Deploy    | Vercel (serverless) |

## Project Layout

```
SocialJusticeHub/
  client/src/
    pages/           # Page components (PascalCase: Home.tsx, Login.tsx)
    components/      # Feature components + ui/ (shadcn/Radix primitives)
    hooks/           # Custom hooks (use-mobile.ts, useCourseProgress.ts)
    lib/             # Utilities (queryClient.ts, motion-variants.ts, utils.ts)
  server/
    index.ts         # Express entry point
    routes.ts        # Main routes
    routes-*.ts      # Feature route modules (routes-courses.ts, routes-life-areas.ts, etc.)
    *-service.ts     # Service modules (coaching-service.ts, mandato-engine.ts)
    auth.ts          # JWT/Passport auth
    db.ts            # Neon database connection
    validation.ts    # Zod schemas (Spanish error messages)
  shared/
    schema.ts        # Drizzle ORM schema (PostgreSQL) — source of truth
    schema-sqlite.ts # SQLite schema (local dev fallback)
    *.ts             # Isomorphic content/logic shared between client and server
  scripts/           # CLI utilities, migrations, seed scripts, course management
  content/courses/   # Course content (markdown lessons + quiz JSON)
  docs/superpowers/
    specs/           # Design specifications
    plans/           # Implementation plans
```

## Path Aliases

```
@/*       → client/src/*
@shared/* → shared/*
```

## Language

All user-facing text is in **Spanish (rioplatense dialect)**: "vos", "mirá", "pará".
Validation messages, UI labels, page content, error messages — everything.
Component names and code identifiers stay in English or mixed (e.g. `HeroSection`, `BastaPrincipio`).

## Design System

**Dark theme** with glassmorphism:
- Background: `bg-[#0a0a0a]`
- Glass cards: `bg-white/5 backdrop-blur-md border border-white/10`
- Gradient text: `bg-clip-text text-transparent bg-gradient-to-b`
- Fonts: Inter (sans), Playfair Display (serif), JetBrains Mono (mono)
- Colors: iris-violet `#7D5BDE`, mist-white `#F5F7FA`, slate-ink `#2F3545`

**Animations** — use shared variants from `lib/motion-variants.ts`:
`fadeUp`, `fadeIn`, `scaleIn`, `slideLeft`, `slideRight`, `bloom`, `staggerContainer`

**UI components** — shadcn/ui with Radix primitives in `components/ui/`. Use `cn()` from `lib/utils.ts` for class merging.

## Code Patterns

**Pages**: React.lazy() for all page-level code splitting in App.tsx.

**API calls**: Use `apiRequest(method, url, data?)` from `lib/queryClient.ts`. Auth via Bearer token in localStorage.

**Query defaults**: staleTime=Infinity, retry=false, refetchOnWindowFocus=false.

**Validation**: Zod schemas in `server/validation.ts`. Export inferred types: `export type X = z.infer<typeof xSchema>`.

**Database schema**: Drizzle ORM in `shared/schema.ts`. Tables use snake_case. Primary keys: `serial("id").primaryKey()`.

**Route modules**: Each feature domain has its own `routes-[feature].ts` file with a `register*Routes(app)` function.

## Key Domain Concepts

- **!BASTA!** — Always written with exclamation marks. A popular governance framework with 17+ PLANs (mandates). Citizens design, State administers, Politics executes.
- **Hombre Gris** — "Grey" means silver (plata), connecting to Argentina (argentum). NOT steel.
- **Life Areas** — 12 areas, 60 subcategories. Quiz scale: 0-10 frontend, mapped to 0-100 backend via SCORE_MAPPING.
- **Mandato Vivo** — Territory-based citizen governance with pulse signals and proposals.

## Commit Style

```
feat: redesign [Page] — [purpose]
Fix [issue]: [detail]
Add [name] [type] — [context]
Rebuild bundle + apply linter fixes
```

## CI

GitHub Actions runs on push/PR touching `SocialJusticeHub/**`:
1. `npm run check` (TypeScript)
2. `npm run check:routes` (route duplication guard)
3. `npm run build` (production build)

## Workflow: Spec → Plan → Implementation

Design specs define the "why" and "what" (tone, structure, sections).
Implementation plans break specs into numbered checkbox tasks with code blocks.
Each task gets verified and committed independently.

## Environment

Copy `env.example` to `.env`. Key variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET`, `SESSION_SECRET` — auth secrets
- `GROQ_API_KEY` — AI coaching (Llama 3.3 via Groq)
- `NODE_ENV`, `PORT` (default 3001 dev)

Never commit `.env` files.
