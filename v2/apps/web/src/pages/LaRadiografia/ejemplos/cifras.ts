import { COEFICIENTES, PROVINCIAS_CANONICAS, retratoMedido } from '@v2/civic-core';

import { AHORA, TERRITORIOS } from './padron';
import { estaCorroborada } from './tipos';

import type { Escenario, Voz } from './tipos';
import type { Retrato, VozMedida } from '@v2/civic-core';

/**
 * Las cifras de la tabla — todas calculadas, ninguna escrita a mano.
 *
 * La tabla del ejemplo tiene dos mitades y no se pueden confundir:
 *
 *  - **La izquierda es la legitimidad**, y es idéntica en los tres escenarios:
 *    voces, actores distintos, provincias, períodos sostenidos, y de ahí
 *    `alcance × persistencia`.
 *  - **La derecha es lo que se puede hacer**, y cambia entero: los núcleos, el
 *    tamaño del mayor, cuántas están corroboradas, y el mandato.
 *
 * Que la izquierda no se mueva no es una promesa de este archivo: es una
 * propiedad del motor. `retratoMedido` recibe por voz un `territorioId`, una
 * `fecha` y un `tipo`, y **de los tres no lee el tipo**. El texto no llega
 * siquiera a entrar. Como los tres escenarios comparten el padrón entero, la
 * mitad izquierda de la tabla es la misma por álgebra, no por casualidad.
 */

/** El escenario, como lo quiere el motor de legitimidad: sin texto y sin clase. */
const aVocesMedidas = (voces: readonly Voz[]): readonly VozMedida[] =>
  voces.map((v) => ({
    territorioId: v.territorioId,
    tipo: { reconocido: true, tipo: v.tipo },
    fecha: v.dicha,
  }));

/**
 * El retrato del país del ejemplo, con la fórmula del canon.
 *
 * Es el mismo `retratoMedido` que corre la Simulación — no una copia con la
 * misma forma. Si mañana cambia el piso del mandato o el mínimo de períodos
 * sostenidos, esta tabla cambia con ellos y el ejemplo sigue diciendo la
 * verdad. Una tabla de números escritos a mano habría quedado mintiendo en
 * silencio.
 */
export const retratoDe = (escenario: Escenario): Retrato =>
  retratoMedido({ voces: aVocesMedidas(escenario.voces), ahora: AHORA }, TERRITORIOS);

/* ── La mitad de la legitimidad ───────────────────────────────────────────── */

export interface CifrasDeLegitimidad {
  /** Filas, no personas. */
  readonly voces: number;
  /** Personas distintas. Menos que las voces, y por eso la distinción importa. */
  readonly actores: number;
  /** Provincias con al menos una voz. */
  readonly provincias: number;
  /** Meses distintos que abarca el padrón, de la voz más vieja a hoy. */
  readonly meses: number;
  /** Los períodos sostenidos, ponderados por población: el numerador de la persistencia. */
  readonly periodosSostenidos: number;
  readonly alcance: number;
  readonly persistencia: number;
  /** `alcance × persistencia`. Nada más entra acá. */
  readonly legitimidad: number;
  /** Territorios con voz ÷ territorios con población conocida. */
  readonly cobertura: number;
}

const mesDe = (epoch: number): string => new Date(epoch).toISOString().slice(0, 7);

export function cifrasDeLegitimidad(escenario: Escenario): CifrasDeLegitimidad {
  const retrato = retratoDe(escenario);
  const actores = new Set(escenario.voces.map((v) => v.actorId));
  const provincias = new Set(escenario.voces.map((v) => v.provincia));
  const meses = new Set(escenario.voces.map((v) => mesDe(v.dicha)));

  return {
    voces: escenario.voces.length,
    actores: actores.size,
    provincias: provincias.size,
    meses: meses.size,
    periodosSostenidos: retrato.persistencia.valor * meses.size,
    alcance: retrato.alcance.valor,
    persistencia: retrato.persistencia.valor,
    legitimidad: retrato.legitimidad.valor,
    cobertura: retrato.cobertura.valor,
  };
}

/* ── La mitad de lo que se puede hacer ────────────────────────────────────── */

export interface CifrasDeCorroboracion {
  /** Señales de clase `hecho` o `acto`: las únicas que corren esta máquina. */
  readonly verificables: number;
  /** Con dos o más confirmaciones de actores distintos. */
  readonly corroboradas: number;
  /** Alguien fue a mirar y no estaba. Se queda en el registro. */
  readonly desmentidas: number;
  /** Se fue a mirar y no se pudo afirmar ni negar. */
  readonly sinResolver: number;
  /** Deseos y preguntas: no se corroboran nunca. No son un faltante. */
  readonly noCorresponde: number;
}

export function cifrasDeCorroboracion(escenario: Escenario): CifrasDeCorroboracion {
  let verificables = 0;
  let corroboradas = 0;
  let desmentidas = 0;
  let sinResolver = 0;
  let noCorresponde = 0;

  for (const voz of escenario.voces) {
    const c = voz.corroboracion;
    if (c === null) continue;
    if (c.veredicto === 'no corresponde') {
      noCorresponde += 1;
      continue;
    }
    verificables += 1;
    if (estaCorroborada(c)) corroboradas += 1;
    else if (c.veredicto === 'desmentida') desmentidas += 1;
    else if (c.veredicto === 'no se pudo verificar') sinResolver += 1;
  }

  return { verificables, corroboradas, desmentidas, sinResolver, noCorresponde };
}

/* ── La cobertura, que toda síntesis tiene que declarar (regla 2) ─────────── */

export interface Cobertura {
  /** Provincias del padrón de las que habló alguien. */
  readonly conVoz: readonly string[];
  /** En el padrón y sin una sola voz. Hoy: Formosa. */
  readonly mudas: readonly string[];
  /** Ni siquiera están en el padrón: de estas el ejemplo no puede decir nada. */
  readonly fueraDelPadron: readonly string[];
  /** Las 24, para que el denominador esté a la vista. */
  readonly provinciasDelPais: number;
}

export function coberturaDe(escenario: Escenario): Cobertura {
  const conVoz = new Set(escenario.voces.map((v) => v.provincia));
  const enElPadron = new Set(TERRITORIOS.map((t) => t.provincia));
  const nombres = PROVINCIAS_CANONICAS.map((p) => p.name);

  return {
    conVoz: nombres.filter((n) => conVoz.has(n)),
    mudas: nombres.filter((n) => enElPadron.has(n) && !conVoz.has(n)),
    fueraDelPadron: nombres.filter((n) => !enElPadron.has(n)),
    provinciasDelPais: PROVINCIAS_CANONICAS.length,
  };
}

/**
 * El piso y el mínimo con los que se juzgó cada territorio, para que la tabla
 * pueda mostrarlos al lado del veredicto en vez de dejarlo caído del cielo.
 */
export const REGLA_DEL_MANDATO = {
  pisoPorCienMil: COEFICIENTES.PISO_MANDATO,
  minimoPeriodos: COEFICIENTES.MINIMO_PERIODOS,
  comoSeLee: `${String(COEFICIENTES.PISO_MANDATO)} voces cada 100.000 habitantes —una de cada mil— sostenidas al menos ${String(COEFICIENTES.MINIMO_PERIODOS)} meses. Cruzarlo una vez es un pico, y un pico no gobierna.`,
} as const;
