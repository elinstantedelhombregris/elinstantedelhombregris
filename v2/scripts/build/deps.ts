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
 * `packages/config` en sí queda afuera por un corte PREVIO a cualquier
 * recursión: `leerPaquetes` evalúa `cuentaEsteDirectorio(grupo, entrada.name)`
 * antes de llamar a `buscarManifiestos`, así que para `entrada.name ===
 * 'config'` el `continue` corta el camino ahí mismo — ese subárbol
 * (`packages/config/eslint`, `.../prettier`, `.../typescript`) nunca se pisa,
 * igual que con el recorrido de un solo nivel de antes de este archivo tener
 * recursión. Lo que el descubrimiento RECURSIVO de `buscarManifiestos` agrega
 * de verdad no es este caso — es cubrir un paquete de workspace anidado
 * FUTURO, con otro nombre, que `cuentaEsteDirectorio` no contemple como caso
 * especial: ese sí quedaría expuesto a la recursión y se contaría, en vez de
 * quedar invisible en silencio para siempre (`pnpm-workspace.yaml` declara
 * `packages/*` Y `packages/config/*` como patrones de workspace separados, así
 * que ya sabemos que un paquete puede vivir un nivel más abajo de lo que
 * sugiere `apps/*` o `packages/*` a primera vista).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const TOPE_DEPS_PRODUCCION = 45;

/** El techo de `v2/CLAUDE.md`. Nunca se sube: se baja el de trabajo. */
export const TOPE_DURO_CLAUDE_MD = 60;

/**
 * `apps/mobile` tiene su propio presupuesto, y por eso no se suma al de la
 * plataforma.
 *
 * El cupo de `CLAUDE.md` se escribió cuando v2 era web + API: mide cuánto pesa
 * lo que se sirve por HTTP. Una app de React Native tiene un piso irreducible
 * distinto — `expo`, `react-native` y ~40 módulos `expo-*` que son el runtime,
 * no elecciones de arquitectura. Sumarlos al mismo número no mediría deriva,
 * mediría el hecho de tener una app nativa, y el guardia dejaría de decir algo
 * útil sobre cualquiera de los dos lados.
 *
 * Contarlos por separado conserva exactamente lo que el guardia protege: que
 * la plataforma no engorde sin que nadie se entere, y que el móvil tampoco.
 */
export const TOPE_DEPS_MOVIL = 52;

/** Los grupos de workspace que se miden contra el cupo de la plataforma. */
export const RUTA_MOVIL = 'apps/mobile';

export interface PaqueteDeWorkspace {
  readonly nombre: string;
  /** Ruta relativa al workspace (`apps/web`, `packages/db`). */
  readonly ruta: string;
  readonly deps: readonly string[];
}

/** Parte los paquetes en los dos presupuestos que se miden por separado. */
export function separarPorPresupuesto(paquetes: readonly PaqueteDeWorkspace[]): {
  plataforma: readonly PaqueteDeWorkspace[];
  movil: readonly PaqueteDeWorkspace[];
} {
  return {
    plataforma: paquetes.filter((p) => p.ruta !== RUTA_MOVIL),
    movil: paquetes.filter((p) => p.ruta === RUTA_MOVIL),
  };
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
 * (`@v2/config-eslint` lista nueve). `leerPaquetes` llama a este predicado
 * ANTES de invocar `buscarManifiestos` sobre cada entrada de primer nivel, así
 * que para `('packages', 'config')` el `continue` corta ahí mismo — esos tres
 * manifiestos anidados nunca se abren por el camino real. (`buscarManifiestos`
 * sí los encuentra si se la llama directo sobre `packages/config`, bypaseando
 * este filtro a propósito — ver `deps.test.ts`.)
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
 * puedan probar por separado (ver `deps.test.ts`: llamada directa sobre
 * `packages/config` —bypaseando el corte previo que aplica `leerPaquetes`
 * antes de llegar a esa carpeta— prueba que el recorrido SÍ baja a un
 * manifiesto anidado y lee sus `dependencies` reales).
 *
 * Si `dir` tiene su propio `package.json`, se lo toma como un paquete y no se
 * sigue bajando dentro de él (evita entrar a su `node_modules`/`src`). Si no,
 * se recorre cada subdirectorio en busca de un paquete un nivel más abajo.
 * `pnpm-workspace.yaml` declara `packages/*` Y `packages/config/*` como
 * patrones de workspace separados, así que este caso es real — pero
 * `packages/config` puntualmente no llega nunca hasta acá por el camino real
 * de `leerPaquetes` (la corta antes de llamar a esta función, ver arriba); lo
 * que esta recursión cubre de verdad es un paquete de workspace anidado
 * FUTURO, con otro nombre, que `cuentaEsteDirectorio` no filtre.
 *
 * `etiqueta` es el nombre de respaldo cuando el manifiesto no trae `name` —
 * workspace-relativo (p. ej. `packages/config/eslint`), no la ruta absoluta de
 * disco, para que un futuro mensaje de diagnóstico no termine imprimiendo una
 * ruta del disco de quien corra el guardia.
 */
export function buscarManifiestos(
  dir: string,
  etiqueta: string = dir,
): readonly PaqueteDeWorkspace[] {
  const manifiestoPropio = leerManifiesto(join(dir, 'package.json'));
  if (manifiestoPropio) {
    return [
      {
        nombre: manifiestoPropio.name ?? etiqueta,
        ruta: etiqueta,
        deps: Object.keys(manifiestoPropio.dependencies ?? {}),
      },
    ];
  }

  const paquetes: PaqueteDeWorkspace[] = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (!entrada.isDirectory() || esDirectorioDescartable(entrada.name)) continue;
    paquetes.push(
      ...buscarManifiestos(join(dir, entrada.name), `${etiqueta}/${entrada.name}`),
    );
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

      paquetes.push(
        ...buscarManifiestos(join(dirGrupo, entrada.name), `${grupo}/${entrada.name}`),
      );
    }
  }

  return paquetes;
}
