import { describe, expect, it } from 'vitest';

import { auditar } from '../verificar-ciclo-la-mesa';

const PLANES = new Set(['PLANCUIDADO', 'PLANARCO']);
const ENSAYOS = new Set(['06-amor-sin-apego.md', '01-la-capa-cero.md']);

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
    expect(auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS)).toEqual([]);
  });

  it('falla si falta la sección Cartografía', () => {
    const raw = doc('Cierre sin cartografía.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS);
    expect(hallazgos.map((h) => h.regla)).toContain('cartografia-ausente');
  });

  it('falla fuera de la banda de palabras', () => {
    const raw = doc('Corto.\n\n## Cartografía\n\nPLANARCO.', 200);
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS);
    expect(hallazgos.map((h) => h.regla)).toContain('largo-fuera-de-banda');
  });

  it('falla ante un tic de la lista negra', () => {
    const raw = doc('Quiero ser honesto acá: no.\n\n## Cartografía\n\nPLANARCO.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS);
    expect(hallazgos.map((h) => h.regla)).toContain('tic-prohibido');
  });

  it('falla si la cartografía cita un PLAN o un ensayo inexistente', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\nPLANFANTASMA y `99-no-existe.md`.');
    const reglas = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS).map((h) => h.regla);
    expect(reglas).toContain('plan-inexistente');
    expect(reglas).toContain('ensayo-inexistente');
  });

  it('falla si el H1 o el H2 faltan, o si hay menos de cuatro secciones romanas', () => {
    const sinH1 = '## Sólo subtítulo\n\n## Cartografía\n\nPLANARCO.';
    const reglas = auditar([{ archivo: '01-la-capa-cero.md', raw: sinH1 }], PLANES, ENSAYOS).map((h) => h.regla);
    expect(reglas).toContain('encabezado-invalido');
    expect(reglas).toContain('secciones-insuficientes');
  });
});
