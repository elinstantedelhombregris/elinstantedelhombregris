#!/usr/bin/env tsx
/**
 * Baja las seis familias tipográficas de la interfaz a
 * `apps/web/public/fonts-ui/` y escribe el `fuentes.css` que las declara, para
 * que ningún host de terceros vea la IP de quien abre una página (cierre de
 * D-049).
 *
 * Correr desde `v2/`:
 *
 *   ./apps/api/node_modules/.bin/tsx scripts/build/tipografias/bajar-tipografias.ts
 *
 * (`pnpm exec tsx` no resuelve tsx desde la raíz del workspace; es el mismo
 * arranque que documenta `scripts/build/mapa/README.md`.)
 *
 * **Todo lo que produce se commitea**: son ~1 MB de `.woff2` que no se
 * regeneran salvo que cambie la lista de familias o de pesos. A diferencia de
 * las teselas, una tipografía no se pone vieja.
 *
 * ## Qué hace
 *
 * 1. **Le pide a Google la misma hoja de estilo que pedía el navegador.**
 *    `PEDIDO` es, carácter por carácter, la query que tenía el `<link>` de
 *    `apps/web/index.html` hasta el 12/8/2026: las mismas seis familias con los
 *    mismos pesos. Eso es lo que garantiza que el sitio se vea igual — un peso
 *    de menos no rompe nada visible, sólo hace que el navegador finja ese peso
 *    engordando otro.
 *
 * 2. **Agrupa los `@font-face` por archivo.** Cuatro de las seis familias son
 *    variables: un solo `.woff2` cubre los seis pesos de Archivo. Google igual
 *    devuelve un bloque por peso, todos apuntando al mismo archivo. Bajar «un
 *    archivo por peso» sería bajar los mismos bytes seis veces y servirlos seis
 *    veces.
 *
 * 3. **Baja cada archivo una vez** y lo guarda con un nombre que dice qué es:
 *    `archivo-latin-normal-300-800.woff2`.
 *
 * 4. **Escribe `fuentes.css`** con los mismos `unicode-range`, el mismo
 *    `font-display: swap` y las rutas locales. Los pesos de una familia
 *    variable se colapsan en un rango (`font-weight: 300 800`), que es lo que
 *    el archivo sabe hacer de verdad.
 *
 * 5. **Baja las seis licencias.** Las seis familias son SIL OFL 1.1, y la OFL
 *    exige que la licencia viaje con la fuente. Van a `fonts-ui/licencias/`.
 *
 * ## Las dos trampas
 *
 * 1. **Sin `User-Agent` de navegador moderno, Google devuelve TTF.** La API de
 *    `css2` mira el UA para decidir el formato: con el UA por defecto de Node
 *    (`undici`) contesta una hoja que apunta a `.ttf`, que pesa el triple y no
 *    trae `unicode-range`. Por eso `UA_NAVEGADOR`, y por eso el script aborta
 *    si la hoja no menciona `woff2`.
 *
 * 2. **Los subconjuntos que no son latinos no cuestan nada y se quedan.** Cada
 *    `@font-face` lleva su `unicode-range`: el navegador **no baja** el archivo
 *    cirílico si la página no tiene un carácter cirílico. Recortarlos ahorraría
 *    unos KB del repo y cambiaría el comportamiento —la φ de una fórmula
 *    caería a la fuente del sistema—, así que se bajan todos. Lo que sí se
 *    recorta son los pesos, que ahí sí se bajan siempre.
 */

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const DESTINO = resolve(RAIZ, 'apps/web/public/fonts-ui');
const LICENCIAS = resolve(DESTINO, 'licencias');
const SALIDA_CSS = resolve(DESTINO, 'fuentes.css');

/**
 * La query exacta que tenía el `<link>` de `apps/web/index.html`. Si alguna vez
 * hace falta una familia o un peso nuevo, se agrega **acá** y se vuelve a
 * correr el script: el HTML ya no habla con Google.
 */
const PEDIDO =
  'https://fonts.googleapis.com/css2' +
  '?family=Anton' +
  '&family=Archivo:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400' +
  '&family=Space+Mono:wght@400;700' +
  '&family=Inter:wght@300;400;500;600;700' +
  '&family=JetBrains+Mono:wght@400;500' +
  '&family=Playfair+Display:wght@400;600;700' +
  '&display=swap';

/** Ver «Las dos trampas», punto 1. */
const UA_NAVEGADOR =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** Las seis familias y el directorio de su licencia en `google/fonts`. */
const LICENCIAS_DE: ReadonlyMap<string, string> = new Map([
  ['Anton', 'ofl/anton'],
  ['Archivo', 'ofl/archivo'],
  ['Space Mono', 'ofl/spacemono'],
  ['Inter', 'ofl/inter'],
  ['JetBrains Mono', 'ofl/jetbrainsmono'],
  ['Playfair Display', 'ofl/playfairdisplay'],
]);

interface BloqueRemoto {
  readonly familia: string;
  readonly estilo: string;
  readonly peso: number;
  readonly subconjunto: string;
  readonly rangoUnicode: string;
  readonly url: string;
}

interface Cara {
  readonly familia: string;
  readonly estilo: string;
  readonly pesos: readonly number[];
  readonly subconjunto: string;
  readonly rangoUnicode: string;
  readonly url: string;
  readonly archivo: string;
}

function comoNombreDeArchivo(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function bajarTexto(url: string): Promise<string> {
  const respuesta = await fetch(url, { headers: { 'User-Agent': UA_NAVEGADOR } });
  if (!respuesta.ok) {
    throw new Error(`${url} devolvió ${String(respuesta.status)}`);
  }
  return respuesta.text();
}

async function bajarBinario(url: string): Promise<Buffer> {
  const respuesta = await fetch(url, { headers: { 'User-Agent': UA_NAVEGADOR } });
  if (!respuesta.ok) {
    throw new Error(`${url} devolvió ${String(respuesta.status)}`);
  }
  return Buffer.from(await respuesta.arrayBuffer());
}

/**
 * Parsea la hoja de Google. Cada `@font-face` viene precedido de un comentario
 * con el nombre del subconjunto (`/* latin *​/`), que es el único lugar donde
 * ese nombre aparece: no está en la regla.
 */
function parsear(css: string): BloqueRemoto[] {
  if (!css.includes('woff2')) {
    throw new Error(
      'La hoja no menciona woff2 — Google contestó TTF. Revisá el User-Agent (trampa 1).',
    );
  }

  const bloques: BloqueRemoto[] = [];
  const regla = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;

  for (const coincidencia of css.matchAll(regla)) {
    const subconjunto = coincidencia[1];
    const cuerpo = coincidencia[2];
    if (subconjunto === undefined || cuerpo === undefined) continue;

    const familia = /font-family:\s*'([^']+)'/.exec(cuerpo)?.[1];
    const estilo = /font-style:\s*([^;]+);/.exec(cuerpo)?.[1];
    const peso = /font-weight:\s*([^;]+);/.exec(cuerpo)?.[1];
    const rangoUnicode = /unicode-range:\s*([^;]+);/.exec(cuerpo)?.[1];
    const url = /url\((https:\/\/[^)]+)\)/.exec(cuerpo)?.[1];

    if (
      familia === undefined ||
      estilo === undefined ||
      peso === undefined ||
      rangoUnicode === undefined ||
      url === undefined
    ) {
      throw new Error(`Bloque @font-face incompleto en el subconjunto ${subconjunto}`);
    }

    bloques.push({
      familia,
      estilo: estilo.trim(),
      peso: Number(peso.trim()),
      subconjunto,
      rangoUnicode: rangoUnicode.trim(),
      url,
    });
  }

  if (bloques.length === 0) {
    throw new Error('No se parseó ni un @font-face. ¿Cambió el formato de la hoja de Google?');
  }
  return bloques;
}

/** Un archivo por (familia, estilo, subconjunto); ver «Qué hace», punto 2. */
function agrupar(bloques: readonly BloqueRemoto[]): Cara[] {
  const porArchivo = new Map<string, BloqueRemoto[]>();
  for (const bloque of bloques) {
    const grupo = porArchivo.get(bloque.url);
    if (grupo === undefined) porArchivo.set(bloque.url, [bloque]);
    else grupo.push(bloque);
  }

  const caras: Cara[] = [];
  for (const [url, grupo] of porArchivo) {
    const primero = grupo[0];
    if (primero === undefined) continue;

    const pesos = [...new Set(grupo.map((b) => b.peso))].sort((a, b) => a - b);
    const menor = pesos[0];
    const mayor = pesos[pesos.length - 1];
    if (menor === undefined || mayor === undefined) continue;

    const etiquetaPesos = menor === mayor ? String(menor) : `${String(menor)}-${String(mayor)}`;
    const archivo = `${comoNombreDeArchivo(primero.familia)}-${primero.subconjunto}-${primero.estilo}-${etiquetaPesos}.woff2`;

    caras.push({
      familia: primero.familia,
      estilo: primero.estilo,
      pesos,
      subconjunto: primero.subconjunto,
      rangoUnicode: primero.rangoUnicode,
      url,
      archivo,
    });
  }
  return caras;
}

function escribirCss(caras: readonly Cara[]): string {
  const familias = [...new Set(caras.map((c) => c.familia))];
  const reglas = caras
    .slice()
    .sort(
      (a, b) =>
        familias.indexOf(a.familia) - familias.indexOf(b.familia) ||
        a.estilo.localeCompare(b.estilo) ||
        a.subconjunto.localeCompare(b.subconjunto),
    )
    .map((cara) => {
      const menor = cara.pesos[0];
      const mayor = cara.pesos[cara.pesos.length - 1];
      const peso =
        menor === mayor ? String(menor ?? 400) : `${String(menor ?? 400)} ${String(mayor ?? 400)}`;
      return [
        `/* ${cara.familia} · ${cara.subconjunto} */`,
        '@font-face {',
        `  font-family: '${cara.familia}';`,
        `  font-style: ${cara.estilo};`,
        `  font-weight: ${peso};`,
        '  font-display: swap;',
        `  src: url('/fonts-ui/${cara.archivo}') format('woff2');`,
        `  unicode-range: ${cara.rangoUnicode};`,
        '}',
      ].join('\n');
    })
    .join('\n\n');

  return [
    '/* GENERADO por scripts/build/tipografias/bajar-tipografias.ts — no editar a mano.',
    '   Procedencia y motivo: apps/web/public/fonts-ui/LEEME.md */',
    '',
    reglas,
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  process.stdout.write(`Pidiendo la hoja a Google…\n`);
  const caras = agrupar(parsear(await bajarTexto(PEDIDO)));

  const familias = new Set(caras.map((c) => c.familia));
  for (const esperada of LICENCIAS_DE.keys()) {
    if (!familias.has(esperada)) {
      throw new Error(`La hoja no trajo la familia ${esperada}`);
    }
  }

  // Se borra lo generado antes de escribir: si un archivo cambia de nombre
  // porque cambió un peso, el viejo quedaría servido y nadie lo notaría. El
  // `LEEME.md` no se toca — lo escribe una persona, no el script.
  mkdirSync(DESTINO, { recursive: true });
  for (const viejo of readdirSync(DESTINO)) {
    if (viejo.endsWith('.woff2')) rmSync(resolve(DESTINO, viejo));
  }
  rmSync(LICENCIAS, { recursive: true, force: true });
  mkdirSync(LICENCIAS, { recursive: true });

  let total = 0;
  for (const cara of caras) {
    const bytes = await bajarBinario(cara.url);
    if (bytes.byteLength === 0) throw new Error(`${cara.archivo} vino vacío`);
    writeFileSync(resolve(DESTINO, cara.archivo), bytes);
    total += bytes.byteLength;
  }

  for (const [familia, ruta] of LICENCIAS_DE) {
    const texto = await bajarTexto(`https://raw.githubusercontent.com/google/fonts/main/${ruta}/OFL.txt`);
    if (!texto.includes('SIL OPEN FONT LICENSE')) {
      throw new Error(`La licencia de ${familia} no parece la OFL`);
    }
    writeFileSync(resolve(LICENCIAS, `${comoNombreDeArchivo(familia)}-OFL.txt`), texto, 'utf8');
  }

  const config = await resolveConfig(SALIDA_CSS);
  writeFileSync(
    SALIDA_CSS,
    await format(escribirCss(caras), { ...config, parser: 'css' }),
    'utf8',
  );

  process.stdout.write(
    `${String(caras.length)} archivos, ${String(Math.round(total / 1024))} KB en ` +
      `${DESTINO.replace(`${RAIZ}/`, '')}/\n`,
  );
  for (const familia of familias) {
    const suyas = caras.filter((c) => c.familia === familia);
    const pesos = [...new Set(suyas.flatMap((c) => c.pesos))].sort((a, b) => a - b);
    process.stdout.write(
      `  ${familia.padEnd(18)} ${String(suyas.length).padStart(2)} archivos, pesos ${pesos.join('/')}\n`,
    );
  }
  process.stdout.write('\nFalta a mano: el LEEME.md de la carpeta no lo escribe el script.\n');
}

void main();
