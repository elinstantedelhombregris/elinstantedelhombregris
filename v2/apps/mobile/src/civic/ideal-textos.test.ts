import { SLUG_CAMPANA_NACIONAL } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import { campanaDe } from './campana-de-prueba';
import {
  bloqueDeExito,
  esCampanaEjemplo,
  esCampanaNacional,
  estadoDelBorrador,
  fechaLarga,
  fraseDeCampanaDelRecibo,
  leyendaDelContador,
  ordenarCampanas,
  rotuloEstadoAporte,
  rotuloEtapa,
} from './ideal-textos';

describe('Fechas: siempre en castellano, nunca ISO', () => {
  it('una fecha de día se escribe con día, mes y año, sin ceros delante', () => {
    expect(fechaLarga('2027-03-15')).toBe('15 de marzo de 2027');
    expect(fechaLarga('2026-11-05')).toBe('5 de noviembre de 2026');
    expect(fechaLarga('2026-01-01')).toBe('1 de enero de 2026');
    expect(fechaLarga('2026-12-31')).toBe('31 de diciembre de 2026');
  });

  it('cubre los doce meses', () => {
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    meses.forEach((mes, i) => {
      expect(fechaLarga(`2027-${String(i + 1).padStart(2, '0')}-10`)).toBe(`10 de ${mes} de 2027`);
    });
  });

  it('una fecha con hora se lee en el día local de quien mira, no en UTC', () => {
    expect(fechaLarga(new Date(2027, 2, 15, 10, 30).toISOString())).toBe('15 de marzo de 2027');
    expect(fechaLarga(new Date(2026, 10, 5, 23, 59).toISOString())).toBe('5 de noviembre de 2026');
  });

  it('lo que no es una fecha se devuelve tal cual, sin inventar una', () => {
    expect(fechaLarga('mañana')).toBe('mañana');
    expect(fechaLarga('2026-13-40')).toBe('2026-13-40');
    expect(fechaLarga('')).toBe('');
  });
});

describe('Etapas de una campaña: las palabras de la web, y «etapa», nunca «fase»', () => {
  it('cada estado tiene su rótulo', () => {
    expect(rotuloEtapa('borrador')).toBe('En preparación');
    expect(rotuloEtapa('programada')).toBe('Programada');
    expect(rotuloEtapa('abierta')).toBe('Abierta a participar');
    expect(rotuloEtapa('pausada')).toBe('Pausa explicada');
    expect(rotuloEtapa('en_devolucion')).toBe('Preparando la devolución');
    expect(rotuloEtapa('cerrada')).toBe('Ronda cerrada');
  });

  it('un estado desconocido no muestra la clave cruda', () => {
    expect(rotuloEtapa('algo_nuevo')).toBe('Etapa sin nombre');
    expect(rotuloEtapa('algo_nuevo')).not.toMatch(/_/);
  });
});

describe('Estado de un aporte: castellano, sin guiones bajos', () => {
  it('traduce los siete estados del registro', () => {
    expect(rotuloEstadoAporte('enviada')).toBe('Publicado');
    expect(rotuloEstadoAporte('por_verificar')).toBe('Por verificar');
    expect(rotuloEstadoAporte('corroborada')).toBe('Corroborado');
    expect(rotuloEstadoAporte('resuelta')).toBe('Resuelto');
    expect(rotuloEstadoAporte('desactualizada')).toBe('Desactualizado');
    expect(rotuloEstadoAporte('no_cumplida')).toBe('No cumplido');
    expect(rotuloEstadoAporte('retirada')).toBe('Retirado');
  });

  it('un estado que todavía no conocemos se escribe legible, no crudo', () => {
    expect(rotuloEstadoAporte('en_revision_humana')).toBe('En revision humana');
    expect(rotuloEstadoAporte('en_revision_humana')).not.toMatch(/_/);
    expect(rotuloEstadoAporte('')).toBe('Estado sin nombre');
  });
});

describe('Campañas nacional y de ejemplo', () => {
  it('la nacional se reconoce por su slug', () => {
    expect(esCampanaNacional({ slug: SLUG_CAMPANA_NACIONAL })).toBe(true);
    expect(esCampanaNacional({ slug: 'aprender-en-mendoza' })).toBe(false);
  });

  it('los ejemplos locales se reconocen, y una campaña real no', () => {
    expect(esCampanaEjemplo({ slug: 'demo-local-aprender-mendoza' })).toBe(true);
    expect(esCampanaEjemplo({ slug: 'demo-local-otro-ejemplo' })).toBe(true);
    expect(esCampanaEjemplo({ slug: 'aprender-en-mendoza' })).toBe(false);
    expect(esCampanaEjemplo({ slug: SLUG_CAMPANA_NACIONAL })).toBe(false);
  });

  it('las campañas reales van primero y los ejemplos al final, sin mezclar el orden de cada grupo', () => {
    const lista = [
      { slug: 'demo-local-aprender-mendoza' },
      { slug: 'b-real' },
      { slug: 'demo-local-z' },
      { slug: 'a-real' },
    ];
    expect(ordenarCampanas(lista).map((c) => c.slug)).toEqual([
      'b-real',
      'a-real',
      'demo-local-aprender-mendoza',
      'demo-local-z',
    ]);
    expect(lista[0]?.slug).toBe('demo-local-aprender-mendoza');
  });
});

describe('La frase de campaña del bloque «Tu aporte quedó publicado.»', () => {
  const nacional = campanaDe({
    slug: SLUG_CAMPANA_NACIONAL,
    contrato: {
      titulo: 'Mi Argentina ideal',
      responsable: 'Juan Bravin',
      fechaDevolucion: '2027-03-15',
    },
  });

  it('campaña nacional: nombra la campaña, a quien la coordina y la fecha', () => {
    expect(fraseDeCampanaDelRecibo({ campanaId: nacional.id, campana: nacional })).toBe(
      'Tu aporte entró en la campaña nacional «Mi Argentina ideal». Juan Bravin, que la coordina, va a publicar una devolución el 15 de marzo de 2027 con lo que se leyó.',
    );
  });

  it('otra campaña: el mismo patrón, con su título', () => {
    const otra = campanaDe();
    expect(fraseDeCampanaDelRecibo({ campanaId: otra.id, campana: otra })).toBe(
      'Tu aporte entró en la campaña «Aprender en Mendoza». Marta Quiroga, que la coordina, va a publicar una devolución el 5 de noviembre de 2026 con lo que se leyó.',
    );
  });

  it('los valores salen de los datos de la campaña: si cambian, cambia la frase', () => {
    const otraFecha = campanaDe({
      slug: SLUG_CAMPANA_NACIONAL,
      contrato: {
        titulo: 'Mi Argentina ideal',
        responsable: 'Ana Pérez',
        fechaDevolucion: '2027-06-15',
      },
    });
    const frase = fraseDeCampanaDelRecibo({ campanaId: otraFecha.id, campana: otraFecha });
    expect(frase).toContain('Ana Pérez');
    expect(frase).toContain('15 de junio de 2027');
    expect(frase).not.toContain('Juan Bravin');
    expect(frase).not.toContain('15 de marzo de 2027');
    expect(frase).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('sin campaña: dice que nadie se comprometió a responder', () => {
    expect(fraseDeCampanaDelRecibo({ campanaId: null, campana: null })).toBe(
      'Tu aporte quedó publicado. Por ahora no está en ninguna campaña, así que nadie se comprometió a responderlo.',
    );
  });

  it('si entró en una campaña pero no se pudo leer, no inventa responsable ni fecha', () => {
    const frase = fraseDeCampanaDelRecibo({ campanaId: 'x', campana: null });
    expect(frase).toContain('no pudimos leer sus datos');
    expect(frase).not.toMatch(/devolución el/);
  });
});

describe('El bloque de éxito', () => {
  const c = campanaDe();
  it('título y bajada son los del encargo', () => {
    const b = bloqueDeExito({ retirado: false, campanaId: c.id, campana: c });
    expect(b.titulo).toBe('Tu aporte quedó publicado.');
    expect(b.lead).toBe(
      'Ya podés verlo, corregirlo o retirarlo. No es un acuerdo ni un compromiso de nadie.',
    );
    expect(b.campana).toContain('Aprender en Mendoza');
  });

  it('mientras se lee la campaña no dice nada de ella (ni «no pudimos leer»)', () => {
    const b = bloqueDeExito({ retirado: false, campanaId: c.id, campana: null, leyendo: true });
    expect(b.campana).toBeNull();
  });

  it('sin campaña no hay nada que esperar de la lectura', () => {
    const b = bloqueDeExito({ retirado: false, campanaId: null, campana: null, leyendo: true });
    expect(b.campana).toContain('no está en ninguna campaña');
  });

  it('un aporte retirado ya no dice que está publicado', () => {
    const b = bloqueDeExito({ retirado: true, campanaId: c.id, campana: c });
    expect(b.titulo).toBe('Retiraste tu aporte.');
    expect(b.lead).not.toMatch(/publicado/);
    expect(b.campana).toBeNull();
  });
});

describe('«Mis borradores»: qué es cada copia', () => {
  it('distingue publicado, sin confirmar, retirado y borrador', () => {
    expect(estadoDelBorrador({ recibo: null, envio: null })).toBe(
      'Borrador · solo en este teléfono',
    );
    expect(estadoDelBorrador({ recibo: 'r', envio: null })).toBe(
      'Aporte publicado · la copia sigue en este teléfono',
    );
    expect(estadoDelBorrador({ recibo: 'r', envio: null, retirado: true })).toBe(
      'Aporte retirado · la copia sigue en este teléfono',
    );
    // Un envío que no llegó a confirmarse: puede o no haberse publicado.
    const envio = {} as never;
    expect(estadoDelBorrador({ recibo: null, envio })).toContain('Sin confirmar');
  });

  it('el contador no promete privacidad cuando el aporte ya es público', () => {
    expect(leyendaDelContador(12, { recibo: null, envio: null })).toBe(
      '12/2000 · privado hasta que lo publiques',
    );
    expect(leyendaDelContador(12, { recibo: 'r', envio: null })).toBe('12/2000');
    expect(leyendaDelContador(12, { recibo: null, envio: {} as never })).toBe(
      '12/2000 · envío sin confirmar',
    );
  });
});
