import { describe, expect, it } from 'vitest';
import {
  LATIDO_VENCE_DIAS,
  PULSOS_APRECIO_POR_DIA,
  latidoVencido,
  puedeDarPulso,
  pulsosDisponibles,
} from './pulsos';

describe('presupuesto de pulsos', () => {
  it('5 por día, iguales para todos, nunca negativo', () => {
    expect(PULSOS_APRECIO_POR_DIA).toBe(5);
    expect(pulsosDisponibles(0)).toBe(5);
    expect(pulsosDisponibles(3)).toBe(2);
    expect(pulsosDisponibles(5)).toBe(0);
    expect(pulsosDisponibles(9)).toBe(0);
  });

  it('no se puede pulsar sin presupuesto ni repetir target', () => {
    expect(puedeDarPulso(0, false)).toEqual({ ok: true });
    expect(puedeDarPulso(5, false)).toEqual({ ok: false, motivo: 'sin-presupuesto' });
    expect(puedeDarPulso(0, true)).toEqual({ ok: false, motivo: 'repetido' });
  });
});

describe('latido de misión', () => {
  it('vence a los 7 días; nunca haber latido cuenta como vencido', () => {
    expect(LATIDO_VENCE_DIAS).toBe(7);
    expect(latidoVencido(null, '2026-07-19T12:00:00.000Z')).toBe(true);
    expect(latidoVencido('2026-07-15T12:00:00.000Z', '2026-07-19T12:00:00.000Z')).toBe(false);
    expect(latidoVencido('2026-07-11T12:00:00.000Z', '2026-07-19T12:00:00.000Z')).toBe(true);
  });
});
