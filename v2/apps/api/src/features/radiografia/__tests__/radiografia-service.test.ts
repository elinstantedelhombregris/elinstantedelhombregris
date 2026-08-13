/**
 * Las guardas de La Radiografía que no necesitan una base.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §11 — de las siete guardas
 * que la spec pide, acá viven las tres que son del servicio: **la del
 * conteo** (nada se pierde en silencio), **la de la cesión** (una señal sin
 * cesión nunca presta su frase) y **la del punto** (los kilómetros salen del
 * engrosado). Las de φ, del color y de la regla 11 son del motor y de la
 * página, y viven donde vive lo que verifican.
 *
 * El servicio se prueba por su puerto, con una fuente de mentira: el
 * ensamblado no sabe de dónde salieron las filas, y ésa es exactamente la
 * propiedad que hace que estos tests sean baratos.
 */
import { EmbebedorFalso, haversineKm } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { claseProvisional } from '../clase-provisional.js';
import { PISO_DE_PUBLICACION, puntoPublicable } from '../punto.js';
import { construirRadiografia, TEXTO_OMITIDO } from '../service.js';
import { consultaRadiografiaSchema, K_POR_DEFECTO, UMBRAL_POR_DEFECTO } from '../validation.js';

import type { CorridaDeAnalisis, FuenteDeRadiografia, VozDelCorpus } from '../lectura.js';
import type { GeoPoint } from '@v2/civic-core';

const embebedor = new EmbebedorFalso(32);

interface Guion {
  readonly textos: ReadonlyMap<string, string>;
  readonly voces: readonly VozDelCorpus[];
  /** Ids que quedan SIN vector aunque estén en el corpus. */
  readonly sinVector?: readonly string[];
  readonly corrida?: CorridaDeAnalisis | null;
}

/** Una fuente de mentira, construida desde textos que se embeben al vuelo. */
const fuenteDeGuion = (guion: Guion): FuenteDeRadiografia => ({
  corrida: () =>
    Promise.resolve(
      guion.corrida === undefined
        ? { modelo: 'falso', dimensiones: 32, corte: '2026-08-13T00:00:00.000Z' }
        : guion.corrida,
    ),
  voces: () => Promise.resolve(guion.voces),
  vectores: async () => {
    const excluidos = new Set(guion.sinVector ?? []);
    const ids = [...guion.textos.keys()].filter((id) => !excluidos.has(id));
    const vectores = await embebedor.embeber(ids.map((id) => guion.textos.get(id) ?? ''));
    return new Map(ids.map((id, i) => [id, vectores[i] ?? []]));
  },
});

const voz = (id: string, extra: Partial<VozDelCorpus> = {}): VozDelCorpus => ({
  id,
  clase: 'hecho',
  provinciaId: null,
  punto: null,
  ...extra,
});

const CONSULTA = consultaRadiografiaSchema.parse({});

describe('La Radiografía · el conteo', () => {
  it('analizadas + sinVector === total, aunque falten vectores', async () => {
    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'no llega el agua a la casa'],
      ['voz:3', 'quiero un tren que pase de nuevo'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos,
        voces: [voz('voz:1'), voz('voz:2'), voz('voz:3'), voz('voz:4'), voz('voz:5')],
        sinVector: ['voz:3'],
      }),
      CONSULTA,
    );

    expect(radiografia.total).toBe(5);
    expect(radiografia.analizadas).toBe(2);
    expect(radiografia.sinVector).toBe(3);
    expect(radiografia.analizadas + radiografia.sinVector).toBe(radiografia.total);
  });

  it('sin corrida no hay vectores, y el corpus entero queda esperando análisis', async () => {
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos: new Map([['voz:1', 'algo']]),
        voces: [voz('voz:1'), voz('voz:2')],
        corrida: null,
      }),
      CONSULTA,
    );

    expect(radiografia.corte).toBeNull();
    expect(radiografia.modelo).toBeNull();
    expect(radiografia.analizadas).toBe(0);
    expect(radiografia.sinVector).toBe(2);
    expect(radiografia.analizadas + radiografia.sinVector).toBe(radiografia.total);
  });

  it('una voz que nadie repitió sale como sola y no como residuo', async () => {
    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'no llega el agua al barrio'],
      ['voz:3', 'ojalá vuelva el tren de pasajeros'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({ textos, voces: [voz('voz:1'), voz('voz:2'), voz('voz:3')] }),
      CONSULTA,
    );

    expect(radiografia.nucleos).toHaveLength(1);
    expect(radiografia.nucleos[0]?.senales).toBe(2);
    expect(radiografia.solas.map((s) => s.id)).toEqual(['voz:3']);
    // Dibujadas + esperando análisis = total. Nada cae por el costado.
    const dibujadas =
      radiografia.nucleos.reduce((n, nucleo) => n + nucleo.senales, 0) + radiografia.solas.length;
    expect(dibujadas + radiografia.sinVector).toBe(radiografia.total);
  });
});

describe('La Radiografía · la cesión de licencia', () => {
  it('ningún núcleo lleva frase, y cada uno dice por qué', async () => {
    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'no llega el agua al barrio'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({ textos, voces: [voz('voz:1'), voz('voz:2')] }),
      CONSULTA,
    );

    expect(radiografia.nucleos).toHaveLength(1);
    for (const nucleo of radiografia.nucleos) {
      expect(nucleo.frase).toBeNull();
      expect(nucleo.textoOmitido).toBe(TEXTO_OMITIDO);
    }
  });

  it('el núcleo existe, se cuenta y se mide igual sin etiqueta', async () => {
    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'no llega el agua al barrio'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos,
        voces: [
          voz('voz:1', { provinciaId: 1, clase: 'hecho' }),
          voz('voz:2', { provinciaId: 2, clase: 'deseo' }),
        ],
      }),
      CONSULTA,
    );

    const nucleo = radiografia.nucleos[0];
    expect(nucleo?.senales).toBe(2);
    expect(nucleo?.provincias).toBe(2);
    expect(nucleo?.clases).toEqual({ hecho: 1, deseo: 1 });
    expect(nucleo?.miembros).toHaveLength(2);
  });
});

describe('La Radiografía · el punto', () => {
  /**
   * Dos puntos a 186 metros, los dos guardados como `exact`. Sobre la
   * coordenada cruda, `dosMasLejanos` publicaría 10 km —su piso para toda
   * distancia positiva—; engrosados a la grilla de 500 m caen en la MISMA
   * celda y la distancia publicada es 0. Los dos números son distintos, así
   * que el test distingue de verdad cuál de los dos puntos se usó.
   */
  const A = { lat: '-34.603722', lng: '-58.381592' };
  const B = { lat: '-34.605000', lng: '-58.382900' };

  it('engrosa un `exact` a la grilla en vez de publicarlo tal cual', () => {
    const engrosado = puntoPublicable(A.lat, A.lng, 'exact');
    expect(engrosado).not.toBeNull();
    expect(engrosado?.lat).not.toBe(Number(A.lat));
    expect(engrosado?.lng).not.toBe(Number(A.lng));
    expect(PISO_DE_PUBLICACION).toBe('500m');
  });

  it('respeta una precisión ya más gruesa que el piso', () => {
    const provincia = puntoPublicable(A.lat, A.lng, 'province');
    const piso = puntoPublicable(A.lat, A.lng, 'exact');
    expect(provincia).not.toEqual(piso);
  });

  it('una fila sin coordenada no aparece en el golfo de Guinea', () => {
    expect(puntoPublicable(null, null, 'exact')).toBeNull();
    expect(puntoPublicable('-34.6', null, 'exact')).toBeNull();
    expect(puntoPublicable('no es un número', '-58.4', 'exact')).toBeNull();
  });

  it('los kilómetros del núcleo salen del engrosado y no del crudo', async () => {
    const crudoA: GeoPoint = { lat: Number(A.lat), lng: Number(A.lng) };
    const crudoB: GeoPoint = { lat: Number(B.lat), lng: Number(B.lng) };
    expect(haversineKm(crudoA, crudoB)).toBeGreaterThan(0);

    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'no llega el agua al barrio'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos,
        voces: [
          voz('voz:1', { punto: puntoPublicable(A.lat, A.lng, 'exact') }),
          voz('voz:2', { punto: puntoPublicable(B.lat, B.lng, 'exact') }),
        ],
      }),
      CONSULTA,
    );

    expect(radiografia.nucleos[0]?.distancia).toEqual({ a: 'voz:1', b: 'voz:2', km: 0 });
  });
});

describe('La Radiografía · las aristas y el acomodo', () => {
  it('sólo salen las aristas visibles al umbral, y todas son medidas', async () => {
    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'no llega el agua al barrio'],
      ['voz:3', 'ojalá vuelva el tren de pasajeros'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({ textos, voces: [voz('voz:1'), voz('voz:2'), voz('voz:3')] }),
      CONSULTA,
    );

    expect(radiografia.aristas.length).toBeGreaterThan(0);
    for (const arista of radiografia.aristas) {
      expect(arista.tipo).toBe('medida');
      expect(arista.similitud).toBeGreaterThanOrEqual(radiografia.umbral);
    }
  });

  it('cada nodo trae posición, y dos corridas del mismo dato dan lo mismo', async () => {
    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'no llega el agua al barrio'],
      ['voz:3', 'ojalá vuelva el tren de pasajeros'],
    ]);
    const guion = { textos, voces: [voz('voz:1'), voz('voz:2'), voz('voz:3')] };
    const una = await construirRadiografia(fuenteDeGuion(guion), CONSULTA);
    const otra = await construirRadiografia(fuenteDeGuion(guion), CONSULTA);

    expect(otra).toEqual(una);
    for (const nodo of [...una.nucleos.flatMap((n) => n.miembros), ...una.solas]) {
      expect(Number.isFinite(nodo.x)).toBe(true);
      expect(Number.isFinite(nodo.y)).toBe(true);
      expect(Number.isFinite(nodo.z)).toBe(true);
    }
  });

  it('el corpus vacío no rompe nada', async () => {
    const radiografia = await construirRadiografia(
      fuenteDeGuion({ textos: new Map(), voces: [] }),
      CONSULTA,
    );
    expect(radiografia.total).toBe(0);
    expect(radiografia.nucleos).toEqual([]);
    expect(radiografia.solas).toEqual([]);
    expect(radiografia.aristas).toEqual([]);
    // Las 24 provincias, todas calladas. El silencio también es el dato.
    expect(radiografia.provinciasSinSenal).toBe(24);
  });
});

describe('La Radiografía · el borde', () => {
  it('los defaults son los de la spec §4.6, y están marcados como provisorios', () => {
    expect(consultaRadiografiaSchema.parse({})).toEqual({ umbral: 0.72, k: 12 });
    expect(UMBRAL_POR_DEFECTO).toBe(0.72);
    expect(K_POR_DEFECTO).toBe(12);
  });

  it('una query vacía es ausencia y no cero', () => {
    expect(consultaRadiografiaSchema.parse({ umbral: '', k: '' })).toEqual({
      umbral: UMBRAL_POR_DEFECTO,
      k: K_POR_DEFECTO,
    });
  });

  it('rechaza lo que está fuera de rango', () => {
    expect(() => consultaRadiografiaSchema.parse({ umbral: '1.4' })).toThrow();
    expect(() => consultaRadiografiaSchema.parse({ umbral: '-0.1' })).toThrow();
    expect(() => consultaRadiografiaSchema.parse({ umbral: 'ochenta' })).toThrow();
    expect(() => consultaRadiografiaSchema.parse({ k: '0' })).toThrow();
    expect(() => consultaRadiografiaSchema.parse({ k: '51' })).toThrow();
    expect(() => consultaRadiografiaSchema.parse({ k: '3.5' })).toThrow();
  });

  it('acepta los extremos del umbral', () => {
    expect(consultaRadiografiaSchema.parse({ umbral: '0' }).umbral).toBe(0);
    expect(consultaRadiografiaSchema.parse({ umbral: '1' }).umbral).toBe(1);
  });
});

describe('La Radiografía · la clase, mientras no exista el vocabulario', () => {
  it('mapea los seis tipos de voz a las cuatro clases', () => {
    expect(claseProvisional('basta')).toBe('hecho');
    expect(claseProvisional('necesidad')).toBe('hecho');
    expect(claseProvisional('recurso')).toBe('hecho');
    expect(claseProvisional('sueño')).toBe('deseo');
    expect(claseProvisional('compromiso')).toBe('acto');
    expect(claseProvisional('valor')).toBe('meta');
  });

  it('no pierde la clase por un acento ni por una mayúscula', () => {
    expect(claseProvisional('sueno')).toBe('deseo');
    expect(claseProvisional('  Sueño ')).toBe('deseo');
    expect(claseProvisional('BASTA')).toBe('hecho');
  });

  it('lo que no sabe clasificar NUNCA lo anuncia como hecho corroborable', () => {
    // Regla 11. La clase no es una tarea que le asignamos a la voz: es una
    // afirmación sobre qué tipo de cosa es, y la página la publica como tal
    // («esto se corrobora»). Decir eso de una voz que no supimos clasificar
    // es afirmar algo que no medimos. `meta` es la clase de lo que no afirma
    // nada del mundo, que es exactamente lo que sabemos de ella.
    expect(claseProvisional(null)).toBe('meta');
    expect(claseProvisional('')).toBe('meta');
    expect(claseProvisional('lo que sea')).toBe('meta');
    // El camino real: `dreams.category` es `text` sin CHECK y el borde acepta
    // cualquier cadena de 60 caracteres, así que un sueño con la categoría mal
    // tipeada entraba como hecho.
    expect(claseProvisional('sueños')).toBe('meta');
  });
});
