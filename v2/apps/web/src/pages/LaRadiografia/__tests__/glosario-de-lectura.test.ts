import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * **El glosario de las superficies de lectura** — mapa, Radiografía y mandato.
 *
 * La revisión del 9/10 encontró lo mismo con cinco nombres (voz, mirada,
 * aporte, señal, registro) y los grupos con cuatro (núcleo, isla, componente,
 * racimo). La decisión es una sola palabra para cada cosa:
 *
 *  - **aporte** para una contribución y «aportes» para los conteos;
 *  - **grupo** para lo que junta aportes parecidos;
 *  - **lugar**, o «todo el país», y nunca «ámbito»;
 *  - «registro» queda sólo para el conjunto público de datos.
 *
 * Esta guarda lee el CÓDIGO y revisa únicamente los textos que llegan a una
 * persona (cadenas y texto de JSX), no los identificadores ni los comentarios:
 * `voces` como nombre de variable es legítimo, «las voces del mapa» en un botón
 * no lo es.
 */

const AQUI = dirname(fileURLToPath(import.meta.url));
const PAGINAS = join(AQUI, '..', '..');

/** Lo que entra: el mapa fuera del panel de aportes, la Radiografía y el mandato. */
const ENTRA = [
  'ElMapa',
  'LaRadiografia',
  'LaRadiografia.tsx',
  'LaRadiografiaEjemplo.tsx',
  'ElMandatoVivo',
  'ElMandatoVivo.tsx',
  'ElMandatoVivoEjemplo.tsx',
];

/**
 * Lo que NO se escanea, con su razón:
 *  - el panel de aportes y Imaginar tienen su propia revisión;
 *  - `MapaArgentina`, `PopoverVoz`, `FeedVoces` y el lienzo SVG no tienen
 *    importadores fuera de sus tests (código muerto, anotado en el informe);
 *  - los escenarios y los vectores del laboratorio SON las frases inventadas:
 *    son el dato del ejemplo, no el texto de la interfaz.
 */
const SALTEA = [
  join('ElMapa', 'sections', 'ParticiparEnMapa'),
  join('ElMapa', 'sections', 'AporteDirectoMapa'),
  join('ElMapa', 'sections', 'PanelSoltarVoz'),
  join('ElMapa', 'sections', 'soltar'),
  join('ElMapa', 'sections', 'MapaArgentina'),
  join('ElMapa', 'sections', 'PopoverVoz'),
  join('ElMapa', 'sections', 'FeedVoces'),
  join('ElMapa', 'lienzo', 'Lienzo'),
  join('ElMapa', 'lienzo', 'CapaSenales'),
  join('LaRadiografia', 'ejemplos', 'escenario-'),
  join('LaRadiografia', 'ejemplos', 'vectores'),
];

/** Frases que contienen una palabra prohibida y están permitidas, con su razón. */
const PERMITIDAS = [
  // El sello del lienzo y de la pantalla del ejemplo: lo exige su propia guarda.
  'voces inventadas',
  // Quien mira un aporte ajeno para comprobarlo: el acto, no el aporte.
  'segunda mirada',
  // El conjunto público de datos sí se llama registro.
  'registro público',
];

/** Una palabra entera: `señal` no encuentra «señalan», `voz` no encuentra «vozarrón». */
const palabra = (alternativas: string): RegExp =>
  new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alternativas})(?![\\p{L}\\p{N}_])`, 'iu');

const PROHIBIDAS: { rx: RegExp; por: string }[] = [
  { rx: palabra('voz|voces'), por: 'un aporte se llama aporte, no voz' },
  { rx: palabra('mirada|miradas'), por: 'un aporte se llama aporte, no mirada' },
  { rx: palabra('señal|señales'), por: 'un aporte se llama aporte, no señal' },
  { rx: palabra('registro|registros'), por: '«registro» queda para el conjunto público de datos' },
  {
    rx: palabra('núcleo|núcleos|isla|islas|componente|componentes|racimo|racimos'),
    por: 'lo que junta aportes se llama grupo',
  },
  { rx: palabra('ámbito|ámbitos'), por: 'se dice lugar, o «todo el país»' },
  { rx: /neighborhood|Celdas mudas|\bpnpm\b/u, por: 'ni inglés crudo ni voz de desarrollador' },
];

function archivos(dir: string, salida: string[] = []): string[] {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      if (nombre === '__tests__') continue;
      archivos(ruta, salida);
    } else if (/\.tsx?$/.test(nombre) && !/\.test\.tsx?$/.test(nombre)) {
      salida.push(ruta);
    }
  }
  return salida;
}

/** Los textos que ve una persona: cadenas y texto de JSX, sin comentarios ni imports. */
function textosVisibles(ruta: string): string[] {
  const fuente = ts.createSourceFile(
    ruta,
    readFileSync(ruta, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ruta.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const textos: string[] = [];
  const mirar = (nodo: ts.Node): void => {
    if (ts.isImportDeclaration(nodo) || ts.isExportDeclaration(nodo)) return;
    if (ts.isStringLiteral(nodo) || ts.isNoSubstitutionTemplateLiteral(nodo)) {
      // Un token suelto en minúsculas es un identificador (`'voz'`, `'sin-grupo'`).
      const t = nodo.text;
      if (!(/^[^\s]+$/u.test(t) && t === t.toLowerCase())) textos.push(t);
    } else if (ts.isTemplateHead(nodo) || ts.isTemplateMiddle(nodo) || ts.isTemplateTail(nodo)) {
      textos.push(nodo.text);
    } else if (ts.isJsxText(nodo)) {
      textos.push(nodo.text);
    }
    ts.forEachChild(nodo, mirar);
  };
  mirar(fuente);
  return textos.map((t) => t.replace(/\s+/gu, ' ').trim()).filter(Boolean);
}

describe('el glosario de las superficies de lectura', () => {
  const rutas = ENTRA.flatMap((e) => {
    const completa = join(PAGINAS, e);
    return statSync(completa).isDirectory() ? archivos(completa) : [completa];
  }).filter((r) => !SALTEA.some((s) => relative(PAGINAS, r).includes(s)));

  it('encuentra las superficies donde dice que están', () => {
    expect(rutas.length).toBeGreaterThan(60);
    const rel = rutas.map((r) => relative(PAGINAS, r));
    expect(rel).toContain(join('LaRadiografia', 'sections', 'BarrasOpiniones.tsx'));
    expect(rel).toContain(join('ElMapa', 'instrumento', 'PanelArea.tsx'));
    expect(rel).toContain(join('ElMandatoVivo', 'sections', 'PortadaMandato.tsx'));
    expect(rel).not.toContain(join('ElMapa', 'sections', 'PanelSoltarVoz.tsx'));
  });

  it('ningún texto visible usa una palabra del vocabulario viejo', () => {
    const hallazgos: string[] = [];
    for (const ruta of rutas) {
      for (const texto of textosVisibles(ruta)) {
        let limpio = texto;
        for (const ok of PERMITIDAS) limpio = limpio.replaceAll(new RegExp(ok, 'giu'), ' ');
        for (const { rx, por } of PROHIBIDAS) {
          if (rx.test(limpio)) {
            hallazgos.push(`${relative(PAGINAS, ruta)}: «${texto.slice(0, 90)}» (${por})`);
          }
        }
      }
    }
    expect(hallazgos).toEqual([]);
  });
});
