import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IndiceEnsayos } from '../sections/IndiceEnsayos';

import { CICLO_COUNT, CICLOS, ORDEN_DE_LECTURA } from '~/pages/Biblioteca/biblioteca-data';

/**
 * IndiceEnsayos.test.tsx — § 3 de la spec: los {C} ciclos con pliegue de
 * apertura única global. Cero literales de contenido: cada expectativa se
 * arma desde CICLOS/ORDEN_DE_LECTURA (el registry manda).
 */

function textoDelLink(base: string, minutos: number): string {
  const tramo = minutos > 0 ? ` · ${String(minutos)} min` : '';
  return `${base}${tramo} →`;
}

describe('IndiceEnsayos — encabezado y estructura por ciclo', () => {
  it('el encabezado interpola CICLO_COUNT, nunca un literal', () => {
    render(<IndiceEnsayos />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: `Ensayos · ${String(CICLO_COUNT)} ciclos · tocá para abrir`,
      }),
    ).toBeInTheDocument();
  });

  it('un h3 por ciclo con su rótulo; la línea mono trae romano/conteo/fecha; la descripción aparece cuando existe', () => {
    render(<IndiceEnsayos />);

    for (const ciclo of CICLOS) {
      const encabezado = screen.getByRole('heading', { level: 3, name: ciclo.rotulo });
      const bloque = encabezado.closest('div');
      expect(bloque).not.toBeNull();
      expect(bloque?.textContent).toContain(`Ciclo ${ciclo.romano}`);
      expect(bloque?.textContent).toContain(`${String(ciclo.ensayos.length)} ensayos`);
      expect(bloque?.textContent).toContain(ciclo.fecha);
      if (ciclo.descripcion) {
        expect(bloque?.textContent).toContain(ciclo.descripcion);
      }
    }
  });

  it('renderiza ORDEN_DE_LECTURA.length filas cerradas; la primera es 01 + el título del primer ensayo del primer ciclo', () => {
    render(<IndiceEnsayos />);

    const filas = screen.getAllByRole('button', { expanded: false });
    expect(filas).toHaveLength(ORDEN_DE_LECTURA.length);

    const primerEnsayo = CICLOS[0]?.ensayos[0];
    expect(primerEnsayo).toBeDefined();
    if (!primerEnsayo) return;

    expect(filas[0]).toHaveTextContent('01');
    expect(filas[0]).toHaveTextContent(primerEnsayo.title);
  });
});

describe('IndiceEnsayos — apertura única global', () => {
  it('abrir una fila del primer ciclo muestra summary y link con href real', () => {
    render(<IndiceEnsayos />);

    const primerCiclo = CICLOS[0];
    expect(primerCiclo).toBeDefined();
    if (!primerCiclo) return;
    const ensayo = primerCiclo.ensayos.find((e) => e.form !== 'acta');
    expect(ensayo).toBeDefined();
    if (!ensayo) return;

    const fila = screen.getByText(ensayo.title).closest('button');
    expect(fila).not.toBeNull();
    if (!fila) return;
    fireEvent.click(fila);

    expect(screen.getByText(`«${ensayo.summary}»`)).toBeInTheDocument();
    const nombreLink = textoDelLink('Leer el ensayo completo', ensayo.readingMinutes);
    expect(screen.getByRole('link', { name: nombreLink })).toHaveAttribute(
      'href',
      `/ensayos/${ensayo.slug}`,
    );
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
  });

  it('abrir una fila del último ciclo cierra la anterior (un solo aria-expanded true)', () => {
    render(<IndiceEnsayos />);

    const primerCiclo = CICLOS[0];
    const ultimoCiclo = CICLOS.at(-1);
    expect(primerCiclo).toBeDefined();
    expect(ultimoCiclo).toBeDefined();
    if (!primerCiclo || !ultimoCiclo) return;

    const ensayoPrimerCiclo = primerCiclo.ensayos.find((e) => e.form !== 'acta');
    const ensayoUltimoCiclo = ultimoCiclo.ensayos.find((e) => e.form !== 'acta');
    expect(ensayoPrimerCiclo).toBeDefined();
    expect(ensayoUltimoCiclo).toBeDefined();
    if (!ensayoPrimerCiclo || !ensayoUltimoCiclo) return;

    const filaPrimero = screen.getByText(ensayoPrimerCiclo.title).closest('button');
    expect(filaPrimero).not.toBeNull();
    if (!filaPrimero) return;
    fireEvent.click(filaPrimero);
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    const filaUltimo = screen.getByText(ensayoUltimoCiclo.title).closest('button');
    expect(filaUltimo).not.toBeNull();
    if (!filaUltimo) return;
    fireEvent.click(filaUltimo);

    expect(screen.queryByText(`«${ensayoPrimerCiclo.summary}»`)).not.toBeInTheDocument();
    expect(screen.getByText(`«${ensayoUltimoCiclo.summary}»`)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
  });

  it('click en la fila abierta la cierra (cero filas expandidas)', () => {
    render(<IndiceEnsayos />);

    const primerEnsayo = CICLOS[0]?.ensayos.find((e) => e.form !== 'acta');
    expect(primerEnsayo).toBeDefined();
    if (!primerEnsayo) return;

    const fila = screen.getByText(primerEnsayo.title).closest('button');
    expect(fila).not.toBeNull();
    if (!fila) return;

    fireEvent.click(fila);
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    fireEvent.click(fila);
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
  });
});

describe('IndiceEnsayos — el acta', () => {
  it('la fila con form === acta muestra la marca y su pliegue dice "Leer el acta completa"', () => {
    render(<IndiceEnsayos />);

    const acta = ORDEN_DE_LECTURA.find((e) => e.form === 'acta');
    expect(acta).toBeDefined();
    if (!acta) return;

    const fila = screen.getByText(acta.title).closest('button');
    expect(fila).not.toBeNull();
    if (!fila) return;
    expect(fila).toHaveTextContent('acta');

    fireEvent.click(fila);
    const nombreLink = textoDelLink('Leer el acta completa', acta.readingMinutes);
    expect(screen.getByRole('link', { name: nombreLink })).toHaveAttribute(
      'href',
      `/ensayos/${acta.slug}`,
    );
  });
});

describe('IndiceEnsayos — chrome muerto', () => {
  it('sin glass, gradient-text ni iris-violet en el HTML renderizado', () => {
    const { container } = render(<IndiceEnsayos />);

    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
  });
});
