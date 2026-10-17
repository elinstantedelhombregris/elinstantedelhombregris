/** Catálogo necesario para el ensayo escolar; no ejecuta los seeds de otros módulos. */
import { getDb } from '../src/client.js';
import { puentearNeonAPostgresLocal } from '../tests/helpers/neon-local.js';

import { sembrarProvincias } from './seed-provinces.js';

const url = process.env.DATABASE_URL;
if (url !== 'postgresql://postgres@127.0.0.1:55441/basta_escuela_local') {
  throw new Error('Este catálogo sólo se prepara para la base local del ensayo escolar.');
}
const cerrar = puentearNeonAPostgresLocal(url);
try {
  await sembrarProvincias(getDb());
} finally {
  await cerrar();
}
