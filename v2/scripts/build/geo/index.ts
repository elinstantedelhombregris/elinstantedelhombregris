#!/usr/bin/env tsx
/**
 * Orquestador del mapa precomputado (spec 1 §2).
 *
 * Reemplaza a `scripts/build/build-mapa-argentina.ts`. Corre UNA vez, y cada
 * vez que cambie un dataset; el output se COMMITEA. Cero dependencias en
 * runtime: la app solo importa los módulos generados (decisión D3 del master
 * plan — sin librería de mapas).
 *
 * El orden importa. Los bounds salen de la capa de provincias y se congelan
 * ahí: todas las demás capas los reciben ya calculados. Si una capa nueva
 * pudiera moverlos, todos los paths emitidos se correrían y `desproyectar`
 * dejaría de coincidir con lo dibujado (spec 1 §3).
 *
 * Correr (desde v2/):
 *   ./apps/api/node_modules/.bin/tsx scripts/build/geo/index.ts
 * (`pnpm exec tsx` no resuelve tsx desde la raíz del workspace.)
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { anillosDe, construirProvincias, moduloPais } from './capas/provincias.js';
import { boundsDeAnillos, crearProyeccion, moduloProyeccion } from './proyeccion.js';

import type { ColeccionProvincias } from './capas/provincias.js';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');
const dirDatos = join(aqui, '..', 'data');
const dirGeoWeb = join(raizV2, 'apps', 'web', 'src', 'geo');

/**
 * Techos de peso de la spec 1 §2.2. Son techo, no aspiración: si una salida
 * se pasa, se sube la tolerancia de simplificación de esa capa — nunca el
 * techo. El build falla para que nadie lo descubra en producción.
 */
const PRESUPUESTO_KB: Record<string, number> = {
  'pais.generated.ts': 210,
  'proyeccion.generated.ts': 8,
};

interface Salida {
  ruta: string;
  nombre: string;
  bytes: number;
}

const salidas: Salida[] = [];

function emitir(dir: string, nombre: string, contenido: string): void {
  mkdirSync(dir, { recursive: true });
  const ruta = join(dir, nombre);
  writeFileSync(ruta, contenido, 'utf8');
  salidas.push({ ruta, nombre, bytes: statSync(ruta).size });
}

// ── 1. Provincias: la capa que congela los bounds ───────────────────────────

const coleccion = JSON.parse(
  readFileSync(join(dirDatos, 'argentina-provincias.geojson'), 'utf8'),
) as ColeccionProvincias;

const bounds = boundsDeAnillos(anillosDe(coleccion));
const proyeccion = crearProyeccion(bounds);
const provincias = construirProvincias(coleccion, proyeccion);

emitir(dirGeoWeb, 'proyeccion.generated.ts', moduloProyeccion(proyeccion));
emitir(dirGeoWeb, 'pais.generated.ts', moduloPais(provincias));

// ── 2. Capas pendientes ─────────────────────────────────────────────────────

/**
 * Departamentos, esqueleto (rutas/ríos/costa), manchas urbanas y localidades
 * están especificados en la spec 1 §2.3 pero NO implementados: dependen de un
 * extracto de OpenStreetMap de la Argentina (~1,2 GB) y de la capa de
 * departamentos del IGN, que no se commitean. Ver `scripts/build/data/README.md`.
 *
 * Se declaran acá, en el orquestador, en vez de quedar como archivos vacíos
 * que aparenten estar hechos.
 */
const CAPAS_PENDIENTES = [
  'departamentos  — IGN, capa de departamentos/partidos (~530)',
  'esqueleto      — OSM: costa, ríos mayores, rutas nacionales',
  'urbano         — OSM: manchas urbanas + rutas provinciales, chunk por provincia',
  'localidades    — pendiente de definir la fuente (spec 2 §4.2)',
];

// ── 3. Reporte y presupuesto ────────────────────────────────────────────────

const excedidas: string[] = [];
process.stdout.write('\nMapa precomputado — salidas:\n');
for (const salida of salidas) {
  const kb = salida.bytes / 1024;
  const techo = PRESUPUESTO_KB[salida.nombre];
  const marca = techo === undefined ? '  ' : kb > techo ? '✗ ' : '✓ ';
  const limite = techo === undefined ? '' : ` / ${String(techo)} KB`;
  process.stdout.write(
    `  ${marca}${relative(raizV2, salida.ruta)}  ${kb.toFixed(1)} KB${limite}\n`,
  );
  if (techo !== undefined && kb > techo) {
    excedidas.push(`${salida.nombre}: ${kb.toFixed(1)} KB supera el techo de ${String(techo)} KB`);
  }
}

process.stdout.write(
  `\n  ${String(provincias.length)} provincias · viewBox 0 0 ${String(proyeccion.ancho)} ${String(proyeccion.alto)}\n`,
);
process.stdout.write('\nCapas pendientes (spec 1 §2.3 — necesitan datos externos):\n');
for (const capa of CAPAS_PENDIENTES) process.stdout.write(`  · ${capa}\n`);
process.stdout.write('\n');

if (excedidas.length > 0) {
  process.stderr.write(
    `Presupuesto de peso excedido (spec 1 §2.2). Simplificá más la capa, no subas el techo:\n` +
      excedidas.map((linea) => `  ${linea}\n`).join(''),
  );
  process.exit(1);
}
