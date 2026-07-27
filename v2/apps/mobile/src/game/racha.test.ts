import { describe, expect, it } from 'vitest';
import {
  NUBLADAS_POR_SEMANA,
  addDias,
  computeRacha,
  diffDias,
  esFechaISO,
  lunesDeSemana,
} from './racha';
import type { DayRecord } from './types';

// Anclas de calendario: 2026-07-06 es lunes, 2026-07-12 domingo,
// 2026-07-13 el lunes siguiente.
const LUN = '2026-07-06';
const MAR = '2026-07-07';
const MIE = '2026-07-08';
const JUE = '2026-07-09';
const VIE = '2026-07-10';
const SAB = '2026-07-11';
const DOM = '2026-07-12';
const LUN2 = '2026-07-13';
const MAR2 = '2026-07-14';
const MIE2 = '2026-07-15';

/** Día completo (3 luces) o parcial. */
const dia = (fecha: string, luces: 0 | 1 | 2 | 3 = 3): DayRecord => ({
  fecha,
  ver: luces >= 1,
  encender: luces >= 2,
  dar: luces >= 3,
  nocheCompleta: luces === 3,
});

describe('helpers de fechas', () => {
  it('esFechaISO valida formato y calendario', () => {
    expect(esFechaISO('2026-07-09')).toBe(true);
    expect(esFechaISO('2026-02-30')).toBe(false);
    expect(esFechaISO('2026-7-9')).toBe(false);
    expect(esFechaISO('hoy')).toBe(false);
  });

  it('addDias cruza meses y años', () => {
    expect(addDias('2026-07-31', 1)).toBe('2026-08-01');
    expect(addDias('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDias('2024-02-28', 1)).toBe('2024-02-29'); // bisiesto
  });

  it('diffDias es dirigido', () => {
    expect(diffDias(LUN, JUE)).toBe(3);
    expect(diffDias(JUE, LUN)).toBe(-3);
  });

  it('lunesDeSemana ancla la semana argentina (lunes a domingo)', () => {
    expect(lunesDeSemana(LUN)).toBe(LUN);
    expect(lunesDeSemana(JUE)).toBe(LUN);
    expect(lunesDeSemana(DOM)).toBe(LUN); // el domingo cierra la semana
    expect(lunesDeSemana(LUN2)).toBe(LUN2); // el lunes abre la próxima
  });
});

describe('computeRacha — base', () => {
  it('sin historial: racha 0, viva, sin nubladas usadas', () => {
    expect(computeRacha([], JUE)).toEqual({
      racha: 0,
      nubladasUsadasEstaSemana: 0,
      viva: true,
    });
  });

  it('días consecutivos completos suman, incluida hoy', () => {
    const r = computeRacha([dia(LUN), dia(MAR), dia(MIE)], MIE);
    expect(r).toEqual({ racha: 3, nubladasUsadasEstaSemana: 0, viva: true });
  });

  it('hoy incompleto no es fallo: la racha de ayer sigue viva', () => {
    const r = computeRacha([dia(LUN), dia(MAR), dia(MIE), dia(JUE, 2)], JUE);
    expect(r.racha).toBe(3);
    expect(r.viva).toBe(true);
    expect(r.nubladasUsadasEstaSemana).toBe(0);
  });

  it('dos luces no alcanzan: día pasado incompleto es fallo', () => {
    const r = computeRacha([dia(LUN), dia(MAR, 2), dia(MIE)], MIE);
    expect(r.racha).toBe(2); // lun + mié; mar consumió nublada
    expect(r.nubladasUsadasEstaSemana).toBe(1);
  });

  it('los días previos a la primera noche completa no son fallos', () => {
    // Instaló hace semanas, arrancó a jugar el miércoles.
    const r = computeRacha([dia(MIE), dia(JUE)], JUE);
    expect(r).toEqual({ racha: 2, nubladasUsadasEstaSemana: 0, viva: true });
  });
});

describe('computeRacha — noches nubladas', () => {
  it('un día ausente consume una nublada y la racha sigue (sin sumar)', () => {
    // martes sin registro alguno
    const r = computeRacha([dia(LUN), dia(MIE)], MIE);
    expect(r.racha).toBe(2);
    expect(r.viva).toBe(true);
    expect(r.nubladasUsadasEstaSemana).toBe(1);
  });

  it('dos fallos en la misma semana: viva, 2 nubladas usadas', () => {
    const r = computeRacha([dia(LUN), dia(JUE)], JUE); // mar y mié ausentes
    expect(r.racha).toBe(2);
    expect(r.viva).toBe(true);
    expect(r.nubladasUsadasEstaSemana).toBe(NUBLADAS_POR_SEMANA);
  });

  it('el tercer fallo de la semana apaga la racha', () => {
    const r = computeRacha([dia(LUN), dia(VIE)], VIE); // mar, mié, jue ausentes
    expect(r.racha).toBe(0);
    expect(r.viva).toBe(false);
  });

  it('el presupuesto se renueva al cruzar el lunes', () => {
    // Fallos sáb+dom (semana 1) y lun2+mar2 (semana 2): 2 y 2 → viva.
    const r = computeRacha([dia(JUE), dia(VIE), dia(MIE2)], MIE2);
    expect(r.viva).toBe(true);
    expect(r.racha).toBe(3); // jue, vie, mié2
    expect(r.nubladasUsadasEstaSemana).toBe(2); // las de la semana de hoy
  });

  it('cinco fallos seguidos matan aunque crucen semana si una semana junta 3', () => {
    // Completo jue; fallos vie, sáb, dom → tercer fallo en la misma semana.
    const r = computeRacha([dia(JUE), dia(LUN2)], LUN2);
    expect(r.viva).toBe(false);
    expect(r.racha).toBe(0);
  });

  it('nubladasUsadasEstaSemana solo cuenta la semana calendario de hoy', () => {
    // Fallo el viernes (semana pasada), hoy es martes de la semana siguiente.
    const r = computeRacha([dia(JUE), dia(SAB), dia(DOM), dia(LUN2), dia(MAR2)], MAR2);
    expect(r.racha).toBe(5);
    expect(r.nubladasUsadasEstaSemana).toBe(0);
  });
});

describe('computeRacha — apagón y rito de re-encendido', () => {
  const muerta = [dia(LUN), dia(VIE)]; // mar+mié+jue ausentes → apagada

  it('completar días después del apagón NO reenciende sin rito', () => {
    const r = computeRacha([...muerta, dia(SAB), dia(DOM)], DOM);
    expect(r.viva).toBe(false);
    expect(r.racha).toBe(0);
  });

  it('el rito renace la racha en 1', () => {
    const r = computeRacha(muerta, SAB, SAB);
    expect(r).toMatchObject({ racha: 1, viva: true });
  });

  it('completar el mismo día del rito no duplica: sigue en 1', () => {
    const r = computeRacha([...muerta, dia(SAB)], SAB, SAB);
    expect(r.racha).toBe(1);
  });

  it('las noches completas posteriores al rito suman normalmente', () => {
    const r = computeRacha([...muerta, dia(SAB), dia(DOM)], DOM, SAB);
    expect(r).toMatchObject({ racha: 2, viva: true });
  });

  it('no se restaura el número: una racha larga muerta renace en 1', () => {
    const dias = [LUN, MAR, MIE, JUE, VIE, SAB, DOM].map((f) => dia(f));
    // Semana 2 entera ausente → muere el miércoles 2. Rito el jueves 2.
    const JUE2 = '2026-07-16';
    const r = computeRacha(dias, JUE2, JUE2);
    expect(r).toMatchObject({ racha: 1, viva: true });
  });

  it('un rito con la racha viva no la pisa', () => {
    const r = computeRacha([dia(LUN), dia(MAR), dia(MIE)], MIE, MAR);
    expect(r.racha).toBe(3);
  });

  it('si la semana ya gastó sus nubladas, un fallo post-rito apaga de nuevo', () => {
    // mar+mié consumen las 2 nubladas; jue mata; rito vie; sáb falla → muere.
    const r = computeRacha([dia(LUN), dia(DOM)], DOM, VIE);
    expect(r.viva).toBe(false);
    expect(r.racha).toBe(0);
  });

  it('un rito futuro respecto de hoy se ignora', () => {
    const r = computeRacha(muerta, VIE, DOM);
    expect(r.viva).toBe(false);
  });

  it('fecha inválida tira error', () => {
    expect(() => computeRacha([], '09/07/2026')).toThrow();
  });
});
