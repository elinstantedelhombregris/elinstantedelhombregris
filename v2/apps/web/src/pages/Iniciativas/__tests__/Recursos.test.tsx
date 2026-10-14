import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecursosTareaPanel } from '../Recursos';

import { tarea } from './fixtures';

import type { RecursoTarea } from '@v2/shared';

const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetch: vi.fn(),
  error: false,
  items: [] as RecursoTarea[],
}));
vi.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => ({
    data: { pages: [{ items: m.items }] },
    isPending: false,
    isError: m.error,
    refetch: m.refetch,
  }),
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 7 } }) }));
vi.mock('~/lib/queries/gestion-iniciativas', () => ({
  useGestionOperacion: () => ({ mutate: m.mutate, isPending: false }),
}));
describe('Recursos acordados en una tarea', () => {
  beforeEach(() => {
    m.items = [];
    m.error = false;
    m.mutate.mockReset();
  });
  it('distingue falla de lectura de ausencia y no afirma un total del equipo', () => {
    m.error = true;
    render(<RecursosTareaPanel id={10} t={tarea} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos actualizar');
    expect(
      screen.queryByText('No tenés reservas vinculadas a esta tarea.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Otros integrantes pueden tener reservas/)).toBeInTheDocument();
  });
  it('muestra recepción parcial y desvincula con revisiones sin cancelar la reserva', () => {
    m.items = [
      {
        id: 'b98d29cc-15fe-46e9-8e4b-b12f6de60014',
        capacidadId: 'b98d29cc-15fe-46e9-8e4b-b12f6de60015',
        titulo: 'Sala para conversar',
        unidad: 'horas',
        cantidad: 6,
        cantidadDeclarada: 4,
        paraFecha: '2026-10-01',
        estado: 'entregada',
        revision: 4,
        fichaId: 'b98d29cc-15fe-46e9-8e4b-b12f6de60016',
        tareaId: tarea.id,
        soySolicitante: true,
      },
    ];
    render(<RecursosTareaPanel id={10} t={tarea} />);
    expect(screen.getByText('Recepción confirmada: 4 horas.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desvincular de esta tarea' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        cuerpo: expect.objectContaining({
          accion: 'desvincular',
          revisionReserva: 4,
          revisionTarea: tarea.revision,
        }) as unknown,
      }),
      expect.any(Object),
    );
  });
});
