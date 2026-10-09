import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ElMandatoVivo } from '../ElMandatoVivo';

import { useMandatoDocumento, type DocumentoMandato } from '~/lib/queries/mandato';

vi.mock('~/lib/queries/mandato', () => ({ useMandatoDocumento: vi.fn() }));
vi.mock('../ElMandatoVivo/sections/ProcesosPublicos', () => ({
  ProcesosPublicos: () => <section aria-label="Procesos públicos reales">Procesos públicos</section>,
}));

const mockDocumento = vi.mocked(useMandatoDocumento);

/** Documento base con todas las secciones vacías — cada test sobreescribe lo suyo (patrón de sections/__tests__). */
function documentoBase(overrides: Partial<DocumentoMandato> = {}): DocumentoMandato {
  return {
    generadoEl: '2026-07-15T00:00:00Z',
    voces: { total: 0, porTipo: [] },
    recursos: { total: 0, porProvincia: [] },
    brechas: [],
    senales: { total: 0, clasificadas: 0, temas: [] },
    propuestas: [],
    ...overrides,
  };
}

describe('ElMandatoVivo (composer, página papel 2.3)', () => {
  beforeEach(() => {
    mockDocumento.mockReturnValue({
      data: documentoBase({ voces: { total: 16, porTipo: [{ tipo: 'basta', total: 16 }] } }),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMandatoDocumento>);
  });

  it('abre con el rito de la tinta: H1 «El mandato.»', () => {
    render(<ElMandatoVivo />);
    expect(screen.getByRole('heading', { level: 1, name: 'El mandato.' })).toBeInTheDocument();
  });

  it('la convergencia (§2) aparece UNA sola vez en toda la página', () => {
    render(<ElMandatoVivo />);
    expect(screen.getAllByText('Examinamos lo que nos reúne')).toHaveLength(1);
  });

  it('compone las 5 secciones: portada, convergencia, registro, documento, cómo se usa', () => {
    render(<ElMandatoVivo />);
    expect(screen.getByText('El mandato · una posibilidad por construir')).toBeInTheDocument();
    expect(screen.getByText('Imaginamos una vida posible')).toBeInTheDocument();
    expect(
      screen.getByText('El registro del mapa — lo que la gente vino a decir'),
    ).toBeInTheDocument();
    expect(screen.getByText('Registro de señales — Argentina')).toBeInTheDocument();
    expect(screen.getByText('Se declara el efecto')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Procesos públicos reales' })).toBeInTheDocument();
  });

  it('invita a imaginar sin atribuir apoyo al mandato por publicar una voz', () => {
    render(<ElMandatoVivo />);
    const cta = screen.getByRole('link', { name: 'Imaginar mi Argentina →' });
    expect(cta).toHaveAttribute('href', '/imaginar');
    // Jerarquía de la spec: h2 por sección §2–§6 — la del CTA es sr-only,
    // mismo patrón que ComoSeEscribe/ComoSeUsa.
    expect(screen.getByRole('heading', { level: 2, name: 'Imaginá el país que querés vivir' })).toBeInTheDocument();
  });

  it('el v1-port está muerto: sin form de señales ni feed de recientes', () => {
    render(<ElMandatoVivo />);
    expect(screen.queryByText('Mandá tu señal')).not.toBeInTheDocument();
    expect(screen.queryByText('Señales recientes')).not.toBeInTheDocument();
  });
});
