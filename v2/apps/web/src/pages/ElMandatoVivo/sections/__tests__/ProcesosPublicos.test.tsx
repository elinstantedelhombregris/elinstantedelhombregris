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
    vi.mocked(useCampanas).mockReturnValue({ data: [] } as unknown as ReturnType<
      typeof useCampanas
    >);
    vi.mocked(useFichas).mockReturnValue({
      data: { fichas: [], total: 0 },
    } as unknown as ReturnType<typeof useFichas>);
    vi.mocked(useCampana).mockReturnValue({
      data: { contrato: { fechaDevolucion: '2026-11-01' }, devoluciones: [{ edicion: 2 }] },
    } as unknown as ReturnType<typeof useCampana>);
    vi.mocked(useDisenoFicha).mockReturnValue({
      data: {
        afirmaciones: [
          {
            id: 'a1',
            texto: 'Aprender cerca de casa',
            respuestas: 3,
            acuerdo: null,
            desacuerdo: null,
            paso: null,
          },
        ],
        alternativas: [{ id: 'alt1', titulo: 'Aulas de cercanía' }],
        pruebas: [
          {
            id: 'p1',
            titulo: 'Una semana de talleres',
            estado: 'resultado_observado',
            eventos: [{ observacion: 'Una observación' }],
          },
        ],
      },
    } as unknown as ReturnType<typeof useDisenoFicha>);
  });

  it('conecta devoluciones y diseños reales, conservando la supresión del desglose pequeño', () => {
    vi.mocked(useCampanas).mockReturnValue({
      data: [
        {
          id: 'c1',
          slug: 'aprender-cerca',
          revision: 3,
          estado: 'abierta',
          contrato: { titulo: 'Aprender cerca' },
        },
      ],
    } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({
      data: {
        fichas: [
          { id: 'f1', titulo: 'Educación en comunidad', territorioNombre: 'Mendoza', revision: 1 },
        ],
        total: 1,
      },
    } as unknown as ReturnType<typeof useFichas>);
    render(<ProcesosPublicos />);
    expect(
      screen.getByRole('link', { name: 'Leer fuentes, límites y revisiones' }),
    ).toHaveAttribute('href', '/campanas/aprender-cerca/devolucion');
    expect(screen.getByRole('link', { name: 'Educación en comunidad' })).toHaveAttribute(
      'href',
      '/fichas/f1',
    );
    expect(
      screen.getByText(/3 respuestas; el desglose público espera al menos cinco/),
    ).toBeInTheDocument();
    expect(screen.getByText('Diseño alternativo: Aulas de cercanía.')).toBeInTheDocument();
    expect(screen.getByText(/Una semana de talleres · Resultado observado/)).toBeInTheDocument();
    expect(screen.queryByText(/0 acuerdos/)).not.toBeInTheDocument();
  });

  it('declara que la selección de campañas es parcial y conserva acceso al catálogo', () => {
    vi.mocked(useCampanas).mockReturnValue({
      data: Array.from({ length: 4 }, (_, i) => ({
        id: `c${i}`,
        slug: `pregunta-${i}`,
        revision: 1,
        estado: 'abierta',
        contrato: { titulo: `Pregunta pública ${i}` },
      })),
    } as unknown as ReturnType<typeof useCampanas>);
    render(<ProcesosPublicos />);
    expect(screen.getByText(/Mostramos 3 de 4 campañas\./)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Pregunta pública 3' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Consultar todas las campañas →' })).toHaveAttribute(
      'href',
      '/campanas',
    );
  });

  it('un error no se presenta como ausencia de procesos, y se dice UNA vez', () => {
    vi.mocked(useCampanas).mockReturnValue({ isError: true } as unknown as ReturnType<
      typeof useCampanas
    >);
    vi.mocked(useFichas).mockReturnValue({ isError: true } as unknown as ReturnType<
      typeof useFichas
    >);
    render(<ProcesosPublicos />);
    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('No pudimos cargar esto. Probá de nuevo en un rato.');
    expect(screen.getAllByText(/No pudimos cargar esto/)).toHaveLength(1);
    expect(screen.queryByText('Todavía no hay campañas abiertas.')).not.toBeInTheDocument();
    expect(screen.queryByText('Todavía no hay fichas abiertas.')).not.toBeInTheDocument();
  });

  it('presenta la selección sin dar representación y sin filtrar el límite de la API', () => {
    vi.mocked(useCampanas).mockReturnValue({
      data: Array.from({ length: 4 }, (_, i) => ({
        id: `c${i}`,
        slug: `pregunta-${i}`,
        revision: 1,
        estado: 'abierta',
        contrato: { titulo: `Pregunta pública ${i}` },
      })),
    } as unknown as ReturnType<typeof useCampanas>);
    const { container } = render(<ProcesosPublicos />);
    expect(
      screen.getByText(
        'Campañas y fichas abiertas hoy. Aparecer acá no les da representación ni efecto oficial.',
      ),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/devuelve hasta|hasta 100|Una voluntad encuentra/);
  });

  it('«3 de n» solo aparece cuando hay más de tres', () => {
    vi.mocked(useCampanas).mockReturnValue({
      data: Array.from({ length: 3 }, (_, i) => ({
        id: `c${i}`,
        slug: `p-${i}`,
        revision: 1,
        estado: 'abierta',
        contrato: { titulo: `Pregunta ${i}` },
      })),
    } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({
      data: {
        fichas: [{ id: 'f1', titulo: 'Una ficha', territorioNombre: null, revision: 1 }],
        total: 1,
      },
    } as unknown as ReturnType<typeof useFichas>);
    const { container } = render(<ProcesosPublicos />);
    expect(container.textContent).not.toMatch(/Mostramos/);
    expect(container.textContent).toContain('Todo el país · versión 1');
  });

  it('el plural y la fecha salen en castellano: «1 devolución», «1 de noviembre de 2026»', () => {
    vi.mocked(useCampanas).mockReturnValue({
      data: [
        {
          id: 'c1',
          slug: 'aprender-cerca',
          revision: 3,
          estado: 'abierta',
          contrato: { titulo: 'Aprender cerca' },
        },
      ],
    } as unknown as ReturnType<typeof useCampanas>);
    const { container, rerender } = render(<ProcesosPublicos />);
    expect(container.textContent).toContain('1 devolución publicada.');
    expect(container.textContent).not.toMatch(/1 devoluciones/);
    vi.mocked(useCampana).mockReturnValue({
      data: { contrato: { fechaDevolucion: '2026-11-01' }, devoluciones: [] },
    } as unknown as ReturnType<typeof useCampana>);
    rerender(<ProcesosPublicos />);
    expect(container.textContent).toContain('Fecha prevista: 1 de noviembre de 2026.');
    expect(container.textContent).not.toContain('2026-11-01');
  });

  it('el cero va en palabras en los conteos de una ficha', () => {
    vi.mocked(useFichas).mockReturnValue({
      data: {
        fichas: [{ id: 'f1', titulo: 'Una ficha', territorioNombre: null, revision: 1 }],
        total: 1,
      },
    } as unknown as ReturnType<typeof useFichas>);
    vi.mocked(useDisenoFicha).mockReturnValue({
      data: { afirmaciones: [], alternativas: [], pruebas: [] },
    } as unknown as ReturnType<typeof useDisenoFicha>);
    const { container } = render(<ProcesosPublicos />);
    expect(container.textContent).toContain(
      'ninguna afirmación · ninguna alternativa · ninguna prueba en esta ficha.',
    );
    expect(container.textContent).not.toMatch(/(^|[^\d.,])0(?![\d.,])/);
  });
});
