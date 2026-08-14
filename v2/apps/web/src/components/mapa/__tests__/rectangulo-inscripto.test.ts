import { describe, expect, it } from 'vitest';

import GEOJSON from '../../../../public/geo/provincias.geojson?raw';
import {
  anillosDeGeometria,
  rectanguloInscripto,
  RESOLUCION_INSCRIPTA,
} from '../rectangulo-inscripto';

import type { Anillo, RectanguloGeo } from '../rectangulo-inscripto';

/**
 * La única promesa de este módulo, medida y no declarada: **todo punto del
 * rectángulo cae adentro del polígono de su provincia**.
 *
 * Se mide sobre las 24 provincias del archivo que sirve la web, rasterizando
 * cada rectángulo resultante a 90 × 90 —más fino que la grilla de 44 con la que
 * se calculó, así que el test no puede darse la razón sola reusando su propia
 * discretización— y contando cuántos de esos 8.100 puntos caen afuera. El
 * umbral es cero. No es una tolerancia elegida: un punto afuera es una voz
 * dibujada en un territorio que no la dijo.
 *
 * Existe porque hubo una implementación que prometía esto y no lo cumplía —
 * encogía la caja hasta igualar el área del polígono y la centraba en el
 * centroide, con 21,6 % de la superficie sembrada afuera de su provincia— y el
 * test que la cuidaba acotaba el centro a la CAJA sobre un cuadrado y un
 * triángulo, donde eso se cumple sin decir nada. Un test decorativo es peor que
 * ninguno: da permiso.
 */

/* ── La medición, por un camino distinto al del módulo ───────────────────── */

/**
 * Punto adentro de la figura, por NÚMERO DE VUELTAS.
 *
 * El módulo resuelve la contención por cruce de rayo. Acá se usa winding number,
 * que es otro algoritmo: si la contención se verificara con la misma función que
 * la construye, un error en esa función se confirmaría a sí mismo. Los dos tienen
 * que coincidir para que el test pase.
 */
function porVueltas(anillos: readonly Anillo[], lng: number, lat: number): boolean {
  let vueltas = 0;
  for (const anillo of anillos) {
    for (let i = 0; i < anillo.length; i++) {
      const a = anillo[i];
      const b = anillo[(i + 1) % anillo.length];
      if (a === undefined || b === undefined) continue;
      const [ax, ay] = a;
      const [bx, by] = b;
      const izquierda = (bx - ax) * (lat - ay) - (lng - ax) * (by - ay);
      if (ay <= lat) {
        if (by > lat && izquierda > 0) vueltas += 1;
      } else if (by <= lat && izquierda < 0) vueltas -= 1;
    }
  }
  return vueltas !== 0;
}

/** El lado de la grilla de medición. Más fino que el del cálculo, a propósito. */
const LADO_DE_MEDICION = 90;

function puntosAfuera(anillos: readonly Anillo[], rectangulo: RectanguloGeo): number {
  const oeste = rectangulo.lng - rectangulo.anchoGrados / 2;
  const sur = rectangulo.lat - rectangulo.altoGrados / 2;
  let afuera = 0;
  for (let fila = 0; fila < LADO_DE_MEDICION; fila++) {
    const lat = sur + ((fila + 0.5) * rectangulo.altoGrados) / LADO_DE_MEDICION;
    for (let columna = 0; columna < LADO_DE_MEDICION; columna++) {
      const lng = oeste + ((columna + 0.5) * rectangulo.anchoGrados) / LADO_DE_MEDICION;
      if (!porVueltas(anillos, lng, lat)) afuera += 1;
    }
  }
  return afuera;
}

/** El área de la figura, por el teorema del zapatero. Sólo para la tabla. */
function areaDe(anillos: readonly Anillo[]): number {
  let total = 0;
  for (const anillo of anillos) {
    let cruzada = 0;
    for (let i = 0; i < anillo.length; i++) {
      const p = anillo[i];
      const q = anillo[(i + 1) % anillo.length];
      if (p === undefined || q === undefined) continue;
      cruzada += p[0] * q[1] - q[0] * p[1];
    }
    total += Math.abs(cruzada) / 2;
  }
  return total;
}

/* ── Las veinticuatro provincias del archivo que sirve la web ────────────── */

interface Provincia {
  readonly nombre: string;
  readonly anillos: readonly Anillo[];
}

function provinciasDelArchivo(): Provincia[] {
  const coleccion = JSON.parse(GEOJSON) as {
    features?: { properties?: { name?: unknown }; geometry?: unknown }[];
  };
  const salida: Provincia[] = [];
  for (const feature of coleccion.features ?? []) {
    const nombre = feature.properties?.name;
    if (typeof nombre !== 'string') continue;
    salida.push({ nombre, anillos: anillosDeGeometria(feature.geometry) });
  }
  return salida;
}

interface Medicion {
  readonly nombre: string;
  readonly afuera: number;
  readonly fuga: number;
  readonly cobertura: number;
}

const porcentaje = (v: number): string => `${(v * 100).toFixed(1).replace('.', ',')} %`;

describe('el rectángulo inscripto sobre las 24 provincias reales', () => {
  const provincias = provinciasDelArchivo();
  const sinRectangulo: string[] = [];
  const mediciones: Medicion[] = [];

  for (const provincia of provincias) {
    const rectangulo = rectanguloInscripto(provincia.anillos);
    if (rectangulo === null) {
      sinRectangulo.push(provincia.nombre);
      continue;
    }
    const afuera = puntosAfuera(provincia.anillos, rectangulo);
    mediciones.push({
      nombre: provincia.nombre,
      afuera,
      fuga: afuera / (LADO_DE_MEDICION * LADO_DE_MEDICION),
      cobertura: (rectangulo.anchoGrados * rectangulo.altoGrados) / areaDe(provincia.anillos),
    });
  }

  const tabla = mediciones
    .map(
      (m) =>
        `${m.nombre.padEnd(34)} fuga ${porcentaje(m.fuga).padStart(7)} · cubre ${porcentaje(
          m.cobertura,
        ).padStart(7)} del polígono`,
    )
    .join('\n');

  it('lee las veinticuatro y le encuentra un cuerpo a cada una', () => {
    expect(provincias).toHaveLength(24);
    expect(provincias.map((p) => p.nombre)).toContain('Ciudad Autónoma de Buenos Aires');
    expect(sinRectangulo).toEqual([]);
  });

  it('0,0 % de la superficie sembrada cae afuera de su provincia', () => {
    const conFuga = mediciones.filter((m) => m.afuera > 0).map((m) => `${m.nombre}: ${m.afuera}`);
    expect(conFuga, `\nFuga por provincia (${LADO_DE_MEDICION}×${LADO_DE_MEDICION}):\n${tabla}\n`).toEqual(
      [],
    );
  });

  it('lo que queda adentro es dibujable: la más apretada es Formosa, y cubre más de la quinta parte', () => {
    const flaca = [...mediciones].sort((a, b) => a.cobertura - b.cobertura)[0];
    expect(flaca?.nombre).toBe('Formosa');
    /*
      Tripwire, no objetivo: hoy Formosa cubre el 21,5 % de su polígono y es la
      peor de las veinticuatro. Si alguna cae por debajo de la quinta parte hay
      que mirarla —puede seguir siendo honesta y estar dibujando en un pañuelo—,
      pero el arreglo NUNCA es aflojar la contención.
    */
    expect(flaca?.cobertura).toBeGreaterThan(0.2);
    for (const m of mediciones) expect(m.cobertura).toBeGreaterThan(0.2);
  });
});

/* ── Las formas donde la diferencia se ve a ojo ──────────────────────────── */

describe('rectanguloInscripto', () => {
  /**
   * La ele: el cuadrante de arriba a la derecha —lng > 2 y lat > 2— está AFUERA
   * del polígono, y ocupa un cuarto de la caja. Un rectángulo que iguale áreas
   * se mete ahí; uno inscripto, no.
   */
  const ele: readonly Anillo[] = [
    [
      [0, 0],
      [4, 0],
      [4, 2],
      [2, 2],
      [2, 4],
      [0, 4],
      [0, 0],
    ],
  ];

  it('no se mete en la concavidad, y lo que devuelve es dibujable', () => {
    const rectangulo = rectanguloInscripto(ele);
    expect(rectangulo).not.toBeNull();
    if (rectangulo === null) return;
    expect(puntosAfuera(ele, rectangulo)).toBe(0);
    expect(rectangulo.anchoGrados).toBeGreaterThan(0.5);
    expect(rectangulo.altoGrados).toBeGreaterThan(0.5);
  });

  it('un cuadrado se dibuja casi entero: inscripto no quiere decir chiquito', () => {
    const cuadrado: readonly Anillo[] = [
      [
        [-60, -35],
        [-56, -35],
        [-56, -31],
        [-60, -31],
        [-60, -35],
      ],
    ];
    const rectangulo = rectanguloInscripto(cuadrado);
    expect(rectangulo).not.toBeNull();
    if (rectangulo === null) return;
    expect(rectangulo.anchoGrados * rectangulo.altoGrados).toBeGreaterThan(0.9 * 16);
    expect(rectangulo.lng).toBeCloseTo(-58, 6);
    expect(rectangulo.lat).toBeCloseTo(-33, 6);
  });

  it('un triángulo rectángulo no invade su hipotenusa', () => {
    const triangulo: readonly Anillo[] = [
      [
        [-60, -35],
        [-56, -35],
        [-56, -31],
        [-60, -35],
      ],
    ];
    const rectangulo = rectanguloInscripto(triangulo);
    expect(rectangulo).not.toBeNull();
    if (rectangulo === null) return;
    expect(puntosAfuera(triangulo, rectangulo)).toBe(0);
    /*
      La versión que igualaba áreas daba un cuadrado de lado 4·√½ = 2,83 sobre
      una caja de 4: la mitad de ese cuadrado cae del otro lado de la hipotenusa.
      El inscripto no puede llegar a esa área, y ésa es exactamente la diferencia
      entre dibujar en Formosa y dibujar en Paraguay.
    */
    const areaIgualada = (4 * Math.SQRT1_2) ** 2;
    expect(rectangulo.anchoGrados * rectangulo.altoGrados).toBeLessThan(areaIgualada);
    // Y tampoco es una respuesta de compromiso: el máximo inscripto en este
    // triángulo es la mitad de su área, o sea 4 grados cuadrados.
    expect(rectangulo.anchoGrados * rectangulo.altoGrados).toBeGreaterThan(3.5);
  });

  it('una figura tan angosta que no tiene cuerpo adentro devuelve null y no un rectángulo de cero', () => {
    // Una banda diagonal de 0,2 grados de espesor sobre una caja de 10 × 10:
    // ninguna corrida de celdas adentro llega a dos de ancho y dos de alto.
    const sabana: readonly Anillo[] = [
      [
        [0, 0],
        [10, 10],
        [10, 10.2],
        [0, 0.2],
      ],
    ];
    expect(rectanguloInscripto(sabana)).toBeNull();
  });

  it('lo que no tiene área no devuelve un rectángulo', () => {
    expect(rectanguloInscripto([])).toBeNull();
    expect(
      rectanguloInscripto([
        [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      ]),
    ).toBeNull();
    expect(RESOLUCION_INSCRIPTA).toBeGreaterThan(1);
  });
});

describe('anillosDeGeometria', () => {
  const anillo = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 0],
  ];

  it('lee un Polygon y un MultiPolygon, y se queda con los anillos exteriores', () => {
    expect(anillosDeGeometria({ type: 'Polygon', coordinates: [anillo] })).toHaveLength(1);
    expect(
      anillosDeGeometria({ type: 'MultiPolygon', coordinates: [[anillo], [anillo]] }),
    ).toHaveLength(2);
    // El hueco de un Polygon se ignora: el archivo de hoy no trae ninguno.
    expect(anillosDeGeometria({ type: 'Polygon', coordinates: [anillo, anillo] })).toHaveLength(1);
  });

  it('un anillo con un punto ilegible se descarta entero, no se cose', () => {
    // Saltear el punto malo devolvería un polígono con una cuerda donde había
    // una costa, y el rectángulo que salga de esa figura ya no promete nada.
    expect(
      anillosDeGeometria({ type: 'Polygon', coordinates: [[[0, 0], ['x', 1], [1, 1], [0, 0]]] }),
    ).toEqual([]);
    expect(
      anillosDeGeometria({ type: 'Polygon', coordinates: [[[0, 0], [1, Number.NaN], [1, 1]]] }),
    ).toEqual([]);
  });

  it('lo que no se puede leer devuelve una lista vacía en vez de tirar', () => {
    expect(anillosDeGeometria(null)).toEqual([]);
    expect(anillosDeGeometria({ type: 'Point', coordinates: [0, 0] })).toEqual([]);
    expect(anillosDeGeometria({ type: 'Polygon' })).toEqual([]);
    expect(anillosDeGeometria({ type: 'Polygon', coordinates: [[[0, 0], [1, 1]]] })).toEqual([]);
  });
});
