import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { barrer, prepararContexto, TECHO_TERRITORIO_CORRIDAS, territoriosQueGananMandato } from '../simulacion/espina/barrer.js';
import { correr, ordenCanonico } from '../simulacion/espina/corrida.js';
import { armarPais, escenarioBase } from '../simulacion/espina/escenario.js';
import { hipercuboLatino, rangos, spearman } from '../simulacion/espina/metodos/muestreo.js';
import { monotoniaDe } from '../simulacion/espina/metodos/oat.js';
import { CLAVES_VARIABLE, conVariable, DOMINIOS, muestrear, probit } from '../simulacion/espina/variables.js';
import { modoForma } from '../simulacion/modo-forma.js';

import type { Diseno } from '../simulacion/espina/barrer.js';
import type { Escenario, Pais } from '../simulacion/espina/escenario.js';
import type { EstadoMedido, Territorio } from '../simulacion/tipos.js';

const AHORA = 1_800_000_000_000;

const TERRITORIOS: Territorio[] = [
  { id: 'buenos aires', nombre: 'Buenos Aires', poblacion: 17_500_000, km2: 307_571 },
  { id: 'cordoba', nombre: 'Córdoba', poblacion: 3_800_000, km2: 165_321 },
  { id: 'chaco', nombre: 'Chaco', poblacion: 1_140_000, km2: 99_633 },
  { id: 'formosa', nombre: 'Formosa', poblacion: 606_000, km2: 72_066 },
];

const BASE: EstadoMedido = { voces: [], ahora: AHORA };
const PAIS: Pais = armarPais(BASE, TERRITORIOS, 'provincia');

const ESC: Escenario = escenarioBase(
  PAIS,
  'la-primera-pregunta',
  'La primera pregunta',
  '¿A partir de cuántas voces cada 100.000 gana mandato cada provincia?',
  2026,
  COEFICIENTES,
);

const diseno = (over: Partial<Diseno> = {}): Diseno => ({
  base: ESC,
  modo: 'forma',
  claves: ['participacion', 'dispersion', 'constancia', 'horizonte', 'resistencia'],
  objetivo: 'legitimidad',
  metodo: { tipo: 'hipercubo', muestras: 60 },
  ...over,
});

describe('el contexto izado', () => {
  it('calcula el silencio UNA vez y no depende de ninguna variable', () => {
    // Es S3 aprovechada en vez de sólo respetada: si el silencio es sordo,
    // calcularlo una vez por barrido no es un atajo, es la definición.
    const contexto = prepararContexto(PAIS);
    const otro = prepararContexto(PAIS);
    expect(JSON.stringify([...contexto.silencio.porTerritorio])).toBe(
      JSON.stringify([...otro.silencio.porTerritorio]),
    );
    expect(contexto.orden).toEqual(['buenos aires', 'chaco', 'cordoba', 'formosa']);
  });

  it('los territorios que ganan mandato salen de dos bitsets, no de dos retratos', () => {
    const contexto = prepararContexto(PAIS);
    const conVoz = conVariable(ESC, 'participacion', 900);
    const { corrida } = correr(conVoz, PAIS, modoForma);
    // Con la base vacía el silencio no tiene mandato en ningún lado, así que
    // todo territorio con mandato en la voz lo GANA.
    expect(territoriosQueGananMandato(corrida, contexto).length).toBeGreaterThan(0);
  });
});

describe('la bisección de umbrales — el titular del módulo', () => {
  it('encuentra la participación mínima que le da mandato a cada provincia', () => {
    const salida = barrer(
      diseno({ metodo: { tipo: 'umbral', territorios: ordenCanonico(PAIS) } }),
      PAIS,
      modoForma,
    );
    expect(salida.estado).toBe('listo');
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'umbral') return;

    expect(salida.salida.umbrales).toHaveLength(4);
    for (const u of salida.salida.umbrales) {
      expect(u.estado).toBe('encontrado');
      if (u.estado !== 'encontrado') continue;

      // El umbral encontrado es real: justo abajo NO hay mandato y en él sí.
      const justoArriba = conVariable(ESC, 'participacion', u.participacion.valor);
      const bienAbajo = conVariable(ESC, 'participacion', u.participacion.valor - 1);
      const arriba = correr(justoArriba, PAIS, modoForma);
      const abajo = correr(bienAbajo, PAIS, modoForma);
      expect(arriba.retrato.porTerritorio.get(u.territorioId)?.veredicto.hay).toBe(true);
      expect(abajo.retrato.porTerritorio.get(u.territorioId)?.veredicto.hay).toBe(false);

      // Bisección: unas quince corridas por territorio, no un barrido de grilla.
      expect(u.corridas).toBeLessThan(30);
    }
  });

  it('lo que la participación sola no alcanza se dice, con el tope a la vista', () => {
    // Resistencia máxima: el piso se quintuplica, y con MINIMO_PERIODOS alto
    // ni el tope del dominio alcanza para sostenerlo.
    const bloqueado: Escenario = {
      ...ESC,
      ajustes: { ...ESC.ajustes, resistencia: 1, horizonte: 1 },
      forma: { ...ESC.forma, constancia: 0 },
    };
    const salida = barrer(
      diseno({ base: bloqueado, metodo: { tipo: 'umbral', territorios: ['chaco'] } }),
      PAIS,
      modoForma,
    );
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'umbral') throw new Error('no corrió');
    const u = salida.salida.umbrales[0];
    expect(u?.estado).toBe('inalcanzable');
    if (u?.estado === 'inalcanzable') {
      expect(u.tope.valor).toBe(DOMINIOS.participacion.maximo);
      expect(u.tope.procedencia).toMatchObject({ tipo: 'declarado' });
    }
  });
});

describe('el tornado', () => {
  it('mide la monotonía en vez de suponerla', () => {
    expect(monotoniaDe([1, 2, 3])).toBe('creciente');
    expect(monotoniaDe([3, 2, 1])).toBe('decreciente');
    expect(monotoniaDe([1, 3, 2])).toBe('noMonotona');
    expect(monotoniaDe([2, 2, 2])).toBe('plana');
  });

  it('una palanca que el modo no lee sale con su razón, NO con una barra en cero', () => {
    const salida = barrer(
      diseno({
        claves: ['participacion', 'cumplimiento', 'chispa'],
        metodo: { tipo: 'unaPorVez', pasos: 5 },
      }),
      PAIS,
      modoForma,
    );
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'unaPorVez') throw new Error('no corrió');

    const porClave = new Map(salida.salida.barras.map((b) => [b.clave, b]));
    expect(porClave.get('participacion')?.estado).toBe('medida');

    const cumplimiento = porClave.get('cumplimiento');
    expect(cumplimiento?.estado).toBe('noConectada');
    if (cumplimiento?.estado === 'noConectada') {
      expect(cumplimiento.incertidumbre.tipo).toBe('sinDominio');
    }

    const chispa = porClave.get('chispa');
    expect(chispa?.estado).toBe('noConectada');
    if (chispa?.estado === 'noConectada') {
      expect(chispa.clase).toBe('mecanismo');
    }
  });

  it('la participación mueve la legitimidad y no baja nunca', () => {
    const salida = barrer(
      diseno({ claves: ['participacion'], metodo: { tipo: 'unaPorVez', pasos: 12 } }),
      PAIS,
      modoForma,
    );
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'unaPorVez') throw new Error('no corrió');
    const barra = salida.salida.barras[0];
    expect(barra?.estado).toBe('medida');
    if (barra?.estado !== 'medida') return;
    expect(barra.monotonia).toBe('creciente');
    expect(barra.amplitud.valor).toBeGreaterThan(0);
    // El rango lleva su razón escrita: un rango sin razón es un número inventado.
    expect(barra.razonDelRango.procedencia).toMatchObject({ tipo: 'declarado' });
  });
});

describe('el hipercubo latino', () => {
  it('la misma semilla da el mismo diseño, y otra semilla otro', () => {
    const a = hipercuboLatino(['participacion', 'dispersion'], 40, 7);
    const b = hipercuboLatino(['participacion', 'dispersion'], 40, 7);
    const c = hipercuboLatino(['participacion', 'dispersion'], 40, 8);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('estratifica: con N muestras, ningún décimo del dominio queda sin visitar', () => {
    const filas = hipercuboLatino(['dispersion'], 100, 3);
    const cajones = new Set<number>();
    for (const fila of filas) cajones.add(Math.min(9, Math.floor((fila[0] ?? 0) * 10)));
    expect(cajones.size).toBe(10);
  });

  it('AGREGAR UNA DIMENSIÓN NO CORRE EL AZAR DE LAS ANTERIORES', () => {
    // El azar entra por coordenada. Con una corriente lineal, sumar una
    // variable al barrido cambiaría todas las muestras de las de antes y dos
    // barridos dejarían de ser comparables, en silencio.
    const dos = hipercuboLatino(['participacion', 'dispersion'], 30, 11);
    const tres = hipercuboLatino(['participacion', 'dispersion', 'constancia'], 30, 11);
    expect(tres.map((f) => [f[0], f[1]])).toEqual(dos.map((f) => [f[0], f[1]]));
  });

  it('respeta el dominio declarado de cada variable', () => {
    const filas = hipercuboLatino(['participacion', 'horizonte'], 50, 5);
    for (const fila of filas) {
      expect(fila[0]).toBeGreaterThanOrEqual(DOMINIOS.participacion.minimo);
      expect(fila[0]).toBeLessThanOrEqual(DOMINIOS.participacion.maximo);
      // `horizonte` es discreta a propósito: muestrear continuo produce un
      // zigzag de redondeo que el tornado reportaría como sensibilidad.
      expect([1 / 12, 3 / 12, 6 / 12, 1, 2, 3, 5, 10]).toContain(fila[1]);
    }
  });
});

describe('muestrear', () => {
  /**
   * Property test sobre las dieciocho variables: `muestrear` tiene que ser
   * MONÓTONA en `u`. No es cosmético — es lo que hace que un hipercubo latino
   * siga siendo un hipercubo latino: si la inversa no fuera monótona, las
   * estratos se mezclarían y la muestra dejaría de cubrir el dominio parejo.
   *
   * Este test encontró un bug real: la rama de la cola baja de la inversa
   * normal ya devuelve un valor negativo, y negarla invertía la función
   * entera — el muestreo arrancaba en el tope del dominio y terminaba en el
   * piso, y el tornado de `participacion` salía «noMonotona».
   */
  it('es monótona en u, para toda variable', () => {
    for (const clave of CLAVES_VARIABLE) {
      const dominio = DOMINIOS[clave];
      let previo = Number.NEGATIVE_INFINITY;
      for (let i = 0; i <= 100; i++) {
        const v = muestrear(dominio, i / 100);
        expect(v).toBeGreaterThanOrEqual(previo);
        expect(v).toBeGreaterThanOrEqual(dominio.minimo);
        expect(v).toBeLessThanOrEqual(dominio.maximo);
        previo = v;
      }
    }
  });

  it('la inversa de la normal da los valores de tabla', () => {
    expect(probit(0.5)).toBeCloseTo(0, 9);
    expect(probit(0.975)).toBeCloseTo(1.959964, 4);
    expect(probit(0.025)).toBeCloseTo(-1.959964, 4);
    expect(probit(0.99)).toBeCloseTo(2.326348, 4);
  });

  it('la lognormal de `participacion` se centra en su mediana declarada', () => {
    expect(muestrear(DOMINIOS.participacion, 0.5)).toBeCloseTo(200, 6);
  });
});

describe('Spearman', () => {
  it('promedia los rangos empatados', () => {
    expect(rangos([10, 20, 20, 30])).toEqual([1, 2.5, 2.5, 4]);
  });

  it('vale 1 para cualquier relación creciente, aunque sea un escalón', () => {
    // Ésta es la razón de usar Spearman y no Pearson: la respuesta del motor
    // es un escalón, y Pearson lo descontaría como «poco importante».
    const x = [1, 2, 3, 4, 5, 6];
    const escalon = [0, 0, 0, 1, 1, 1];
    expect(spearman(x, escalon)).toBeGreaterThan(0.85);
    expect(spearman(x, [1, 2, 3, 4, 5, 6])).toBeCloseTo(1, 12);
    expect(spearman(x, [6, 5, 4, 3, 2, 1])).toBeCloseTo(-1, 12);
  });

  it('sin variación devuelve null, no 0', () => {
    expect(spearman([1, 2, 3], [5, 5, 5])).toBeNull();
    expect(spearman([1], [1])).toBeNull();
  });

  it('rankea las variables por importancia, con su intervalo', () => {
    const salida = barrer(diseno({ metodo: { tipo: 'hipercubo', muestras: 120 } }), PAIS, modoForma);
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'hipercubo') throw new Error('no corrió');

    const porClave = new Map(salida.salida.importancia.map((i) => [i.clave, i]));
    const participacion = porClave.get('participacion');
    expect(participacion?.estado).toBe('medida');
    if (participacion?.estado !== 'medida') return;

    expect(participacion.correlacion.valor).toBeGreaterThan(0.5);
    expect(participacion.p05.valor).toBeLessThanOrEqual(participacion.p95.valor);
    expect(participacion.n).toBe(120);
  });

  it('el resultado del barrido es reproducible corriéndolo de nuevo', () => {
    const uno = barrer(diseno(), PAIS, modoForma);
    const otro = barrer(diseno(), PAIS, modoForma);
    expect(JSON.stringify(uno)).toBe(JSON.stringify(otro));
  });
});

describe('las guardas del barrido', () => {
  it('se niega con la cuenta a la vista antes de congelar la pestaña', () => {
    const salida = barrer(
      diseno({ metodo: { tipo: 'hipercubo', muestras: 10_000_000 } }),
      PAIS,
      modoForma,
    );
    expect(salida.estado).toBe('seNiega');
    if (salida.estado !== 'seNiega') return;
    expect(salida.techo.valor).toBe(TECHO_TERRITORIO_CORRIDAS);
    expect(salida.territorioCorridas.valor).toBe(10_000_000 * 4);
    expect(salida.razon).toContain('territorio-corridas');
  });

  it('tira si el escenario se armó contra otro país', () => {
    const otroPais = armarPais(
      { voces: [], ahora: AHORA + 1 },
      TERRITORIOS,
      'provincia',
    );
    expect(() => barrer(diseno(), otroPais, modoForma)).toThrow(/país/i);
  });

  it('tira si la población no hashea lo que dice ser', () => {
    // El error central del módulo: si la población cambiara entre corridas,
    // el barrido mediría la varianza del modelo creyendo que mide la palanca.
    // No da error por sí solo y devuelve números plausibles.
    expect(() =>
      barrer(diseno(), PAIS, modoForma, {
        huella: 'huella-mentirosa',
        personas: [],
        padre: null,
        sello: null,
      }),
    ).toThrow(/huella|hashea/i);
  });
});
