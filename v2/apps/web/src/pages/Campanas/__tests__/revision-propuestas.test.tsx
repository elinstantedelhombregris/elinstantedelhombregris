import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { RevisionPropuestas } from '../RevisionPropuestas';

import { contratoValido } from './fixtura-propuesta';

import type { CampanaParaRevisar } from '@v2/shared';

const m = vi.hoisted(() => ({
  user: null as { id: number; esAdmin: boolean } | null,
  revision: [] as unknown[],
  get: vi.fn(),
  escribir: vi.fn((..._args: unknown[]): Promise<unknown> => Promise.resolve({})),
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: m.user, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({ escribir: m.escribir }));
vi.mock('~/lib/api', () => ({ api: { get: m.get } }));

const propuesta: CampanaParaRevisar = {
  id: '5b0c1e7a-3f6d-4c2b-9a8e-1d2c3b4a5f60',
  slug: 'plazas-con-sombra',
  revision: 4,
  contrato: contratoValido,
  impulsadaPor: 'Vecinos por la Sombra',
  personas: 50,
  presentadaEn: '2026-10-20T15:00:00.000Z',
  aportesTraidos: [
    { id: 'a1', texto: 'Que la plaza tenga árboles grandes.', provincia: 'Salta' },
    { id: 'a2', texto: 'Bancos a la sombra para las abuelas.', provincia: null },
  ],
};
const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Router>
        <RevisionPropuestas />
      </Router>
    </QueryClientProvider>,
  );
const ESTADO = `/api/v1/campanas/${propuesta.id}/estado`;

beforeEach(() => {
  m.user = { id: 1, esAdmin: true };
  m.revision = [propuesta];
  m.get.mockReset();
  m.get.mockImplementation((ruta: string) =>
    Promise.resolve(ruta === '/api/v1/campanas/revision' ? m.revision : {}),
  );
  m.escribir.mockClear();
});

describe('Para revisar', () => {
  it('no es para quien no administra, y ni siquiera pide la lista', () => {
    m.user = { id: 7, esAdmin: false };
    const r = montar();
    expect(r.container).toBeEmptyDOMElement();
    expect(m.get).not.toHaveBeenCalledWith('/api/v1/campanas/revision');
  });
  it('muestra las reglas resumidas, quién la impulsa, las personas y lo que escribieron', async () => {
    montar();
    expect(await screen.findByRole('link', { name: 'Plazas con sombra en Salta' })).toHaveAttribute(
      'href',
      '/campanas/plazas-con-sombra',
    );
    expect(
      screen.getByText(/La impulsa Vecinos por la Sombra · trajo 50 personas nuevas/),
    ).toBeInTheDocument();
    expect(screen.getByText(contratoValido.pregunta)).toBeInTheDocument();
    expect(screen.getByText(contratoValido.usoDatos)).toBeInTheDocument();
    expect(screen.getByText('Para el 20 de diciembre de 2099')).toBeInTheDocument();
    const lista = screen.getByText(/Lo que escribieron las personas que trajo \(2\)/);
    expect(lista.closest('details')).not.toHaveAttribute('open');
    expect(screen.getByText(/«Que la plaza tenga árboles grandes\.»/)).toBeInTheDocument();
    expect(screen.getByText('Sin provincia')).toBeInTheDocument();
  });
  it('devolverla pide un motivo: sin motivo el botón dice qué falta y no hace nada', async () => {
    montar();
    const devolver = await screen.findByRole('button', { name: 'Devolver con un motivo' });
    expect(devolver).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByText(/Escribí el motivo para devolverla: faltan 10 caracteres/),
    ).toBeVisible();
    fireEvent.click(devolver);
    expect(m.escribir).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Motivo para devolverla/), {
      target: { value: 'Falta decir cómo se usan los datos.' },
    });
    expect(devolver).not.toHaveAttribute('aria-disabled');
    fireEvent.click(devolver);
    await waitFor(() => {
      expect(m.escribir).toHaveBeenCalledWith('post', ESTADO, {
        revision: 4,
        estado: 'reuniendo',
        motivo: 'Falta decir cómo se usan los datos.',
      });
    });
  });
  it('abrir y programar usan su estado con la revisión que se leyó', async () => {
    montar();
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
    await waitFor(() => {
      expect(m.escribir).toHaveBeenCalledWith(
        'post',
        ESTADO,
        expect.objectContaining({ revision: 4, estado: 'abierta' }),
      );
    });
    expect(
      await screen.findByText('«Plazas con sombra en Salta»: quedó abierta.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Programar' }));
    await waitFor(() => {
      expect(m.escribir).toHaveBeenCalledWith(
        'post',
        ESTADO,
        expect.objectContaining({ revision: 4, estado: 'programada' }),
      );
    });
  });
  it('sin campañas esperando, lo dice', async () => {
    m.revision = [];
    montar();
    expect(await screen.findByText('No hay campañas esperando revisión.')).toBeInTheDocument();
  });
});
