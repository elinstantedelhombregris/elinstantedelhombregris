import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { CampanaDetail } from '../../CampanaDetail';

import { campanaPropuesta } from './fixtura-propuesta';

import type * as Imagen from '../../MiArgentinaIdeal/comun/imagen-para-compartir';
import type { CampanaPublica } from '@v2/shared';

const m = vi.hoisted(() => ({
  detalle: null as CampanaPublica | null,
  user: null as { id: number; esAdmin: boolean } | null,
  escribir: vi.fn((..._args: unknown[]): Promise<unknown> => Promise.resolve({})),
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: m.user, isLoading: false }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useCampana: () => ({ data: m.detalle, isLoading: false, isError: false, error: null }),
  useEstadoCampana: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  escribir: m.escribir,
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ id: 66, name: 'Salta', level: 'province', provinceId: 66 }),
  },
}));
vi.mock('~/components/participacion/Seguir', () => ({
  Seguir: () => <button type="button">Seguir</button>,
}));
vi.mock('~/components/participacion/Equipo', () => ({ Equipo: () => <div>Equipo</div> }));
vi.mock('~/components/participacion/CompartirProceso', () => ({
  CompartirProceso: ({ href, titulo }: { href: string; titulo: string }) => (
    <a href={href}>{titulo}</a>
  ),
}));
vi.mock('../../MiArgentinaIdeal/comun/imagen-para-compartir', async (importar) => {
  const real = await importar<typeof Imagen>();
  return { ...real, dibujarPapelito: vi.fn(() => Promise.resolve()) };
});

const abrir = (c: CampanaPublica) => {
  m.detalle = c;
  window.history.replaceState(null, '', `/campanas/${c.slug}`);
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Router>
        <CampanaDetail />
      </Router>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  m.detalle = null;
  m.user = null;
  m.escribir.mockReset();
  m.escribir.mockResolvedValue({});
});

describe('Una campaña que junta gente', () => {
  it('arriba: la pregunta, quién la impulsa, para qué y la barra', () => {
    abrir(campanaPropuesta());
    expect(screen.getByText(/¿Qué tendría que pasar para que tu plaza/)).toBeInTheDocument();
    expect(screen.getByText('La impulsa')).toBeInTheDocument();
    expect(screen.getAllByText('Vecinos por la Sombra').length).toBeGreaterThan(0);
    expect(screen.getByText('Para qué')).toBeInTheDocument();
    expect(
      screen.getByText('Para abrirse, esta campaña necesita 50 personas nuevas. Lleva 18.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '18');
    // El propósito no se repite más abajo, y no hay fichas ni devolución que mirar todavía.
    expect(screen.queryByText('Para qué abrimos esta campaña')).not.toBeInTheDocument();
    expect(screen.queryByText('Seguir construyendo esta campaña')).not.toBeInTheDocument();
    expect(screen.queryByText('Lo que llegó hasta ahora')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sumar mi aporte' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compartir esta campaña' })).toHaveAttribute(
      'href',
      '/campanas/plazas-con-sombra',
    );
  });
  it('«Sumate» marca la llegada y lleva a imaginar', async () => {
    abrir(campanaPropuesta());
    fireEvent.click(screen.getByRole('button', { name: 'Sumate: contá tu Argentina ideal' }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/mi-argentina-ideal/imaginar');
    });
    expect(m.escribir).toHaveBeenCalledWith('post', '/api/v1/campanas/plazas-con-sombra/llegada');
  });
  it('si la llegada falla, igual lleva a imaginar', async () => {
    m.escribir.mockRejectedValue(new Error('Sin conexión.'));
    abrir(campanaPropuesta());
    fireEvent.click(screen.getByRole('button', { name: 'Sumate: contá tu Argentina ideal' }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/mi-argentina-ideal/imaginar');
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('compartirla y retirarla es sólo para quien la impulsa', () => {
    const r = abrir(campanaPropuesta());
    expect(screen.queryByRole('button', { name: 'Compartí esta campaña' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Retirarla para corregir' }),
    ).not.toBeInTheDocument();
    r.unmount();
    m.user = { id: 7, esAdmin: false };
    abrir(campanaPropuesta({ impulsadaPorMi: true, puedoEditar: true }));
    expect(screen.getByRole('button', { name: 'Compartí esta campaña' })).toBeInTheDocument();
    expect(
      screen.getByText('Te faltan 32 personas nuevas para que pase a revisión.'),
    ).toBeInTheDocument();
    // Quien la impulsa no se suma a sí misma, y no ve dos formas de compartir.
    expect(
      screen.queryByRole('button', { name: 'Sumate: contá tu Argentina ideal' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Compartir esta campaña' })).not.toBeInTheDocument();
  });
  it('retirarla para corregir pide confirmación y la vuelve a borrador', async () => {
    m.user = { id: 7, esAdmin: false };
    abrir(campanaPropuesta({ impulsadaPorMi: true, puedoEditar: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Retirarla para corregir' }));
    expect(m.escribir).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sí, retirarla' }));
    await waitFor(() => {
      expect(m.escribir).toHaveBeenCalledWith(
        'post',
        '/api/v1/campanas/5b0c1e7a-3f6d-4c2b-9a8e-1d2c3b4a5f60/estado',
        expect.objectContaining({ revision: 3, estado: 'borrador' }),
      );
    });
  });
  it('a quien la impulsa le muestra el motivo si la coordinación se la devolvió', () => {
    m.user = { id: 7, esAdmin: false };
    abrir(
      campanaPropuesta({
        impulsadaPorMi: true,
        historial: [
          { revision: 2, estado: 'por_revisar', motivo: 'Llegó a 50.', fecha: '' },
          { revision: 3, estado: 'reuniendo', motivo: 'Falta la fecha de devolución.', fecha: '' },
        ],
      }),
    );
    expect(
      screen.getByText('La coordinación te la devolvió con este motivo:').parentElement,
    ).toHaveTextContent(
      'La coordinación te la devolvió con este motivo: Falta la fecha de devolución.',
    );
  });
  it('en revisión: el aviso y la barra completa, sin «Sumate»', () => {
    abrir(campanaPropuesta({ estado: 'por_revisar', impulso: { personas: 50, umbral: 50 } }));
    expect(screen.getByLabelText('Estado de la campaña')).toHaveTextContent(
      'Esta campaña ya juntó la gente que necesitaba: está en revisión.',
    );
    expect(
      screen.getByText('Ya trajo las 50 personas nuevas que necesitaba para abrirse.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(
      screen.queryByRole('button', { name: 'Sumate: contá tu Argentina ideal' }),
    ).not.toBeInTheDocument();
  });
  it('el borrador de quien la propuso se presenta desde su página', async () => {
    m.user = { id: 7, esAdmin: false };
    abrir(campanaPropuesta({ estado: 'borrador', puedoEditar: true, impulso: null }));
    expect(screen.getByLabelText('Estado de la campaña')).toHaveTextContent(
      'presentala para empezar a juntar gente',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Presentar mi campaña' }));
    await waitFor(() => {
      expect(m.escribir).toHaveBeenCalledWith(
        'post',
        '/api/v1/campanas/5b0c1e7a-3f6d-4c2b-9a8e-1d2c3b4a5f60/estado',
        expect.objectContaining({ revision: 3, estado: 'reuniendo' }),
      );
    });
  });
});
