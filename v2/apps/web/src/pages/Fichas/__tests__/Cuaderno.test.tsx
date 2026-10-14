import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Cuaderno } from '../cuaderno/Cuaderno';
import { FormularioFuente, LeerFuente } from '../cuaderno/Fuentes';
import { FormularioObjetivo } from '../cuaderno/Objetivos';

import { ficha, fuente, objetivo } from './cuaderno-fixtures';

const m = vi.hoisted(() => ({ guardar: vi.fn(), hook: vi.fn(), error: null as Error | null }));
vi.mock('~/lib/queries/fichas', () => ({
  useGuardarFicha: (id: string, revision: number) => {
    m.hook(id, revision);
    return { mutate: m.guardar, error: m.error, isPending: false };
  },
}));
vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => null,
}));
beforeEach(() => {
  vi.clearAllMocks();
  m.error = null;
});
describe('Cuaderno público con evidencia y objetivos', () => {
  it('distingue cero, ausencia y actualización fallida', () => {
    const { rerender } = render(<LeerFuente fuente={fuente} />);
    expect(screen.getByText('0 minutos')).toBeVisible();
    rerender(<LeerFuente fuente={{ ...fuente, estado: 'no_publicado', valor: null }} />);
    expect(screen.getByText('Dato no publicado')).toBeVisible();
    expect(screen.queryByText('0 minutos')).toBeNull();
    rerender(
      <LeerFuente
        fuente={{
          ...fuente,
          actualizacion: {
            estado: 'fallida',
            fecha: '2026-10-14',
            detalle: 'No respondió el servicio',
          },
        }}
      />,
    );
    expect(screen.getByText('0 minutos')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Se conserva el dato anterior');
  });
  it('documentar una fuente mantiene cero y distingue incorporar de publicar', () => {
    const guardar = vi.fn();
    render(
      <FormularioFuente
        inicial={{ ...fuente, valor: null }}
        guardar={guardar}
        cancelar={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Incorporar al borrador' }));
    expect(guardar).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Valor observado'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Incorporar al borrador' }));
    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ valor: 0 }));
    expect(m.guardar).not.toHaveBeenCalled();
  });
  it('un objetivo con base pendiente necesita una tarea de investigación', () => {
    const guardar = vi.fn();
    render(
      <FormularioObjetivo
        inicial={{ ...objetivo, tareaPendiente: '' }}
        fuentes={[fuente]}
        guardar={guardar}
        cancelar={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Incorporar objetivo al borrador' }));
    expect(guardar).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('establecerla');
    fireEvent.change(screen.getByLabelText('Tarea para establecer lo que falta'), {
      target: { value: objetivo.tareaPendiente },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Incorporar objetivo al borrador' }));
    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ lineaBase: null, meta: null }));
  });
  it('mantiene fija la revisión abierta y el borrador después de un conflicto', () => {
    const { rerender } = render(<Cuaderno ficha={ficha} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar evidencia y objetivos' }));
    m.error = new Error('La ficha cambió mientras editabas.');
    rerender(<Cuaderno ficha={{ ...ficha, revision: 4 }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Publicar revisión del cuaderno' }));
    expect(m.hook).toHaveBeenLastCalledWith(ficha.id, 3);
    expect(m.guardar).toHaveBeenCalledWith(
      { contenido: ficha.contenido, idLocal: ficha.id },
      expect.any(Object),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('cambió');
    expect(screen.getByRole('link', { name: /Consultar la versión actual/ })).toBeVisible();
  });
  it('impide quitar una fuente aún citada por un objetivo y oculta edición sin permiso', () => {
    const { rerender } = render(<Cuaderno ficha={ficha} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar evidencia y objetivos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar fuente Tiempo de espera' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar revisión del cuaderno' }));
    expect(m.guardar).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Cada fuente');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sin guardar el cuaderno' }));
    rerender(<Cuaderno ficha={{ ...ficha, puedoEditar: false }} />);
    expect(screen.queryByRole('button', { name: 'Editar evidencia y objetivos' })).toBeNull();
  });
});
