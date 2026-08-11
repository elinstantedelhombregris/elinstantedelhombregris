import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PAPEL_NAV_ALL, QUIEN_HREF, QUIEN_LABEL } from '../papel-nav';
import { PapelFooter } from '../PapelFooter';

describe('PapelFooter', () => {
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

  it('no promete datos de demostración: no hay ninguno', () => {
    // La base está en cero desde que se cerró D-002. Decir «datos de
    // demostración» prometía algo que dejó de existir.
    render(<PapelFooter />);
    expect(screen.queryByText(/datos de demostración/i)).not.toBeInTheDocument();
    expect(screen.getByText('Prototipo · todavía sin voces')).toBeInTheDocument();
  });
});
