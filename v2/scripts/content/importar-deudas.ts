/**
 * Importa `docs/DEUDAS.md` al registro público de `/lo-que-falta`.
 *
 * Spec: `docs/specs/2026-08-12-lo-que-falta.md` §2.7.
 *
 *   pnpm deudas:importar            (desde v2/)
 *   pnpm deudas:importar --seco     (no escribe: dice qué haría)
 *
 * **El archivo manda.** Este script es de una sola dirección: lee el archivo y
 * lo deja reflejado en la base. Nada de lo que pasa en la base vuelve al
 * archivo — anotar una deuda sigue siendo escribir en el `.md` mientras se
 * programa, que es el bucle que no había que romper.
 *
 * Idempotente: correrlo dos veces seguidas no cambia nada la segunda vez. Lo
 * que la base tiene y el archivo ya no menciona **no se borra**: se marca
 * huérfano y se reporta acá, porque un registro que se vacía solo pierde la
 * memoria de por qué las cosas están como están.
 */
import { readFileSync } from 'node:fs';

import { FaltasRepository, getDb, type ResultadoDeImportacion } from '@v2/db';
import { config } from 'dotenv';

import { fusionar, leerDeudas } from './leer-deudas.js';

config({ path: new URL('../../.env', import.meta.url).pathname });

const RUTA_DEUDAS = new URL('../../../docs/DEUDAS.md', import.meta.url).pathname;

/** Los scripts de este repo escriben por stdout, no por console (regla `no-console`). */
function decir(linea: string): void {
  process.stdout.write(`${linea}\n`);
}

async function main(): Promise<void> {
  const seco = process.argv.includes('--seco');

  const deudas = fusionar(leerDeudas(readFileSync(RUTA_DEUDAS, 'utf8')));
  if (deudas.length === 0) {
    decir('No se leyó ninguna deuda de docs/DEUDAS.md — no se toca la base.');
    process.exitCode = 1;
    return;
  }

  const resueltas = deudas.filter((d) => d.resuelta).length;
  decir(
    `Leídas ${String(deudas.length)} deudas de docs/DEUDAS.md — ` +
      `${String(deudas.length - resueltas)} abiertas, ${String(resueltas)} resueltas.`,
  );

  if (seco) {
    for (const deuda of deudas) {
      decir(
        `  ${deuda.idPublico}  ${deuda.resuelta ? 'hecha  ' : 'anotada'}  ` +
          `${deuda.severidad ?? '—'}  ${deuda.titulo}`,
      );
    }
    decir('Corrida seca: no se escribió nada.');
    return;
  }

  const resultado: ResultadoDeImportacion = await new FaltasRepository(getDb()).importarDeudas(
    deudas.map((deuda) => ({
      idPublico: deuda.idPublico,
      titulo: deuda.titulo,
      cuerpo: deuda.cuerpo,
      severidad: deuda.severidad,
      resuelta: deuda.resuelta,
    })),
  );

  decir(
    `Creadas ${String(resultado.creadas)} · actualizadas ${String(resultado.actualizadas)} · ` +
      `intactas por estar bajadas ${String(resultado.intactas.length)}`,
  );

  if (resultado.intactas.length > 0) {
    decir(`  bajadas, no se pisaron: ${resultado.intactas.join(', ')}`);
  }

  if (resultado.huerfanas.length > 0) {
    decir(
      `⚠ ${String(resultado.huerfanas.length)} faltas quedaron huérfanas — ` +
        'están en la base y ya no en docs/DEUDAS.md:',
    );
    decir(`  ${resultado.huerfanas.join(', ')}`);
    decir('  No se borraron. Si el archivo las perdió por error, devolvelas ahí.');
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
