import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { SLUG_CAMPANA_NACIONAL } from '@v2/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { Campanas } from '../../Campanas';

import { campanaPropuesta, contratoValido } from './fixtura-propuesta';

import type { CampanaPublica } from '@v2/shared';

const m = vi.hoisted(() => ({
  lista: [] as unknown[],
  detalle: null as CampanaPublica | null,
  user: null as { id: number; esAdmin: boolean } | null,
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: m.user, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useCampanas: () => ({ data: m.lista, isLoading: false, isError: false, error: null }),
  escribir: vi.fn(),
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: (ruta: string) =>
      ruta.startsWith('/api/v1/campanas/')
        ? Promise.resolve(m.detalle)
        : Promise.resolve({ id: 66, name: 'Salta', level: 'province', provinceId: 66 }),
  },
}));
vi.mock('~/lib/queries/open-data', () => ({ useProvincias: () => ({ data: [] }) }));

const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Router>
        <Campanas />
      </Router>
    </QueryClientProvider>,
  );
const deLista = (c: CampanaPublica) => {
  const { id, slug, revision, estado, contrato, actualizadaEn, impulso } = c;
  return { id, slug, revision, estado, contrato, actualizadaEn, impulso };
};

beforeEach(() => {
  m.lista = [];
  m.detalle = null;
  m.user = null;
  window.history.replaceState(null, '', '/campanas');
});

describe('El catálogo con las campañas que quieren abrir', () => {
  const nacional = campanaPropuesta({
    id: 'n',
    slug: SLUG_CAMPANA_NACIONAL,
    estado: 'abierta',
    impulso: null,
    contrato: { ...contratoValido, titulo: 'Mi Argentina ideal' },
  });
  const abierta = campanaPropuesta({
    id: 'a',
    slug: 'abierta',
    estado: 'abierta',
    impulso: null,
    contrato: { ...contratoValido, titulo: 'Una campaña abierta' },
  });
  const reuniendo = campanaPropuesta();
  it('la nacional y las abiertas arriba; las que juntan gente, en «Quieren abrir»', () => {
    m.lista = [deLista(reuniendo), deLista(abierta), deLista(nacional)];
    montar();
    const catalogo = within(screen.getByRole('region', { name: 'Campañas' }));
    expect(catalogo.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Mi Argentina ideal',
      'Una campaña abierta',
    ]);
    const quieren = within(screen.getByRole('region', { name: 'Quieren abrir' }));
    expect(quieren.getByRole('link', { name: 'Plazas con sombra en Salta' })).toHaveAttribute(
      'href',
      '/campanas/plazas-con-sombra',
    );
    expect(quieren.getByText(/¿Qué tendría que pasar para que tu plaza/)).toBeInTheDocument();
    expect(quieren.getByText('La impulsa Vecinos por la Sombra')).toBeInTheDocument();
    expect(
      quieren.getByText('Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 18.'),
    ).toBeInTheDocument();
    expect(quieren.getByText('Juntando gente')).toBeInTheDocument();
  });
  it('si la lista no trae la cuenta, la busca en la página de la campaña', async () => {
    const sinCuenta = { ...deLista(reuniendo), impulso: undefined };
    m.lista = [sinCuenta];
    m.detalle = campanaPropuesta({ impulso: { personas: 7, umbral: 50 } });
    montar();
    expect(
      await screen.findByText('Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 7.'),
    ).toBeInTheDocument();
  });
  it('sin sesión, «Ingresá para proponer» vuelve a proponer después de ingresar', () => {
    m.lista = [deLista(nacional)];
    montar();
    expect(screen.getByText('Por ahora ninguna campaña está juntando gente.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ingresá para proponer' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fcampanas%2Fproponer',
    );
  });
  it('con sesión, «Proponer una campaña» lleva a proponer', () => {
    m.user = { id: 7, esAdmin: false };
    m.lista = [deLista(nacional)];
    montar();
    expect(screen.getByRole('link', { name: 'Proponer una campaña' })).toHaveAttribute(
      'href',
      '/campanas/proponer',
    );
  });
  it('si sólo hay campañas que quieren abrir, no dice que no hay resultados', () => {
    m.lista = [deLista(reuniendo)];
    montar();
    expect(screen.queryByText('No hay campañas con estos filtros.')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Campañas' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Quieren abrir' })).toBeInTheDocument();
  });
});
