/**
 * La corrida: lo poco que sobrevive de cada punto del espacio de parámetros.
 *
 * Spec §3.6. La medida, no el CPU, es lo que mata un barrido: reteniendo 1.000
 * resultados completos con 24 provincias son **27,38 MB**, y reducidos a cinco
 * escalares **0,18 MB** — factor ×148, y a nivel municipio el completo escala a
 * gigas dentro de una pestaña. Por eso un barrido **no puede acumular
 * retratos**: acumula `Corrida`, y el retrato completo se rehidrata bajo
 * demanda para la única corrida que la persona abre. Recalcularlo cuesta menos
 * que haberlo guardado.
 *
 * `pedido` y `logrado` juntos es lo que hace comparables los dos modos. **En
 * modo forma coinciden por construcción — y eso no se esconde, se muestra**: es
 * la limitación principal de ese modo, dicha en pantalla y no en un comentario.
 */

import { CLASES_SENAL } from '../../senal/vocabulario.js';
import { derivado, hipotesis, medido } from '../procedencia.js';
import { separarSinDato } from '../retrato.js';

import { huellaDeCosecha, totalDeVoces, vocesPorTerritorio } from './cosecha.js';
import { verificarPais } from './escenario.js';
import { medirFormaConProcedencia } from './forma.js';
import { retratar } from './retratar.js';


import type { Cosecha, Modo } from './cosecha.js';
import type { Escenario, Forma, Pais } from './escenario.js';
import type { FormaMedida } from './forma.js';
import type { Poblacion } from '../poblacion.js';
import type { Magnitud, SelloDelModelo } from '../procedencia.js';
import type { Retrato } from '../tipos.js';

export interface Resumen {
  readonly alcance: Magnitud;
  readonly persistencia: Magnitud;
  readonly legitimidad: Magnitud;
  readonly cobertura: Magnitud;
  readonly territoriosConMandato: Magnitud;
}

/**
 * El sesgo territorial de lo que se dijo, contra dónde vive la gente.
 *
 * Es la regla 5 hecha número: participación no equivale a representatividad, y
 * toda síntesis muestra cobertura y sesgo. La distancia es la de variación
 * total entre las dos distribuciones —la mitad de la suma de las diferencias
 * absolutas—: 0 es «la voz se reparte como la población» y 1 es «todo lo que
 * se dijo salió de donde no vive casi nadie».
 */
export type Sesgo =
  | { tipo: 'valor'; distancia: Magnitud; formula: string }
  | { tipo: 'sinDenominador'; razon: string };

export interface Cobertura {
  readonly territoriosConVoz: Magnitud;
  readonly territoriosConDato: Magnitud;
  readonly fraccion: Magnitud;
  /** Fracción de la población que vive en un territorio donde alguien habló. */
  readonly poblacionCubierta: Magnitud;
  readonly sesgo: Sesgo;
}

export interface Corrida {
  readonly escenarioId: string;
  readonly paisHuella: string;
  readonly modo: 'forma' | 'gente';
  readonly semilla: number;
  /** `null` en modo forma. No se inventa uno. */
  readonly sello: SelloDelModelo | null;
  readonly reproducible: boolean;
  readonly resumen: Resumen;
  /**
   * Lo que se declaró. Números pelados a propósito: es la configuración que
   * alguien movió, su procedencia es `declarado` y es la misma para el objeto
   * entero.
   */
  readonly pedido: Forma;
  /**
   * Lo que salió, vía `medirFormaConProcedencia()`.
   *
   * **No es simétrico con `pedido` y no puede serlo.** Esto lo CALCULA el motor
   * desde la cosecha, así que va en `Magnitud` con su fórmula, y en modo gente
   * sale sellado como hipótesis del modelo que escribió la población. Es la
   * salida estrella de ese modo y la que la pantalla pone debajo de «lo que
   * efectivamente hizo la población»: pasarla por hecho es la regla 6 rota en
   * el peor lugar posible.
   */
  readonly logrado: FormaMedida;
  readonly cobertura: Cobertura;
  /** Bitset por territorio, en el orden canónico de `ordenCanonico(pais)`. */
  readonly mandatos: Uint8Array;
  readonly cosechaHuella: string;
  readonly motor: string;
}

export interface CorridaCompleta {
  readonly corrida: Corrida;
  readonly retrato: Retrato;
  readonly cosecha: Cosecha;
}

/**
 * El orden canónico de los territorios: por id, y sólo los útiles.
 *
 * Por id y no por el orden en que vino el array, porque el bitset de mandatos
 * viaja sin nombres y dos corridas tienen que poder compararse posición a
 * posición aunque la fuente haya reordenado su lista.
 */
export function ordenCanonico(pais: Pais): readonly string[] {
  const { utiles } = separarSinDato(pais.territorios);
  return utiles.map((t) => t.id).sort((a, b) => (a < b ? -1 : 1));
}

export function bitsetDeMandatos(retrato: Retrato, orden: readonly string[]): Uint8Array {
  const bits = new Uint8Array(Math.ceil(orden.length / 8));
  for (let i = 0; i < orden.length; i++) {
    const id = orden[i];
    if (id === undefined) continue;
    if (retrato.porTerritorio.get(id)?.veredicto.hay === true) {
      const byte = bits[i >> 3] ?? 0;
      bits[i >> 3] = byte | (1 << (i & 7));
    }
  }
  return bits;
}

export function tieneMandatoEn(mandatos: Uint8Array, indice: number): boolean {
  const byte = mandatos[indice >> 3];
  return byte !== undefined && (byte & (1 << (indice & 7))) !== 0;
}

export function territoriosConMandatoDe(
  corrida: Corrida,
  orden: readonly string[],
): readonly string[] {
  const salida: string[] = [];
  for (let i = 0; i < orden.length; i++) {
    const id = orden[i];
    if (id !== undefined && tieneMandatoEn(corrida.mandatos, i)) salida.push(id);
  }
  return salida;
}

function coberturaDe(cosecha: Cosecha, pais: Pais, sello: SelloDelModelo | null): Cobertura {
  const { utiles } = separarSinDato(pais.territorios);
  const porTerritorio = vocesPorTerritorio(cosecha);
  const total = totalDeVoces(cosecha);

  let poblacionTotal = 0;
  let poblacionConVoz = 0;
  let conVoz = 0;
  for (const t of utiles) {
    poblacionTotal += t.poblacion;
    if ((porTerritorio.get(t.id) ?? 0) > 0) {
      conVoz += 1;
      poblacionConVoz += t.poblacion;
    }
  }

  const sellar = (m: Magnitud): Magnitud => (sello === null ? m : hipotesis(m, sello));

  const sesgo: Sesgo =
    total <= 0 || poblacionTotal <= 0
      ? {
          tipo: 'sinDenominador',
          razon:
            total <= 0
              ? 'Nadie habló: no hay reparto de voces que comparar contra el de la población.'
              : 'Sin población conocida no hay contra qué comparar el reparto de las voces.',
        }
      : (() => {
          let distancia = 0;
          for (const t of utiles) {
            distancia += Math.abs(
              (porTerritorio.get(t.id) ?? 0) / total - t.poblacion / poblacionTotal,
            );
          }
          return {
            tipo: 'valor' as const,
            distancia: sellar(
              derivado(distancia / 2, 'fracción', '½ Σ |voces/total − población/población total|', [
                'voces',
                'poblacion',
              ]),
            ),
            formula: '0 = la voz se reparte como la población · 1 = no se parecen en nada',
          };
        })();

  return {
    territoriosConVoz: sellar(derivado(conVoz, 'territorios', 'territorios con al menos una voz', ['voces'])),
    territoriosConDato: medido(utiles.length, 'territorios', 'territorios con población conocida'),
    fraccion: sellar(
      derivado(
        utiles.length === 0 ? 0 : conVoz / utiles.length,
        'fracción',
        'territorios con voz ÷ territorios con dato',
        ['voces', 'poblacion'],
      ),
    ),
    poblacionCubierta: sellar(
      derivado(
        poblacionTotal === 0 ? 0 : poblacionConVoz / poblacionTotal,
        'fracción',
        'población de los territorios con voz ÷ población total',
        ['voces', 'poblacion'],
      ),
    ),
    sesgo,
  };
}

/**
 * Reduce un retrato a lo que un barrido puede permitirse guardar.
 *
 * `territoriosConMandato` sale del bitset y no de un contador aparte: dos
 * fuentes para el mismo número es cómo empiezan a divergir.
 */
export function reducir(
  retrato: Retrato,
  cosecha: Cosecha,
  esc: Escenario,
  pais: Pais,
  modo: 'forma' | 'gente',
  sello: SelloDelModelo | null,
): Corrida {
  const orden = ordenCanonico(pais);
  const mandatos = bitsetDeMandatos(retrato, orden);

  let conMandato = 0;
  for (let i = 0; i < orden.length; i++) if (tieneMandatoEn(mandatos, i)) conMandato += 1;

  const sellar = (m: Magnitud): Magnitud => (sello === null ? m : hipotesis(m, sello));

  return {
    escenarioId: esc.id,
    paisHuella: pais.huella,
    modo,
    semilla: esc.semilla,
    sello,
    /**
     * Computado, nunca declarado a mano. Una corrida con temperatura > 0 no se
     * puede volver a producir, y un barrido **se niega** a correr sobre
     * corridas no reproducibles: sin eso, la varianza que mide podría ser la
     * del modelo en vez de la de la palanca, y no habría forma de saberlo.
     */
    reproducible: sello === null || sello.temperatura === 0,
    resumen: {
      alcance: retrato.alcance,
      persistencia: retrato.persistencia,
      legitimidad: retrato.legitimidad,
      cobertura: retrato.cobertura,
      territoriosConMandato: sellar(
        derivado(conMandato, 'territorios', 'territorios que cruzan el piso y lo sostienen', [
          'veredicto',
        ]),
      ),
    },
    pedido: esc.forma,
    /**
     * El sello sale de la autoridad de la COSECHA y no del parámetro suelto:
     * `logrado` se mide sobre ella, así que su autoridad es la de ella. Hoy los
     * dos coinciden —los dos salen de `elenco.sello`— y por eso la condición se
     * escribe donde se puede verificar, no donde hay que acordarse.
     */
    logrado: medirFormaConProcedencia(
      cosecha,
      pais,
      cosecha.autoridad === 'hipotesis' ? sello : null,
    ),
    cobertura: coberturaDe(cosecha, pais, sello),
    mandatos,
    cosechaHuella: huellaDeCosecha(cosecha),
    motor: esc.motor,
  };
}

/**
 * Correr un escenario contra un país con un modo. Es el único camino.
 *
 * Verifica la huella ANTES de calcular nada: comparar dos corridas contra
 * países distintos creyendo que comparaste palancas es el error que no da
 * error y devuelve números plausibles.
 */
export function correr(
  esc: Escenario,
  pais: Pais,
  modo: Modo,
  pob: Poblacion | null = null,
  sello: SelloDelModelo | null = null,
): CorridaCompleta {
  verificarPais(esc, pais);
  const cosecha = modo(esc, pais, pob);
  const retrato = retratar(cosecha, esc, pais, sello);
  return {
    corrida: reducir(retrato, cosecha, esc, pais, pob === null ? 'forma' : 'gente', sello),
    retrato,
    cosecha,
  };
}

// ---------------------------------------------------------------------------
// Serialización — spec §3.6 y la ADR 0009 D5
// ---------------------------------------------------------------------------

export interface MagnitudSerializada {
  readonly valor: number;
  readonly unidad: string;
  readonly procedencia: unknown;
}

/**
 * La forma medida, serializada — con la procedencia adentro de cada campo.
 *
 * Que el JSON de una corrida llevara `logrado: {participacion: 438.2}` era el
 * mismo defecto que en memoria: quien lo lea después no tiene cómo saber que
 * ese número lo produjo una población escrita por un modelo. Acá cada uno viaja
 * con su fórmula y, cuando corresponde, con el sello.
 */
export interface FormaMedidaSerializada {
  readonly participacion: MagnitudSerializada;
  readonly dispersion: MagnitudSerializada;
  readonly constancia: MagnitudSerializada;
  readonly composicion: Readonly<Record<string, MagnitudSerializada>>;
}

export interface CorridaSerializada {
  readonly version: 1;
  readonly motor: string;
  readonly escenarioId: string;
  readonly paisHuella: string;
  readonly modo: 'forma' | 'gente';
  readonly semilla: number;
  readonly poblacionHuella: string | null;
  readonly sello: SelloDelModelo | null;
  readonly reproducible: boolean;
  readonly variables: Readonly<Record<string, number>>;
  readonly resumen: Readonly<Record<string, MagnitudSerializada>>;
  readonly pedido: Forma;
  readonly logrado: FormaMedidaSerializada;
  /** Un carácter por territorio, en `ordenCanonico`. Legible y diffeable. */
  readonly mandatos: string;
  readonly orden: readonly string[];
  readonly cosechaHuella: string;
}

const serializarMagnitud = (m: Magnitud): MagnitudSerializada => ({
  valor: m.valor,
  unidad: m.unidad,
  procedencia: m.procedencia,
});

/** La composición sale por `CLASES_SENAL`: el orden de las claves es canónico. */
function serializarFormaMedida(forma: FormaMedida): FormaMedidaSerializada {
  const composicion: Record<string, MagnitudSerializada> = {};
  for (const clase of CLASES_SENAL) {
    composicion[clase] = serializarMagnitud(forma.composicion[clase]);
  }
  return {
    participacion: serializarMagnitud(forma.participacion),
    dispersion: serializarMagnitud(forma.dispersion),
    constancia: serializarMagnitud(forma.constancia),
    composicion,
  };
}

/**
 * Una corrida como JSON: semilla, variables, versión del motor y huella de la
 * población. Es lo mínimo para que otra persona la vuelva a correr y obtenga
 * exactamente lo mismo — y si no lo obtiene, para que se pueda decir cuál de
 * los cuatro campos cambió.
 *
 * El bitset sale como texto de ceros y unos con el orden al lado, y no como
 * base64: pesa lo mismo en un `.json.gz`, se lee de un vistazo, y un diff entre
 * dos corridas muestra qué provincia cambió en vez de dos blobs distintos.
 */
export function serializarCorrida(
  corrida: Corrida,
  esc: Escenario,
  orden: readonly string[],
): CorridaSerializada {
  let mandatos = '';
  for (let i = 0; i < orden.length; i++) mandatos += tieneMandatoEn(corrida.mandatos, i) ? '1' : '0';

  const variables: Record<string, number> = {
    participacion: esc.forma.participacion,
    dispersion: esc.forma.dispersion,
    constancia: esc.forma.constancia,
    horizonte: esc.ajustes.horizonte,
    resistencia: esc.ajustes.resistencia,
    cumplimiento: esc.ajustes.cumplimiento,
    PISO_MANDATO: esc.coeficientes.PISO_MANDATO,
    K_RESISTENCIA: esc.coeficientes.K_RESISTENCIA,
    MINIMO_PERIODOS: esc.coeficientes.MINIMO_PERIODOS,
    PERIODOS_POR_ANIO: esc.coeficientes.PERIODOS_POR_ANIO,
  };
  // Por `CLASES_SENAL` y no por `Object.entries`: dos corridas iguales tienen
  // que serializar el mismo JSON aunque una haya construido su composición
  // insertando las claves en otro orden — y algo tan tonto como una ida y
  // vuelta por `jsonb` alcanza para reordenarlas.
  for (const clase of CLASES_SENAL) {
    variables[`composicion.${clase}`] = esc.forma.composicion[clase];
  }
  if (esc.mecanismo !== null) {
    variables.chispa = esc.mecanismo.chispa;
    variables.contagio = esc.mecanismo.contagio;
    variables.desaliento = esc.mecanismo.desaliento;
    variables.grado = esc.mecanismo.grado;
  }

  return {
    version: 1,
    motor: corrida.motor,
    escenarioId: corrida.escenarioId,
    paisHuella: corrida.paisHuella,
    modo: corrida.modo,
    semilla: corrida.semilla,
    poblacionHuella: esc.mecanismo?.poblacionHuella ?? corrida.sello?.poblacionHuella ?? null,
    sello: corrida.sello,
    reproducible: corrida.reproducible,
    variables,
    resumen: {
      alcance: serializarMagnitud(corrida.resumen.alcance),
      persistencia: serializarMagnitud(corrida.resumen.persistencia),
      legitimidad: serializarMagnitud(corrida.resumen.legitimidad),
      cobertura: serializarMagnitud(corrida.resumen.cobertura),
      territoriosConMandato: serializarMagnitud(corrida.resumen.territoriosConMandato),
    },
    pedido: corrida.pedido,
    logrado: serializarFormaMedida(corrida.logrado),
    mandatos,
    orden,
    cosechaHuella: corrida.cosechaHuella,
  };
}

/**
 * Qué escalar mira un barrido.
 *
 * Son los cinco del `Resumen` y ninguno más: un barrido que pudiera observar
 * cualquier campo terminaría observando `pedido.participacion` —que es la
 * variable que movió— y reportando una sensibilidad de 1,0 sobre sí misma.
 */
export type Objetivo = keyof Resumen;

export const OBJETIVOS: readonly Objetivo[] = [
  'alcance',
  'persistencia',
  'legitimidad',
  'cobertura',
  'territoriosConMandato',
];

export const leerObjetivo = (corrida: Corrida, objetivo: Objetivo): Magnitud =>
  corrida.resumen[objetivo];
