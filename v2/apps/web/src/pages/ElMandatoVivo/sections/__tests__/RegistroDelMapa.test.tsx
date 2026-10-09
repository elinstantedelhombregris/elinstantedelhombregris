import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RegistroDelMapa } from '../RegistroDelMapa';

import { useMandatoDocumento, type DocumentoMandato } from '~/lib/queries/mandato';

vi.mock('~/lib/queries/mandato', () => ({
  useMandatoDocumento: vi.fn(),
}));

const mockDocumento = vi.mocked(useMandatoDocumento);

/** Documento base con todas las secciones vacías — cada test sobreescribe `voces`. */
function documentoBase(
  voces: DocumentoMandato['voces'],
  generadoEl = '2026-07-15T00:00:00Z',
): DocumentoMandato {
  return {
    generadoEl,
    voces,
    recursos: { total: 0, porProvincia: [] },
    brechas: [],
    senales: { total: 0, clasificadas: 0, temas: [] },
    propuestas: [],
  };
}

function armarMock(voces: DocumentoMandato['voces'], generadoEl?: string) {
  mockDocumento.mockReturnValue({
    data: documentoBase(voces, generadoEl),
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useMandatoDocumento>);
}

describe('RegistroDelMapa', () => {
  it('régimen cero: dice el cero real, sin ninguna barra', () => {
    armarMock({ total: 0, porTipo: [] });
    render(<RegistroDelMapa />);

    expect(screen.getByText('Todavía no hay aportes en el mapa.')).toBeInTheDocument();
  });

  it('régimen palitos (N=16): conteos absolutos en mono, sin ningún porcentaje', () => {
    armarMock({
      total: 16,
      porTipo: [
        { tipo: 'basta', total: 9 },
        { tipo: 'sueño', total: 5 },
        { tipo: 'necesidad', total: 2 },
      ],
    });
    render(<RegistroDelMapa />);

    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('régimen porcentaje (N=1000): el % grande junto al conteo absoluto', () => {
    armarMock({
      total: 1000,
      porTipo: [
        { tipo: 'necesidad', total: 416 },
        { tipo: 'sueño', total: 400 },
        { tipo: 'basta', total: 184 },
      ],
    });
    render(<RegistroDelMapa />);

    expect(screen.getByText('18,4% · 184')).toBeInTheDocument();
  });

  it('pie de fuente aparece con N ≥ 1, con conteo y fecha formateada (es-AR)', () => {
    armarMock({ total: 16, porTipo: [{ tipo: 'basta', total: 16 }] }, '2026-07-15T00:00:00Z');
    render(<RegistroDelMapa />);

    const fecha = new Date('2026-07-15T00:00:00Z').toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    expect(screen.getByText(`fuente: 16 aportes del mapa · ${fecha}`)).toBeInTheDocument();
  });

  it('sin N ≥ 1 no hay pie de fuente', () => {
    armarMock({ total: 0, porTipo: [] });
    render(<RegistroDelMapa />);

    expect(screen.queryByText(/^fuente:/)).not.toBeInTheDocument();
  });

  it('mientras carga o si falla, no renderiza nada (la card papel de Task 4 es la dueña de esos estados)', () => {
    mockDocumento.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useMandatoDocumento>);
    const { container } = render(<RegistroDelMapa />);
    expect(container).toBeEmptyDOMElement();
  });

  it('el título dice qué es y cuántos aportes hay, con la fecha', () => {
    armarMock({ total: 16, porTipo: [{ tipo: 'basta', total: 16 }] }, '2026-07-15T00:00:00Z');
    render(<RegistroDelMapa />);
    const titulo = screen.getByRole('heading', { level: 2 });
    expect(titulo).toHaveTextContent(/^Qué dijo la gente, por tipo \(16 aportes, /);
    // 13 px y no 11: era el título más chico de la página.
    expect(titulo.className).toMatch(/text-\[13px\]/);
  });

  it('las barras se escalan al TOTAL de aportes, no al tipo más grande', () => {
    armarMock({
      total: 1000,
      porTipo: [
        { tipo: 'necesidad', total: 400 },
        { tipo: 'sueño', total: 300 },
      ],
    });
    const { container } = render(<RegistroDelMapa />);
    const anchos = [...container.querySelectorAll<HTMLElement>('.anim-growbar')].map(
      (b) => b.style.width,
    );
    // 400 de 1000 es el 40 %, no el 100 % de la barra más larga.
    expect(anchos).toEqual(['40%', '30%']);
  });

  it('lo que no se supo leer concuerda en singular y plural', () => {
    armarMock({
      total: 2,
      porTipo: [
        { tipo: 'raro', total: 1 },
        { tipo: 'basta', total: 1 },
      ],
    });
    const { container } = render(<RegistroDelMapa />);
    expect(container.textContent).toContain('Y 1 aporte llegó con una categoría');
    expect(container.textContent).not.toMatch(/\bvoz|voces\b/);
  });
});
