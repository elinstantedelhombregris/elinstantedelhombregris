/**
 * El modo forma — declarás la forma del país que hablaría y el motor la construye.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §4.1.
 *
 * Reusa lo que ya estaba y era bueno: `repartir()` para el eje territorial
 * (resto mayor, cierra exacto, desempates deterministas por voces → población
 * → id), `periodosSostenidos()` para el temporal, y la composición declarada
 * para el eje de clase. Lo que cambia respecto de `retratoSimulado` es que la
 * constancia deja de aplicarse **pareja a todos los territorios**: ahora hay eje
 * de período y el reparto temporal se hace territorio por territorio.
 *
 * **Este modo no tiene azar, y eso no es un olvido.** Es una fórmula: mismas
 * palancas, mismo país, mismo resultado byte a byte. La semilla existe igual en
 * el `Escenario` porque el barrido la usa para elegir puntos del espacio de
 * parámetros —ahí sí hay sorteo—, pero una corrida del modo forma es exacta y
 * su incertidumbre se declara `'exacta'`, nunca «±0». **Un modelo incapaz de
 * dudar no es un modelo más certero**, y eso se dice en pantalla.
 *
 * Su virtud es la otra cara: la decisión S4 —«el motor no depende del corpus de
 * PLANes»— sigue siendo verdad de este modo. No lee ningún texto, no necesita
 * Ollama, no necesita base, y corre mil veces en milisegundos.
 */

import { ConstructorDeCosecha } from './espina/cosecha.js';
import { normalizarComposicion } from './espina/forma.js';
import { periodosDelHorizonte, periodosSostenidos } from './mandato.js';
import { repartir, repartirEnteros } from './reparto.js';
import { separarSinDato } from './retrato.js';

import type { ClaseSenal } from '../senal/vocabulario.js';
import type { Cosecha } from './espina/cosecha.js';
import type { Escenario, Pais } from './espina/escenario.js';
import type { Poblacion } from './poblacion.js';
import type { Territorio } from './tipos.js';

/**
 * Qué períodos ocupa un territorio que sostiene `sostenidos` de `total`.
 *
 * Los más recientes, que en la cosecha son los de índice más alto (0 es el más
 * viejo de la ventana). Entre «los primeros», «los últimos» y «repartidos
 * parejo» hay que elegir uno y decirlo: se eligen los últimos porque el
 * escenario describe una movilización que llega hasta hoy, y porque hace que
 * dos horizontes distintos compartan el borde derecho y sean comparables.
 */
function periodosOcupados(sostenidos: number, total: number): number[] {
  const cuantos = Math.max(0, Math.min(sostenidos, total));
  const salida: number[] = [];
  for (let i = total - cuantos; i < total; i++) salida.push(i);
  return salida;
}

/** El reparto parejo de un entero entre N casillas, con resto mayor. */
function repartirParejo(total: number, casillas: readonly string[]): Map<string, number> {
  const pesos = new Map<string, number>();
  const parejo = casillas.length === 0 ? 0 : 1 / casillas.length;
  for (const c of casillas) pesos.set(c, parejo);
  return repartirEnteros(total, pesos);
}

/**
 * La cosecha del modo forma.
 *
 * `actores` iguala a `voces` y `sinActor` es 0, y las dos cosas son
 * DECLARACIONES, no mediciones: este modo no modela personas, así que cada voz
 * es una persona distinta por construcción. No es un `0` que signifique «no
 * sé» —el hueco que `sinActor` existe para poder representar es el del modo
 * gente, donde una señal puede no tener actor conocido—; es un país donde,
 * por definición del modelo, no hay señales sin actor.
 */
export function modoForma(esc: Escenario, pais: Pais, pob: Poblacion | null): Cosecha {
  if (pob !== null) {
    throw new Error(
      'El modo forma no tiene población: recibió una. Si querés que la forma salga de lo que ' +
        'hace la gente, el modo es `modoGente`.',
    );
  }

  const { utiles } = separarSinDato(pais.territorios);
  let poblacionTotal = 0;
  for (const t of utiles) poblacionTotal += t.poblacion;

  const periodos = periodosDelHorizonte(esc.ajustes.horizonte, esc.coeficientes);
  const sostenidos = periodosSostenidos(esc.forma.constancia, periodos);
  const composicion = normalizarComposicion(esc.forma.composicion);

  const totalVoces = Math.round((esc.forma.participacion * poblacionTotal) / 100_000);
  const vocesBase = vocesBaseDe(pais);
  const porTerritorio = repartir(totalVoces, utiles, esc.forma.dispersion, vocesBase);

  const clases = Object.keys(composicion) as ClaseSenal[];
  const constructor = new ConstructorDeCosecha();

  for (const t of utiles) {
    const voces = porTerritorio.get(t.id) ?? 0;
    if (voces <= 0) continue;

    // Un territorio sostiene, como mucho, tantos períodos como voces tiene.
    const ocupados = periodosOcupados(Math.min(sostenidos, voces), periodos);
    const porPeriodo = repartirParejo(
      voces,
      ocupados.map((p) => String(p)),
    );

    for (const periodo of ocupados) {
      const enElPeriodo = porPeriodo.get(String(periodo)) ?? 0;
      if (enElPeriodo <= 0) continue;

      const pesos = new Map<string, number>();
      for (const clase of clases) pesos.set(clase, composicion[clase]);
      const porClase = repartirEnteros(enElPeriodo, pesos);

      for (const clase of clases) {
        const cuantas = porClase.get(clase) ?? 0;
        if (cuantas <= 0) continue;
        constructor.sumar(t.id, periodo, clase, cuantas, cuantas, 0);
      }
    }
  }

  return constructor.cerrar(periodos, 'declarada');
}

function vocesBaseDe(pais: Pais): Map<string, number> {
  const vocesBase = new Map<string, number>();
  for (const v of pais.base.voces) {
    vocesBase.set(v.territorioId, (vocesBase.get(v.territorioId) ?? 0) + 1);
  }
  return vocesBase;
}

/** Los territorios útiles, en el orden en que el país los declara. */
export const territoriosUtiles = (pais: Pais): readonly Territorio[] =>
  separarSinDato(pais.territorios).utiles;
