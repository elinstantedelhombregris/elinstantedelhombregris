import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelSoltarVoz } from '../PanelSoltarVoz';

import { ApiError } from '~/lib/api';
import { useProvincias, useSoltarVoz } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useSoltarVoz: vi.fn(),
}));

const mockProvincias = vi.mocked(useProvincias);
const mockSoltar = vi.mocked(useSoltarVoz);

type MutateFn = ReturnType<typeof useSoltarVoz>['mutate'];
const mutate = vi.fn<MutateFn>();

function armarMutacion(extra: Partial<ReturnType<typeof useSoltarVoz>> = {}) {
  mockSoltar.mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
    ...extra,
  } as ReturnType<typeof useSoltarVoz>);
}

describe('PanelSoltarVoz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockProvincias.mockReturnValue({
      data: [{ id: 6, name: 'Córdoba', isoCode: 'AR-X' }],
      isLoading: false,
    } as ReturnType<typeof useProvincias>);
    armarMutacion();
  });

  it('ofrece los 6 tipos y el botón nace deshabilitado', () => {
    render(<PanelSoltarVoz />);

    for (const tipo of ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor']) {
      expect(screen.getByRole('button', { name: tipo, pressed: false })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Soltar la voz →' })).toBeDisabled();
  });

  it('con tipo + texto + provincia manda el payload correcto', () => {
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: '  Trenes que lleguen. ' } });
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));

    expect(mutate).toHaveBeenCalledWith(
      { body: 'Trenes que lleguen.', category: 'sueño', provinceId: 6 },
      expect.anything(),
    );
  });

  it('al 201: sello RECIBIDA + despertar + textarea limpio', () => {
    mutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 99 }, _input, undefined, undefined as never);
    });
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Trenes que lleguen.' } });
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));

    expect(screen.getByText('Recibida')).toBeInTheDocument();
    expect(
      screen.getByText('Tu voz cayó en Córdoba. Ya está en el mapa, a la vista de todos.'),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('basta_despierto')).toBe('1');
    expect(screen.getByLabelText('Tu voz')).toHaveValue('');
  });

  it('sin provincia, la confirmación es honesta: cuenta pero no cae en el mapa', () => {
    mutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 99 }, _input, undefined, undefined as never);
    });
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Basta.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));

    expect(
      screen.getByText('Tu voz quedó registrada. Ya cuenta con todas las demás.'),
    ).toBeInTheDocument();
  });

  it('rate limit muestra el mensaje del server; otros errores, la línea §10.9', () => {
    armarMutacion({
      isError: true,
      error: new ApiError(429, 'RATE_LIMITED', 'Demasiadas solicitudes. Intentá de nuevo en un momento.'),
    });
    render(<PanelSoltarVoz />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Demasiadas solicitudes. Intentá de nuevo en un momento.',
    );

    armarMutacion({ isError: true, error: new ApiError(500, 'INTERNAL', 'boom') });
    render(<PanelSoltarVoz />);
    expect(
      screen.getAllByRole('alert').at(-1),
    ).toHaveTextContent('Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.');
  });
});
