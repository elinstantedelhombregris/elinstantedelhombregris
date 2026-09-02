import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentoMandato } from '../DocumentoMandato';

import { useMandatoDocumento, type DocumentoMandato as Documento } from '~/lib/queries/mandato';

vi.mock('~/lib/queries/mandato', () => ({
  useMandatoDocumento: vi.fn(),
}));

const mockDocumento = vi.mocked(useMandatoDocumento);

/**
 * happy-dom trae un `IntersectionObserver` propio pero nunca dispara
 * callbacks reales (no hay layout/paint) — lo reemplazamos por uno de
 * juguete que guarda el callback para que el test lo dispare a mano.
 */
class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Dispara el callback como si el bloque de firma hubiera entrado (o no) al viewport. */
  trigger(isIntersecting: boolean): void {
    const entry = { isIntersecting } as unknown as IntersectionObserverEntry;
    this.callback([entry], this);
  }
}

vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

/** Documento base con todas las secciones vacías — cada helper sobreescribe lo suyo. */
function documentoBase(overrides: Partial<Documento> = {}): Documento {
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

function docVacio(): Documento {
  return documentoBase();
}

/** N=16, M=3 (palitos en ambos regímenes), P=1 — bajo el umbral, con EJEMPLO. */
function docChico(): Documento {
  return documentoBase({
    voces: { total: 16, porTipo: [{ tipo: 'basta', total: 16 }] },
    recursos: { total: 1, porProvincia: [{ provincia: 'Córdoba', total: 1 }] },
    brechas: [{ provincia: 'Córdoba', piden: 5, ofrecen: 0 }],
    senales: {
      total: 5,
      clasificadas: 3,
      temas: [
        {
          tema: 'salud_publica',
          total: 3,
          ultima: {
            id: 42,
            texto: 'Seis meses para un turno',
            provincia: 'Córdoba',
            fecha: '2026-07-10T00:00:00Z',
          },
        },
      ],
    },
    propuestas: [
      {
        id: 7,
        titulo: 'Red de turnos comunitarios',
        resumen: 'Lista de espera paralela y auditable.',
        estado: 'voting',
        votos: 4,
        apoyo: 1,
      },
    ],
  });
}

/** N=1000, M=500 — sobre el umbral, sin EJEMPLO, con % es-AR. */
function docRico(): Documento {
  return documentoBase({
    voces: { total: 1000, porTipo: [{ tipo: 'necesidad', total: 416 }] },
    recursos: { total: 300, porProvincia: [{ provincia: 'Buenos Aires', total: 300 }] },
    brechas: [{ provincia: 'Buenos Aires', piden: 200, ofrecen: 50 }],
    senales: {
      total: 600,
      clasificadas: 500,
      temas: [
        {
          tema: 'salud_publica',
          total: 92,
          ultima: {
            id: 99,
            texto: 'Seis meses para un turno',
            provincia: 'Córdoba',
            fecha: '2026-07-10T00:00:00Z',
          },
        },
      ],
    },
    propuestas: [{ id: 3, titulo: 'Red nacional de turnos', resumen: 'Resumen real.', estado: 'voting', votos: 500, apoyo: 400 }],
  });
}

function armarMock(
  data: Documento | undefined,
  extra: Partial<{ isLoading: boolean; isError: boolean; refetch: () => void }> = {},
) {
  mockDocumento.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...extra,
  } as ReturnType<typeof useMandatoDocumento>);
}

describe('DocumentoMandato', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    FakeIntersectionObserver.instances = [];
  });

  it('cargando: microcopy y ningún documento', () => {
    armarMock(undefined, { isLoading: true });
    render(<DocumentoMandato />);

    expect(screen.getByText('Cargando — menos que un trámite.')).toBeInTheDocument();
    expect(screen.queryByText('Mandato ciudadano — Argentina')).not.toBeInTheDocument();
  });

  it('error: la frase de honestidad + botón de reintento que llama a refetch', () => {
    const refetch = vi.fn();
    armarMock(undefined, { isError: true, refetch });
    render(<DocumentoMandato />);

    expect(screen.getByText('Esto se rompió. Lo decimos porque publicamos todo.')).toBeInTheDocument();
    const boton = screen.getByRole('button', { name: 'Probar de nuevo ↺' });
    fireEvent.click(boton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('N=0 (docVacio): cabecera, EJEMPLO y ceros hablados por sección, sin ningún %', () => {
    armarMock(docVacio());
    render(<DocumentoMandato />);

    expect(screen.getByText(/Exp\. sin voces todavía/)).toBeInTheDocument();
    expect(screen.getByText('Ejemplo')).toBeInTheDocument();
    expect(screen.getByText(/no lo vamos a inventar\./)).toBeInTheDocument();
    expect(screen.getByText(/Nadie ofreció nada todavía/)).toBeInTheDocument();
    expect(screen.getByText(/Eso también es un dato\./)).toBeInTheDocument();
    expect(screen.getByText('Ninguna voz todavía.')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('el sello EJEMPLO sale del flujo absoluto bajo 560px: en línea arriba del título, no encima (D-079)', () => {
    armarMock(docVacio());
    render(<DocumentoMandato />);

    const marco = screen.getByText('Ejemplo').closest('div');
    expect(marco).toHaveClass('absolute');
    expect(marco).toHaveClass('max-[560px]:static');
    expect(marco).toHaveClass('max-[560px]:mb-4');
  });

  it('N chico (docChico N=16/M=3/P=1): EJEMPLO con su línea, régimen palitos y links reales', () => {
    armarMock(docChico());
    render(<DocumentoMandato />);

    // La cabecera es h2 (spec a11y: «h2 por sección … y cabecera del
    // documento») — padre de las secciones romanas h3. Pin contra regresión.
    expect(screen.getByRole('heading', { level: 2, name: 'Mandato ciudadano — Argentina' })).toBeInTheDocument();

    expect(screen.getByText('Ejemplo')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Con 16 voces esto es el formato del mandato, no el mandato\. El de verdad se escribe con la tuya\./,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('señales')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();

    expect(screen.getByText('crítica')).toBeInTheDocument();

    const linkAccion = screen.getByRole('link', { name: /Red de turnos comunitarios/ });
    expect(linkAccion).toHaveAttribute('href', '/mandato-vivo/propuesta/7');

    const linkCita = screen.getByRole('link', { name: /Seis meses para un turno/ });
    expect(linkCita).toHaveAttribute('href', '/mandato-vivo/pulso/42');
  });

  it('N rico (docRico N=1000/M=500): sin sello EJEMPLO, % es-AR del tema top y pie con las tres poblaciones', () => {
    const documento = docRico();
    armarMock(documento);
    render(<DocumentoMandato />);

    const fecha = new Date(documento.generadoEl).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    expect(screen.queryByText('Ejemplo')).not.toBeInTheDocument();
    expect(screen.getByText('18,4%')).toBeInTheDocument();
    expect(
      screen.getByText(
        `Fuentes: 1.000 voces del mapa · 500 señales clasificadas · 1 propuestas en votación · generado ${fecha}`,
      ),
    ).toBeInTheDocument();
  });

  it('VISTO: el observer del bloque de firma dispara el sello una sola vez', () => {
    armarMock(docChico());
    render(<DocumentoMandato />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    const [observer] = FakeIntersectionObserver.instances;
    expect(observer).toBeDefined();
    expect(observer?.disconnect).not.toHaveBeenCalled();

    act(() => {
      observer?.trigger(true);
    });

    const estado = screen.getByRole('status');
    expect(estado).toHaveTextContent('Documento auditado. Ahora sos testigo.');
    expect(screen.getAllByText('Visto')).toHaveLength(1);
    // El cambio `visto: false → true` re-ejecuta el efecto; React corre el
    // cleanup de la instancia vieja antes — pin contra refactors que rompan
    // esa desconexión (p. ej. sacar `visto` de las deps o perder el `return`).
    expect(observer?.disconnect).toHaveBeenCalledTimes(1);

    act(() => {
      observer?.trigger(true);
    });
    expect(screen.getAllByText('Visto')).toHaveLength(1);
  });

  it('el observer del bloque de firma se desconecta al desmontar el componente', () => {
    armarMock(docChico());
    const { unmount } = render(<DocumentoMandato />);

    const [observer] = FakeIntersectionObserver.instances;
    expect(observer).toBeDefined();
    expect(observer?.disconnect).not.toHaveBeenCalled();

    unmount();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
  });

  it('VISTO respeta reduced-motion vía la guarda global: el sello mantiene su clase anim-stampin (CSS apaga la animación)', () => {
    armarMock(docChico());
    render(<DocumentoMandato />);

    const [observer] = FakeIntersectionObserver.instances;
    act(() => {
      observer?.trigger(true);
    });

    expect(screen.getByText('Visto').className).toMatch(/anim-stampin/);
  });
});
