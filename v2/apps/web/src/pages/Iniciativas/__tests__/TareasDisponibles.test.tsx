import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { TareasDisponibles } from '../TareasDisponibles';

const m = vi.hoisted(() => ({
  lista: vi.fn(),
  items: [] as unknown[],
  error: false,
  refetch: vi.fn(),
}));
vi.mock('~/lib/queries/gestion-iniciativas', () => ({
  useGestionLista: (ruta: string) => {
    m.lista(ruta);
    return {
      data: { pages: [{ items: m.items }] },
      isPending: false,
      isError: m.error,
      refetch: m.refetch,
    };
  },
}));
beforeEach(() => {
  m.items = [];
  m.error = false;
  m.lista.mockClear();
});
it('lee sin cuenta y conserva tarea, iniciativa y ficha en los destinos', () => {
  m.items = [
    {
      id: 7,
      titulo: 'Contrastar cinco horarios',
      alcance: 'Una hora de consulta de horarios públicos.',
      recursos: 'Planilla compartida',
      fecha: '2099-01-01',
      iniciativaSlug: 'escuela',
      iniciativaTitulo: 'Llegar a tiempo',
      fichaId: 'ficha',
      fichaTitulo: 'Llegar a tiempo a la escuela',
    },
  ];
  render(<TareasDisponibles fichaId="ficha" />);
  expect(screen.getByRole('link', { name: 'Ver tarea y cómo sumarme' })).toHaveAttribute(
    'href',
    '/iniciativas/escuela?seccion=tareas&tarea=7',
  );
  expect(screen.getByRole('link', { name: /Para qué lo hacemos/ })).toHaveAttribute(
    'href',
    '/fichas/ficha',
  );
  fireEvent.change(screen.getByLabelText('Buscar una tarea o iniciativa'), {
    target: { value: 'escuela' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar tareas' }));
  expect(m.lista).toHaveBeenLastCalledWith('/tareas-disponibles?buscar=escuela&fichaId=ficha');
});
it('distingue ausencia de tareas de un fallo de consulta', () => {
  const { rerender } = render(<TareasDisponibles />);
  expect(screen.getByText(/Todavía no hay tareas disponibles/)).toBeInTheDocument();
  m.error = true;
  rerender(<TareasDisponibles />);
  expect(screen.queryByText(/Todavía no hay tareas disponibles/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(m.refetch).toHaveBeenCalled();
});
