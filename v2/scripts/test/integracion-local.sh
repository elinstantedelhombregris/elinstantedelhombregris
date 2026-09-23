#!/usr/bin/env bash
# `pnpm test:integration:local` — la suite de integración entera contra un
# Postgres descartable que nace y muere con la corrida. Nunca toca la base de
# `v2/.env`, que es producción (D-014). Necesita `initdb` y `pg_ctl` en el PATH
# (Homebrew: `brew install postgresql@16`).
set -euo pipefail

PUERTO="${PUERTO_PRUEBA:-55440}"
DATOS="$(mktemp -d)"
SOCKETS="$(mktemp -d /tmp/pgs.XXXX)"
limpiar() { pg_ctl -D "$DATOS" stop -m fast >/dev/null 2>&1 || true; rm -rf "$DATOS" "$SOCKETS"; }
trap limpiar EXIT

initdb -D "$DATOS" -U postgres --auth=trust -E UTF8 >/dev/null
pg_ctl -D "$DATOS" -o "-p $PUERTO -k $SOCKETS" -l "$DATOS/log" -w start >/dev/null
# Dos bases en el mismo servidor: la «de la app» y la descartable. Tienen que
# ser distintas porque las suites que escriben se niegan a correr sobre la
# misma base que lee la app (`packages/db/src/base-descartable.ts`).
createdb -h 127.0.0.1 -p "$PUERTO" -U postgres basta_integracion_test
createdb -h 127.0.0.1 -p "$PUERTO" -U postgres basta_descartable_test

URL="postgresql://postgres@127.0.0.1:$PUERTO/basta_integracion_test"
DESCARTABLE="postgresql://postgres@127.0.0.1:$PUERTO/basta_descartable_test"
export DATABASE_URL="$URL" DATABASE_URL_UNPOOLED="$URL" DATABASE_URL_DESCARTABLE="$DESCARTABLE" MAPA_TEST_DATABASE_URL="$DESCARTABLE"
export JWT_SECRET="${JWT_SECRET_PRUEBA:-integracion-local-jwt-secret-de-al-menos-32-caracteres}"
export SESSION_SECRET="${SESSION_SECRET_PRUEBA:-integracion-local-session-secret-de-al-menos-32-caracteres}"

cd "$(dirname "$0")/../.."
bash scripts/test/sembrar-base-de-prueba.sh
DATABASE_URL="$DESCARTABLE" DATABASE_URL_UNPOOLED="$DESCARTABLE" bash scripts/test/sembrar-base-de-prueba.sh
pnpm test:integration "$@"
