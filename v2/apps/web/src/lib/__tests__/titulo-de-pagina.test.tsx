import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useTituloDePagina } from '../titulo-de-pagina';

const TITULO_DEL_SITIO = '¡BASTA! — El país lo diseña la gente';

function Pagina({ titulo }: { titulo: string }) {
  useTituloDePagina(titulo);
  return null;
}

beforeEach(() => {
  document.title = TITULO_DEL_SITIO;
});
afterEach(() => {
  document.title = TITULO_DEL_SITIO;
});

describe('useTituloDePagina', () => {
  it('pone «<título> · ¡BASTA!»', () => {
    render(<Pagina titulo="Mi espacio" />);
    expect(document.title).toBe('Mi espacio · ¡BASTA!');
  });

  it('al desmontar devuelve el título que había', () => {
    const { unmount } = render(<Pagina titulo="Campañas" />);
    expect(document.title).toBe('Campañas · ¡BASTA!');
    unmount();
    expect(document.title).toBe(TITULO_DEL_SITIO);
  });

  it('si el título cambia (la campaña termina de cargar) lo actualiza sin perder el original', () => {
    const { rerender, unmount } = render(<Pagina titulo="Campaña" />);
    expect(document.title).toBe('Campaña · ¡BASTA!');
    rerender(<Pagina titulo="Agua para Salta" />);
    expect(document.title).toBe('Agua para Salta · ¡BASTA!');
    unmount();
    expect(document.title).toBe(TITULO_DEL_SITIO);
  });

  it('un título vacío no toca la pestaña', () => {
    render(<Pagina titulo="   " />);
    expect(document.title).toBe(TITULO_DEL_SITIO);
  });

  it('al pasar de una página a otra no deja el título de la primera', () => {
    const primera = render(<Pagina titulo="Fichas" />);
    primera.unmount();
    const segunda = render(<Pagina titulo="Biblioteca" />);
    expect(document.title).toBe('Biblioteca · ¡BASTA!');
    segunda.unmount();
    expect(document.title).toBe(TITULO_DEL_SITIO);
  });
});
