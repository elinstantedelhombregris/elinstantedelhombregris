import { act, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Manifiesto } from '../Manifiesto';

import { MANIFIESTO, PARTE_COUNT } from '~/pages/Manifiesto/manifiesto-data';

/**
 * Manifiesto.test.tsx — lector papel 3.3. Ningún literal de contenido salvo
 * fragmentos reales del propio documento, computados desde `MANIFIESTO`
 * (patrón de `Biblioteca.test.tsx` / `manifiesto-data.test.ts`).
 */
function escapeRegExp(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * happy-dom trae un `IntersectionObserver` propio pero nunca dispara
 * callbacks reales (no hay layout/paint) — lo reemplazamos por uno de
 * juguete que guarda el callback para que el test lo dispare a mano.
 * Copiado literal de `ElMandatoVivo/sections/__tests__/DocumentoMandato.test.tsx:19-47`.
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

describe('Manifiesto (página papel 3.3 — el lector, composer)', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
  });

  it('abre con el kicker, el H1 con rito de la tinta sobre el título del cuerpo y el backlink a la biblioteca', () => {
    render(<Manifiesto />);

    expect(
      screen.getByText(`El manifiesto · documento fundacional · ${String(PARTE_COUNT)} partes`),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: MANIFIESTO.titulo })).toBeInTheDocument();

    const backlink = screen.getByText('← La biblioteca');
    expect(backlink).toHaveAttribute('href', '/biblioteca');
  });

  it('renderiza la apertura verbatim', () => {
    render(<Manifiesto />);

    const primerParrafo = MANIFIESTO.apertura.trim().split('\n\n')[0] ?? '';
    const fragmento = primerParrafo.replace(/[*_]/g, '').slice(0, 40);
    expect(screen.getByText(new RegExp(escapeRegExp(fragmento)))).toBeInTheDocument();
  });

  it('el sumario ancla cada parte por su id, con el encabezado verbatim, y anuncia el recorrido', () => {
    render(<Manifiesto />);

    const nav = screen.getByRole('navigation', { name: 'Las partes del manifiesto' });
    expect(within(nav).getByText(`El recorrido · ${String(PARTE_COUNT)} partes`)).toBeInTheDocument();

    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(PARTE_COUNT);
    MANIFIESTO.partes.forEach((parte, i) => {
      expect(links[i]).toHaveAttribute('href', `#${parte.id}`);
      expect(links[i]).toHaveTextContent(parte.encabezado);
    });
  });

  it('renderiza PARTE_COUNT partes con su encabezado verbatim, ancladas por su id', () => {
    render(<Manifiesto />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(PARTE_COUNT);
    MANIFIESTO.partes.forEach((parte, i) => {
      expect(headings[i]).toHaveTextContent(parte.encabezado);
    });

    for (const parte of MANIFIESTO.partes) {
      expect(document.getElementById(parte.id)).not.toBeNull();
    }
  });

  it('firma el documento y cierra con el CTA al mapa', () => {
    render(<Manifiesto />);

    expect(screen.getByText('— El hombre gris')).toBeInTheDocument();
    expect(
      screen.getByText('El manifiesto no te pide que lo firmes. Te pide que lo hagas.'),
    ).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: 'Soltar mi voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('edición impresa: el article lleva edicion-impresa, el folio se imprime, la navegación y el cierre no', () => {
    const { container } = render(<Manifiesto />);

    const article = container.querySelector('article');
    expect(article).toHaveClass('edicion-impresa');

    const folio = screen.getByText(/¡BASTA! · edición del lector ·/);
    expect(folio).toHaveClass('hidden');
    expect(folio).toHaveClass('print:block');

    const backlink = screen.getByText('← La biblioteca');
    expect(backlink).toHaveClass('print:hidden');

    const nav = screen.getByRole('navigation', { name: 'Las partes del manifiesto' });
    expect(nav).toHaveClass('print:hidden');

    const cierre = screen
      .getByText('El manifiesto no te pide que lo firmes. Te pide que lo hagas.')
      .closest('div');
    expect(cierre).toHaveClass('print:hidden');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('print:[&_span]:animate-none');
  });

  it('mata el chrome v1-port: sin glass/gradient-text/iris-violet/font-serif/MdxContent', () => {
    const { container } = render(<Manifiesto />);

    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
    expect(container.innerHTML).not.toMatch(/MdxContent/);
  });

  it('sin cifras inventadas: ni minutos ni "min de lectura"', () => {
    render(<Manifiesto />);
    expect(screen.queryByText(/minutos|min de lectura/i)).not.toBeInTheDocument();
  });

  it('el sello LEÍDO ENTERO no aparece antes de que la firma entre en viewport', () => {
    render(<Manifiesto />);
    expect(screen.queryByText(/leído entero/i)).not.toBeInTheDocument();
  });

  it('el sello LEÍDO ENTERO cae una sola vez cuando la firma intersecta al 60%, y el observer se desconecta', () => {
    render(<Manifiesto />);

    const [observer] = FakeIntersectionObserver.instances;
    expect(observer).toBeDefined();
    expect(observer?.disconnect).not.toHaveBeenCalled();

    act(() => {
      observer?.trigger(true);
    });

    const estado = screen.getByRole('status');
    expect(within(estado).getByText('Leído entero')).toBeInTheDocument();
    expect(within(estado).getByText('Llegaste al final. Ahora empieza la parte tuya.')).toBeInTheDocument();
    expect(observer?.disconnect).toHaveBeenCalledTimes(1);

    // Una sola vez: disparar false después de haber disparado true no lo borra.
    act(() => {
      observer?.trigger(false);
    });
    expect(screen.getAllByText('Leído entero')).toHaveLength(1);
  });

  it('el sello LEÍDO ENTERO no se imprime', () => {
    render(<Manifiesto />);

    const [observer] = FakeIntersectionObserver.instances;
    act(() => {
      observer?.trigger(true);
    });

    const estado = screen.getByRole('status');
    expect(estado).toHaveClass('print:hidden');
  });

  it('el sello LEÍDO ENTERO no persiste: desmontar y volver a montar no lo mantiene, y no toca localStorage', () => {
    const clavesAntes = localStorage.length;
    const { unmount } = render(<Manifiesto />);

    const [observer] = FakeIntersectionObserver.instances;
    act(() => {
      observer?.trigger(true);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();

    unmount();

    render(<Manifiesto />);
    expect(screen.queryByText(/leído entero/i)).not.toBeInTheDocument();
    expect(localStorage.length).toBe(clavesAntes);
  });
});
