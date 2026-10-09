import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EntradaIdeal } from '../EntradaIdeal';

import { useFichas } from '~/lib/queries/fichas';
import { useCampanas } from '~/lib/queries/participacion';

vi.mock('~/lib/queries/fichas', () => ({ useFichas: vi.fn() }));
vi.mock('~/lib/queries/participacion', () => ({ useCampanas: vi.fn() }));

beforeEach(() => {
  vi.mocked(useCampanas).mockReturnValue({ data: [], isLoading: false, isError: false } as unknown as ReturnType<typeof useCampanas>);
  vi.mocked(useFichas).mockReturnValue({ data: { fichas: [], total: 0 }, isLoading: false, isError: false } as unknown as ReturnType<typeof useFichas>);
});

describe('La portada muestra procesos reales', () => {
  it('muestra solo convocatorias abiertas y fichas existentes, sin repetir el ejercicio del hero', () => {
    vi.mocked(useCampanas).mockReturnValue({ data: [
      { id: 'c1', slug: 'cuidar-cerca', estado: 'abierta', contrato: { titulo: 'Cuidar cerca de casa', pregunta: '¿Cómo sería cuidar en nuestra comunidad ideal?', temas: ['cuidados'], territorios: [] } },
      { id: 'c2', slug: 'otra-ronda', estado: 'cerrada', contrato: { titulo: 'Una convocatoria cerrada', pregunta: 'Otro proceso', temas: [], territorios: [] } },
    ], isLoading: false, isError: false } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({ data: { fichas: [{ id: 'f1', titulo: 'Aprender entre generaciones', territorioNombre: 'Mendoza' }], total: 1 }, isLoading: false, isError: false } as unknown as ReturnType<typeof useFichas>);
    render(<EntradaIdeal />);
    expect(screen.getByRole('link', { name: 'Cuidar cerca de casa' })).toHaveAttribute('href', '/campanas/cuidar-cerca');
    expect(screen.getByRole('link', { name: 'Aprender entre generaciones' })).toHaveAttribute('href', '/fichas/f1');
    expect(screen.queryByText('Una convocatoria cerrada')).not.toBeInTheDocument();
    expect(screen.queryByText(/En tu Argentina ideal/)).not.toBeInTheDocument();
  });
  it('una consulta fallida no se anuncia como falta de campañas o ideas', () => {
    vi.mocked(useCampanas).mockReturnValue({ isLoading: false, isError: true } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({ isLoading: false, isError: true } as unknown as ReturnType<typeof useFichas>);
    render(<EntradaIdeal />);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.queryByText(/El primer futuro compartido/)).not.toBeInTheDocument();
  });
  it('cargando conserva las dos lecturas y no presenta datos de reserva', () => {
    vi.mocked(useCampanas).mockReturnValue({ isLoading: true } as unknown as ReturnType<typeof useCampanas>);
    vi.mocked(useFichas).mockReturnValue({ isLoading: true } as unknown as ReturnType<typeof useFichas>);
    render(<EntradaIdeal />);
    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Ver las campañas ↗' })).toHaveAttribute('href', '/campanas');
    expect(screen.queryByText(/12.496|45 millones/)).not.toBeInTheDocument();
  });
});
