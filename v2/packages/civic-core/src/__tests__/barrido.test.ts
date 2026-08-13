import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { barrer, prepararContexto, TECHO_TERRITORIO_CORRIDAS, territoriosQueGananMandato } from '../simulacion/espina/barrer.js';
import { correr, leerObjetivo, ordenCanonico } from '../simulacion/espina/corrida.js';
import { armarPais, escenarioBase } from '../simulacion/espina/escenario.js';
import { MINIMO_MUESTRAS } from '../simulacion/espina/estimacion.js';
import { hipercuboLatino, rangos, spearman } from '../simulacion/espina/metodos/muestreo.js';
import { monotoniaDe } from '../simulacion/espina/metodos/oat.js';
import {
  CLAVES_VARIABLE,
  conVariable,
  conVariables,
  DOMINIOS,
  leerVariable,
  muestrear,
  probit,
} from '../simulacion/espina/variables.js';
import { modoForma } from '../simulacion/modo-forma.js';

import type { Diseno } from '../simulacion/espina/barrer.js';
import type { Escenario, Pais } from '../simulacion/espina/escenario.js';
import type { BarraDeTornado } from '../simulacion/espina/metodos/oat.js';
import type { ClaveVariable } from '../simulacion/espina/variables.js';
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
    // En el modo forma la participación SÍ es entrada, así que hay tabla.
    expect(salida.salida.estado).toBe('medidos');
    if (salida.salida.estado !== 'medidos') return;

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
    if (salida.salida.estado !== 'medidos') throw new Error('el modo forma sí lee la palanca');
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

/**
 * El tornado tenía DOS definiciones de «cuánto mueve» y publicaba las dos: la
 * lista ordenaba por `amplitud` —el recorrido observado— y el rect se dibujaba
 * de `bajo` a `alto` —los extremos del rango—. Para una variable no monótona no
 * son el mismo número, y había una inversión medida: `horizonte` ordenaba antes
 * que `participacion` con una barra más corta. Una barra que ordena mal es peor
 * que no tener tornado, porque parece conocimiento.
 */
describe('GUARDA: el tornado ordena y dibuja el mismo número', () => {
  /** El escenario donde `horizonte` sube y después baja. Medido, no supuesto. */
  const NO_MONOTONO: Escenario = conVariables(
    ESC,
    new Map<ClaveVariable, number>([
      ['participacion', 180],
      ['constancia', 0.6],
      ['resistencia', 0],
    ]),
  );

  function barrasDe(base: Escenario, objetivo: Diseno['objetivo']): readonly BarraDeTornado[] {
    const salida = barrer(
      diseno({
        base,
        objetivo,
        claves: ['participacion', 'horizonte', 'constancia', 'dispersion'],
        metodo: { tipo: 'unaPorVez', pasos: 11 },
      }),
      PAIS,
      modoForma,
    );
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'unaPorVez') {
      throw new Error('el barrido tenía que estar listo');
    }
    return salida.salida.barras;
  }

  it('`amplitud` es exactamente el recorrido que se dibuja, para toda barra', () => {
    for (const barra of barrasDe(NO_MONOTONO, 'legitimidad')) {
      if (barra.estado !== 'medida') continue;
      expect(barra.amplitud.valor).toBeCloseTo(barra.maximo.valor - barra.minimo.valor, 12);
      // Y el recorrido contiene de verdad a todos los puntos medidos: si no,
      // la barra sería más corta que la nube que tiene encima.
      for (const punto of barra.puntos) {
        expect(punto.salida).toBeGreaterThanOrEqual(barra.minimo.valor);
        expect(punto.salida).toBeLessThanOrEqual(barra.maximo.valor);
      }
    }
  });

  it('una variable no monótona se sale de sus dos extremos, y por eso divergían', () => {
    const barras = barrasDe(NO_MONOTONO, 'legitimidad');
    const horizonte = barras.find((b) => b.clave === 'horizonte');
    expect(horizonte?.estado).toBe('medida');
    if (horizonte?.estado !== 'medida') return;

    expect(horizonte.monotonia).toBe('noMonotona');
    // Lo que el rect dibujaba antes: 0,600. Lo que la lista ordenaba: 0,6667.
    const entreExtremos = Math.abs(horizonte.alto.valor - horizonte.bajo.valor);
    expect(horizonte.amplitud.valor).toBeGreaterThan(entreExtremos);
    // Y lo que se dibuja ahora es lo segundo, no lo primero.
    expect(horizonte.maximo.valor - horizonte.minimo.valor).toBeGreaterThan(entreExtremos);
    expect(horizonte.amplitud.valor).toBeCloseTo(2 / 3, 4);
    expect(entreExtremos).toBeCloseTo(0.6, 4);

    // Y la inversión que se veía en pantalla: `horizonte` ordena ARRIBA de
    // `participacion` y dibujaba una barra más corta que la de abajo.
    const participacion = barras.find((b) => b.clave === 'participacion');
    if (participacion?.estado !== 'medida') throw new Error('tenía que estar medida');
    expect(horizonte.amplitud.valor).toBeGreaterThan(participacion.amplitud.valor);
    expect(entreExtremos).toBeLessThan(
      Math.abs(participacion.alto.valor - participacion.bajo.valor),
    );
  });

  it('la unidad la dice el objetivo medido, no una constante del archivo', () => {
    // `territoriosConMandato` se cuenta en territorios. La barra fijaba
    // «fracción» a mano y publicaba `{ valor: 4, unidad: 'fracción' }`: la
    // primitiva de honestidad cargando un dato falso.
    const barras = barrasDe(ESC, 'territoriosConMandato');
    const esperada = leerObjetivo(
      correr(conVariable(ESC, 'participacion', 900), PAIS, modoForma).corrida,
      'territoriosConMandato',
    ).unidad;
    expect(esperada).toBe('territorios');

    for (const barra of barras) {
      if (barra.estado !== 'medida') continue;
      for (const m of [barra.bajo, barra.alto, barra.minimo, barra.maximo, barra.amplitud]) {
        expect(m.unidad).toBe(esperada);
      }
    }

    // Y con un objetivo que sí es fracción, sigue diciendo fracción.
    for (const barra of barrasDe(ESC, 'legitimidad')) {
      if (barra.estado !== 'medida') continue;
      expect(barra.amplitud.unidad).toBe('fracción');
    }
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

/**
 * El hipercubo guardaba en `entradas` el valor CRUDO del sorteo y recién
 * después lo aplicaba. Para las cuatro `composicion.*`, `conVariable`
 * renormaliza y el valor efectivo es otro — y Spearman mira sólo el orden, que
 * es exactamente lo que la renormalización cambia. `barrerUnaPorVez` no lo
 * tenía porque relee del escenario con `leerVariable`; ahora el hipercubo hace
 * lo mismo.
 */
describe('GUARDA: el hipercubo correlaciona lo que el motor usó', () => {
  const CLAVES: readonly ClaveVariable[] = [
    'composicion.hecho',
    'composicion.deseo',
    'composicion.acto',
    'composicion.meta',
    'participacion',
  ];
  const MUESTRAS = 80;
  const BASE = conVariable(ESC, 'participacion', 400);

  /** El mismo diseño, recalculado a mano desde el hipercubo hacia afuera. */
  function aMano(): {
    efectivo: Map<ClaveVariable, number | null>;
    crudo: Map<ClaveVariable, number | null>;
  } {
    const filas = hipercuboLatino(CLAVES, MUESTRAS, BASE.semilla);
    const efectivas = new Map<ClaveVariable, number[]>(CLAVES.map((c) => [c, []]));
    const crudas = new Map<ClaveVariable, number[]>(CLAVES.map((c) => [c, []]));
    const salidas: number[] = [];

    for (const fila of filas) {
      const valores = new Map<ClaveVariable, number>();
      CLAVES.forEach((c, i) => valores.set(c, fila[i] ?? 0));
      const esc = conVariables(BASE, valores);
      for (const c of CLAVES) {
        efectivas.get(c)?.push(leerVariable(esc, c) ?? 0);
        crudas.get(c)?.push(valores.get(c) ?? 0);
      }
      salidas.push(leerObjetivo(correr(esc, PAIS, modoForma).corrida, 'legitimidad').valor);
    }

    return {
      efectivo: new Map(CLAVES.map((c) => [c, spearman(efectivas.get(c) ?? [], salidas)])),
      crudo: new Map(CLAVES.map((c) => [c, spearman(crudas.get(c) ?? [], salidas)])),
    };
  }

  it('para la composición, ρ sale del valor renormalizado y no del sorteado', () => {
    const salida = barrer(
      diseno({ base: BASE, claves: CLAVES, metodo: { tipo: 'hipercubo', muestras: MUESTRAS } }),
      PAIS,
      modoForma,
    );
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'hipercubo') {
      throw new Error('el barrido tenía que estar listo');
    }
    const { efectivo, crudo } = aMano();

    let divergieron = 0;
    for (const fila of salida.salida.importancia) {
      if (fila.estado !== 'medida') continue;
      const esperado = efectivo.get(fila.clave);
      expect(esperado, `no se pudo recalcular «${fila.clave}»`).not.toBeNull();
      if (esperado === null || esperado === undefined) continue;
      expect(fila.correlacion.valor).toBeCloseTo(esperado, 12);

      const sorteado = crudo.get(fila.clave);
      if (sorteado !== null && sorteado !== undefined && Math.abs(sorteado - esperado) > 1e-9) {
        divergieron += 1;
      }
    }

    // Sin esta línea el test sería vacuo: hace falta que en este diseño los dos
    // números sean de verdad distintos para que la afirmación distinga.
    expect(divergieron).toBeGreaterThan(0);
  });

  it('el signo llega a darse vuelta, y el que publica el barrido es el del motor', () => {
    const { efectivo, crudo } = aMano();
    const efectivoActo = efectivo.get('composicion.acto');
    const crudoActo = crudo.get('composicion.acto');
    expect(efectivoActo).not.toBeNull();
    expect(crudoActo).not.toBeNull();
    if (efectivoActo == null || crudoActo == null) return;
    // Los dos números existen y tienen signos opuestos: no es un decimal, es
    // «sube» contra «baja» en la misma fila del ranking.
    expect(Math.sign(efectivoActo)).not.toBe(Math.sign(crudoActo));

    const salida = barrer(
      diseno({ base: BASE, claves: CLAVES, metodo: { tipo: 'hipercubo', muestras: MUESTRAS } }),
      PAIS,
      modoForma,
    );
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'hipercubo') {
      throw new Error('el barrido tenía que estar listo');
    }
    const acto = salida.salida.importancia.find((f) => f.clave === 'composicion.acto');
    if (acto?.estado !== 'medida') throw new Error('tenía que estar medida');
    expect(Math.sign(acto.correlacion.valor)).toBe(Math.sign(efectivoActo));
  });
});

/**
 * La misma pantalla decía «5 corridas no alcanzan para estimar dispersión» y
 * dos centímetros más abajo publicaba `ρ 0,71 · [0,73, 1,00] · 5 corridas`, con
 * el estimador puntual afuera de su propio intervalo. Dos varas en la misma
 * pantalla no son dos lecturas: son una contradicción.
 */
describe('GUARDA: una sola vara de «cuántas corridas alcanzan»', () => {
  const conMuestras = (muestras: number) => {
    const salida = barrer(
      diseno({
        claves: ['participacion', 'constancia'],
        metodo: { tipo: 'hipercubo', muestras },
      }),
      PAIS,
      modoForma,
    );
    if (salida.estado !== 'listo' || salida.salida.metodo !== 'hipercubo') {
      throw new Error('el barrido tenía que estar listo');
    }
    return salida.salida;
  };

  it('por debajo del piso NINGUNA de las dos publica, y las dos dicen cuántas faltan', () => {
    for (const muestras of [5, MINIMO_MUESTRAS - 1, 1]) {
      const { importancia, estimaciones } = conMuestras(muestras);

      expect(estimaciones.legitimidad.tipo).not.toBe('muestra');
      for (const fila of importancia) {
        expect(fila.estado, `«${fila.clave}» con ${String(muestras)} muestras`).not.toBe('medida');
      }

      const piso = importancia.find((f) => f.clave === 'participacion');
      expect(piso?.estado).toBe('sinMuestras');
      if (piso?.estado !== 'sinMuestras') continue;
      expect(piso.n).toBe(muestras);
      // El número que falta, escrito: es el mismo de `estimacion.ts`.
      expect(piso.razon).toContain(String(MINIMO_MUESTRAS));
    }
  });

  it('en el piso las dos publican, así que la vara no es un candado', () => {
    const { importancia, estimaciones } = conMuestras(MINIMO_MUESTRAS);
    expect(estimaciones.legitimidad.tipo).toBe('muestra');
    const participacion = importancia.find((f) => f.clave === 'participacion');
    expect(participacion?.estado).toBe('medida');
    if (participacion?.estado !== 'medida') return;
    expect(participacion.n).toBe(MINIMO_MUESTRAS);
  });

  it('«sin muestras» no se dice con las palabras de «sin variación»', () => {
    // Son dos afirmaciones distintas: una es «no alcanza para medir» y la otra
    // es «se midió y no se movió». Confundirlas afirma un hecho sobre el modelo
    // que nadie comprobó.
    const { importancia } = conMuestras(5);
    const sinMuestras = importancia.filter((f) => f.estado === 'sinMuestras');
    expect(sinMuestras.length).toBeGreaterThan(0);
    for (const fila of sinMuestras) {
      expect(fila.razon).not.toContain('no varió');
      expect(fila.razon).toMatch(/no alcanzan/);
    }
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
