import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Parecidos } from '../imaginar/Parecidos';

import type { AporteParecido } from '@v2/shared';
import type * as ApiModulo from '~/lib/api';

const m = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));
vi.mock('~/lib/api', async (importar) => {
  const real = await importar<typeof ApiModulo>();
  return { ...real, api: { get: m.get, post: m.post, put: m.put, patch: vi.fn(), del: vi.fn() } };
});

const PARECIDOS: AporteParecido[] = [
  {
    id: 'a1f6b0b2-1c2d-4e3f-8a9b-0c1d2e3f4a01',
    texto: 'Que el hospital atienda de noche',
    provincia: 'Salta',
  },
  {
    id: 'a1f6b0b2-1c2d-4e3f-8a9b-0c1d2e3f4a02',
    texto: 'Turnos sin esperar meses',
    provincia: null,
  },
  {
    id: 'a1f6b0b2-1c2d-4e3f-8a9b-0c1d2e3f4a03',
    texto: 'Una salita en cada barrio',
    provincia: 'Córdoba',
  },
  {
    id: 'a1f6b0b2-1c2d-4e3f-8a9b-0c1d2e3f4a04',
    texto: 'Guardias con pediatras',
    provincia: 'Jujuy',
  },
];

function montar(texto: string, provinciaId: number | null = null) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Parecidos texto={texto} provinciaId={provinciaId} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockImplementation(() => Promise.resolve({ csrfToken: 'token-de-prueba', temas: [] }));
  m.post.mockImplementation(() => Promise.resolve(PARECIDOS));
  m.put.mockImplementation(() => Promise.resolve({ coinciden: 2, regionCompleta: null }));
});

describe('Parecidos', () => {
  it('después de la pausa muestra hasta tres, dice cómo se parecen, y «Me sumo» manda un «Yo también»', async () => {
    montar('que el turno en el hospital no tarde', 66);
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Otras personas imaginan algo parecido' },
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();
    expect(m.post).toHaveBeenCalledWith(
      '/api/v1/vision/parecidos',
      { texto: 'que el turno en el hospital no tarde' },
      { csrfToken: 'token-de-prueba' },
    );
    expect(screen.getByText(/Se parecen en las palabras/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Me sumo' })).toHaveLength(3);
    expect(screen.queryByText('«Guardias con pediatras»')).not.toBeInTheDocument();
    expect(screen.getByText('Alguien de Salta imagina')).toBeInTheDocument();
    expect(screen.getByText('Alguien de la Argentina imagina')).toBeInTheDocument();

    const [primero] = screen.getAllByRole('button', { name: 'Me sumo' });
    if (!primero) throw new Error('falta el botón');
    fireEvent.click(primero);
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Te sumaste');
    });
    expect(m.put).toHaveBeenCalledWith(
      '/api/v1/pila/opiniones/a1f6b0b2-1c2d-4e3f-8a9b-0c1d2e3f4a01',
      { valor: 'acuerdo', provinciaId: 66 },
      { csrfToken: 'token-de-prueba' },
    );
    expect(screen.getAllByRole('button', { name: 'Me sumo' })).toHaveLength(2);
  });

  it('con pocas letras no pregunta nada', async () => {
    montar('que haya');
    await new Promise((ok) => setTimeout(ok, 800));
    expect(m.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('si la API falla o no encuentra nada, no muestra nada', async () => {
    m.post.mockImplementation(() => Promise.reject(new Error('caída')));
    const { unmount } = montar('que el turno en el hospital no tarde');
    await waitFor(
      () => {
        expect(m.post).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
    await new Promise((ok) => setTimeout(ok, 50));
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    unmount();

    m.post.mockClear();
    m.post.mockImplementation(() => Promise.resolve([]));
    montar('que el turno en el hospital no tarde');
    await waitFor(
      () => {
        expect(m.post).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
    await new Promise((ok) => setTimeout(ok, 50));
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('si sumarse falla lo dice y deja volver a intentar', async () => {
    m.put.mockImplementationOnce(() => Promise.reject(new Error('caída')));
    montar('que el turno en el hospital no tarde');
    const [primero] = await screen.findAllByRole('button', { name: 'Me sumo' }, { timeout: 2000 });
    if (!primero) throw new Error('falta el botón');
    fireEvent.click(primero);
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos sumarte');
    fireEvent.click(primero);
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Te sumaste');
    });
  });
});
