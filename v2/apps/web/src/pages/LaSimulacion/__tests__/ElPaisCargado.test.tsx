import { render, screen, within } from '@testing-library/react';
import { DECLARACION_DEL_SEMBRADO, TECHO_DE_PUNTOS_POR_CELDA } from '@v2/civic-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GEOJSON from '../../../../public/geo/provincias.geojson?raw';
import { celdasDeCosecha, leerContornos } from '../pais-cargado';
import { ElPaisCargado } from '../sections/ElPaisCargado';
import { construirPais, disenoPorDefecto } from '../simulacion-pais';

import type { ContornoDeProvincia } from '../pais-cargado';
import type { Cosecha } from '@v2/civic-core';

import { rectanguloInscripto } from '~/components/mapa/rectangulo-inscripto';

/**
 * El país cargado — lo que se afirma acá es lo que la sección promete en
 * pantalla, no que un lienzo haya dibujado algo.
 *
 * En el entorno de test no hay contexto 2D, así que el canvas no traza una
 * línea. Eso está bien: **el dato es el conteo**, y el conteo se rinde en la
 * lista accesible que el pintor compartido publica. Lo que se verifica es
 * exactamente lo que no puede fallar en silencio:
 *
 *  1. un punto **nunca** se dibuja afuera de su provincia — el rectángulo va
 *     inscripto, y con un polígono cóncavo eso se puede medir;
 *  2. el período se pliega y la clase no, porque el color codifica la clase;
 *  3. una provincia sin contorno se **dice**, con sus voces contadas aparte;
 *  4. la declaración «el conteo es el dato, la posición es dibujo» está en
 *     pantalla, y con el mismo peso que la cifra;
 *  5. un filtro destiñe y **no saca del dibujo**: la lista de conteos queda
 *     igual de larga.
 */

const AHORA = 1_800_000_000_000;
const pais = construirPais(AHORA);
const escenario = disenoPorDefecto(pais).base;

const celdaCruda = (
  territorioId: string,
  periodo: number,
  clase: Cosecha['celdas'][number]['clase'],
  voces: number,
) => ({ territorioId, periodo, clase, voces, actores: voces, sinActor: 0 });

describe('el rectángulo inscripto', () => {
  /**
   * La ele: el cuadrante de arriba a la derecha —lng > 2 y lat > 2— está AFUERA
   * del polígono. Con el bounding box, la mitad de los puntos caerían ahí, y un
   * punto dibujado afuera de su provincia no es dibujo: es una afirmación falsa
   * sobre otro lugar.
   */
  const ele: ContornoDeProvincia = {
    nombre: 'Ele',
    anillos: [
      [
        [0, 0],
        [4, 0],
        [4, 2],
        [2, 2],
        [2, 4],
        [0, 4],
        [0, 0],
      ],
    ],
  };

  it('no se mete en la concavidad: ningún punto puede caer afuera del polígono', () => {
    const rectangulo = rectanguloInscripto(ele.anillos);
    expect(rectangulo).not.toBeNull();
    if (rectangulo === null) return;

    const lngMaxima = rectangulo.lng + rectangulo.anchoGrados / 2;
    const latMaxima = rectangulo.lat + rectangulo.altoGrados / 2;
    expect(lngMaxima > 2 && latMaxima > 2).toBe(false);

    // Y no es una respuesta de compromiso: algo dibujable tiene que quedar.
    expect(rectangulo.anchoGrados).toBeGreaterThan(0.5);
    expect(rectangulo.altoGrados).toBeGreaterThan(0.5);
  });

  it('lee las veinticuatro provincias del archivo que sirve la web', () => {
    const contornos = leerContornos(JSON.parse(GEOJSON) as unknown);
    expect(contornos).toHaveLength(24);
    // Los nombres son los canónicos: son la clave contra la que se busca el
    // territorio de la cosecha, así que un renombre tiene que romper acá.
    expect(contornos.map((c) => c.nombre)).toContain('Ciudad Autónoma de Buenos Aires');
    for (const contorno of contornos) {
      expect(rectanguloInscripto(contorno.anillos)).not.toBeNull();
    }
  });
});

describe('la cosecha plegada a celdas', () => {
  const cosecha: Cosecha = {
    celdas: [
      celdaCruda('Chaco', 0, 'hecho', 3),
      celdaCruda('Chaco', 1, 'hecho', 4),
      celdaCruda('Chaco', 1, 'deseo', 5),
      celdaCruda('Formosa', 0, 'acto', 9),
    ],
    periodos: 2,
    autoridad: 'declarada',
  };

  it('pliega el período, no la clase, y le da a cada clase su propio sembrado', () => {
    const salida = celdasDeCosecha(
      cosecha,
      new Map([['Chaco', { lng: -60, lat: -27, anchoGrados: 1, altoGrados: 1 }]]),
    );
    expect(salida.celdas.map((c) => c.id)).toEqual(['Chaco|hecho', 'Chaco|deseo']);
    expect(salida.celdas[0]?.voces).toBe(7);
    expect(salida.celdas[1]?.voces).toBe(5);
  });

  /**
   * El relleno del pintor es opaco. Con las cuatro clases sembradas adentro del
   * mismo rectángulo, en una provincia apretada la última tapaba a las otras
   * tres y el bloque salía entero del color de `meta` — un error sobre la
   * composición, que es dato.
   */
  it('le da a cada clase su propio cuarto: una clase no puede tapar a las otras', () => {
    const salida = celdasDeCosecha(
      cosecha,
      new Map([['Chaco', { lng: -60, lat: -27, anchoGrados: 2, altoGrados: 2 }]]),
    );
    const hecho = salida.celdas.find((c) => c.clase === 'hecho');
    const deseo = salida.celdas.find((c) => c.clase === 'deseo');
    expect(hecho?.anchoGrados).toBe(1);
    expect(hecho?.altoGrados).toBe(1);
    // Arriba a la izquierda: menos longitud, más latitud.
    expect(hecho?.lng).toBe(-60.5);
    expect(hecho?.lat).toBe(-26.5);
    expect(deseo?.lng).toBe(-59.5);

    const centros = new Set(salida.celdas.map((c) => `${c.lng}|${c.lat}`));
    expect(centros.size).toBe(salida.celdas.length);
  });

  it('una provincia sin contorno se dice, con sus voces contadas aparte', () => {
    const salida = celdasDeCosecha(
      cosecha,
      new Map([['Chaco', { lng: -60, lat: -27, anchoGrados: 1, altoGrados: 1 }]]),
    );
    expect(salida.sinContorno).toEqual(['Formosa']);
    expect(salida.vocesSinLugar).toBe(9);
  });
});

describe('la sección', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve({ text: () => Promise.resolve(GEOJSON) } as unknown as Response),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('declara que el conteo es el dato y la posición es dibujo, arriba y al pie', async () => {
    render(<ElPaisCargado pais={pais} escenario={escenario} elenco={null} />);
    // Arriba, al lado de la cifra, antes de que llegue ningún contorno.
    expect(screen.getByText(DECLARACION_DEL_SEMBRADO)).toBeInTheDocument();
    // Y otra vez al pie del dibujo, que es donde la pone el pintor compartido.
    await screen.findByTestId('pintor-de-senales');
    expect(screen.getAllByText(DECLARACION_DEL_SEMBRADO)).toHaveLength(2);
  });

  it('el conteo por provincia y clase se rinde aunque el lienzo no dibuje nada', async () => {
    render(<ElPaisCargado pais={pais} escenario={escenario} elenco={null} />);
    const lista = await screen.findByTestId('conteos-por-celda');
    // 24 provincias × 4 clases, más la línea del total.
    expect(within(lista).getAllByRole('listitem')).toHaveLength(97);
    expect(lista.textContent).toContain('Chaco · hechos');
  });

  it('un filtro destiñe y no saca del dibujo: la lista queda igual de larga', async () => {
    const { rerender } = render(<ElPaisCargado pais={pais} escenario={escenario} elenco={null} />);
    const antes = within(await screen.findByTestId('conteos-por-celda')).getAllByRole('listitem')
      .length;

    const boton = screen.getByRole('button', { name: 'deseos' });
    expect(boton).toHaveAttribute('aria-pressed', 'true');
    boton.click();
    rerender(<ElPaisCargado pais={pais} escenario={escenario} elenco={null} />);

    expect(screen.getByRole('button', { name: 'deseos' })).toHaveAttribute('aria-pressed', 'false');
    expect(
      within(screen.getByTestId('conteos-por-celda')).getAllByRole('listitem'),
    ).toHaveLength(antes);
  });

  it('dice cuántas voces no entraron al dibujo en vez de mentir hacia abajo', async () => {
    render(<ElPaisCargado pais={pais} escenario={escenario} elenco={null} />);
    const aviso = await screen.findByTestId('celdas-saturadas');
    // Buenos Aires se lleva ~14.400 voces por clase y el techo son 500 puntos.
    expect(aviso.textContent).toContain('Buenos Aires');
    expect(aviso.textContent).toMatch(/\+[\d.]+ más/);
    expect(TECHO_DE_PUNTOS_POR_CELDA).toBeGreaterThan(0);
  });
});
