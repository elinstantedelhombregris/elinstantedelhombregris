import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { armarPais } from '../simulacion/espina/escenario.js';
import { abrirSimulacion } from '../simulacion/simular.js';

import type { Pais } from '../simulacion/espina/escenario.js';
import type { EstadoMedido, Palancas, Territorio } from '../simulacion/tipos.js';

/**
 * `abrirSimulacion` — el camino que le faltaba al mapa.
 *
 * `simular()` recibe `base` y `territorios` sueltos: no tiene con qué saber que
 * el reloj de esta llamada no es el de la anterior, y por eso el defecto del
 * §1.5 pudo vivir en producción con el motor entero en verde. Acá el reloj entra
 * congelado adentro del `Pais` y el silencio se calcula una sola vez.
 */

const AHORA = 1_800_000_000_000;
const MES = (365.25 / COEFICIENTES.PERIODOS_POR_ANIO) * 24 * 3600 * 1000;

const TERRITORIOS: readonly Territorio[] = [
  { id: 'caba', nombre: 'CABA', poblacion: 3_121_000, km2: 200 },
  { id: 'chaco', nombre: 'Chaco', poblacion: 1_140_000, km2: 99_633 },
];

/** Una voz a un milisegundo del borde de su período: el caso que el reloj voltea. */
const BASE: EstadoMedido = {
  voces: [{ territorioId: 'caba', tipo: { reconocido: true, tipo: 'basta' }, fecha: AHORA - MES + 1 }],
  ahora: AHORA,
};

const PALANCAS: Palancas = {
  participacion: 200,
  dispersion: 0.6,
  composicion: { hecho: 0.25, deseo: 0.25, acto: 0.25, meta: 0.25 },
  horizonte: 2,
  resistencia: 0.3,
  constancia: 0.7,
  cumplimiento: 0.5,
};

describe('abrirSimulacion', () => {
  it('el silencio es EL MISMO objeto para toda configuración de palancas', () => {
    const sim = abrirSimulacion(armarPais(BASE, TERRITORIOS, 'provincia'));

    const flojo = sim.correr({ ...PALANCAS, participacion: 0, resistencia: 1 });
    const fuerte = sim.correr({ ...PALANCAS, participacion: 2000, resistencia: 0 });

    // Identidad y no igualdad: «da lo mismo» se puede romper agregando un
    // cálculo; «es el mismo objeto» no.
    expect(flojo.silencio).toBe(sim.silencio);
    expect(fuerte.silencio).toBe(sim.silencio);
    // Y la voz sí se mueve: si no, la garantía sería la de un motor apagado.
    expect(fuerte.voz.alcance.valor).toBeGreaterThan(flojo.voz.alcance.valor);
  });

  it('un país mutado después de armarse no se abre', () => {
    const pais = armarPais(BASE, TERRITORIOS, 'provincia');
    const trucho: Pais = { ...pais, ahora: pais.ahora + 1, base: { ...BASE, ahora: AHORA + 1 } };

    expect(() => abrirSimulacion(trucho)).toThrow(/huella/i);
  });

  it('un milisegundo de reloj es otro país, y da otro resultado medido', () => {
    // La razón por la que lo de arriba importa: el reloj no es un detalle de
    // presentación. Con la voz pegada al borde del período, un milisegundo
    // cambia la ventana medida entera.
    const hoy = armarPais(BASE, TERRITORIOS, 'provincia');
    const unMsDespues = armarPais({ ...BASE, ahora: AHORA + 1 }, TERRITORIOS, 'provincia');

    expect(hoy.huella).not.toBe(unMsDespues.huella);
    expect(abrirSimulacion(hoy).silencio.persistencia.valor).not.toBeCloseTo(
      abrirSimulacion(unMsDespues).silencio.persistencia.valor,
      6,
    );
  });
});
