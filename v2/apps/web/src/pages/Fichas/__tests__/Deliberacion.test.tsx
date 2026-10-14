import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Deliberacion } from '../deliberacion/Deliberacion';
import { Intervencion } from '../deliberacion/Intervencion';
import { NuevoArgumento } from '../deliberacion/NuevoArgumento';
import { Proceso } from '../deliberacion/Proceso';
import { Sintesis } from '../deliberacion/Sintesis';

import { ficha, argumento } from './cuaderno-fixtures';

const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  guardar: vi.fn(),
  revision: vi.fn(),
  error: null as Error | null,
  user: { id: 7 },
  queryError: false,
}));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: m.user, isLoading: false }) }));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: m.mutate, error: m.error, isPending: false }),
  useDisenoFicha: () => ({ data: { alternativas: [] }, isError: false }),
}));
vi.mock('~/lib/queries/fichas', () => ({
  useGuardarFicha: (id: string, revision: number) => {
    m.revision(id, revision);
    return { mutate: m.guardar, isPending: false, error: m.error };
  },
}));
vi.mock('~/lib/queries/deliberacion', () => ({
  useDeliberacion: () => ({
    data: m.queryError ? undefined : { pages: [{ argumentos: [], total: 0, participantes: 0 }] },
    isPending: false,
    isError: m.queryError,
    error: m.queryError ? new Error('Sin conexión') : null,
    refetch: vi.fn(),
  }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  m.error = null;
  m.user = { id: 7 };
  m.queryError = false;
});
describe('Proceso, intervenciones y síntesis', () => {
  it('las reglas mantienen la revisión original aunque llegue una nueva ficha', () => {
    const { rerender } = render(<Proceso ficha={ficha} />);
    fireEvent.click(screen.getByRole('button', { name: 'Revisar reglas y participación' }));
    rerender(<Proceso ficha={{ ...ficha, revision: 4 }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reglas y participación' }));
    expect(m.revision).toHaveBeenLastCalledWith(ficha.id, 3);
    expect(m.guardar).toHaveBeenCalledWith(
      { contenido: ficha.contenido, idLocal: ficha.id },
      expect.any(Object),
    );
  });
  it('conserva texto y recibo al reintentar un argumento y exige el destino de una respuesta', () => {
    render(<NuevoArgumento ficha={ficha} argumentos={[argumento]} />);
    fireEvent.change(screen.getByLabelText('Tu intervención'), {
      target: { value: argumento.texto },
    });
    fireEvent.change(screen.getByLabelText('Firma pública'), {
      target: { value: 'Otra participante' },
    });
    fireEvent.change(screen.getByLabelText('Tipo de intervención'), {
      target: { value: 'respuesta' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar intervención' }));
    expect(m.mutate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Responde a'), { target: { value: argumento.id } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar intervención' }));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar intervención' }));
    expect(m.mutate.mock.calls[0]?.[0]).toEqual(m.mutate.mock.calls[1]?.[0]);
    expect(screen.getByLabelText('Tu intervención')).toHaveValue(argumento.texto);
  });
  it('retirar exige confirmación y no muestra el texto de una intervención retirada', () => {
    const { rerender } = render(<Intervencion argumento={argumento} ficha={ficha} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retirar intervención' }));
    expect(m.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar retiro' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ cuerpo: { motivo: 'autoria' } }),
      expect.any(Object),
    );
    rerender(
      <Intervencion
        argumento={{ ...argumento, retirado: true, texto: null, firma: null, puedoRetirar: false }}
        ficha={ficha}
      />,
    );
    expect(screen.queryByText(argumento.texto ?? '')).toBeNull();
    expect(screen.getByText(/El texto y la firma no se muestran/)).toBeVisible();
  });
  it('una síntesis exige referencia en cada acuerdo antes de publicar', () => {
    render(<Sintesis ficha={ficha} argumentos={[argumento]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Preparar o revisar síntesis' }));
    for (const campo of [
      'Firma pública de quien revisó la síntesis',
      'Qué cubre esta síntesis',
      'Quiénes participaron y cómo se contaron',
      'Personas ausentes y límites de la invitación',
      'Desacuerdos y alternativas todavía abiertas',
    ])
      fireEvent.change(screen.getByLabelText(campo), {
        target: { value: 'Descripción pública del proceso y sus límites' },
      });
    fireEvent.change(screen.getByLabelText('Fecha de próxima revisión'), {
      target: { value: '2027-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar acuerdo parcial' }));
    fireEvent.change(screen.getByLabelText('Texto del acuerdo 1'), {
      target: { value: 'Conservar atención presencial' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar síntesis' }));
    expect(m.guardar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: /Mantengamos una opción/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar síntesis' }));
    const enviado: unknown = m.guardar.mock.calls[0]?.[0];
    expect(enviado).toMatchObject({
      contenido: {
        sintesis: {
          acuerdos: [{ texto: 'Conservar atención presencial', argumentoIds: [argumento.id] }],
        },
      },
    });
  });
  it('no presenta un error como una conversación sin participantes', () => {
    m.queryError = true;
    render(<Deliberacion ficha={ficha} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión');
    expect(screen.queryByText('Todavía no hay intervenciones.')).toBeNull();
    expect(screen.queryByText(/0 cuentas con/)).toBeNull();
  });
  it('conserva la explicación de la síntesis retirada', () => {
    render(<Sintesis ficha={{ ...ficha, sintesisRevisar: true }} argumentos={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('La síntesis está oculta');
  });
});
