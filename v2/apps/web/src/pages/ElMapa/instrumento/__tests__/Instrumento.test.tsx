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

describe('Instrumento — es un registro de noche dentro del papel', () => {
  it('declara color-scheme: dark en su contenedor, para que sus controles nativos se dibujen oscuros', () => {
    montar(false);
    const instrumento = screen.getByRole('region', { name: 'Instrumento territorial' });
    // El papel que lo rodea es `light`; sin esto el select y los deslizadores saldrían claros
    // sobre el fondo de tinta.
    expect(instrumento).toHaveClass('[color-scheme:dark]', 'bg-tinta');
  });
});

describe('Instrumento — el panel de aportes crece con la página', () => {
  const columna = () => screen.getByLabelText('Tu aporte').closest('.overflow-auto');

  it('con el panel abierto no tiene tope de alto ni scroll propio en escritorio', () => {
    montar(true);
    expect(columna()).not.toBeNull();
    expect(columna()).not.toHaveClass('max-h-[640px]');
    // En el teléfono ya se apilaba sin tope, y sigue así.
    expect(columna()).toHaveClass('max-[960px]:max-h-none');
  });

  it('con el panel cerrado, los paneles de lectura siguen recortados a la altura del mapa', () => {
    montar(false);
    expect(columna()).toHaveClass('max-h-[640px]');
  });

  it('con el panel abierto el mapa acompaña al panel largo en escritorio', () => {
    const { container } = montar(true);
    const mapa = container.querySelector('.relative.h-\\[640px\\]');
    expect(mapa).toHaveClass('min-[961px]:sticky', 'min-[961px]:self-start');
  });
});

describe('Instrumento — el botón del panel de aportes dice qué hace', () => {
  it('cerrado invita a sumar el aporte', () => {
    montar(false);
    expect(screen.getByRole('button', { name: 'Sumá tu aporte →' })).toBeInTheDocument();
  });

  it('abierto es una acción —seguir con el aporte—, no un estado que parece un botón', () => {
    montar(true);
    expect(screen.getByRole('button', { name: 'Seguir con mi aporte' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.queryByText(/en elaboración/)).not.toBeInTheDocument();
  });
});
