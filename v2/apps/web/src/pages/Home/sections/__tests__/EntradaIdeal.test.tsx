import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EntradaIdeal } from '../EntradaIdeal';

import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { useFichas } from '~/lib/queries/fichas';
import { useCampanas } from '~/lib/queries/participacion';

vi.mock('~/lib/queries/fichas', () => ({ useFichas: vi.fn() }));
vi.mock('~/lib/queries/participacion', () => ({ useCampanas: vi.fn() }));

type Campanas = ReturnType<typeof useCampanas>;
type Fichas = ReturnType<typeof useFichas>;

function campana(slug: string, titulo: string, estado = 'abierta', temas: string[] = []) {
  return {
    id: `id-${slug}`,
    slug,
    estado,
    contrato: { titulo, pregunta: `¿Pregunta de ${titulo}?`, temas, territorios: [] },
  };
}

beforeEach(() => {
  vi.mocked(useCampanas).mockReturnValue({ data: [], isLoading: false, isError: false } as unknown as Campanas);
  vi.mocked(useFichas).mockReturnValue({ data: { fichas: [], total: 0 }, isLoading: false, isError: false } as unknown as Fichas);
});

describe('La portada muestra procesos reales', () => {
  it('muestra solo campañas abiertas y fichas existentes, sin repetir el ejercicio del hero', () => {
    vi.mocked(useCampanas).mockReturnValue({ data: [
      campana('cuidar-cerca', 'Cuidar cerca de casa', 'abierta', ['cuidados']),
      campana('otra-ronda', 'Una campaña cerrada', 'cerrada'),
    ], isLoading: false, isError: false } as unknown as Campanas);
    vi.mocked(useFichas).mockReturnValue({ data: { fichas: [{ id: 'f1', titulo: 'Aprender entre generaciones', territorioNombre: 'Mendoza' }], total: 1 }, isLoading: false, isError: false } as unknown as Fichas);
    render(<EntradaIdeal />);
    expect(screen.getByRole('link', { name: 'Cuidar cerca de casa' })).toHaveAttribute('href', '/campanas/cuidar-cerca');
    expect(screen.getByRole('link', { name: 'Aprender entre generaciones' })).toHaveAttribute('href', '/fichas/f1');
    expect(screen.queryByText('Una campaña cerrada')).not.toBeInTheDocument();
    expect(screen.queryByText(/En tu Argentina ideal/)).not.toBeInTheDocument();
  });

  it('los títulos dicen qué es cada cosa y la entrada define campaña y ficha', () => {
    render(<EntradaIdeal />);
    expect(screen.getByRole('heading', { level: 3, name: 'Campañas abiertas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Fichas en armado' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Una campaña es una pregunta abierta sobre un tema y un lugar. Una ficha es una propuesta que un grupo va armando.',
      ),
    ).toBeInTheDocument();
  });

  it('la campaña nacional va primera aunque el servidor la devuelva después', () => {
    vi.mocked(useCampanas).mockReturnValue({ data: [
      campana('cuidar-cerca', 'Cuidar cerca de casa'),
      campana('educar-juntos', 'Educar juntos'),
      campana('mi-argentina-ideal', 'Mi Argentina ideal'),
    ], isLoading: false, isError: false } as unknown as Campanas);
    render(<EntradaIdeal />);
    const titulos = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.startsWith('/campanas/'))
      .map((a) => a.textContent);
    expect(titulos).toEqual(['Mi Argentina ideal', 'Cuidar cerca de casa', 'Educar juntos']);
  });

  it('sin temas la línea de la campaña no empieza con un separador', () => {
    vi.mocked(useCampanas).mockReturnValue({ data: [campana('mi-argentina-ideal', 'Mi Argentina ideal')], isLoading: false, isError: false } as unknown as Campanas);
    render(<EntradaIdeal />);
    expect(screen.getByText('Todo el país')).toBeInTheDocument();
    expect(screen.queryByText(/^·/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Convocatoria|convocatoria/)).not.toBeInTheDocument();
  });

  it('la ficha dice lugar y fecha de actualización sacados del dato, nunca un estado fijo', () => {
    vi.mocked(useFichas).mockReturnValue({ data: { fichas: [
      { id: 'f1', titulo: 'Aprender entre generaciones', territorioNombre: 'Mendoza', actualizadaEn: '2026-10-05T15:00:00.000Z' },
      { id: 'f2', titulo: 'Una huerta en cada escuela', territorioNombre: null, actualizadaEn: '2026-09-01T15:00:00.000Z' },
    ], total: 2 }, isLoading: false, isError: false } as unknown as Fichas);
    render(<EntradaIdeal />);
    expect(screen.getByText('Mendoza · actualizada el 5 de octubre de 2026')).toBeInTheDocument();
    expect(screen.getByText('Todo el país · actualizada el 1 de septiembre de 2026')).toBeInTheDocument();
    expect(screen.queryByText(/borrador en revisión/)).not.toBeInTheDocument();
  });

  it('una ficha sin fecha legible dice solo el lugar, sin «Invalid Date»', () => {
    vi.mocked(useFichas).mockReturnValue({ data: { fichas: [
      { id: 'f1', titulo: 'Aprender entre generaciones', territorioNombre: 'Mendoza' },
    ], total: 1 }, isLoading: false, isError: false } as unknown as Fichas);
    render(<EntradaIdeal />);
    expect(screen.getByText('Mendoza')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid|actualizada/)).not.toBeInTheDocument();
  });

  it('sin campañas abiertas lo dice una vez y ofrece imaginar, con la puerta única', () => {
    render(<EntradaIdeal />);
    const vacio = screen.getByText(/Todavía no hay campañas abiertas\./);
    expect(vacio).toHaveTextContent('Todavía no hay campañas abiertas. Mientras tanto, imaginá tu Argentina.');
    expect(within(vacio).getByRole('link', { name: 'imaginá tu Argentina' })).toHaveAttribute('href', APORTAR_HREF);
    // Un solo «todavía no hay» en la sección: las fichas explican de dónde salen en vez de repetir el vacío.
    expect(screen.getAllByText(/Todavía no hay/)).toHaveLength(1);
  });

  it('una consulta fallida no se anuncia como falta de campañas o fichas', () => {
    vi.mocked(useCampanas).mockReturnValue({ isLoading: false, isError: true } as unknown as Campanas);
    vi.mocked(useFichas).mockReturnValue({ isLoading: false, isError: true } as unknown as Fichas);
    render(<EntradaIdeal />);
    const avisos = screen.getAllByRole('alert');
    expect(avisos).toHaveLength(2);
    expect(avisos[0]).toHaveTextContent('No pudimos cargar las campañas. Probá de nuevo en un rato.');
    expect(avisos[1]).toHaveTextContent('No pudimos cargar las fichas. Probá de nuevo en un rato.');
    expect(screen.queryByText(/Todavía no hay/)).not.toBeInTheDocument();
  });

  it('cargando conserva las dos lecturas y no presenta datos de reserva', () => {
    vi.mocked(useCampanas).mockReturnValue({ isLoading: true } as unknown as Campanas);
    vi.mocked(useFichas).mockReturnValue({ isLoading: true } as unknown as Fichas);
    render(<EntradaIdeal />);
    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Ver las campañas ↗' })).toHaveAttribute('href', '/campanas');
    expect(screen.queryByText(/12.496|45 millones/)).not.toBeInTheDocument();
  });
});
