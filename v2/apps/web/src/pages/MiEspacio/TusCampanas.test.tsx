import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { campanaPropuesta, contratoValido } from '../Campanas/__tests__/fixtura-propuesta';

import { TusCampanas } from './TusCampanas';

import type { CampanaPublica } from '@v2/shared';

const m = vi.hoisted(() => ({
  tuyas: [] as unknown[],
  detalle: null as CampanaPublica | null,
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: { id: 7, esAdmin: false }, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({ escribir: vi.fn() }));
vi.mock('~/lib/api', () => ({
  api: {
    get: (ruta: string) =>
      Promise.resolve(ruta === '/api/v1/campanas?mias=1' ? m.tuyas : m.detalle),
  },
}));

const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Router>
        <TusCampanas />
      </Router>
    </QueryClientProvider>,
  );
const fila = (nombre: string) => {
  const enlace = screen.getByRole('link', { name: nombre });
  const li = enlace.closest('li');
  if (!li) throw new Error(`Falta la fila de ${nombre}.`);
  return within(li);
};

beforeEach(() => {
  m.tuyas = [];
  m.detalle = null;
});

describe('Tus campañas', () => {
  it('sin campañas no ocupa lugar', async () => {
    const r = montar();
    await new Promise((ok) => setTimeout(ok, 0));
    expect(r.container).toBeEmptyDOMElement();
  });
  it('cada una con su estado, la barra si junta gente y el motivo si la devolvieron', async () => {
    m.tuyas = [
      campanaPropuesta(),
      campanaPropuesta({
        id: 'devuelta',
        slug: 'devuelta',
        contrato: { ...contratoValido, titulo: 'Una campaña devuelta' },
        impulso: { personas: 50, umbral: 50 },
        historial: [
          { revision: 4, estado: 'por_revisar', motivo: 'Trajo 50.', fecha: '' },
          { revision: 5, estado: 'reuniendo', motivo: 'Falta el uso de los datos.', fecha: '' },
        ],
      }),
      campanaPropuesta({
        id: 'abierta',
        slug: 'abierta',
        estado: 'abierta',
        impulso: null,
        contrato: { ...contratoValido, titulo: 'Una campaña abierta' },
      }),
    ];
    montar();
    expect(await screen.findByRole('heading', { name: 'Tus campañas' })).toBeInTheDocument();
    const primera = fila('Plazas con sombra en Salta');
    expect(primera.getByText('Juntando gente')).toBeInTheDocument();
    expect(
      primera.getByText('Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 18.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plazas con sombra en Salta' })).toHaveAttribute(
      'href',
      '/campanas/plazas-con-sombra',
    );
    const devuelta = fila('Una campaña devuelta');
    expect(devuelta.getByText(/La coordinación te la devolvió/).parentElement).toHaveTextContent(
      'Falta el uso de los datos.',
    );
    const abierta = fila('Una campaña abierta');
    expect(abierta.getByText('Abierta a participar')).toBeInTheDocument();
    expect(abierta.queryByRole('progressbar')).not.toBeInTheDocument();
    // Ya tiene una juntando gente: no se ofrece proponer otra.
    expect(screen.queryByRole('link', { name: 'Proponer una campaña' })).not.toBeInTheDocument();
  });
  it('si la lista no trae la cuenta ni el historial, los busca en la página de la campaña', async () => {
    const { id, slug, revision, estado, contrato, actualizadaEn } = campanaPropuesta();
    m.tuyas = [{ id, slug, revision, estado, contrato, actualizadaEn }];
    m.detalle = campanaPropuesta({ impulso: { personas: 3, umbral: 50 } });
    montar();
    expect(
      await screen.findByText('Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 3.'),
    ).toBeInTheDocument();
  });
  it('sin ninguna juntando gente, ofrece proponer una', async () => {
    m.tuyas = [campanaPropuesta({ estado: 'cerrada', impulso: null })];
    montar();
    expect(await screen.findByRole('link', { name: 'Proponer una campaña' })).toHaveAttribute(
      'href',
      '/campanas/proponer',
    );
  });
});
