import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DatosAbiertos } from '../DatosAbiertos';

const m = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('~/lib/api', () => ({ api: { get: m.get } }));
vi.mock('~/lib/queries/participacion', () => ({
  useCampanas: () => ({
    data: [
      {
        id: '0d3f5a52-4a59-4a54-8d70-5d1f4c2a9e11',
        slug: 'mi-argentina-ideal',
        contrato: { titulo: 'Mi Argentina ideal' },
      },
    ],
  }),
}));
vi.mock('~/components/participacion/DescargarDatos', () => ({
  DescargarDatos: ({ consulta }: { consulta: Record<string, string> }) => (
    <button type="button">Preparar el archivo ({Object.keys(consulta).length} filtros)</button>
  ),
}));

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <DatosAbiertos />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  m.get.mockReset();
  m.get.mockResolvedValue({ id: 14, name: 'Salta', level: 'province', provinceId: 14 });
});
afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('Datos abiertos', () => {
  it('el título nombra la página y el texto dice que no hace falta cuenta', () => {
    montar();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Descargá los datos públicos' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No hace falta cuenta\./)).toBeInTheDocument();
    expect(screen.queryByText(/Lo que sabemos debe poder revisarse/)).not.toBeInTheDocument();
  });

  it('explica qué son los vectores y por qué no se publican', () => {
    montar();
    expect(
      screen.getByText(
        'Los vectores (la huella numérica de cada texto) no se publican: aun sin nombre podrían ligarse a una persona.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/por asumir que son anónimos/)).not.toBeInTheDocument();
  });

  it('con un alcance elegido nombra la campaña y el lugar en vez de mostrar sus ids', async () => {
    window.history.replaceState(
      null,
      '',
      '/datos-abiertos?territorio=14&campana=0d3f5a52-4a59-4a54-8d70-5d1f4c2a9e11',
    );
    montar();

    await waitFor(() => {
      expect(
        screen.getByText(/campaña Mi Argentina ideal · lugar Salta/),
      ).toBeInTheDocument();
    });
    const nota = screen.getByText(/Este archivo incluye solo lo que corresponde a/);
    expect(nota).not.toHaveTextContent(/territorio|campana:|0d3f5a52|: 14/);
    expect(m.get).toHaveBeenCalledWith('/api/v1/geo/lugares/14', expect.anything());
    expect(screen.getByRole('link', { name: 'Ver el registro completo' })).toHaveAttribute(
      'href',
      '/datos-abiertos',
    );
  });

  it('mientras el lugar no llega, o si no existe, no cae al id', async () => {
    window.history.replaceState(null, '', '/datos-abiertos?territorio=999');
    m.get.mockRejectedValue(new Error('No encontramos ese ámbito territorial.'));
    montar();

    const nota = await screen.findByText(/Este archivo incluye solo lo que corresponde a/);
    expect(nota).toHaveTextContent('lugar elegido');
    expect(nota).not.toHaveTextContent('999');
  });

  it('un estado se dice en castellano', () => {
    window.history.replaceState(null, '', '/datos-abiertos?estado=corroborada');
    montar();
    expect(screen.getByText(/estado Comprobada por dos personas/)).toBeInTheDocument();
  });

  it('sin filtros no hay aviso de alcance y «Descargar mis datos» lleva a la pestaña de la cuenta', () => {
    montar();
    expect(screen.queryByText(/Este archivo incluye solo/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Descargar mis datos' })).toHaveAttribute(
      'href',
      '/mi-espacio?pestana=cuenta',
    );
  });
});
