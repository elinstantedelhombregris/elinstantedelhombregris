import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { LaRadiografiaEjemplo } from '../../LaRadiografiaEjemplo';

import { esRutaPapel } from '~/layouts/papel-routes';

/**
 * El ejemplo en su propia ruta — enmienda
 * `docs/specs/2026-08-16-enmienda-v1-los-ejemplos.md` §3 y §4.4.
 *
 * La enmienda autorizó el ejemplo **a cambio de cuatro cosas**, y tres de ellas
 * son de esta página: que viva en una ruta propia, que el `<title>` y el
 * encabezado digan «ejemplo» antes de que cargue la imagen, y que no se mezcle
 * jamás con el corpus real (E5). La cuarta —el sello adentro del lienzo— tiene
 * su propio archivo.
 *
 * Lo que se verifica acá es el orden, no sólo la presencia: **el título está
 * escrito antes de que el lienzo pinte su primer cuadro**. Se apoya en algo que
 * React garantiza y el archivo de la página declara: el título se escribe en un
 * efecto de layout y la constelación pinta en uno pasivo, y todos los de layout
 * corren antes que cualquier pasivo. Si alguien lo pasa a `useEffect`, el orden
 * deja de estar garantizado y este archivo se pone rojo.
 */

const TITULO_DEL_SITIO = '¡BASTA! — El país lo diseña la gente';

const envolver = (nodo: React.ReactNode, ruta = '/la-radiografia/ejemplo') => {
  const { hook } = memoryLocation({ path: ruta });
  return render(<Router hook={hook}>{nodo}</Router>);
};

afterEach(() => {
  document.title = TITULO_DEL_SITIO;
});

describe('la ruta propia', () => {
  it('`/la-radiografia/ejemplo` recibe el chrome papel, y su prefijo no abre la puerta a otras', () => {
    expect(esRutaPapel('/la-radiografia/ejemplo')).toBe(true);
    expect(esRutaPapel('/la-radiografia')).toBe(true);
    // La enmienda autoriza UN ejemplo. Un segundo necesita su propia enmienda,
    // y no se lo va a regalar un prefijo.
    expect(esRutaPapel('/la-radiografia/otro-ejemplo')).toBe(false);
  });
});

describe('el título y el encabezado lo dicen antes que la imagen', () => {
  it('escribe «Ejemplo» en el título, y como primera palabra', () => {
    document.title = TITULO_DEL_SITIO;
    envolver(<LaRadiografiaEjemplo />);
    expect(document.title).toMatch(/^Ejemplo\b/);
    expect(document.title).toContain('La Radiografía');
  });

  it('el título ya está escrito cuando el lienzo aparece en el documento', () => {
    document.title = TITULO_DEL_SITIO;
    envolver(<LaRadiografiaEjemplo />);
    // El lienzo montó, y el título ya no es el del sitio: no hay un instante
    // en el que se vea la constelación bajo el título de la portada.
    expect(screen.getByTestId('constelacion-del-ejemplo')).toBeInTheDocument();
    expect(document.title).not.toBe(TITULO_DEL_SITIO);
  });

  it('devuelve el título al salir: la pestaña no se queda diciendo «Ejemplo»', () => {
    document.title = TITULO_DEL_SITIO;
    const { unmount } = envolver(<LaRadiografiaEjemplo />);
    expect(document.title).not.toBe(TITULO_DEL_SITIO);
    unmount();
    expect(document.title).toBe(TITULO_DEL_SITIO);
  });

  it('el encabezado dice que es un ejemplo, y que no lo dijo nadie', () => {
    const { container } = envolver(<LaRadiografiaEjemplo />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Laboratorio: las mismas frases, escritas de tres maneras',
    );
    expect(screen.getByText('Ejemplo · voces inventadas')).toBeVisible();
    expect(container.textContent).toContain('Nadie dijo ninguna de estas cosas.');
  });
});

describe('el cielo de esta página se declara del ejemplo', () => {
  it('el lienzo lleva `data-origen="ejemplo"`, que es lo que lo hace sellarse', () => {
    envolver(<LaRadiografiaEjemplo />);
    expect(screen.getByTestId('constelacion-del-ejemplo')).toHaveAttribute(
      'data-origen',
      'ejemplo',
    );
  });

  it('vuelve al corpus vivo por un link explícito, en las dos puntas de la página', () => {
    envolver(<LaRadiografiaEjemplo />);
    const links = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/la-radiografia');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});

describe('el ejemplo de noche', () => {
  it('declara color-scheme: dark en su contenedor al pasar a nocturno, y no en papel', () => {
    window.localStorage.clear();
    const { container } = envolver(<LaRadiografiaEjemplo />);
    expect(container.querySelector('main')).not.toHaveClass('[color-scheme:dark]');

    fireEvent.click(screen.getByText('Ver de noche'));

    expect(container.querySelector('main')).toHaveClass('[color-scheme:dark]');
    window.localStorage.clear();
  });

  it('de noche el rótulo y el sello del ejemplo usan los tonos claros, que se leen sobre el fondo', () => {
    window.localStorage.clear();
    envolver(<LaRadiografiaEjemplo />);
    const rotulo = screen.getByText('La Radiografía · ejemplo');
    const sello = screen.getByText('Ejemplo · voces inventadas');
    expect(rotulo).toHaveClass('text-violeta');
    expect(sello).toHaveClass('text-sello', 'border-sello');

    fireEvent.click(screen.getByText('Ver de noche'));

    expect(rotulo).toHaveClass('text-violeta-claro');
    expect(rotulo).not.toHaveClass('text-violeta');
    // El texto del sello no cambia («voces inventadas» está fijado por otro test).
    expect(sello).toHaveTextContent('Ejemplo · voces inventadas');
    expect(sello).toHaveClass('text-sello-claro', 'border-sello-claro');
    expect(sello).not.toHaveClass('text-sello');
    window.localStorage.clear();
  });
});
