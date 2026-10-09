import { describe, expect, it } from 'vitest';

import { analizarOpiniones, type RespuestaParaAnalisis } from './opiniones';
const matriz = (funcion: (p: number, f: number) => RespuestaParaAnalisis['valor']) =>
  Array.from({ length: 12 }, (_, p) =>
    Array.from({ length: 4 }, (_, f) => ({
      participante: `p${p}`,
      afirmacion: `f${f}`,
      valor: funcion(p, f),
    })),
  ).flat();
describe('Respuestas explícitas y estructura exploratoria', () => {
  it('la exposición sin respuesta no se imputa como acuerdo ni permite formar grupos', () => {
    const a = analizarOpiniones(matriz(() => null));
    expect(a.estado).toBe('insuficiente');
    expect(a.incluidos).toBe(0);
    expect(a.grupos).toEqual([]);
  });
  it('todos de acuerdo o todos pasan no inventa divisiones', () => {
    expect(analizarOpiniones(matriz(() => 'acuerdo')).estado).toBe('sin_estructura');
    expect(analizarOpiniones(matriz(() => 'paso')).estado).toBe('sin_estructura');
  });
  it('conserva condiciones comunes y diferencias, sin devolver identidad individual', () => {
    const a = analizarOpiniones(
      matriz((p, f) => (f === 0 ? 'acuerdo' : p < 6 ? 'acuerdo' : 'desacuerdo')),
    );
    expect(a.estado).toBe('exploratorio');
    expect(a.grupos.map((g) => g.cuentas)).toEqual([6, 6]);
    const comun = a.condiciones.find((x) => x.afirmacion === 'f0');
    if (!comun) throw new Error('Falta condición común');
    expect(comun.apoyo).toBeGreaterThan(0.7);
    expect(comun.grupos.map((g) => g.acuerdos)).toEqual([6, 6]);
    expect(JSON.stringify(a)).not.toContain('p0');
  });
  it('el paso entra en el denominador sin volverse desacuerdo; faltantes permanecen faltantes', () => {
    const a = analizarOpiniones(
      matriz((p, f) =>
        f === 0
          ? p === 0
            ? 'paso'
            : p === 6
              ? null
              : 'acuerdo'
          : p < 6
            ? 'acuerdo'
            : 'desacuerdo',
      ),
    );
    expect(a.estado).toBe('exploratorio');
    const g = a.condiciones.find((x) => x.afirmacion === 'f0')?.grupos ?? [];
    expect(g.reduce((s, x) => s + (x.respuestas ?? 0), 0)).toBe(11);
    expect(g.reduce((s, x) => s + (x.acuerdos ?? 0), 0)).toBe(10);
  });
  it('el orden de llegada no cambia el resultado y conjuntos grandes quedan declarados', () => {
    const m = matriz((p, f) => (f === 0 ? 'acuerdo' : p < 6 ? 'acuerdo' : 'desacuerdo'));
    expect(analizarOpiniones(m)).toEqual(analizarOpiniones([...m].reverse()));
    expect(
      analizarOpiniones(
        Array.from({ length: 401 }, (_, p) => ({
          participante: String(p),
          afirmacion: 'a',
          valor: 'acuerdo' as const,
        })),
      ).motivo,
    ).toContain('desacoplado');
  });
});
