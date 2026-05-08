# El Instante del Hombre Gris — v2

Argentine civic engagement platform built around the **¡BASTA!** popular governance framework.

This directory (`/v2/`) is a parallel rebuild of `/SocialJusticeHub/`. Until cutover, the live site continues to serve from `/SocialJusticeHub/`; nothing in this directory is deployed yet.

## Quick start

```bash
# Prerequisites: Node 20+, pnpm 9+
nvm use            # picks up .nvmrc
pnpm install
cp env.example .env
# Fill in DATABASE_URL and JWT_SECRET in .env
pnpm dev
```

The web app runs on `http://localhost:5173`, the API on `http://localhost:4000`.

## Repository layout

```
v2/
├── apps/
│   ├── web/                # React + Vite frontend
│   └── api/                # Express backend
├── packages/
│   ├── db/                 # Drizzle schemas, migrations, repositories
│   ├── shared/             # Zod schemas, types, content registries
│   ├── ui/                 # Shared component library (Radix + Tailwind)
│   └── config/             # eslint, tsconfig, prettier presets
├── content/                # MDX: blog, ensayos, manifiesto, courses, planes
├── docs/                   # Architecture, ADRs, contributor guides
├── scripts/                # Build, content, migration tooling
└── tests/                  # Playwright e2e + integration smoke
```

## Common commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start web + api in parallel |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | ESLint across the workspace |
| `pnpm type-check` | TypeScript across the workspace |
| `pnpm test` | Unit + integration tests |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm verify` | Lint + type-check + test + build (the CI gate) |
| `pnpm format` | Prettier write across the workspace |

## Documentation

- `CONTRIBUTING.md` — how to contribute, branch policy, commit style
- `CLAUDE.md` — instructions for AI assistants working on this codebase
- `docs/architecture/` — high-level architecture
- `docs/adr/` — architecture decision records (one file per non-obvious choice)
- `../docs/REPORT_THIS_PROJECT_IS_UTTER_SHIT.md` — diagnosis of the v1 codebase
- `../docs/AI_AGENT_GREENFIELD_INSTRUCTIONS.md` — the rules we built v2 to follow

## License

MIT
