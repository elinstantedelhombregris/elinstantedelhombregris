import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Palitos } from './Palitos';

describe('Palitos', () => {
  it('n={7} dibuja 2 grupos (5 + 2): 7 trazos en total y el contenedor va aria-hidden', () => {
    const { container } = render(<Palitos n={7} claseRelleno="bg-violeta" />);
    const contenedor = container.firstElementChild;
    expect(contenedor).toHaveAttribute('aria-hidden');
    expect(contenedor?.children).toHaveLength(2);
    expect(container.querySelectorAll('.anim-semgrow')).toHaveLength(7);
  });

  it('n={0} no dibuja ningún trazo', () => {
    const { container } = render(<Palitos n={0} claseRelleno="bg-violeta" />);
    expect(container.querySelectorAll('.anim-semgrow')).toHaveLength(0);
  });
});
