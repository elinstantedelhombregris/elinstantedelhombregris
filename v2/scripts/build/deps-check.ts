/**
 * CLI de la guardia de dependencias. Corre en CI como `pnpm deps:check`.
 *
 * Run: pnpm deps:check
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOPE_DEPS_PRODUCCION, depsUnicasDeProduccion, leerPaquetes } from './deps';

const RAIZ_V2 = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function main(): void {
  const unicas = depsUnicasDeProduccion(leerPaquetes(RAIZ_V2));

  if (unicas.length > TOPE_DEPS_PRODUCCION) {
    process.stderr.write(
      `Dependencias de producción: ${String(unicas.length)} (tope ${String(TOPE_DEPS_PRODUCCION)}).\n\n`,
    );
    for (const dep of unicas) process.stderr.write(`  · ${dep}\n`);
    process.stderr.write('\nSacá una antes de agregar otra, o escribí un ADR.\n');
    process.exit(1);
  }

  process.stdout.write(
    `Dependencias de producción OK: ${String(unicas.length)} de ${String(TOPE_DEPS_PRODUCCION)}.\n`,
  );
}

main();
