import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { RedirigirAAportar } from '../RedirigirAAportar';

const donde = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;
const desde = (url: string, campana?: string) => {
  window.history.replaceState(null, '', url);
  render(campana ? <RedirigirAAportar campana={campana} /> : <RedirigirAAportar />);
  return donde();
};

describe('Las direcciones viejas de Imaginar llevan al panel del mapa', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('/imaginar sin nada abre las tres preguntas del mapa', () => {
    expect(desde('/imaginar')).toBe('/el-mapa?participar=aportar#instrumento');
  });

  it('/imaginar conserva campaña, edición y borrador, y fuerza las tres preguntas', () => {
    expect(
      desde('/imaginar?campana=mi-campana&edicion=2&borrador=b-1&participar=voz&otra=cosa'),
    ).toBe('/el-mapa?participar=aportar&campana=mi-campana&edicion=2&borrador=b-1#instrumento');
  });

  it('/campanas/:slug/participar toma la campaña del camino y la edición de la búsqueda', () => {
    expect(desde('/campanas/cuidar-la-comunidad/participar?edicion=3', 'cuidar-la-comunidad')).toBe(
      '/el-mapa?participar=aportar&campana=cuidar-la-comunidad&edicion=3#instrumento',
    );
  });

  it('la campaña del camino manda sobre la de la búsqueda', () => {
    expect(desde('/campanas/una/participar?campana=otra', 'una')).toBe(
      '/el-mapa?participar=aportar&campana=una#instrumento',
    );
  });

  it('una edición mal escrita no se descarta: el panel la va a marcar y no publicará en otra edición', () => {
    expect(desde('/imaginar?campana=mi-campana&edicion=otra')).toBe(
      '/el-mapa?participar=aportar&campana=mi-campana&edicion=otra#instrumento',
    );
  });

  it('reemplaza la entrada del historial en vez de sumar una', () => {
    window.history.replaceState(null, '', '/');
    const antes = window.history.length;
    desde('/imaginar');
    expect(window.history.length).toBe(antes);
  });
});
