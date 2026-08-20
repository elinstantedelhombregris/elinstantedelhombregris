import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { PuertaDeHoy } from '../sections/PuertaDeHoy';

import {
  BITACORA_DESTACADA,
  fechaLarga,
  HREF_BITACORA,
  HREF_MANIFIESTO,
  ORDEN_DE_LECTURA,
  PRIMER_ENSAYO,
  ubicarEnsayo,
} from '~/pages/Biblioteca/biblioteca-data';

describe('PuertaDeHoy — las tres puertas', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('sin señalador: de cero → manifiesto, a pensar → primer ensayo, qué pasó → bitácora', () => {
    render(<PuertaDeHoy />);

    expect(screen.getByText('¿Venís de cero?').closest('a')).toHaveAttribute(
      'href',
      HREF_MANIFIESTO,
    );

    expect(PRIMER_ENSAYO).not.toBeNull();
    if (PRIMER_ENSAYO) {
      expect(screen.getByText('¿Venís a pensar?').closest('a')).toHaveAttribute(
        'href',
        `/ensayos/${PRIMER_ENSAYO.slug}`,
      );
      expect(screen.getByText(`«${PRIMER_ENSAYO.title}»`)).toBeInTheDocument();
    }

    const puertaBitacora = screen.getByText('¿Venís a ver qué pasó?').closest('a');
    expect(puertaBitacora).toHaveAttribute('href', HREF_BITACORA);
    if (BITACORA_DESTACADA) {
      expect(puertaBitacora).toHaveTextContent(fechaLarga(BITACORA_DESTACADA.publishedAt));
    }
  });

  it('con señalador válido, la puerta del medio retoma con la posición real', () => {
    const guardado = ORDEN_DE_LECTURA[2] ?? ORDEN_DE_LECTURA[0];
    expect(guardado).toBeDefined();
    if (!guardado) return;
    window.localStorage.setItem('basta_senalador', guardado.slug);

    render(<PuertaDeHoy />);

    const puerta = screen.getByText('Estabas leyendo').closest('a');
    expect(puerta).toHaveAttribute('href', `/ensayos/${guardado.slug}`);
    const ubicacion = ubicarEnsayo(guardado.slug);
    expect(ubicacion).not.toBeNull();
    if (ubicacion) {
      expect(puerta).toHaveTextContent(
        `Ciclo ${ubicacion.ciclo.romano} · ${String(ubicacion.posicion)} de ${String(ubicacion.total)}`,
      );
    }
    expect(screen.queryByText('¿Venís a pensar?')).not.toBeInTheDocument();
  });

  it('con señalador fantasma (slug retirado), vuelven las puertas fijas', () => {
    window.localStorage.setItem('basta_senalador', 'ensayo-que-no-existe');

    render(<PuertaDeHoy />);

    expect(screen.getByText('¿Venís a pensar?')).toBeInTheDocument();
    expect(screen.queryByText('Estabas leyendo')).not.toBeInTheDocument();
  });
});
