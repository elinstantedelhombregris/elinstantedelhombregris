import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { FormularioGestion } from '../Formulario';
import { ListaGestion } from '../Lista';

const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  error: null as Error | null,
  next: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('~/lib/queries/gestion-iniciativas', () => ({
  useGestionOperacion: () => ({ mutate: m.mutate, error: m.error, isPending: false }),
  useGestionLista: () => ({
    data: { pages: [{ items: [{ id: 1, titulo: 'Última lectura' }] }] },
    isError: true,
    isPending: false,
    isFetchNextPageError: true,
    hasNextPage: true,
    isFetching: false,
    fetchNextPage: m.next,
    refetch: m.refetch,
  }),
}));
describe('Formularios de gestión y recuperación', () => {
  beforeEach(() => {
    m.mutate.mockReset();
    m.error = null;
  });
  it('valida, conserva borrador y recibo al reintentar; una revisión externa exige reconocimiento explícito', () => {
    const props = {
      campos: [{ clave: 'nombre', etiqueta: 'Nombre' }],
      ruta: '/10',
      boton: 'Guardar',
      preparar: (
        v: Record<string, string | boolean>,
        r: { idLocal: string; revision?: number },
      ) => ({ ...r, nombre: z.string().min(5, 'Escribí un nombre más claro.').parse(v.nombre) }),
    };
    const { rerender } = render(<FormularioGestion {...props} revision={2} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(m.mutate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Escuchar familias' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    const recibo = m.mutate.mock.calls[0]?.[0] as { cuerpo: { idLocal: string } };
    m.error = new Error('No pudimos conectar. Reintentá.');
    rerender(<FormularioGestion {...props} revision={2} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Reintentá');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(m.mutate.mock.calls[1]?.[0]).toEqual(recibo);
    rerender(<FormularioGestion {...props} revision={3} />);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Escuchar familias');
    fireEvent.click(screen.getByRole('button', { name: 'Revisé la nueva versión' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(m.mutate.mock.calls[2]?.[0]).toMatchObject({ cuerpo: { revision: 3 } });
    expect(
      (m.mutate.mock.calls[2]?.[0] as { cuerpo: { idLocal: string } }).cuerpo.idLocal,
    ).not.toBe(recibo.cuerpo.idLocal);
  });
  it('conserva páginas anteriores y reintenta la página fallida sin convertir el fallo en vacío', () => {
    render(
      <ListaGestion<{ id: number; titulo: string }> ruta="/10/tareas">
        {(i) => <p key={i.id}>{i.titulo}</p>}
      </ListaGestion>,
    );
    expect(screen.getByText('Última lectura')).toBeInTheDocument();
    expect(screen.queryByText('Todavía no hay registros.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(m.next).toHaveBeenCalledOnce();
    expect(m.refetch).not.toHaveBeenCalled();
  });
});
