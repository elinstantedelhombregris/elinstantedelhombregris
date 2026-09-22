import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FuentesDeLeccion } from '../sections/FuentesDeLeccion';

describe('FuentesDeLeccion', () => {
  it('lista cada fuente con su link y la fecha de consulta en formato argentino', () => {
    render(
      <FuentesDeLeccion
        fuentes={[
          {
            url: 'https://www.argentina.gob.ar/aaip',
            titulo: 'La Agencia',
            consultada: '2026-09-22',
          },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'De dónde sale el caso' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'La Agencia ↗' })).toHaveAttribute(
      'href',
      'https://www.argentina.gob.ar/aaip',
    );
    expect(screen.getByText('consultada 22/09/2026')).toBeInTheDocument();
  });

  it('sin fuentes no pinta nada', () => {
    const { container } = render(<FuentesDeLeccion fuentes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
