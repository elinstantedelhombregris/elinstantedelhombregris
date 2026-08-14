import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelSoltarVoz } from '../PanelSoltarVoz';

import { ApiError } from '~/lib/api';
import { useProvincias, useSoltarVoz, type SoltarVozInput, type VozSoltada } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: vi.fn(),
  useSoltarVoz: vi.fn(),
}));

const mockProvincias = vi.mocked(useProvincias);
const mockSoltar = vi.mocked(useSoltarVoz);

/**
 * El componente invoca `mutate(input, { onSuccess })` y SÍ lee el `data` que
 * TanStack Query le pasa: desde el paso de precisión (spec 2 §6), la respuesta
 * trae la precisión publicada y el motivo del engrosado, y la confirmación los
 * muestra. El mock tiene que pasarle una respuesta como se la pasaría Query —
 * si no, prueba un contrato que no existe.
 */
type MutateComoLoLlamaElComponente = (
  input: SoltarVozInput,
  opciones?: { onSuccess?: (data: VozSoltada) => void },
) => void;

/** Lo que devuelve el 201 cuando no hubo nada que engrosar. */
const RESPUESTA_OK: VozSoltada = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  yaExistia: false,
  precisionPublicada: 'province',
  engrosado: null,
};
const mutate = vi.fn<MutateComoLoLlamaElComponente>();

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

  it('ofrece los NUEVE tipos del canon y el botón nace deshabilitado', () => {
    render(<PanelSoltarVoz />);

    for (const tipo of [
      'basta',
      'necesidad',
      'recurso',
      'práctica',
      'saber',
      'sueño',
      'propuesta',
      'compromiso',
      'pregunta',
    ]) {
      expect(screen.getByRole('button', { name: tipo, pressed: false })).toBeInTheDocument();
    }
    // `valor` salió del canon: un valor no tiene coordenada.
    expect(screen.queryByRole('button', { name: 'valor' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Soltar la voz →' })).toBeDisabled();
  });

  it('sin marcar la cesión el botón sigue deshabilitado', () => {
    render(<PanelSoltarVoz />);
    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Trenes que lleguen.' } });

    // Nadie licencia obra ajena por default: sin la marca, la fila saldría en
    // el volcado público sin `texto`, y eso tiene que ser una decisión dicha.
    expect(screen.getByRole('button', { name: 'Soltar la voz →' })).toBeDisabled();
  });

  it('con tipo + texto + provincia manda el payload correcto', () => {
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: '  Trenes que lleguen. ' } });
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(screen.getByLabelText(/identificador al azar/i));
    fireEvent.click(screen.getByRole('button', { name: 'Soltar la voz →' }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        contrato: 'basta-senal/v1',
        tipo: 'sueño',
        texto: 'Trenes que lleguen.',
        provinceId: 6,
        cedeLicencia: true,
        casa: 'sinRespuesta',
      }),
      expect.anything(),
    );
    // El uuid de idempotencia lo pone el cliente y tiene que ser uno de verdad.
    const [enviado] = mutate.mock.calls[0] as [SoltarVozInput];
    expect(enviado.idLocal).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('doble submit mientras está pendiente no duplica la mutación', () => {
    const { container, rerender } = render(<PanelSoltarVoz />);
    const form = container.querySelector('form');
    if (!form) throw new Error('form no encontrado');

    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Basta.' } });
    fireEvent.click(screen.getByLabelText(/identificador al azar/i));

    fireEvent.submit(form);
    expect(mutate).toHaveBeenCalledTimes(1);

    // El botón real ya nace disabled con isPending — pero este submit se
    // dispara directo sobre el <form>, sin pasar por el click del botón:
    // prueba el guard `soltar.isPending` de adentro de onSubmit, no el
    // `disabled` del DOM.
    armarMutacion({ isPending: true });
    rerender(<PanelSoltarVoz />);
    fireEvent.submit(form);

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('al 201: sello RECIBIDA + despertar + textarea limpio', () => {
    mutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.(RESPUESTA_OK);
    });
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'sueño' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Trenes que lleguen.' } });
    fireEvent.change(screen.getByLabelText('¿Desde dónde? (opcional)'), { target: { value: '6' } });
    fireEvent.click(screen.getByLabelText(/identificador al azar/i));
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
      opts?.onSuccess?.(RESPUESTA_OK);
    });
    render(<PanelSoltarVoz />);

    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu voz'), { target: { value: 'Basta.' } });
    fireEvent.click(screen.getByLabelText(/identificador al azar/i));
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
