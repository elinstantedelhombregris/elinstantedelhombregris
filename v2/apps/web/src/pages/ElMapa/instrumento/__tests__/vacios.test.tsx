import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MODOS } from '../catalogo-modos';
import { Vacio } from '../Vacio';

describe('Vacio', () => {
  it('muestra su título, su cuerpo y su acción', () => {
    render(
      <Vacio
        titulo="Todavía no habló nadie."
        cuerpo="La primera voz del mapa puede ser la tuya."
        accion={{ href: '#soltar', etiqueta: 'Soltar la primera voz' }}
      />,
    );
    expect(screen.getByText('Todavía no habló nadie.')).toBeInTheDocument();
    expect(screen.getByText('La primera voz del mapa puede ser la tuya.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /soltar la primera voz/i })).toHaveAttribute(
      'href',
      '#soltar',
    );
  });

  it('la acción es opcional', () => {
    render(
      <Vacio
        titulo="La línea arranca cuando alguien la arranque."
        cuerpo="Acá va a verse el día que el mapa se despertó."
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('no tapa el mapa: deja pasar el puntero', () => {
    // Un cartel que roba el arrastre convierte una invitación en un estorbo.
    const { container } = render(<Vacio titulo="T" cuerpo="C" />);
    expect(container.firstElementChild?.className).toContain('pointer-events-none');
  });
});

/**
 * Las guardas — spec §6.
 *
 * Los estados vacíos son la parte más fácil de romper sin que nadie se entere:
 * aparecen justo cuando no hay nadie mirando y desaparecen para siempre en
 * cuanto entra el primer dato.
 */
describe('guardas del vacío', () => {
  const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

  /**
   * Los comentarios se descartan antes de buscar. La primera versión de esta
   * guarda no lo hacía y se cazó a sí misma: el comentario de `Vacio.tsx`
   * explica que no hay que escribir «no hay datos», y eso la hacía fallar. Lo
   * que se audita es el texto que llega a la persona, no la prosa sobre el
   * texto.
   *
   * El `//` se recorta solo al principio de línea para no comerse la barra
   * doble de una URL que viva adentro de un string.
   */
  const sinComentarios = (fuente: string): string =>
    fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('ningún vacío se disculpa', () => {
    // La tentación de escribir la fórmula de manual es enorme, y quien la
    // escriba no va a notar que rompió nada. Por eso la prohibición es un test
    // y no una convención.
    const prohibidas = [/no hay datos/i, /sin datos disponibles/i, /no disponible/i];
    const archivos = [
      join(DIR, 'Vacio.tsx'),
      ...readdirSync(join(DIR, 'modos'))
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => join(DIR, 'modos', f)),
    ];

    for (const archivo of archivos) {
      const texto = sinComentarios(readFileSync(archivo, 'utf8'));
      for (const rx of prohibidas) {
        expect(rx.test(texto), `${archivo} se disculpa: ${String(rx)}`).toBe(false);
      }
    }
  });

  it('Cobertura y Simulación no llevan cartel de vacío', () => {
    // Su vacío ES su contenido. Un cartel puesto por simetría le tapa a
    // Cobertura su estado más verdadero, y a la Simulación el gesto entero que
    // la justifica.
    for (const modo of ['useModoCobertura.tsx', 'useModoSimulacion.tsx']) {
      const texto = readFileSync(join(DIR, 'modos', modo), 'utf8');
      expect(texto.includes('<Vacio'), `${modo} no debería tener <Vacio>`).toBe(false);
    }
  });

  it('las cinco lentes siguen estando, con datos o sin ellos', () => {
    // Una pestaña que desaparece cuando no hay datos enseña que la herramienta
    // es frágil justo cuando hay que confiar en ella.
    expect(MODOS.map((m) => m.id)).toEqual([
      'mapa',
      'analisis',
      'tiempo',
      'cobertura',
      'simulacion',
    ]);
  });
});
