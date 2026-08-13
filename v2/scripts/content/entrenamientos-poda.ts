/**
 * Poda estructural de los cuerpos (spec Ciclo 1, Decisión 8).
 *
 * Medido el 2026-08-13 sobre las 329 lecciones, después del corte de la Tarea 5:
 * 1.012 encabezados por debajo de `###` en 153 lecciones, 13 lecciones que
 * abren con `#` compitiendo con el `<h1>` de la página, 73 que repiten su
 * `title` como encabezado, 16 que repiten su `summary` en la primera línea y 5
 * con 21 keycaps numéricos. Son 176 lecciones en total.
 *
 * Las tablas HTML, los SVG con colores de v1 y los bloques sangrados que
 * renderizan como código NO se tocan acá: son decisiones caso por caso.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { separarMdx } from '@v2/shared';

// El emoji CON los espacios que lo rodean: el reemplazo tiene que poder dejar
// un solo espacio donde el emoji separaba dos palabras, sin salir de ahí.
// Sin la bandera `g`: una regex global de módulo arrastra su `lastIndex` entre
// llamadas y miente en cuanto alguien la use con `test()`. Se clona con `gu`
// abajo, en cada llamada, que es el único uso.
const EMOJI = / *[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]+ */u;

const normalizar = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export function podar(
  cuerpo: string,
  meta: { title: string; summary?: string },
): { texto: string; acciones: string[] } {
  const acciones: string[] = [];
  let texto = cuerpo;

  const aplanado = texto.replace(/^#{4,6} /gm, '### ');
  if (aplanado !== texto) {
    acciones.push('encabezados aplanados');
    texto = aplanado;
  }

  // `#` compite con el `<h1>` que la página ya pone con el título de la
  // lección: 13 lecciones tienen dos títulos de nivel uno. Sube a `##`.
  const sinH1 = texto.replace(/^# /gm, '## ');
  if (sinH1 !== texto) {
    acciones.push('h1 bajado a h2');
    texto = sinH1;
  }

  const sinTitulo = texto.replace(
    /^#{1,3} +(.+)$/gm,
    (linea, encabezado: string) => (normalizar(encabezado) === normalizar(meta.title) ? '' : linea),
  );
  if (sinTitulo !== texto) {
    acciones.push('encabezado igual al título borrado');
    texto = sinTitulo;
  }

  if (meta.summary !== undefined) {
    const lineas = texto.trimStart().split('\n');
    // `lineas[0]` es `string | undefined` con `noUncheckedIndexedAccess`, y
    // `lineas.length > 0` no lo estrecha. Se desestructura, que sí lo estrecha.
    const [primera, ...resto] = lineas;
    if (primera !== undefined && normalizar(primera) === normalizar(meta.summary)) {
      acciones.push('summary duplicado borrado');
      texto = resto.join('\n');
    }
  }

  // Queda UN espacio si el emoji separaba dos palabras, y ninguno si no separaba
  // nada. El reemplazo termina en el emoji y en sus espacios contiguos a
  // propósito: el plan traía acá un `.replace(/ {2,}/g, ' ')` global que además
  // aplasta la sangría de las 48 lecciones con bloques indentados y las filas de
  // las tablas HTML, y que marca «emojis borrados» en 46 lecciones que no tienen
  // ni uno. Con esa versión la corrida toca 191 lecciones en vez de 176.
  const sinEmoji = texto.replace(new RegExp(EMOJI, 'gu'), (m) => (m.includes(' ') ? ' ' : ''));
  if (sinEmoji !== texto) {
    acciones.push('emojis borrados');
    texto = sinEmoji;
  }

  return { texto: texto.replace(/\n{3,}/g, '\n\n').trim(), acciones };
}

if (process.argv[1]?.endsWith('entrenamientos-poda.ts')) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const dir = resolve(raiz, 'content/courses');
  const conHtml: string[] = [];
  let tocados = 0;

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
      const ruta = join(cursoDir, archivo);
      const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
      const title = /^title: *['"]?(.+?)['"]?$/m.exec(encabezado)?.[1] ?? '';
      const summary = /^summary: *['"]?(.+?)['"]?$/m.exec(encabezado)?.[1];
      // La propiedad se omite cuando no hay `summary`, en vez de pasarla en
      // `undefined`: con `exactOptionalPropertyTypes` un `summary?: string` no
      // acepta `undefined` explícito, y el plan traía acá `{ title, summary }`.
      const { texto, acciones } = podar(
        cuerpo,
        summary === undefined ? { title } : { title, summary },
      );
      if (acciones.length > 0) {
        writeFileSync(ruta, `${encabezado}\n${texto}\n`);
        tocados += 1;
      }
      if (/<table|<svg/i.test(texto)) conHtml.push(`${curso.name}/${archivo}`);
    }
  }
  process.stdout.write(`poda: ${String(tocados)} lecciones\n`);
  process.stdout.write(`con <table> o <svg> para revisar a mano:\n${conHtml.join('\n')}\n`);
}
