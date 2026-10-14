import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Relaciones } from '../deliberacion/Relaciones';

import { ficha } from './cuaderno-fixtures';

import type { RelacionEntreFichas } from '@v2/shared';

const DESTINO = '55555555-5555-4555-8555-555555555555';
const m = vi.hoisted(() => ({
  mutate: vi.fn(),
  relaciones: [] as RelacionEntreFichas[],
  isError: false,
}));
vi.mock('~/lib/queries/deliberacion', () => ({
  useRelacionesFichas: () => ({
    data: m.isError ? undefined : { relaciones: m.relaciones, completa: true },
    isError: m.isError,
    error: m.isError ? new Error('Sin conexión') : null,
    isPending: false,
    refetch: vi.fn(),
  }),
}));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: m.mutate, error: null, isPending: false }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  m.relaciones = [];
  m.isError = false;
});
describe('Relaciones entre fichas', () => {
  it('conserva la dirección de una dependencia y exige confirmar su retiro', () => {
    m.relaciones = [
      {
        id: DESTINO,
        origenId: ficha.id,
        origenTitulo: 'Acceder a turnos',
        destinoId: DESTINO,
        destinoTitulo: 'Viajar en colectivo',
        tipo: 'depende',
        justificacion: 'Los horarios deben permitir llegar a la consulta.',
        fuente: null,
        puedoRetirar: true,
      },
    ];
    render(<Relaciones ficha={ficha} />);
    expect(screen.getByRole('link', { name: 'Viajar en colectivo' })).toHaveAttribute(
      'href',
      `/fichas/${DESTINO}`,
    );
    expect(screen.getByText('Depende de', { exact: false, selector: 'p' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retirar vínculo' }));
    expect(m.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar retiro del vínculo' }));
    expect(m.mutate).toHaveBeenCalledWith(
      { metodo: 'delete', ruta: `/api/v1/fichas/relaciones/${DESTINO}` },
      expect.any(Object),
    );
  });
  it('acepta un enlace a otra ficha pero no una hipótesis causal sin fuente', () => {
    render(<Relaciones ficha={ficha} />);
    fireEvent.click(screen.getByText('Proponer un vínculo con otra ficha'));
    fireEvent.change(screen.getByLabelText('Enlace o identificador de la otra ficha'), {
      target: { value: `https://example.org/fichas/${DESTINO}?vista=alternativas` },
    });
    fireEvent.change(screen.getByLabelText('Relación desde esta ficha hacia la otra'), {
      target: { value: 'hipotesis_causal' },
    });
    fireEvent.change(
      screen.getByLabelText('Por qué proponés esta relación y cuáles son sus límites'),
      { target: { value: 'Un menor tiempo de viaje podría mejorar el acceso.' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Registrar vínculo propuesto' }));
    expect(m.mutate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Fuente de la relación (enlace)'), {
      target: { value: 'https://example.org/estudio' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar vínculo propuesto' }));
    const enviado: unknown = m.mutate.mock.calls[0]?.[0];
    expect(enviado).toMatchObject({
      cuerpo: {
        destinoId: DESTINO,
        tipo: 'hipotesis_causal',
        fuente: 'https://example.org/estudio',
      },
    });
  });
  it('muestra error sin afirmar que no existen relaciones y no ofrece editar sin permiso', () => {
    m.isError = true;
    render(<Relaciones ficha={{ ...ficha, puedoEditar: false }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión');
    expect(screen.queryByText('Todavía no hay relaciones documentadas.')).toBeNull();
    expect(screen.queryByText('Proponer un vínculo con otra ficha')).toBeNull();
  });
});
