/**
 * Racha — la Estrella Guía (spec §2).
 *
 * Reglas:
 * - Un día cuenta si las 3 luces se encendieron (noche completa) → racha +1.
 * - Noches nubladas: 2 por semana calendario (lunes a domingo, convención
 *   argentina), se consumen automáticamente al fallar un día. Mantienen la
 *   racha viva pero NO suman.
 * - Tercer fallo en la misma semana → la racha se apaga (viva=false, racha=0).
 *   Completar días después del apagón NO la reenciende: hace falta el rito.
 * - Rito de re-encendido: la racha renace en 1 en la fecha del rito (no se
 *   restaura el número). Si ese mismo día además se completa la noche, sigue
 *   valiendo 1 (el rito ES la llama de esa noche); a partir del día siguiente
 *   cada noche completa suma normalmente.
 * - `hoy` incompleto no es un fallo (el día todavía no terminó); `hoy`
 *   completo sí suma de inmediato.
 *
 * Todo el cálculo usa strings ISO (YYYY-MM-DD) — nada de Date.now(): el
 * llamador decide qué es "hoy" (hora local argentina en la app).
 */

import type { DayRecord, RachaEstado } from './types';

/** Noches nubladas disponibles por semana calendario. */
export const NUBLADAS_POR_SEMANA = 2;

// ---------------------------------------------------------------------------
// Aritmética de fechas sobre strings ISO (YYYY-MM-DD), determinística.
// Internamente usa Date.UTC solo como calculadora de calendario.
// ---------------------------------------------------------------------------

const RE_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Valida formato y calendario (2026-02-30 → false). */
export const esFechaISO = (fecha: string): boolean => {
  const m = RE_FECHA.exec(fecha);
  if (!m) return false;
  const [y, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mes - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mes - 1 &&
    dt.getUTCDate() === d
  );
};

const MS_DIA = 86_400_000;

const aMs = (fecha: string): number => {
  const m = RE_FECHA.exec(fecha);
  if (!m) throw new Error(`Fecha inválida: ${fecha}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

const deMs = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

/** Suma (o resta) días a una fecha ISO. */
export const addDias = (fecha: string, dias: number): string =>
  deMs(aMs(fecha) + dias * MS_DIA);

/** Días de diferencia: positivo si `hasta` es después de `desde`. */
export const diffDias = (desde: string, hasta: string): number =>
  Math.round((aMs(hasta) - aMs(desde)) / MS_DIA);

/** Lunes de la semana calendario que contiene la fecha (semana argentina). */
export const lunesDeSemana = (fecha: string): string => {
  const dow = new Date(aMs(fecha)).getUTCDay(); // 0=domingo
  return addDias(fecha, -((dow + 6) % 7));
};

// ---------------------------------------------------------------------------
// Motor de racha
// ---------------------------------------------------------------------------

const esCompleto = (d: DayRecord | undefined): boolean =>
  d !== undefined && d.ver && d.encender && d.dar;

/**
 * Calcula el estado de la Estrella Guía a partir del historial de días.
 *
 * @param days registros existentes (los días sin registro cuentan como fallo)
 * @param hoy fecha local YYYY-MM-DD del dispositivo
 * @param ritoFecha fecha del último rito de re-encendido, si hubo (≤ hoy);
 *                  solo tiene efecto si al llegar a esa fecha la racha estaba
 *                  apagada (o todavía en 0) — jamás pisa una racha viva.
 */
export const computeRacha = (
  days: DayRecord[],
  hoy: string,
  ritoFecha?: string | null,
): RachaEstado => {
  if (!esFechaISO(hoy)) throw new Error(`Fecha inválida: ${hoy}`);
  const rito = ritoFecha && esFechaISO(ritoFecha) && ritoFecha <= hoy ? ritoFecha : null;

  const porFecha = new Map<string, DayRecord>();
  for (const d of days) {
    if (d.fecha <= hoy) porFecha.set(d.fecha, d);
  }

  // El reloj arranca en la primera noche completa (o el rito, si es anterior):
  // los días previos a empezar a jugar no son fallos.
  let inicio: string | null = null;
  for (const [fecha, d] of porFecha) {
    if (esCompleto(d) && (inicio === null || fecha < inicio)) inicio = fecha;
  }
  if (rito !== null && (inicio === null || rito < inicio)) inicio = rito;

  const semanaHoy = lunesDeSemana(hoy);
  if (inicio === null) {
    return { racha: 0, nubladasUsadasEstaSemana: 0, viva: true };
  }

  let racha = 0;
  let viva = true;
  // Nubladas consumidas por semana (clave = lunes de la semana).
  const nubladas = new Map<string, number>();

  for (let f = inicio; f <= hoy; f = addDias(f, 1)) {
    if (rito === f && (!viva || racha === 0)) {
      viva = true;
      racha = 1;
      // La noche del rito queda cubierta por el rito mismo: no suma aparte
      // si se completa, ni falla (ni consume nublada) si no se completa.
      continue;
    }
    if (esCompleto(porFecha.get(f))) {
      if (viva) racha += 1;
      continue; // completar sin rito no reenciende una racha apagada
    }
    if (f === hoy) break; // hoy incompleto todavía no es un fallo
    if (!viva) continue; // racha apagada: los fallos ya no consumen nada
    const semana = lunesDeSemana(f);
    const usadas = nubladas.get(semana) ?? 0;
    if (usadas < NUBLADAS_POR_SEMANA) {
      nubladas.set(semana, usadas + 1); // noche nublada: protege, no suma
    } else {
      viva = false;
      racha = 0;
    }
  }

  return {
    racha,
    nubladasUsadasEstaSemana: nubladas.get(semanaHoy) ?? 0,
    viva,
  };
};
