/**
 * El armado del elenco — la parte que NO escribe el modelo.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §3.8 y §7.1.
 *
 * ## La regla 6, hecha reparto de campos
 *
 * *La IA puede sugerir; nunca determina la verdad de una señal.* Traducida a
 * este archivo: **el modelo escribe pocos campos y están enumerados**.
 *
 * | Lo escribe el modelo | Lo asigna la regla y la semilla |
 * |---|---|
 * | el texto de la semblanza | el territorio |
 * | el oficio y el tramo de edad | la conducta entera (los siete campos) |
 * | los años de arraigo | los vínculos |
 * | **el texto** de cada frase | el **tipo** y la **clase** de cada frase |
 *
 * El corte no es de gusto: `tipo` y `clase` son exactamente los campos que
 * deciden si algo se corrobora o se delibera, o sea si una voz mueve nitidez o
 * sólo brillo. Un modelo que pudiera escribirlos estaría determinando la
 * verdad de una señal, no sugiriéndola. Y no hace falta confiar en el prompt:
 * el escritor **no tiene un campo donde ponerlos** — devuelve textos, y el tipo
 * se lo pone el armador por posición.
 *
 * ## Y la parte determinista existe para poder probar todo sin modelo
 *
 * Todo lo de este archivo es puro y sembrado. Con el escritor fabricado no
 * hace falta Ollama para correr la dinámica entera, y por eso CI puede
 * verificar el modo gente sin un demonio levantado — el mismo patrón que la
 * ADR 0009 ya usó para los embeddings.
 */
import { PROVINCIAS_REF } from '../../packages/civic-core/src/poblacion.js';
import { PROVINCIAS_CANONICAS } from '../../packages/civic-core/src/provincias-canonicas.js';
import { claseDe, TIPOS_SENAL } from '../../packages/civic-core/src/senal/vocabulario.js';
import { congelarElenco } from '../../packages/civic-core/src/simulacion/elenco.js';
import { azarDe } from '../../packages/civic-core/src/simulacion/espina/azar.js';

import type { Ancla } from './corpus-semilla.js';
import type { TipoSenal } from '../../packages/civic-core/src/senal/vocabulario.js';
import type { Elenco } from '../../packages/civic-core/src/simulacion/elenco.js';
import type { Persona, RadioAtencion } from '../../packages/civic-core/src/simulacion/poblacion.js';
import type { SelloDelModelo } from '../../packages/civic-core/src/simulacion/procedencia.js';
import type { Territorio } from '../../packages/civic-core/src/simulacion/tipos.js';

/** Se reexporta para que quien arme un elenco no tenga que importar de dos lados. */
export type { Ancla };

/** Propósitos del azar del armado. Distintos de los de la dinámica, a propósito. */
const PROPOSITO = {
  TERRITORIO: 201,
  PROPENSION: 202,
  CONSTANCIA: 203,
  ADHESION: 204,
  CORROBORACION: 205,
  RADIO: 206,
  MEZCLA: 207,
  VINCULO: 208,
} as const;

const RADIOS: readonly RadioAtencion[] = ['cuadra', 'barrio', 'municipio', 'provincia', 'pais'];

/** Los 24 territorios del país al nivel provincia, con población real. */
export function territoriosDeProvincias(): readonly Territorio[] {
  return Object.entries(PROVINCIAS_REF)
    .map(([nombre, ref]): Territorio => ({
      id: nombre,
      nombre,
      poblacion: ref.pob * 1000,
      km2: ref.km2 * 1000,
    }))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
}

const ID_DE_PROVINCIA = new Map(
  PROVINCIAS_CANONICAS.map((p) => [p.name, Number(p.georefId)] as const),
);

/* ------------------------------------------------------------------ *
 * El puerto del escritor
 * ------------------------------------------------------------------ */

/**
 * Lo que se le pide al escritor por cada persona.
 *
 * Lleva el texto del ancla —de dónde sale esta persona— y **los tipos de las
 * frases que hacen falta**, ya decididos por la regla. El escritor devuelve
 * textos en el mismo orden y no puede opinar sobre el tipo.
 */
export interface PedidoDeSemblanza {
  readonly indice: number;
  readonly ancla: Ancla;
  readonly territorioId: string;
  readonly tiposPedidos: readonly TipoSenal[];
}

/** Lo único que el escritor puede devolver. No hay campo para `tipo` ni `clase`. */
export interface SemblanzaEscrita {
  readonly texto: string;
  readonly oficio: string;
  readonly tramoEdad: string;
  readonly arraigoAnios: number;
  /** Un texto por cada tipo pedido, en el mismo orden. */
  readonly frases: readonly string[];
}

/**
 * El puerto.
 *
 * Mismo patrón que `Embebedor` en `civic-core/src/radiografia/`: una interfaz
 * pura, una implementación real contra Ollama que vive afuera del paquete, y
 * un doble determinista para que los tests corran sin demonio. La ADR 0009 lo
 * llama «la garantía de reversibilidad», y es lo que dejó ejecutar ocho tareas
 * sin esperar a la decisión de proveedor.
 */
export interface EscritorDeElenco {
  readonly nombre: string;
  /**
   * Si el texto sale de esta máquina.
   *
   * El armador **aborta** si es `false`. No alcanza con confiar en el orden de
   * un `if`: `getAICompleter()` elige Groq apenas ve `GROQ_API_KEY` en el
   * ambiente —y esa clave está en el `.env` de esta máquina—, así que un
   * completer local agregado al final de esa cadena nunca se usaría y el
   * corpus saldría a un proveedor externo en silencio.
   */
  readonly local: boolean;
  /**
   * El sello del modelo, sin la huella —que todavía no existe—. `null` cuando
   * no hubo modelo: un elenco fabricado por una fórmula **no es** una hipótesis
   * de modelo, y darle un sello inventado sería peor que no tener ninguno.
   */
  sello(): Promise<Omit<SelloDelModelo, 'poblacionHuella'> | null>;
  escribir(pedidos: readonly PedidoDeSemblanza[]): Promise<readonly SemblanzaEscrita[]>;
}

/* ------------------------------------------------------------------ *
 * El armado
 * ------------------------------------------------------------------ */

export interface OpcionesDeArmado {
  readonly cuantas: number;
  readonly semilla: number;
  /** Vínculos por persona. El mecanismo después decide cuántos se atienden. */
  readonly grado: number;
  /** Cuántas frases por persona. Una por tipo, sorteadas de su mezcla. */
  readonly frasesPorPersona?: number;
  readonly territorios?: readonly Territorio[];
  /** El elenco del que éste se deriva al editarlo (regla 6: reversible). */
  readonly padre?: string | null;
}

const acotar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

/** Elige un índice por peso. `-1` si no hay nada que elegir. */
function elegirPorPeso(pesos: readonly number[], sorteo: number): number {
  let total = 0;
  for (const p of pesos) total += Math.max(0, p);
  if (total <= 0) return -1;
  let acumulado = 0;
  const objetivo = sorteo * total;
  for (let i = 0; i < pesos.length; i += 1) {
    acumulado += Math.max(0, pesos[i] ?? 0);
    if (objetivo < acumulado) return i;
  }
  return pesos.length - 1;
}

/**
 * De qué familia del corpus viene el ancla.
 *
 * Sesga la mezcla de tipos de la persona, y es una de las dos formas en que el
 * corpus deja marca medible en la conducta: quien sale de un PLAN propone y
 * pregunta más; quien sale de la bitácora dice más ¡basta! y más necesidades;
 * quien sale de un ensayo aporta más saber. **Está declarado acá y no adentro
 * del prompt** justamente para que se pueda leer, discutir y barrer.
 */
function sesgoDeFamilia(documento: string): Readonly<Record<TipoSenal, number>> {
  const familia = documento.split('/')[0] ?? '';
  if (familia === 'planes') {
    return {
      basta: 0.6, necesidad: 1, recurso: 0.6, práctica: 0.8, saber: 0.8,
      sueño: 0.8, propuesta: 1.6, compromiso: 0.8, pregunta: 1.2,
    };
  }
  if (familia === 'ensayos') {
    return {
      basta: 0.8, necesidad: 0.6, recurso: 0.4, práctica: 0.8, saber: 1.8,
      sueño: 1.2, propuesta: 0.6, compromiso: 0.4, pregunta: 1.4,
    };
  }
  return {
    basta: 1.8, necesidad: 1.4, recurso: 1, práctica: 0.8, saber: 0.6,
    sueño: 0.8, propuesta: 0.6, compromiso: 0.8, pregunta: 0.6,
  };
}

/**
 * Arma el elenco.
 *
 * Dos pasadas: primero se decide todo lo que decide la regla —territorio,
 * conducta, vínculos, qué tipos de frase hacen falta—, después se le pide al
 * escritor la textura de todas las personas de una. Ese orden no es
 * casualidad: si el escritor decidiera algo, no se podría reproducir el elenco
 * sin volver a llamarlo.
 */
export async function armarElenco(
  anclas: readonly Ancla[],
  opciones: OpcionesDeArmado,
  escritor: EscritorDeElenco,
): Promise<Elenco> {
  if (!escritor.local) {
    throw new Error(
      `El escritor «${escritor.nombre}» no corre en esta máquina. El corpus del proyecto no sale ` +
        'a ningún proveedor externo: es la ADR 0009 y no tiene excepción por comodidad. ' +
        'Usá el escritor de Ollama (127.0.0.1:11434) o el fabricado.',
    );
  }
  if (anclas.length === 0) {
    throw new Error('No hay anclas de corpus: sin texto propio no se siembra a nadie.');
  }

  const n = Math.max(1, Math.trunc(opciones.cuantas));
  const cuantasFrases = Math.max(1, opciones.frasesPorPersona ?? 3);
  const territorios = opciones.territorios ?? territoriosDeProvincias();
  const pesosTerritorio = territorios.map((t) => Math.max(0, t.poblacion));

  // ---- Pasada 1: lo que decide la regla. ----
  const territorioDe: string[] = [];
  const anclaDe: Ancla[] = [];
  const conductas: {
    propension: number;
    constanciaPersonal: number;
    umbralAdhesion: number;
    umbralCorroboracion: number;
    radioAtencion: RadioAtencion;
    mezclaTipos: Record<TipoSenal, number>;
  }[] = [];
  const tiposPedidos: TipoSenal[][] = [];

  for (let i = 0; i < n; i += 1) {
    // El ancla se recorre en orden y no al azar: con menos personas que
    // secciones, un sorteo dejaría documentos enteros sin representar y el
    // sesgo del elenco sería peor de lo que dice su propia medición.
    const ancla = anclas[i % anclas.length];
    if (ancla === undefined) continue;
    anclaDe.push(ancla);

    const indiceTerritorio = elegirPorPeso(
      pesosTerritorio,
      azarDe(opciones.semilla, i, PROPOSITO.TERRITORIO),
    );
    territorioDe.push(territorios[indiceTerritorio === -1 ? 0 : indiceTerritorio]?.id ?? '');

    const sesgo = sesgoDeFamilia(ancla.documento);
    const mezclaTipos = {} as Record<TipoSenal, number>;
    for (const [k, tipo] of TIPOS_SENAL.entries()) {
      // El sesgo de la familia por un ruido propio: dos personas del mismo
      // documento se parecen sin ser la misma.
      mezclaTipos[tipo] =
        sesgo[tipo] * (0.4 + 1.2 * azarDe(opciones.semilla, i, k, PROPOSITO.MEZCLA));
    }

    conductas.push({
      propension: acotar(0.04 + 0.5 * azarDe(opciones.semilla, i, PROPOSITO.PROPENSION) ** 2, 0, 1),
      constanciaPersonal: acotar(azarDe(opciones.semilla, i, PROPOSITO.CONSTANCIA), 0, 1),
      umbralAdhesion: acotar(0.05 + 0.6 * azarDe(opciones.semilla, i, PROPOSITO.ADHESION), 0, 1),
      umbralCorroboracion: acotar(
        0.2 + 0.7 * azarDe(opciones.semilla, i, PROPOSITO.CORROBORACION),
        0,
        1,
      ),
      radioAtencion:
        RADIOS[
          Math.min(RADIOS.length - 1, Math.floor(azarDe(opciones.semilla, i, PROPOSITO.RADIO) * RADIOS.length))
        ] ?? 'barrio',
      mezclaTipos,
    });

    const pedidos: TipoSenal[] = [];
    for (let f = 0; f < cuantasFrases; f += 1) {
      const indice = elegirPorPeso(
        TIPOS_SENAL.map((t) => mezclaTipos[t]),
        azarDe(opciones.semilla, i, f, PROPOSITO.MEZCLA + 1),
      );
      pedidos.push(TIPOS_SENAL[indice === -1 ? 0 : indice] ?? 'basta');
    }
    tiposPedidos.push(pedidos);
  }

  const total = anclaDe.length;
  const vinculos = tejerVinculos(territorioDe, opciones.semilla, opciones.grado, total);

  // ---- Pasada 2: la textura. Una sola tanda, y el escritor decide su ritmo. ----
  const pedidos: PedidoDeSemblanza[] = [];
  for (let i = 0; i < total; i += 1) {
    const ancla = anclaDe[i];
    const territorioId = territorioDe[i];
    const tipos = tiposPedidos[i];
    if (ancla === undefined || territorioId === undefined || tipos === undefined) continue;
    pedidos.push({ indice: i, ancla, territorioId, tiposPedidos: tipos });
  }

  const escritas = await escritor.escribir(pedidos);
  if (escritas.length !== pedidos.length) {
    throw new Error(
      `El escritor «${escritor.nombre}» devolvió ${String(escritas.length)} semblanzas para ` +
        `${String(pedidos.length)} pedidos. El armador aparea por POSICIÓN: con largos distintos, ` +
        'cada semblanza quedaría pegada a la persona equivocada y nada se rompería a la vista.',
    );
  }

  const personas: Persona[] = [];
  for (let i = 0; i < total; i += 1) {
    const ancla = anclaDe[i];
    const conducta = conductas[i];
    const escrita = escritas[i];
    const tipos = tiposPedidos[i];
    const territorioId = territorioDe[i];
    if (
      ancla === undefined ||
      conducta === undefined ||
      escrita === undefined ||
      tipos === undefined ||
      territorioId === undefined
    ) {
      continue;
    }

    personas.push({
      id: i,
      origen: { documento: ancla.documento, ancla: ancla.ancla, sha: ancla.sha },
      territorio: {
        territorioId,
        provinciaId: ID_DE_PROVINCIA.get(territorioId) ?? 0,
        departamentoId: null,
        localidadId: null,
        celdaId: `${territorioId}#${String(i % 64)}`,
      },
      conducta: {
        ...conducta,
        vinculos: vinculos[i] ?? [],
      },
      semblanza: {
        texto: escrita.texto,
        oficio: escrita.oficio,
        tramoEdad: escrita.tramoEdad,
        arraigoAnios: escrita.arraigoAnios,
        // El tipo lo pone el armador y la clase se deriva con `claseDe`, la
        // misma función que usa la ingesta real. El escritor sólo puso texto.
        frases: tipos.map((tipo, k) => ({
          tipo,
          clase: claseDe(tipo),
          texto: escrita.frases[k] ?? '',
        })),
      },
    });
  }

  const corpus = contarCorpus(anclaDe);
  return congelarElenco(
    {
      personas,
      padre: opciones.padre ?? null,
      sello: await escritor.sello(),
      corpus,
    },
    territorios,
  );
}

/**
 * Teje la topología: vecinos del mismo territorio, y algunos lejos.
 *
 * La homofilia territorial no es adorno — es lo que hace que el contagio se
 * propague por provincia y que el mapa del resto tenga algo que mostrar. Los
 * vínculos lejanos evitan que cada provincia sea un mundo aislado, que sería
 * la otra caricatura.
 */
function tejerVinculos(
  territorioDe: readonly string[],
  semilla: number,
  grado: number,
  total: number,
): readonly (readonly number[])[] {
  const porTerritorio = new Map<string, number[]>();
  for (let i = 0; i < total; i += 1) {
    const t = territorioDe[i];
    if (t === undefined) continue;
    const lista = porTerritorio.get(t);
    if (lista === undefined) porTerritorio.set(t, [i]);
    else lista.push(i);
  }

  const cuantos = Math.max(0, Math.trunc(grado));
  const salida: number[][] = [];
  for (let i = 0; i < total; i += 1) {
    const vecinos = porTerritorio.get(territorioDe[i] ?? '') ?? [];
    const elegidos = new Set<number>();
    for (let k = 0; k < cuantos; k += 1) {
      // Uno de cada cuatro vínculos sale del territorio: el resto es local.
      const lejos = k % 4 === 3 || vecinos.length <= 1;
      const sorteo = azarDe(semilla, i, k, PROPOSITO.VINCULO);
      const vecino = vecinos[Math.floor(sorteo * vecinos.length)];
      const candidato = lejos || vecino === undefined ? Math.floor(sorteo * total) : vecino;
      if (candidato !== i && candidato >= 0 && candidato < total) elegidos.add(candidato);
    }
    salida.push([...elegidos].sort((a, b) => a - b));
  }
  return salida;
}

function contarCorpus(
  anclas: readonly Ancla[],
): readonly { documento: string; sha: string; personas: number }[] {
  const conteo = new Map<string, { documento: string; sha: string; personas: number }>();
  for (const a of anclas) {
    const previo = conteo.get(a.documento);
    if (previo === undefined) {
      conteo.set(a.documento, { documento: a.documento, sha: a.sha, personas: 1 });
    } else {
      previo.personas += 1;
    }
  }
  return [...conteo.values()].sort((a, b) => (a.documento < b.documento ? -1 : 1));
}
