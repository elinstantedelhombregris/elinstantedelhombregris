import { render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { EscenasDeCronica } from '../EscenasDeCronica';

// La escena de verdad baja three y pide WebGL 2; acá alcanza con saber dónde se montó.
vi.mock('../Escena', () => ({
  Escena: ({ nombre }: { nombre: string }) => <span data-testid="escena">{nombre}</span>,
}));

const HTML = `
  <p>Antes.</p>
  <figure><div data-escena="horas"></div><figcaption>Las horas.</figcaption></figure>
  <figure><div data-escena="no-existe"></div></figure>
  <figure><div data-escena="velo"></div></figure>
`;

function Cronica() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />
      <EscenasDeCronica contenedor={ref} />
    </>
  );
}

describe('EscenasDeCronica', () => {
  it('monta cada escena conocida adentro de su hueco, y deja vacío el que no existe', () => {
    const { container } = render(<Cronica />);
    const huecos = container.querySelectorAll<HTMLElement>('[data-escena]');
    expect(huecos).toHaveLength(3);
    expect(huecos[0]?.textContent).toBe('horas');
    expect(huecos[1]?.textContent).toBe('');
    expect(huecos[2]?.textContent).toBe('velo');
  });

  it('la escena queda antes del epígrafe que la describe', () => {
    const { container } = render(<Cronica />);
    const figura = container.querySelector('figure');
    expect(figura?.firstElementChild?.getAttribute('data-escena')).toBe('horas');
    expect(figura?.lastElementChild?.tagName).toBe('FIGCAPTION');
  });
});
