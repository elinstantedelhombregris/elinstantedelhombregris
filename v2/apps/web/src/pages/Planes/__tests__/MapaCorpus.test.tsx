import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Planes } from '../../Planes';
import { layoutMapa } from '../mapa-corpus';
import { MapaCorpus } from '../sections/MapaCorpus';

import type { MapaCorpusData } from '../mapa-corpus';

import { PLANES } from '~/pages/Planes/la-prueba-data';

const un = PLANES[0];
const dos = PLANES[1];
if (!un || !dos) throw new Error('Fixture inválida: el registry necesita al menos 2 planes.');

const plan = (i: number, slug: string, code: string, extra: object = {}) => ({
  code,
  slug,
  nombre: `Nombre de ${code}`,
  tramo: 'tranche-1',
  ordinal: i + 1,
  palabras: 1000,
  nombradoPor: 9,
  tesis: `Tesis de ${code}`,
  resumen: `Resumen de ${code}`,
  desarmonias: { rota: 0, revisar: 0, nota: 0 },
  ...extra,
});

const FIXTURE: MapaCorpusData = {
  generado: '2026-11-10',
  canon: { tematicos: 2, documentos: 3, palabras: 3000 },
  desarmonias: { rota: 1, revisar: 2, nota: 0 },
  planes: [
    plan(0, un.slug, 'PLANUNO', { desarmonias: { rota: 1, revisar: 1, nota: 0 } }),
    plan(1, dos.slug, 'PLANDOS'),
    plan(2, 'plan-meta-x', 'PLANMETA', { tramo: null, ordinal: null }),
  ],
  vinculos: [
    { a: 0, b: 1, peso: 5, que: 'cosa que da DOS' },
    { a: 0, b: 2, peso: 9, que: null },
    { a: 1, b: 0, peso: 3, que: null },
  ],
};

function stubFetch(ok: boolean) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      ok
        ? Promise.resolve({ ok: true, json: () => Promise.resolve(FIXTURE) })
        : Promise.reject(new Error('sin red')),
    ),
  );
}

beforeEach(() => {
  stubFetch(true);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('layoutMapa', () => {
  it('devuelve una posición por plan, con ángulos distintos y el plan meta en su propio grupo', () => {
    const l = layoutMapa(FIXTURE.planes);
    expect(l.angulos).toHaveLength(3);
    expect(new Set(l.angulos).size).toBe(3);
    expect(l.orden).toHaveLength(3);
    expect(l.grupos.map((g) => g.etiqueta)).toEqual(['Protocolo', 'Tramo 1']);
  });
});

describe('MapaCorpus', () => {
  it('muestra «Dibujando el mapa…» y luego un nodo por plan', async () => {
    render(<MapaCorpus seleccionado={null} onSeleccionar={() => undefined} />);
    expect(screen.getByText('Dibujando el mapa…')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(3);
    });
    expect(screen.getByText('El mapa · tocá un plan')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Análisis del corpus en profundidad/ }),
    ).toHaveAttribute('href', '/atlas/');
  });

  it('click y Enter sobre un nodo piden seleccionarlo', async () => {
    const onSeleccionar = vi.fn();
    render(<MapaCorpus seleccionado={null} onSeleccionar={onSeleccionar} />);
    const nodo = await screen.findByRole('button', { name: 'PLANUNO — Nombre de PLANUNO' });
    fireEvent.click(nodo);
    fireEvent.keyDown(nodo, { key: 'Enter' });
    expect(onSeleccionar).toHaveBeenCalledTimes(2);
    expect(onSeleccionar).toHaveBeenCalledWith(un.slug);
  });

  it('con un plan seleccionado muestra tesis, chips con la cuenta y los links', async () => {
    render(<MapaCorpus seleccionado={un.slug} onSeleccionar={() => undefined} />);
    expect(await screen.findByText('Tesis de PLANUNO')).toBeInTheDocument();
    expect(screen.getByText('Recibe de 2')).toBeInTheDocument();
    expect(screen.getByText('Le aporta a 1')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'PLANDOS' })[0]).toHaveAttribute(
      'title',
      'cosa que da DOS',
    );
    expect(screen.getByRole('link', { name: 'Leer el documento →' })).toHaveAttribute(
      'href',
      `/planes/${un.slug}`,
    );
    expect(screen.getByRole('link', { name: /2 desarmonías abiertas/ })).toHaveAttribute(
      'href',
      `/atlas/#desarmonias-${un.slug}`,
    );
  });

  it('si falla la carga muestra la línea de respaldo', async () => {
    stubFetch(false);
    render(<MapaCorpus seleccionado={null} onSeleccionar={() => undefined} />);
    expect(
      await screen.findByText('El mapa no cargó. El índice de abajo tiene los mismos planes.'),
    ).toBeInTheDocument();
  });
});

describe('Selector de plan', () => {
  it('lista «Todo el mapa» más un plan por opción y al elegir uno muestra su tesis', async () => {
    render(<Planes />);
    const select = await screen.findByRole('combobox', { name: 'Elegí un plan' });
    expect(within(select).getAllByRole('option')).toHaveLength(FIXTURE.planes.length + 1);
    fireEvent.change(select, { target: { value: un.slug } });
    expect(screen.getByText('Tesis de PLANUNO')).toBeInTheDocument();
  });

  it('elegir «Todo el mapa» vuelve al panel general', async () => {
    render(<Planes />);
    const select = await screen.findByRole('combobox', { name: 'Elegí un plan' });
    fireEvent.change(select, { target: { value: un.slug } });
    fireEvent.change(select, { target: { value: '' } });
    expect(screen.getByText('El mapa · tocá un plan')).toBeInTheDocument();
  });
});

describe('Planes: selección compartida', () => {
  it('elegir un nodo abre la fila del índice y «Ver todo el mapa» la cierra', async () => {
    render(<Planes />);
    const nodo = await screen.findByRole('button', { name: 'PLANUNO — Nombre de PLANUNO' });
    fireEvent.click(nodo);
    const fila = screen.getByText(un.code, { selector: 'span' }).closest('button');
    await waitFor(() => {
      expect(fila).toHaveAttribute('aria-expanded', 'true');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ver todo el mapa' }));
    expect(fila).toHaveAttribute('aria-expanded', 'false');
  });
});
