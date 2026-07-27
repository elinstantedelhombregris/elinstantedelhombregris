/**
 * Guardia del cupo de dependencias de producción (`v2/CLAUDE.md`: «60-dep cap on
 * production deps»). El tope duro es 60; el de trabajo es 45, para que la deriva
 * se vea mucho antes de tocar el techo. Hoy son 38.
 *
 * Cuenta la UNIÓN de `dependencies` de `apps/*` y `packages/*`, sin
 * `packages/config/*` (son configuraciones de tooling: sus «dependencies» son
 * plugins de ESLint, no código que se sirva) y sin los paquetes del propio
 * workspace (`@v2/*`).
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
 * `packages/config/` es tooling: sus «dependencies» serían plugins de ESLint y de
 * Prettier, no código que se sirva. Hoy ni siquiera tiene `package.json` —por eso
 * el filtro se testea como predicado y no contra el disco—, pero el día que lo
 * tenga esta línea es lo único que lo mantiene fuera del cupo.
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

/** Enumera los workspaces desde el disco. Nunca desde una lista escrita a mano. */
export function leerPaquetes(raizV2: string): readonly PaqueteDeWorkspace[] {
  const paquetes: PaqueteDeWorkspace[] = [];

  for (const grupo of ['apps', 'packages']) {
    const dirGrupo = join(raizV2, grupo);
    for (const entrada of readdirSync(dirGrupo, { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      if (!cuentaEsteDirectorio(grupo, entrada.name)) continue;

      const manifiesto = leerManifiesto(join(dirGrupo, entrada.name, 'package.json'));
      if (!manifiesto) continue;

      paquetes.push({
        nombre: manifiesto.name ?? `${grupo}/${entrada.name}`,
        deps: Object.keys(manifiesto.dependencies ?? {}),
      });
    }
  }

  return paquetes;
}
