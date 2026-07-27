/**
 * Guardia del cupo de dependencias de producción (`v2/CLAUDE.md`: «60-dep cap on
 * production deps»). El tope duro es 60; el de trabajo (`TOPE_DEPS_PRODUCCION`) es
 * más bajo, para que la deriva se vea mucho antes de tocar el techo. El conteo
 * real de hoy sobre el repo se ve corriendo `pnpm deps:check`, no está escrito acá
 * a mano — un número fijo en un comentario queda desactualizado en el primer
 * `pnpm add`.
 *
 * Cuenta la UNIÓN de `dependencies` de `apps/*` y `packages/*`, sin
 * `packages/config/*` (son configuraciones de tooling: sus «dependencies» son
 * plugins de ESLint y Prettier, no código que se sirva) y sin los paquetes del
 * propio workspace (`@v2/*`).
 *
 * El descubrimiento de manifiestos es RECURSIVO: `pnpm-workspace.yaml` declara
 * `packages/*` Y `packages/config/*` como patrones de workspace separados, así
 * que un paquete puede vivir un nivel más abajo de lo que sugiere `apps/*` o
 * `packages/*` a primera vista (`packages/config/eslint/package.json`, por
 * ejemplo). Si `leerPaquetes` sólo mirara el primer nivel, el filtro de
 * `cuentaEsteDirectorio` nunca tendría nada que excluir — pasaría siempre porque
 * el manifiesto nunca se habría abierto, no porque el filtro lo haya descartado.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const TOPE_DEPS_PRODUCCION = 45;

/** El techo de `v2/CLAUDE.md`. Nunca se sube: se baja el de trabajo. */
export const TOPE_DURO_CLAUDE_MD = 60;

export interface PaqueteDeWorkspace {
  readonly nombre: string;
  readonly deps: readonly string[];
}

/** `@v2/shared`, `@v2/db`… no cuentan: son código de este repo. */
export function esDelWorkspace(dep: string): boolean {
  return dep.startsWith('@v2/');
}

/**
 * `packages/config/` es tooling: sus «dependencies» son plugins de ESLint y de
 * Prettier, no código que se sirva. El directorio en sí (`packages/config/`) no
 * tiene `package.json` propio, pero sus hijos sí (`packages/config/eslint`,
 * `.../prettier`, `.../typescript`), con dependencias de producción reales
 * (`@v2/config-eslint` lista nueve). `leerPaquetes` descubre esos manifiestos
 * recursivamente; esta línea es lo único que los saca del cupo antes de que
 * `depsUnicasDeProduccion` los cuente.
 */
export function cuentaEsteDirectorio(grupo: string, nombre: string): boolean {
  return !(grupo === 'packages' && nombre === 'config');
}

export function depsUnicasDeProduccion(
  paquetes: readonly PaqueteDeWorkspace[],
): readonly string[] {
  const unicas = new Set<string>();
  for (const paquete of paquetes) {
    for (const dep of paquete.deps) {
      if (!esDelWorkspace(dep)) unicas.add(dep);
    }
  }
  return [...unicas].sort((a, b) => a.localeCompare(b));
}

interface ManifiestoParcial {
  name?: string;
  dependencies?: Record<string, string>;
}

function leerManifiesto(ruta: string): ManifiestoParcial | undefined {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, 'utf8');
  } catch {
    return undefined;
  }
  return JSON.parse(crudo) as ManifiestoParcial;
}

/** Directorios que nunca son, ni contienen, un paquete de workspace. */
function esDirectorioDescartable(nombre: string): boolean {
  return nombre === 'node_modules' || nombre.startsWith('.');
}

/**
 * Busca manifiestos `package.json` a partir de `dir`, bajando tantos niveles
 * como haga falta. NO aplica `cuentaEsteDirectorio` — es el paso de
 * DESCUBRIMIENTO puro, separado a propósito del paso de filtrado para que se
 * puedan probar por separado (ver `deps.test.ts`: un manifiesto anidado se
 * descubre acá y recién se excluye en `leerPaquetes`).
 *
 * Si `dir` tiene su propio `package.json`, se lo toma como un paquete y no se
 * sigue bajando dentro de él (evita entrar a su `node_modules`/`src`). Si no,
 * se recorre cada subdirectorio en busca de un paquete un nivel más abajo — el
 * caso real es `packages/config/*`, que `pnpm-workspace.yaml` declara como su
 * propio patrón de workspace.
 */
export function buscarManifiestos(dir: string): readonly PaqueteDeWorkspace[] {
  const manifiestoPropio = leerManifiesto(join(dir, 'package.json'));
  if (manifiestoPropio) {
    return [
      {
        nombre: manifiestoPropio.name ?? dir,
        deps: Object.keys(manifiestoPropio.dependencies ?? {}),
      },
    ];
  }

  const paquetes: PaqueteDeWorkspace[] = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (!entrada.isDirectory() || esDirectorioDescartable(entrada.name)) continue;
    paquetes.push(...buscarManifiestos(join(dir, entrada.name)));
  }
  return paquetes;
}

/** Enumera los workspaces desde el disco. Nunca desde una lista escrita a mano. */
export function leerPaquetes(raizV2: string): readonly PaqueteDeWorkspace[] {
  const paquetes: PaqueteDeWorkspace[] = [];

  for (const grupo of ['apps', 'packages']) {
    const dirGrupo = join(raizV2, grupo);
    for (const entrada of readdirSync(dirGrupo, { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      if (!cuentaEsteDirectorio(grupo, entrada.name)) continue;

      paquetes.push(...buscarManifiestos(join(dirGrupo, entrada.name)));
    }
  }

  return paquetes;
}
