import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';


import { RegistroGoogle } from '../RegistroGoogle';

import type * as ApiModulo from '~/lib/api';
import type * as IngresoExternoModulo from '~/lib/queries/ingreso-externo';

import { ApiError } from '~/lib/api';

const m = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  adoptar: vi.fn(() => Promise.resolve()),
}));
vi.mock('~/lib/api', async (importar) => ({
  ...(await importar<typeof ApiModulo>()),
  api: { get: m.get, post: m.post },
}));
vi.mock('~/lib/auth/sesion', () => ({ adoptarSesion: m.adoptar }));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: null, isLoading: false }) }));
vi.mock('~/lib/queries/ingreso-externo', async (importar) => ({
  ...(await importar<typeof IngresoExternoModulo>()),
  useProveedores: () => ({ data: { google: true } }),
}));

function montar(ruta = '/registrarse/google?volver=%2Fcampanas') {
  window.history.replaceState(null, '', ruta);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <RegistroGoogle />
    </QueryClientProvider>,
  );
}

describe('Último paso (crear la cuenta con Google)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.get.mockResolvedValue({ correo: 'ana@gmail.com', sugerencia: 'ana' });
  });

  it('dice con qué cuenta de Google entró y propone un usuario libre', async () => {
    montar();
    expect(await screen.findByText('ana@gmail.com')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Usuario')).toHaveValue('ana');
    });
    expect(screen.getByText('Cómo querés que te llamemos. No se publica.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Contraseña')).toBeNull();
  });

  it('crea la cuenta con el usuario y el nombre, y vuelve a donde estaba', async () => {
    m.post.mockResolvedValue({
      user: { id: 9, username: 'ana' },
      csrfToken: 'x',
      volver: '/campanas',
    });
    montar();
    await waitFor(() => {
      expect(screen.getByLabelText('Usuario')).toHaveValue('ana');
    });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/campanas');
    });
    expect(m.post).toHaveBeenCalledWith('/api/auth/google/alta', { username: 'ana', name: 'Ana' });
    expect(m.adoptar).toHaveBeenCalled();
  });

  it('valida antes de mandar: sin nombre no manda nada', async () => {
    montar();
    await waitFor(() => {
      expect(screen.getByLabelText('Usuario')).toHaveValue('ana');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    });
    expect(m.post).not.toHaveBeenCalled();
  });

  it('un usuario tomado se dice en el campo', async () => {
    m.post.mockRejectedValue(
      new ApiError(409, 'USERNAME_TAKEN', 'Ese nombre de usuario ya está en uso.'),
    );
    montar();
    await waitFor(() => {
      expect(screen.getByLabelText('Usuario')).toHaveValue('ana');
    });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    expect(
      await screen.findByText('Ese nombre de usuario ya está en uso. Probá con otro.'),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/registrarse/google');
  });

  it('si pasó demasiado tiempo, lo dice y ofrece volver a entrar con Google', async () => {
    m.get.mockRejectedValue(new ApiError(401, 'ALTA_VENCIDA', 'Pasó demasiado tiempo.'));
    montar();
    expect(await screen.findByRole('alert')).toHaveTextContent('Pasó demasiado tiempo');
    expect(screen.getByRole('link', { name: 'Continuar con Google' })).toHaveAttribute(
      'href',
      '/api/auth/google?volver=%2Fcampanas',
    );
  });
});
