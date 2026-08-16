import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CLASES_SENAL } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { pesoDeProfundidad } from '../constelacion-pintor';
import { colorDeClase } from '../radiografia-data';

import {
  colorDeClase as colorDeClaseDelPintor,
  CONTRASTE_MINIMO,
  contraste,
  FONDO_DEL_TEMA,
  GRIS_DEL_TEMA,
  haciaElFondo,
  TEMAS_DEL_MAPA,
} from '~/components/mapa/pintor-senales';

/**
 * **La guarda del color** — la séptima de las siete guardas de la spec §11, y
 * la única que nunca se había escrito.
 *
 * Es exactamente la que faltaba. Esta página había creado su propia tabla
 * clase → color: un solo valor por clase, sin parámetro de tema, mientras la
 * spec §5.2 dice textual que «esta página **no crea ninguna tabla de color
 * propia**». Contra el fondo nocturno esa tabla daba `deseo` a 1,96:1 y `meta`
 * a 2,72:1 —los dos abajo del 3:1 que WCAG 2.1 AA pide para objetos gráficos—
 * y con la profundidad del cielo aplicada un `deseo` al fondo caía a 1,13:1.
 * O sea: la primera lectura de la regla 11 —«de qué clase es esto»— no se veía,
 * y ningún test se enteraba.
 *
 * Lo que se verifica acá son dos cosas distintas y las dos hacen falta:
 *
 *  1. **estructural** — la página no puede volver a escribir una tabla de
 *     color. No hay un solo hexadecimal en su código, y su `colorDeClase`
 *     devuelve, carácter por carácter, lo mismo que el del pintor de señales.
 *     Una tercera paleta escrita a mano se desincroniza el día que cambie un
 *     token, y nadie se entera hasta que alguien la mide;
 *  2. **perceptual** — cada color cruza 3:1 contra el fondo de su tema, en los
 *     dos temas. Es la afirmación que la spec quiere sostener, no la forma en
 *     que hoy se cumple.
 */

// `fileURLToPath` sobre la cadena y no sobre un `new URL(...)`: bajo happy-dom
// el `URL` global es el del DOM y no sobrevive el chequeo de esquema de Node.
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');

/** Todo el código de la página, menos los tests. La página, no su verificación. */
function fuentesDeLaPagina(): { ruta: string; codigo: string }[] {
  const salida: { ruta: string; codigo: string }[] = [];

  const bajar = (directorio: string) => {
    for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
      if (entrada.name === '__tests__') continue;
      const ruta = join(directorio, entrada.name);
      if (entrada.isDirectory()) {
        bajar(ruta);
        continue;
      }
      if (!/\.tsx?$/.test(entrada.name)) continue;
      salida.push({ ruta, codigo: readFileSync(ruta, 'utf8') });
    }
  };

  bajar(RAIZ);
  // `LaRadiografia.tsx` vive al lado de la carpeta, no adentro: es la página.
  const pagina = join(RAIZ, '..', 'LaRadiografia.tsx');
  salida.push({ ruta: pagina, codigo: readFileSync(pagina, 'utf8') });
  return salida;
}

describe('la guarda del color — la página no crea ninguna tabla de color propia (§5.2, §11)', () => {
  const fuentes = fuentesDeLaPagina();

  it('encuentra la página donde dice que está', () => {
    // Si alguien mueve o renombra los archivos, esta guarda se volvería un test
    // que pasa mirando el vacío. Que falle acá es preferible.
    expect(fuentes.length).toBeGreaterThanOrEqual(8);
    expect(fuentes.map((f) => f.ruta).join('\n')).toContain('LaRadiografia.tsx');
  });

  it('no hay un solo color escrito a mano en su código', () => {
    // Una tabla clase → color no puede existir sin un literal de color. Prohibir
    // el literal prohíbe la tabla, y no hay forma de escribirla de costado.
    for (const { ruta, codigo } of fuentes) {
      expect(codigo, `${ruta} escribe un hexadecimal`).not.toMatch(/#[0-9a-fA-F]{6}\b/);
      expect(codigo, `${ruta} escribe un rgb()/hsl() literal`).not.toMatch(
        /\b(?:rgba?|hsla?)\(\s*[\d.]/,
      );
    }
  });

  it('no declara ningún mapa de color, ni por clase ni por tipo', () => {
    for (const { ruta, codigo } of fuentes) {
      expect(codigo, `${ruta} declara un Record<…Senal, string> de color`).not.toMatch(
        /Record<\s*(?:Clase|Tipo)Senal\s*,\s*string\s*>\s*=\s*\{[^}]*(?:color|COLOR)/i,
      );
      expect(codigo, `${ruta} declara una constante de color`).not.toMatch(
        /\b(?:const|let|var)\s+(?:COLOR_DE_CLASE|COLOR_DE_TIPO|COLOR_DESCONOCIDO|PALETA)\b/,
      );
    }
  });

  it('su `colorDeClase` ES el del pintor de señales, no una copia parecida', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      for (const clase of CLASES_SENAL) {
        expect(colorDeClase(clase, tema), `${clase} sobre ${tema}`).toBe(
          colorDeClaseDelPintor(clase, tema),
        );
      }
    }
  });

  it('el color depende del tema: no existe una versión sin tema', () => {
    // El defecto no era sólo el valor: era que la función no recibía el tema.
    // Un token que sirve sobre papel se hunde en el fondo nocturno, y una firma
    // sin tema hace que eso sea imposible de arreglar sin cambiarla.
    expect(colorDeClase('deseo', 'papel')).not.toBe(colorDeClase('deseo', 'nocturno'));
    expect(colorDeClase('meta', 'papel')).not.toBe(colorDeClase('meta', 'nocturno'));
  });

  it('cada clase cruza 3:1 contra su fondo, en los DOS temas', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      for (const clase of CLASES_SENAL) {
        expect(
          contraste(colorDeClase(clase, tema), FONDO_DEL_TEMA[tema]),
          `${clase} sobre ${tema}`,
        ).toBeGreaterThanOrEqual(CONTRASTE_MINIMO);
      }
    }
  });

  it('las cuatro clases siguen siendo cuatro colores distintos en cada tema', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      const colores = CLASES_SENAL.map((clase) => colorDeClase(clase, tema));
      expect(new Set(colores).size, `sobre ${tema}`).toBe(CLASES_SENAL.length);
    }
  });

  it('una clase desconocida sale en el gris del tema, y el gris también cruza 3:1', () => {
    for (const tema of TEMAS_DEL_MAPA) {
      expect(colorDeClase('quimera', tema)).toBe(GRIS_DEL_TEMA[tema]);
      expect(contraste(GRIS_DEL_TEMA[tema], FONDO_DEL_TEMA[tema])).toBeGreaterThanOrEqual(
        CONTRASTE_MINIMO,
      );
    }
  });

  /**
   * La otra mitad del defecto: el color puede estar bien y el nodo verse igual.
   * El cielo escalona la tinta por profundidad, y con el piso viejo —0,28— el
   * nodo más hundido conservaba el 28 % de su color: 1,13:1 en nocturno.
   *
   * El piso es el mismo del pintor de señales y por el mismo motivo escrito
   * ahí: el escalonado existe para que quinientas marcas encimadas no se fundan
   * en un disco opaco, no para decir que las últimas voces valen menos.
   */
  it('el nodo más hundido conserva el 72 % de su tinta, no el 28 %', () => {
    expect(pesoDeProfundidad(0)).toBeGreaterThanOrEqual(0.72);
    expect(pesoDeProfundidad(1)).toBe(1);

    for (const tema of TEMAS_DEL_MAPA) {
      for (const clase of CLASES_SENAL) {
        const pleno = colorDeClase(clase, tema);
        const alFondo = haciaElFondo(pleno, FONDO_DEL_TEMA[tema], pesoDeProfundidad(0));
        const conElPisoViejo = haciaElFondo(pleno, FONDO_DEL_TEMA[tema], 0.28);
        expect(
          contraste(alFondo, FONDO_DEL_TEMA[tema]),
          `${clase} hundido sobre ${tema}`,
        ).toBeGreaterThan(contraste(conElPisoViejo, FONDO_DEL_TEMA[tema]));
      }
    }
  });
});
