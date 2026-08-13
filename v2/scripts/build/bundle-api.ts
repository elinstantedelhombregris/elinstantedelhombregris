/**
 * Empaqueta `apps/api` en un solo archivo ejecutable por Node.
 *
 * Por qué existe (ADR 0008 D7): los tres paquetes del workspace publican
 * `./src/*.ts` en `main` y en `exports`, así que lo que emite `tsc` importa
 * TypeScript crudo y no arranca —está anotado como D-029—. Metiendo `@v2/db`,
 * `@v2/shared` y `@v2/civic-core` adentro del bundle, ningún bare-import de
 * `@v2/*` sobrevive al build y la resolución rota nunca llega a producción.
 *
 * Las dependencias de npm quedan EXTERNAS a propósito. Empaquetarlas también se
 * probó y **rompe pino**: `unable to determine transport target for
 * "pino-pretty"`, porque pino resuelve sus transports en runtime y el bundler se
 * lleva puesta esa resolución. Hoy sólo se cae en desarrollo —producción es JSON
 * a stdout, sin transport— pero un bundle que anda únicamente porque `NODE_ENV`
 * esquiva la mina no es un bundle que ande.
 *
 * Esas externas se resuelven desde `apps/api/node_modules`, así que la salida
 * tiene que quedar acá adentro: con pnpm no hay hoisting a `v2/node_modules` y
 * un bundle emitido en `v2/api/` no encuentra ni `cookie-parser`. Los archivos
 * que Vercel toma como funciones son los stubs commiteados de `v2/api/`, que no
 * hacen más que reexportar lo que este script emite.
 *
 * Uso: `pnpm api:bundle` desde `v2/`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..');

/** Prefijo de los únicos imports que se inlinean. Todo lo demás queda externo. */
const DEL_WORKSPACE = '@v2/';

interface PackageJson {
  readonly dependencies?: Readonly<Record<string, string>>;
}

/**
 * Las deps de npm de `apps/api` se marcan externas por nombre. Se leen del
 * package.json en vez de escribirlas a mano para que agregar una dependencia
 * no rompa el bundle en silencio.
 */
function dependenciasExternas(): readonly string[] {
  const crudo = readFileSync(join(raizV2, 'apps', 'api', 'package.json'), 'utf8');
  const pkg = JSON.parse(crudo) as PackageJson;
  return Object.keys(pkg.dependencies ?? {}).filter((nombre) => !nombre.startsWith(DEL_WORKSPACE));
}

/**
 * Cada entry y su nombre de salida, relativo a `apps/api/dist-bundle/` y sin
 * extensión (la pone `outExtension`).
 */
const ENTRIES: readonly { readonly desde: readonly string[]; readonly hacia: string }[] = [
  { desde: ['apps', 'api', 'src', 'vercel', 'handler.ts'], hacia: 'handler' },
  { desde: ['apps', 'api', 'src', 'vercel', 'cron-rankings.ts'], hacia: 'cron-rankings' },
  { desde: ['apps', 'api', 'src', 'vercel', 'cron-sesiones.ts'], hacia: 'cron-sesiones' },
];

async function main(): Promise<void> {
  const externas = dependenciasExternas();

  const resultado = await build({
    entryPoints: ENTRIES.map((e) => ({ in: join(raizV2, ...e.desde), out: e.hacia })),
    outdir: join(raizV2, 'apps', 'api', 'dist-bundle'),
    outExtension: { '.js': '.mjs' },
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    // Las deps de npm las resuelve Node en runtime; los `@v2/*` entran al bundle.
    external: [...externas, 'node:*'],
    sourcemap: false,
    minify: false,
    logLevel: 'warning',
    metafile: true,
  });

  const salidas = Object.entries(resultado.metafile.outputs);
  for (const [ruta, info] of salidas) {
    process.stdout.write(`${ruta} — ${String(Math.round(info.bytes / 1024))} KB\n`);
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`bundle-api falló: ${String(err)}\n`);
  process.exit(1);
});
