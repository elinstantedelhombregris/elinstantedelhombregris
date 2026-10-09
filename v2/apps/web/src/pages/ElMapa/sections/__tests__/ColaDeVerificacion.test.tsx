import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ColaDeVerificacion } from '../ColaDeVerificacion';

import { useCola } from '~/lib/queries/senales';

vi.mock('~/lib/queries/senales', () => ({ useCola: vi.fn() }));

/** Lo que responde hoy el servidor cuando no reconoce el navegador (texto de origen en la API). */
const RAZON_DEL_SERVIDOR =
  'Todavía no tenemos un identificador de este navegador. Soltá una voz o adherí a una, y la cola se llena.';

function conCola(razon: string | null) {
  vi.mocked(useCola).mockReturnValue({
    data: { senales: [], razon },
    isLoading: false,
  } as unknown as ReturnType<typeof useCola>);
}

beforeEach(() => {
  vi.mocked(useCola).mockReset();
});

describe('La cola del «¿sigue así?» — cuando no reconoce el navegador', () => {
  it('lo dice con las palabras del glosario, no con las del servidor', () => {
    conCola(RAZON_DEL_SERVIDOR);
    const { container } = render(<ColaDeVerificacion />);
    expect(
      screen.getByText(
        'Todavía no sabemos quién sos en este navegador. Sumá un aporte o decí «A mí también me pasa» en el de otra persona, y acá aparecen aportes para mirar.',
      ),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bvoz\b|\bcola se llena\b|adherí/i);
  });

  it('cualquier otra razón se muestra tal como llega', () => {
    conCola('Estamos actualizando la lista.');
    render(<ColaDeVerificacion />);
    expect(screen.getByText('Estamos actualizando la lista.')).toBeInTheDocument();
  });
});
