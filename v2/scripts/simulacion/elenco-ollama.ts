/**
 * El escritor de elencos con Ollama, y el comando que lo corre.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §4.2.1 · ADR 0009.
 *
 * ## El reparto de trabajo, otra vez y en una línea
 *
 * El modelo escribe la población **una sola vez**. La dinámica —quién habla,
 * quién adhiere, quién corrobora, qué mandato se forma— no lo llama nunca.
 * Medido: generar mil personas son ~2 h 43 min; correr la función sobre ellas,
 * 1,888 ms. El elenco cuesta unas 5.200 veces lo que cuesta el barrido entero
 * que lo usa, y por eso se congela con su huella.
 *
 * ## Qué escribe el modelo, exactamente
 *
 * Texto, oficio, tramo de edad, años de arraigo, y el **texto** de cada frase.
 * Nada más. El tipo y la clase de cada frase los pone el armador por posición,
 * el territorio lo pone la semilla, y la conducta entera la pone la regla. No
 * es una promesa del prompt: el JSON que se le pide **no tiene un campo donde
 * escribir un tipo**, así que no puede determinarlo aunque quiera. Es la regla
 * 6 hecha forma de dato.
 *
 * ## Cuando el modelo devuelve basura
 *
 * Se reintenta dos veces bajando la temperatura y después **se tira, con el
 * texto crudo a la vista**. No hay reparador de JSON truncado. MiroFish tiene
 * uno en tres servicios distintos, y eso no es robustez: es la señal de que el
 * pipeline entero se apoya en que un modelo devuelva JSON válido y de que a
 * menudo no lo devuelve. Un elenco reparado a medias es un elenco que nadie
 * revisó.
 */
import { dirname, resolve } from 'node:path';

import { armarElenco, territoriosDeProvincias } from './armar-elenco.js';
import { CompleterOllama } from './completer-ollama.js';
import { CORPUS_PROPIO, leerCorpus } from './corpus-semilla.js';
import { escribirElencoADisco } from './elenco-disco.js';
import { EscritorFabricado } from './escritor-falso.js';

import type { EscritorDeElenco, PedidoDeSemblanza, SemblanzaEscrita } from './armar-elenco.js';
import type { SelloDelModelo } from '../../packages/civic-core/src/simulacion/procedencia.js';

const SISTEMA = [
  'Escribís fichas de personas para una simulación cívica argentina.',
  'Contestás SIEMPRE con un único objeto JSON válido y nada más: sin ``` y sin explicaciones.',
  'Castellano rioplatense, voseo. Nada de inglés.',
  'La persona es verosímil y común: no es una heroína ni un caso extremo.',
].join(' ');

/** El pedido, con los campos enumerados y ningún otro. */
function prompt(pedido: PedidoDeSemblanza): string {
  const recorte = pedido.ancla.texto.slice(0, 1400);
  return [
    `Leé este fragmento de un documento del movimiento («${pedido.ancla.documento}», sección «${pedido.ancla.ancla}»):`,
    '',
    recorte,
    '',
    `Inventá UNA persona de ${pedido.territorioId} a la que ese fragmento le toque de cerca,`,
    'por acuerdo o por bronca. No repitas el fragmento: escribí a alguien que viva ahí.',
    '',
    'Devolvé exactamente este JSON:',
    '{',
    '  "texto": "cuatro o cinco oraciones: quién es, qué hace, qué le pasa con este tema, qué hizo hasta ahora",',
    '  "oficio": "una o dos palabras",',
    '  "tramoEdad": "uno de: 18-24, 25-34, 35-44, 45-59, 60-74, 75+",',
    '  "arraigoAnios": 12,',
    `  "frases": [${pedido.tiposPedidos.map(() => '"..."').join(', ')}]`,
    '}',
    '',
    `El array "frases" lleva ${String(pedido.tiposPedidos.length)} textos, en este orden y con este sentido:`,
    ...pedido.tiposPedidos.map((tipo, k) => `  ${String(k + 1)}. ${glosaDelTipo(tipo)}`),
    '',
    'Cada frase es lo que ESA persona escribiría en la app: una o dos oraciones, concreta,',
    'con el lugar adentro. Nada de consignas.',
  ].join('\n');
}

/**
 * Qué se le pide a cada frase, en criollo.
 *
 * El modelo recibe la glosa, no el nombre del tipo, y no elige entre ellas: el
 * orden viene dado. Si recibiera la lista de tipos para elegir, estaría
 * decidiendo si lo que dice esa persona se corrobora o se delibera.
 */
function glosaDelTipo(tipo: string): string {
  switch (tipo) {
    case 'basta':
      return 'algo que está mal en el lugar y no da para más, comprobable yendo a ver';
    case 'necesidad':
      return 'algo concreto que falta en el lugar, comprobable yendo a ver';
    case 'recurso':
      return 'algo que esta persona tiene y puede poner a disposición';
    case 'práctica':
      return 'algo que hacen ahí y que funciona, contado para que otro lo copie';
    case 'saber':
      return 'algo que aprendieron y conviene que no se pierda, con su fuente';
    case 'sueño':
      return 'cómo le gustaría que fuera el lugar dentro de diez años';
    case 'propuesta':
      return 'algo concreto que propone hacer, que se pueda empezar pronto';
    case 'compromiso':
      return 'algo a lo que se compromete ella misma, con un plazo';
    default:
      return 'una pregunta que quiere que alguien conteste y nadie contesta';
  }
}

interface Cruda {
  texto: string;
  oficio: string;
  tramoEdad: string;
  arraigoAnios: number;
  frases: string[];
}

/** El primer objeto JSON del texto. Sin reparaciones: o está o no está. */
function leerJson(bruto: string, cuantasFrases: number): Cruda | null {
  const inicio = bruto.indexOf('{');
  const fin = bruto.lastIndexOf('}');
  if (inicio === -1 || fin <= inicio) return null;
  let valor: unknown;
  try {
    valor = JSON.parse(bruto.slice(inicio, fin + 1)) as unknown;
  } catch {
    return null;
  }
  if (typeof valor !== 'object' || valor === null) return null;
  const o = valor as Record<string, unknown>;
  const frases = Array.isArray(o.frases) ? (o.frases as unknown[]) : null;
  if (
    typeof o.texto !== 'string' ||
    typeof o.oficio !== 'string' ||
    typeof o.tramoEdad !== 'string' ||
    frases?.length !== cuantasFrases ||
    !frases.every((f) => typeof f === 'string')
  ) {
    return null;
  }
  const arraigo = typeof o.arraigoAnios === 'number' ? o.arraigoAnios : Number(o.arraigoAnios);
  return {
    texto: o.texto,
    oficio: o.oficio,
    tramoEdad: o.tramoEdad,
    arraigoAnios: Number.isFinite(arraigo) ? Math.max(0, Math.round(arraigo)) : 0,
    frases: frases,
  };
}

export interface OpcionesDelEscritorOllama {
  readonly completer?: CompleterOllama;
  /** Cuántas veces se reintenta una persona antes de tirar. */
  readonly reintentos?: number;
  /** Se llama después de cada persona. Para la barra de progreso del comando. */
  readonly alAvanzar?: (hechas: number, total: number) => void;
}

/** El escritor real. Una llamada por persona, en serie y en orden de índice. */
export class EscritorOllama implements EscritorDeElenco {
  readonly nombre = 'ollama';
  readonly local = true;
  private readonly completer: CompleterOllama;
  private readonly reintentos: number;
  private readonly alAvanzar: ((hechas: number, total: number) => void) | undefined;

  constructor(opciones: OpcionesDelEscritorOllama = {}) {
    this.completer = opciones.completer ?? new CompleterOllama();
    this.reintentos = opciones.reintentos ?? 2;
    this.alAvanzar = opciones.alAvanzar;
  }

  async sello(): Promise<Omit<SelloDelModelo, 'poblacionHuella'> | null> {
    const ficha = await this.completer.ficha();
    return {
      modelo: `${ficha.modelo} (${ficha.parametros}, ${ficha.cuantizacion})`,
      digest: ficha.digest,
      // Temperatura 0: la generación es reproducible salvo por el propio
      // no-determinismo del backend, y la `Corrida` lo declara en vez de
      // suponerlo.
      temperatura: 0,
      semilla: 0,
      generadaEn: Date.now(),
    };
  }

  async escribir(pedidos: readonly PedidoDeSemblanza[]): Promise<readonly SemblanzaEscrita[]> {
    const salida: SemblanzaEscrita[] = [];
    for (const [hechas, pedido] of pedidos.entries()) {
      salida.push(await this.unaPersona(pedido));
      this.alAvanzar?.(hechas + 1, pedidos.length);
    }
    return salida;
  }

  private async unaPersona(pedido: PedidoDeSemblanza): Promise<SemblanzaEscrita> {
    let ultimo = '';
    for (let intento = 0; intento <= this.reintentos; intento += 1) {
      const completado = await this.completer.complete(
        [
          { role: 'system', content: SISTEMA },
          { role: 'user', content: prompt(pedido) },
        ],
        // Se baja la temperatura en cada reintento, no se sube: si la primera
        // salida no fue JSON, más creatividad no va a arreglarlo.
        { temperature: intento === 0 ? 0.6 : 0.1, maxTokens: 900 },
      );
      ultimo = completado.content;
      const cruda = leerJson(ultimo, pedido.tiposPedidos.length);
      if (cruda !== null) {
        return {
          texto: cruda.texto,
          oficio: cruda.oficio,
          tramoEdad: cruda.tramoEdad,
          arraigoAnios: cruda.arraigoAnios,
          frases: cruda.frases,
        };
      }
    }
    throw new Error(
      `El modelo no devolvió un JSON usable para la persona ${String(pedido.indice)} ` +
        `(${pedido.ancla.documento} · ${pedido.ancla.ancla}) después de ` +
        `${String(this.reintentos + 1)} intentos. No se repara a mano: un elenco reparado a ` +
        'medias es un elenco que nadie revisó.\n\nLo último que dijo:\n' +
        ultimo.slice(0, 600),
    );
  }
}

/* ------------------------------------------------------------------ *
 * El comando
 * ------------------------------------------------------------------ */

interface Argumentos {
  cuantas: number;
  semilla: number;
  grado: number;
  frases: number;
  escritor: 'fabricado' | 'ollama';
  salida: string;
}

function leerArgumentos(argv: readonly string[]): Argumentos {
  const mapa = new Map<string, string>();
  for (const arg of argv) {
    const m = /^--([a-z]+)=(.*)$/.exec(arg);
    if (m?.[1] !== undefined && m[2] !== undefined) mapa.set(m[1], m[2]);
  }
  const escritor = mapa.get('escritor') ?? 'fabricado';
  if (escritor !== 'fabricado' && escritor !== 'ollama') {
    throw new Error(`--escritor sólo acepta «fabricado» u «ollama», y llegó «${escritor}».`);
  }
  return {
    cuantas: Number(mapa.get('cuantas') ?? '200'),
    semilla: Number(mapa.get('semilla') ?? '7'),
    grado: Number(mapa.get('grado') ?? '8'),
    frases: Number(mapa.get('frases') ?? '3'),
    escritor,
    salida: mapa.get('salida') ?? 'content/elencos',
  };
}

async function main(): Promise<void> {
  const args = leerArgumentos(process.argv.slice(2));
  // La raíz de `v2/`, dos niveles arriba de `scripts/simulacion/`.
  const raiz = resolve(dirname(process.argv[1] ?? '.'), '../..');
  const corpus = leerCorpus(CORPUS_PROPIO.map((d) => resolve(raiz, d)));

  const decir = (linea: string): void => {
    // Es un comando de consola: escribir en la salida ES su interfaz. Se usa
    // `process.stdout` y no `console.log` porque `no-console` es error en el
    // repo y la excepción tiene que verse, no silenciarse con un `eslint-disable`.
    process.stdout.write(`${linea}\n`);
  };

  decir(`Corpus: ${String(corpus.anclas.length)} anclas de ${String(corpus.documentos.length)} documentos.`);
  decir(`Escritor: ${args.escritor} · elenco de ${String(args.cuantas)} · semilla ${String(args.semilla)}`);

  const escritor: EscritorDeElenco =
    args.escritor === 'ollama'
      ? new EscritorOllama({
          alAvanzar: (hechas, total) => {
            if (hechas % 10 === 0 || hechas === total) {
              decir(`  ${String(hechas)}/${String(total)}`);
            }
          },
        })
      : new EscritorFabricado(args.semilla);

  const elenco = await armarElenco(
    corpus.anclas,
    {
      cuantas: args.cuantas,
      semilla: args.semilla,
      grado: args.grado,
      frasesPorPersona: args.frases,
    },
    escritor,
  );

  const destino = escribirElencoADisco(elenco, resolve(raiz, args.salida), {
    escritor: escritor.nombre,
    semilla: args.semilla,
    grado: args.grado,
  });

  decir('');
  decir(`Elenco ${elenco.poblacion.huella} — ${String(elenco.poblacion.personas.length)} personas.`);
  decir(`Escrito en ${destino}`);
  decir('');
  decir('El sesgo, que va antes que cualquier resultado:');
  decir(`  documentos: ${String(elenco.sesgo.corpus.length)}`);
  decir(
    `  territorios sin nadie: ${
      elenco.sesgo.territoriosSinPersona.length === 0
        ? 'ninguno'
        : elenco.sesgo.territoriosSinPersona.join(', ')
    }`,
  );
  const peor = [...elenco.sesgo.porTerritorio].sort(
    (a, b) => Math.abs(b.desvio) - Math.abs(a.desvio),
  )[0];
  if (peor !== undefined) {
    decir(
      `  mayor desvío: ${peor.territorioId} ${(peor.desvio * 100).toFixed(1)} puntos ` +
        `(${(peor.fraccionElenco * 100).toFixed(1)}% del elenco contra ${(peor.fraccionPais * 100).toFixed(1)}% del país)`,
    );
  }
  decir(`  ${elenco.sesgo.advertencia}`);
}

/**
 * Sólo corre cuando lo invocan como comando, nunca al importarlo en un test.
 *
 * Se mira `process.argv[1]` y no `import.meta.url`: `tsx` transforma estos
 * archivos a CJS —la raíz no declara `"type": "module"`— y ahí no hay
 * top-level await ni `import.meta` confiable.
 */
if (process.argv[1]?.endsWith('elenco-ollama.ts') === true) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
}

export { main, leerArgumentos, leerJson, prompt, territoriosDeProvincias };
