import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { adoptarSesion } from './sesion';
import { useAuth } from './use-auth';

import type { AuthenticatedUser } from './types';
import type { ReactNode } from 'react';

import { api } from '~/lib/api';
import { TwoFactorChallenge } from '~/pages/TwoFactorChallenge';

vi.mock('~/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  ApiError: class ApiError extends Error {},
}));
const cuenta = (id: number): AuthenticatedUser => ({
  id,
  username: `persona${id}`,
  name: `Persona ${id}`,
  email: `${id}@test.invalid`,
  location: null,
  bio: null,
  avatarUrl: null,
  emailVerified: true,
  onboardingCompleted: true,
  createdAt: '2026-10-08',
  esAdmin: false,
});
const privada = ['campanas', true];
function preparar() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  qc.setQueryData(['auth', 'me'], cuenta(1));
  qc.setQueryData(privada, [
    { contrato: { pregunta: 'Un borrador privado de la cuenta anterior.' } },
  ]);
  qc.setQueryData(['aporte-privado', 'a'], { texto: 'Texto reservado de la cuenta anterior.' });
  return {
    qc,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  };
}
afterEach(() => {
  vi.clearAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('Cambio de sesión sin arrastrar datos privados', () => {
  it.each(['login', 'register'] as const)(
    '%s limpia el catálogo privado de la cuenta anterior aun con caché infinita',
    async (operacion) => {
      const { qc, wrapper } = preparar();
      vi.mocked(api.post).mockResolvedValue({ user: cuenta(2), csrfToken: 'test' });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await act(async () => {
        if (operacion === 'login')
          await result.current.login.mutateAsync({
            identifier: 'persona2',
            password: 'solo-pruebas',
          });
        else
          await result.current.register.mutateAsync({
            username: 'persona2',
            name: 'Persona 2',
            email: '2@test.invalid',
            password: 'solo-pruebas',
          });
      });
      await waitFor(() => {
        expect(result.current.user?.id).toBe(2);
      });
      expect(qc.getQueryData(privada)).toBeUndefined();
      expect(qc.getQueryData(['aporte-privado', 'a'])).toBeUndefined();
    },
  );
  it('una lectura pendiente de la sesión anterior no vuelve a llenar el caché después del cambio', async () => {
    const { qc } = preparar();
    let resolver: ((v: string) => void) | undefined;
    const pendiente = new Promise<string>((resolve) => {
      resolver = resolve;
    });
    const pedido = qc
      .fetchQuery({ queryKey: ['campanas', 'borrador-anterior'], queryFn: () => pendiente })
      .catch(() => null);
    await adoptarSesion(qc, cuenta(2));
    resolver?.('Texto que pertenecía a la primera sesión.');
    await pedido;
    expect(qc.getQueryData(['campanas', 'borrador-anterior'])).toBeUndefined();
    expect(qc.getQueryData(['auth', 'me'])).toMatchObject({ id: 2 });
  });
  it('verificar el segundo factor usa el mismo límite de sesión antes de navegar', async () => {
    const { qc, wrapper } = preparar();
    window.history.replaceState(
      null,
      '',
      '/verificar-2fa?ticket=solo-pruebas&volver=%2Fmi-espacio',
    );
    vi.mocked(api.post).mockResolvedValue({ user: cuenta(2), csrfToken: 'test' });
    render(<TwoFactorChallenge />, { wrapper });
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verificar' }));
    await waitFor(() => {
      expect(qc.getQueryData(['auth', 'me'])).toMatchObject({ id: 2 });
    });
    expect(qc.getQueryData(privada)).toBeUndefined();
    expect(window.location.pathname).toBe('/mi-espacio');
  });
  it('salir también deja sin lecturas privadas el dispositivo compartido', async () => {
    const { qc } = preparar();
    await adoptarSesion(qc, null);
    expect(qc.getQueryData(['auth', 'me'])).toBeNull();
    expect(qc.getQueryData(privada)).toBeUndefined();
  });
});
