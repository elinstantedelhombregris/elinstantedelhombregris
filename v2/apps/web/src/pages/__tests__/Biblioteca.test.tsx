import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Biblioteca } from '../Biblioteca';

import {
  CICLO_COUNT,
  CRONICA_COUNT,
  ENSAYO_COUNT,
  ULTIMAS_CRONICAS,
} from '~/pages/Biblioteca/biblioteca-data';

/**
 * Biblioteca.test.tsx — composer del hub papel 3.1. Ningún literal de
 * contenido derivado: los conteos se interpolan desde las mismas constantes
 * que consume el composer (patrón de Planes.test.tsx).
 */
describe('Biblioteca (página papel 3.1 — El hub, composer)', () => {
  it('abre con el kicker, el H1 con rito de la tinta y el lead con los conteos derivados', () => {
    render(<Biblioteca />);

    expect(screen.getByText('La biblioteca · leer también es hacer')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Papel, tinta y método.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${String(ENSAYO_COUNT)} ensayos en ${String(CICLO_COUNT)} ciclos`)),
    ).toBeInTheDocument();
    expect(screen.getByText(/Robate todo\.$/)).toBeInTheDocument();
  });

  it('destaca el manifiesto sin cifras, con link entero a /manifiesto', () => {
    render(<Biblioteca />);

    expect(screen.getByText('Documento fundacional')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'El manifiesto del hombre gris' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No es un programa: es un espejo. Si algo te resuena, ahí empieza.'),
    ).toBeInTheDocument();

    const link = screen.getByText('El manifiesto del hombre gris').closest('a');
    expect(link).toHaveAttribute('href', '/manifiesto');
    expect(link).toHaveTextContent('Leerlo entero →');

    expect(screen.queryByText(/seis partes|cinco minutos/i)).not.toBeInTheDocument();
  });

  it('presenta la bitácora real: últimas crónicas, categorías reales y link al total, sin asterisco de demo', () => {
    render(<Biblioteca />);

    expect(screen.getByText('Bitácora · lo que va pasando')).toBeInTheDocument();

    const verEntera = screen.getByRole('link', {
      name: `Ver la bitácora entera · ${String(CRONICA_COUNT)} crónicas →`,
    });
    expect(verEntera).toHaveAttribute('href', '/blog');

    for (const post of ULTIMAS_CRONICAS) {
      const titulo = screen.getByText(post.title);
      const enlace = titulo.closest('a');
      expect(enlace).toHaveAttribute('href', `/blog/${post.slug}`);
      if (enlace && post.category !== '') {
        expect(within(enlace).getByText(post.category)).toBeInTheDocument();
      }
    }

    expect(screen.queryByText(/datos de demostración/i)).not.toBeInTheDocument();
  });

  it('cierra con la banda que manda al mapa', () => {
    render(<Biblioteca />);

    expect(screen.getByRole('heading', { name: 'Leíste. Ahora decí.' })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Soltar mi voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('la deferral de entrenamientos queda pineada: la sección no se monta hasta 3.5', () => {
    render(<Biblioteca />);

    expect(screen.queryByText(/entrenamiento/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /entrenamientos/i })).not.toBeInTheDocument();
  });

  it('mata el chrome v1-port: sin header serif viejo, sin glass/gradient-text/iris-violet/font-serif', () => {
    const { container } = render(<Biblioteca />);

    expect(screen.queryByText('Pensamiento de fondo.')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });
});
