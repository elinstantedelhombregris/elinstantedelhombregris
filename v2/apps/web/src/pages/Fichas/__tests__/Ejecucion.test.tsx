import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EjecucionDePrueba } from '../EjecucionDePrueba';

import type { DisenoFicha } from '@v2/shared';

const estado = vi.hoisted(() => ({ mutate: vi.fn(), error: null as Error | null }));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: estado.mutate, error: estado.error, isPending: false }),
}));
const p: DisenoFicha['pruebas'][number] = {
  id: '4b48b37a-ed09-4b13-811f-0c37d45644f5',
  alternativaId: '44067d18-8421-4eac-809d-0b1ed2e8cf71',
  titulo: 'Encuentros de apoyo escolar',
  alcance: 'Dos encuentros en una sala del barrio.',
  plazo: '2099-01-01',
  estado: 'propuesta',
  revision: 1,
  responsableNombre: null,
  puedoGestionar: true,
  puedoRevisar: false,
  eventos: [],
};
beforeEach(() => {
  vi.clearAllMocks();
  estado.error = null;
});
describe('Organizar una prueba en una iniciativa', () => {
  it('respeta permisos y muestra el vínculo público sin permitir duplicarlo', () => {
    const { rerender } = render(
      <EjecucionDePrueba prueba={{ ...p, puedoGestionar: false }} avisar={vi.fn()} />,
    );
    expect(screen.queryByRole('button')).toBeNull();
    rerender(
      <EjecucionDePrueba
        prueba={{
          ...p,
          ejecucion: {
            iniciativa: { slug: 'aprender', titulo: 'Aprender cerca de casa' },
            tareaId: 1,
            estadoTarea: 'done',
            hito: 'Revisar asistencia',
            revisionRealizada: false,
            recursos: 'Sala confirmada por ambas partes.',
          },
        }}
        avisar={vi.fn()}
      />,
    );
    expect(screen.getByRole('link', { name: 'Aprender cerca de casa' })).toHaveAttribute(
      'href',
      '/iniciativas/aprender',
    );
    expect(screen.getByText(/Revisar asistencia · pendiente/)).toBeVisible();
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('publica con consentimiento y conserva el mismo recibo en un reintento', () => {
    estado.error = new Error('No pudimos guardar.');
    render(<EjecucionDePrueba prueba={p} avisar={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Organizar en una iniciativa' }));
    const enviar = screen.getByRole('button', { name: 'Crear tarea y vincular' });
    expect(enviar).toHaveAttribute('aria-disabled', 'true');
    fireEvent.change(screen.getByLabelText('Recursos disponibles y pendientes'), {
      target: { value: 'Sala confirmada, acompañamiento pendiente.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(enviar);
    fireEvent.click(enviar);
    expect(estado.mutate).toHaveBeenCalledTimes(2);
    expect(estado.mutate.mock.calls[0]?.[0]).toEqual(estado.mutate.mock.calls[1]?.[0]);
    expect(estado.mutate.mock.calls.at(-1)?.[0]).toMatchObject({
      cuerpo: {
        revision: 1,
        autorizoPublicacion: true,
        iniciativa: { tipo: 'nueva', titulo: p.titulo, resumen: p.alcance },
      },
    });
    expect(screen.getByLabelText('Recursos disponibles y pendientes')).toHaveValue(
      'Sala confirmada, acompañamiento pendiente.',
    );
  });
  it('conserva lo escrito ante otra versión y exige revisar antes de enviarla', () => {
    const avisar = vi.fn();
    const { rerender } = render(<EjecucionDePrueba prueba={p} avisar={avisar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Organizar en una iniciativa' }));
    fireEvent.change(screen.getByLabelText('Dónde organizarla'), {
      target: { value: 'existente' },
    });
    fireEvent.change(screen.getByLabelText('Identificador de la iniciativa'), {
      target: { value: 'apoyo-escolar' },
    });
    fireEvent.change(screen.getByLabelText('Recursos disponibles y pendientes'), {
      target: { value: 'Sala pendiente de reservar esta semana.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    rerender(<EjecucionDePrueba prueba={{ ...p, revision: 2 }} avisar={avisar} />);
    expect(screen.getByRole('alert')).toHaveTextContent('La prueba cambió');
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea y vincular' }));
    expect(estado.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar formulario' }));
    fireEvent.click(screen.getByRole('button', { name: 'Organizar en una iniciativa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear tarea y vincular' }));
    expect(estado.mutate.mock.calls.at(-1)?.[0]).toMatchObject({
      cuerpo: {
        revision: 2,
        iniciativa: { tipo: 'existente', slug: 'apoyo-escolar' },
        recursos: 'Sala pendiente de reservar esta semana.',
      },
    });
  });
});
