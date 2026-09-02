import { beforeEach, describe, expect, it } from 'vitest';

import {
  aplicarRitoAlMontar,
  CLASE_RITO_VISTO,
  marcarRitoVisto,
  reiniciarRitoParaTests,
  ritoVisto,
} from '../rito';

describe('el rito de la tinta, una vez por pestaña', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.documentElement.classList.remove(CLASE_RITO_VISTO);
    reiniciarRitoParaTests();
  });

  it('la primera carga corre el rito entero y lo deja marcado como visto', () => {
    const html = document.documentElement;
    expect(ritoVisto()).toBe(false);

    expect(aplicarRitoAlMontar(html)).toBe(false);

    expect(html.classList.contains(CLASE_RITO_VISTO)).toBe(false);
    expect(ritoVisto()).toBe(true);
  });

  it('la segunda carga en la misma pestaña llega con la clase puesta: la página se lee ya', () => {
    marcarRitoVisto();
    const html = document.documentElement;

    expect(aplicarRitoAlMontar(html)).toBe(true);

    expect(html.classList.contains(CLASE_RITO_VISTO)).toBe(true);
  });

  it('se decide una vez por carga: el doble montaje de StrictMode no apaga el rito que acaba de arrancar', () => {
    const html = document.documentElement;

    expect(aplicarRitoAlMontar(html)).toBe(false);
    expect(aplicarRitoAlMontar(html)).toBe(false);

    expect(html.classList.contains(CLASE_RITO_VISTO)).toBe(false);
    expect(ritoVisto()).toBe(true);
  });

  it('la marca vive en sessionStorage, no en localStorage: otra pestaña vuelve a ver el rito', () => {
    marcarRitoVisto();

    expect(window.sessionStorage.getItem('basta_rito_visto')).toBe('1');
    expect(window.localStorage.getItem('basta_rito_visto')).toBeNull();
  });
});
