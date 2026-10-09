import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { passwordSchema } from '@v2/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Register } from '../Register';

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn() }));
vi.mock('~/lib/auth', () => ({
  useAuth: () => ({ register: { mutateAsync: mocks.mutateAsync } }),
}));

function ir(ruta: string) {
  window.history.replaceState(null, '', ruta);
}
function completar(contrasena: string) {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'ana_1' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@ejemplo.org' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: contrasena } });
  fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
}

describe('Crear mi cuenta (página papel)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ir('/registrarse');
  });

  it('promete lo que la cuenta hace y lo que no exige', () => {
    render(<Register />);
    expect(screen.getByRole('heading', { level: 1, name: 'Crear mi cuenta' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Con una cuenta, tus aportes te siguen a cualquier dispositivo. Para participar no hace falta, y tu nombre no se publica.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear mi cuenta' })).toBeInTheDocument();
    expect(screen.queryByText(/Iniciar sesión|Crear cuenta\b/)).toBeNull();
  });

  it('el enlace a ingresar dice «Ingresar» y conserva el retorno', () => {
    ir('/registrarse?volver=%2Ffichas%2Fnueva');
    render(<Register />);
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Ffichas%2Fnueva',
    );
  });

  it('muestra la regla de la contraseña antes de que falle, con el mínimo del esquema compartido', () => {
    render(<Register />);
    const minimo = passwordSchema.minLength;
    expect(minimo).not.toBeNull();
    const campo = screen.getByLabelText('Contraseña');
    expect(campo).toHaveAccessibleDescription(`Mínimo ${String(minimo)} caracteres.`);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('los campos y el botón son de papel', () => {
    render(<Register />);
    for (const etiqueta of ['Nombre', 'Usuario', 'Email', 'Contraseña'])
      expect(screen.getByLabelText(etiqueta)).toHaveClass('border-tinta', 'bg-papel-crudo');
    expect(screen.getByRole('button', { name: 'Crear mi cuenta' })).toHaveClass('bg-violeta');
  });

  it('una contraseña corta falla en el color de error del papel y la regla sigue a la vista', async () => {
    render(<Register />);
    completar('corta');
    const alerta = await screen.findByText(
      new RegExp(`al menos ${String(passwordSchema.minLength)} caracteres`),
      { selector: '[role="alert"]' },
    );
    expect(alerta).toHaveClass('text-sello');
    expect(screen.getByLabelText('Contraseña')).toHaveAccessibleDescription(
      new RegExp(`Mínimo ${String(passwordSchema.minLength)} caracteres`),
    );
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it('con datos válidos crea la cuenta y vuelve a donde estaba', async () => {
    ir('/registrarse?volver=%2Ffichas%2Fnueva');
    mocks.mutateAsync.mockResolvedValue({ user: { id: 1 } });
    render(<Register />);
    completar('una-clave-bastante-larga');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/fichas/nueva');
    });
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      name: 'Ana',
      username: 'ana_1',
      email: 'ana@ejemplo.org',
      password: 'una-clave-bastante-larga',
    });
  });

  it('si el servidor rechaza, lo dice en el error de papel', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('Ese usuario ya existe.'));
    render(<Register />);
    completar('una-clave-bastante-larga');
    expect(await screen.findByText('Ese usuario ya existe.')).toHaveClass('text-sello');
  });
});
