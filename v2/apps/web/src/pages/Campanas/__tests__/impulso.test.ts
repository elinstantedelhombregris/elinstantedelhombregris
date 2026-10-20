import { describe, expect, it } from 'vitest';

import {
  contenidoParaCompartir,
  esPropuestaActiva,
  juntaGente,
  lineaDeLugares,
  motivoDeDevolucion,
  textoDeLaBarra,
  textoDeLoQueFalta,
} from '../impulso';

const paso = (revision: number, estado: string, motivo = '') => ({
  revision,
  estado,
  motivo,
  fecha: '2026-10-20T00:00:00.000Z',
});

describe('la barra del paso previo', () => {
  it('dice cuántas personas necesita y cuántas lleva', () => {
    expect(textoDeLaBarra({ personas: 18, umbral: 50 })).toBe(
      'Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 18.',
    );
    expect(textoDeLaBarra({ personas: 0, umbral: 50 })).toBe(
      'Para abrirse, esta campaña necesita 50 personas nuevas. Todavía no llegó ninguna.',
    );
  });
  it('completa, dice que ya trajo a todas', () => {
    expect(textoDeLaBarra({ personas: 50, umbral: 50 })).toBe(
      'Ya trajo las 50 personas nuevas que necesitaba para abrirse.',
    );
  });
  it('a quien la impulsa le dice cuántas le faltan, con singular', () => {
    expect(textoDeLoQueFalta({ personas: 18, umbral: 50 })).toBe(
      'Te faltan 32 personas nuevas para que pase a revisión.',
    );
    expect(textoDeLoQueFalta({ personas: 49, umbral: 50 })).toBe(
      'Te falta una persona nueva para que pase a revisión.',
    );
  });
});

describe('motivoDeDevolucion', () => {
  it('es el motivo del paso a reuniendo que vino justo después de la revisión', () => {
    const c = {
      estado: 'reuniendo' as const,
      historial: [
        paso(5, 'reuniendo', 'Falta decir cómo se usan los datos.'),
        paso(3, 'reuniendo', 'Quien la propone la presenta para juntar gente.'),
        paso(4, 'por_revisar', 'Trajo 50 personas nuevas: pasa a revisión.'),
      ],
    };
    expect(motivoDeDevolucion(c)).toBe('Falta decir cómo se usan los datos.');
  });
  it('sigue a la vista mientras quien la impulsa la corrige en borrador', () => {
    const c = {
      estado: 'borrador' as const,
      historial: [
        paso(4, 'por_revisar'),
        paso(5, 'reuniendo', 'Cambiá la fecha.'),
        paso(6, 'borrador', 'Quien la impulsa la retira para corregirla.'),
      ],
    };
    expect(motivoDeDevolucion(c)).toBe('Cambiá la fecha.');
  });
  it('sin devolución, o con otra revisión después, no hay motivo', () => {
    expect(
      motivoDeDevolucion({
        estado: 'reuniendo',
        historial: [paso(1, 'borrador'), paso(2, 'reuniendo', 'Presentada.')],
      }),
    ).toBeNull();
    expect(
      motivoDeDevolucion({
        estado: 'por_revisar',
        historial: [
          paso(4, 'por_revisar'),
          paso(5, 'reuniendo', 'Cambiá la fecha.'),
          paso(6, 'por_revisar'),
        ],
      }),
    ).toBeNull();
  });
});

describe('la imagen y los lugares', () => {
  it('la imagen lleva la pregunta, el lugar y el llamado', () => {
    expect(contenidoParaCompartir('¿Qué querés para tu plaza?', 'Salta')).toEqual({
      kicker: 'Una campaña quiere abrir',
      texto: '¿Qué querés para tu plaza?',
      pie: 'Salta',
      llamado: '¿Te sumás?',
      bajada: 'Contá tu Argentina ideal y ayudala a abrir',
    });
    expect(contenidoParaCompartir('¿Algo?', '').pie).toBe('Todo el país');
  });
  it('los lugares van en una línea corta', () => {
    expect(lineaDeLugares([], 0)).toBe('Todo el país');
    expect(lineaDeLugares(['Salta'], 1)).toBe('Salta');
    expect(lineaDeLugares(['Salta', 'Jujuy'], 3)).toBe('Salta · Jujuy y 1 lugar más');
    expect(lineaDeLugares([], 2)).toBe('');
  });
});

describe('qué cuenta como propuesta', () => {
  it('juntan gente las que están reuniendo o en revisión', () => {
    expect(juntaGente('reuniendo')).toBe(true);
    expect(juntaGente('por_revisar')).toBe(true);
    expect(juntaGente('abierta')).toBe(false);
  });
  it('el 409 de una propuesta activa no se confunde con otros 409', () => {
    expect(esPropuestaActiva({ status: 409, code: 'PROPUESTA_ACTIVA' })).toBe(true);
    expect(esPropuestaActiva({ status: 409, code: 'ENVIO_DISTINTO' })).toBe(false);
    expect(esPropuestaActiva({ status: 409, code: 'REVISION_CAMBIADA' })).toBe(false);
    expect(esPropuestaActiva({ status: 400 })).toBe(false);
    expect(esPropuestaActiva(new Error('x'))).toBe(false);
  });
});
