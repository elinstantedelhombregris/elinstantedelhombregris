import { describe, expect, it } from 'vitest';

import { LIMITES_ARGENTINA, VISTA_PREVIA, vistaInicial } from '../vista-inicial';

describe('el encuadre inicial del mapa', () => {
  it('sin lugar en la dirección se ajusta a la Argentina entera, con margen', () => {
    const vista = vistaInicial(false);
    expect('bounds' in vista).toBe(true);
    if (!('bounds' in vista)) return;
    const [[oeste, sur], [este, norte]] = vista.bounds;
    // Jujuy está cerca de -22° y Tierra del Fuego baja de -54,5°: los dos entran.
    expect(norte).toBeGreaterThan(-22);
    expect(sur).toBeLessThan(-54.8);
    // Y también el oeste de Mendoza y el este de Misiones y Corrientes.
    expect(oeste).toBeLessThan(-73);
    expect(este).toBeGreaterThan(-54);
    const margen = vista.fitBoundsOptions?.padding;
    expect(margen).toBeDefined();
    if (!margen) return;
    for (const lado of [margen.top, margen.right, margen.bottom, margen.left]) {
      expect(lado).toBeGreaterThan(0);
    }
    expect(vista.bounds).toBe(LIMITES_ARGENTINA);
  });

  it('con un lugar en la dirección no pelea con él: queda el encuadre previo', () => {
    const vista = vistaInicial(true);
    expect('bounds' in vista).toBe(false);
    expect(vista).toEqual(VISTA_PREVIA);
  });
});
