import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { MisAportes } from '../MisAportes';

import type { AportePropio } from '@v2/shared';

vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 1 }, isLoading: false }) }));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));
vi.mock('../../Senal/EditarAporte', () => ({ EditarAporte: () => null }));

type ConRetencion = AportePropio & {
  retenido?: { origen: 'reportes' | 'gestion'; desde: string } | null;
};

const aporte = (extra: Partial<ConRetencion> = {}): ConRetencion => ({
  id: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  texto: 'Que la salita abra de noche.',
  tipo: 'sueño',
  estado: 'enviada',
  tema: null,
  creadaEn: '2026-10-05T15:00:00.000Z',
  revision: '2026-10-05T15:00:00.000Z',
  cedeLicencia: true,
  precision: 'province',
  campanaId: null,
  campanaTitulo: null,
  edicion: null,
  ...extra,
});

const montar = (aportes: ConRetencion[]) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Router>
        <MisAportes aportes={aportes} total={aportes.length} />
      </Router>
    </QueryClientProvider>,
  );

describe('Mis aportes: un aporte que salió de Mirar', () => {
  it('por reportes, lo dice con la fecha y un lugar para discutirlo', () => {
    montar([aporte({ retenido: { origen: 'reportes', desde: '2026-10-18T12:00:00.000Z' } })]);
    const fila = screen.getByRole('listitem');
    expect(
      within(fila).getByText('Salió de Mirar por reportes de otras personas'),
    ).toBeInTheDocument();
    expect(within(fila).getByText(/18 de octubre de 2026/)).toBeInTheDocument();
    expect(within(fila).getByRole('link', { name: 'Lo que falta' })).toHaveAttribute(
      'href',
      '/lo-que-falta',
    );
  });

  it('por la coordinación, dice que lo retuvo la coordinación', () => {
    montar([aporte({ retenido: { origen: 'gestion', desde: '2026-10-19T12:00:00.000Z' } })]);
    expect(screen.getByText('Lo retuvo la coordinación')).toBeInTheDocument();
  });

  it('sin retención (o con una API que todavía no la manda) no dice nada', () => {
    montar([aporte(), aporte({ id: 'otro', retenido: null })]);
    expect(screen.queryByText(/Salió de Mirar/)).toBeNull();
    expect(screen.queryByText('Lo retuvo la coordinación')).toBeNull();
  });
});
