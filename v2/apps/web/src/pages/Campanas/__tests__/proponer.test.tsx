import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';

import { ProponerCampana } from '../Proponer';

import { campanaPropuesta } from './fixtura-propuesta';

import type { CampanaPublica } from '@v2/shared';
import type { ReactNode } from 'react';

const m = vi.hoisted(() => ({
  user: null as null | { id: number; email: string; emailVerified: boolean; esAdmin: boolean },
  tuyas: [] as unknown[],
  detalle: null as CampanaPublica | null,
  escribir: vi.fn((..._args: unknown[]) => Promise.resolve({})),
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: m.user, isLoading: false }),
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: (ruta: string) => {
      if (ruta === '/api/v1/campanas?mias=1') return Promise.resolve(m.tuyas);
      if (ruta.startsWith('/api/v1/campanas/')) return Promise.resolve(m.detalle);
      return Promise.resolve({});
    },
  },
}));
vi.mock('~/lib/queries/participacion', () => ({ escribir: m.escribir }));
// El formulario tiene sus propias pruebas: acá sólo importa qué hace Proponer con su resultado.
vi.mock('../Formulario', () => ({
  FormularioCampana: ({
    nota,
    alGuardar,
    alFallar,
  }: {
    nota?: ReactNode;
    alGuardar?: (id: string) => void;
    alFallar?: (e: Error) => void;
  }) => (
    <div>
      {nota}
      <button type="button" onClick={() => alGuardar?.('5b0c1e7a-3f6d-4c2b-9a8e-1d2c3b4a5f60')}>
        Guardar borrador de campaña
      </button>
      <button
        type="button"
        onClick={() =>
          alFallar?.(
            Object.assign(new Error('Ya tenés una campaña juntando gente.'), {
              status: 409,
              code: 'PROPUESTA_ACTIVA',
            }),
          )
        }
      >
        Guardar y chocar
      </button>
    </div>
  ),
}));

const sesion = (emailVerified = true) => ({
  id: 7,
  email: 'ana@example.com',
  emailVerified,
  esAdmin: false,
});
const montar = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Router>
        <ProponerCampana />
      </Router>
    </QueryClientProvider>,
  );

beforeEach(() => {
  m.user = null;
  m.tuyas = [];
  m.detalle = null;
  m.escribir.mockClear();
  window.history.replaceState(null, '', '/campanas/proponer');
});

describe('Proponer una campaña', () => {
  it('sin sesión invita a ingresar y vuelve a proponer', () => {
    montar();
    expect(screen.getByText('Ingresá para proponer una campaña.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fcampanas%2Fproponer',
    );
    expect(screen.getByRole('link', { name: 'Crear una cuenta' })).toHaveAttribute(
      'href',
      '/registrarse?volver=%2Fcampanas%2Fproponer',
    );
    expect(
      screen.queryByRole('button', { name: 'Guardar borrador de campaña' }),
    ).not.toBeInTheDocument();
  });
  it('con el correo sin verificar dice por qué y cómo verificarlo, sin formulario', () => {
    m.user = sesion(false);
    montar();
    expect(screen.getByText(/primero verificá tu correo/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reenviar correo' }));
    expect(m.escribir).toHaveBeenCalledWith('post', '/api/auth/email/send-verification', {
      email: 'ana@example.com',
    });
    expect(
      screen.queryByRole('button', { name: 'Guardar borrador de campaña' }),
    ).not.toBeInTheDocument();
  });
  it('con sesión explica el paso previo y muestra las reglas de la campaña', async () => {
    m.user = sesion();
    montar();
    expect(
      screen.getByText(
        'Para abrirse, tu campaña tiene que traer 50 personas nuevas a imaginar el país. Cada persona que trae tu campaña suma a la visión de todos.',
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Guardar borrador de campaña' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/después la presentás para empezar a juntar gente/),
    ).toBeInTheDocument();
  });
  it('al guardar ofrece presentarla, la pasa a juntar gente y lleva a su página', async () => {
    m.user = sesion();
    const guardada: CampanaPublica = campanaPropuesta({
      estado: 'borrador',
      revision: 1,
      puedoEditar: true,
    });
    m.detalle = guardada;
    montar();
    fireEvent.click(await screen.findByRole('button', { name: 'Guardar borrador de campaña' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Presentar mi campaña' }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/campanas/plazas-con-sombra');
    });
    expect(m.escribir).toHaveBeenCalledWith(
      'post',
      `/api/v1/campanas/${guardada.id}/estado`,
      expect.objectContaining({ revision: 1, estado: 'reuniendo' }),
    );
  });
  it('si ya tiene una campaña juntando gente, lo dice y enlaza a esa', async () => {
    m.user = sesion();
    m.tuyas = [campanaPropuesta()];
    montar();
    expect(await screen.findByText('Ya tenés una campaña propuesta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver tu campaña' })).toHaveAttribute(
      'href',
      '/campanas/plazas-con-sombra',
    );
    expect(
      screen.queryByRole('button', { name: 'Guardar borrador de campaña' }),
    ).not.toBeInTheDocument();
  });
  it('con el 409 del servidor lo dice y enlaza, sin perder el formulario', async () => {
    m.user = sesion();
    montar();
    const chocar = await screen.findByRole('button', { name: 'Guardar y chocar' });
    // El servidor ya la conoce, aunque la lista de campañas propias se leyó antes de que existiera.
    m.tuyas = [campanaPropuesta()];
    fireEvent.click(chocar);
    expect(await screen.findByText('Ya tenés una campaña propuesta')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Ver tu campaña' })).toHaveAttribute(
      'href',
      '/campanas/plazas-con-sombra',
    );
    expect(screen.getByRole('button', { name: 'Guardar borrador de campaña' })).toBeInTheDocument();
  });
  it('con el 409 y sin saber cuál es, manda a Mi espacio', async () => {
    m.user = sesion();
    montar();
    fireEvent.click(await screen.findByRole('button', { name: 'Guardar y chocar' }));
    expect(
      await screen.findByRole('link', { name: 'Ver tus campañas en Mi espacio' }),
    ).toHaveAttribute('href', '/mi-espacio');
  });
});
