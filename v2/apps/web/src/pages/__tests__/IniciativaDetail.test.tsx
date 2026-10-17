import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IniciativaDetail } from '../IniciativaDetail';
import { iniciativa, permisos } from '../Iniciativas/__tests__/fixtures';

import type * as Wouter from 'wouter';

const m = vi.hoisted(() => ({
  miembro: false,
  propietario: false,
  error: null as Error | null,
  mutate: vi.fn(),
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 1 }, isLoading: false }) }));
vi.mock('~/lib/queries/gestion-iniciativas', () => ({
  useGestionLista: () => ({ data: { pages: [{ items: [] }] }, isPending: false }),
}));
vi.mock('~/lib/queries/iniciativas', () => ({
  useIniciativa: () => ({
    data: {
      iniciativa,
      permisos: { ...permisos, administrar: false, miembro: m.miembro, propietario: m.propietario },
    },
  }),
  useJoinIniciativa: () => ({ mutate: m.mutate, isPending: false, error: m.error }),
  useLeaveIniciativa: () => ({ mutate: m.mutate, isPending: false }),
}));
vi.mock('wouter', async (actual) => ({
  ...(await actual<typeof Wouter>()),
  useRoute: () => [true, { slug: 'escuela' }],
  useSearch: () => '',
}));

describe('Detalle de iniciativa', () => {
  beforeEach(() => {
    m.miembro = false;
    m.propietario = false;
    m.error = null;
    m.mutate.mockReset();
  });
  it('muestra el alcance y solo ofrece ingreso a quien no integra; hace visible el error', () => {
    const { rerender } = render(<IniciativaDetail />);
    expect(screen.getByRole('heading', { name: iniciativa.title })).toBeInTheDocument();
    expect(screen.getByText('3 cuentas integrantes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Salir/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sumarme al equipo' }));
    expect(m.mutate).toHaveBeenCalledWith(10, expect.any(Object));
    m.error = new Error('No pudimos registrar tu ingreso.');
    rerender(<IniciativaDetail />);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos registrar tu ingreso.');
  });
  it('la propiedad requiere transferencia antes de salir y el resto puede pedir su salida', () => {
    m.miembro = true;
    m.propietario = true;
    const { rerender } = render(<IniciativaDetail />);
    expect(screen.getByText(/primero transferí la propiedad/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Salir/ })).not.toBeInTheDocument();
    m.propietario = false;
    rerender(<IniciativaDetail />);
    expect(screen.getByRole('button', { name: 'Salir de la iniciativa' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sumarme al equipo' })).not.toBeInTheDocument();
  });
});
