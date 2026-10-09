import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { RootLayout } from '../RootLayout';

vi.mock('~/components/Header', () => ({ Header: () => null }));
vi.mock('~/components/Footer', () => ({ Footer: () => null }));
vi.mock('~/components/papel/PapelHeader', () => ({ PapelHeader: () => null }));
vi.mock('~/components/papel/PapelFooter', () => ({ PapelFooter: () => null }));
vi.mock('~/components/papel/DespertarVeil', () => ({ DespertarVeil: () => null }));

/**
 * `html { color-scheme: dark }` es del v1 y sigue global. Sobre papel hace que las casillas y
 * los radios nativos se dibujen oscuros: una casilla SIN marcar parece marcada. Las dos casillas
 * obligatorias de publicar un aporte caían ahí. El papel declara `light` en su raíz y los
 * registros de noche que viven adentro lo vuelven a declarar `dark` en su contenedor.
 *
 * jsdom/happy-dom no procesan Tailwind, así que esto se verifica en dos mitades: la regla en el
 * CSS fuente y la clase que la hace valer en el DOM que se renderiza.
 */
const AQUI = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(AQUI, '..', '..', 'index.css'), 'utf8');

function declaraciones(selector: string): string {
  const escapado = selector.replace(/[.\\]/g, '\\$&');
  const bloque = new RegExp(`(?:^|\\n)\\s*${escapado}\\s*\\{([^}]*)\\}`).exec(CSS);
  expect(bloque, `no hay una regla «${selector}» en index.css`).not.toBeNull();
  return bloque?.[1] ?? '';
}

function montar(ruta: string) {
  const { hook } = memoryLocation({ path: ruta });
  return render(
    <Router hook={hook}>
      <RootLayout>
        <main>
          <label>
            <input type="checkbox" /> Acepto
          </label>
        </main>
      </RootLayout>
    </Router>,
  );
}

describe('el esquema de color del papel', () => {
  it('la raíz del papel declara color-scheme: light en el CSS', () => {
    expect(declaraciones('.papel-root')).toMatch(/color-scheme:\s*light\s*;/);
  });

  it('y pinta el acento de los controles con el violeta de la marca', () => {
    expect(declaraciones('.papel-root')).toMatch(
      /accent-color:\s*theme\(\s*['"]colors\.violeta\.DEFAULT['"]\s*\)\s*;/,
    );
  });

  it('el html del v1 sigue en oscuro: el override es solo del papel', () => {
    expect(declaraciones('html')).toMatch(/color-scheme:\s*dark\s*;/);
  });

  it('las páginas de papel cuelgan de un .papel-root, que es lo que la regla alcanza', () => {
    const { container } = montar('/mi-espacio');
    const raiz = container.querySelector('.papel-root');
    expect(raiz).not.toBeNull();
    expect(raiz?.querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it('las páginas del v1 no cuelgan del papel: conservan el esquema oscuro de html', () => {
    const { container } = montar('/cuaderno');
    expect(container.querySelector('.papel-root')).toBeNull();
  });
});
