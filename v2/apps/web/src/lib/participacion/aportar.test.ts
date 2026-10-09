import { describe, expect, it } from 'vitest';

import { APORTAR_HREF, aportarHref, leerPedidoAportar, quitarParametroDeLaUrl } from './aportar';

describe('aportarHref', () => {
  it('sin opciones es la puerta canónica, y termina en #instrumento', () => {
    expect(aportarHref()).toBe(APORTAR_HREF);
    expect(APORTAR_HREF).toBe('/el-mapa?participar=aportar#instrumento');
  });

  it('lleva campaña (slug o id), edición, borrador y lugar', () => {
    const href = aportarHref({
      campana: 'mi-argentina-ideal',
      edicion: 2,
      borrador: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
      lugar: '14',
    });
    const [ruta, ancla] = href.split('#');
    expect(ancla).toBe('instrumento');
    const [camino, consulta] = (ruta ?? '').split('?');
    expect(camino).toBe('/el-mapa');
    const q = new URLSearchParams(consulta);
    expect(q.get('participar')).toBe('aportar');
    expect(q.get('campana')).toBe('mi-argentina-ideal');
    expect(q.get('edicion')).toBe('2');
    expect(q.get('borrador')).toBe('0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b');
    expect(q.get('lugar')).toBe('14');
  });

  it('el modo directo pide participar=directo; el guiado, aportar', () => {
    expect(
      new URLSearchParams(aportarHref({ modo: 'directo' }).split('#')[0]?.split('?')[1]).get(
        'participar',
      ),
    ).toBe('directo');
    expect(aportarHref({ modo: 'guiado' })).toBe(APORTAR_HREF);
  });

  it('descarta una edición que no es un entero positivo y escapa lo que viene de afuera', () => {
    expect(aportarHref({ edicion: 0 })).toBe(APORTAR_HREF);
    expect(aportarHref({ edicion: 1.5 })).toBe(APORTAR_HREF);
    expect(aportarHref({ campana: 'a b&c' })).toContain('campana=a+b%26c');
  });
});

describe('leerPedidoAportar', () => {
  it('resuelve los alias: aportar, imaginar y guiado abren las tres preguntas; directo y voz, el aporte puntual', () => {
    expect(leerPedidoAportar('?participar=aportar').modo).toBe('guiado');
    expect(leerPedidoAportar('?participar=imaginar').modo).toBe('guiado');
    expect(leerPedidoAportar('?participar=guiado').modo).toBe('guiado');
    expect(leerPedidoAportar('?participar=directo').modo).toBe('directo');
    expect(leerPedidoAportar('?participar=voz').modo).toBe('directo');
  });

  it('un valor desconocido o ausente no pide abrir el panel', () => {
    expect(leerPedidoAportar('?participar=cualquiera').modo).toBeNull();
    expect(leerPedidoAportar('?lente=mapa').modo).toBeNull();
    expect(leerPedidoAportar('').modo).toBeNull();
  });

  it('lee campaña por slug o por id, y la edición válida', () => {
    expect(leerPedidoAportar('?campana=cuidar-la-comunidad&edicion=3')).toMatchObject({
      campana: 'cuidar-la-comunidad',
      edicion: 3,
      problema: null,
    });
    expect(leerPedidoAportar('?campana=af81507f-f3fb-4a80-99f3-28f0f2377947').campana).toBe(
      'af81507f-f3fb-4a80-99f3-28f0f2377947',
    );
  });

  it('una edición inválida, o sin campaña, es un problema y no se reemplaza por la vigente', () => {
    expect(leerPedidoAportar('?campana=cuidar&edicion=3.5')).toMatchObject({ problema: 'edicion' });
    expect(leerPedidoAportar('?campana=cuidar&edicion=otra').edicion).toBeUndefined();
    expect(leerPedidoAportar('?edicion=2').problema).toBe('edicion');
  });

  it('una campaña con forma de ruta no se usa: es un problema', () => {
    const pedido = leerPedidoAportar('?campana=../../admin');
    expect(pedido.campana).toBeUndefined();
    expect(pedido.problema).toBe('campana');
  });

  it('lee el borrador', () => {
    expect(leerPedidoAportar('?borrador=abc').borrador).toBe('abc');
  });

  it('lo que genera aportarHref lo entiende leerPedidoAportar', () => {
    const search = aportarHref({ campana: 'x-y', edicion: 4, borrador: 'b1', modo: 'directo' })
      .split('#')[0]
      ?.split('?')[1];
    expect(leerPedidoAportar(search ?? '')).toEqual({
      modo: 'directo',
      campana: 'x-y',
      edicion: 4,
      borrador: 'b1',
      problema: null,
    });
  });
});

describe('quitarParametroDeLaUrl', () => {
  it('saca un parámetro y deja el resto, el camino y el ancla, sin sumar una entrada al historial', () => {
    window.history.replaceState(
      null,
      '',
      '/el-mapa?participar=aportar&borrador=b-1&lugar=14#instrumento',
    );
    const antes = window.history.length;
    quitarParametroDeLaUrl('borrador');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/el-mapa?participar=aportar&lugar=14#instrumento',
    );
    expect(window.history.length).toBe(antes);
  });

  it('si era el último parámetro no deja un signo de pregunta suelto, y si no está no toca nada', () => {
    window.history.replaceState(null, '', '/el-mapa?borrador=b-1#aportar');
    quitarParametroDeLaUrl('borrador');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/el-mapa#aportar',
    );
    quitarParametroDeLaUrl('borrador');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/el-mapa#aportar',
    );
  });
});
