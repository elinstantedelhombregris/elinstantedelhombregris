/**
 * `tsx --import ./scripts/con-postgres-local.ts <script>` corre cualquier script
 * del paquete (seeds, rellenos) contra el Postgres local de `DATABASE_URL`, con
 * el mismo puente que usan los tests. Si la URL no es local, no instala nada y
 * el script sigue su camino normal.
 */
import { esBaseLocal, puentearNeonAPostgresLocal } from '../tests/helpers/neon-local.js';

const url = process.env['DATABASE_URL'];
if (esBaseLocal(url) && url) puentearNeonAPostgresLocal(url);
