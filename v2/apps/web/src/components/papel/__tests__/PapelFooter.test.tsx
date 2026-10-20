import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PAPEL_NAV, PAPEL_NAV_ALL, QUIEN_HREF, QUIEN_LABEL, SUMATE_LABEL } from '../papel-nav';
import { PapelFooter } from '../PapelFooter';

import { APORTAR_HREF } from '~/lib/participacion/aportar';

describe('PapelFooter', () => {
  it('ningún texto ni enlace usa el gris que no llega a contraste sobre el fondo oscuro', () => {
    const { container } = render(<PapelFooter />);
    expect(container.innerHTML).not.toMatch(/text-oscuro-tenue/);
  });

  it('invita a contar la vida de cada uno, con el verbo de la acción', () => {
    render(<PapelFooter />);
    expect(
      screen.getByText('Contanos qué querrías que fuera posible en tu vida.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/diseño compartido/)).not.toBeInTheDocument();
    // El mismo botón que el header: en el recorrido y en «El siguiente paso».
    const invitaciones = screen.getAllByRole('link', { name: SUMATE_LABEL });
    expect(invitaciones).toHaveLength(2);
    for (const invitacion of invitaciones) expect(invitacion).toHaveAttribute('href', APORTAR_HREF);
  });

  it('el recorrido es el del header: las cuatro puertas, sin el mapa ni la Radiografía sueltos', () => {
    render(<PapelFooter />);
    expect(PAPEL_NAV.map((item) => item.label)).toEqual([
      'La idea',
      'Mi Argentina ideal',
      'Campañas',
      'Biblioteca',
    ]);
    for (const item of PAPEL_NAV)
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href);
    // Cuelgan de Mi Argentina ideal en el header; en el footer no se repiten.
    expect(screen.queryByRole('link', { name: /mapa/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Radiografía/i })).not.toBeInTheDocument();
  });

  it('enlaza la política de privacidad desde la franja inferior', () => {
    render(<PapelFooter />);
    expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute(
      'href',
      '/politica-privacidad',
    );
  });

  it('el enlace a «Quién está detrás» vive en la franja inferior', () => {
    render(<PapelFooter />);
    expect(screen.getByRole('link', { name: QUIEN_LABEL })).toHaveAttribute('href', QUIEN_HREF);
  });

  it('la entrada es única: la página no está en el recorrido', () => {
    // Guardia de la decisión 1 de la spec. Si alguien agrega «Quién está
    // detrás» a PAPEL_NAV_ALL aparece en el header, en el menú móvil y en la
    // columna «Recorrido» del footer — y la página pasa a competir con la
    // idea, que es exactamente lo que dice que no hace.
    expect(PAPEL_NAV_ALL.some((item) => item.href === QUIEN_HREF)).toBe(false);
  });

  it('la simulación salió de la franja y del recorrido: su dirección queda sin puerta', () => {
    // Spec 2026-10-19 §7, D4: es el laboratorio del motor, no una parte del
    // recorrido. La página sigue andando; ninguna puerta del sitio la ofrece.
    const { container } = render(<PapelFooter />);
    expect(screen.queryByRole('link', { name: /simulaci/i })).not.toBeInTheDocument();
    expect(container.querySelector('a[href="/la-simulacion"]')).toBeNull();
    expect(PAPEL_NAV_ALL.some((item) => item.href === '/la-simulacion')).toBe(false);
  });

  it('no promete datos de demostración: no hay ninguno', () => {
    // La base está en cero desde que se cerró D-002. Decir «datos de
    // demostración» prometía algo que dejó de existir.
    render(<PapelFooter />);
    expect(screen.queryByText(/datos de demostración/i)).not.toBeInTheDocument();
    expect(screen.getByText('Diseño abierto · revisión continua')).toBeInTheDocument();
  });
});
