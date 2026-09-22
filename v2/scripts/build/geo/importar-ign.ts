#!/usr/bin/env tsx
/**
 * Importa los límites del IGN —provincias, departamentos y municipios— a
 * `apps/web/public/geo/`. Cierra la geometría de D-011, D-004 y D-005.
 *
 * Correr desde `v2/`:
 *
 *   pnpm geo:ign -- --fuente=/private/tmp/geo-ign            # usa lo ya bajado
 *   pnpm geo:ign -- --fuente=/private/tmp/geo-ign --bajar    # baja del IGN primero
 *
 * Al final corre `pnpm geo:provincias`: el módulo de la API se sigue derivando
 * del GeoJSON de la web por el mismo script de siempre, así que las dos copias
 * no pueden divergir.
 *
 * **Las descargas crudas NO van al repo** (~320 MB entre las tres). Lo que se
 * commitea es la salida simplificada. Procedencia y licencia en
 * `scripts/build/data/README.md`.
 *
 * ## Qué hace, capa por capa
 *
 * 1. **Recorta al marco continental** (`MARCO`). La capa de provincias del IGN
 *    trae Tierra del Fuego con su sector antártico hasta el polo y las Georgias
 *    y Sandwich del Sur; cualquier consumidor que encuadre por los bounds del
 *    archivo —el dibujo de La Simulación, el rectángulo inscripto— quedaría
 *    con el continente en un rincón. Malvinas queda adentro del marco y se
 *    dibuja. Un punto en la Antártida o en las Georgias resuelve `null`, que
 *    es lo que ya pasaba.
 * 2. **Saca islas chicas** (sólo provincias y departamentos: en municipios un
 *    ejido suelto es un «isla» para mapshaper y se lo comería entero).
 * 3. **Simplifica con Douglas-Peucker a tolerancia en metros.** Se eligió DP y
 *    no Visvalingam porque su tolerancia es una garantía que se puede escribir:
 *    ningún vértice del límite original queda a más de `toleranciaM` metros
 *    del simplificado. Y la simplificación es topológica —mapshaper arma los
 *    arcos compartidos antes—, así que dos provincias vecinas se simplifican
 *    con el MISMO borde: no quedan huecos ni solapes donde un punto caiga en
 *    ninguna o en dos.
 * 4. **Nombra con el canon de la casa.** El nombre de cada provincia sale de
 *    `PROVINCIAS_CANONICAS` por código INDEC, no del IGN: el IGN dice «Tierra
 *    del Fuego, Antártida e Islas del Atlántico Sur» y la base «Tierra del
 *    Fuego» (D-012 fue exactamente este bug).
 * 5. **Chequea el techo de peso** de cada salida. Si se pasa, se simplifica
 *    más; no se sube el techo (regla de `scripts/build/data/README.md`).
 *
 * ## La clave de unión con `geographic_locations`
 *
 * `georefId` en cada feature es el `in1` del IGN: el código INDEC (2 dígitos
 * provincia, 5 departamento, 6 municipio). Es el mismo id que georef usa y que
 * el seed del callejero guarda en `geographic_locations.georef_id`. La unión
 * se hace por ese campo, nunca por nombre.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROVINCIAS_CANONICAS } from '../../../packages/civic-core/src/provincias-canonicas.js';

/** mapshaper fijo: una versión nueva puede simplificar distinto y mover bordes. */
const MAPSHAPER = 'mapshaper@0.7.66';

/** El WFS del IGN. `version=1.0.0` porque en 2.0.0 EPSG:4326 viene lat/lng. */
const WFS_IGN = 'https://wms.ign.gob.ar/geoserver/ign/ows';

/** [oeste, sur, este, norte] — continente, Tierra del Fuego, Estados y Malvinas. */
const MARCO = '-74.5,-56.5,-53,-21';

const RAIZ_V2 = fileURLToPath(new URL('../../../', import.meta.url));
const DESTINO = join(RAIZ_V2, 'apps', 'web', 'public', 'geo');

interface Capa {
  /** `typeName` del WFS del IGN. */
  readonly capaIgn: string;
  readonly archivo: string;
  /** Tolerancia de Douglas-Peucker, en metros. */
  readonly toleranciaM: number;
  /** Área mínima de una isla suelta para quedarse, en km². `null` = no filtrar. */
  readonly islaMinimaKm2: number | null;
  /** Techo de peso de la salida. Si se pasa, se sube la tolerancia, no el techo. */
  readonly techoKb: number;
  readonly propiedades: (crudas: PropiedadesIgn) => Record<string, string | null>;
}

interface PropiedadesIgn {
  in1?: string;
  nam?: string;
  gna?: string;
}

type Poligono = number[][][];

interface Rasgo {
  type: 'Feature';
  properties: Record<string, string | null>;
  geometry:
    | { type: 'Polygon'; coordinates: Poligono }
    | { type: 'MultiPolygon'; coordinates: Poligono[] };
}

const limpio = (texto: string | undefined): string | null => {
  const t = (texto ?? '').trim();
  return t === '' ? null : t;
};

const NOMBRE_POR_CODIGO = new Map(PROVINCIAS_CANONICAS.map((p) => [p.georefId, p.name]));

const CAPAS: readonly Capa[] = [
  {
    capaIgn: 'provincia',
    archivo: 'provincias.geojson',
    toleranciaM: 200,
    islaMinimaKm2: 1,
    techoKb: 650,
    propiedades: (p) => {
      const codigo = limpio(p.in1);
      const nombre = codigo === null ? undefined : NOMBRE_POR_CODIGO.get(codigo);
      if (codigo === null || nombre === undefined) {
        throw new Error(`Provincia del IGN sin código INDEC conocido: ${JSON.stringify(p)}`);
      }
      return { name: nombre, georefId: codigo };
    },
  },
  {
    capaIgn: 'departamento',
    archivo: 'departamentos.geojson',
    toleranciaM: 500,
    islaMinimaKm2: 1,
    techoKb: 1000,
    propiedades: (p) => {
      const codigo = limpio(p.in1);
      if (codigo === null || !/^\d{5}$/.test(codigo)) {
        throw new Error(`Departamento del IGN sin código de 5 dígitos: ${JSON.stringify(p)}`);
      }
      return {
        name: limpio(p.nam),
        georefId: codigo,
        provinciaGeorefId: codigo.slice(0, 2),
        tipo: limpio(p.gna),
      };
    },
  },
  {
    capaIgn: 'municipio',
    archivo: 'municipios.geojson',
    toleranciaM: 400,
    islaMinimaKm2: null,
    techoKb: 1800,
    propiedades: (p) => {
      const codigo = limpio(p.in1);
      const valido = codigo !== null && /^\d{6}$/.test(codigo);
      return {
        name: limpio(p.nam),
        georefId: valido ? codigo : null,
        provinciaGeorefId: valido ? codigo.slice(0, 2) : null,
        tipo: limpio(p.gna),
      };
    },
  },
];

// ── Argumentos ──────────────────────────────────────────────────────────────

const argumentos = process.argv.slice(2);

function carpetaFuente(): string {
  const valor = argumentos.find((a) => a.startsWith('--fuente='))?.slice('--fuente='.length);
  if (valor === undefined || valor === '') {
    process.stderr.write('Falta --fuente=<carpeta> con las descargas del IGN (fuera del repo).\n');
    process.exit(1);
  }
  return valor;
}

const fuente = carpetaFuente();
const bajar = argumentos.includes('--bajar');

const urlDeCapa = (capa: string): string =>
  `${WFS_IGN}?service=WFS&version=1.0.0&request=GetFeature&typeName=ign:${capa}` +
  `&outputFormat=application/json&srsName=EPSG:4326`;

const crudoDe = (capa: Capa): string => join(fuente, `ign_${capa.capaIgn}.json`);

// ── Geometría ───────────────────────────────────────────────────────────────

function poligonosDe(geometria: Rasgo['geometry'] | null): Poligono[] {
  if (geometria === null) return [];
  return geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates;
}

const verticesDe = (rasgos: readonly { geometry: Rasgo['geometry'] | null }[]): number =>
  rasgos.reduce(
    (n, r) =>
      n + poligonosDe(r.geometry).reduce((m, p) => m + p.reduce((k, a) => k + a.length, 0), 0),
    0,
  );

/**
 * Un mismo código en dos rasgos. Si los dos dicen el mismo nombre es un
 * municipio partido en dos pedazos (Machagai) y se une; si dicen nombres
 * distintos es un error de la fuente (El Rabón y Hardy comparten 822784) y a
 * los dos se les saca el código: adivinar cuál de los dos lo tiene bien sería
 * inventar la unión.
 */
function reconciliarCodigos(rasgos: Rasgo[]): { rasgos: Rasgo[]; avisos: string[] } {
  const avisos: string[] = [];
  const porCodigo = new Map<string, Rasgo[]>();
  for (const r of rasgos) {
    const codigo = r.properties.georefId;
    if (codigo === null || codigo === undefined) continue;
    porCodigo.set(codigo, [...(porCodigo.get(codigo) ?? []), r]);
  }
  const descartados = new Set<Rasgo>();
  for (const [codigo, grupo] of porCodigo) {
    if (grupo.length < 2) continue;
    const nombres = new Set(grupo.map((r) => r.properties.name));
    if (nombres.size === 1) {
      const [primero, ...resto] = grupo;
      if (primero === undefined) continue;
      primero.geometry = {
        type: 'MultiPolygon',
        coordinates: grupo.flatMap((r) => poligonosDe(r.geometry)),
      };
      for (const r of resto) descartados.add(r);
      avisos.push(`${codigo} venía en ${String(grupo.length)} pedazos; se unieron`);
    } else {
      for (const r of grupo)
        r.properties = { ...r.properties, georefId: null, provinciaGeorefId: null };
      avisos.push(`${codigo} lo comparten ${[...nombres].join(' y ')}; se les sacó el código`);
    }
  }
  return { rasgos: rasgos.filter((r) => !descartados.has(r)), avisos };
}

/** Una línea por rasgo: el diff de una regeneración se lee por provincia. */
function serializar(rasgos: readonly Rasgo[]): string {
  return `{"type":"FeatureCollection","features":[\n${rasgos
    .map((r) => JSON.stringify(r))
    .join(',\n')}\n]}\n`;
}

// ── Corrida ─────────────────────────────────────────────────────────────────

async function asegurarCrudo(capa: Capa): Promise<string> {
  const crudo = crudoDe(capa);
  if (!bajar && existsSync(crudo)) return crudo;
  if (!bajar) {
    throw new Error(
      `No está ${crudo}. Corré con --bajar o bajalo a mano:\n  ${urlDeCapa(capa.capaIgn)}`,
    );
  }
  process.stdout.write(`Bajando ign:${capa.capaIgn}…\n`);
  const respuesta = await fetch(urlDeCapa(capa.capaIgn));
  if (!respuesta.ok) {
    throw new Error(`El IGN respondió ${String(respuesta.status)} para ${capa.capaIgn}`);
  }
  writeFileSync(crudo, Buffer.from(await respuesta.arrayBuffer()));
  return crudo;
}

async function main(): Promise<void> {
  mkdirSync(fuente, { recursive: true });
  const temporal = join(tmpdir(), `geo-ign-${String(process.pid)}`);
  mkdirSync(temporal, { recursive: true });

  const excedidas: string[] = [];

  for (const capa of CAPAS) {
    const crudo = await asegurarCrudo(capa);

    const original = JSON.parse(readFileSync(crudo, 'utf8')) as {
      features: { geometry: Rasgo['geometry'] | null }[];
    };

    const salidaMapshaper = join(temporal, capa.archivo);
    execFileSync(
      'npx',
      [
        '--yes',
        MAPSHAPER,
        '-i',
        crudo,
        'snap',
        '-clip',
        `bbox=${MARCO}`,
        ...(capa.islaMinimaKm2 === null
          ? []
          : ['-filter-islands', `min-area=${String(capa.islaMinimaKm2)}km2`]),
        '-simplify',
        'dp',
        `interval=${String(capa.toleranciaM)}`,
        'keep-shapes',
        '-filter-fields',
        'in1,nam,gna',
        '-o',
        'format=geojson',
        'precision=0.0001',
        salidaMapshaper,
      ],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );

    const simplificada = JSON.parse(readFileSync(salidaMapshaper, 'utf8')) as {
      features: { properties: PropiedadesIgn; geometry: Rasgo['geometry'] | null }[];
    };

    // Un rasgo que el recorte dejó sin geometría (la Antártida) no se dibuja.
    const sinGeometria = simplificada.features.filter((f) => f.geometry === null);
    const conGeometria: Rasgo[] = simplificada.features.flatMap((f) =>
      f.geometry === null
        ? []
        : [
            {
              type: 'Feature' as const,
              properties: capa.propiedades(f.properties),
              geometry: f.geometry,
            },
          ],
    );
    const { rasgos, avisos } = reconciliarCodigos(conGeometria);
    rasgos.sort((a, b) =>
      `${a.properties.georefId ?? '~'}${a.properties.name ?? ''}`.localeCompare(
        `${b.properties.georefId ?? '~'}${b.properties.name ?? ''}`,
        'es',
      ),
    );

    const ruta = join(DESTINO, capa.archivo);
    writeFileSync(ruta, serializar(rasgos), 'utf8');
    const kb = statSync(ruta).size / 1024;

    process.stdout.write(
      `\n${capa.archivo}\n` +
        `  ${String(original.features.length)} rasgos del IGN → ${String(rasgos.length)} escritos\n` +
        `  ${verticesDe(original.features).toLocaleString('es-AR')} vértices → ${verticesDe(rasgos).toLocaleString('es-AR')}` +
        ` (DP ${String(capa.toleranciaM)} m)\n` +
        `  ${kb.toFixed(1)} KB / techo ${String(capa.techoKb)} KB\n`,
    );
    for (const f of sinGeometria) {
      process.stdout.write(
        `  · fuera del marco: ${f.properties.nam ?? '?'} (${f.properties.in1 ?? '?'})\n`,
      );
    }
    const sinCodigo = rasgos.filter((r) => r.properties.georefId === null);
    for (const r of sinCodigo) {
      process.stdout.write(`  · sin código INDEC: ${r.properties.name ?? '(sin nombre)'}\n`);
    }
    for (const aviso of avisos) process.stdout.write(`  · ${aviso}\n`);

    if (kb > capa.techoKb) {
      excedidas.push(
        `${capa.archivo}: ${kb.toFixed(1)} KB supera el techo de ${String(capa.techoKb)} KB`,
      );
    }
  }

  if (excedidas.length > 0) {
    process.stderr.write(
      `\nTecho de peso excedido. Subí la tolerancia de la capa, no el techo:\n` +
        excedidas.map((l) => `  ${l}\n`).join(''),
    );
    process.exit(1);
  }

  // El módulo de la API sale del GeoJSON recién escrito, por el script de siempre.
  execFileSync('pnpm', ['geo:provincias'], { cwd: RAIZ_V2, stdio: 'inherit' });
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
