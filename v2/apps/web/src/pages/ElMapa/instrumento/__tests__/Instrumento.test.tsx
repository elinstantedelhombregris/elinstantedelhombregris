import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Instrumento } from '../Instrumento';

import type { ReactNode } from 'react';
import type { LecturaMapa } from '~/lib/queries/civic-map';

const lectura = vi.hoisted((): { valor: unknown } => ({ valor: null }));

vi.mock('../MapaBase', () => ({
  MapaBase: ({ children }: { children?: ReactNode }) => <div data-testid="mapa">{children}</div>,
}));
vi.mock('react-map-gl/maplibre', () => ({ Layer: () => null, Source: () => null }));
vi.mock('~/components/papel/PanelDejarFalta', () => ({ PanelDejarFalta: () => null }));
vi.mock('~/lib/api', () => ({ api: { get: vi.fn().mockResolvedValue({}) } }));
vi.mock('~/lib/queries/open-data', () => ({ useProvincias: () => ({ data: [] }) }));
vi.mock('~/lib/queries/civic-map', async (original) => ({
  ...(await original<Record<string, unknown>>()),
  useSenalesMapa: () => ({
    data: lectura.valor,
    isLoading: false,
    isError: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  }),
}));

const VACIA: LecturaMapa = {
  signals: [],
  metadata: {
    total: 0,
    entregados: 0,
    completa: true,
    hasta: '2026-10-09T00:00:00Z',
    siguiente: null,
    unidad: 'registros',
    sinPunto: 0,
    porProvincia: [],
    porDia: [],
  },
};

function montar(participando = false) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Instrumento
        participando={participando}
        participacion={<textarea aria-label="Tu aporte" defaultValue="" />}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  lectura.valor = VACIA;
  window.history.replaceState(null, '', '/el-mapa');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ features: [] }) }),
  );
});

describe('Instrumento — «solo la lista» no desmonta el panel de aportes', () => {
  it('lo que alguien escribió en el panel cerrado sigue ahí al alternar la vista', () => {
    montar(false);
    const campo = screen.getByLabelText<HTMLTextAreaElement>('Tu aporte');
    fireEvent.change(campo, { target: { value: 'Falta una sala de salud en el barrio' } });

    fireEvent.click(screen.getByRole('button', { name: 'Usar solo la lista' }));

    // Es el mismo nodo, con su texto: la grilla se oculta, no se desmonta.
    const despues = screen.getByLabelText('Tu aporte');
    expect(despues).toBe(campo);
    expect(despues).toHaveValue('Falta una sala de salud en el barrio');
    expect(campo.closest('.hidden')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar mapa y lista' }));
    expect(screen.getByLabelText('Tu aporte')).toBe(campo);
    expect(campo.closest('.hidden')).toBeNull();
  });

  it('con el panel abierto, «solo la lista» tampoco lo pierde', () => {
    montar(true);
    const campo = screen.getByLabelText<HTMLTextAreaElement>('Tu aporte');
    fireEvent.change(campo, { target: { value: 'Otra cosa' } });
    fireEvent.click(screen.getByRole('button', { name: 'Usar solo la lista' }));
    expect(screen.getByLabelText('Tu aporte')).toBe(campo);
    expect(campo.closest('.hidden')).toBeNull();
  });
});

describe('Instrumento — un mapa sin aportes lo dice una sola vez y en palabras', () => {
  it('el vacío del mapa, el filtro y el contador no repiten ni dejan ceros en dígitos', () => {
    const { container } = montar(false);
    expect(screen.getByText('Todavía no hay aportes en el mapa.')).toBeInTheDocument();
    expect(screen.getByText('Ningún aporte cumple los filtros.')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/(^|[^\d.,])0(?![\d.,])/);
    expect(container.textContent).not.toMatch(/Nadie dijo|nadie habló|Todavía no habló nadie/i);
  });
});
