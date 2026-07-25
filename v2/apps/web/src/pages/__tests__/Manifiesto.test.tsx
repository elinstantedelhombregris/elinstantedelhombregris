import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

describe('Manifiesto (página papel 3.3 — el lector, composer)', () => {
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
});
