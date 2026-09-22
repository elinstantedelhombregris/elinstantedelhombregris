import { describe, expect, it } from 'vitest';

import {
  formatoPorcentaje,
  humanizarTema,
  plegarTipos,
  regimenDe,
  topeBrechas,
  UMBRAL_PORCENTAJE,
} from '../mandato-regimen';

describe('regimenDe', () => {
  it('0 → cero · 1..99 → palitos · ≥100 → porcentaje', () => {
    expect(regimenDe(0)).toBe('cero');
    expect(regimenDe(1)).toBe('palitos');
    expect(regimenDe(UMBRAL_PORCENTAJE - 1)).toBe('palitos');
    expect(regimenDe(UMBRAL_PORCENTAJE)).toBe('porcentaje');
  });
});

describe('formatoPorcentaje', () => {
  it('formatea es-AR con un decimal', () => {
    expect(formatoPorcentaje(184, 1000)).toBe('18,4%');
    expect(formatoPorcentaje(500, 1000)).toBe('50%');
  });
});

describe('humanizarTema', () => {
  it('snake_case → palabras', () => {
    expect(humanizarTema('salud_publica')).toBe('salud publica');
  });
});

describe('plegarTipos', () => {
  /**
   * Esto afirmaba lo contrario: que `null` y `otra_cosa` se plegaban en `valor`
   * y que el resultado era `{ tipo: 'valor', total: 3 }`. O sea que el registro
   * del mandato publicaba como preferencia de la gente —«tres voces dijeron
   * valor»— la suma de lo que el sistema no supo leer. Es la regla 5 al revés:
   * una síntesis que esconde su hueco en vez de mostrarlo.
   */
  it('NO pliega lo que no reconoce: lo cuenta aparte, y ordena desc', () => {
    expect(
      plegarTipos([
        { tipo: 'basta', total: 5 },
        { tipo: null, total: 2 },
        { tipo: 'otra_cosa', total: 1 },
        { tipo: 'sueño', total: 9 },
      ]),
    ).toEqual({
      porTipo: [
        { tipo: 'sueño', total: 9 },
        { tipo: 'basta', total: 5 },
      ],
      sinReconocer: 3,
    });
  });

  it('`valor` salió del canon y ahora cae en «sin reconocer»', () => {
    // Antes `valor` era un tipo de la paleta y se contaba como tal. Salió del
    // canon —un valor no tiene coordenada— y la migración NO lo pliega contra
    // ningún tipo nuevo: reparte su peso a «sin reconocer» y lo dice. Plegarlo
    // en silencio contra, digamos, `sueño` habría inflado esa cuenta con filas
    // que nadie escribió como sueños.
    expect(plegarTipos([{ tipo: 'valor', total: 4 }])).toEqual({
      porTipo: [],
      sinReconocer: 4,
    });
  });
});

describe('orden territorial sin inferir cobertura de cantidades incompatibles', () => {
  it('conserva todos los territorios y ordena por nombre, sin restar recursos a necesidades', () => {
    const filas = Array.from({ length: 8 }, (_, i) => ({
      provincia: String(8 - i),
      piden: i,
      ofrecen: 50 - i,
    }));
    const resultado = topeBrechas(filas);
    expect(resultado).toHaveLength(8);
    expect(resultado.map((r) => r.provincia)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    expect(filas[0]?.provincia).toBe('8');
  });
});
