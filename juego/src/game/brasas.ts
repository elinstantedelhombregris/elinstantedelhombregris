/**
 * Brasas — la moneda blanda única (spec §3.3). Jamás dinero real.
 *
 * Ledger append-only: las entradas nunca se editan ni se borran. El balance
 * es la suma de deltas; el total ganado histórico (solo positivos) mueve los
 * rangos. No se puede gastar por debajo de 0.
 */

import type { EmberEntry, Luz } from './types';

export type { EmberEntry };

/** Ganancias canónicas (spec §2, §3.3, §3.4, §3.5, §3.6). */
export const GANANCIAS = {
  /** Cada luz encendida (ver / encender / dar). */
  luz: 2,
  /** Bonus por las tres luces del día. */
  nocheCompleta: 4,
  /** "¿Lo hiciste?" → sí. */
  compromisoCumplido: 3,
  /** Cada paso de expedición registrado. */
  pasoExpedicion: 3,
  /** Hitos de expedición 25 / 50 / 100 %. */
  hito25: 10,
  hito50: 15,
  hito100: 25,
  /** FTUE: primera estrella. */
  bienvenida: 5,
  /** Chispa escaneada de otra persona. */
  chispaRecibida: 5,
  /** Evento fugaz: pregunta extra respondida. */
  preguntaExtra: 2,
  /** Evento fugaz: desafío de 24 h logrado (3 estrellas en el día). */
  desafio24h: 8,
} as const;

/** Costos canónicos (spec §3.3, §3.5). */
export const COSTOS = {
  fundarExpedicion: 15,
  chispaRegalada: 5,
  paletaMin: 30,
  paletaMax: 80,
} as const;

/** Motivos visibles en la UI, en rioplatense. */
export const MOTIVOS = {
  luzVer: 'Luz de ver',
  luzEncender: 'Luz de encender',
  luzDar: 'Luz de dar',
  nocheCompleta: 'Noche completa',
  compromisoCumplido: 'Compromiso cumplido',
  pasoExpedicion: 'Paso de expedición',
  hito25: 'Expedición al 25%',
  hito50: 'Expedición al 50%',
  hito100: 'Expedición completa',
  bienvenida: 'Bienvenida al Cielo',
  chispaRecibida: 'Chispa recibida',
  preguntaExtra: 'Pregunta extra',
  desafio24h: 'Desafío de 24 horas',
  fundarExpedicion: 'Fundaste una expedición',
  chispaRegalada: 'Chispa regalada',
  paleta: 'Paleta de cielo',
} as const;

/** Motivo canónico de la ganancia de una luz. */
export const motivoDeLuz = (luz: Luz): string =>
  luz === 'ver'
    ? MOTIVOS.luzVer
    : luz === 'encender'
      ? MOTIVOS.luzEncender
      : MOTIVOS.luzDar;

/** Balance actual: suma de todos los deltas. */
export const balance = (entries: EmberEntry[]): number =>
  entries.reduce((acc, e) => acc + e.delta, 0);

/** Brasas ganadas históricas (ignora gastos) — mueve los rangos. */
export const totalGanado = (entries: EmberEntry[]): number =>
  entries.reduce((acc, e) => acc + (e.delta > 0 ? e.delta : 0), 0);

/** ¿Alcanza el balance para este costo? */
export const puedeGastar = (entries: EmberEntry[], costo: number): boolean =>
  costo > 0 && balance(entries) >= costo;

const validarEntero = (n: number, nombre: string): void => {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`${nombre} debe ser un entero positivo, llegó ${n}`);
  }
};

/**
 * Crea una entrada de ganancia. `multiplicador` implementa el día de
 * brasas x2 (evento fugaz): se aplica sobre el delta base.
 */
export const crearGanancia = (input: {
  id: string;
  delta: number;
  motivo: string;
  fecha: string;
  multiplicador?: 1 | 2;
}): EmberEntry => {
  validarEntero(input.delta, 'delta');
  const mult = input.multiplicador ?? 1;
  return {
    id: input.id,
    delta: input.delta * mult,
    motivo: input.motivo,
    fecha: input.fecha,
  };
};

/**
 * Crea una entrada de gasto validando contra el ledger: no se puede gastar
 * por debajo de 0. Tira Error si no alcanzan las brasas.
 */
export const crearGasto = (
  entries: EmberEntry[],
  input: { id: string; costo: number; motivo: string; fecha: string },
): EmberEntry => {
  validarEntero(input.costo, 'costo');
  if (!puedeGastar(entries, input.costo)) {
    throw new Error('No te alcanzan las brasas');
  }
  return {
    id: input.id,
    delta: -input.costo,
    motivo: input.motivo,
    fecha: input.fecha,
  };
};

/** Los precios de paleta viven entre 30 y 80 brasas. */
export const esCostoPaletaValido = (costo: number): boolean =>
  Number.isInteger(costo) && costo >= COSTOS.paletaMin && costo <= COSTOS.paletaMax;
