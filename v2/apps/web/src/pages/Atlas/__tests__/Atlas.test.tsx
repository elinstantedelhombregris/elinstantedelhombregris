import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { Atlas } from '../../Atlas';
import { cargarGrafo, cargarVisor } from '../cargar-visor';

vi.mock('../cargar-visor', () => ({ cargarVisor: vi.fn(), cargarGrafo: vi.fn() }));

const GRAFO = { planes: [] };
const cleanup = vi.fn();
const iniciar = vi.fn((_g: unknown, raiz: HTMLElement) => {
  raiz.innerHTML =
    '<a href="/planes/plandig">interno</a><a href="/lo-que-falta" target="_blank">afuera</a>';
  return cleanup;
});

function montar() {
  const { hook, history } = memoryLocation({ path: '/atlas', record: true });
  const r = render(
    <Router hook={hook}>
      <Atlas />
    </Router>,
  );
  return { ...r, history };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(cargarVisor).mockResolvedValue({ iniciar });
  vi.mocked(cargarGrafo).mockResolvedValue(GRAFO);
});

describe('Atlas', () => {
  it('muestra la portada con h1 y el link a /planes', () => {
    montar();
    expect(
      screen.getByRole('heading', { level: 1, name: 'El atlas del corpus' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'la página de los planes' })).toHaveAttribute(
      'href',
      '/planes',
    );
    expect(screen.getByText('Cargando el corpus…')).toBeInTheDocument();
  });

  it('inicia el visor una vez con el grafo y el elemento, y limpia al desmontar', async () => {
    const { container, unmount } = montar();
    await waitFor(() => {
      expect(iniciar).toHaveBeenCalledTimes(1);
    });
    expect(iniciar).toHaveBeenCalledWith(GRAFO, container.querySelector('.atlas'));
    expect(screen.queryByText('Cargando el corpus…')).not.toBeInTheDocument();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('no inicia el visor si se desmonta antes de que cargue', async () => {
    const { unmount } = montar();
    unmount();
    await Promise.resolve();
    await Promise.resolve();
    expect(iniciar).not.toHaveBeenCalled();
  });

  it('si la carga falla muestra el respaldo', async () => {
    vi.mocked(cargarVisor).mockRejectedValue(new Error('x'));
    montar();
    expect(
      await screen.findByText(/El atlas no cargó\. Probá recargar la página\./),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a los planes →' })).toHaveAttribute(
      'href',
      '/planes',
    );
  });

  it('un click en un link interno navega con el router; uno con target no', async () => {
    const { history } = montar();
    const interno = await screen.findByText('interno');
    fireEvent.click(interno);
    expect(history.at(-1)).toBe('/planes/plandig');

    const afuera = screen.getByText('afuera');
    fireEvent.click(afuera);
    expect(history.at(-1)).toBe('/planes/plandig');
  });
});
