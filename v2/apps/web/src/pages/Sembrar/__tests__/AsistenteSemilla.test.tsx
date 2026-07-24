import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AsistenteSemilla } from '../sections/AsistenteSemilla';

import { ApiError } from '~/lib/api';
import { despertar } from '~/lib/despertar';
import { usePlantarSemilla } from '~/lib/queries/semillas';

vi.mock('~/lib/despertar', () => ({
  despertar: vi.fn(),
}));

vi.mock('~/lib/queries/semillas', () => ({
  usePlantarSemilla: vi.fn(),
}));

const mockDespertar = vi.mocked(despertar);
const mockPlantar = vi.mocked(usePlantarSemilla);

type OnSuccess = (res: { id: number; createdAt: string }) => void;
type MutateComoLoLlamaElComponente = (
  input: { basta: string; sueno: string; compromiso: string },
  opciones?: { onSuccess?: OnSuccess },
) => void;
const mutate = vi.fn<MutateComoLoLlamaElComponente>();

function armarMutacion(extra: Partial<ReturnType<typeof usePlantarSemilla>> = {}) {
  mockPlantar.mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
    ...extra,
  } as ReturnType<typeof usePlantarSemilla>);
}

describe('AsistenteSemilla', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    armarMutacion();
  });

  it('paso 1: heading, línea de paso y navegación en su estado inicial', () => {
    render(<AsistenteSemilla onPlantada={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Tu basta' })).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Volver' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeDisabled();
  });

  it('escribir texto habilita Siguiente; el primer avance despierta el sitio', () => {
    render(<AsistenteSemilla onPlantada={vi.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Basta de todo.' } });
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));

    expect(mockDespertar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { level: 2, name: 'Tu sueño' })).toBeInTheDocument();
    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
  });

  it('Volver en paso 2 conserva el texto del paso 1', () => {
    render(<AsistenteSemilla onPlantada={vi.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Basta de todo.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
    fireEvent.click(screen.getByRole('button', { name: '← Volver' }));

    expect(screen.getByRole('heading', { level: 2, name: 'Tu basta' })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Basta de todo.');
  });

  it('el segundo avance no vuelve a llamar despertar()', () => {
    render(<AsistenteSemilla onPlantada={vi.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Basta de todo.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
    fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));

    expect(mockDespertar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { level: 2, name: 'Tu sueño' })).toBeInTheDocument();
  });

  it('paso 3: Plantar mi semilla manda las tres frases trimmeadas y dispara onPlantada', () => {
    mutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 1234, createdAt: '2026-07-24T12:00:00.000Z' });
    });
    const onPlantada = vi.fn();
    render(<AsistenteSemilla onPlantada={onPlantada} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Basta de todo.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Sueño con algo.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));

    expect(screen.getByRole('heading', { level: 2, name: 'Tu compromiso' })).toBeInTheDocument();
    expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plantar mi semilla' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Me comprometo a algo.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Plantar mi semilla' }));

    expect(mutate).toHaveBeenCalledWith(
      { basta: 'Basta de todo.', sueno: 'Sueño con algo.', compromiso: 'Me comprometo a algo.' },
      expect.anything(),
    );
    expect(onPlantada).toHaveBeenCalledWith({
      id: 1234,
      fecha: '2026-07-24T12:00:00.000Z',
      basta: 'Basta de todo.',
      sueno: 'Sueño con algo.',
      compromiso: 'Me comprometo a algo.',
    });
  });

  it('error del POST: RATE_LIMITED muestra el mensaje del server, otro error el copy genérico, y lo escrito no se pierde', () => {
    armarMutacion({
      isError: true,
      error: new ApiError(429, 'RATE_LIMITED', 'Demasiados intentos. Probá en un rato.'),
    });
    const { unmount } = render(<AsistenteSemilla onPlantada={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Basta de todo.' } });

    expect(screen.getByRole('alert')).toHaveTextContent('Demasiados intentos. Probá en un rato.');
    expect(screen.getByRole('textbox')).toHaveValue('Basta de todo.');
    unmount();

    armarMutacion({ isError: true, error: new ApiError(500, 'INTERNAL', 'boom') });
    render(<AsistenteSemilla onPlantada={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.',
    );
  });

  it('stepper: contenedor aria-hidden, 3 tramos, en el paso 2 los dos primeros violeta y el tercero papel-borde', () => {
    const { container } = render(<AsistenteSemilla onPlantada={vi.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Basta de todo.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));

    const tramosContainer = container.querySelector('[aria-hidden]');
    expect(tramosContainer).not.toBeNull();
    const tramos = tramosContainer?.children ?? [];
    expect(tramos).toHaveLength(3);
    expect(tramos[0]).toHaveClass('bg-violeta');
    expect(tramos[1]).toHaveClass('bg-violeta');
    expect(tramos[2]).toHaveClass('bg-papel-borde');
  });

  it('pie del asistente presente', () => {
    render(<AsistenteSemilla onPlantada={vi.fn()} />);
    expect(screen.getByText('Anónimo si querés · Sin registro · Sin spam')).toBeInTheDocument();
  });
});
