import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ElMandatoVivo } from '../ElMandatoVivo';

import { useVocesCount } from '~/lib/queries/analytics';
import { useMandatoDocumento, type DocumentoMandato } from '~/lib/queries/mandato';

vi.mock('~/lib/queries/analytics', () => ({ useVocesCount: vi.fn() }));
vi.mock('~/lib/queries/mandato', () => ({ useMandatoDocumento: vi.fn() }));

const mockVoces = vi.mocked(useVocesCount);
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
    mockVoces.mockReturnValue({
      data: { total: 16 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
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
    expect(screen.getAllByText('Una máquina la lee')).toHaveLength(1);
  });

  it('compone las 5 secciones: portada, convergencia, registro, documento, cómo se usa', () => {
    render(<ElMandatoVivo />);
    expect(screen.getByText('El mandato · documento vivo')).toBeInTheDocument();
    expect(screen.getByText('La voz entra por el mapa')).toBeInTheDocument();
    expect(
      screen.getByText('El registro del mapa — lo que la gente vino a decir'),
    ).toBeInTheDocument();
    expect(screen.getByText('Mandato ciudadano — Argentina')).toBeInTheDocument();
    expect(screen.getByText('Se firma')).toBeInTheDocument();
  });

  it('el CTA final «Sumar mi voz al mandato →» navega a /el-mapa', () => {
    render(<ElMandatoVivo />);
    const cta = screen.getByRole('link', { name: 'Sumar mi voz al mandato →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('el v1-port está muerto: sin form de señales ni feed de recientes', () => {
    render(<ElMandatoVivo />);
    expect(screen.queryByText('Mandá tu señal')).not.toBeInTheDocument();
    expect(screen.queryByText('Señales recientes')).not.toBeInTheDocument();
  });
});
