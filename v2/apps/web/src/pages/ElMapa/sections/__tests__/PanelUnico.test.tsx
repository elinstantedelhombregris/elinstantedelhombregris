import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ParticiparEnMapa } from '../ParticiparEnMapa';

import type { LugarMapa } from '../../instrumento/BusquedaTerritorial';
import type { ContribucionInput } from '@v2/shared';

const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  nacional: undefined as { id: string; [clave: string]: unknown } | undefined,
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: null, isLoading: false }) }));
vi.mock('~/lib/api', () => ({
  api: { get: vi.fn(() => Promise.resolve({ temas: [] })) },
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

function Panel({ lugar }: { lugar: LugarMapa | null }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return (
    <QueryClientProvider client={qc}>
      <ParticiparEnMapa lugar={lugar} visible cerrar={vi.fn()} />
    </QueryClientProvider>
  );
}
const enviados = () => m.mutate.mock.calls.map(([aporte]) => aporte as ContribucionInput);

const recibo = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  estado: 'enviada',
  tipo: 'basta',
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
  window.history.replaceState(null, '', '/el-mapa?participar=directo');
});

describe('El aporte puntual del mapa, con el formulario de verdad', () => {
  it('publica en la campaña nacional, por el lugar que se mira en el mapa', () => {
    render(<Panel lugar={mendoza} />);
    fireEvent.click(screen.getByRole('button', { name: 'basta' }));
    fireEvent.change(screen.getByLabelText('Tu aporte'), {
      target: { value: 'La plaza no tiene luz.' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Quiero publicar este aporte/ }));
    fireEvent.click(screen.getByRole('button', { name: /Publicar mi aporte/ }));

    const [directo] = enviados();
    expect(directo).toMatchObject({
      senal: { tipo: 'basta', provinceId: 50 },
      campanaId: m.nacional?.id,
      edicion: 1,
    });
  });

  it('si el mapa pasa a otro lugar, el formulario lo toma y el panel lo avisa una vez', () => {
    const vista = render(<Panel lugar={mendoza} />);
    vista.rerender(<Panel lugar={cordoba} />);
    expect(
      within(screen.getByRole('complementary', { name: 'Aportar desde el mapa' })).getByText(
        'Cambiaste de lugar: ahora es Córdoba.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('¿Desde dónde? (opcional)')).toHaveValue('14');
  });
});
