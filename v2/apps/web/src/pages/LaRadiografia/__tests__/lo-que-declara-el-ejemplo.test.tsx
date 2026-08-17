import { render, screen } from '@testing-library/react';
import { nucleosAlUmbral } from '@v2/civic-core';
import { beforeAll, describe, expect, it } from 'vitest';

import { LOS_TRES_ESCENARIOS } from '../ejemplos';
import { ARTEFACTO_DE_VECTORES } from '../ejemplos/vectores';
import {
  medirEscenario,
  medirLaEscalera,
  PASO_DEL_UMBRAL,
  PASOS_DEL_MANDO,
  UMBRAL_MAXIMO,
  UMBRAL_MINIMO,
  type Escalera,
  type MedidaDelEscenario,
} from '../ejemplos-vista';
import { BolsaDePalabras } from '../sections/BolsaDePalabras';
import { DeQueCuelgaLaLeccion } from '../sections/DeQueCuelgaLaLeccion';
import { LosTresEjemplos } from '../sections/LosTresEjemplos';

/**
 * Lo que el ejemplo **declara sobre sí mismo**, y que ninguna medición puede
 * arreglar por él.
 *
 * Dos cosas, las dos de la enmienda del 16/8/2026:
 *
 *  1. **De qué está hecha la convergencia que se ve.** `EmbebedorFalso` es una
 *     bolsa de palabras, así que toda convergencia de esta página es **léxica
 *     por construcción**. Con este motor no se puede demostrar una tesis sobre
 *     significado, y la pantalla lo dice en vez de dejar que se deduzca.
 *  2. **De qué cuelga la lección.** El conteo de núcleos se da vuelta cuando se
 *     mueve el deslizador. En vez de elegir la banda donde no se nota, la
 *     lección se colgó del tamaño del mayor y de las voces solas — y el número
 *     que le queda mal se imprime igual.
 */

const medidas: MedidaDelEscenario[] = [];

beforeAll(() => {
  for (const escenario of LOS_TRES_ESCENARIOS) {
    medidas.push(medirEscenario(escenario, ARTEFACTO_DE_VECTORES));
  }
});

/** El mayor de una partición, otra vez y a mano: acá no se reusa el de arriba. */
const mayorDe = (nucleos: readonly { ids: readonly string[] }[]): number =>
  Math.max(0, ...nucleos.map((n) => n.ids.length));

describe('el barrido del mando', () => {
  it('barre los 41 pasos del deslizador, ni uno más ni uno menos', () => {
    expect(PASOS_DEL_MANDO).toBe(Math.round((UMBRAL_MAXIMO - UMBRAL_MINIMO) / PASO_DEL_UMBRAL) + 1);
    expect(medirLaEscalera(medidas).pasos).toBe(PASOS_DEL_MANDO);
  });

  /**
   * La contraprueba: se vuelve a barrer acá, con un bucle escrito de nuevo, y
   * los cuatro números tienen que coincidir. Una función que cuenta a favor de
   * la tesis de la página no se puede verificar contra sí misma.
   */
  it('sus cuentas coinciden con un barrido escrito de nuevo', () => {
    const escalera = medirLaEscalera(medidas);
    const cortes = (umbral: number) =>
      medidas.map((m) =>
        nucleosAlUmbral(
          m.escenario.voces.map((v) => v.id),
          m.aristas,
          umbral,
        ),
      );

    let mayor = 0;
    let solas = 0;
    let conteo = 0;
    let extremosMayor = 0;
    for (let paso = 0; paso < PASOS_DEL_MANDO; paso++) {
      const umbral = UMBRAL_MINIMO + paso * PASO_DEL_UMBRAL;
      const p = cortes(umbral);
      const mayores = p.map((x) => mayorDe(x.nucleos));
      const solitarias = p.map((x) => x.solas.length);
      const nucleos = p.map((x) => x.nucleos.length);
      const enFila = (xs: number[], baja: boolean) =>
        xs.every((x, i) => {
          const y = xs[i + 1];
          return y === undefined || (baja ? x >= y : x <= y);
        });
      if (enFila(mayores, true)) mayor++;
      if (enFila(solitarias, false)) solas++;
      if (enFila(nucleos, false)) conteo++;
      const primero = mayores[0];
      const ultimo = mayores[mayores.length - 1];
      if (primero !== undefined && ultimo !== undefined && primero >= ultimo) extremosMayor++;
    }

    expect(escalera.cadena).toEqual({ mayor, solas, conteo });
    expect(escalera.extremos.mayor).toBe(extremosMayor);
  });

  /**
   * El hallazgo que obligó a elegir: las tres lecturas **no dicen lo mismo**.
   *
   * Se afirma eso y no «el conteo aguanta menos», que es lo que pasa hoy: el
   * corpus del ejemplo se puede reescribir, y la elección de colgar la lección
   * del mayor y de las voces solas no depende de que el conteo se dé vuelta.
   * Depende de que el conteo sea un subproducto y las otras dos sean la lección
   * — el argumento entero está en `medirLaEscalera`.
   */
  it('las tres lecturas no son intercambiables: el barrido las separa', () => {
    const escalera = medirLaEscalera(medidas);
    const cuentas = [escalera.cadena.mayor, escalera.cadena.solas, escalera.cadena.conteo];
    expect(new Set(cuentas).size).toBeGreaterThan(1);
    const todas = [
      ...cuentas,
      escalera.extremos.mayor,
      escalera.extremos.solas,
      escalera.extremos.conteo,
    ];
    for (const cuenta of todas) {
      expect(cuenta).toBeGreaterThanOrEqual(0);
      expect(cuenta).toBeLessThanOrEqual(escalera.pasos);
    }
    if (escalera.seDaVuelta !== null) {
      expect(escalera.seDaVuelta).toBeGreaterThanOrEqual(UMBRAL_MINIMO);
      expect(escalera.seDaVuelta).toBeLessThanOrEqual(UMBRAL_MAXIMO);
    }
  });
});

describe('la pantalla no esconde el número que le queda mal', () => {
  const inventada = (extra: Partial<Escalera> = {}): Escalera => ({
    pasos: 41,
    cadena: { mayor: 41, solas: 41, conteo: 3 },
    extremos: { mayor: 41, solas: 41, conteo: 9 },
    seDaVuelta: 0.45,
    ...extra,
  });

  it('imprime las tres lecturas con su cuenta, incluida la que se da vuelta', () => {
    const { container } = render(<DeQueCuelgaLaLeccion escalera={inventada()} tema="papel" />);
    expect(container.textContent).toContain('41 de 41');
    expect(container.textContent).toContain('9 de 41');
    expect(container.textContent).toContain('se da vuelta');
    expect(container.textContent).toContain('0,45');
  });

  it('el encabezado dice de qué cuelga la lección y de qué no', () => {
    render(<DeQueCuelgaLaLeccion escalera={inventada()} tema="papel" />);
    const titulo = screen.getByRole('heading', { name: /cuelga/i });
    expect(titulo.textContent).toMatch(/mancha|mayor/i);
    expect(titulo.textContent).toMatch(/voces solas/i);
    expect(titulo.textContent).toMatch(/No del conteo de núcleos/i);
  });

  /**
   * La tentación era acertarle a un rango del deslizador donde el conteo no se
   * dé vuelta. Con una escalera donde **todo** se da vuelta, la pantalla lo
   * sigue diciendo: no hay una rama que se calle cuando el número es feo.
   */
  it('con una escalera desastrosa lo dice igual, sin una rama que la calle', () => {
    const { container } = render(
      <DeQueCuelgaLaLeccion
        escalera={inventada({
          cadena: { mayor: 2, solas: 1, conteo: 0 },
          extremos: { mayor: 2, solas: 1, conteo: 0 },
          seDaVuelta: 0.31,
        })}
        tema="papel"
      />,
    );
    expect(container.textContent).toContain('2 de 41');
    expect(container.textContent).toContain('1 de 41');
    expect(container.textContent).toContain('0 de 41');
    // Las tres lecturas rotuladas «se da vuelta», ninguna escondida ni omitida.
    expect(screen.getAllByText('se da vuelta')).toHaveLength(3);
    expect(screen.queryAllByText('aguanta')).toHaveLength(0);
  });
});

describe('el límite del motor, declarado en la pantalla', () => {
  it('dice que es una bolsa de palabras, con el nombre del embebedor', () => {
    const { container } = render(
      <BolsaDePalabras artefacto={ARTEFACTO_DE_VECTORES} tema="papel" />,
    );
    expect(container.textContent).toContain('bolsa de palabras');
    expect(container.textContent).toContain(ARTEFACTO_DE_VECTORES.modelo);
    expect(container.textContent).toContain('no los hizo un modelo de lenguaje');
  });

  it('dice que la convergencia es léxica por construcción y que no demuestra sentido', () => {
    const { container } = render(
      <BolsaDePalabras artefacto={ARTEFACTO_DE_VECTORES} tema="papel" />,
    );
    expect(container.textContent).toMatch(/léxica por construcción/);
    expect(container.textContent).toMatch(/no se puede demostrar/);
  });

  it('y que con un modelo de verdad los números cambian y se vuelven a medir', () => {
    const { container } = render(
      <BolsaDePalabras artefacto={ARTEFACTO_DE_VECTORES} tema="papel" />,
    );
    expect(container.textContent).toContain('Ollama');
    expect(container.textContent).toMatch(/volver a medir/);
    expect(container.textContent).toMatch(/midiendo, no heredando/);
  });
});

describe('las dos declaraciones salen en la página del ejemplo', () => {
  it('la del motor va ARRIBA de la constelación y la de la escalera antes de la tabla', () => {
    const { container } = render(<LosTresEjemplos tema="papel" />);
    const texto = container.textContent;

    const motor = texto.indexOf('bolsa de palabras');
    // Los botones de escenario son lo último antes del lienzo.
    const antesDelLienzo = texto.indexOf('· La bronca');
    const escalera = texto.indexOf('La lección cuelga');
    const tabla = texto.indexOf('Las tres columnas son el mismo padrón');

    for (const posicion of [motor, antesDelLienzo, escalera, tabla]) {
      expect(posicion).toBeGreaterThan(-1);
    }
    // La procedencia antes de la imagen, y el argumento antes de los números.
    expect(motor).toBeLessThan(antesDelLienzo);
    expect(escalera).toBeLessThan(tabla);
  });
});
