import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelSoltarVoz } from '../PanelSoltarVoz';

import { useProvincias, useSoltarVoz, type SoltarVozInput } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useSoltarVoz: vi.fn(),
}));
vi.mock('~/lib/despertar', () => ({ despertar: vi.fn() }));

const mutate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useProvincias).mockReturnValue({
    data: [{ id: 6, name: 'Córdoba', isoCode: 'AR-X' }],
    isLoading: false,
  } as ReturnType<typeof useProvincias>);
  vi.mocked(useSoltarVoz).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useSoltarVoz>);
});

/** El camino de 30 segundos, sin tocar el paso de precisión. */
function soltarVozRapido() {
  fireEvent.click(screen.getByRole('button', { name: /basta/i }));
  fireEvent.change(screen.getByLabelText('Tu voz'), {
    target: { value: 'Basta de laburar para el alquiler.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));
}

describe('el paso de precisión es opcional (spec 2 §6, D2)', () => {
  it('el camino de 30 segundos NO gana un paso obligatorio', () => {
    render(<PanelSoltarVoz />);
    soltarVozRapido();

    expect(mutate).toHaveBeenCalledTimes(1);
    const [input] = mutate.mock.calls[0] as [SoltarVozInput];
    // Sin tocar nada, el envío es exactamente el de antes: sin punto y sin
    // precisión declarada. Los 30 segundos son la ley de esta página.
    expect(input.punto).toBeUndefined();
    expect(input.precisionPedida).toBeUndefined();
    expect(input.body).toBe('Basta de laburar para el alquiler.');
  });

  it('el selector aparece pero no bloquea el envío', () => {
    render(<PanelSoltarVoz />);
    expect(screen.getByText('¿Dónde exactamente? (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Soltar la voz →' })).not.toBeDisabled();
  });

  it('explica para qué sirve antes de pedir nada', () => {
    render(<PanelSoltarVoz />);
    expect(screen.getByText(/un pozo, algo roto, un punto de encuentro/)).toBeInTheDocument();
  });

  it('sin permiso de ubicación lo dice sin culpar a nadie', () => {
    const getCurrentPosition = vi.fn((_ok: unknown, fallo: (e: unknown) => void) => {
      fallo(new Error('denegado'));
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    render(<PanelSoltarVoz />);
    fireEvent.click(screen.getByRole('button', { name: 'usar mi ubicación' }));

    expect(screen.getByText(/No nos diste permiso, y está perfecto/)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('con ubicación, el envío lleva el punto y la precisión elegida', () => {
    const getCurrentPosition = vi.fn((ok: (p: unknown) => void) => {
      ok({ coords: { latitude: -34.6037, longitude: -58.3816 } });
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    render(<PanelSoltarVoz />);
    fireEvent.click(screen.getByRole('button', { name: 'usar mi ubicación' }));

    // Por defecto se ofrece el punto exacto: es lo que D7 permite y lo que
    // hace útil marcar un pozo o un punto de reparto.
    expect(screen.getByRole('button', { name: 'el punto exacto' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    soltarVozRapido();
    const [input] = mutate.mock.calls[0] as [SoltarVozInput];
    expect(input.punto).toEqual({ lat: -34.6037, lng: -58.3816 });
    expect(input.precisionPedida).toBe('exact');
    vi.unstubAllGlobals();
  });

  it('se puede elegir publicar menos preciso, y se puede quitar la ubicación', () => {
    const getCurrentPosition = vi.fn((ok: (p: unknown) => void) => {
      ok({ coords: { latitude: -34.6037, longitude: -58.3816 } });
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    render(<PanelSoltarVoz />);
    fireEvent.click(screen.getByRole('button', { name: 'usar mi ubicación' }));
    fireEvent.click(screen.getByRole('button', { name: 'el barrio' }));

    soltarVozRapido();
    const [input] = mutate.mock.calls[0] as [SoltarVozInput];
    expect(input.precisionPedida).toBe('neighborhood');
    vi.unstubAllGlobals();
  });
});
