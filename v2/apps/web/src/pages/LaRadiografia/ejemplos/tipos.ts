import { claseDe, esVerificable, UMBRAL_CORROBORACION } from '@v2/civic-core';

import type { ClaseSenal, TipoSenal } from '@v2/civic-core';

/**
 * Los tres escenarios de La Radiografía — el vocabulario del ejemplo.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §12 y
 * `docs/specs/2026-08-01-el-mapa-simulacion.md` §5.4.
 *
 * El ejemplo existe para enseñar **una** cosa, y la cita es del sistema:
 *
 * > «La composición no entra en la legitimidad. Qué dice la gente cambia *qué
 * > se puede hacer*, no *cuánto representa*.»
 *
 * Por eso los tres escenarios tienen **el mismo padrón**: las mismas 63
 * señales, de las mismas 44 personas, de los mismos 8 territorios, en los
 * mismos 12 meses. Lo único que cambia entre uno y otro es **lo que esas
 * personas escribieron**. Así la legitimidad no puede moverse —sale de
 * `alcance × persistencia`, y el motor que la calcula no ve el texto ni el
 * tipo— y la diferencia entre los tres queda aislada donde tiene que estar:
 * en qué se puede **hacer** con lo que se dijo.
 *
 * Las tres reglas que este ejemplo no puede romper:
 *
 *  1. **Converger no es corroborar.** El escenario 1 converge más que ninguno
 *     y no corrobora nada.
 *  2. **Toda síntesis muestra cobertura y sesgo** — `COBERTURA_Y_SESGO` y
 *     `PROVINCIA_MUDA` en `index.ts`, no en un pie de página.
 *  3. **La frase de un núcleo es una frase real de alguien**, nunca generada.
 *     Acá las escribió una persona a mano, y el sello lo dice con todas las
 *     letras: **«Nadie dijo ninguna de estas cosas.»**
 */

/** Lo que una persona escribió, en un escenario. El resto lo pone el padrón. */
export interface Dicho {
  readonly texto: string;
  /** Del canon de `senal/vocabulario.ts`. La clase se deriva, no se escribe. */
  readonly tipo: TipoSenal;
}

/**
 * Lo mismo, más la fecha **del hecho** — que no es la fecha en que se habló.
 *
 * La distinción es la mitad del escenario 3: «desde el 3 de marzo» convierte
 * una queja en algo con plazo. `null` cuando la señal no habla de un momento
 * (un sueño no tiene fecha de ocurrencia; una pregunta tampoco).
 */
export interface DichoConFecha extends Dicho {
  readonly cuando: string | null;
}

/**
 * Qué pasó cuando alguien fue a mirar.
 *
 * `'no corresponde'` no es una falta de dato: es la regla 11. Un `deseo` no se
 * corrobora nunca —se delibera— y una `meta` se responde. Marcarlos «sin
 * confirmar» los pondría en la misma fila que un hecho que nadie fue a ver, y
 * son dos cosas distintas.
 */
export type VeredictoDeCorroboracion =
  | 'confirmada'
  | 'desmentida'
  | 'no se pudo verificar'
  | 'sin visitar'
  | 'no corresponde';

export interface Corroboracion {
  readonly veredicto: VeredictoDeCorroboracion;
  /** Actores **distintos** que fueron a mirar y dijeron «está». Nunca filas. */
  readonly confirmaciones: number;
  /** Cómo lo saben, en una línea. Es lo que hace auditable el veredicto. */
  readonly nota: string;
}

/**
 * Corroborada de verdad: confirmada **y** por encima del umbral del canon.
 *
 * El número no se escribe acá: sale de `UMBRAL_CORROBORACION`, que hoy vale 2
 * y tiene escrito en `senal/corroboracion.ts` qué lo subiría a 3. Si sube, esta
 * tabla cambia sola y el ejemplo sigue diciendo la verdad.
 */
export const estaCorroborada = (c: Corroboracion): boolean =>
  c.veredicto === 'confirmada' && c.confirmaciones >= UMBRAL_CORROBORACION;

/** Una voz armada: lo que dijo alguien, pegado a quién, dónde y cuándo. */
export interface Voz {
  readonly id: string;
  readonly texto: string;
  readonly tipo: TipoSenal;
  /** Derivada de `tipo` con `claseDe`. Nunca escrita a mano en el corpus. */
  readonly clase: ClaseSenal;
  readonly provincia: string;
  readonly territorioId: string;
  /** 44 personas para 63 señales: una persona puede haber cargado dos. */
  readonly actorId: string;
  /** Epoch en ms — cuándo se dijo. Entra al motor de legitimidad. */
  readonly dicha: number;
  /** Cuándo pasó lo que se cuenta. Sólo el escenario 3 lo tiene siempre. */
  readonly cuando: string | null;
  /** Sólo el escenario 3. `null` en los otros dos: nadie fue a mirar nada. */
  readonly corroboracion: Corroboracion | null;
}

export const claseDeVoz = (tipo: TipoSenal): ClaseSenal => claseDe(tipo);

/** Si esta voz corre la máquina de corroboración. Sale del canon, no de acá. */
export const vozVerificable = (voz: Voz): boolean => esVerificable(voz.clase);

/**
 * El mandato que un escenario habilita — escrito como texto, no como puntaje.
 *
 * Es la columna que el ejemplo existe para llenar. En el escenario 1 no hay
 * ninguno, y `porQue` lo dice con nombre: sin lugar no hay a quién reclamarle,
 * sin cosa no hay qué arreglar, sin fecha no hay plazo.
 */
export interface MandatoDelEscenario {
  readonly hay: boolean;
  /** El mandato, en las palabras en que se le podría exigir a alguien. */
  readonly texto: string;
  /** Por qué habilita eso y no más, con nombre. */
  readonly porQue: string;
  /** Cómo se comprueba el incumplimiento. `null` cuando no hay nada que exigir. */
  readonly comoSeVerifica: string | null;
}

export interface Escenario {
  readonly id: 'bronca' | 'reclamo' | 'dato';
  readonly titulo: string;
  /** Una línea. Lo que este escenario muestra y ninguno de los otros dos. */
  readonly resumen: string;
  /** Lo que se ve en la constelación, dicho antes de verla. */
  readonly loQueSeVe: string;
  readonly voces: readonly Voz[];
  readonly mandato: MandatoDelEscenario;
}
