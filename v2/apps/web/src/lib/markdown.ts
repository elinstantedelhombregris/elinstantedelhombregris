/**
 * Tiny client-side markdown helper.
 *
 * Used by pages that import their content as raw text via Vite's
 * `?raw` suffix, then render it inside a `<MdxContent body>` block.
 *
 * Frontmatter (between leading `---` lines) is stripped before render.
 *
 * Dos cosas que marked no trae y los lectores necesitan (spec 2026-09-01):
 * - **ids en los encabezados** (slug del texto, único por documento), para
 *   que un índice pueda apuntar a cada sección y una URL con ancla llegue.
 * - **notas al pie** GFM (`[^id]` en el texto, `[^id]: texto` en su línea):
 *   la referencia queda como superíndice con link y las notas se listan al
 *   final. Antes el marcador se veía crudo en el cuerpo del ensayo (D-081).
 */
import { marked, Renderer, type MarkedOptions, type Token, type Tokens } from 'marked';

const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n/;

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Texto plano de un encabezado: sin énfasis, código ni links. Para el slug y el índice. */
export function textoPlanoDeEncabezado(texto: string): string {
  return texto
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Slug ASCII de un encabezado («III. Diagnóstico — lo que más pesa» → «iii-diagnostico-lo-que-mas-pesa»). */
export function slugDeEncabezado(texto: string): string {
  const base = textoPlanoDeEncabezado(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 80)
    .replace(/-+$/, '');
  return base === '' ? 'seccion' : base;
}

/**
 * Los ids asignados a los tokens de encabezado del último lexer. El renderer
 * los lee de acá: así el HTML y `extraerEncabezados` salen de la MISMA
 * asignación y un link del índice nunca apunta a nada.
 */
const IDS = new WeakMap<Tokens.Heading, string>();

function asignarIds(tokens: readonly Token[]): Tokens.Heading[] {
  const vistos = new Map<string, number>();
  const encabezados: Tokens.Heading[] = [];
  for (const token of tokens) {
    if (token.type !== 'heading') continue;
    const heading = token as Tokens.Heading;
    const base = slugDeEncabezado(heading.text);
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    IDS.set(heading, n === 1 ? base : `${base}-${String(n)}`);
    encabezados.push(heading);
  }
  return encabezados;
}

const renderer = new Renderer();
renderer.image = ({ href, title, text }) => {
  const source = escapeHtmlAttribute(href);
  const alt = escapeHtmlAttribute(text);
  const dimensions = href.startsWith('/media/bitacora/pilotos/diagramas/')
    ? ' width="1200" height="720"'
    : '';
  const image = `<img src="${source}" alt="${alt}" loading="lazy"${dimensions}>`;
  if (title === null) return image;
  return `<figure>${image}<figcaption>${escapeHtmlAttribute(title)}</figcaption></figure>`;
};

const renderParagraph = renderer.paragraph.bind(renderer);
renderer.paragraph = function paragraph(token: Tokens.Paragraph) {
  const [onlyToken] = token.tokens;
  if (token.tokens.length === 1 && onlyToken?.type === 'image') {
    return renderer.image(onlyToken as Tokens.Image);
  }
  return renderParagraph(token);
};

renderer.heading = function heading(this: Renderer, token: Tokens.Heading): string {
  const id = IDS.get(token) ?? slugDeEncabezado(token.text);
  const nivel = String(token.depth);
  return `<h${nivel} id="${escapeHtmlAttribute(id)}">${this.parser.parseInline(token.tokens)}</h${nivel}>\n`;
};

const OPCIONES: MarkedOptions = { gfm: true, breaks: false, renderer };

export function stripFrontmatter(raw: string): string {
  return raw.replace(FRONTMATTER_RE, '').trim();
}

/* ── Notas al pie ─────────────────────────────────────────────────────── */

const DEFINICION_RE = /^\[\^([^\]\s]+)\]:[ \t]+(.+)$/gm;
const REFERENCIA_RE = /\[\^([^\]\s]+)\](?!:)/g;

export interface NotaAlPie {
  /** Número en orden de primera aparición en el texto. */
  n: number;
  /** El id del markdown (`[^1]`, `[^fuente]`). */
  id: string;
  /** El texto de la nota, todavía en markdown inline. */
  texto: string;
}

/**
 * Saca las definiciones `[^id]: texto` del cuerpo y reemplaza cada
 * referencia `[^id]` por su superíndice. Una referencia sin definición
 * queda como estaba: el error se ve, no se esconde.
 */
export function separarNotasAlPie(body: string): { cuerpo: string; notas: NotaAlPie[] } {
  const definiciones = new Map<string, string>();
  const sinDefiniciones = body.replace(DEFINICION_RE, (_todo, id: string, texto: string) => {
    definiciones.set(id, texto.trim());
    return '';
  });
  if (definiciones.size === 0) return { cuerpo: body, notas: [] };

  const orden: string[] = [];
  const cuerpo = sinDefiniciones.replace(REFERENCIA_RE, (referencia, id: string) => {
    if (!definiciones.has(id)) return referencia;
    if (!orden.includes(id)) orden.push(id);
    const n = String(orden.indexOf(id) + 1);
    return `<sup class="nota-ref" id="ref-nota-${n}"><a href="#nota-${n}">${n}</a></sup>`;
  });
  const notas = orden.map((id, i) => ({ n: i + 1, id, texto: definiciones.get(id) ?? '' }));
  return { cuerpo, notas };
}

function inline(texto: string): string {
  const result = marked.parseInline(texto, OPCIONES);
  if (typeof result !== 'string') {
    throw new Error('marked.parseInline returned a Promise — expected string');
  }
  return result;
}

function renderNotas(notas: readonly NotaAlPie[]): string {
  if (notas.length === 0) return '';
  const items = notas
    .map(({ n, texto }) => {
      const num = String(n);
      return `<li id="nota-${num}">${inline(texto)} <a href="#ref-nota-${num}" class="nota-vuelta" aria-label="Volver al texto">↑</a></li>`;
    })
    .join('\n');
  return `\n<section class="notas-al-pie" aria-label="Notas">\n<ol>\n${items}\n</ol>\n</section>\n`;
}

/* ── API ──────────────────────────────────────────────────────────────── */

export function renderMarkdown(raw: string): string {
  const { cuerpo, notas } = separarNotasAlPie(stripFrontmatter(raw));
  const tokens = marked.lexer(cuerpo, OPCIONES);
  asignarIds(tokens);
  return marked.parser(tokens, OPCIONES) + renderNotas(notas);
}

export interface EncabezadoDelDocumento {
  /** El mismo id que lleva el `<hN>` renderizado. */
  id: string;
  nivel: number;
  /** Texto plano, para listarlo en un índice. */
  texto: string;
}

/** Los encabezados de un nivel (h2 por defecto), con los ids que `renderMarkdown` les pone. */
export function extraerEncabezados(raw: string, nivel = 2): EncabezadoDelDocumento[] {
  const { cuerpo } = separarNotasAlPie(stripFrontmatter(raw));
  const tokens = marked.lexer(cuerpo, OPCIONES);
  return asignarIds(tokens)
    .filter((h) => h.depth === nivel)
    .map((h) => ({ id: IDS.get(h) ?? '', nivel: h.depth, texto: textoPlanoDeEncabezado(h.text) }));
}
