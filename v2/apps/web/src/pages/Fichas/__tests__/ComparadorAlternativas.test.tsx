import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ComparadorAlternativas } from '../alternativas/ComparadorAlternativas';
import { DETALLE_VACIO } from '../alternativas/detalle';
import {
  FormularioDetalleAlternativa,
  LeerDetalleAlternativa,
} from '../alternativas/DetalleAlternativa';
import { RevisionPorObjecion } from '../alternativas/RevisionPorObjecion';

import type { DisenoFicha } from '@v2/shared';

const ID = '11111111-1111-4111-8111-111111111111';
vi.mock('~/lib/queries/deliberacion', () => ({
  useDeliberacion: () => ({
    data: {
      pages: [
        {
          argumentos: [
            {
              id: ID,
              tipo: 'objecion',
              texto: 'El horario excluye a quienes cuidan',
              retirado: false,
            },
            { id: 'retirado', tipo: 'objecion', texto: 'Texto retirado', retirado: true },
            { id: 'argumento', tipo: 'argumento', texto: 'Otra intervención', retirado: false },
          ],
        },
      ],
    },
    isPending: false,
    isError: false,
    error: null,
  }),
}));
const alternativas: DisenoFicha['alternativas'] = [
  {
    id: ID,
    titulo: 'Abrir por la tarde',
    funcionamiento: 'Usar la sala dos días',
    resultado: 'Acceso al apoyo escolar',
    dependencias: 'Sala autorizada',
    presupuesto: '',
    prueba: 'Dos semanas',
    criterioPausa: 'Falta de acceso',
    detalle: {
      ...DETALLE_VACIO,
      costo: 0,
      costoUnidad: 'ARS por préstamo de sala',
      fuenteCosto: 'https://example.org/fuente',
      afectados: 'Quienes cuidan por la tarde',
    },
  },
  {
    id: 'otra',
    titulo: 'Mantener los horarios',
    funcionamiento: 'Conservar horarios actuales',
    resultado: 'Medir antes de cambiar',
    dependencias: '',
    presupuesto: '',
    prueba: 'Registrar horarios',
    criterioPausa: 'Persisten barreras',
    detalle: { ...DETALLE_VACIO, situacionActual: true },
  },
];
describe('Comparar sin inventar disponibilidad ni acuerdo', () => {
  it('requiere dos elecciones explícitas, conserva costo cero y expone incertidumbre', () => {
    render(<ComparadorAlternativas alternativas={alternativas} />);
    fireEvent.click(screen.getByText('Comparar alternativas por las mismas dimensiones'));
    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByLabelText('Abrir por la tarde'));
    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByLabelText('Mantener los horarios · situación actual'));
    const tabla = screen.getByRole('table');
    expect(within(tabla).getByText('0 ARS por préstamo de sala')).toBeVisible();
    expect(within(tabla).getByText('Pendiente de estimar.')).toBeVisible();
    expect(within(tabla).getByText('Quienes cuidan por la tarde')).toBeVisible();
    expect(within(tabla).getByRole('link', { name: 'Consultar fuente' })).toHaveAttribute(
      'href',
      'https://example.org/fuente',
    );
  });
  it('conserva fuente y unidad al borrar el costo, y muestra la referencia sin declararla elegida', () => {
    const cambiar = vi.fn();
    const detalle = alternativas[0]?.detalle;
    if (!detalle) throw new Error('Falta detalle de prueba');
    render(<FormularioDetalleAlternativa valor={detalle} cambiar={cambiar} />);
    fireEvent.change(screen.getByLabelText('Costo estimado (vacío si falta estimar)'), {
      target: { value: '' },
    });
    expect(cambiar).toHaveBeenCalledWith({ ...detalle, costo: null });
  });
  it('solo permite seleccionar objeciones activas y pide la explicación del cambio', () => {
    const cambiar = vi.fn();
    render(
      <RevisionPorObjecion
        fichaId={ID}
        valor={{ anteriorId: ID, objecionId: '', motivo: '' }}
        cambiar={cambiar}
      />,
    );
    expect(screen.queryByRole('option', { name: 'Texto retirado' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'Otra intervención' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Objeción que motiva la revisión'), {
      target: { value: ID },
    });
    expect(cambiar).toHaveBeenCalledWith({ anteriorId: ID, objecionId: ID, motivo: '' });
    expect(screen.getByLabelText('Qué cambia y cómo responde a la objeción')).toBeVisible();
  });
  it('la lectura mantiene los datos faltantes visibles', () => {
    render(<LeerDetalleAlternativa detalle={DETALLE_VACIO} />);
    expect(screen.getByText('Pendiente de estimar.')).toBeVisible();
    expect(screen.getByText('Pendiente de acordar.')).toBeVisible();
  });
});
