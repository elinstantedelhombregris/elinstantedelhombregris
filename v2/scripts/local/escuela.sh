#!/usr/bin/env bash
# Entorno aislado y persistente. No carga .env ni hereda claves de proveedores.
set -euo pipefail
cd "$(dirname "$0")/../.."
RAIZ_ESCOLAR="$PWD"
DATOS_ESCOLARES="$RAIZ_ESCOLAR/.operations/escuela/postgres"
SOCKET_ESCOLAR="/tmp/eihg-escuela-$UID"
if [[ "${1:-}" == "--detener-base" ]]; then
  pg_ctl -D "$DATOS_ESCOLARES" -m fast -w stop
  exit
fi
if [[ $# -ne 0 ]]; then
  echo "Uso: pnpm dev:escuela [--detener-base]" >&2
  exit 1
fi
mkdir -p "$DATOS_ESCOLARES" "$SOCKET_ESCOLAR"
chmod 700 "$DATOS_ESCOLARES" "$SOCKET_ESCOLAR"
if [[ ! -f "$DATOS_ESCOLARES/PG_VERSION" ]]; then
  initdb -D "$DATOS_ESCOLARES" -U postgres --auth=trust -E UTF8 > "$RAIZ_ESCOLAR/.operations/escuela/init.log"
fi
if ! pg_ctl -D "$DATOS_ESCOLARES" status > /dev/null 2>&1; then
  pg_ctl -D "$DATOS_ESCOLARES" -o "-h 127.0.0.1 -p 55441 -k $SOCKET_ESCOLAR" -l "$RAIZ_ESCOLAR/.operations/escuela/postgres.log" -w start
fi
if [[ "$(psql -h 127.0.0.1 -p 55441 -U postgres -d postgres -Atc 'show data_directory')" != "$DATOS_ESCOLARES" ]]; then
  echo "El puerto 55441 corresponde a otro Postgres. No se modificó esa base." >&2
  exit 1
fi
if [[ "$(psql -h 127.0.0.1 -p 55441 -U postgres -d postgres -Atc "select count(*) from pg_database where datname='basta_escuela_local'")" == 0 ]]; then
  createdb -h 127.0.0.1 -p 55441 -U postgres basta_escuela_local
fi
URL_ESCOLAR='postgresql://postgres@127.0.0.1:55441/basta_escuela_local'
env -i PATH="$PATH" HOME="$HOME" DATABASE_URL="$URL_ESCOLAR" DATABASE_URL_UNPOOLED="$URL_ESCOLAR" \
  pnpm --filter @v2/db exec tsx scripts/migrate.ts
env -i PATH="$PATH" HOME="$HOME" DATABASE_URL="$URL_ESCOLAR" DATABASE_URL_UNPOOLED="$URL_ESCOLAR" \
  pnpm --filter @v2/db exec tsx scripts/escuela-provincias.ts
exec env -i PATH="$PATH" HOME="$HOME" DATABASE_URL="$URL_ESCOLAR" DATABASE_URL_UNPOOLED="$URL_ESCOLAR" \
  NODE_ENV=development API_PORT=4000 PUBLIC_API_URL=http://127.0.0.1:4000 \
  PUBLIC_WEB_URL=http://127.0.0.1:4179 CORS_ORIGINS=http://127.0.0.1:4179 \
  JWT_SECRET=escuela-local-jwt-exclusivo-no-usar-fuera-del-ensayo \
  SESSION_SECRET=escuela-local-sesion-exclusiva-no-usar-fuera-del-ensayo \
  ADMIN_USERNAMES=escuela_coordina COOKIE_SECURE=false EXPORTACIONES_EN_PEDIDO=false RATE_LIMIT_MAX_REQUESTS=1200 \
  pnpm --filter @v2/api exec tsx src/local/escuela.ts
