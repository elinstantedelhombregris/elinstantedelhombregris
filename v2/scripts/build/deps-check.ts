/**
 * CLI de la guardia de dependencias. Corre en CI como `pnpm deps:check`.
 *
 * Dos presupuestos separados, no uno: la plataforma (web + API + packages) y
 * la app nativa. El porqué está en `deps.ts`, junto a `TOPE_DEPS_MOVIL`.
 *
 * Run: pnpm deps:check
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TOPE_DEPS_MOVIL,
  TOPE_DEPS_PRODUCCION,
  depsUnicasDeProduccion,
  leerPaquetes,
  separarPorPresupuesto,
} from './deps';

import type { PaqueteDeWorkspace } from './deps';

const RAIZ_V2 = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Devuelve `true` si el presupuesto está excedido (y lo reporta). */
function revisar(
  etiqueta: string,
  paquetes: readonly PaqueteDeWorkspace[],
  tope: number,
): boolean {
  const unicas = depsUnicasDeProduccion(paquetes);

  if (unicas.length > tope) {
    process.stderr.write(
      `${etiqueta}: ${String(unicas.length)} dependencias de producción (tope ${String(tope)}).\n\n`,
    );
    for (const dep of unicas) process.stderr.write(`  · ${dep}\n`);
    process.stderr.write('\nSacá una antes de agregar otra, o escribí un ADR.\n\n');
    return true;
  }

  process.stdout.write(
    `${etiqueta}: ${String(unicas.length)} de ${String(tope)} dependencias de producción. OK.\n`,
  );
  return false;
}

function main(): void {
  const { plataforma, movil } = separarPorPresupuesto(leerPaquetes(RAIZ_V2));

  // Los dos se evalúan siempre, aunque el primero falle: quien corre esto
  // quiere ver el estado completo, no arreglar de a uno a ciegas.
  const excedidos = [
    revisar('Plataforma (web + API + packages)', plataforma, TOPE_DEPS_PRODUCCION),
    revisar('Móvil (apps/mobile)', movil, TOPE_DEPS_MOVIL),
  ];

  if (excedidos.some(Boolean)) process.exit(1);
}

main();
