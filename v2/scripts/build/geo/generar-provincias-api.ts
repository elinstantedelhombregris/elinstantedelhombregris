/**
 * Genera el módulo de provincias que compila dentro de la API.
 *
 * Por qué un módulo y no `readFileSync`: la API se despliega en serverless y
 * `tsc` solo emite `.js`, así que un `.geojson` que viva en `src/` no llega a
 * `dist/`. Un módulo TypeScript se compila, se empaqueta y está siempre — sin
 * disco de por medio. Es el mismo patrón que `planes-index.generated.ts` y
 * `argentina-mapa.generated.ts`.
 *
 * La fuente canónica sigue siendo el GeoJSON que sirve la web. Este archivo es
 * derivado: `apps/api/tests/geo-provincias.test.ts` falla si divergen.
 *
 *   pnpm geo:provincias
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const FUENTE = new URL('../../../apps/web/public/geo/provincias.geojson', import.meta.url);
const DESTINO = new URL(
  '../../../apps/api/src/features/geographic/provincias.generated.ts',
  import.meta.url,
);

interface FeatureProvincia {
  properties: { name: string };
  geometry: { type: string; coordinates: unknown };
}

const coleccion = JSON.parse(readFileSync(FUENTE, 'utf8')) as { features: FeatureProvincia[] };

const areas = coleccion.features.map((f) => ({
  nombre: f.properties.name,
  geometria: { type: f.geometry.type, coordinates: f.geometry.coordinates },
}));

const tipos = [...new Set(areas.map((a) => a.geometria.type))];
for (const tipo of tipos) {
  if (tipo !== 'Polygon' && tipo !== 'MultiPolygon') {
    throw new Error(`Geometría no soportada: ${tipo}`);
  }
}

const contenido = `/**
 * GENERADO — no editar a mano. Correr \`pnpm geo:provincias\`.
 *
 * Derivado de \`apps/web/public/geo/provincias.geojson\`, que es la fuente
 * canónica. Existe compilado porque en serverless no hay disco confiable.
 */
import type { AreaProvincia } from '@v2/civic-core';

export const AREAS_PROVINCIAS: readonly AreaProvincia[] = ${JSON.stringify(areas)};
`;

mkdirSync(dirname(fileURLToPath(DESTINO)), { recursive: true });
writeFileSync(DESTINO, contenido, 'utf8');

process.stdout.write(
  `${areas.length} provincias → ${fileURLToPath(DESTINO)} (${tipos.join(', ')})\n`,
);
