import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { IndiceEnsayos } from '../sections/IndiceEnsayos';

import { CICLOS, contar, minutosDeCiclo } from '~/pages/Biblioteca/biblioteca-data';

/**
 * IndiceEnsayos.test.tsx — la estantería de ciclos (spec 2026-08-20 §4):
 * tapas en grilla + acordeón de un ciclo por vez, con las filas expandibles
 * de siempre adentro. Cero literales de contenido: todo sale de CICLOS.
 */

function tapaDe(rotulo: string): HTMLElement {
  const tapa = screen
    .getAllByRole('button')
    .find(
      (b) =>
        b.getAttribute('aria-controls') === 'panel-ciclo-abierto' &&
        b.textContent.includes(rotulo),
    );
  expect(tapa).toBeDefined();
  if (!tapa) throw new Error(`sin tapa para ${rotulo}`);
  return tapa;
}

describe('IndiceEnsayos — las tapas', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('una tapa por ciclo, con rótulo, descripción y meta real (conteo, minutos, fecha)', () => {
    render(<IndiceEnsayos />);
    for (const ciclo of CICLOS) {
      const tapa = tapaDe(ciclo.rotulo);
      expect(tapa).toHaveTextContent(contar(ciclo.ensayos.length, 'ensayo', 'ensayos'));
      const minutos = minutosDeCiclo(ciclo);
      if (minutos > 0) expect(tapa).toHaveTextContent(`${String(minutos)} min`);
      expect(tapa).toHaveTextContent(ciclo.fecha);
      if (ciclo.descripcion) expect(tapa).toHaveTextContent(ciclo.descripcion);
    }
  });

  it('por defecto el primer ciclo está abierto: su tapa expandida y sus filas presentes', () => {
    render(<IndiceEnsayos />);
    const primero = CICLOS[0];
    expect(primero).toBeDefined();
    if (!primero) return;
    expect(tapaDe(primero.rotulo)).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region');
    for (const ensayo of primero.ensayos) {
      expect(within(panel).getByText(ensayo.title)).toBeInTheDocument();
    }
  });

  it('con señalador guardado, abre el ciclo del señalador', () => {
    const ultimo = CICLOS[CICLOS.length - 1];
    const ensayo = ultimo?.ensayos[0];
    expect(ensayo).toBeDefined();
    if (!ultimo || !ensayo) return;
    window.localStorage.setItem('basta_senalador', ensayo.slug);
    render(<IndiceEnsayos />);
    expect(tapaDe(ultimo.rotulo)).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('IndiceEnsayos — el acordeón', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('abrir otro ciclo cierra el anterior; solo un panel a la vez', () => {
    render(<IndiceEnsayos />);
    const [primero, segundo] = CICLOS;
    expect(primero && segundo).toBeTruthy();
    if (!primero || !segundo) return;
    fireEvent.click(tapaDe(segundo.rotulo));
    expect(tapaDe(segundo.rotulo)).toHaveAttribute('aria-expanded', 'true');
    expect(tapaDe(primero.rotulo)).toHaveAttribute('aria-expanded', 'false');
    const panel = screen.getByRole('region');
    expect(within(panel).queryByText(primero.ensayos[0]?.title ?? '—')).not.toBeInTheDocument();
  });

  it('tocar la tapa abierta cierra todo', () => {
    render(<IndiceEnsayos />);
    const primero = CICLOS[0];
    if (!primero) return;
    fireEvent.click(tapaDe(primero.rotulo));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('las filas del ciclo abierto conservan la apertura única y el link con minutos', () => {
    render(<IndiceEnsayos />);
    const primero = CICLOS[0];
    const ensayo = primero?.ensayos.find((e) => e.form !== 'acta');
    if (!primero || !ensayo) return;
    const fila = screen.getByText(ensayo.title).closest('button');
    expect(fila).not.toBeNull();
    if (!fila) return;
    fireEvent.click(fila);
    expect(screen.getByText(`«${ensayo.summary}»`)).toBeInTheDocument();
    const tramo = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';
    expect(screen.getByRole('link', { name: `Leer el ensayo completo${tramo} →` })).toHaveAttribute(
      'href',
      `/ensayos/${ensayo.slug}`,
    );
    const abiertos = screen
      .getAllByRole('button', { expanded: true })
      .filter((b) => b.getAttribute('aria-controls') !== 'panel-ciclo-abierto');
    expect(abiertos).toHaveLength(1);
  });
});
