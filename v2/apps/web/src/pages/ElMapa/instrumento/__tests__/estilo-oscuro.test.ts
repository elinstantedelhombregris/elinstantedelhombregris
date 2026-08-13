/**
 * Las invariantes de `public/maps/oscuro.json` — el archivo que decide si el
 * mapa sale de casa o le pide la cara a un tercero.
 *
 * Ninguna suite miraba este archivo, y es el único lugar del producto donde una
 * URL suelta reabre la fuga de IP que D-003 cerró: alcanza con que alguien
 * vuelva a pegar un `https://…` en `glyphs` o en `sources` para que el mapa
 * empiece a delatar a quien lo mira, sin romper ni un test ni un tipo.
 *
 * El caso de las tipografías es el más traicionero de los cuatro y ya pasó dos
 * veces: si el estilo pide una familia que no está en `public/fonts/`, maplibre
 * no dibuja NINGUNA etiqueta —ni las de las familias que sí están— y no hay
 * error de red que mirar. Un mapa mudo es la peor forma de fallar, así que la
 * lista de familias que pide el estilo se compara contra las que hay en disco.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { StyleSpecification } from 'maplibre-gl';

const RAIZ_WEB = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const DIR_FUENTES = resolve(RAIZ_WEB, 'public/fonts');

const leer = (nombre: string): StyleSpecification =>
  JSON.parse(readFileSync(resolve(RAIZ_WEB, `public/maps/${nombre}`), 'utf8')) as StyleSpecification;

/**
 * Hay DOS estilos y conviene saber por qué antes de tocar cualquiera de los dos.
 *
 * `oscuro.json` es el que se publica hoy: glyphs propios, y las teselas todavía
 * de Carto. `oscuro-propio.json` es el de teselas propias —66 capas contra el
 * esquema de Protomaps— y está listo y sin usar, esperando dónde vive el
 * archivo de 1,2 GB (D-051). No son versiones del mismo archivo: apuntan a
 * esquemas de teselas distintos, así que las capas de uno no sirven en el otro.
 *
 * El día que D-051 se cierre, `oscuro-propio.json` pasa a ser `oscuro.json` y
 * los dos `describe` de abajo se funden en uno. Hasta entonces los dos se
 * verifican, porque el que no se publica se pudre en silencio si nadie lo mira.
 */
const estilo = leer('oscuro.json');
const estiloPropio = leer('oscuro-propio.json');

/**
 * Todas las familias que alguna capa nombra en `text-font`, a cualquier
 * profundidad.
 *
 * Hay dos formas válidas y hay que entender las dos: en `layout` el valor es un
 * array pelado (`["Noto Sans Regular"]`), y adentro de las opciones de un
 * `["format", …]` va en posición de expresión y tiene que ser
 * `["literal", ["Noto Sans Regular"]]`. Cualquier otra forma es una expresión
 * que elige familia según el dato de cada rasgo: eso puede pedir una que no
 * servimos y no se puede verificar leyendo el archivo, así que se rechaza.
 */
function familiasPedidas(nodo: unknown, encontradas = new Set<string>()): Set<string> {
  if (Array.isArray(nodo)) {
    for (const hijo of nodo) familiasPedidas(hijo, encontradas);
    return encontradas;
  }
  if (nodo !== null && typeof nodo === 'object') {
    for (const [clave, valor] of Object.entries(nodo as Record<string, unknown>)) {
      if (clave !== 'text-font') {
        familiasPedidas(valor, encontradas);
        continue;
      }
      const pelado: unknown =
        Array.isArray(valor) && valor[0] === 'literal' ? (valor as unknown[])[1] : valor;
      if (!Array.isArray(pelado) || !pelado.every((x) => typeof x === 'string')) {
        throw new Error(`Un text-font quedó como expresión: ${JSON.stringify(valor)}`);
      }
      for (const familia of pelado) encontradas.add(familia);
    }
  }
  return encontradas;
}

/** La atribución son enlaces de licencia que el usuario clickea: no los pide el
 *  navegador al dibujar, y sacarlos sería incumplir la ODbL. */
const sinAtribucion = (e: StyleSpecification): string =>
  JSON.stringify(e, (clave, valor: unknown) => (clave === 'attribution' ? undefined : valor));

/** Los cinco subdominios del basemap de Carto, la única excepción declarada. */
const CARTO = /^https:\/\/tiles(-[abcd])?\.basemaps\.cartocdn\.com\//;

describe('estilo oscuro del mapa', () => {
  it('el ÚNICO host de afuera es el basemap de Carto, y se va con D-051', () => {
    // Escrito por lista blanca y no por «no hay ninguno», porque hoy hay uno y
    // negarlo sería un test que miente. Lo que fija es lo que importa: que no
    // aparezca un SEGUNDO. El día que las teselas tengan domicilio, la lista
    // queda vacía y este test pasa a ser el de `oscuro-propio.json`.
    const urls = sinAtribucion(estilo).match(/https?:\/\/[^"']+/g) ?? [];
    for (const url of urls) {
      expect(url, `apareció un host ajeno nuevo en oscuro.json: ${url}`).toMatch(CARTO);
    }
  });

  it('los glyphs salen del propio origen', () => {
    expect(estilo.glyphs).toBe('/fonts/{fontstack}/{range}.pbf');
  });

  it('cada capa apunta a una fuente declarada', () => {
    const declaradas = new Set(Object.keys(estilo.sources));
    for (const capa of estilo.layers) {
      if (capa.type === 'background') continue;
      expect(declaradas, capa.id).toContain((capa as { source: string }).source);
    }
  });

  it('cada familia tipográfica que pide está servida desde public/fonts', () => {
    const enDisco = new Set(
      readdirSync(DIR_FUENTES, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name),
    );
    const pedidas = familiasPedidas(estilo.layers);
    expect(pedidas.size).toBeGreaterThan(0);
    for (const familia of pedidas) {
      expect(enDisco, `el estilo pide «${familia}» y no está en public/fonts/`).toContain(familia);
    }
  });
});

describe('estilo de teselas propias (oscuro-propio.json, esperando D-051)', () => {
  it('no le pide nada a ningún host de afuera', () => {
    expect(sinAtribucion(estiloPropio)).not.toMatch(/https?:\/\//);
  });

  it('los glyphs salen del propio origen', () => {
    expect(estiloPropio.glyphs).toBe('/fonts/{fontstack}/{range}.pbf');
  });

  it('las teselas son un archivo pmtiles de este origen', () => {
    const fuentes = Object.values(estiloPropio.sources);
    expect(fuentes).toHaveLength(1);
    for (const fuente of fuentes) {
      expect(fuente).toMatchObject({ type: 'vector' });
      const url = (fuente as { url?: string }).url ?? '';
      expect(url).toMatch(/^pmtiles:\/\/\//);
    }
  });

  it('el fondo es del color del agua, que es lo que tapa el borde del recorte', () => {
    // El `.pmtiles` está recortado a las 24 provincias, así que en casi todo
    // encuadre hay lienzo sin tesela, y ahí sólo pinta la capa `background`.
    // Mientras fue del color de la tierra, el mar terminaba en una línea recta
    // y del otro lado seguía en color de tierra: medido, el 18,8% del lienzo en
    // la vista con la que abre la app, y un tajo vertical en el Atlántico a la
    // altura de Mar del Plata.
    //
    // La invariante no es «el fondo es #0E0C08» sino «el fondo es EL MISMO que
    // el agua»: el día que la paleta cambie el color del agua, este test pide
    // que el fondo la siga. Escrito contra el valor a secas, la costura volvería
    // sin romper nada. Ver D-050 — esto lo tapa, no lo cierra: lo que queda del
    // otro lado de un límite TERRESTRE se lee como mar, y eso se arregla
    // re-extrayendo con buffer, no acá.
    const fondo = estiloPropio.layers.find((capa) => capa.type === 'background');
    const agua = estiloPropio.layers.find((capa) => capa.id === 'water');
    expect(fondo, 'el estilo perdió su capa background').toBeDefined();
    expect(agua, 'el estilo perdió su capa water').toBeDefined();

    const colorDelFondo = (fondo as { paint?: Record<string, unknown> }).paint?.[
      'background-color'
    ];
    const colorDelAgua = (agua as { paint?: Record<string, unknown> }).paint?.['fill-color'];
    expect(typeof colorDelAgua).toBe('string');
    expect(colorDelFondo).toBe(colorDelAgua);
  });

  it('cada capa apunta a una fuente declarada', () => {
    const declaradas = new Set(Object.keys(estilo.sources));
    for (const capa of estilo.layers) {
      if (capa.type === 'background') continue;
      expect(declaradas, capa.id).toContain((capa as { source: string }).source);
    }
  });

  it('cada familia tipográfica que pide está servida desde public/fonts', () => {
    const enDisco = new Set(
      readdirSync(DIR_FUENTES, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name),
    );
    const pedidas = familiasPedidas(estilo.layers);
    expect(pedidas.size).toBeGreaterThan(0);
    for (const familia of pedidas) {
      expect(enDisco, `el estilo pide «${familia}» y no está en public/fonts/`).toContain(familia);
    }
  });
});
