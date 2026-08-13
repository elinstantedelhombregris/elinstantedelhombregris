/**
 * El corpus semilla del elenco — de dónde sale cada persona.
 *
 * Spec: `docs/specs/2026-08-13-el-modulo-de-simulacion.md` §3.8 y §7 (regla 9).
 *
 * ## Qué se lee, y qué no
 *
 * Se leen **los PLANes, los ensayos y la bitácora**: `content/planes/`,
 * `content/ensayos/` y `content/blog/`. Todo texto propio del proyecto, cuyo
 * autor es el proyecto.
 *
 * **Nunca se lee texto que escribió gente real.** Sembrar personas sintéticas
 * desde `senales` o `dreams` sería un uso que la línea de consentimiento no
 * cubre, y eso no se arregla con un aviso (regla 9 de la Constitución de
 * producto). La función que lee el corpus toma los directorios por parámetro
 * justamente para que ese límite se vea en el call site y no en un comentario.
 *
 * ## Por qué no hace falta GraphRAG
 *
 * MiroFish arma su «grafo» mandándole el corpus crudo a Zep Cloud para que le
 * extraiga entidades con un modelo. Acá no hace falta: los PLANes tienen
 * ordinal y remisiones explícitas, los ensayos tienen ciclo, el blog tiene
 * slugs, y los tres tienen encabezados. La estructura ya está escrita — se lee,
 * no se infiere. Es más barato, es exacto, y no manda una línea afuera.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

/** Un pedazo de corpus del que puede salir una persona. */
export interface Ancla {
  /** El archivo, con su carpeta: `planes/PLANAGUA.mdx`. */
  readonly documento: string;
  /** El encabezado bajo el que cae, o `'(cabecera)'` si es el arranque. */
  readonly ancla: string;
  /** Los primeros 12 hex del sha-256 del archivo entero. */
  readonly sha: string;
  /** El texto de la sección, ya sin front-matter ni marcas de MDX. */
  readonly texto: string;
}

/** Lo que se descartó y por qué, en vez de tragárselo. */
export interface CorpusLeido {
  readonly anclas: readonly Ancla[];
  readonly documentos: readonly { documento: string; sha: string; anclas: number }[];
  /** Secciones demasiado cortas para decir algo. No se inventan personas con ellas. */
  readonly descartadas: number;
}

/** Debajo de esto una sección no alcanza para sembrar a nadie. */
export const MINIMO_DE_CARACTERES = 400;

const ES_MDX = /\.mdx?$/i;

/** Saca el front-matter YAML de arriba, si lo hay. */
function sinFrontMatter(contenido: string): string {
  if (!contenido.startsWith('---')) return contenido;
  const cierre = contenido.indexOf('\n---', 3);
  return cierre === -1 ? contenido : contenido.slice(cierre + 4);
}

/**
 * Limpia las marcas que no aportan nada a una persona.
 *
 * No es un parser de Markdown y no pretende serlo: lo que hace falta es que el
 * modelo lea prosa y no sintaxis. Un `<Componente prop="x" />` en el medio de
 * un MDX es ruido puro para este uso.
 */
function aProsa(texto: string): string {
  return texto
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[>#\-*|]+\s*/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Parte un documento por encabezados de nivel 2 y 3. */
function partirEnSecciones(contenido: string): { ancla: string; texto: string }[] {
  const lineas = sinFrontMatter(contenido).split('\n');
  const secciones: { ancla: string; texto: string[] }[] = [
    { ancla: '(cabecera)', texto: [] },
  ];
  for (const linea of lineas) {
    const encabezado = /^(#{1,3})\s+(.*)$/.exec(linea);
    if (encabezado !== null) {
      secciones.push({ ancla: (encabezado[2] ?? '').trim(), texto: [] });
      continue;
    }
    secciones[secciones.length - 1]?.texto.push(linea);
  }
  return secciones.map((s) => ({ ancla: s.ancla, texto: aProsa(s.texto.join('\n')) }));
}

/**
 * Lee el corpus semilla de los directorios dados.
 *
 * Los directorios entran por parámetro y no están hardcodeados adentro: quién
 * decide qué texto puede sembrar personas es una decisión de la regla 9, y
 * tiene que estar a la vista de quien llama.
 */
export function leerCorpus(directorios: readonly string[]): CorpusLeido {
  const anclas: Ancla[] = [];
  const documentos: { documento: string; sha: string; anclas: number }[] = [];
  let descartadas = 0;

  for (const directorio of [...directorios].sort()) {
    const carpeta = basename(directorio);
    let archivos: string[];
    try {
      archivos = readdirSync(directorio).filter((a) => ES_MDX.test(a));
    } catch {
      throw new Error(
        `No pude leer el corpus en ${directorio}. El elenco se siembra del texto propio del ` +
          'proyecto (PLANes, ensayos, bitácora) y de ningún otro: sin ese directorio no hay ' +
          'de dónde sacar personas, y no hay plan B con texto de la gente.',
      );
    }

    for (const archivo of archivos.sort()) {
      const contenido = readFileSync(join(directorio, archivo), 'utf8');
      const sha = createHash('sha256').update(contenido).digest('hex').slice(0, 12);
      const documento = `${carpeta}/${archivo}`;
      let cuantas = 0;
      for (const seccion of partirEnSecciones(contenido)) {
        if (seccion.texto.length < MINIMO_DE_CARACTERES) {
          descartadas += 1;
          continue;
        }
        anclas.push({ documento, ancla: seccion.ancla, sha, texto: seccion.texto });
        cuantas += 1;
      }
      documentos.push({ documento, sha, anclas: cuantas });
    }
  }

  if (anclas.length === 0) {
    throw new Error(
      `Ninguna sección del corpus llegó a ${String(MINIMO_DE_CARACTERES)} caracteres. Con secciones ` +
        'así de cortas el modelo escribiría personas genéricas, que es lo mismo que no sembrarlas ' +
        'del corpus: el sesgo dejaría de ser rastreable a un documento.',
    );
  }

  return { anclas, documentos, descartadas };
}

/** Los tres directorios del corpus propio, relativos a la raíz de `v2/`. */
export const CORPUS_PROPIO: readonly string[] = [
  'content/planes',
  'content/ensayos',
  'content/blog',
];
