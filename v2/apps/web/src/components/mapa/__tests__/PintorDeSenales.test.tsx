import { render, screen } from '@testing-library/react';
import { DECLARACION_DEL_SEMBRADO, TECHO_DE_PUNTOS_POR_CELDA } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { PintorDeSenales } from '../PintorDeSenales';

import type { CeldaDeSenales, ProyectarAPixel } from '../pintor-senales';

/**
 * El calco de señales, montado.
 *
 * En el entorno de test no hay contexto 2D: el lienzo no dibuja una línea. Eso
 * es exactamente lo que hay que verificar además de que no rompa — **el dato
 * tiene que estar igual**, en la declaración y en la lista de conteos, porque
 * ése es el camino accesible al mismo número y no una versión de consuelo.
 */

const celda = (id: string, voces: number): CeldaDeSenales => ({
  id,
  nombre: id,
  clase: 'hecho',
  voces,
  lng: -60,
  lat: -35,
  anchoGrados: 4,
  altoGrados: 3,
});

const identidad: ProyectarAPixel = (lng, lat) => ({ x: lng, y: lat });

describe('PintorDeSenales', () => {
  it('monta sin contexto 2D y deja el lienzo fuera del lector de pantalla', () => {
    render(
      <PintorDeSenales
        celdas={[celda('Chaco', 40)]}
        proyectar={identidad}
        foco={null}
        tema="papel"
        semilla={7}
      />,
    );
    const lienzo = screen.getByTestId('lienzo-de-senales');
    expect(lienzo).toHaveAttribute('aria-hidden', 'true');
    expect(lienzo.className).toContain('pointer-events-none');
  });

  it('declara EN PANTALLA que el conteo es el dato y la posición es dibujo', () => {
    render(
      <PintorDeSenales
        celdas={[celda('Chaco', 40)]}
        proyectar={identidad}
        foco={null}
        tema="papel"
        semilla={7}
      />,
    );
    expect(screen.getByText(DECLARACION_DEL_SEMBRADO)).toBeInTheDocument();
    expect(screen.getByText(/los filtros destiñen/i)).toBeInTheDocument();
  });

  it('dice cuántas voces no entraron al dibujo, con nombre y cantidad', () => {
    render(
      <PintorDeSenales
        celdas={[celda('Buenos Aires', TECHO_DE_PUNTOS_POR_CELDA + 3400), celda('Chaco', 12)]}
        proyectar={identidad}
        foco={null}
        tema="papel"
        semilla={7}
      />,
    );
    const aviso = screen.getByTestId('celdas-saturadas');
    expect(aviso.textContent).toContain('Buenos Aires +3.400 más');
    expect(aviso.textContent).not.toContain('Chaco');
  });

  it('sin ninguna celda saturada no hay aviso colgando', () => {
    render(
      <PintorDeSenales
        celdas={[celda('Chaco', 12)]}
        proyectar={identidad}
        foco={null}
        tema="papel"
        semilla={7}
      />,
    );
    expect(screen.queryByTestId('celdas-saturadas')).toBeNull();
  });

  it('rinde los conteos por celda para quien no puede ver el lienzo', () => {
    render(
      <PintorDeSenales
        celdas={[celda('Chaco', 1200), celda('Formosa', 30)]}
        proyectar={identidad}
        foco={null}
        tema="nocturno"
        semilla={7}
      />,
    );
    const lista = screen.getByTestId('conteos-por-celda');
    // El conteo entero, no el que entró en el dibujo.
    expect(lista.textContent).toContain('Chaco: 1.200 voces');
    expect(lista.textContent).toContain('Formosa: 30 voces');
    expect(lista.textContent).toContain('1.230 voces en 2 celdas');
  });

  it('con foco, lo que queda afuera SIGUE contándose y rindiéndose', () => {
    const celdas: CeldaDeSenales[] = [
      { ...celda('Chaco', 100), clase: 'hecho' },
      { ...celda('Formosa', 80), clase: 'deseo' },
    ];
    render(
      <PintorDeSenales
        celdas={celdas}
        proyectar={identidad}
        foco={new Set(['hecho'])}
        tema="papel"
        semilla={7}
      />,
    );
    const lista = screen.getByTestId('conteos-por-celda');
    expect(lista.textContent).toContain('Formosa: 80 voces');
    expect(lista.textContent).toContain('180 voces en 2 celdas');
  });

  it('hace lugar al sello de la página en vez de reescribir su frase', () => {
    render(
      <PintorDeSenales
        celdas={[celda('Chaco', 5)]}
        proyectar={identidad}
        foco={null}
        tema="papel"
        semilla={7}
        sello={<p>Nadie dijo ninguna de estas cosas.</p>}
      />,
    );
    expect(screen.getByText('Nadie dijo ninguna de estas cosas.')).toBeInTheDocument();
  });
});
