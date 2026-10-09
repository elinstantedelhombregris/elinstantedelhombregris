import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TwoFactorChallenge } from '../TwoFactorChallenge';

import type { ReactNode } from 'react';

import { api } from '~/lib/api';

vi.mock('~/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
  ApiError: class ApiError extends Error {},
}));

function renderizar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return render(<TwoFactorChallenge />, { wrapper });
}
function ir(ruta: string) {
  window.history.replaceState(null, '', ruta);
}
function enviar(codigo: string) {
  fireEvent.change(screen.getByLabelText('Código'), { target: { value: codigo } });
  fireEvent.click(screen.getByRole('button', { name: 'Verificar' }));
}

describe('Verificación en dos pasos (página papel)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ir('/2fa-desafio?ticket=tk&volver=%2Ffichas%2Fnueva');
  });

  it('el campo es de papel y deja tipear códigos de respaldo alfanuméricos', () => {
    renderizar();
    const campo = screen.getByLabelText('Código');
    expect(campo).toHaveAttribute('inputmode', 'text');
    expect(campo).toHaveClass('border-tinta', 'bg-papel-crudo');
    expect(screen.getByRole('button', { name: 'Verificar' })).toHaveClass('bg-violeta');
    expect(screen.queryByText('Volver a ingresar')).toBeNull();
  });

  it('un código corto falla con error de papel y ofrece volver a ingresar sin perder el retorno', () => {
    renderizar();
    enviar('123');
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('El código tiene al menos 6 caracteres.');
    expect(alerta).toHaveClass('text-sello');
    expect(screen.getByRole('link', { name: 'Volver a ingresar' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Ffichas%2Fnueva',
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it('sin ticket pide volver a ingresar', () => {
    ir('/2fa-desafio');
    renderizar();
    enviar('123456');
    expect(screen.getByRole('alert')).toHaveTextContent('Falta el ticket.');
    expect(screen.getByRole('link', { name: 'Volver a ingresar' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fmi-espacio',
    );
  });

  it('un código de respaldo con guion viaja tal cual al servidor', async () => {
    vi.mocked(api.post).mockResolvedValue({
      user: { id: 1, username: 'ana' },
      csrfToken: 'c',
    });
    renderizar();
    enviar('A1B2C-3D4E5');
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/auth/2fa/verify',
        { ticket: 'tk', code: 'A1B2C-3D4E5' },
        expect.anything(),
      );
    });
  });

  it('si el servidor rechaza el código también ofrece volver a ingresar', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Código inválido.'));
    renderizar();
    enviar('123456');
    expect(await screen.findByText('Código inválido.')).toHaveClass('text-sello');
    expect(screen.getByRole('link', { name: 'Volver a ingresar' })).toBeInTheDocument();
  });
});
