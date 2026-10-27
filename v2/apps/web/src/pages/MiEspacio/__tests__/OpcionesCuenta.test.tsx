import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OpcionesCuenta } from '../OpcionesCuenta';

const m = vi.hoisted(() => ({
  ingreso: {
    tieneContrasena: false,
    identidades: [
      { proveedor: 'google', correo: 'ana@gmail.com', creadaEn: '2026-10-27T10:00:00Z' },
    ],
  },
  escribir: vi.fn(() => Promise.resolve({ cerrada: true })),
}));
vi.mock('~/lib/api', () => ({
  api: {
    get: (ruta: string) =>
      Promise.resolve(ruta.endsWith('/ingreso') ? m.ingreso : { avisos: true }),
  },
}));
vi.mock('~/lib/queries/participacion', () => ({ escribir: m.escribir }));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 3 }, isLoading: false }) }));

function montar(ruta = '/mi-espacio?pestana=cuenta') {
  window.history.replaceState(null, '', ruta);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <OpcionesCuenta salir={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe('Cerrar la cuenta sin contraseña', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.ingreso.tieneContrasena = false;
  });

  it('dice con qué entra la cuenta', async () => {
    montar();
    expect(await screen.findByText('Entrás con Google (ana@gmail.com).')).toBeInTheDocument();
  });

  it('en vez de la contraseña pide confirmar con Google, y vuelve a esta pestaña', async () => {
    montar();
    await screen.findByText(/Entrás con Google/);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar mi cuenta' }));
    expect(screen.queryByLabelText('Contraseña actual')).toBeNull();
    expect(screen.getByRole('link', { name: 'Confirmar con Google' })).toHaveAttribute(
      'href',
      '/api/auth/google?volver=%2Fmi-espacio%3Fpestana%3Dcuenta&para=confirmar',
    );
    fireEvent.change(screen.getByLabelText('Escribí CERRAR MI CUENTA'), {
      target: { value: 'CERRAR MI CUENTA' },
    });
    expect(
      screen.getByRole('button', { name: 'Cerrar mi cuenta y revocar sesiones' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('confirmada con Google, el formulario abre solo y cierra sin contraseña', async () => {
    montar('/mi-espacio?pestana=cuenta&confirmado=google');
    expect(await screen.findByText(/Confirmaste con Google que sos vos/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Escribí CERRAR MI CUENTA'), {
      target: { value: 'CERRAR MI CUENTA' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar mi cuenta y revocar sesiones' }));
    await waitFor(() => {
      expect(m.escribir).toHaveBeenCalledWith('post', '/api/v1/mi-espacio/cerrar-cuenta', {
        confirma: 'CERRAR MI CUENTA',
      });
    });
  });

  it('si en Google eligió otra cuenta, lo dice al volver', async () => {
    montar('/mi-espacio?pestana=cuenta&error=google_otra_cuenta');
    expect(await screen.findByRole('alert')).toHaveTextContent('no es la de esta sesión');
  });

  it('con contraseña, sigue pidiendo la contraseña', async () => {
    m.ingreso.tieneContrasena = true;
    montar();
    await screen.findByText('Entrás con Google (ana@gmail.com) y con tu contraseña.');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar mi cuenta' }));
    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Confirmar con Google' })).toBeNull();
  });
});
