/**
 * `pnpm simulacion:calibrar` — convierte la única sección estimada de la spec
 * en medición, antes de que nadie gaste la tarde.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §4.2.1 y §9.3.
 *
 * ## Qué mide y por qué
 *
 * El presupuesto del elenco sale de dos números que **nadie midió en esta
 * máquina**: el 70 % de eficiencia de decodificación y el 80 % de prefill.
 * Todo lo demás de la spec está medido; esos dos no, porque Ollama no está
 * instalado. Con ellos, mil personas son 2 h 43 min. Si el factor real fuera
 * 45 %, son más de cuatro horas.
 *
 * Esto corre tres prompts reales, lee lo que el propio Ollama informa de su
 * reloj —`prompt_eval_count`, `prompt_eval_duration`, `eval_count`,
 * `eval_duration`—, calcula el presupuesto del elenco pedido y **pide
 * confirmación**. Vale una hora y evita prometer «cinco mil personas en una
 * noche» sobre dos factores que nadie verificó.
 *
 * ## Y cuando Ollama no está
 *
 * Imprime cómo instalarlo y **sale con código 0**, no con error: no encontrar
 * el modelo local no es una falla del repositorio, es el estado de hoy (ADR
 * 0009, D4). El que quiera seguir sin modelo tiene el escritor fabricado, y
 * esto se lo dice.
 */
import { createInterface } from 'node:readline/promises';

import { CompleterOllama } from './completer-ollama.js';

import type { MedicionDeOllama } from './completer-ollama.js';

/** El prompt real, medido: ~890 tokens de entrada y ~575 de salida por persona. */
export const TOKENS_DE_UNA_PERSONA = { entrada: 890, salida: 575 } as const;

const PRUEBAS: readonly string[] = [
  'Contame en cuatro oraciones quién es una maestra de Formosa a la que le falta agua en la escuela.',
  'Contame en cuatro oraciones quién es un colectivero de La Matanza cansado de los baches.',
  'Contame en cuatro oraciones quién es una jubilada de Río Negro que organiza la olla del barrio.',
];

export interface Presupuesto {
  readonly prefillTokPorSeg: number;
  readonly decodeTokPorSeg: number;
  readonly segundosPorPersona: number;
  readonly personas: number;
  readonly segundosTotales: number;
}

/** La cuenta, a la vista y sin factores escondidos. */
export function presupuestar(
  mediciones: readonly MedicionDeOllama[],
  personas: number,
  paralelo: number,
): Presupuesto {
  let entrada = 0;
  let salida = 0;
  let prefillMs = 0;
  let decodeMs = 0;
  for (const m of mediciones) {
    entrada += m.entrada;
    salida += m.salida;
    prefillMs += m.prefillMs;
    decodeMs += m.decodeMs;
  }
  const prefillTokPorSeg = prefillMs === 0 ? 0 : entrada / (prefillMs / 1000);
  const decodeTokPorSeg = decodeMs === 0 ? 0 : salida / (decodeMs / 1000);

  const serie =
    (prefillTokPorSeg === 0 ? 0 : TOKENS_DE_UNA_PERSONA.entrada / prefillTokPorSeg) +
    (decodeTokPorSeg === 0 ? 0 : TOKENS_DE_UNA_PERSONA.salida / decodeTokPorSeg);
  /**
   * La decodificación por lotes en Apple Silicon amortiza la lectura de pesos
   * entre secuencias, así que con `OLLAMA_NUM_PARALLEL=4` el efectivo baja,
   * pero no se divide por cuatro. Se usa la raíz como aproximación conservadora
   * y se dice que es una aproximación, en vez de prometer un ×4 que nadie midió.
   */
  const segundosPorPersona = serie / Math.max(1, Math.sqrt(Math.max(1, paralelo)));

  return {
    prefillTokPorSeg,
    decodeTokPorSeg,
    segundosPorPersona,
    personas,
    segundosTotales: segundosPorPersona * personas,
  };
}

export function enCriollo(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.round((segundos % 3600) / 60);
  return h === 0 ? `${String(m)} min` : `${String(h)} h ${String(m)} min`;
}

const decir = (linea: string): void => {
  // Es un comando: escribir en la salida ES su interfaz.
  process.stdout.write(`${linea}\n`);
};

async function main(): Promise<void> {
  const personas = Number(
    /^--personas=(\d+)$/.exec(process.argv.slice(2).find((a) => a.startsWith('--personas=')) ?? '')?.[1] ??
      '1000',
  );
  const paralelo = Number(process.env.OLLAMA_NUM_PARALLEL ?? '4');

  const completer = new CompleterOllama();
  decir(`Calibrando contra ${completer.direccion} con ${completer.modelo}.`);
  decir('Tres prompts reales. Esto tarda un minuto y evita prometer una noche que no existe.');
  decir('');

  let ficha;
  try {
    ficha = await completer.ficha();
  } catch (error: unknown) {
    decir(error instanceof Error ? error.message : String(error));
    decir('');
    decir('No es un error del repositorio: hoy el modelo local no está, y eso ya estaba dicho.');
    // Salida 0 a propósito: la ausencia del modelo es el estado declarado de
    // hoy, no una falla. Salir con error haría rojo un CI que nunca va a tener
    // un demonio levantado.
    return;
  }

  decir(`Modelo: ${ficha.modelo} · ${ficha.parametros} · ${ficha.cuantizacion} · ${ficha.digest}`);
  decir('');

  const mediciones: MedicionDeOllama[] = [];
  for (const [i, prueba] of PRUEBAS.entries()) {
    const medicion = await completer.medir([{ role: 'user', content: prueba }], { maxTokens: 300 });
    mediciones.push(medicion);
    decir(
      `  ${String(i + 1)}/3 · entrada ${String(medicion.entrada)} tok en ${medicion.prefillMs.toFixed(0)} ms · ` +
        `salida ${String(medicion.salida)} tok en ${medicion.decodeMs.toFixed(0)} ms`,
    );
  }

  const p = presupuestar(mediciones, personas, paralelo);
  decir('');
  decir('MEDIDO, en esta máquina, ahora:');
  decir(`  prefill:       ${p.prefillTokPorSeg.toFixed(1)} tok/s`);
  decir(`  decodificación:${p.decodeTokPorSeg.toFixed(1)} tok/s`);
  decir('');
  decir(
    `Con el prompt real (${String(TOKENS_DE_UNA_PERSONA.entrada)} tok de entrada, ` +
      `${String(TOKENS_DE_UNA_PERSONA.salida)} de salida) y OLLAMA_NUM_PARALLEL=${String(paralelo)}:`,
  );
  decir(`  por persona:   ${p.segundosPorPersona.toFixed(1)} s`);
  decir(`  ${String(personas)} personas: ${enCriollo(p.segundosTotales)}`);
  decir('');
  decir('Contra eso, la función que las usa corre en ~1,9 ms. El elenco se genera UNA vez.');
  decir('');

  if (!process.stdin.isTTY) {
    decir('(sin terminal interactiva: no pregunto nada, esto era la cuenta)');
    return;
  }
  const consola = createInterface({ input: process.stdin, output: process.stdout });
  const respuesta = await consola.question('¿Generamos el elenco con estos números? [s/N] ');
  consola.close();
  decir(
    respuesta.trim().toLowerCase().startsWith('s')
      ? `Dale: pnpm simulacion:elenco --escritor=ollama --cuantas=${String(personas)}`
      : 'Listo, no se generó nada.',
  );
}

if (process.argv[1]?.endsWith('calibrar.ts') === true) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
}

export { main };
