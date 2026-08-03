import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PapelFooter } from '../PapelFooter';

describe('PapelFooter', () => {
  it('no promete datos de demostración: no hay ninguno', () => {
    // La base está en cero desde que se cerró D-002. Decir «datos de
    // demostración» prometía algo que dejó de existir.
    render(<PapelFooter />);
    expect(screen.queryByText(/datos de demostración/i)).not.toBeInTheDocument();
    expect(screen.getByText('Prototipo · todavía sin voces')).toBeInTheDocument();
  });
});
