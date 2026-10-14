import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { Capacidades } from '../../Capacidades';
import { EjemploReserva } from '../EjemploReserva';
import { NuevaCapacidad } from '../NuevaCapacidad';
import { Reserva } from '../Reserva';
import { SolicitarCapacidad } from '../SolicitarCapacidad';

import { FICHA, ID, capacidad, reserva } from './capacidades-fixtures';

import type { LecturaCapacidad } from '@v2/shared';

const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  refetch: vi.fn(),
  error: null as Error | null,
  lectura: null as LecturaCapacidad | null,
  sesion: true,
}));
vi.mock('~/lib/auth/use-auth', () => ({
  useAuth: () => ({ user: m.sesion ? { id: 1 } : null, isLoading: false }),
}));
vi.mock('~/lib/queries/capacidades', () => ({
  useOperacionCapacidad: () => ({ mutate: m.mutate, isPending: false, error: null }),
  useCapacidad: () => ({
    data: m.lectura ? { pages: [m.lectura] } : undefined,
    isPending: !m.lectura && !m.error,
    isError: Boolean(m.error),
    error: m.error,
    refetch: m.refetch,
  }),
  useCapacidades: () => ({
    data: undefined,
    isPending: false,
    isError: true,
    error: new Error('Sin conexión'),
    refetch: m.refetch,
  }),
}));
vi.mock('../../ElMapa/instrumento/BusquedaTerritorial', () => ({
  BusquedaTerritorial: () => <span>Buscador de lugares</span>,
}));
beforeEach(() => {
  vi.clearAllMocks();
  m.error = null;
  m.lectura = { capacidad, reservas: [], siguiente: null };
  m.sesion = true;
});
const cambiar = (nombre: string | RegExp, value: string) => {
  fireEvent.change(screen.getByLabelText(nombre), { target: { value } });
};
describe('Capacidades y reservas', () => {
  it('recorre un ejemplo completo sin escribir y distingue solicitud, reserva y recepción', () => {
    render(<EjemploReserva />);
    fireEvent.click(screen.getByRole('button', { name: 'Un equipo solicita 6 horas' }));
    expect(screen.getByText(/La solicitud todavía no descuenta horas/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Quien ofrece acepta la solicitud' }));
    expect(screen.getByText('4 h')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Intentar reservar otras 5 horas' }));
    expect(
      screen.getByRole('heading', { name: 'No alcanza para la segunda solicitud' }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'El primer equipo usa la sala' }));
    fireEvent.click(screen.getByRole('button', { name: 'El equipo confirma recepción' }));
    expect(screen.getByText(/Las horas utilizadas no vuelven/)).toBeVisible();
    expect(m.mutate).not.toHaveBeenCalled();
  });
  it('conserva una solicitud inválida y pide aceptación explícita antes de enviarla', () => {
    render(<SolicitarCapacidad capacidad={capacidad} fichaId={FICHA} />);
    fireEvent.click(screen.getByText('Proponer una solicitud'));
    cambiar(/Cantidad solicitada/, '6');
    cambiar(/Fecha acordable/, '2099-01-01');
    cambiar('Para qué se necesita', 'Apoyo escolar');
    cambiar(/Por qué sirve/, 'Cumplimos el horario y necesitamos el acceso sin escalones');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
    expect(m.mutate).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Para qué se necesita')).toHaveValue('Apoyo escolar');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));
    const enviada: unknown = m.mutate.mock.calls[0]?.[0];
    expect(enviada).toMatchObject({
      cuerpo: { fichaId: FICHA, cantidad: 6, aceptaCondiciones: true },
    });
  });
  it('no convierte cantidad vacía en cero y requiere autoridad para ofrecer', () => {
    render(<NuevaCapacidad senalId={ID} />);
    cambiar('Qué ofrecés', 'Acompañamiento digital');
    cambiar(/Disponible desde/, '2099-01-01');
    cambiar(/Disponible hasta/, '2099-01-31');
    cambiar(/Dónde puede usarse/, 'Centro barrial');
    cambiar(/Horarios, accesibilidad/, 'Acordar horario');
    cambiar(/Firma pública/, 'Equipo');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar oferta' }));
    expect(m.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Publicar oferta' }));
    const enviada: unknown = m.mutate.mock.calls[0]?.[0];
    expect(enviada).toMatchObject({
      cuerpo: { cantidad: null, senalId: ID, autorizoOferta: true },
    });
  });
  it('solo quien recibe confirma recepción y puede documentar una discrepancia', () => {
    render(<Reserva reserva={reserva} capacidadId={ID} unidad="horas" />);
    expect(screen.queryByRole('button', { name: 'Declarar entrega' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Informar una discrepancia' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar: Informar una discrepancia' }));
    expect(m.mutate).not.toHaveBeenCalled();
    cambiar(/Qué se entregó/, 'Faltaron dos horas');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar: Informar una discrepancia' }));
    expect(m.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        cuerpo: { accion: 'discrepar', nota: 'Faltaron dos horas', revisionEsperada: 3 },
      }),
      expect.any(Object),
    );
  });
  it('muestra cero disponible y mantiene errores distintos de listas vacías', () => {
    const ubicacion = memoryLocation({ path: `/capacidades/${ID}` });
    render(
      <Router hook={ubicacion.hook}>
        <Capacidades />
      </Router>,
    );
    expect(screen.getByText('Disponible').parentElement).toHaveTextContent('0 horas');
    expect(
      screen.getByText(/autorización declarada, sin verificación institucional/),
    ).toBeVisible();
  });
  it('permite reintentar una consulta fallida sin afirmar que no existen ofertas', () => {
    const ubicacion = memoryLocation({ path: '/capacidades' });
    render(
      <Router hook={ubicacion.hook}>
        <Capacidades />
      </Router>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión');
    expect(screen.queryByText('Todavía no hay ofertas para esta consulta.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar ofertas' }));
    expect(m.refetch).toHaveBeenCalled();
  });
  it('explica el saldo de una entrega parcial y exige volver a revisar si cambia', () => {
    const parcial = { ...reserva, cantidadDeclarada: 4 };
    const { rerender } = render(<Reserva reserva={parcial} capacidadId={ID} unidad="horas" />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar recepción declarada' }));
    expect(screen.getByText(/Confirmás 4 horas recibidas/)).toHaveTextContent(
      'El saldo de 6 horas vuelve a estar disponible.',
    );
    rerender(
      <Reserva
        reserva={{ ...parcial, revision: 4, cantidadDeclarada: 6 }}
        capacidadId={ID}
        unidad="horas"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('La reserva cambió');
    expect(
      screen.getByRole('button', { name: 'Confirmar: Confirmar recepción declarada' }),
    ).toBeDisabled();
    expect(m.mutate).not.toHaveBeenCalled();
  });
  it('permite declarar cero para cerrar una prestación no realizada, con recepción pendiente', () => {
    render(
      <Reserva
        reserva={{ ...reserva, estado: 'reservada', soySolicitante: false }}
        capacidadId={ID}
        unidad="horas"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Declarar entrega' }));
    cambiar(/Cantidad entregada/, '0');
    cambiar(/Qué se entregó/, 'La actividad se canceló y no se usó la sala.');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar: Declarar entrega' }));
    const enviada: unknown = m.mutate.mock.calls[0]?.[0];
    expect(enviada).toMatchObject({
      cuerpo: { cantidadEntregada: 0, revisionEsperada: 3, accion: 'declarar_entrega' },
    });
  });
});
