#!/usr/bin/env bash
# Migra y siembra la base de `DATABASE_URL`, que tiene que ser LOCAL: la usan
# `integracion-local.sh` y el job de integración del CI (un contenedor de
# Postgres). Los seeds que hablan por el driver de Neon pasan por el puente de
# `packages/db/scripts/con-postgres-local.ts`.
set -euo pipefail

case "${DATABASE_URL:-}" in
  postgres://*@localhost*|postgres://*@127.0.0.1*|postgresql://*@localhost*|postgresql://*@127.0.0.1*) ;;
  *) echo "sembrar-base-de-prueba: DATABASE_URL tiene que ser local (D-014)." >&2; exit 1 ;;
esac

cd "$(dirname "$0")/../../packages/db"
PUENTE=(--import ./scripts/con-postgres-local.ts)
npx tsx scripts/migrate.ts
npx tsx "${PUENTE[@]}" scripts/seed-provinces.ts
npx tsx scripts/rellenar-provincias.ts --aplicar
npx tsx scripts/seed-badges.ts
npx tsx scripts/seed-challenges.ts
npx tsx "${PUENTE[@]}" scripts/seed-life-areas.ts
