import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ParticiparEnMapa, type ModoAporte } from '../ParticiparEnMapa';

import type { LugarMapa } from '../../instrumento/BusquedaTerritorial';
import type { ContribucionInput } from '@v2/shared';

const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  nacional: undefined as { id: string; [clave: string]: unknown } | undefined,
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: null, isLoading: false }) }));
vi.mock('~/lib/api', () => ({
  api: { get: vi.fn(() => Promise.resolve({ proveedor: null, temas: [] })) },
}));
vi.mock('~/lib/participacion/borradores', () => ({
  leerBorradores: vi.fn(() => Promise.resolve([])),
  guardarBorrador: vi.fn(() => Promise.resolve()),
  borrarBorrador: vi.fn(() => Promise.resolve()),
}));
vi.mock('~/lib/queries/open-data', () => ({
  useProvincias: () => ({
    data: [
      { id: 50, name: 'Mendoza', isoCode: 'AR-M' },
      { id: 14, name: 'Córdoba', isoCode: 'AR-X' },
    ],
    isLoading: false,
  }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  usePublicarAporte: () => ({ mutate: m.mutate, isPending: false, error: null }),
  useLecturaAsistida: () => ({ mutate: vi.fn(), isPending: false }),
  useCampana: (pedida?: string) => ({
    data: pedida === 'mi-argentina-ideal' ? m.nacional : undefined,
    isPending: false,
    isError: false,
  }),
}));
vi.mock('~/components/participacion/Seguir', () => ({ Seguir: () => null }));
vi.mock('../../instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <p>Buscador de lugares</p>,
}));

const mendoza: LugarMapa = {
  id: 50,
  provinceId: 50,
  name: 'Mendoza',
  level: 'province',
  latitude: null,
  longitude: null,
};
const cordoba: LugarMapa = { ...mendoza, id: 14, provinceId: 14, name: 'Córdoba' };

function Panel({ lugar, inicial = 'guiado' }: { lugar: LugarMapa | null; inicial?: ModoAporte }) {
  const [modo, setModo] = useState<ModoAporte>(inicial);
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <QueryClientProvider client={qc}>
      <ParticiparEnMapa modo={modo} cambiar={setModo} lugar={lugar} visible cerrar={vi.fn()} />
    </QueryClientProvider>
  );
}
const enviados = () => m.mutate.mock.calls.map(([aporte]) => aporte as ContribucionInput);

const recibo = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  estado: 'enviada',
  tipo: 'sueño',
  precisionPublicada: 'province',
  yaExistia: false,
  avisos: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  m.mutate.mockImplementation(
    (_aporte: unknown, opciones?: { onSuccess?: (r: typeof recibo) => void }) => {
      opciones?.onSuccess?.(recibo);
    },
  );
  m.nacional = {
    id: 'e2d1c0b9-5a41-4f3e-9b7c-1a2b3c4d5e6f',
    slug: 'mi-argentina-ideal',
    revision: 1,
    estado: 'abierta',
    contrato: {
      titulo: 'Mi Argentina ideal',
      pregunta: '¿Qué sería posible?',
      responsable: 'Equipo ¡BASTA!',
      fechaDevolucion: '2099-12-20',
    },
  };
  window.localStorage.clear();
  window.history.replaceState(null, '', '/el-mapa?participar=aportar');
});

describe('Imaginar y el aporte puntual en un solo panel', () => {
  it('abre con las tres preguntas; el aporte puntual no está a la vista ni en el teclado', async () => {
    render(<Panel lugar={mendoza} />);
    expect(await screen.findByText('Pregunta 1 de 3')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Imaginá el país desde tu lugar.' })).toBeInTheDocument();
    // Los dos formularios están montados, pero el inactivo está oculto: ni lectores ni tabulador.
    expect(screen.queryByRole('button', { name: 'basta' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '← Volver a las tres preguntas' }),
    ).not.toBeInTheDocument();
  });

  it('al pasar al aporte puntual y volver, no se pierde nada de lo escrito', async () => {
    render(<Panel lugar={mendoza} />);
    await screen.findByText('Pregunta 1 de 3');
    fireEvent.change(screen.getByRole('textbox', { name: /¿qué sería posible en tu vida\?/i }), {
      target: { value: 'Quiero aprender cerca de mi casa.' },
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: '¿Querés contar algo puntual — un problema, una necesidad, algo que ya funciona? Cargalo directo →',
      }),
    );

    // Ahora se ve el aporte puntual y las tres preguntas quedan fuera del árbol.
    expect(screen.getByRole('button', { name: '← Volver a las tres preguntas' })).toBeVisible();
    // Siguen montadas —por eso no se pierde lo escrito—, pero ocultas.
    expect(screen.getByText('Pregunta 1 de 3')).not.toBeVisible();
    expect(
      screen.queryByRole('textbox', { name: /¿qué sería posible en tu vida\?/i }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), {
      target: { value: 'La plaza no tiene luz.' },
    });

    fireEvent.click(screen.getByRole('button', { name: '← Volver a las tres preguntas' }));
    expect(screen.getByRole('textbox', { name: /¿qué sería posible en tu vida\?/i })).toHaveValue(
      'Quiero aprender cerca de mi casa.',
    );
    expect(screen.queryByRole('button', { name: 'basta' })).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: '¿Querés contar algo puntual — un problema, una necesidad, algo que ya funciona? Cargalo directo →',
      }),
    );
    expect(screen.getByLabelText('Tu aporte')).toHaveValue('La plaza no tiene luz.');
    expect(screen.getByRole('button', { name: 'basta', pressed: true })).toBeInTheDocument();
  });

  it('el foco acompaña el cambio: al aporte puntual va al enlace de vuelta; al volver, al enlace que lo trajo', async () => {
    render(<Panel lugar={mendoza} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: '¿Querés contar algo puntual — un problema, una necesidad, algo que ya funciona? Cargalo directo →',
      }),
    );
    expect(screen.getByRole('button', { name: '← Volver a las tres preguntas' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '← Volver a las tres preguntas' }));
    expect(screen.getByRole('button', { name: /Cargalo directo/ })).toHaveFocus();
  });

  it('los dos caminos publican en la campaña nacional por el mismo lugar', async () => {
    render(<Panel lugar={mendoza} />);
    await screen.findByText('Pregunta 1 de 3');
    fireEvent.change(screen.getByRole('textbox', { name: /¿qué sería posible en tu vida\?/i }), {
      target: { value: 'Quiero aprender cerca.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Seguir imaginando' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dejar esta pregunta abierta' }));
    fireEvent.click(screen.getByLabelText('Este texto dice lo que quiero decir.'));
    fireEvent.click(screen.getByRole('checkbox', { name: /Quiero publicar este aporte/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar mi aporte' }));

    fireEvent.click(screen.getByRole('button', { name: 'Sumar otro aporte' }));
    fireEvent.click(screen.getByRole('button', { name: /Cargalo directo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), {
      target: { value: 'La plaza no tiene luz.' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Quiero publicar este aporte/ }));
    fireEvent.click(screen.getByRole('button', { name: /Publicar mi aporte/ }));

    const [guiado, directo] = enviados();
    expect(guiado).toMatchObject({ senal: { tipo: 'sueño', provinceId: 50 } });
    expect(directo).toMatchObject({ senal: { tipo: 'basta', provinceId: 50 } });
    for (const aporte of [guiado, directo])
      expect(aporte).toMatchObject({ campanaId: m.nacional?.id, edicion: 1 });
  });

  it('si el mapa pasa a otro lugar, los dos caminos lo toman y el panel lo avisa una vez', async () => {
    const vista = render(<Panel lugar={mendoza} />);
    await screen.findByText('Pregunta 1 de 3');
    vista.rerender(<Panel lugar={cordoba} />);
    expect(
      within(screen.getByRole('complementary', { name: 'Aportar desde el mapa' })).getByText(
        'Cambiaste de lugar: ahora es Córdoba.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cargalo directo/ }));
    expect(screen.getByLabelText('¿Desde dónde? (opcional)')).toHaveValue('14');
  });
});
