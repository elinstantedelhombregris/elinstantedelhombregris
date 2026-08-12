import { describe, expect, it } from 'vitest';

import {
  ESTADOS_DE_FALTA,
  ESTADOS_TERMINALES,
  esTerminal,
  idPublicoDeFalta,
  leerIdPublico,
  prefijoDeOrigen,
  severidadValida,
  transicionValida,
  vaciaContenido,
  type EstadoDeFalta,
} from '../faltas.js';

/**
 * La máquina de estados del canal de escucha
 * (`docs/specs/2026-08-12-lo-que-falta.md` §2.3).
 *
 * El caso que justifica el archivo entero es uno solo: **un «no va» sin razón
 * escrita no se guarda**. Todo lo demás de este canal es infraestructura; eso
 * es la promesa. Se prueba acá, sin Express y sin base, para que valga igual
 * cuando lo llame la ruta, el importador o cualquier boca futura.
 */
describe('transicionValida', () => {
  it('rechaza un «no va» sin razón, y lo acepta con razón', () => {
    const sinRazon = transicionValida('dicha', 'no_va');
    expect(sinRazon.ok).toBe(false);
    expect(sinRazon.ok === false && sinRazon.codigo).toBe('RAZON_REQUERIDA');

    const conEspacios = transicionValida('dicha', 'no_va', { razon: '   ' });
    expect(conEspacios.ok).toBe(false);
    expect(conEspacios.ok === false && conEspacios.codigo).toBe('RAZON_REQUERIDA');

    expect(transicionValida('dicha', 'no_va', { razon: 'Ya lo cubre PLANFOCO.' })).toEqual({
      ok: true,
    });
  });

  it('exige razón también para bajar, que es la otra forma de cerrar sin hacer', () => {
    expect(transicionValida('dicha', 'bajada').ok).toBe(false);
    expect(transicionValida('dicha', 'bajada', { razon: 'insultos' })).toEqual({ ok: true });
  });

  it('deja recorrer el camino completo hasta hecha', () => {
    expect(transicionValida('dicha', 'anotada')).toEqual({ ok: true });
    expect(transicionValida('anotada', 'en_curso')).toEqual({ ok: true });
    expect(transicionValida('en_curso', 'hecha')).toEqual({ ok: true });
  });

  it('no deja saltear pasos ni volver atrás', () => {
    for (const [desde, hacia] of [
      ['dicha', 'en_curso'],
      ['dicha', 'hecha'],
      ['anotada', 'hecha'],
      ['anotada', 'dicha'],
      ['en_curso', 'anotada'],
    ] as [EstadoDeFalta, EstadoDeFalta][]) {
      const resultado = transicionValida(desde, hacia, { razon: 'da igual' });
      expect(resultado.ok, `${desde} → ${hacia}`).toBe(false);
      expect(resultado.ok === false && resultado.codigo).toBe('TRANSICION_INVALIDA');
    }
  });

  it('alcanza bajada desde cualquier estado no terminal', () => {
    for (const desde of ['dicha', 'anotada', 'en_curso'] as EstadoDeFalta[]) {
      expect(transicionValida(desde, 'bajada', { razon: 'spam' }), desde).toEqual({ ok: true });
    }
  });

  it('no mueve nada que ya esté cerrado, y lo dice como cerrado y no como inválido', () => {
    for (const desde of ESTADOS_TERMINALES) {
      for (const hacia of ESTADOS_DE_FALTA) {
        if (hacia === desde) continue;
        const resultado = transicionValida(desde, hacia, { razon: 'da igual' });
        expect(resultado.ok, `${desde} → ${hacia}`).toBe(false);
        expect(resultado.ok === false && resultado.codigo, `${desde} → ${hacia}`).toBe(
          'YA_ES_TERMINAL',
        );
      }
    }
  });

  it('rechaza mover una falta al estado en el que ya está', () => {
    const resultado = transicionValida('anotada', 'anotada');
    expect(resultado.ok).toBe(false);
    expect(resultado.ok === false && resultado.codigo).toBe('TRANSICION_INVALIDA');
  });

  it('rechaza un estado que no existe', () => {
    const resultado = transicionValida('dicha', 'archivada' as EstadoDeFalta);
    expect(resultado.ok).toBe(false);
    expect(resultado.ok === false && resultado.codigo).toBe('ESTADO_DESCONOCIDO');
  });
});

describe('el contenido y el cierre', () => {
  it('sólo bajada vacía el contenido — hecha y no va lo conservan', () => {
    expect(vaciaContenido('bajada')).toBe(true);
    for (const estado of ['dicha', 'anotada', 'en_curso', 'hecha', 'no_va'] as EstadoDeFalta[]) {
      expect(vaciaContenido(estado), estado).toBe(false);
    }
  });

  it('los tres terminales son hecha, no va y bajada', () => {
    expect([...ESTADOS_TERMINALES].sort()).toEqual(['bajada', 'hecha', 'no_va']);
    expect(esTerminal('dicha')).toBe(false);
  });
});

describe('severidadValida', () => {
  it('deja calificar lo de adentro y no lo de afuera', () => {
    expect(severidadValida('adentro', 'alta')).toBe(true);
    expect(severidadValida('afuera', 'alta')).toBe(false);
  });

  it('acepta la ausencia de severidad en los dos orígenes', () => {
    expect(severidadValida('adentro', undefined)).toBe(true);
    expect(severidadValida('afuera', undefined)).toBe(true);
    expect(severidadValida('afuera', null)).toBe(true);
  });

  it('rechaza una severidad inventada', () => {
    expect(severidadValida('adentro', 'catastrófica')).toBe(false);
  });
});

describe('el id público', () => {
  it('usa D para adentro e I para afuera, con tres dígitos', () => {
    expect(prefijoDeOrigen('adentro')).toBe('D');
    expect(prefijoDeOrigen('afuera')).toBe('I');
    expect(idPublicoDeFalta('adentro', 34)).toBe('D-034');
    expect(idPublicoDeFalta('afuera', 7)).toBe('I-007');
    expect(idPublicoDeFalta('afuera', 1234)).toBe('I-1234');
  });

  it('los dos rangos no chocan nunca, porque el prefijo los separa', () => {
    expect(idPublicoDeFalta('adentro', 7)).not.toBe(idPublicoDeFalta('afuera', 7));
  });

  it('rechaza numeraciones imposibles', () => {
    expect(() => idPublicoDeFalta('afuera', 0)).toThrow(RangeError);
    expect(() => idPublicoDeFalta('afuera', -1)).toThrow(RangeError);
    expect(() => idPublicoDeFalta('afuera', 1.5)).toThrow(RangeError);
  });

  it('se lee de vuelta, tolerando el ancho y las minúsculas', () => {
    expect(leerIdPublico('D-034')).toEqual({ origen: 'adentro', numero: 34 });
    expect(leerIdPublico('d-34')).toEqual({ origen: 'adentro', numero: 34 });
    expect(leerIdPublico(' I-007 ')).toEqual({ origen: 'afuera', numero: 7 });
  });

  it('no lee cualquier cosa', () => {
    for (const basura of ['', 'D', 'X-001', 'D-', 'D-0', '../D-001', 'D-001; drop table']) {
      expect(leerIdPublico(basura), basura).toBeUndefined();
    }
  });
});
