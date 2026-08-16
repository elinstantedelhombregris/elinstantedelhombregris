/**
 * El job de embebido de La Radiografía.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.3.
 *
 *   pnpm radiografia:embeber                       # senales, desde la base
 *   pnpm radiografia:embeber corpus.jsonl          # un JSONL de {id, texto}
 *   pnpm radiografia:embeber --seco                # dice qué haría, no toca nada
 *   pnpm radiografia:embeber --fuente dreams       # el corpus retirado, si hiciera falta
 *   pnpm radiografia:embeber corpus.jsonl --tanda 32 --limite 500
 *
 * ## Fuera de banda, y a mano
 *
 * No corre en el camino de escritura, no corre en serverless y no corre en un
 * cron (R3). Corre cuando alguien lo corre, y la consecuencia —que una señal
 * nueva no tenga vector hasta entonces— **no se esconde**: queda contada en
 * `analisis_corridas` y la cabecera de la página la declara (§3.2).
 *
 * ## Idempotente y reanudable
 *
 * Sólo embebe lo que no tiene vector **para ese modelo**. Cada tanda se guarda
 * apenas vuelve, así que un corte a la mitad deja lo hecho hecho y la próxima
 * corrida arranca donde quedó. Cambiar de modelo no borra nada: el modelo está
 * en la clave de `analisis_vectores` y las dos generaciones conviven.
 *
 * La fila de `analisis_corridas` se escribe **sólo si la corrida terminó**. Una
 * corrida que se rompe a la mitad no mueve el corte: lo que se guardó, se
 * guardó, pero la página no puede decir que sabe hasta ahí.
 *
 * ## El corpus de archivo
 *
 * Con una ruta como argumento, la fuente es un JSONL en vez de la base. Es lo
 * que permite probar esto con la base casi en cero (`D-002`) y lo que va a
 * permitir correr el análisis contra el volcado público el día que convenga,
 * sin que la página se entere (§4.3). Ojo con el `--fuente` que se le pase: el
 * rótulo con el que se guarda tiene que ser el que la página lee, y los ids del
 * archivo tienen que ser los mismos que publica el lector.
 *
 * Combinado con `--seco`, un archivo hace que la corrida no toque **ni la base
 * ni Ollama**: lee, cuenta y dice qué haría.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { AnalisisRepository, FUENTE_VIVA, getDb, type VectorParaGuardar } from '@v2/db';
import { config } from 'dotenv';

import { enTandas, leerJsonl, type FilaDeCorpus } from './corpus.js';
import { EmbebedorOllama } from './embebedor-ollama.js';

config({ path: new URL('../../.env', import.meta.url).pathname });

/**
 * La fuente por defecto: la tabla viva.
 *
 * Es el mismo literal que `FUENTE` en
 * `apps/api/src/features/radiografia/lectura.ts`, y tienen que coincidir: el
 * job escribe `analisis_vectores.fuente` con esto y la página lee filtrando por
 * eso. Con `dreams` acá —como estuvo hasta el 16/8/2026— el job embebía la
 * tabla retirada y la página no veía nada.
 *
 * Las fuentes que el repositorio sabe leer de la base son `FUENTES_LEGIBLES`;
 * cualquier otra se planta en vez de escribir filas invisibles.
 */
const FUENTE_POR_DEFECTO = FUENTE_VIVA;

/**
 * Cuántos textos por viaje a Ollama.
 *
 * Chico a propósito: un lote grande es un vector grande de vuelta y una tanda
 * perdida más grande si algo se corta. Treinta y dos entra cómodo en la memoria
 * de cualquier máquina que pueda correr `bge-m3`.
 */
const TANDA_POR_DEFECTO = 32;

/** Los scripts de este repo escriben por stdout, no por console (regla `no-console`). */
function decir(linea: string): void {
  process.stdout.write(`${linea}\n`);
}

interface Argumentos {
  ruta: string | null;
  fuente: string;
  tanda: number;
  limite: number | null;
  seco: boolean;
}

function enteroPositivo(bandera: string, crudo: string | undefined): number {
  const valor = Number(crudo);
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error(`${bandera} espera un entero positivo, y llegó «${String(crudo)}».`);
  }
  return valor;
}

export function leerArgumentos(argv: readonly string[]): Argumentos {
  let ruta: string | null = null;
  let fuente = FUENTE_POR_DEFECTO;
  let tanda = TANDA_POR_DEFECTO;
  let limite: number | null = null;
  let seco = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? '';
    if (arg === '--seco') {
      seco = true;
    } else if (arg === '--fuente') {
      i += 1;
      const valor = argv[i];
      if (valor === undefined || valor.length === 0) throw new Error('--fuente espera un nombre.');
      fuente = valor;
    } else if (arg === '--tanda') {
      i += 1;
      tanda = enteroPositivo('--tanda', argv[i]);
    } else if (arg === '--limite') {
      i += 1;
      limite = enteroPositivo('--limite', argv[i]);
    } else if (arg.startsWith('--')) {
      throw new Error(`No conozco la opción «${arg}». Las que hay: --fuente, --tanda, --limite, --seco.`);
    } else if (ruta === null) {
      ruta = arg;
    } else {
      throw new Error(`Sobra un argumento: «${arg}». Se lee un solo archivo por corrida.`);
    }
  }

  return { ruta, fuente, tanda, limite, seco };
}

/** Lo pendiente cuando el corpus es un archivo. */
function pendientesDeArchivo(ruta: string, limite: number | null, yaEmbebidos: Set<string>): FilaDeCorpus[] {
  const absoluta = resolve(process.cwd(), ruta);
  const leido = leerJsonl(readFileSync(absoluta, 'utf8'));

  decir(`Corpus: ${absoluta} — ${String(leido.filas.length)} filas con texto.`);
  if (leido.vacias > 0) {
    decir(`  ${String(leido.vacias)} líneas sin texto: no se embeben, no dicen nada.`);
  }
  if (leido.repetidos.length > 0) {
    decir(`  ⚠ ${String(leido.repetidos.length)} ids repetidos, gana el primero: ${leido.repetidos.join(', ')}`);
  }

  const faltantes = leido.filas.filter((fila) => !yaEmbebidos.has(fila.id));
  return limite === null ? faltantes : faltantes.slice(0, limite);
}

async function main(): Promise<void> {
  const opciones = leerArgumentos(process.argv.slice(2));
  const embebedor = new EmbebedorOllama();

  // El corte es el instante en que ARRANCA la corrida, no en el que termina:
  // una fila escrita mientras esto corría puede no haber entrado, y declarar
  // el final la daría por analizada. Ver el schema de `analisis_corridas`.
  const corte = new Date();

  decir(
    `Modelo ${embebedor.modelo} (${String(embebedor.dimensiones)} dimensiones) en ${embebedor.direccion}`,
  );
  decir(`Fuente «${opciones.fuente}»${opciones.seco ? ' — CORRIDA SECA' : ''}`);

  // La base se toca sólo cuando hace falta: un archivo en seco no la necesita,
  // y ése es justamente el modo en el que esto se puede probar hoy.
  const conBase = opciones.ruta === null || !opciones.seco;
  const repositorio = conBase ? new AnalisisRepository(getDb()) : null;

  let pendientes: FilaDeCorpus[];
  if (opciones.ruta === null) {
    if (repositorio === null) throw new Error('Sin archivo no hay corrida sin base.');
    const filas = await repositorio.faltanPorEmbeber({
      fuente: opciones.fuente,
      modelo: embebedor.modelo,
      ...(opciones.limite === null ? {} : { limite: opciones.limite }),
    });
    pendientes = filas.map((fila) => ({ id: fila.id, texto: fila.texto }));
  } else {
    const yaEmbebidos =
      repositorio === null ? new Set<string>() : await repositorio.idsEmbebidos(opciones.fuente, embebedor.modelo);
    pendientes = pendientesDeArchivo(opciones.ruta, opciones.limite, yaEmbebidos);
  }

  if (pendientes.length === 0) {
    decir('No falta embeber nada. Todo lo de esta fuente ya tiene vector para este modelo.');
    if (repositorio !== null && !opciones.seco) {
      await repositorio.anotarCorrida({
        modelo: embebedor.modelo,
        dimensiones: embebedor.dimensiones,
        fuente: opciones.fuente,
        procesadas: 0,
        corte,
      });
      decir(`Corte anotado en analisis_corridas: ${corte.toISOString()}`);
    }
    return;
  }

  const tandas = enTandas(pendientes, opciones.tanda);
  decir(`Faltan ${String(pendientes.length)} filas, en ${String(tandas.length)} tandas de ${String(opciones.tanda)}.`);

  if (opciones.seco) {
    for (const fila of pendientes.slice(0, 10)) {
      decir(`  ${fila.id}  ${fila.texto.slice(0, 72).replace(/\s+/g, ' ')}`);
    }
    if (pendientes.length > 10) decir(`  … y ${String(pendientes.length - 10)} más.`);
    decir('Corrida seca: no se llamó a Ollama y no se escribió nada.');
    return;
  }

  if (repositorio === null) throw new Error('Una corrida que escribe necesita base.');

  let procesadas = 0;
  for (const [indice, tanda] of tandas.entries()) {
    const vectores = await embebedor.embeber(tanda.map((fila) => fila.texto));

    const filas: VectorParaGuardar[] = tanda.map((fila, i) => {
      const vector = vectores[i];
      // No puede pasar —`embeber` ya afirmó que los largos coinciden— pero el
      // apareo por posición es el invariante que sostiene todo lo de abajo, y
      // un id pegado al vector equivocado no se nota nunca.
      if (vector === undefined) {
        throw new Error(`Falta el vector de la posición ${String(i)} de la tanda ${String(indice + 1)}.`);
      }
      return {
        fuente: opciones.fuente,
        fuenteId: fila.id,
        modelo: embebedor.modelo,
        dimensiones: embebedor.dimensiones,
        vector,
      };
    });

    const escritas = await repositorio.guardarVectores(filas);
    procesadas += filas.length;
    decir(
      `  tanda ${String(indice + 1)}/${String(tandas.length)} — ${String(escritas)} vectores guardados ` +
        `(${String(procesadas)}/${String(pendientes.length)})`,
    );
  }

  await repositorio.anotarCorrida({
    modelo: embebedor.modelo,
    dimensiones: embebedor.dimensiones,
    fuente: opciones.fuente,
    procesadas,
    corte,
  });

  decir(`Listo: ${String(procesadas)} filas embebidas. Corte anotado: ${corte.toISOString()}`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
