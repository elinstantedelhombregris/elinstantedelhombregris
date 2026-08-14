import { medido, veredictoDe } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import GEOJSON from '../../../../../public/geo/provincias.geojson?raw';
import { clasesConParte, repartirEnClases, sembrarRetrato } from '../simulacion/celdas-sembradas';
import { rectangulosDeProvincias } from '../simulacion/rectangulo-de-provincia';

import type { ClaseSenal, Retrato, RetratoTerritorio } from '@v2/civic-core';
import type { Anillo, RectanguloGeo } from '~/components/mapa/rectangulo-inscripto';

import { anillosDeGeometria, enLaFigura } from '~/components/mapa/rectangulo-inscripto';

/**
 * Las dos cuentas del sembrado del mapa, sin montar nada.
 *
 * Lo que se cuida acá es lo que no se ve mirando la pantalla: que el reparto
 * por clase **no invente ni pierda una voz** —la lista para lectores de
 * pantalla publica esos números— y que el rectángulo de una provincia esté
 * adentro de la provincia y no sea su caja, que es la diferencia entre dibujar
 * en Formosa y dibujar en Paraguay.
 *
 * Lo segundo se **mide** sobre el archivo real, no sobre un cuadrado y un
 * triángulo. Este mismo test decía que verificaba eso y en realidad acotaba el
 * centro del rectángulo a la CAJA de la figura, con dos figuras donde eso pasa
 * solo; mientras tanto, la implementación que cuidaba sembraba el 21,6 % de la
 * superficie afuera de su provincia. La contención fina —90 × 90 por provincia,
 * con un algoritmo de contención distinto del que la construye— vive en
 * `components/mapa/__tests__/rectangulo-inscripto.test.ts`, que es donde vive
 * ahora la cuenta. Acá se verifica que ESTA superficie la esté usando.
 */

const PAREJA: Readonly<Record<ClaseSenal, number>> = {
  hecho: 0.25,
  deseo: 0.25,
  acto: 0.25,
  meta: 0.25,
};

function territorio(id: string, voces: number): RetratoTerritorio {
  const magnitud = medido(voces, 'voces', 'test');
  const umbral = medido(1, 'voces', 'test');
  return {
    territorioId: id,
    voces: magnitud,
    vocesPorCienMil: magnitud,
    umbral,
    veredicto: veredictoDe(magnitud, umbral, medido(3, 'períodos', 'test')),
  };
}

function retratoCon(conteos: Readonly<Record<string, number>>): Retrato {
  const cero = medido(0, 'fracción', 'test');
  return {
    alcance: cero,
    persistencia: cero,
    persistenciaMaxima: cero,
    legitimidad: cero,
    cobertura: cero,
    porTerritorio: new Map(
      Object.entries(conteos).map(([id, voces]) => [id, territorio(id, voces)]),
    ),
    sinDato: [],
  };
}

/** Una colección de una sola provincia, para las pruebas de lectura. */
const coleccion = (nombre: string, anillo: number[][]): unknown => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: nombre },
      geometry: { type: 'Polygon', coordinates: [anillo] },
    },
  ],
});

const CUADRADO = [
  [-60, -35],
  [-56, -35],
  [-56, -31],
  [-60, -31],
  [-60, -35],
];

describe('repartirEnClases', () => {
  it('reparte sin inventar ni perder una voz', () => {
    for (const total of [0, 1, 3, 7, 1234, 33_337]) {
      const reparto = repartirEnClases(total, PAREJA);
      const suma = [...reparto.values()].reduce((a, b) => a + b, 0);
      expect(suma).toBe(total);
    }
  });

  it('los restos van a las clases en el orden canónico, no al azar', () => {
    // 7 ÷ 4 = 1 con resto 3: tres clases se llevan una de más, y son las tres
    // primeras del canon. Dos corridas iguales tienen que dibujar lo mismo.
    const reparto = repartirEnClases(7, PAREJA);
    expect(reparto.get('hecho')).toBe(2);
    expect(reparto.get('deseo')).toBe(2);
    expect(reparto.get('acto')).toBe(2);
    expect(reparto.get('meta')).toBe(1);
  });

  it('respeta una mezcla despareja y no reparte lo que declara en cero', () => {
    const reparto = repartirEnClases(100, { hecho: 0.5, deseo: 0.5, acto: 0, meta: 0 });
    expect(reparto.get('hecho')).toBe(50);
    expect(reparto.get('deseo')).toBe(50);
    expect(reparto.get('acto')).toBe(0);
    expect(clasesConParte({ hecho: 0.5, deseo: 0.5, acto: 0, meta: 0 })).toBe(2);
  });
});

describe('rectangulosDeProvincias', () => {
  /** El lado de la grilla con la que se mide la fuga de cada rectángulo. */
  const LADO = 90;

  /** Los anillos de cada provincia del archivo real, llaveados por nombre. */
  const anillosPorProvincia = (): ReadonlyMap<string, readonly Anillo[]> => {
    const crudo = JSON.parse(GEOJSON) as {
      features?: { properties?: { name?: unknown }; geometry?: unknown }[];
    };
    const salida = new Map<string, readonly Anillo[]>();
    for (const feature of crudo.features ?? []) {
      const nombre = feature.properties?.name;
      if (typeof nombre === 'string') salida.set(nombre, anillosDeGeometria(feature.geometry));
    }
    return salida;
  };

  /** Cuántos de los `LADO × LADO` puntos del rectángulo caen afuera de la figura. */
  const afueraDe = (anillos: readonly Anillo[], r: RectanguloGeo): number => {
    const oeste = r.lng - r.anchoGrados / 2;
    const sur = r.lat - r.altoGrados / 2;
    let afuera = 0;
    for (let fila = 0; fila < LADO; fila++) {
      const lat = sur + ((fila + 0.5) * r.altoGrados) / LADO;
      for (let columna = 0; columna < LADO; columna++) {
        if (!enLaFigura(anillos, oeste + ((columna + 0.5) * r.anchoGrados) / LADO, lat)) {
          afuera += 1;
        }
      }
    }
    return afuera;
  };

  it('ni un punto del sembrado de este mapa cae afuera de su provincia', () => {
    const anillos = anillosPorProvincia();
    const rects = rectangulosDeProvincias(JSON.parse(GEOJSON) as unknown);
    expect(rects.size).toBe(24);

    const conFuga: string[] = [];
    for (const [nombre, rectangulo] of rects) {
      const figura = anillos.get(nombre) ?? [];
      const afuera = afueraDe(figura, rectangulo);
      if (afuera > 0) conFuga.push(`${nombre}: ${afuera} de ${LADO * LADO}`);
    }
    expect(conFuga).toEqual([]);
  });

  it('y no es la caja: cada rectángulo entra holgado adentro de la suya', () => {
    const anillos = anillosPorProvincia();
    const rects = rectangulosDeProvincias(JSON.parse(GEOJSON) as unknown);

    // Formosa es la provincia donde la versión vieja fallaba peor: 41,7 % de su
    // rectángulo caía afuera, con un quinto en Paraguay.
    const formosa = rects.get('Formosa');
    const figura = anillos.get('Formosa') ?? [];
    expect(formosa).toBeDefined();
    expect(figura.length).toBeGreaterThan(0);
    if (formosa === undefined) return;

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    for (const anillo of figura) {
      for (const [lng, lat] of anillo) {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    }
    expect(formosa.anchoGrados).toBeLessThan(maxLng - minLng);
    expect(formosa.altoGrados).toBeLessThan(maxLat - minLat);
    expect(afueraDe(figura, formosa)).toBe(0);
  });

  it('lo que no se puede leer no entra al mapa en vez de entrar torcido', () => {
    expect(rectangulosDeProvincias(null).size).toBe(0);
    expect(rectangulosDeProvincias({ type: 'Feature' }).size).toBe(0);
    expect(rectangulosDeProvincias(coleccion('Rota', [[-60, -35]])).size).toBe(0);
  });

  it('una figura sin cuerpo adentro no entra al mapa: se cuenta y no se dibuja', () => {
    // Una banda diagonal finita no admite ningún rectángulo adentro. Sale del
    // mapa —y quien llama la publica en `sinDibujo`— en vez de sembrarse
    // encima de la provincia de al lado.
    const sabana = [
      [0, 0],
      [10, 10],
      [10, 10.2],
      [0, 0.2],
      [0, 0],
    ];
    expect(rectangulosDeProvincias(coleccion('Sábana', sabana)).size).toBe(0);
  });
});

describe('sembrarRetrato', () => {
  const rects = rectangulosDeProvincias(coleccion('Chaco', CUADRADO));

  it('una celda por clase, y el total de la provincia intacto', () => {
    const { celdas } = sembrarRetrato(retratoCon({ Chaco: 1234 }), rects, PAREJA);
    expect(celdas).toHaveLength(4);
    expect(celdas.reduce((total, c) => total + c.voces, 0)).toBe(1234);
    // Ids distintos: la semilla de cada celda sale del id, y con el mismo id
    // las cuatro clases caerían apiladas en los mismos puntos.
    expect(new Set(celdas.map((c) => c.id)).size).toBe(4);
    expect(celdas.every((c) => c.nombre.startsWith('Chaco'))).toBe(true);
  });

  it('un territorio sin figura se dice, no se traga', () => {
    const { celdas, sinDibujo } = sembrarRetrato(
      retratoCon({ Chaco: 100, Formosa: 40 }),
      rects,
      PAREJA,
    );
    expect(sinDibujo).toEqual(['Formosa']);
    expect(celdas.every((c) => c.nombre.startsWith('Chaco'))).toBe(true);
  });

  it('una provincia sin voces no aporta celdas vacías', () => {
    const { celdas, sinDibujo } = sembrarRetrato(retratoCon({ Chaco: 0 }), rects, PAREJA);
    expect(celdas).toHaveLength(0);
    expect(sinDibujo).toHaveLength(0);
  });
});
