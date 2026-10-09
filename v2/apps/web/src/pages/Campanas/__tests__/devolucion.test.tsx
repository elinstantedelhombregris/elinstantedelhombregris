import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Devolucion } from '../Devolucion';
import { RevisarDevolucion } from '../RevisarDevolucion';

import type { CampanaPublica } from '@v2/shared';

const modelo = vi.hoisted(() => ({
  user: null as { id: number } | null,
  escribir: vi.fn(),
  get: vi.fn(),
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: modelo.user, isLoading: false }),
}));
vi.mock('~/lib/api', () => ({ api: { get: modelo.get } }));
vi.mock('~/lib/queries/participacion', () => ({ escribir: modelo.escribir }));

const id = '3718dc73-9774-4d3b-b23d-8bf290ffec30';
const campana = (cambios: Partial<CampanaPublica> = {}): CampanaPublica =>
  ({
    id,
    slug: 'una-campana',
    revision: 2,
    estado: 'abierta',
    puedoEditar: true,
    devoluciones: [],
    historial: [],
    contrato: { fechaDevolucion: '2026-11-10' },
    ...cambios,
  }) as CampanaPublica;
const montar = (ui: React.ReactNode) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
const LECTURA = 'Escuchamos deseos diferentes para aprender en comunidad con tiempo para cuidar.';

beforeEach(() => {
  vi.clearAllMocks();
  modelo.user = null;
  modelo.get.mockResolvedValue([]);
  modelo.escribir.mockResolvedValue({});
  window.history.replaceState(null, '', '/campanas/una-campana');
});
describe('Publicar la devolución', () => {
  it('es el bloque al que lleva /devolucion y dice cuándo se espera', () => {
    const { container } = montar(<Devolucion campana={campana({ puedoEditar: false })} />);
    expect(container.querySelector('section#devolucion')).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'La devolución' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'La devolución está prevista para el 10 de noviembre de 2026. Todavía no fue publicada.',
      ),
    ).toBeInTheDocument();
  });
  it('el botón dice qué falta en el texto antes de poder publicar', () => {
    montar(<Devolucion campana={campana()} />);
    const publicar = screen.getByRole('button', { name: 'Publicar devolución' });
    expect(publicar).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(/Faltan 30 caracteres en la lectura del equipo/)).toBeVisible();
    fireEvent.change(screen.getByLabelText('Lectura del equipo'), { target: { value: LECTURA } });
    expect(screen.getByText(/Faltan 15 caracteres en lo que falta/)).toBeVisible();
    fireEvent.change(screen.getByLabelText('Qué falta y hasta dónde llega esta lectura'), {
      target: { value: 'Describe la prueba, no al país.' },
    });
    expect(publicar).not.toHaveAttribute('aria-disabled');
  });
  it('al publicar confirma que ya se puede leer y vacía el formulario', async () => {
    montar(<Devolucion campana={campana()} />);
    fireEvent.change(screen.getByLabelText('Lectura del equipo'), { target: { value: LECTURA } });
    fireEvent.change(screen.getByLabelText('Qué falta y hasta dónde llega esta lectura'), {
      target: { value: 'Describe la prueba, no al país.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar devolución' }));
    expect(
      await screen.findByText(
        'Publicamos la devolución. Ya la puede leer cualquiera en esta página.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Lectura del equipo')).toHaveValue('');
  });
  it('cada fuente tiene su propio texto de enlace, sin repetir el mismo', () => {
    const otra = '5b0b6f0e-1e0e-4c2b-9d3e-b7f1c0e0a111';
    montar(
      <Devolucion
        campana={campana({
          puedoEditar: false,
          devoluciones: [
            {
              id: 'd1',
              edicion: 2,
              fecha: '2026-10-09T15:00:00.000Z',
              texto: 'Texto.',
              limites: 'Límites.',
              senales: [id, otra],
            },
          ],
        })}
      />,
    );
    const enlaces = screen.getAllByRole('link', { name: /^Fuente \d/ });
    expect(enlaces.map((e) => e.textContent)).toEqual([
      'Fuente 1: ver su origen y estado',
      'Fuente 2: ver su origen y estado',
    ]);
    expect(screen.getByText('Edición 2 · 9 de octubre de 2026')).toBeInTheDocument();
  });
});
describe('Pedir una revisión de la devolución', () => {
  it('quien no ingresó ve una invitación a ingresar que vuelve a esta página, no un hueco', () => {
    window.history.replaceState(null, '', '/campanas/una-campana?edicion=2#devolucion');
    montar(<RevisarDevolucion id={id} responsable={false} />);
    expect(screen.queryByLabelText('Qué entendieron distinto o qué falta')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      `/ingresar?volver=${encodeURIComponent('/campanas/una-campana?edicion=2#devolucion')}`,
    );
  });
  it('el botón dice qué falta y al enviar confirma que el pedido quedó publicado', async () => {
    modelo.user = { id: 1 };
    montar(<RevisarDevolucion id={id} responsable={false} />);
    const pedir = screen.getByRole('button', { name: 'Pedir una revisión' });
    expect(screen.getByText(/Faltan 15 caracteres/)).toBeVisible();
    fireEvent.change(screen.getByLabelText('Qué entendieron distinto o qué falta'), {
      target: { value: 'Falta el tiempo de cuidar y aprender.' },
    });
    expect(screen.getByText(/Marcá la casilla para autorizar/)).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(pedir);
    await waitFor(() => {
      expect(modelo.escribir).toHaveBeenCalledWith(
        'post',
        `/api/v1/equipo/campanas/${id}/revisiones`,
        expect.objectContaining({ aceptaPublicar: true }),
      );
    });
    expect(
      await screen.findByText(
        'Tu pedido de revisión quedó publicado. El equipo va a responder acá.',
      ),
    ).toBeInTheDocument();
  });
  it('el equipo responde a cada pedido de revisión', async () => {
    modelo.user = { id: 1 };
    modelo.get.mockResolvedValue([{ id: 'r1', texto: 'Falta algo.', respuesta: null, fecha: '' }]);
    montar(<RevisarDevolucion id={id} responsable />);
    expect(await screen.findByLabelText('Cómo incorporamos esta revisión')).toBeInTheDocument();
  });
});
