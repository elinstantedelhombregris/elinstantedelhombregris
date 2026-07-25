import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Cronica } from '../Cronica';

import { CRONICA_CHAPTERS } from '~/lib/cronica-registry';
import { CAPITULO_COUNT, idCapitulo } from '~/pages/Cronica/cronica-data';

/**
 * Cronica.test.tsx — lector papel 3.6. Cero literales de conteo o de
 * contenido salvo fragmentos reales del propio registry, computados desde
 * `CRONICA_CHAPTERS`/`CAPITULO_COUNT` (patrón de `Manifiesto.test.tsx`). La
 * única cita fija es la frase keystone de D2, transcripta carácter por
 * carácter — igual que en la spec y el plan.
 */
function escapeRegExp(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('Cronica (página papel 3.6 — el lector, composer)', () => {
  it('abre con el kicker de advertencia de ficción, el H1 con rito de la tinta y el backlink a la biblioteca', () => {
    render(<Cronica />);

    expect(
      screen.getByText('La crónica del país que viene · ficción especulativa'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'La crónica del país que viene.' }),
    ).toBeInTheDocument();

    const backlink = screen.getByText('← La biblioteca');
    expect(backlink).toHaveAttribute('href', '/biblioteca');
  });

  it('el lead deriva CAPITULO_COUNT y cita la frase keystone de D2 verbatim, sin número interpolado adentro', () => {
    render(<Cronica />);

    expect(
      screen.getByText(
        new RegExp(`${String(CAPITULO_COUNT)} capítulos que imaginan, desde el futuro`),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /No es una predicción\. Es un ejercicio para ver que otro camino es posible\./,
      ),
    ).toBeInTheDocument();
  });

  it('el sumario ancla cada capítulo por su id (computado), con título y año, y anuncia el recorrido', () => {
    render(<Cronica />);

    const nav = screen.getByRole('navigation', { name: 'Los capítulos de la crónica' });
    expect(
      within(nav).getByText(`El recorrido · ${String(CAPITULO_COUNT)} capítulos`),
    ).toBeInTheDocument();

    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(CRONICA_CHAPTERS.length);
    CRONICA_CHAPTERS.forEach((capitulo, i) => {
      const link = links[i];
      expect(link).toHaveAttribute('href', `#${idCapitulo(capitulo)}`);
      expect(link).toHaveTextContent(capitulo.title);
      expect(link).toHaveTextContent(capitulo.subtitle);
    });
  });

  it('renderiza los 5 capítulos anclados por su id, cada uno con H2 y epígrafe verbatim', () => {
    const { container } = render(<Cronica />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(CRONICA_CHAPTERS.length);

    CRONICA_CHAPTERS.forEach((capitulo, i) => {
      expect(headings[i]).toHaveTextContent(capitulo.title);
      expect(container.querySelector(`#${idCapitulo(capitulo)}`)).not.toBeNull();
      expect(screen.getByText(capitulo.epigraph)).toBeInTheDocument();
    });
  });

  it('el cuerpo de cada capítulo sale verbatim vía MdxPapel — un fragmento real del body está presente', () => {
    render(<Cronica />);

    for (const capitulo of CRONICA_CHAPTERS) {
      const primerParrafo = capitulo.body.trim().split('\n\n')[0] ?? '';
      const fragmento = primerParrafo.replace(/[*_]/g, '').slice(0, 30);
      expect(screen.getByText(new RegExp(escapeRegExp(fragmento)))).toBeInTheDocument();
    }
  });

  it('el kicker de capítulo interpola orderIndex, CAPITULO_COUNT y subtitle — no violeta', () => {
    render(<Cronica />);

    const medio = CRONICA_CHAPTERS[2];
    expect(medio).toBeDefined();
    if (!medio) return;

    const kicker = screen.getByText(
      `Capítulo ${String(medio.orderIndex)} de ${String(CAPITULO_COUNT)} · ${medio.subtitle}`,
    );
    expect(kicker).toBeInTheDocument();
    expect(kicker).not.toHaveClass('text-violeta');
  });

  it('firma el documento una sola vez, después del quinto capítulo', () => {
    render(<Cronica />);
    expect(screen.getAllByText('— El hombre gris')).toHaveLength(1);
  });

  it('cierra con el CTA al mapa', () => {
    render(<Cronica />);

    expect(screen.getByText('Esto es ficción. Lo que sigue, no.')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Soltar mi voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('edición impresa: el article lleva edicion-impresa, el folio se imprime, backlink/sumario/cierre no', () => {
    const { container } = render(<Cronica />);

    const article = container.querySelector('article');
    expect(article).toHaveClass('edicion-impresa');

    const folio = screen.getByText(/¡BASTA! · edición del lector ·/);
    expect(folio).toHaveClass('hidden');
    expect(folio).toHaveClass('print:block');

    const backlink = screen.getByText('← La biblioteca');
    expect(backlink).toHaveClass('print:hidden');

    const nav = screen.getByRole('navigation', { name: 'Los capítulos de la crónica' });
    expect(nav).toHaveClass('print:hidden');

    const cierre = screen.getByText('Esto es ficción. Lo que sigue, no.').closest('div');
    expect(cierre).toHaveClass('print:hidden');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('print:[&_span]:animate-none');
  });

  it('sin sello: ningún estampado del catálogo cerrado §10.5 aparece en esta página', () => {
    render(<Cronica />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText(/^leído entero$/i)).not.toBeInTheDocument();
  });

  it('mata el chrome v1-port: sin glass/gradient-text/iris-violet/font-serif', () => {
    const { container } = render(<Cronica />);

    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });
});
