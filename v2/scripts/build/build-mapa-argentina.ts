#!/usr/bin/env tsx
/**
 * build-mapa-argentina.ts — precomputa el mapa SVG de la Argentina.
 *
 * Lee scripts/build/data/argentina-provincias.geojson (Natural Earth,
 * simplificado, dominio público) y emite
 * apps/web/src/pages/ElMapa/argentina-mapa.generated.ts con paths
 * proyectados + centroides por provincia. Se corre UNA vez (y cada vez
 * que cambie el dataset); el output se COMMITEA. Cero dependencias en
 * runtime: la app solo importa el módulo generado (decisión D3 del
 * master plan: sin librería de mapas).
 *
 * Proyección: equirectangular corregida por cos(latitud media) — alto
 * fijo 1000, margen 8 → viewBox ≈ 476×1000, el mismo aspecto que el
 * especimen (467.9×1000).
 *
 * Correr (desde v2/): ./apps/api/node_modules/.bin/tsx scripts/build/build-mapa-argentina.ts
 * (pnpm exec tsx no resuelve tsx desde la raíz del workspace).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface FeatureProvincia {
  properties: { name: string };
  geometry: { type: 'Polygon'; coordinates: number[][][] };
}

interface ColeccionProvincias {
  features: FeatureProvincia[];
}

/** Nombres del GeoJSON → nombre canónico del seed de geographic_locations. */
const RENOMBRES: Record<string, string> = {
  'Ciudad de Buenos Aires': 'Ciudad Autónoma de Buenos Aires',
};

const ALTO = 1000;
const MARGEN = 8;

const aqui = dirname(fileURLToPath(import.meta.url));
const rutaGeojson = join(aqui, 'data', 'argentina-provincias.geojson');
const rutaSalida = join(
  aqui,
  '..',
  '..',
  'apps',
  'web',
  'src',
  'pages',
  'ElMapa',
  'argentina-mapa.generated.ts',
);

const coleccion = JSON.parse(readFileSync(rutaGeojson, 'utf8')) as ColeccionProvincias;

// 1. Bounds geográficos.
let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;
for (const feature of coleccion.features) {
  for (const anillo of feature.geometry.coordinates) {
    for (const [lon, lat] of anillo.map((c) => [c[0] ?? 0, c[1] ?? 0])) {
      minLon = Math.min(minLon, lon ?? 0);
      maxLon = Math.max(maxLon, lon ?? 0);
      minLat = Math.min(minLat, lat ?? 0);
      maxLat = Math.max(maxLat, lat ?? 0);
    }
  }
}

// 2. Proyección: equirectangular con corrección cos(lat media).
const latMedia = ((minLat + maxLat) / 2) * (Math.PI / 180);
const kx = Math.cos(latMedia);
const k = (ALTO - 2 * MARGEN) / (maxLat - minLat);
const ANCHO = Math.round(((maxLon - minLon) * kx * k + 2 * MARGEN) * 10) / 10;

const px = (lon: number): number => Math.round((MARGEN + (lon - minLon) * kx * k) * 10) / 10;
const py = (lat: number): number => Math.round((MARGEN + (maxLat - lat) * k) * 10) / 10;

/** Centroide (shoelace) del anillo exterior, en coordenadas SVG. */
function centroide(anillo: number[][]): { cx: number; cy: number } {
  let area = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < anillo.length - 1; i += 1) {
    const x1 = px(anillo[i]?.[0] ?? 0);
    const y1 = py(anillo[i]?.[1] ?? 0);
    const x2 = px(anillo[i + 1]?.[0] ?? 0);
    const y2 = py(anillo[i + 1]?.[1] ?? 0);
    const cruz = x1 * y2 - x2 * y1;
    area += cruz;
    sx += (x1 + x2) * cruz;
    sy += (y1 + y2) * cruz;
  }
  area /= 2;
  return {
    cx: Math.round((sx / (6 * area)) * 10) / 10,
    cy: Math.round((sy / (6 * area)) * 10) / 10,
  };
}

function pathDe(feature: FeatureProvincia): string {
  return feature.geometry.coordinates
    .map((anillo) => {
      const puntos = anillo.map((c) => `${String(px(c[0] ?? 0))},${String(py(c[1] ?? 0))}`);
      return `M${puntos.join(' L')} Z`;
    })
    .join(' ');
}

const provincias = coleccion.features
  .map((feature) => {
    const nombre = RENOMBRES[feature.properties.name] ?? feature.properties.name;
    const anilloExterior = feature.geometry.coordinates[0] ?? [];
    return { nombre, path: pathDe(feature), ...centroide(anilloExterior) };
  })
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

const lineas = provincias
  .map(
    (p) =>
      `  { nombre: ${JSON.stringify(p.nombre)}, cx: ${String(p.cx)}, cy: ${String(p.cy)}, path: ${JSON.stringify(p.path)} },`,
  )
  .join('\n');

writeFileSync(
  rutaSalida,
  `/**
 * GENERADO por scripts/build/build-mapa-argentina.ts — NO EDITAR A MANO.
 * Fuente: scripts/build/data/argentina-provincias.geojson (Natural Earth,
 * dominio público). Regenerar (desde v2/):
 * ./apps/api/node_modules/.bin/tsx scripts/build/build-mapa-argentina.ts
 */
export const MAPA_VIEWBOX = '0 0 ${String(ANCHO)} ${String(ALTO)}';

export interface ProvinciaSvg {
  /** Nombre canónico — coincide con geographic_locations.name. */
  nombre: string;
  /** Path SVG proyectado (equirectangular corregida). */
  path: string;
  /** Centroide en coordenadas del viewBox — ancla de los puntos de voz. */
  cx: number;
  cy: number;
}

export const PROVINCIAS_SVG: readonly ProvinciaSvg[] = [
${lineas}
];
`,
  'utf8',
);

process.stdout.write(`argentina-mapa.generated.ts: ${String(provincias.length)} provincias, viewBox 0 0 ${String(ANCHO)} ${String(ALTO)}\n`);
