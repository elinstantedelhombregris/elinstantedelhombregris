import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditorCampo } from '../Editor';

import { api } from '~/lib/api';
import { nuevoCuaderno, type Cuaderno } from '~/lib/campo/modelo';
import { tarea } from '~/pages/Iniciativas/__tests__/fixtures';

const m = vi.hoisted(() => ({ guardar: vi.fn(), borrar: vi.fn() }));
vi.mock('~/lib/campo/archivo', () => ({ guardarCuaderno: m.guardar, borrarCuaderno: m.borrar }));
vi.mock('~/lib/api', () => ({ api: { get: vi.fn() } }));
const inicial = () => nuevoCuaderno(7, 10, tarea, '/iniciativas/escuela');
describe('Cuaderno de campo', () => {
  beforeEach(() => {
    m.guardar
      .mockReset()
      .mockImplementation((c: Cuaderno) => Promise.resolve({ ...c, version: c.version + 1 }));
    m.borrar.mockReset().mockResolvedValue(undefined);
  });
  it('guarda notas sin autorizar y conserva texto ante falla del archivo', async () => {
    render(<EditorCampo inicial={inicial()} cambiar={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.change(screen.getByLabelText('Notas privadas de campo'), {
      target: { value: 'Observaciones para revisar en privado' },
    });
    expect(
      screen.getByRole('button', { name: 'Autorizar resumen y poner en cola' }),
    ).toBeDisabled();
    m.guardar.mockRejectedValueOnce(new Error('No hay espacio local.'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador local' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No hay espacio local.');
    expect(screen.getByLabelText('Notas privadas de campo')).toHaveValue(
      'Observaciones para revisar en privado',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador local' }));
    await waitFor(() => {
      expect(m.guardar).toHaveBeenCalledTimes(2);
    });
    expect(m.guardar.mock.calls[1]?.[0]).toMatchObject({
      estado: 'borrador',
      sobre: null,
      notas: 'Observaciones para revisar en privado',
    });
  });
  it('exige ambas confirmaciones y no transforma cero omitido en dato', async () => {
    render(<EditorCampo inicial={inicial()} cambiar={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByLabelText(/Realicé la escucha/));
    expect(
      screen.getByRole('button', { name: 'Autorizar resumen y poner en cola' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Revisé el resumen/));
    fireEvent.click(screen.getByRole('button', { name: 'Autorizar resumen y poner en cola' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(m.guardar).not.toHaveBeenCalled();
  });
  it('una actualización de otra pestaña no pisa texto sin guardar', async () => {
    const c = inicial();
    const cambiar = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(<EditorCampo inicial={c} cambiar={cambiar} />);
    fireEvent.change(screen.getByLabelText('Notas privadas de campo'), {
      target: { value: 'Texto local todavía sin guardar' },
    });
    rerender(
      <EditorCampo inicial={{ ...c, version: 4, notas: 'Otra pestaña' }} cambiar={cambiar} />,
    );
    expect(await screen.findByText(/La copia guardada cambió en otra pestaña/)).toBeInTheDocument();
    expect(screen.getByLabelText('Notas privadas de campo')).toHaveValue(
      'Texto local todavía sin guardar',
    );
  });
  it('un conflicto requiere consultar y aceptar el alcance actual; recupera sin autorización', async () => {
    vi.mocked(api.get).mockResolvedValue({
      items: [{ ...tarea, revision: 8, estado: 'in_progress', puedoGestionar: true }],
      siguiente: null,
    });
    render(
      <EditorCampo
        inicial={{ ...inicial(), estado: 'conflicto', notas: 'Nota conservada' }}
        cambiar={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Consultar versión actual para revisar' }));
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Revisé los cambios; recuperar borrador sin autorización',
      }),
    );
    await waitFor(() => {
      expect(m.guardar).toHaveBeenCalled();
    });
    expect(m.guardar.mock.calls[0]?.[0]).toMatchObject({
      revisionTarea: 8,
      notas: 'Nota conservada',
      estado: 'borrador',
      sobre: null,
    });
    expect(
      await screen.findByRole('button', { name: 'Autorizar resumen y poner en cola' }),
    ).toBeDisabled();
  });
  it('un envío incierto no puede editarse ni borrarse perdiendo su recibo', () => {
    render(
      <EditorCampo
        inicial={{
          ...inicial(),
          estado: 'espera',
          intentos: 1,
          mensaje: 'Recepción por confirmar',
        }}
        cambiar={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Guardar borrador local' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Borrar copia local' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Quitar autorización/ })).not.toBeInTheDocument();
  });
});
