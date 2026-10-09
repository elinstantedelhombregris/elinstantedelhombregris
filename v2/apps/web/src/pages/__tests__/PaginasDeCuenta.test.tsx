import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ForgotPassword } from '../ForgotPassword';
import { Notifications } from '../Notifications';
import { PoliticaPrivacidad } from '../PoliticaPrivacidad';
import { ResetPassword } from '../ResetPassword';
import { VerifyEmail } from '../VerifyEmail';

import type { ReactNode } from 'react';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('~/lib/api', () => ({ api: { get: mocks.get, post: mocks.post } }));
vi.mock('~/lib/auth', () => ({
  readCsrfToken: () => 'csrf',
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function ir(ruta: string) {
  window.history.replaceState(null, '', ruta);
}
function conQuery(nodo: ReactNode) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={cliente}>{nodo}</QueryClientProvider>);
}
/** Ninguna página de cuenta conserva clases del tema oscuro de v1. */
function sinTemaOscuro(contenedor: HTMLElement) {
  expect(contenedor.innerHTML).not.toMatch(
    /glass|white\/|iris-violet|text-muted-foreground|font-serif|red-400|rounded-(?:2xl|xl|lg|full)/,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  ir('/');
});

describe('Recuperar contraseña (papel)', () => {
  it('el campo y el botón son de papel, y vuelve a «Ingresar»', () => {
    const { container } = render(<ForgotPassword />);
    expect(screen.getByRole('heading', { level: 1, name: 'Recuperar contraseña' })).toBeVisible();
    expect(screen.getByLabelText('Email')).toHaveClass('border-tinta', 'bg-papel-crudo');
    expect(screen.getByRole('button', { name: 'Enviar link' })).toHaveClass('bg-violeta');
    const volver = screen.getByRole('link', { name: '← Volver a ingresar' });
    expect(volver).toHaveAttribute('href', '/ingresar');
    expect(volver.className).toContain('hover:text-violeta');
    expect(container.textContent).not.toMatch(/Iniciar sesión|iniciar sesión/);
    sinTemaOscuro(container);
  });

  it('un email inválido se dice en el color de error del papel', async () => {
    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@ejemplo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Ingresá un email válido.');
    expect(alerta).toHaveClass('text-sello');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('al enviar avisa sin confirmar si el email tiene cuenta', async () => {
    mocks.post.mockResolvedValue({});
    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@ejemplo.org' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Si ese email tiene una cuenta/);
    expect(mocks.post).toHaveBeenCalledWith(
      '/api/auth/password/request-reset',
      { email: 'ana@ejemplo.org' },
      { csrfToken: 'csrf' },
    );
  });
});

describe('Crear contraseña nueva (papel)', () => {
  it('la regla de los 12 caracteres se ve antes de que falle', () => {
    ir('/restablecer-contrasena?token=abc');
    const { container } = render(<ResetPassword />);
    const campo = screen.getByLabelText('Contraseña nueva');
    expect(campo).toHaveClass('border-tinta', 'bg-papel-crudo');
    expect(campo).toHaveAccessibleDescription('Mínimo 12 caracteres.');
    sinTemaOscuro(container);
  });

  it('sin token en la dirección pide un link nuevo, en el error del papel', async () => {
    ir('/restablecer-contrasena');
    render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText('Contraseña nueva'), {
      target: { value: 'una-contraseña-larga' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Falta el token. Pedí un nuevo link de recuperación.');
    expect(alerta).toHaveClass('text-sello');
  });

  it('al guardar manda a ingresar, sin decir «iniciar sesión»', async () => {
    ir('/restablecer-contrasena?token=abc');
    mocks.post.mockResolvedValue({});
    const { container } = render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText('Contraseña nueva'), {
      target: { value: 'una-contraseña-larga' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Te llevamos a ingresar/);
    });
    expect(container.textContent).not.toMatch(/iniciar sesión/i);
  });
});

describe('Verificación de email (papel)', () => {
  it('con el token válido ofrece ir al inicio', async () => {
    ir('/verificar-email?token=abc');
    mocks.post.mockResolvedValue({});
    const { container } = render(<VerifyEmail />);
    expect(await screen.findByText('¡Listo! Tu email quedó verificado.')).toBeVisible();
    const ir_ = screen.getByRole('link', { name: 'Ir al inicio' });
    expect(ir_).toHaveAttribute('href', '/');
    expect(ir_).toHaveClass('bg-violeta');
    sinTemaOscuro(container);
  });

  it('sin token dice qué falta y vuelve a «Ingresar»', async () => {
    ir('/verificar-email');
    const { container } = render(<VerifyEmail />);
    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Falta el token. Pedí un nuevo email de verificación.');
    expect(alerta).toHaveClass('text-sello');
    expect(screen.getByRole('link', { name: 'Volver a ingresar' })).toHaveAttribute(
      'href',
      '/ingresar',
    );
    expect(container.textContent).not.toMatch(/Iniciar sesión/);
    expect(mocks.post).not.toHaveBeenCalled();
  });
});

describe('Política de privacidad (papel)', () => {
  it('lleva la prosa papel y no la del tema oscuro', () => {
    const { container } = render(<PoliticaPrivacidad />);
    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidad' })).toBeVisible();
    const prosa = container.querySelector('.prose');
    expect(prosa).not.toBeNull();
    expect(prosa?.className).toContain('prose-headings:font-anton');
    expect(prosa?.className).not.toContain('prose-invert');
    sinTemaOscuro(container);
  });
});

describe('Notificaciones (papel)', () => {
  const lista = {
    notifications: [
      {
        id: 1,
        kind: 'campana',
        title: 'Se abrió una campaña',
        body: 'Ya podés aportar.',
        href: '/campanas/agua',
        readAt: null,
        createdAt: '2026-10-01T12:00:00Z',
      },
      {
        id: 2,
        kind: 'ficha',
        title: 'Respondieron tu ficha',
        body: null,
        href: null,
        readAt: '2026-10-02T12:00:00Z',
        createdAt: '2026-10-01T10:00:00Z',
      },
    ],
  };

  it('las no leídas se marcan con violeta y el resto queda en el borde suave', async () => {
    mocks.get.mockResolvedValue(lista);
    const { container } = conQuery(<Notifications />);
    const sinLeer = (await screen.findByText('Se abrió una campaña')).closest('li');
    expect(sinLeer).toHaveClass('bg-papel-crudo', 'border-violeta');
    expect(screen.getByText('Respondieron tu ficha').closest('li')).toHaveClass(
      'border-papel-borde',
    );
    expect(screen.getByRole('link', { name: 'Se abrió una campaña' })).toHaveAttribute(
      'href',
      '/campanas/agua',
    );
    sinTemaOscuro(container);
  });

  it('«Marcar leída» avisa al servidor de esa notificación', async () => {
    mocks.get.mockResolvedValue(lista);
    mocks.post.mockResolvedValue({});
    conQuery(<Notifications />);
    fireEvent.click(await screen.findByRole('button', { name: 'Marcar leída' }));
    await waitFor(() => {
      expect(mocks.post).toHaveBeenCalledWith('/api/notifications/1/read', undefined, {
        csrfToken: 'csrf',
      });
    });
  });

  it('sin notificaciones lo dice, en el color de texto del papel', async () => {
    mocks.get.mockResolvedValue({ notifications: [] });
    conQuery(<Notifications />);
    expect(await screen.findByText(/Por ahora no tenés notificaciones/)).toHaveClass(
      'text-tinta-75',
    );
    expect(screen.queryByRole('button', { name: /Marcar todas/ })).toBeNull();
  });
});
