import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VinculosDeLaFicha } from '../VinculosDeLaFicha';

import { requerido } from './ayudas';

import type { ContenidoFicha } from '@v2/shared';

const NUEVA = '44444444-4444-4444-8444-444444444444';
const modelo = vi.hoisted(() => ({ get: vi.fn<(url: string) => Promise<unknown>>() }));
vi.mock('~/lib/api', () => ({ api: { get: modelo.get } }));

function Contenedor({ inicial = [] }: { inicial?: ContenidoFicha['vinculos'] }) {
  const [vinculos, setVinculos] = useState(inicial);
  return (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <VinculosDeLaFicha vinculos={vinculos} campana={null} conocidos={[]} cambiar={setVinculos} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  modelo.get.mockResolvedValue({
    registros: [
      { id: NUEVA, tipo: 'sueño', texto: 'Quiero una escuela cerca de casa.' },
      { id: '55555555-5555-4555-8555-555555555555', tipo: 'basta', texto: null },
    ],
    siguiente: null,
    total: 2,
  });
});

describe('Aportes vinculados en el formulario de la ficha', () => {
  it('la relación se elige antes de vincular y arranca en «Inspira el futuro deseado»', () => {
    render(<Contenedor />);
    const relacion = screen.getByLabelText('Cómo se relaciona el aporte con la ficha');
    expect(relacion).toHaveValue('inspira');
    expect(
      within(relacion)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual([
      'Describe la situación',
      'Contradice la lectura',
      'Aporta evidencia',
      'Aporta una capacidad',
      'Inspira el futuro deseado',
    ]);
    // El selector de relación aparece antes que los aportes para elegir.
    const orden = relacion.compareDocumentPosition(
      screen.getByRole('heading', { name: 'Elegir entre los aportes públicos' }),
    );
    expect(orden & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('el selector de aportes está a la vista, no escondido en un desplegable', async () => {
    render(<Contenedor />);
    const boton = (await screen.findAllByRole('button', { name: 'Vincular este aporte' }))[0];
    expect(boton?.closest('details')).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Elegir entre los aportes públicos' }),
    ).toBeVisible();
  });

  it('pegar un enlace es el camino secundario, plegado', () => {
    render(<Contenedor />);
    const resumen = screen.getByText('Pegar un enlace de aporte');
    expect(resumen.closest('details')).not.toHaveAttribute('open');
  });

  it('un aporte elegido se vincula con la relación elegida, se lee por su texto y deja de ofrecerse', async () => {
    render(<Contenedor />);
    fireEvent.change(screen.getByLabelText('Cómo se relaciona el aporte con la ficha'), {
      target: { value: 'evidencia' },
    });
    fireEvent.click(
      requerido((await screen.findAllByRole('button', { name: 'Vincular este aporte' }))[0]),
    );
    const fila = screen.getByRole('button', { name: 'Quitar vínculo 1' }).closest('li');
    expect(fila).toHaveTextContent('Aporta evidencia');
    expect(fila).toHaveTextContent('«Quiero una escuela cerca de casa.»');
    expect(fila).not.toHaveTextContent(NUEVA);
    expect(screen.getByText('Vinculado: Aporta evidencia')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar vínculo 1' }));
    expect(screen.getAllByRole('button', { name: 'Vincular este aporte' })).toHaveLength(2);
  });

  it('un aporte con el texto reservado se vincula sin mostrar ni inventar su texto', async () => {
    render(<Contenedor />);
    fireEvent.click(
      requerido((await screen.findAllByRole('button', { name: 'Vincular este aporte' }))[1]),
    );
    const fila = screen.getByRole('button', { name: 'Quitar vínculo 1' }).closest('li');
    expect(fila).toHaveTextContent('Texto reservado por su autor.');
  });

  it('un enlace pegado que no es de un aporte se explica junto al campo', () => {
    render(<Contenedor />);
    fireEvent.change(screen.getByLabelText('Enlace del aporte'), { target: { value: 'hola' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vincular este enlace' }));
    const campo = screen.getByLabelText('Enlace del aporte');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Pegá el enlace de un aporte, que termina en /senal/ y un código.',
    );
  });
});
