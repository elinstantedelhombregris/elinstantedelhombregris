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
const RUTA_ESTILO = resolve(RAIZ_WEB, 'public/maps/oscuro.json');
const DIR_FUENTES = resolve(RAIZ_WEB, 'public/fonts');

const estilo = JSON.parse(readFileSync(RUTA_ESTILO, 'utf8')) as StyleSpecification;

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

describe('estilo oscuro del mapa', () => {
  it('no le pide nada a ningún host de afuera', () => {
    // La atribución son enlaces de licencia que el usuario clickea: no los pide
    // el navegador al dibujar el mapa, y sacarlos sería incumplir la ODbL.
    const sinAtribucion = JSON.stringify(estilo, (clave, valor: unknown) =>
      clave === 'attribution' ? undefined : valor,
    );
    expect(sinAtribucion).not.toMatch(/https?:\/\//);
  });

  it('los glyphs salen del propio origen', () => {
    expect(estilo.glyphs).toBe('/fonts/{fontstack}/{range}.pbf');
  });

  it('las teselas son un archivo pmtiles de este origen', () => {
    const fuentes = Object.values(estilo.sources);
    expect(fuentes).toHaveLength(1);
    for (const fuente of fuentes) {
      expect(fuente).toMatchObject({ type: 'vector' });
      const url = (fuente as { url?: string }).url ?? '';
      expect(url).toMatch(/^pmtiles:\/\/\//);
    }
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
