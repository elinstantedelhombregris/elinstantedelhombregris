import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Login } from '../Login';

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn() }));
vi.mock('~/lib/auth', () => ({
  useAuth: () => ({ login: { mutateAsync: mocks.mutateAsync } }),
}));

function ir(ruta: string) {
  window.history.replaceState(null, '', ruta);
}
function completar(identificador: string, contrasena: string) {
  fireEvent.change(screen.getByLabelText('Email o usuario'), { target: { value: identificador } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: contrasena } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('Ingresar (página papel)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ir('/ingresar');
  });

  it('dice «Ingresar» en el título y en el botón, y no mezcla otros verbos', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { level: 1, name: 'Ingresar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    expect(screen.queryByText(/Iniciá sesión|Iniciar sesión|Entrando|Crear una/)).toBeNull();
    expect(screen.getByText(/¿No tenés cuenta\?/)).toBeInTheDocument();
  });

  it('los campos y el botón son de papel, no del tema oscuro', () => {
    render(<Login />);
    for (const campo of [
      screen.getByLabelText('Email o usuario'),
      screen.getByLabelText('Contraseña'),
    ]) {
      expect(campo).toHaveClass('border-tinta', 'bg-papel-crudo');
      expect(campo.className).not.toMatch(/white\//);
    }
    const boton = screen.getByRole('button', { name: 'Ingresar' });
    expect(boton).toHaveClass('bg-violeta', 'uppercase');
    expect(boton.className).not.toMatch(/rounded/);
    expect(screen.getByRole('link', { name: '¿Olvidaste la contraseña?' }).className).toContain(
      'hover:text-violeta',
    );
  });

  it('la pestaña dice «Ingresar» y devuelve el título al salir', () => {
    document.title = 'antes';
    const { unmount } = render(<Login />);
    expect(document.title).toBe('Ingresar · ¡BASTA!');
    unmount();
    expect(document.title).toBe('antes');
  });

  it('«Crear mi cuenta» lleva el retorno a la página de registro', () => {
    ir('/ingresar?volver=%2Ffichas%2Fnueva');
    render(<Login />);
    expect(screen.getByRole('link', { name: 'Crear mi cuenta' })).toHaveAttribute(
      'href',
      '/registrarse?volver=%2Ffichas%2Fnueva',
    );
  });

  it('los errores de campo salen en el color de error del papel', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    const alerta = await screen.findByText('Ingresá tu email o usuario.');
    expect(alerta).toHaveClass('text-sello');
    expect(alerta.className).not.toContain('red-400');
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it('un rechazo del servidor se muestra como error de papel y no navega', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('Email o contraseña incorrectos.'));
    render(<Login />);
    completar('ana', 'x');
    const alerta = await screen.findByText('Email o contraseña incorrectos.');
    expect(alerta).toHaveClass('text-sello');
    expect(window.location.pathname).toBe('/ingresar');
  });

  it('al ingresar vuelve a donde estaba (volver)', async () => {
    ir('/ingresar?volver=%2Ffichas%2Fnueva%3Fsenal%3D1');
    mocks.mutateAsync.mockResolvedValue({ user: { id: 1 }, csrfToken: 't' });
    render(<Login />);
    completar('ana', 'clave-larga-de-prueba');
    await waitFor(() => {
      expect(window.location.pathname + window.location.search).toBe('/fichas/nueva?senal=1');
    });
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      identifier: 'ana',
      password: 'clave-larga-de-prueba',
    });
  });

  it('con segundo factor pasa al desafío conservando el retorno', async () => {
    ir('/ingresar?volver=%2Ffichas%2Fnueva');
    mocks.mutateAsync.mockResolvedValue({ needsTwoFactor: true, ticket: 'tk 1' });
    render(<Login />);
    completar('ana', 'clave-larga-de-prueba');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/2fa-desafio');
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get('ticket')).toBe('tk 1');
    expect(params.get('volver')).toBe('/fichas/nueva');
  });
});
