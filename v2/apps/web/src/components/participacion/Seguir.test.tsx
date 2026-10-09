import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Seguir } from './Seguir';

interface Modelo {
  user: { id: number } | null;
  seguimientos: { id: string; tipo: string; objeto: string }[];
  mutate: ReturnType<typeof vi.fn>;
  op: { isSuccess?: boolean; variables?: { metodo: string; ruta: string } };
}
const modelo = vi.hoisted(
  (): Modelo => ({ user: null, seguimientos: [], mutate: vi.fn(), op: {} }),
);
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: modelo.user }) }));
vi.mock('~/lib/queries/participacion', () => ({
  useMiEspacio: () => ({ data: { seguimientos: modelo.seguimientos }, isLoading: false }),
  useOperacionPersonal: () => ({ mutate: modelo.mutate, isPending: false, ...modelo.op }),
}));

beforeEach(() => {
  modelo.user = null;
  modelo.seguimientos = [];
  modelo.mutate.mockReset();
  modelo.op = {};
  window.history.replaceState(null, '', '/campanas/una-campana?edicion=2');
});
describe('Seguir', () => {
  it('quien no ingresó va a ingresar y vuelve a la campaña, no a Mi espacio', () => {
    render(<Seguir tipo="campana" objeto="c1" />);
    expect(screen.getByRole('link', { name: 'Ingresar para seguir esta campaña' })).toHaveAttribute(
      'href',
      `/ingresar?volver=${encodeURIComponent('/campanas/una-campana?edicion=2')}`,
    );
  });
  it.each([
    ['campana', 'Seguir esta campaña'],
    ['territorio', 'Seguir este lugar'],
    ['ficha', 'Seguir esta ficha'],
  ] as const)('el botón de «%s» dice «%s», no «este proceso»', (tipo, texto) => {
    modelo.user = { id: 1 };
    render(<Seguir tipo={tipo} objeto="x" />);
    fireEvent.click(screen.getByRole('button', { name: texto }));
    expect(modelo.mutate).toHaveBeenCalledWith({
      metodo: 'post',
      ruta: '/api/v1/mi-espacio/seguimientos',
      cuerpo: { tipo, objeto: 'x' },
    });
  });
  it('el botón toma las clases que le pase quien lo monta, para igualar el ancho de sus vecinos', () => {
    modelo.user = { id: 1 };
    render(<Seguir tipo="campana" objeto="c1" className="w-full" />);
    expect(screen.getByRole('button', { name: 'Seguir esta campaña' })).toHaveClass('w-full');
  });
  it('después de seguir avisa que ya la sigue y adónde le llegan las novedades', () => {
    modelo.user = { id: 1 };
    modelo.op = { isSuccess: true, variables: { metodo: 'post', ruta: '/x' } };
    render(<Seguir tipo="campana" objeto="c1" />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ya seguís esta campaña. Las novedades te llegan a Mi espacio.',
    );
    expect(screen.getByRole('link', { name: 'Mi espacio' })).toHaveAttribute('href', '/mi-espacio');
  });
  it('quien ya la seguía lo ve al abrir la página y puede dejar de seguir', () => {
    modelo.user = { id: 1 };
    modelo.seguimientos = [{ id: 's1', tipo: 'territorio', objeto: '7000' }];
    render(<Seguir tipo="territorio" objeto="7000" />);
    expect(screen.getByRole('status')).toHaveTextContent('Ya seguís este lugar.');
    fireEvent.click(screen.getByRole('button', { name: 'Dejar de seguir' }));
    expect(modelo.mutate).toHaveBeenCalledWith({
      metodo: 'delete',
      ruta: '/api/v1/mi-espacio/seguimientos/s1',
    });
  });
  it('al dejar de seguir lo confirma', () => {
    modelo.user = { id: 1 };
    modelo.op = { isSuccess: true, variables: { metodo: 'delete', ruta: '/x' } };
    render(<Seguir tipo="campana" objeto="c1" />);
    expect(screen.getByRole('status')).toHaveTextContent('Dejaste de seguir esta campaña.');
  });
});
