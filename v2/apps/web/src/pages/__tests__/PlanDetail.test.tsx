import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { PlanDetail } from '../PlanDetail';

import * as plansRegistry from '~/lib/plans-registry';
import { PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

// El registro (índice + `findPlanBySlug`, etc.) queda real: la página lo
// necesita para resolver el slug y pintar la cabecera. Solo `cargarCuerpoPlan`
// se reemplaza por un mock que, por default, delega a la implementación real
// — los tests de fallo lo pisan puntualmente con `mockRejectedValueOnce`.
vi.mock('~/lib/plans-registry', async (importOriginal) => {
  const actual = await importOriginal<typeof plansRegistry>();
  return {
    ...actual,
    cargarCuerpoPlan: vi.fn(actual.cargarCuerpoPlan),
  };
});

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

  it('si cargarCuerpoPlan rechaza, se ve el aviso de fallo y no queda el de carga', async () => {
    vi.mocked(plansRegistry.cargarCuerpoPlan).mockRejectedValueOnce(
      new Error('chunk load error'),
    );
    renderAt('/planes/planjus');

    expect(await screen.findByText(/Este expediente no abrió\./)).toBeInTheDocument();
    expect(screen.queryByText('Abriendo el expediente…')).not.toBeInTheDocument();
  });

  it('el aviso de fallo trae un botón para recargar la página entera', async () => {
    vi.mocked(plansRegistry.cargarCuerpoPlan).mockRejectedValueOnce(
      new Error('network blip'),
    );
    renderAt('/planes/planjus');

    const boton = await screen.findByRole('button', { name: 'Recargar la página' });
    expect(boton).toBeInTheDocument();

    // Se puede espiar `reload` sin reemplazar `window.location` entero: en
    // happy-dom es un método real de instancia, no una navegación nativa que
    // haya que shimmear. Confirma que el botón está cableado al reload real.
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
    fireEvent.click(boton);
    expect(reloadSpy).toHaveBeenCalledTimes(1);
    reloadSpy.mockRestore();
  });

  it('al cambiar de código, el cuerpo del plan anterior se saca de pantalla', async () => {
    const { hook: hookJus } = memoryLocation({ path: '/planes/planjus', static: true });
    const { rerender } = render(
      <Router hook={hookJus}>
        <PlanDetail />
      </Router>,
    );

    expect(
      await screen.findByRole('heading', {
        name: 'PREÁMBULO — EL DERECHO A UNA JUSTICIA QUE FUNCIONE',
      }),
    ).toBeInTheDocument();

    const { hook: hookRuta } = memoryLocation({ path: '/planes/planruta', static: true });
    rerender(
      <Router hook={hookRuta}>
        <PlanDetail />
      </Router>,
    );

    // El body del plan viejo ya no está, aunque el nuevo todavía esté en camino.
    expect(
      screen.queryByRole('heading', {
        name: 'PREÁMBULO — EL DERECHO A UNA JUSTICIA QUE FUNCIONE',
      }),
    ).not.toBeInTheDocument();

    expect(
      await screen.findByRole('heading', {
        name: 'PLANRUTA — Protocolo Nacional de Ruta de Arranque y Disciplina de Portfolio',
      }),
    ).toBeInTheDocument();
  });
});
