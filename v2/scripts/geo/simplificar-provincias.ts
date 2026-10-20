/**
 * Los caminos del mapa de Ver (Mi Argentina ideal, spec 2026-10-19 §5): las 24
 * provincias de `apps/web/public/geo/provincias.geojson`, simplificadas a un
 * SVG liviano que no necesita maplibre.
 *
 * Uso, desde `v2/`:
 *
 *     pnpm exec tsx scripts/geo/simplificar-provincias.ts
 *
 * Escribe `apps/web/src/pages/MiArgentinaIdeal/ver/provincias-simples.json`:
 * `{ nombre, iso, d }[]`, con el ISO de `PROVINCIAS_CANONICAS` buscado por
 * nombre. La salida se commitea; el script sólo vuelve a correr si cambia la
 * geografía de origen.
 *
 * Es TypeScript y no `.mjs` porque `pnpm lint:scripts` revisa con tipos todo
 * `scripts/`, y un `.mjs` fuera de `scripts/tsconfig.json` no se puede leer.
 *
 * Cómo se simplifica, igual que el prototipo de `docs/demos/`:
 * - Proyección equirrectangular con `cos(-38°)`, 10 unidades por grado, con el
 *   origen en 74° O y 21,5° S: el país entra en un `viewBox="0 0 166 340"`.
 * - Ramer–Douglas–Peucker sobre cada anillo, partido en dos por el punto más
 *   lejano del primero. Un anillo cerrado tiene el primer punto igual al
 *   último, y el RDP ingenuo, que mide contra la cuerda de punta a punta,
 *   mediría contra una cuerda de largo cero y lo colapsaría.
 * - Tolerancia 0,16 (0,02 para la Ciudad, que si no queda en un triángulo).
 * - Se descartan los islotes y los huecos que, ya simplificados, tienen área
 *   menor que 1,2; el anillo exterior más grande de cada provincia queda siempre.
 * - Un decimal por coordenada, sin puntos repetidos seguidos.
 *
 * Sin dependencias: sólo `node:fs`, `node:path` y `node:url`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROVINCIAS_CANONICAS } from '../../packages/civic-core/src/provincias-canonicas.js';

export type Punto = readonly [number, number];

export type Geometria =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

export interface ColeccionDeProvincias {
  features: { properties: { name: string }; geometry: Geometria }[];
}

export interface ProvinciaSimple {
  nombre: string;
  iso: string;
  d: string;
}

export const ORIGEN = { lon: -74, lat: -21.5 } as const;
export const ESCALA = 10;
export const COS_LATITUD = Math.cos((-38 * Math.PI) / 180);
export const TOLERANCIA = 0.16;
export const TOLERANCIA_CIUDAD = 0.02;
export const AREA_MINIMA = 1.2;
export const VIEWBOX = '0 0 166 340';

const CIUDAD = 'Ciudad Autónoma de Buenos Aires';

/** De `[lon, lat]` (como en GeoJSON) a unidades del `viewBox`. */
export function proyectar(coordenada: readonly number[]): Punto {
  const [lon = 0, lat = 0] = coordenada;
  return [(lon - ORIGEN.lon) * COS_LATITUD * ESCALA, (ORIGEN.lat - lat) * ESCALA];
}

function distanciaAlSegmento(p: Punto, a: Punto, b: Punto): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const largo = dx * dx + dy * dy;
  const t =
    largo === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / largo));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * Ramer–Douglas–Peucker sobre una línea abierta. Iterativo: los anillos de la
 * costa tienen miles de puntos y la recursión no tiene por qué apilarse.
 */
export function rdp(puntos: readonly Punto[], tolerancia: number): Punto[] {
  const n = puntos.length;
  const primero = puntos[0];
  const ultimo = puntos[n - 1];
  if (n <= 2 || !primero || !ultimo) return puntos.slice();
  const queda = new Uint8Array(n);
  queda[0] = 1;
  queda[n - 1] = 1;
  const tramos: [number, number][] = [[0, n - 1]];
  for (let tramo = tramos.pop(); tramo; tramo = tramos.pop()) {
    const [desde, hasta] = tramo;
    const a = puntos[desde];
    const b = puntos[hasta];
    if (!a || !b) continue;
    let lejos = -1;
    let indice = -1;
    for (let i = desde + 1; i < hasta; i++) {
      const p = puntos[i];
      const d = p ? distanciaAlSegmento(p, a, b) : -1;
      if (d > lejos) {
        lejos = d;
        indice = i;
      }
    }
    if (indice !== -1 && lejos > tolerancia) {
      queda[indice] = 1;
      tramos.push([desde, indice], [indice, hasta]);
    }
  }
  return puntos.filter((_, i) => queda[i] === 1);
}

/**
 * Simplifica un anillo. Si viene cerrado (primero igual al último), lo abre, lo
 * parte en dos por el punto más lejano del primero y simplifica cada mitad.
 * Devuelve el anillo abierto: el cierre lo pone la `Z` del camino.
 */
export function simplificarAnillo(anillo: readonly Punto[], tolerancia: number): Punto[] {
  const primero = anillo[0];
  const ultimo = anillo[anillo.length - 1];
  if (!primero || !ultimo) return [];
  const cerrado = anillo.length > 1 && primero[0] === ultimo[0] && primero[1] === ultimo[1];
  const abierto = cerrado ? anillo.slice(0, -1) : anillo.slice();
  if (abierto.length < 4) return abierto;
  let lejos = -1;
  let k = 0;
  abierto.forEach((p, i) => {
    const d = Math.hypot(p[0] - primero[0], p[1] - primero[1]);
    if (d > lejos) {
      lejos = d;
      k = i;
    }
  });
  const ida = rdp(abierto.slice(0, k + 1), tolerancia);
  const vuelta = rdp([...abierto.slice(k), primero], tolerancia);
  return [...ida, ...vuelta.slice(1, -1)];
}

/** Área (sin signo) de un anillo abierto o cerrado, por la fórmula del cordón. */
export function area(anillo: readonly Punto[]): number {
  let s = 0;
  anillo.forEach((a, i) => {
    const b = anillo[(i + 1) % anillo.length] ?? a;
    s += a[0] * b[1] - b[0] * a[1];
  });
  return Math.abs(s) / 2;
}

/**
 * Los anillos ya simplificados, como un `d` de SVG: `M x y x y …Z` por anillo,
 * con un decimal y sin puntos repetidos seguidos. Un anillo que queda con menos
 * de tres puntos distintos no se dibuja.
 */
export function caminoDe(anillos: readonly (readonly Punto[])[]): string {
  return anillos
    .map((anillo) => {
      const pares: string[] = [];
      for (const [x, y] of anillo) {
        const par = `${x.toFixed(1)} ${y.toFixed(1)}`;
        if (pares[pares.length - 1] !== par) pares.push(par);
      }
      if (pares.length > 1 && pares[0] === pares[pares.length - 1]) pares.pop();
      return pares.length >= 3 ? `M${pares.join(' ')}Z` : '';
    })
    .join('');
}

/**
 * Los anillos que quedan de una geometría: proyectados, simplificados y sin
 * islotes ni huecos chicos. El área se mide sobre lo que queda dibujado. El
 * anillo exterior más grande queda siempre.
 */
export function anillosDe(geometria: Geometria, tolerancia: number): Punto[][] {
  const poligonos = geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates;
  const simplificados = poligonos.map((p) =>
    p.map((anillo) => simplificarAnillo(anillo.map(proyectar), tolerancia)),
  );
  const areas = simplificados.map((p) => area(p[0] ?? []));
  const mayor = areas.indexOf(Math.max(...areas));
  const salida: Punto[][] = [];
  simplificados.forEach((poligono, i) => {
    poligono.forEach((anillo, j) => {
      if ((i !== mayor || j !== 0) && area(anillo) < AREA_MINIMA) return;
      salida.push(anillo);
    });
  });
  return salida;
}

export function simplificarProvincias(
  coleccion: ColeccionDeProvincias,
  canonicas: readonly { name: string; isoCode: string }[] = PROVINCIAS_CANONICAS,
): ProvinciaSimple[] {
  const isoDe = new Map(canonicas.map((p) => [p.name, p.isoCode]));
  return coleccion.features.map((f) => {
    const nombre = f.properties.name;
    const iso = isoDe.get(nombre);
    if (!iso) throw new Error(`«${nombre}» no está en PROVINCIAS_CANONICAS.`);
    const tolerancia = nombre === CIUDAD ? TOLERANCIA_CIUDAD : TOLERANCIA;
    return { nombre, iso, d: caminoDe(anillosDe(f.geometry, tolerancia)) };
  });
}

function principal(): void {
  const v2 = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const origen = resolve(v2, 'apps/web/public/geo/provincias.geojson');
  const destino = resolve(v2, 'apps/web/src/pages/MiArgentinaIdeal/ver/provincias-simples.json');
  const coleccion = JSON.parse(readFileSync(origen, 'utf8')) as ColeccionDeProvincias;
  const provincias = simplificarProvincias(coleccion);
  if (provincias.length !== PROVINCIAS_CANONICAS.length)
    throw new Error(`Se esperaban 24 provincias y hay ${provincias.length}.`);
  const texto = `${JSON.stringify(provincias, null, 2)}\n`;
  writeFileSync(destino, texto);
  process.stdout.write(
    `${provincias.length} provincias, ${(texto.length / 1024).toFixed(1)} KB → ${destino}\n`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
