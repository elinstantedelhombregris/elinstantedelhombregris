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

  it('/imaginar sin nada abre Imaginar', () => {
    expect(desde('/imaginar')).toBe('/mi-argentina-ideal/imaginar');
  });

  it('/imaginar conserva campaña, edición y borrador, y fuerza el camino guiado', () => {
    expect(
      desde('/imaginar?campana=mi-campana&edicion=2&borrador=b-1&participar=voz&otra=cosa'),
    ).toBe('/mi-argentina-ideal/imaginar?campana=mi-campana&edicion=2&borrador=b-1');
  });

  it('/campanas/:slug/participar toma la campaña del camino y la edición de la búsqueda', () => {
    expect(desde('/campanas/cuidar-la-comunidad/participar?edicion=3', 'cuidar-la-comunidad')).toBe(
      '/mi-argentina-ideal/imaginar?campana=cuidar-la-comunidad&edicion=3',
    );
  });

  it('la campaña del camino manda sobre la de la búsqueda', () => {
    expect(desde('/campanas/una/participar?campana=otra', 'una')).toBe(
      '/mi-argentina-ideal/imaginar?campana=una',
    );
  });

  it('una edición mal escrita no se descarta: Imaginar la va a marcar y no publicará en otra edición', () => {
    expect(desde('/imaginar?campana=mi-campana&edicion=otra')).toBe(
      '/mi-argentina-ideal/imaginar?campana=mi-campana&edicion=otra',
    );
  });

  it('reemplaza la entrada del historial en vez de sumar una', () => {
    window.history.replaceState(null, '', '/');
    const antes = window.history.length;
    desde('/imaginar');
    expect(window.history.length).toBe(antes);
  });
});
