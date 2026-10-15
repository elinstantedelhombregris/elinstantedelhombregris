import { describe, expect, it } from 'vitest';

import {
  escenarioDisponibilidadSchema,
  estimarDisponibilidad,
  type EscenarioDisponibilidad,
} from '../disponibilidad.js';

const caso = {
  horasEquipo: { min: 8, max: 12 },
  horasPorActividad: { min: 2, max: 4 },
  plazasPorActividad: { min: 5, max: 6 },
  procedencia: 'Supuestos para una prueba aislada.',
  fecha: '2026-10-15',
  origen: 'supuesto' as const,
};
const v: EscenarioDisponibilidad = {
  referencia: caso,
  alternativa: caso,
  periodo: 'Una semana',
  perjudicados: 'Quienes no pueden asistir en este horario.',
  limites: 'Falta comprobar el espacio disponible.',
};
describe('Capacidad exploratoria', () => {
  it('propaga extremos sin sumar plazas como personas únicas', () => {
    const r = estimarDisponibilidad(v);
    expect(r.referencia.actividades).toEqual({ min: 2, max: 6 });
    expect(r.referencia.plazas).toEqual({ min: 10, max: 36 });
    expect(r.referencia.sensibilidad.map((s) => s.actividades)).toEqual([2, 3, 4]);
  });
  it('conserva cero real y rechaza rangos invertidos, tiempos nulos y fuentes ausentes', () => {
    expect(
      estimarDisponibilidad({ ...v, referencia: { ...caso, horasEquipo: { min: 0, max: 0 } } })
        .referencia.plazas,
    ).toEqual({ min: 0, max: 0 });
    for (const referencia of [
      { ...caso, horasEquipo: { min: 3, max: 2 } },
      { ...caso, horasPorActividad: { min: 0, max: 2 } },
      { ...caso, procedencia: '' },
      { ...caso, plazasPorActividad: { min: 1.5, max: 2 } },
    ])
      expect(escenarioDisponibilidadSchema.safeParse({ ...v, referencia }).success).toBe(false);
  });
  it('no pierde una actividad por representación binaria de horas decimales', () => {
    expect(
      estimarDisponibilidad({
        ...v,
        referencia: {
          ...caso,
          horasEquipo: { min: 0.3, max: 0.3 },
          horasPorActividad: { min: 0.1, max: 0.1 },
        },
      }).referencia.actividades,
    ).toEqual({ min: 3, max: 3 });
  });
});
