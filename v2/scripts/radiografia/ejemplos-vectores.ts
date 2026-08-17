/**
 * El artefacto de vectores de los tres escenarios de ejemplo.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.1, §12.
 *
 *   pnpm radiografia:ejemplos            # regenera el artefacto
 *   pnpm radiografia:ejemplos --seco     # dice qué escribiría y no toca nada
 *
 * ## Por qué existe
 *
 * `pnpm radiografia:embeber` embebe el corpus **vivo** contra Ollama y guarda en
 * la base. Los tres escenarios de ejemplo no son corpus vivo: son 189 frases que
 * escribió una persona a mano, viven en el repositorio, no tienen fila en ninguna
 * tabla y se dibujan enteros en el navegador de quien entra a la página. Sus
 * vectores tienen que estar calculados **antes** y commiteados, o la página
 * dependería de una red que en el navegador no existe.
 *
 * ## Con qué modelo
 *
 * Con `EmbebedorFalso` de `@v2/civic-core`, que **no es un modelo**: es una bolsa
 * de palabras proyectada por hash a 1.024 dimensiones. No sabe que «guita» y
 * «plata» son lo mismo. Es determinista y no toca la red, que es exactamente lo
 * que hace falta para un artefacto reproducible — y el artefacto lo declara con
 * ese nombre, `falso`, para que la pantalla lo pueda decir sin adornos.
 *
 * El día que haya Ollama, este script cambia una línea —el embebedor— y los
 * números de la tabla del ejemplo cambian con él: los cosenos de un modelo de
 * verdad viven más arriba, así que el umbral del ejemplo se recalibra midiendo
 * otra vez, no heredando.
 *
 * ## Reproducible byte por byte
 *
 * Sin corpus tocado, dos corridas escriben el mismo archivo. Nada de relojes,
 * nada de `Date.now()` en la cabecera: lo único que identifica la corrida es el
 * `digesto` del corpus, que es una función del corpus y de nada más. Eso es lo
 * que permite verificar que el artefacto está al día con un `git diff` vacío.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  codificar,
  digestoDeCorpus,
} from '../../apps/web/src/pages/LaRadiografia/ejemplos/artefacto.js';
import { LOS_TRES_ESCENARIOS } from '../../apps/web/src/pages/LaRadiografia/ejemplos/index.js';
import { EmbebedorFalso } from '../../packages/civic-core/src/radiografia/embebedor.js';

import type { Escenario } from '../../apps/web/src/pages/LaRadiografia/ejemplos/index.js';

/**
 * Las vecinas por señal del grafo medido. Es el mismo `K_VECINAS` que usa la
 * página viva (`apps/web/src/lib/queries/radiografia.ts`) y tiene que serlo: si
 * el ejemplo enseñara el motor con otra `k`, enseñaría otro motor.
 */
const K = 12;

const DESTINO = fileURLToPath(
  new URL('../../apps/web/src/pages/LaRadiografia/ejemplos/vectores.ts', import.meta.url),
);

/**
 * El separador de `codificar` es un NUL, y en el archivo va **escapado**.
 *
 * Escribirlo crudo mete 1.477 bytes NUL en el generado, git lo clasifica
 * binario y `git diff` deja de mostrar el contenido — que es exactamente el
 * argumento por el que el artefacto guarda cadenas y no arreglos de pares: que
 * se pueda verificar que está al día mirando el diff. Escapado, el valor que
 * lee el navegador es idéntico y el archivo se puede leer.
 */
const escapar = (codificado: string): string => codificado.replaceAll('\u0000', '\\u0000');

/** Los scripts de este repo escriben por stdout, no por console. */
function decir(linea: string): void {
  process.stdout.write(`${linea}\n`);
}

async function armar(escenarios: readonly Escenario[]): Promise<string> {
  const embebedor = new EmbebedorFalso();
  const bloques: string[] = [];

  for (const escenario of escenarios) {
    const vectores = await embebedor.embeber(escenario.voces.map((v) => v.texto));
    const filas = escenario.voces.map((voz, i) => {
      const vector = vectores[i];
      if (vector === undefined) throw new Error(`sin vector para ${voz.id} de ${escenario.id}`);
      return `      ${voz.id}: '${escapar(codificar(vector))}',`;
    });
    bloques.push(`    ${escenario.id}: {\n${filas.join('\n')}\n    },`);
  }

  const digesto = digestoDeCorpus(escenarios);
  const noNulas = bloques.join('\n');

  return `/**
 * ARCHIVO GENERADO — no editar a mano.
 *
 * Se regenera con \`pnpm radiografia:ejemplos\`, desde
 * \`scripts/radiografia/ejemplos-vectores.ts\`. Qué es y qué lo invalida está
 * escrito en \`./artefacto.ts\`, que es donde vive el tipo.
 *
 * Los vectores los produjo el \`EmbebedorFalso\` de \`@v2/civic-core\`, que **no
 * es un modelo de lenguaje**: es una bolsa de palabras proyectada por hash. El
 * artefacto lo declara en \`modelo\` y la pantalla lo dice con todas las letras.
 * El día que haya un embebedor de verdad, esto se regenera y los números de la
 * tabla del ejemplo cambian.
 */
import type { ArtefactoDeVectores } from './artefacto';

export const ARTEFACTO_DE_VECTORES: ArtefactoDeVectores = {
  modelo: '${embebedor.modelo}',
  dimensiones: ${String(embebedor.dimensiones)},
  k: ${String(K)},
  digesto: '${digesto}',
  escenarios: {
${noNulas}
  },
};
`;
}

async function main(): Promise<void> {
  const seco = process.argv.includes('--seco');
  const contenido = await armar(LOS_TRES_ESCENARIOS);

  const voces = LOS_TRES_ESCENARIOS.reduce((total, e) => total + e.voces.length, 0);
  decir(
    `${String(LOS_TRES_ESCENARIOS.length)} escenarios · ${String(voces)} voces · k=${String(K)}`,
  );
  decir(`digesto del corpus: ${digestoDeCorpus(LOS_TRES_ESCENARIOS)}`);
  decir(`${String(contenido.length)} bytes`);

  if (seco) {
    decir('--seco: no se escribió nada.');
    return;
  }

  writeFileSync(DESTINO, contenido, 'utf8');
  decir(`escrito en ${DESTINO}`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
