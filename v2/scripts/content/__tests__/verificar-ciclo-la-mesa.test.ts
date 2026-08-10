import { describe, expect, it } from 'vitest';

import { auditar } from '../verificar-ciclo-la-mesa';

const PLANES = new Set(['PLANCUIDADO', 'PLANARCO']);
const ENSAYOS = new Set(['06-amor-sin-apego.md', '01-la-capa-cero.md']);
const TITULOS = new Set(['La Capa Cero', 'El amor sin apego']);

function doc(cuerpo: string, palabras = 2600): string {
  const relleno = Array.from({ length: palabras }, (_, i) => `palabra${String(i)}`).join(' ');
  return [
    '# Un título',
    '',
    '## Un subtítulo',
    '',
    '## I. Primera',
    '',
    relleno,
    '',
    '## II. Segunda',
    '',
    '## III. Tercera',
    '',
    '## IV. Cuarta',
    '',
    cuerpo,
    '',
  ].join('\n');
}

describe('auditar', () => {
  it('acepta un ensayo bien formado', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\nPLANCUIDADO y `06-amor-sin-apego.md`.');
    expect(auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS)).toEqual([]);
  });

  it('falla si falta la sección Cartografía', () => {
    const raw = doc('Cierre sin cartografía.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS);
    expect(hallazgos.map((h) => h.regla)).toContain('cartografia-ausente');
  });

  it('falla fuera de la banda de palabras', () => {
    const raw = doc('Corto.\n\n## Cartografía\n\nPLANARCO.', 200);
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS);
    expect(hallazgos.map((h) => h.regla)).toContain('largo-fuera-de-banda');
  });

  it('falla ante un tic de la lista negra', () => {
    const raw = doc('Quiero ser honesto acá: no.\n\n## Cartografía\n\nPLANARCO.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS);
    expect(hallazgos.map((h) => h.regla)).toContain('tic-prohibido');
  });

  it('falla si la cartografía cita un PLAN o un ensayo inexistente', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\nPLANFANTASMA y `99-no-existe.md`.');
    const reglas = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS).map((h) => h.regla);
    expect(reglas).toContain('plan-inexistente');
    expect(reglas).toContain('ensayo-inexistente');
  });

  it('falla si el H1 o el H2 faltan, o si hay menos de cuatro secciones romanas', () => {
    const sinH1 = '## Sólo subtítulo\n\n## Cartografía\n\nPLANARCO.';
    const reglas = auditar([{ archivo: '01-la-capa-cero.md', raw: sinH1 }], PLANES, ENSAYOS, TITULOS).map((h) => h.regla);
    expect(reglas).toContain('encabezado-invalido');
    expect(reglas).toContain('secciones-insuficientes');
  });

  it('falla si la Cartografía no cita nada', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\nNada.');
    const reglas = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS).map((h) => h.regla);
    expect(reglas).toContain('cartografia-vacia');
  });

  it('un título itálico desconocido se reporta pero no dispara ninguna regla dura', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\n- *Tratado del Unicornio Inexistente* — no existe.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS);
    const reglas = hallazgos.map((h) => h.regla);
    expect(reglas).toContain('titulo-desconocido');
    expect(hallazgos.find((h) => h.regla === 'titulo-desconocido')?.detalle).toBe(
      'Tratado del Unicornio Inexistente',
    );
    // No debe disparar ninguna otra regla — un título desconocido no es
    // fatal por sí solo (PLANCUIDADO, Mandato Territorial y similares son
    // citas legítimas que tampoco son ensayos).
    expect(reglas.filter((r) => r !== 'titulo-desconocido')).toEqual([]);
  });

  it('acepta un título itálico conocido sin marcarlo como desconocido', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\n- *La Capa Cero* — el ensayo anterior.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS, TITULOS);
    expect(hallazgos).toEqual([]);
  });

  it('falla si dos archivos comparten el mismo ordinal', () => {
    const raw1 = doc('Cierre.\n\n## Cartografía\n\nPLANCUIDADO.');
    const raw2 = doc('Cierre.\n\n## Cartografía\n\nPLANARCO.');
    const hallazgos = auditar(
      [
        { archivo: '01-la-capa-cero.md', raw: raw1 },
        { archivo: '01-otra-version.md', raw: raw2 },
      ],
      PLANES,
      ENSAYOS,
      TITULOS,
    );
    const reglas = hallazgos.map((h) => h.regla);
    expect(reglas.filter((r) => r === 'ordinal-duplicado')).toHaveLength(2);
  });
});
