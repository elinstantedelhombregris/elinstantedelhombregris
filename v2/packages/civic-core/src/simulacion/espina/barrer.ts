/**
 * El barrido — spec §3.6, §4.1 y §9.1.
 *
 * Tres cosas que este archivo hace y que ninguna de las partes hace sola:
 *
 * **1. Iza el contexto fuera del bucle.** `simular()` recalcula el lado del
 * silencio en cada invocación aunque ese lado, por decisión S3, no dependa de
 * ninguna palanca. Medido con 24 provincias: con el corpus vacío el silencio es
 * el 48 % del tiempo y con 100.000 voces el 80 % — con el corpus lleno, cuatro
 * quintos de un barrido se irían en recalcular una constante. Izarlo no es un
 * atajo: **si el silencio es sordo, calcularlo una vez es la definición**.
 *
 * **2. Verifica antes de la primera corrida.** La huella del país, la de la
 * población y la reproducibilidad. El error central del módulo —regenerar la
 * población en cada corrida y terminar midiendo la varianza del modelo— no da
 * error y devuelve números plausibles, así que la única defensa es negarse
 * antes de empezar.
 *
 * **3. Se niega con la cuenta a la vista** cuando el trabajo pedido pasa el
 * techo, en vez de congelar la pestaña. Negarse con una cuenta es lo que impide
 * que la primera persona que baje a nivel municipio se lleve puesta la
 * herramienta.
 */

import { huellaDePoblacion } from '../poblacion.js';
import { declarado, derivado } from '../procedencia.js';
import { retratoMedido } from '../retrato.js';

import { crearAzar } from './azar.js';
import { correr, leerObjetivo, ordenCanonico, tieneMandatoEn, OBJETIVOS } from './corrida.js';
import { verificarPais } from './escenario.js';
import { estimarDeMuestras, estimacionExacta, estimacionSinDominio } from './estimacion.js';
import { hipercuboLatino, importanciaDe } from './metodos/muestreo.js';
import { barrerUnaPorVez } from './metodos/oat.js';
import { umbralesDeParticipacion, OPCIONES_UMBRAL } from './metodos/umbral.js';
import { conVariables, conectadaEn, CLAVES_VARIABLE, razonDeNoConectada } from './variables.js';

import type { Magnitud, SelloDelModelo } from '../procedencia.js';
import type { Azar } from './azar.js';
import type { Corrida, Objetivo } from './corrida.js';
import type { Modo } from './cosecha.js';
import type { Escenario, Pais } from './escenario.js';
import type { Estimacion } from './estimacion.js';
import type { Poblacion } from '../poblacion.js';
import type { Importancia } from './metodos/muestreo.js';
import type { BarraDeTornado } from './metodos/oat.js';
import type { UmbralDeTerritorio } from './metodos/umbral.js';
import type { ClaveVariable, ModoDeCorrida } from './variables.js';
import type { Retrato } from '../tipos.js';

/**
 * El techo, en territorio-corridas.
 *
 * 1,2 millones es aproximadamente un segundo de cómputo a nivel provincia y
 * catorce a nivel de todas las unidades. Arriba de eso el módulo se niega: no
 * porque no pueda, sino porque una pestaña congelada sin explicación es peor
 * resultado que una negativa con la cuenta escrita.
 */
export const TECHO_TERRITORIO_CORRIDAS = 1_200_000;

/**
 * Lo que no cambia entre corridas, calculado una vez.
 *
 * El silencio vive acá porque **no depende de ninguna variable**: es el país
 * medido, idéntico para toda configuración. Que esté en el contexto y no
 * adentro del bucle es S3 aprovechada en vez de sólo respetada.
 */
export interface ContextoDeBarrido {
  readonly pais: Pais;
  readonly silencio: Retrato;
  readonly orden: readonly string[];
  readonly mandatosDelSilencio: Uint8Array;
}

export function prepararContexto(pais: Pais): ContextoDeBarrido {
  const silencio = retratoMedido(pais.base, pais.territorios);
  const orden = ordenCanonico(pais);
  const bits = new Uint8Array(Math.ceil(orden.length / 8));
  for (let i = 0; i < orden.length; i++) {
    const id = orden[i];
    if (id !== undefined && silencio.porTerritorio.get(id)?.veredicto.hay === true) {
      bits[i >> 3] = (bits[i >> 3] ?? 0) | (1 << (i & 7));
    }
  }
  return { pais, silencio, orden, mandatosDelSilencio: bits };
}

/**
 * Los territorios que ganan mandato: lo tienen en la voz y no en el silencio.
 *
 * Sale de dos bitsets y no de dos retratos, que es lo que permite guardar mil
 * corridas sin guardar mil retratos.
 */
export function territoriosQueGananMandato(
  corrida: Corrida,
  contexto: ContextoDeBarrido,
): readonly string[] {
  const salida: string[] = [];
  for (let i = 0; i < contexto.orden.length; i++) {
    const id = contexto.orden[i];
    if (id === undefined) continue;
    if (tieneMandatoEn(corrida.mandatos, i) && !tieneMandatoEn(contexto.mandatosDelSilencio, i)) {
      salida.push(id);
    }
  }
  return salida;
}

export type Metodo =
  | { readonly tipo: 'unaPorVez'; readonly pasos: number }
  | { readonly tipo: 'hipercubo'; readonly muestras: number }
  | { readonly tipo: 'umbral'; readonly territorios: readonly string[] };

export interface Diseno {
  readonly base: Escenario;
  readonly modo: ModoDeCorrida;
  readonly claves: readonly ClaveVariable[];
  readonly objetivo: Objetivo;
  readonly metodo: Metodo;
}

export type SalidaDeMetodo =
  | { readonly metodo: 'unaPorVez'; readonly barras: readonly BarraDeTornado[] }
  | {
      readonly metodo: 'hipercubo';
      readonly importancia: readonly Importancia[];
      readonly estimaciones: Readonly<Record<Objetivo, Estimacion>>;
      readonly corridas: readonly Corrida[];
    }
  | { readonly metodo: 'umbral'; readonly umbrales: readonly UmbralDeTerritorio[] };

export type ResultadoBarrido =
  | {
      readonly estado: 'listo';
      readonly diseno: Diseno;
      readonly salida: SalidaDeMetodo;
      readonly corridasHechas: Magnitud;
      readonly paisHuella: string;
      readonly poblacionHuella: string | null;
      readonly motor: string;
    }
  | {
      readonly estado: 'seNiega';
      readonly razon: string;
      readonly territorioCorridas: Magnitud;
      readonly techo: Magnitud;
    };

/**
 * Corre el diseño. `ejecutar` es el modo: `modoForma` o `modoGente`.
 *
 * La población entra ya congelada y **no hay forma de que este archivo la
 * regenere**: `civic-core` es puro, no puede abrir un socket, y `barrer` no
 * recibe un generador sino una `Poblacion`. El error del §1.2 no se evita con
 * disciplina — no hay dónde escribirlo.
 */
export function barrer(
  diseno: Diseno,
  pais: Pais,
  ejecutar: Modo,
  poblacion: Poblacion | null = null,
): ResultadoBarrido {
  verificarPais(diseno.base, pais);

  if (poblacion !== null) {
    const recalculada = huellaDePoblacion(poblacion.personas);
    if (recalculada !== poblacion.huella) {
      throw new Error(
        `La población dice ser ${poblacion.huella} y su conducta hashea ${recalculada}. Un ` +
          'barrido sobre una población que cambió mide la varianza del modelo creyendo que mide ' +
          'la palanca.',
      );
    }
    const declaradaEnElEscenario = diseno.base.mecanismo?.poblacionHuella;
    if (declaradaEnElEscenario !== undefined && declaradaEnElEscenario !== poblacion.huella) {
      throw new Error(
        `El escenario declara la población ${declaradaEnElEscenario} y se le pasó ` +
          `${poblacion.huella}. Son dos elencos distintos.`,
      );
    }
    if (poblacion.sello !== null && poblacion.sello.temperatura > 0) {
      throw new Error(
        `El elenco se generó con temperatura ${String(poblacion.sello.temperatura)}: la corrida no ` +
          'es reproducible y un barrido sobre corridas no reproducibles no mide nada.',
      );
    }
  }

  const corridasPedidas = cuantasCorridas(diseno);
  const territorioCorridas = corridasPedidas * ordenCanonico(pais).length;
  if (territorioCorridas > TECHO_TERRITORIO_CORRIDAS) {
    return {
      estado: 'seNiega',
      razon:
        `${String(corridasPedidas)} corridas × ${String(ordenCanonico(pais).length)} territorios = ` +
        `${String(territorioCorridas)} territorio-corridas, y el techo es ` +
        `${String(TECHO_TERRITORIO_CORRIDAS)}. Bajá las muestras, subí el nivel territorial, o ` +
        'corré esto en un worker por partes.',
      territorioCorridas: derivado(
        territorioCorridas,
        'territorio-corridas',
        'corridas × territorios con población conocida',
        ['metodo', 'pais'],
      ),
      techo: declarado(
        TECHO_TERRITORIO_CORRIDAS,
        'territorio-corridas',
        'el techo declarado del módulo',
      ),
    };
  }

  const contexto = prepararContexto(pais);
  const sello = poblacion?.sello ?? null;
  const correrUno = (esc: Escenario): Corrida =>
    correr(esc, pais, ejecutar, poblacion, sello).corrida;

  const salida = correrMetodo(diseno, contexto, correrUno, ejecutar, poblacion, sello);

  return {
    estado: 'listo',
    diseno,
    salida: salida.salida,
    corridasHechas: derivado(salida.corridas, 'corridas', 'corridas efectivamente ejecutadas', [
      'metodo',
    ]),
    paisHuella: pais.huella,
    poblacionHuella: poblacion?.huella ?? null,
    motor: diseno.base.motor,
  };
}

function cuantasCorridas(diseno: Diseno): number {
  switch (diseno.metodo.tipo) {
    case 'unaPorVez':
      return Math.max(2, Math.round(diseno.metodo.pasos)) * diseno.claves.length;
    case 'hipercubo':
      return Math.max(1, Math.round(diseno.metodo.muestras));
    case 'umbral':
      return diseno.metodo.territorios.length * OPCIONES_UMBRAL.maximoDeCorridas;
  }
}

function correrMetodo(
  diseno: Diseno,
  contexto: ContextoDeBarrido,
  correrUno: (esc: Escenario) => Corrida,
  ejecutar: Modo,
  poblacion: Poblacion | null,
  sello: SelloDelModelo | null,
): { salida: SalidaDeMetodo; corridas: number } {
  switch (diseno.metodo.tipo) {
    case 'unaPorVez': {
      const { barras, corridas } = barrerUnaPorVez(diseno.base, diseno.claves, correrUno, {
        pasos: diseno.metodo.pasos,
        objetivo: diseno.objetivo,
        modo: diseno.modo,
      });
      return { salida: { metodo: 'unaPorVez', barras }, corridas };
    }

    case 'hipercubo': {
      const conectadas = diseno.claves.filter((c) => conectadaEn(c, diseno.modo));
      const filas = hipercuboLatino(conectadas, diseno.metodo.muestras, diseno.base.semilla);

      const corridas: Corrida[] = [];
      const entradas = new Map<ClaveVariable, number[]>();
      for (const clave of conectadas) entradas.set(clave, []);

      for (const fila of filas) {
        const valores = new Map<ClaveVariable, number>();
        for (let d = 0; d < conectadas.length; d++) {
          const clave = conectadas[d];
          const valor = fila[d];
          if (clave === undefined || valor === undefined) continue;
          valores.set(clave, valor);
          entradas.get(clave)?.push(valor);
        }
        corridas.push(correrUno(conVariables(diseno.base, valores)));
      }

      const salidas = corridas.map((c) => leerObjetivo(c, diseno.objetivo).valor);
      const importancia: Importancia[] = [];
      for (const clave of diseno.claves) {
        if (!conectadaEn(clave, diseno.modo)) {
          importancia.push({
            estado: 'sinVariacion',
            clave,
            razon: razonDeNoConectada(clave, diseno.modo),
          });
          continue;
        }
        const dimension = conectadas.indexOf(clave);
        importancia.push(
          importanciaDe(clave, entradas.get(clave) ?? [], salidas, diseno.base.semilla, dimension),
        );
      }

      return {
        salida: {
          metodo: 'hipercubo',
          importancia,
          estimaciones: estimacionesDe(corridas, diseno),
          corridas,
        },
        corridas: corridas.length,
      };
    }

    case 'umbral': {
      const { umbrales, corridas } = umbralesDeParticipacion(
        diseno.base,
        diseno.metodo.territorios,
        (esc, territorioId) => {
          const { retrato } = correr(esc, contexto.pais, ejecutar, poblacion, sello);
          return retrato.porTerritorio.get(territorioId)?.veredicto.hay === true;
        },
      );
      return { salida: { metodo: 'umbral', umbrales }, corridas };
    }
  }
}

/**
 * Las cinco estimaciones del barrido.
 *
 * Una variable no conectada no da una banda de ancho cero: da `sinDominio` con
 * su razón. Y un objetivo que dio el mismo valor en todas las corridas da
 * `exacta`, no «±0»: el modo forma es determinista, y decir «±0» sugeriría que
 * se midió una varianza.
 */
function estimacionesDe(
  corridas: readonly Corrida[],
  diseno: Diseno,
): Readonly<Record<Objetivo, Estimacion>> {
  const salida = {} as Record<Objetivo, Estimacion>;
  const sinConectar = diseno.claves.filter((c) => !conectadaEn(c, diseno.modo));

  for (const objetivo of OBJETIVOS) {
    const valores = corridas.map((c) => leerObjetivo(c, objetivo).valor);
    if (valores.length === 0) {
      const clave = sinConectar[0];
      salida[objetivo] =
        clave === undefined
          ? { tipo: 'sinDato', razon: 'No se corrió ninguna muestra.' }
          : estimacionSinDominio(clave, razonDeNoConectada(clave, diseno.modo));
      continue;
    }
    const primera = corridas[0];
    if (primera === undefined) continue;
    if (valores.every((v) => v === (valores[0] ?? 0))) {
      salida[objetivo] = estimacionExacta(leerObjetivo(primera, objetivo));
      continue;
    }
    salida[objetivo] = estimarDeMuestras(
      valores,
      leerObjetivo(primera, objetivo).unidad,
      `${objetivo} sobre el rango declarado de las variables barridas`,
      diseno.claves,
    );
  }
  return salida;
}

/**
 * Un diseño con todas las variables, marcando cuáles el modo no lee.
 *
 * Existe para que la mesa de variables muestre las dieciocho y no sólo las que
 * andan: una ausencia sin explicación se lee como un olvido.
 */
export function todasLasVariables(modo: ModoDeCorrida): readonly ClaveVariable[] {
  return CLAVES_VARIABLE.filter((c) => conectadaEn(c, modo));
}

/**
 * El azar del barrido, derivado de la semilla del escenario y etiquetado.
 *
 * Nunca global, y siempre por rama: agregar un consumidor de azar en cualquier
 * lado no puede correr los sorteos de los demás, o el barrido de ayer deja de
 * ser comparable con el de hoy y nadie se entera.
 */
export const azarDelBarrido = (esc: Escenario, etiqueta: string): Azar =>
  crearAzar(esc.semilla).rama(etiqueta);
