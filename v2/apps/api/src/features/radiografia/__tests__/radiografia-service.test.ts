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
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { EmbebedorFalso, haversineKm } from '@v2/civic-core';
import { MOTIVO_TEXTO_OMITIDO } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import { PISO_DE_PUBLICACION, puntoPublicable } from '../punto.js';
import { construirRadiografia } from '../service.js';
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
  corpus: 'guion',
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

/**
 * Una voz **sin cesión** por defecto: la ausencia de cesión es el estado
 * normal, y un default al revés dejaría pasar un servicio que ignora la
 * columna.
 */
const voz = (id: string, extra: Partial<VozDelCorpus> = {}): VozDelCorpus => ({
  id,
  clase: 'hecho',
  texto: 'algo que alguien dijo',
  cesionLicencia: false,
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
  const FRASE = 'no llega el agua al barrio';
  const textosDelNucleo = new Map([
    ['voz:1', FRASE],
    ['voz:2', FRASE],
  ]);

  it('una señal SIN cesión no presta su frase, y el núcleo dice por qué', async () => {
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos: textosDelNucleo,
        voces: [
          voz('voz:1', { texto: FRASE, cesionLicencia: false }),
          voz('voz:2', { texto: FRASE, cesionLicencia: false }),
        ],
      }),
      CONSULTA,
    );

    expect(radiografia.nucleos).toHaveLength(1);
    for (const nucleo of radiografia.nucleos) {
      expect(nucleo.frase).toBeNull();
      // El motivo es el compartido de `@v2/shared`, no una copia local: dos
      // superficies que omiten lo mismo por la misma razón lo dicen igual.
      expect(nucleo.textoOmitido).toBe(MOTIVO_TEXTO_OMITIDO);
    }
  });

  it('una señal CON cesión sí presta su frase, y es la suya palabra por palabra', async () => {
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos: textosDelNucleo,
        voces: [
          voz('voz:1', { texto: FRASE, cesionLicencia: false }),
          voz('voz:2', { texto: FRASE, cesionLicencia: true }),
        ],
      }),
      CONSULTA,
    );

    const nucleo = radiografia.nucleos[0];
    // La única que cedió es la que etiqueta, aunque las dos estén igual de
    // cerca del centroide: la cesión manda sobre la centralidad.
    expect(nucleo?.frase).toEqual({ id: 'voz:2', texto: FRASE });
    expect(nucleo?.textoOmitido).toBeNull();
  });

  it('la frase es la señal real y nunca un resumen', async () => {
    const textos = new Map([
      ['voz:1', 'se cortó la luz otra vez en el barrio'],
      ['voz:2', 'se cortó la luz otra vez en el barrio'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos,
        voces: [
          voz('voz:1', { texto: 'se cortó la luz otra vez en el barrio', cesionLicencia: true }),
          voz('voz:2', { texto: 'se cortó la luz otra vez en el barrio', cesionLicencia: true }),
        ],
      }),
      CONSULTA,
    );

    const frase = radiografia.nucleos[0]?.frase;
    expect(frase?.texto).toBe('se cortó la luz otra vez en el barrio');
    expect(['voz:1', 'voz:2']).toContain(frase?.id);
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

/**
 * El bloque que había acá —«la clase, mientras no exista el vocabulario»—
 * probaba `claseProvisional`, el mapa de `dreams.category` a las cuatro clases.
 * Se borró con su archivo, y con razón escrita: la cabecera de
 * `clase-provisional.ts` decía «este archivo se BORRA entero el día que exista
 * `vocabulario.ts`», que existe desde el 13/8/2026. La clase ya no se infiere:
 * sale de `senales.clase`, que es `notNull` y está atornillada por dos FK
 * compuestas contra `tipos_senal` y `estados_senal`. Lo que aquellos tests
 * verificaban lo verifica ahora Postgres, y `packages/db/tests/senales-imposibles.test.ts`
 * lo prueba contra la base. De paso murió el mapeo de `valor`, un tipo que salió
 * del canon.
 */
/**
 * La guarda se lee del ARCHIVO y no importando `lectura.ts`, y no es pereza:
 * ese módulo arrastra el logger, el logger arrastra `config`, y `config` exige
 * `DATABASE_URL` y los dos secretos. Un test unitario que necesita entorno deja
 * de correr donde tiene que correr — y el `--passWithNoTests` de esta suite hace
 * que eso se vea como verde.
 */
describe('La Radiografía · el corpus, por su nombre', () => {
  const lectura = readFileSync(fileURLToPath(new URL('../lectura.ts', import.meta.url)), 'utf8');
  const sinComentarios = lectura.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  /**
   * El rótulo vale `'senales'` **y vive en un solo lugar**.
   *
   * La primera versión de esta guarda afirmaba la grafía —`export const FUENTE
   * = 'senales'`— y por eso se puso roja el día que el literal se mudó a
   * `@v2/db`, que es adonde tenía que mudarse: el job de embebido escribe esa
   * misma columna y no puede importar de `apps/api`. Una guarda que fija cómo
   * se escribe algo en vez de cuánto vale se opone a la mejora que debería
   * dejar pasar.
   *
   * Se verifica la cadena entera sin importar nada, porque `lectura.ts`
   * arrastra el logger y con él `DATABASE_URL`: un unit test con entorno deja
   * de correr donde tiene que correr.
   */
  it('el rótulo de la fuente es `senales`, y sale de un solo lugar', () => {
    expect(sinComentarios).toMatch(/export const FUENTE = FUENTE_VIVA;/);
    expect(sinComentarios).toMatch(/FUENTE_VIVA[^;]*from '@v2\/db'/);

    const analisis = readFileSync(
      fileURLToPath(new URL('../../../../../../packages/db/src/repositories/analisis.ts', import.meta.url)),
      'utf8',
    );
    expect(analisis.replace(/\/\*[\s\S]*?\*\//g, '')).toMatch(
      /export const FUENTE_VIVA = 'senales';/,
    );
  });

  /**
   * La guarda que faltaba el 16/8/2026: `dreams` está retirada desde la
   * migración 0022 y este archivo la leía igual. Nada fallaba —163 tests en
   * verde— porque el vacío diseñado de la página tapaba el caño desconectado.
   * Esto es lo que hace que volver a apuntar ahí se note.
   */
  it('la lectura NO nombra la tabla retirada, se escriba como se escriba', () => {
    // Ni el símbolo de drizzle, ni la tabla en un `sql` crudo. El comentario
    // que cuenta la historia se descarta antes de mirar.
    expect(sinComentarios).not.toMatch(/\bdreams\b/);
    expect(sinComentarios).toMatch(/\bsenales\b/);
  });

  it('el corpus viaja en la respuesta, al lado del modelo', async () => {
    const radiografia = await construirRadiografia(
      fuenteDeGuion({ textos: new Map(), voces: [] }),
      CONSULTA,
    );
    expect(radiografia.corpus).toBe('guion');
  });
});

describe('La Radiografía · el régimen degenerado', () => {
  const conNVoces = async (n: number, k: number) => {
    const textos = new Map(
      Array.from({ length: n }, (_, i) => [`voz:${String(i)}`, `frase distinta número ${String(i)}`]),
    );
    return construirRadiografia(
      fuenteDeGuion({ textos, voces: [...textos.keys()].map((id) => voz(id)) }),
      consultaRadiografiaSchema.parse({ k: String(k) }),
    );
  };

  it('con n ≤ k+1 lo declara, porque el grafo es completo por construcción', async () => {
    const radiografia = await conNVoces(4, 3);
    expect(radiografia.regimenDegenerado).toEqual({ n: 4, k: 3 });
  });

  it('con n > k+1 no lo declara: ahí la partición sí depende del texto', async () => {
    const radiografia = await conNVoces(6, 3);
    expect(radiografia.regimenDegenerado).toBeNull();
  });

  it('cuenta las que ENTRARON al grafo, no el corpus entero', async () => {
    // Cinco voces, dos sin vector: el grafo tiene tres nodos. Con k=12 eso es
    // degenerado aunque el total no lo diga.
    const textos = new Map([
      ['voz:1', 'no llega el agua al barrio'],
      ['voz:2', 'ojalá vuelva el tren'],
      ['voz:3', 'se cortó la luz'],
    ]);
    const radiografia = await construirRadiografia(
      fuenteDeGuion({
        textos,
        voces: ['voz:1', 'voz:2', 'voz:3', 'voz:4', 'voz:5'].map((id) => voz(id)),
      }),
      CONSULTA,
    );
    expect(radiografia.total).toBe(5);
    expect(radiografia.analizadas).toBe(3);
    expect(radiografia.regimenDegenerado).toEqual({ n: 3, k: K_POR_DEFECTO });
  });

  it('el cielo vacío y la voz sola no lo declaran: no hay ningún par que medir', async () => {
    const vacio = await construirRadiografia(
      fuenteDeGuion({ textos: new Map(), voces: [] }),
      CONSULTA,
    );
    expect(vacio.regimenDegenerado).toBeNull();

    const una = await construirRadiografia(
      fuenteDeGuion({ textos: new Map([['voz:1', 'algo']]), voces: [voz('voz:1')] }),
      CONSULTA,
    );
    expect(una.regimenDegenerado).toBeNull();
  });
});
