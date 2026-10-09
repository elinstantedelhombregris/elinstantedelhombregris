import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RetirarAporte } from '../RetirarAporte';

const m = vi.hoisted(() => ({ user: null as null | { id: number }, mutate: vi.fn() }));

vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: m.user }) }));
vi.mock('~/lib/queries/senales', () => ({
  useRetirarSenal: () => ({ mutate: m.mutate, isPending: false, isError: false, error: null }),
}));

const ID = '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b';

beforeEach(() => {
  m.user = null;
  m.mutate.mockClear();
  window.history.replaceState(null, '', `/senal/${ID}`);
});
afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('Retirar un aporte propio', () => {
  it('sin cuenta explica qué pasa si se borran los datos del navegador y ofrece crearla, volviendo acá', () => {
    render(<RetirarAporte id={ID} />);

    expect(
      screen.getByText(
        /Si borrás los datos de este navegador antes de crear tu cuenta, no vamos a poder devolverte este aporte\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear mi cuenta' })).toHaveAttribute(
      'href',
      `/registrarse?volver=${encodeURIComponent(`/senal/${ID}`)}`,
    );
    expect(document.body.textContent).not.toMatch(/identificador|voz\b/);
  });

  it('con cuenta no dice que el navegador sabe quién lo escribió', () => {
    m.user = { id: 1 };
    render(<RetirarAporte id={ID} />);

    expect(screen.queryByText(/Este navegador sabe/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Crear mi cuenta' })).not.toBeInTheDocument();
  });

  it('pide confirmación antes de retirar y dice que lo descargado no se recupera', () => {
    render(<RetirarAporte id={ID} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retirar mi aporte' }));

    expect(m.mutate).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Lo que otras personas ya descargaron no se puede recuperar/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar retiro' }));
    expect(m.mutate).toHaveBeenCalledTimes(1);
  });

  it('«Mejor no» vuelve atrás sin retirar nada', () => {
    render(<RetirarAporte id={ID} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retirar mi aporte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mejor no' }));

    expect(screen.getByRole('button', { name: 'Retirar mi aporte' })).toBeInTheDocument();
    expect(m.mutate).not.toHaveBeenCalled();
  });
});
