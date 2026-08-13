#!/usr/bin/env tsx
/**
 * Extrae las teselas de la Argentina del planet de Protomaps a un único
 * `.pmtiles` que la app sirve desde su propio origen (plan
 * `docs/plans/2026-08-12-teselas-propias.md`, Task 2 — cierre de D-003).
 *
 * Correr desde `v2/`:
 *
 *   ./apps/api/node_modules/.bin/tsx scripts/build/mapa/extraer-teselas.ts --dry-run
 *   ./apps/api/node_modules/.bin/tsx scripts/build/mapa/extraer-teselas.ts
 *
 * (`pnpm exec tsx` no resuelve tsx desde la raíz del workspace; es el mismo
 * arranque que documenta `scripts/build/data/README.md`.)
 *
 * Requiere el CLI de Protomaps: `brew install pmtiles`. La cadencia con la que
 * hay que volver a correrlo —y la fecha de la última vez— están en el
 * `README.md` de esta carpeta.
 *
 * **Baja ~1,2 GB en unos 2 minutos** (medido el 12/8/2026: 481 range requests
 * grandes con 4 hilos, no millones de pedidos chicos). Si igual querés
 * desprenderlo de la terminal y mirar el log en vez de la pantalla:
 *
 *   nohup ./apps/api/node_modules/.bin/tsx scripts/build/mapa/extraer-teselas.ts \
 *     > /tmp/extraer-teselas.log 2>&1 < /dev/null & disown
 *
 * ## Qué hace, y por qué cada paso existe
 *
 * 1. **Resuelve el build vigente de Protomaps.** Los builds son diarios,
 *    se llaman `YYYYMMDD.pmtiles` y **se retienen unos 6 días**. Cualquier fecha
 *    escrita a mano en este archivo estaría vencida al mes siguiente, así que el
 *    script prueba hacia atrás desde hoy (UTC) hasta que una responda 200.
 *
 * 2. **Funde `apps/web/public/geo/provincias.geojson` en un solo MultiPolygon.**
 *    `pmtiles extract --region` quiere un `Polygon` o un `MultiPolygon` suelto y
 *    **rechaza un `FeatureCollection`**; el archivo del repo es una colección de
 *    24 `Polygon`, uno por provincia. El recorte del país en lugar de una caja
 *    rectangular es la mitad del ahorro: 1,2 GB contra 2,2 GB al mismo zoom.
 *
 * 3. **Levanta un proxy CONNECT local que abre los sockets con `family: 4`.**
 *    El binario de Go se cuelga contra el bucket de Protomaps cuando resuelve
 *    por IPv6 (`dial tcp [2606:4700:20::...]:443: i/o timeout`), aunque
 *    `curl -6` contra el mismo host devuelva 200. Go respeta `HTTPS_PROXY`, así
 *    que se lo manda por acá y el proxy fuerza IPv4. No hay forma de pedirle
 *    IPv4 al CLI directamente: por eso estas ~40 líneas de proxy.
 *
 * 4. **Corre `pmtiles extract`** contra el bucket remoto, bajando por rangos
 *    sólo las teselas que caen dentro del recorte.
 *
 * ## Zoom máximo: 15, y es una decisión tomada
 *
 * El plan escrito argumentaba z14 (592 MB) porque el salto a z15 son ~600 MB de
 * huellas de edificio y POIs que el estilo declaraba apagados. **El dueño eligió
 * z15**, y con él **las huellas de edificio se encienden en zoom alto**: la
 * trama de manzanas dice algo cívico, se ve la cuadra. Los POIs y los comercios
 * siguen apagados — un cartel de farmacia es ruido de mapa de navegación.
 * Bajar este número vuelve a abrir esa decisión: no se toca sin el dueño.
 *
 * ## El archivo no se commitea
 *
 * 1,2 GB en git es irreversible. `apps/web/public/tiles/` está en `.gitignore`
 * y **este script es la fuente de verdad de cómo se regenera**. Si el basemap
 * quedó viejo o el archivo se perdió, se vuelve a correr esto y listo.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { connect as conectarTcp } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Server } from 'node:http';
import type { Duplex } from 'node:stream';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ_V2 = join(AQUI, '..', '..', '..');

const BUCKET = 'https://build.protomaps.com';
/** Cuántos días hacia atrás probar antes de rendirse. La retención es ~6. */
const DIAS_A_PROBAR = 10;
/** Decisión del dueño, 12/8/2026. Ver la cabecera antes de cambiarlo. */
const ZOOM_MAXIMO = 15;
/** Puerto del proxy CONNECT. Local, efímero, muere con el script. */
const PUERTO_PROXY = 8899;

const FUENTE_GEO = join(RAIZ_V2, 'apps', 'web', 'public', 'geo', 'provincias.geojson');
const SALIDA_POR_DEFECTO = join(RAIZ_V2, 'apps', 'web', 'public', 'tiles', 'argentina.pmtiles');

/** Coordenadas GeoJSON, en el orden que manda la spec: [lon, lat]. */
type Posicion = readonly number[];
type Anillo = readonly Posicion[];
/** Un polígono es su anillo exterior seguido de sus huecos. */
type Poligono = readonly Anillo[];

interface RasgoProvincia {
  readonly geometry: { readonly type: string; readonly coordinates: unknown };
  readonly properties: { readonly name: string };
}

interface ColeccionProvincias {
  readonly type: string;
  readonly features: readonly RasgoProvincia[];
}

function registrar(mensaje: string): void {
  process.stdout.write(`${mensaje}\n`);
}

function fallar(mensaje: string): never {
  process.stderr.write(`\n${mensaje}\n\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

interface Opciones {
  readonly simulacro: boolean;
  readonly build: string | null;
  readonly maxzoom: number;
  readonly salida: string;
}

function leerOpciones(argv: readonly string[]): Opciones {
  let simulacro = false;
  let build: string | null = null;
  let maxzoom = ZOOM_MAXIMO;
  let salida = SALIDA_POR_DEFECTO;

  for (const arg of argv) {
    if (arg === '--dry-run') {
      simulacro = true;
    } else if (arg.startsWith('--build=')) {
      build = arg.slice('--build='.length);
    } else if (arg.startsWith('--maxzoom=')) {
      maxzoom = Number(arg.slice('--maxzoom='.length));
      if (!Number.isInteger(maxzoom) || maxzoom < 0 || maxzoom > 15) {
        fallar(`--maxzoom inválido: ${arg}`);
      }
    } else if (arg.startsWith('--salida=')) {
      salida = arg.slice('--salida='.length);
    } else {
      fallar(
        `Argumento desconocido: ${arg}\n` +
          'Uso: extraer-teselas.ts [--dry-run] [--build=YYYYMMDD] [--maxzoom=N] [--salida=RUTA]',
      );
    }
  }

  return { simulacro, build, maxzoom, salida };
}

// ---------------------------------------------------------------------------
// 1. Build vigente de Protomaps
// ---------------------------------------------------------------------------

/** `YYYYMMDD` en UTC, corrido `diasAtras` días. Los builds se fechan en UTC. */
function fechaDeBuild(diasAtras: number): string {
  const d = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);
  const anio = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(d.getUTCDate()).padStart(2, '0');
  return `${anio}${mes}${dia}`;
}

/** Código HTTP de un HEAD, o `0` si curl no llegó. */
function codigoHttp(url: string): number {
  const r = spawnSync(
    'curl',
    ['-sI', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', url],
    { encoding: 'utf8' },
  );
  return Number(r.stdout.trim()) || 0;
}

function resolverBuild(fijado: string | null): string {
  if (fijado !== null) {
    const codigo = codigoHttp(`${BUCKET}/${fijado}.pmtiles`);
    if (codigo !== 200) {
      fallar(`El build fijado ${fijado} devolvió ${codigo}. Los builds se retienen ~6 días.`);
    }
    registrar(`Build fijado a mano: ${fijado}`);
    return fijado;
  }

  for (let dias = 0; dias < DIAS_A_PROBAR; dias += 1) {
    const fecha = fechaDeBuild(dias);
    const codigo = codigoHttp(`${BUCKET}/${fecha}.pmtiles`);
    registrar(`  ${fecha}.pmtiles → ${codigo}`);
    if (codigo === 200) return fecha;
  }

  return fallar(
    `Ningún build vivo en los últimos ${DIAS_A_PROBAR} días. ` +
      'Revisá https://build.protomaps.com o pasá --build=YYYYMMDD.',
  );
}

// ---------------------------------------------------------------------------
// 2. El recorte del país, en un solo MultiPolygon
// ---------------------------------------------------------------------------

/**
 * Funde las 24 provincias en un `MultiPolygon`. No es una unión geométrica —
 * los bordes internos quedan — y no hace falta que lo sea: `--region` sólo
 * pregunta si cada tesela cae adentro de alguna parte.
 */
function fundirRegion(): { ruta: string; provincias: number } {
  const coleccion = JSON.parse(readFileSync(FUENTE_GEO, 'utf8')) as ColeccionProvincias;

  if (coleccion.type !== 'FeatureCollection') {
    fallar(`Se esperaba un FeatureCollection en ${FUENTE_GEO}, vino ${coleccion.type}.`);
  }

  const poligonos: Poligono[] = [];
  for (const rasgo of coleccion.features) {
    if (rasgo.geometry.type === 'Polygon') {
      poligonos.push(rasgo.geometry.coordinates as Poligono);
    } else if (rasgo.geometry.type === 'MultiPolygon') {
      // Un MultiPolygon ya trae una lista de polígonos: se aplana un nivel.
      poligonos.push(...(rasgo.geometry.coordinates as readonly Poligono[]));
    } else {
      fallar(`Geometría no soportada en ${rasgo.properties.name}: ${rasgo.geometry.type}`);
    }
  }

  if (poligonos.length === 0) fallar(`${FUENTE_GEO} no tiene una sola geometría.`);

  const ruta = join(tmpdir(), 'basta-region-argentina.geojson');
  writeFileSync(ruta, JSON.stringify({ type: 'MultiPolygon', coordinates: poligonos }), 'utf8');
  return { ruta, provincias: coleccion.features.length };
}

// ---------------------------------------------------------------------------
// 3. El proxy CONNECT que fuerza IPv4
// ---------------------------------------------------------------------------

interface ProxyVivo {
  readonly servidor: Server;
  cerrar: () => void;
}

function levantarProxy(puerto: number): Promise<ProxyVivo> {
  const abiertos = new Set<Duplex>();
  const servidor = createServer();

  servidor.on('connect', (req, cliente: Duplex, cabeza: Buffer) => {
    const destino = req.url ?? '';
    const corte = destino.lastIndexOf(':');
    const host = corte === -1 ? destino : destino.slice(0, corte);
    const puertoDestino = corte === -1 ? 443 : Number(destino.slice(corte + 1));

    // `family: 4` es todo el punto de este archivo: obliga a resolver y abrir
    // el socket por IPv4, que es donde el CLI de Go no se cuelga.
    const arriba = conectarTcp({ host, port: puertoDestino, family: 4 }, () => {
      cliente.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (cabeza.length > 0) arriba.write(cabeza);
      arriba.pipe(cliente);
      cliente.pipe(arriba);
    });

    abiertos.add(cliente);
    abiertos.add(arriba);

    // La extracción dura horas sobre las mismas conexiones: sin timeout.
    arriba.setTimeout(0);
    arriba.setNoDelay(true);

    const cerrarPar = (): void => {
      abiertos.delete(cliente);
      abiertos.delete(arriba);
      arriba.destroy();
      cliente.destroy();
    };

    arriba.on('error', cerrarPar);
    cliente.on('error', cerrarPar);
    arriba.on('close', cerrarPar);
    cliente.on('close', cerrarPar);
  });

  return new Promise<ProxyVivo>((resolver, rechazar) => {
    servidor.once('error', rechazar);
    servidor.listen(puerto, '127.0.0.1', () => {
      resolver({
        servidor,
        cerrar: () => {
          for (const s of abiertos) s.destroy();
          abiertos.clear();
          servidor.close();
        },
      });
    });
  });
}

// ---------------------------------------------------------------------------
// 4. La extracción
// ---------------------------------------------------------------------------

function correrExtract(args: readonly string[], puertoProxy: number): Promise<number> {
  return new Promise<number>((resolver) => {
    const hijo = spawn('pmtiles', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        HTTPS_PROXY: `http://127.0.0.1:${puertoProxy}`,
        HTTP_PROXY: `http://127.0.0.1:${puertoProxy}`,
        NO_PROXY: '',
      },
    });
    hijo.on('error', (err) => {
      process.stderr.write(`No se pudo lanzar pmtiles: ${err.message}\n`);
      resolver(127);
    });
    hijo.on('close', (codigo) => {
      resolver(codigo ?? 1);
    });
  });
}

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function principal(): Promise<void> {
  const opciones = leerOpciones(process.argv.slice(2));

  if (spawnSync('pmtiles', ['--help'], { encoding: 'utf8' }).error) {
    fallar('Falta el CLI de Protomaps. Instalalo con `brew install pmtiles`.');
  }

  registrar('Buscando el build vigente de Protomaps…');
  const build = resolverBuild(opciones.build);
  registrar(`Build elegido: ${build}.pmtiles\n`);

  const region = fundirRegion();
  registrar(`Recorte: ${region.provincias} provincias fundidas en un MultiPolygon → ${region.ruta}`);

  mkdirSync(dirname(opciones.salida), { recursive: true });

  const proxy = await levantarProxy(PUERTO_PROXY);
  registrar(`Proxy CONNECT (IPv4 forzado) escuchando en 127.0.0.1:${PUERTO_PROXY}\n`);

  const args = [
    'extract',
    `--bucket=${BUCKET}`,
    `${build}.pmtiles`,
    opciones.salida,
    `--region=${region.ruta}`,
    `--maxzoom=${opciones.maxzoom}`,
    ...(opciones.simulacro ? ['--dry-run'] : []),
  ];
  registrar(`$ pmtiles ${args.join(' ')}\n`);

  const inicio = Date.now();
  const codigo = await correrExtract(args, PUERTO_PROXY);
  proxy.cerrar();

  const minutos = ((Date.now() - inicio) / 60000).toFixed(1);
  if (codigo !== 0) {
    fallar(`pmtiles extract salió con código ${codigo} después de ${minutos} min.`);
  }

  if (opciones.simulacro) {
    registrar(`\nSimulacro terminado en ${minutos} min. No se bajó ninguna tesela.`);
    return;
  }

  const tamanio = statSync(opciones.salida).size;
  registrar(`\nListo en ${minutos} min: ${opciones.salida} — ${mb(tamanio)}`);
  registrar(`Verificalo con:  pmtiles show ${opciones.salida}`);
  registrar('El archivo NO se commitea: está en .gitignore.');
}

// Sin `await` de nivel superior: tsx transpila estos scripts a CJS (la raíz de
// v2 no declara `"type": "module"`) y esbuild lo rechaza en ese formato.
void principal().catch((err: unknown) => {
  fallar(err instanceof Error ? (err.stack ?? err.message) : String(err));
});
