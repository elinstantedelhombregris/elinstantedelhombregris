import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProcesosPublicos } from '../ProcesosPublicos';

import { useFichas } from '~/lib/queries/fichas';
import { useCampanas, useCampana, useDisenoFicha } from '~/lib/queries/participacion';

vi.mock('~/lib/queries/fichas', () => ({ useFichas: vi.fn() }));
vi.mock('~/lib/queries/participacion', () => ({
  useCampanas: vi.fn(),
  useCampana: vi.fn(),
  useDisenoFicha: vi.fn(),
}));

describe('Procesos públicos del mandato', () => {
  beforeEach(() => {
    vi.mocked(useCampanas).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({ data: { fichas: [], total: 0 } } as unknown as ReturnType<typeof useFichas>);
    vi.mocked(useCampana).mockReturnValue({
      data: { contrato: { fechaDevolucion: '2026-11-01' }, devoluciones: [{ edicion: 2 }] },
    } as unknown as ReturnType<typeof useCampana>);
    vi.mocked(useDisenoFicha).mockReturnValue({
      data: {
        afirmaciones: [{ id: 'a1', texto: 'Aprender cerca de casa', respuestas: 3, acuerdo: null, desacuerdo: null, paso: null }],
        alternativas: [{ id: 'alt1', titulo: 'Aulas de cercanía' }],
        pruebas: [{ id: 'p1', titulo: 'Una semana de talleres', estado: 'resultado_observado', eventos: [{ observacion: 'Una observación' }] }],
      },
    } as unknown as ReturnType<typeof useDisenoFicha>);
  });

  it('conecta devoluciones y diseños reales, conservando la supresión del desglose pequeño', () => {
    vi.mocked(useCampanas).mockReturnValue({
      data: [{ id: 'c1', slug: 'aprender-cerca', revision: 3, estado: 'abierta', contrato: { titulo: 'Aprender cerca' } }],
    } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({
      data: { fichas: [{ id: 'f1', titulo: 'Educación en comunidad', territorioNombre: 'Mendoza', revision: 1 }], total: 1 },
    } as unknown as ReturnType<typeof useFichas>);
    render(<ProcesosPublicos />);
    expect(screen.getByRole('link', { name: 'Leer fuentes, límites y revisiones' })).toHaveAttribute('href', '/campanas/aprender-cerca/devolucion');
    expect(screen.getByRole('link', { name: 'Educación en comunidad' })).toHaveAttribute('href', '/fichas/f1');
    expect(screen.getByText(/3 respuestas; el desglose público espera al menos cinco/)).toBeInTheDocument();
    expect(screen.getByText('Diseño alternativo: Aulas de cercanía.')).toBeInTheDocument();
    expect(screen.getByText(/Una semana de talleres · Resultado observado/)).toBeInTheDocument();
    expect(screen.queryByText(/0 acuerdos/)).not.toBeInTheDocument();
  });

  it('declara que la selección de campañas es parcial y conserva acceso al catálogo', () => {
    vi.mocked(useCampanas).mockReturnValue({
      data: Array.from({ length: 4 }, (_, i) => ({ id: `c${i}`, slug: `pregunta-${i}`, revision: 1, estado: 'abierta', contrato: { titulo: `Pregunta pública ${i}` } })),
    } as unknown as ReturnType<typeof useCampanas>);
    render(<ProcesosPublicos />);
    expect(screen.getByText(/Mostramos 3 de las 4 campañas recibidas/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pregunta pública 3' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Consultar todas las campañas →' })).toHaveAttribute('href', '/campanas');
  });

  it('un error no se presenta como ausencia de procesos', () => {
    vi.mocked(useCampanas).mockReturnValue({ isError: true } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({ isError: true } as unknown as ReturnType<typeof useFichas>);
    render(<ProcesosPublicos />);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.queryByText('Todavía no hay campañas públicas en este catálogo.')).not.toBeInTheDocument();
    expect(screen.queryByText('Todavía no encontramos fichas en este registro.')).not.toBeInTheDocument();
  });
});
