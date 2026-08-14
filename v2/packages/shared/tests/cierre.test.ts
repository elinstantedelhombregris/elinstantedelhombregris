import { describe, expect, it } from 'vitest';

import { parsearCierre, validarCierre } from '../src/content/cierre';

const CUERPO = `Prosa.

### El caso
En 2024 la Auditoría General de la Nación publicó cuarenta y un informes. El artículo 85 de la Constitución le da el control externo del sector público. El dato permite ver que producir evidencia no garantiza que una institución actúe sobre ella: también hacen falta responsables, plazos y consecuencias públicas que cierren el circuito de control. Sin esa devolución, el informe queda como archivo y no como aprendizaje institucional.

### La palanca
Pedí el último informe de la AGN sobre tu jurisdicción. Leé el objeto, la fecha y las recomendaciones. Anotá quién debía responder y si existe una contestación pública. Compará esa secuencia con un control que conozcas en tu municipio.
Pedí el documento esta semana.

### El puente
PLANREP convierte ese diagnóstico en obligación de respuesta.`;

const CONTEXTO = { slugsValidos: new Set(['PLANREP']), tieneFuentes: true };

describe('parsearCierre', () => {
  it('separa las tres piezas', () => {
    const c = parsearCierre(CUERPO);
    expect(c.caso).toContain('Auditoría General');
    expect(c.palanca).toContain('jurisdicción');
    expect(c.puente).toContain('PLANREP');
  });
  it('devuelve null cuando faltan', () => {
    expect(parsearCierre('Prosa.')).toEqual({ caso: null, palanca: null, puente: null });
  });
});

describe('validarCierre', () => {
  it('acepta el contrato completo', () =>
    expect(validarCierre(parsearCierre(CUERPO), 'completo', CONTEXTO)).toEqual([]));
  it('exige fuentes', () =>
    expect(
      validarCierre(parsearCierre(CUERPO), 'completo', { ...CONTEXTO, tieneFuentes: false }).join(
        ' ',
      ),
    ).toContain('fuentes'));
  it('con puente sólo exige el puente', () =>
    expect(
      validarCierre(
        { caso: null, palanca: null, puente: 'Conecta con PLANREP.' },
        'puente',
        CONTEXTO,
      ),
    ).toEqual([]));
  it('pendiente no exige piezas', () =>
    expect(
      validarCierre({ caso: null, palanca: null, puente: null }, 'pendiente', CONTEXTO),
    ).toEqual([]));
});
