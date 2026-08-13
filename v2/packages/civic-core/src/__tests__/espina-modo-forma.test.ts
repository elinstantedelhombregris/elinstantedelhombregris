import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { azarDe } from '../simulacion/espina/azar.js';
import {
  periodosConVozPorTerritorio,
  totalDeVoces,
  vocesPorClase,
  vocesPorTerritorio,
} from '../simulacion/espina/cosecha.js';
import { armarPais, escenarioBase } from '../simulacion/espina/escenario.js';
import { medirForma } from '../simulacion/espina/forma.js';
import { retratar } from '../simulacion/espina/retratar.js';
import { periodosDelHorizonte, periodosSostenidos } from '../simulacion/mandato.js';
import { modoForma } from '../simulacion/modo-forma.js';
import { retratoSimulado } from '../simulacion/retrato.js';

import type { Escenario, Pais } from '../simulacion/espina/escenario.js';
import type { EstadoMedido, Palancas, Territorio } from '../simulacion/tipos.js';

const AHORA = 1_800_000_000_000;
const MES = 31 * 24 * 3600 * 1000;

const TERRITORIOS: Territorio[] = [
  { id: 'buenos aires', nombre: 'Buenos Aires', poblacion: 17_500_000, km2: 307_571 },
  { id: 'cordoba', nombre: 'Córdoba', poblacion: 3_800_000, km2: 165_321 },
  { id: 'chaco', nombre: 'Chaco', poblacion: 1_140_000, km2: 99_633 },
  { id: 'formosa', nombre: 'Formosa', poblacion: 606_000, km2: 72_066 },
  { id: 'tierra del fuego', nombre: 'Tierra del Fuego', poblacion: 190_000, km2: 21_571 },
  { id: 'sin dato', nombre: 'Sin dato', poblacion: 0, km2: 10 },
];

const BASE: EstadoMedido = {
  voces: [
    { territorioId: 'chaco', tipo: 'basta', fecha: AHORA - MES },
    { territorioId: 'chaco', tipo: 'necesidad', fecha: AHORA - 2 * MES },
    { territorioId: 'formosa', tipo: 'basta', fecha: AHORA - MES },
    // Una voz en el territorio SIN POBLACIÓN: es la que hacía que el reparto
    // concentrado se llevara el total entero a un lugar que ningún agregado
    // cuenta, y que las voces desaparecieran sin que nada lo dijera.
    { territorioId: 'sin dato', tipo: 'basta', fecha: AHORA - MES },
    { territorioId: 'sin dato', tipo: 'basta', fecha: AHORA - 2 * MES },
    { territorioId: 'sin dato', tipo: 'basta', fecha: AHORA - 3 * MES },
  ],
  ahora: AHORA,
};

const PAIS: Pais = armarPais(BASE, TERRITORIOS, 'provincia');

const escenario = (over: Partial<Escenario> = {}): Escenario => ({
  ...escenarioBase(
    PAIS,
    'prueba',
    'Prueba',
    '¿A partir de cuántas voces cada 100.000 gana mandato cada provincia?',
    1234,
    COEFICIENTES,
  ),
  ...over,
});

const palancasDe = (esc: Escenario): Palancas => ({
  participacion: esc.forma.participacion,
  dispersion: esc.forma.dispersion,
  // El motor viejo no lee ninguna de estas dos; se completan para que compile.
  composicion: { basta: 1, sueño: 0, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 },
  cumplimiento: esc.ajustes.cumplimiento,
  horizonte: esc.ajustes.horizonte,
  resistencia: esc.ajustes.resistencia,
  constancia: esc.forma.constancia,
});

describe('modoForma produce la cosecha que la forma declara', () => {
  it('el total de voces es participación × población ÷ 100.000, exacto', () => {
    const esc = escenario({
      forma: { ...escenario().forma, participacion: 300, dispersion: 1, constancia: 1 },
    });
    const cosecha = modoForma(esc, PAIS, null);
    // La población de «sin dato» no entra en el denominador ni recibe voces.
    const poblacionUtil = 17_500_000 + 3_800_000 + 1_140_000 + 606_000 + 190_000;
    expect(totalDeVoces(cosecha)).toBe(Math.round((300 * poblacionUtil) / 100_000));
  });

  it('NINGUNA voz cae en un territorio sin población: el reparto no se fuga', () => {
    // Con dispersión 0 el reparto se concentra donde ya se habla más, y «sin
    // dato» es el que más voces base tiene. Antes se llevaba el total entero y
    // el retrato lo descartaba después: diez mil voces desaparecían y `sinDato`
    // decía «no hay denominador» sin decir que ahí se había ido todo.
    const esc = escenario({ forma: { ...escenario().forma, dispersion: 0, participacion: 500 } });
    const cosecha = modoForma(esc, PAIS, null);
    expect(vocesPorTerritorio(cosecha).get('sin dato')).toBeUndefined();
    expect(totalDeVoces(cosecha)).toBeGreaterThan(0);
  });

  it('lo que igual queda afuera se declara con su magnitud, no en silencio', () => {
    const retrato = retratar(modoForma(escenario(), PAIS, null), escenario(), PAIS);
    const perdido = retrato.sinDato.find((s) => s.territorioId === 'sin dato');
    expect(perdido?.vocesPerdidas.valor).toBe(0);
    expect(perdido?.razon).toMatch(/población/i);
  });

  it('una ronda es un período es un mes: la cosecha tiene los del horizonte', () => {
    for (const horizonte of [1 / 12, 0.5, 1, 2, 5]) {
      const esc = escenario({ ajustes: { ...escenario().ajustes, horizonte } });
      expect(modoForma(esc, PAIS, null).periodos).toBe(periodosDelHorizonte(horizonte));
    }
  });

  it('la constancia reparte en el tiempo, territorio por territorio', () => {
    const base = escenario();
    const estallido = modoForma(
      { ...base, forma: { ...base.forma, constancia: 0, participacion: 400 } },
      PAIS,
      null,
    );
    const goteo = modoForma(
      { ...base, forma: { ...base.forma, constancia: 1, participacion: 400 } },
      PAIS,
      null,
    );
    expect(periodosConVozPorTerritorio(estallido).get('cordoba')).toBe(1);
    expect(periodosConVozPorTerritorio(goteo).get('cordoba')).toBe(goteo.periodos);
    // El total no cambia: la constancia mueve CUÁNDO se habla, no cuánto.
    expect(totalDeVoces(estallido)).toBe(totalDeVoces(goteo));
  });

  it('la composición reparte por CLASE y cierra exacto', () => {
    const base = escenario();
    const esc = {
      ...base,
      forma: {
        ...base.forma,
        participacion: 400,
        composicion: { hecho: 0.7, deseo: 0.2, acto: 0.1, meta: 0 },
      },
    };
    const cosecha = modoForma(esc, PAIS, null);
    const porClase = vocesPorClase(cosecha);
    const total = totalDeVoces(cosecha);
    expect((porClase.get('hecho') ?? 0) / total).toBeCloseTo(0.7, 2);
    expect((porClase.get('meta') ?? 0)).toBe(0);
    expect(
      (porClase.get('hecho') ?? 0) +
        (porClase.get('deseo') ?? 0) +
        (porClase.get('acto') ?? 0) +
        (porClase.get('meta') ?? 0),
    ).toBe(total);
  });

  it('es una fórmula: sin población, tira en vez de fingir un modo', () => {
    expect(() =>
      modoForma(escenario(), PAIS, {
        huella: 'x',
        personas: [],
        padre: null,
        sello: null,
      }),
    ).toThrow(/modo forma no tiene población/i);
  });
});

describe('GUARDA: el barrido equivale al motor', () => {
  /**
   * Sin esto, izar el silencio fuera del bucle es una divergencia esperando
   * pasar y el instrumento mediría otro motor que el mapa. Se corre sobre una
   * grilla y no sobre un punto: una rama que difiera sólo con ciertas palancas
   * no la caza un caso suelto.
   */
  it('retratar(modoForma(...)) da lo mismo que retratoSimulado(...)', () => {
    for (const participacion of [0, 50, 200, 438, 1000]) {
      for (const dispersion of [0, 0.5, 1]) {
        for (const constancia of [0, 0.5, 1]) {
          for (const resistencia of [0, 0.3, 1]) {
            const base = escenario();
            const esc: Escenario = {
              ...base,
              forma: { ...base.forma, participacion, dispersion, constancia },
              ajustes: { ...base.ajustes, resistencia },
            };
            const porEspina = retratar(modoForma(esc, PAIS, null), esc, PAIS);
            const porElMotor = retratoSimulado(palancasDe(esc), BASE, TERRITORIOS);

            expect(porEspina.alcance.valor).toBeCloseTo(porElMotor.alcance.valor, 12);
            expect(porEspina.persistencia.valor).toBeCloseTo(porElMotor.persistencia.valor, 12);
            expect(porEspina.legitimidad.valor).toBeCloseTo(porElMotor.legitimidad.valor, 12);
            expect(porEspina.cobertura.valor).toBeCloseTo(porElMotor.cobertura.valor, 12);

            for (const [id, deEspina] of porEspina.porTerritorio) {
              const delMotor = porElMotor.porTerritorio.get(id);
              expect(deEspina.voces.valor).toBe(delMotor?.voces.valor);
              expect(deEspina.veredicto.hay).toBe(delMotor?.veredicto.hay);
            }
          }
        }
      }
    }
  });
});

describe('GUARDA: medirForma es la identidad en modo forma', () => {
  /**
   * Property test con azar sembrado: cien formas declaradas al azar tienen que
   * volver a leerse iguales. Las tolerancias no son cosméticas y cada una tiene
   * su motivo escrito — son el precio de repartir enteros y de que la constancia
   * se mida como la spec la define y no como la inversa exacta de
   * `periodosSostenidos`.
   */
  it('lo que se declara vuelve a leerse, con las tolerancias que el redondeo obliga', () => {
    for (let i = 0; i < 100; i++) {
      const participacion = 50 + azarDe(2026, i, 1) * 950;
      const dispersion = azarDe(2026, i, 2);
      const constancia = azarDe(2026, i, 3);
      const pesos = [azarDe(2026, i, 4), azarDe(2026, i, 5), azarDe(2026, i, 6), azarDe(2026, i, 7)];
      const suma = pesos.reduce((a, b) => a + b, 0);

      const base = escenario();
      const esc: Escenario = {
        ...base,
        forma: {
          participacion,
          dispersion,
          constancia,
          composicion: {
            hecho: (pesos[0] ?? 0) / suma,
            deseo: (pesos[1] ?? 0) / suma,
            acto: (pesos[2] ?? 0) / suma,
            meta: (pesos[3] ?? 0) / suma,
          },
        },
      };

      const logrado = medirForma(modoForma(esc, PAIS, null), PAIS);

      // El total se redondea a voces enteras, así que la participación
      // recuperada difiere en a lo sumo MEDIA VOZ repartida sobre la población
      // útil. La cota se calcula en vez de elegirse: así el día que cambie el
      // fixture, el test sigue midiendo lo que dice medir.
      const poblacionUtil = TERRITORIOS.reduce((s, t) => s + Math.max(0, t.poblacion), 0);
      expect(Math.abs(logrado.participacion - participacion)).toBeLessThanOrEqual(
        (0.5 / poblacionUtil) * 100_000 + 1e-9,
      );
      // El reparto es de enteros: la mezcla recuperada no puede ser exacta.
      expect(Math.abs(logrado.dispersion - dispersion)).toBeLessThan(0.02);
      /**
       * La constancia es la única de las cuatro que NO vuelve exacta, y hay dos
       * motivos, los dos del modelo y ninguno un bug:
       *
       * 1. Se declara pasando por `periodosSostenidos`, que hace
       *    `round(1 + c·(P−1))`, y se lee como «períodos con voz ÷ períodos de
       *    la ventana»: eso ya desplaza hasta `(1,5 − c)/P`.
       * 2. Un territorio sostiene, como mucho, tantos períodos como voces
       *    tiene. Con la voz concentrada, a los territorios chicos les tocan
       *    menos voces que períodos y la constancia LOGRADA baja.
       *
       * Por eso el techo es una cota y no una igualdad: **lo logrado nunca
       * puede superar lo declarado**, que es la dirección que importa. La
       * igualdad exacta se afirma abajo, en el caso donde a todos les alcanzan
       * las voces.
       */
      const periodos = periodosDelHorizonte(esc.ajustes.horizonte);
      const techo = periodosSostenidos(constancia, periodos) / periodos;
      expect(logrado.constancia).toBeLessThanOrEqual(techo + 1e-12);
      for (const clase of ['hecho', 'deseo', 'acto', 'meta'] as const) {
        expect(logrado.composicion[clase]).toBeCloseTo(esc.forma.composicion[clase], 2);
      }
    }
  });

  it('con voces de sobra para todos, la constancia vuelve EXACTA', () => {
    // Reparto proporcional y participación alta: hasta Tierra del Fuego recibe
    // más voces que períodos, así que nadie se queda corto y la única brecha
    // que queda es la del redondeo de `periodosSostenidos`.
    for (const constancia of [0, 0.25, 0.5, 0.75, 1]) {
      const base = escenario();
      const esc: Escenario = {
        ...base,
        forma: { ...base.forma, participacion: 800, dispersion: 1, constancia },
      };
      const periodos = periodosDelHorizonte(esc.ajustes.horizonte);
      const logrado = medirForma(modoForma(esc, PAIS, null), PAIS);
      expect(logrado.constancia).toBeCloseTo(periodosSostenidos(constancia, periodos) / periodos, 12);
    }
  });

  it('sin voces no hay composición: cuatro ceros, no un cuarto a cada una', () => {
    const base = escenario();
    const esc = { ...base, forma: { ...base.forma, participacion: 0 } };
    const logrado = medirForma(modoForma(esc, PAIS, null), PAIS);
    expect(logrado.composicion).toEqual({ hecho: 0, deseo: 0, acto: 0, meta: 0 });
    expect(logrado.participacion).toBe(0);
  });
});
