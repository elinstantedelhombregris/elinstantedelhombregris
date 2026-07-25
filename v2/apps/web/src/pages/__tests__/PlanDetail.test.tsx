import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { PlanDetail } from '../PlanDetail';

import { PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

/** Monta `PlanDetail` con la ubicación de wouter fijada al path dado. */
function renderAt(path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <Router hook={hook}>
      <PlanDetail />
    </Router>,
  );
}

describe('PlanDetail (página papel 2.4 — La prueba, el lector)', () => {
  it('expediente PLANJUS: sello EJEMPLO, línea de autoría, cabecera y primer encabezado del MDX verbatim', async () => {
    renderAt('/planes/planjus');

    expect(screen.getByText('Ejemplo')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Esto lo escribió uno solo. Leelo para criticarlo, mejorarlo o reemplazarlo.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('PLANJUS · prueba, no doctrina')).toBeInTheDocument();
    expect(screen.getByText(`expediente 01/${String(PLAN_COUNT)}`)).toBeInTheDocument();
    expect(screen.getByText(`La prueba · expediente 01/${String(PLAN_COUNT)}`)).toBeInTheDocument();

    // El primer encabezado real del cuerpo MDX (verbatim, tras la carga
    // async); el title del frontmatter ("La justicia que tenemos no es la
    // justicia que merecemos") no se duplica como elemento propio encima
    // del cuerpo — solo aparece dentro del bloque de portada, en mayúsculas
    // y partido en dos líneas.
    expect(
      await screen.findByRole('heading', {
        name: 'PREÁMBULO — EL DERECHO A UNA JUSTICIA QUE FUNCIONE',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('La justicia que tenemos no es la justicia que merecemos'),
    ).not.toBeInTheDocument();
  });

  it('expediente PLANJUS: backlink a /planes y pie con conversión + firma', () => {
    renderAt('/planes/planjus');

    const backlink = screen.getByRole('link', { name: '← Volver a la prueba' });
    expect(backlink).toHaveAttribute('href', '/planes');

    expect(screen.getByText(/¿Lo podés mejorar\? Esa es la idea\./)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Soltá tu voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
    expect(screen.getByText('— El hombre gris')).toBeInTheDocument();
  });

  it('meta PLANRUTA: kicker "el plan meta" y cabecera sin numerador de expediente', () => {
    renderAt('/planes/planruta');

    expect(screen.getByText('La prueba · el plan meta')).toBeInTheDocument();
    expect(screen.getByText('PLANRUTA · prueba, no doctrina')).toBeInTheDocument();
    expect(screen.getByText('el plan meta')).toBeInTheDocument();
    expect(screen.queryByText(/expediente \d+\//)).not.toBeInTheDocument();
  });

  it('edición impresa §10.8: article y folio con clases print, barra + pie con print:hidden, sello se imprime', () => {
    const { container } = renderAt('/planes/planjus');

    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article).toHaveClass('edicion-impresa');
    expect(article).toHaveClass('print:shadow-none');

    const folio = screen.getByText(/¡BASTA! · edición del lector ·/);
    expect(folio).toHaveClass('hidden');
    expect(folio).toHaveClass('print:block');

    const backlink = screen.getByRole('link', { name: '← Volver a la prueba' });
    expect(backlink.closest('div')).toHaveClass('print:hidden');

    const conversion = screen.getByText(/¿Lo podés mejorar\? Esa es la idea\./);
    expect(conversion.closest('p')).toHaveClass('print:hidden');

    const sello = screen.getByText('Ejemplo');
    expect(sello.className).not.toMatch(/print:hidden/);
  });

  it('404 expediente: kicker, título Anton, sello Extraviado y CTA de vuelta', () => {
    renderAt('/planes/no-existe');

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ese plan no está.' })).toBeInTheDocument();
    expect(screen.getByText('Extraviado')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Volver a la prueba →' });
    expect(cta).toHaveAttribute('href', '/planes');
  });

  it('mata el chrome v1-port: sin glass, gradient-text, iris-violet ni serif viejo', () => {
    const { container } = renderAt('/planes/planjus');

    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });

  it('muestra el cuerpo del documento después de cargarlo, y la ficha aparte', async () => {
    window.history.pushState({}, '', '/planes/planjus');
    render(<PlanDetail />);

    // El aviso de carga primero.
    expect(screen.getByText('Abriendo el expediente…')).toBeInTheDocument();

    // Después el documento.
    const ficha = await screen.findByText(
      'Ficha del expediente — presupuesto, instrumento legal, tranche, gates',
    );
    expect(ficha).toBeInTheDocument();

    // La ficha entra plegada.
    const details = ficha.closest('details');
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
  });

  it('el 404 no intenta cargar ningún cuerpo', () => {
    window.history.pushState({}, '', '/planes/planvej');
    render(<PlanDetail />);

    expect(screen.getByText('Ese plan no está.')).toBeInTheDocument();
    expect(screen.queryByText('Abriendo el expediente…')).not.toBeInTheDocument();
  });
});
