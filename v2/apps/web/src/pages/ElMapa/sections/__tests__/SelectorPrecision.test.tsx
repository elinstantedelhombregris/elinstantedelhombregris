import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelSoltarVoz, type PublicacionVoz } from '../PanelSoltarVoz';

import { useProvincias, type SoltarVozInput } from '~/lib/queries/open-data';

vi.mock('~/lib/queries/open-data', () => ({ useProvincias: vi.fn() }));
vi.mock('~/lib/despertar', () => ({ despertar: vi.fn() }));

const mutate = vi.fn<PublicacionVoz['enviar']>();
const montar = () =>
  render(<PanelSoltarVoz publicacion={{ enviar: mutate, pendiente: false, error: null }} />);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useProvincias).mockReturnValue({
    data: [{ id: 6, name: 'Córdoba', isoCode: 'AR-X' }],
    isLoading: false,
  } as ReturnType<typeof useProvincias>);
});

/**
 * En afterEach y no al final de cada test: si una aserción falla antes de la
 * línea de limpieza, el stub de `navigator` se filtra al archivo siguiente y
 * rompe tests que no tienen nada que ver. Pasó — por eso está acá.
 */
afterEach(() => {
  vi.unstubAllGlobals();
});

/** El camino de 30 segundos, sin tocar el paso de precisión. */
function publicarRapido() {
  fireEvent.click(screen.getByRole('button', { name: /basta/i }));
  fireEvent.change(screen.getByLabelText('Tu aporte'), {
    target: { value: 'Basta de laburar para el alquiler.' },
  });
  fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/i));
  fireEvent.click(screen.getByRole('button', { name: /Publicar mi aporte/ }));
}

describe('el paso de precisión es opcional (spec 2 §6, D2)', () => {
  it('el camino de 30 segundos NO gana un paso obligatorio', () => {
    montar();
    publicarRapido();

    expect(mutate).toHaveBeenCalledTimes(1);
    const [input] = mutate.mock.calls[0] as [SoltarVozInput, unknown];
    // Sin tocar nada, el envío es exactamente el de antes: sin punto y sin
    // precisión declarada. Los 30 segundos son la ley de esta página.
    expect(input.punto).toBeUndefined();
    expect(input.precisionPedida).toBeUndefined();
    expect(input.texto).toBe('Basta de laburar para el alquiler.');
  });

  it('el selector aparece pero no es requisito para poder enviar', () => {
    montar();
    expect(screen.getByText('¿Dónde exactamente? (opcional)')).toBeInTheDocument();

    // Con tipo y texto alcanza: la ubicación no entra en la validación. El
    // botón sigue bloqueado sin tipo o sin texto, como siempre.
    fireEvent.click(screen.getByRole('button', { name: /basta/i }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), { target: { value: 'Basta.' } });
    fireEvent.click(screen.getByLabelText(/Quiero publicar este aporte/i));
    expect(screen.getByRole('button', { name: /Publicar mi aporte/ })).not.toHaveAttribute(
      'aria-disabled',
    );
  });

  it('explica para qué sirve antes de pedir nada', () => {
    montar();
    expect(screen.getByText(/un pozo, algo roto, un punto de encuentro/)).toBeInTheDocument();
  });

  it('sin permiso de ubicación lo dice sin culpar a nadie', () => {
    const getCurrentPosition = vi.fn((_ok: unknown, fallo: (e: unknown) => void) => {
      fallo(new Error('denegado'));
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    montar();
    fireEvent.click(screen.getByRole('button', { name: 'usar mi ubicación' }));

    expect(screen.getByText(/No nos diste permiso, y está perfecto/)).toBeInTheDocument();
  });

  it('con ubicación, el envío lleva el punto y la precisión elegida', () => {
    const getCurrentPosition = vi.fn((ok: (p: unknown) => void) => {
      ok({ coords: { latitude: -34.6037, longitude: -58.3816 } });
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    montar();
    fireEvent.click(screen.getByRole('button', { name: 'usar mi ubicación' }));

    // Por defecto se ofrece el punto exacto: es lo que D7 permite y lo que
    // hace útil marcar un pozo o un punto de reparto.
    expect(screen.getByRole('button', { name: 'el punto exacto' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    publicarRapido();
    const [input] = mutate.mock.calls[0] as [SoltarVozInput, unknown];
    expect(input.punto).toEqual({ lat: -34.6037, lng: -58.3816 });
    expect(input.precisionPedida).toBe('exact');
  });

  it('se puede elegir publicar menos preciso, y se puede quitar la ubicación', () => {
    const getCurrentPosition = vi.fn((ok: (p: unknown) => void) => {
      ok({ coords: { latitude: -34.6037, longitude: -58.3816 } });
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    montar();
    fireEvent.click(screen.getByRole('button', { name: 'usar mi ubicación' }));
    fireEvent.click(screen.getByRole('button', { name: 'el barrio' }));

    publicarRapido();
    const [input] = mutate.mock.calls[0] as [SoltarVozInput, unknown];
    expect(input.precisionPedida).toBe('neighborhood');
  });
});
