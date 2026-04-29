import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { marked } from 'marked';
import type { Ensayo, EnsayoTocItem, EnsayoCartografiaGroup } from '../shared/ensayo-types';
import { CARTOGRAFIA_HREF_MAP } from '../shared/ensayo-cartografia-map';

const SCRIPT_DIR = import.meta.dirname;
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const ENSAYOS_DIR = resolve(REPO_ROOT, 'Ensayos');
const OUT_FILE = resolve(SCRIPT_DIR, '../client/src/content/ensayos.generated.ts');

const CATEGORY_PRIMER = 'Sobre presidentes, democracia y la belleza';
const CATEGORY_INDAGACIONES = 'Indagaciones — sobre las condiciones interiores de la república';

const FILES: Array<{ order: number; file: string; slug: string; type: 'ensayo' | 'carta'; category: string }> = [
  { order: 1, file: 'castellano/01-presidencia.md',  slug: 'presidencia',     type: 'ensayo', category: CATEGORY_PRIMER },
  { order: 2, file: 'castellano/02-democracia.md',   slug: 'democracia',      type: 'ensayo', category: CATEGORY_PRIMER },
  { order: 3, file: 'castellano/03-poder.md',        slug: 'poder',           type: 'ensayo', category: CATEGORY_PRIMER },
  { order: 4, file: 'castellano/04-arquitectura.md', slug: 'arquitectura',    type: 'ensayo', category: CATEGORY_PRIMER },
  { order: 5, file: 'castellano/05-soberania.md',    slug: 'soberania',       type: 'ensayo', category: CATEGORY_PRIMER },
  { order: 6, file: 'castellano/06-belleza.md',      slug: 'belleza',         type: 'ensayo', category: CATEGORY_PRIMER },
  { order: 7, file: 'castellano/07-carta.md',        slug: 'carta-al-nieto',  type: 'carta',  category: CATEGORY_PRIMER },
  { order: 1, file: 'indagaciones/01-fabrica-obediencia.md',                slug: 'fabrica-obediencia',              type: 'ensayo', category: CATEGORY_INDAGACIONES },
  { order: 2, file: 'indagaciones/02-caudillo-camino-sin-camino.md',        slug: 'caudillo-camino-sin-camino',      type: 'ensayo', category: CATEGORY_INDAGACIONES },
  { order: 3, file: 'indagaciones/03-miedo-y-devenir.md',                   slug: 'miedo-y-devenir',                 type: 'ensayo', category: CATEGORY_INDAGACIONES },
  { order: 4, file: 'indagaciones/04-libertad-de-lo-conocido.md',           slug: 'libertad-de-lo-conocido',         type: 'ensayo', category: CATEGORY_INDAGACIONES },
  { order: 5, file: 'indagaciones/05-conocerse-sin-espejo.md',              slug: 'conocerse-sin-espejo',            type: 'ensayo', category: CATEGORY_INDAGACIONES },
  { order: 6, file: 'indagaciones/06-amor-sin-apego.md',                    slug: 'amor-sin-apego',                  type: 'ensayo', category: CATEGORY_INDAGACIONES },
  { order: 7, file: 'indagaciones/07-sensibilidad-como-infraestructura.md', slug: 'sensibilidad-como-infraestructura', type: 'ensayo', category: CATEGORY_INDAGACIONES },
];

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function stripTitleSubtitle(md: string): string {
  const lines = md.split('\n');
  const isNumberedSection = (line: string) =>
    /^## (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\. /.test(line);
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && /^# (?!#)/.test(lines[i])) i++;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && /^## /.test(lines[i]) && !isNumberedSection(lines[i])) i++;
  return lines.slice(i).join('\n');
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function splitBodyAndCartografia(md: string): { body: string; cartografia: string | null } {
  const idx = md.indexOf('## Cartografía');
  if (idx === -1) return { body: md, cartografia: null };
  return {
    body: md.slice(0, idx).trim(),
    cartografia: md.slice(idx).trim(),
  };
}

function parseCartografia(md: string | null): EnsayoCartografiaGroup[] {
  if (!md) return [];
  const lines = md.split('\n');
  const groups: EnsayoCartografiaGroup[] = [];
  let current: EnsayoCartografiaGroup | null = null;
  for (const line of lines) {
    const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      current = { heading: headingMatch[1], items: [] };
      groups.push(current);
      continue;
    }
    const bulletMatch = line.match(/^-\s+\*(.+?)\*\s+—\s+(.+)$/);
    if (bulletMatch && current) {
      const label = bulletMatch[1].trim();
      const blurb = bulletMatch[2].trim();
      const href = CARTOGRAFIA_HREF_MAP[label];
      current.items.push({ label, blurb, href });
    }
  }
  return groups;
}

function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, lvl, inner) => {
    const cleanText = decodeHtmlEntities(String(inner).replace(/<[^>]+>/g, '').trim());
    return `<h${lvl} id="${slugifyHeading(cleanText)}">${inner}</h${lvl}>`;
  });
}

function buildToc(html: string): EnsayoTocItem[] {
  const toc: EnsayoTocItem[] = [];
  const re = /<h([23])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const level = Number(m[1]) as 2 | 3;
    const id = m[2];
    const text = decodeHtmlEntities(m[3].replace(/<[^>]+>/g, '').trim());
    if (text === 'Cartografía') continue;
    toc.push({ id, level, text });
  }
  return toc;
}

function extractTitleSubtitle(md: string): { title: string; subtitle: string } {
  const titleMatch = md.match(/^# (.+)$/m);
  const lines = md.split('\n');
  let subtitle = '';
  for (let i = 0; i < lines.length; i++) {
    if (/^# /.test(lines[i])) {
      for (let j = i + 1; j < lines.length; j++) {
        const m2 = lines[j].match(/^## (.+)$/);
        if (m2) { subtitle = m2[1].trim(); break; }
      }
      break;
    }
  }
  return { title: titleMatch?.[1].trim() ?? '', subtitle };
}

function extractOpening(body: string): string {
  const lines = body.split('\n');
  let inFirstSection = false;
  for (const line of lines) {
    if (/^## I\. /.test(line)) { inFirstSection = true; continue; }
    if (!inFirstSection) continue;
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      return trimmed.replace(/[*_]/g, '').slice(0, 280);
    }
  }
  // Fallback: first non-heading paragraph anywhere in body.
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      return trimmed.replace(/[*_]/g, '').slice(0, 280);
    }
  }
  return '';
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function build(): Ensayo[] {
  const ensayos: Ensayo[] = [];
  for (const meta of FILES) {
    const md = readFileSync(resolve(ENSAYOS_DIR, meta.file), 'utf8');
    const { body, cartografia: cartoMd } = splitBodyAndCartografia(md);
    const { title, subtitle } = extractTitleSubtitle(body);
    const opening = extractOpening(body);
    const bodyForRender = stripTitleSubtitle(body);
    const html = injectHeadingIds(marked.parse(bodyForRender) as string);
    const toc = buildToc(html);
    const cartografia = parseCartografia(cartoMd);
    const wordCount = countWords(bodyForRender);
    const readingMinutes = Math.max(1, Math.round(wordCount / 200));

    const next = FILES.find((f) => f.order === meta.order + 1 && f.category === meta.category);
    ensayos.push({
      slug: meta.slug,
      order: meta.order,
      type: meta.type,
      category: meta.category,
      title,
      subtitle,
      opening,
      readingMinutes,
      bodyHtml: html,
      toc,
      cartografia,
      next: next ? { slug: next.slug, title: '' } : undefined,
    });
  }
  for (const e of ensayos) {
    if (e.next) {
      const target = ensayos.find((x) => x.slug === e.next!.slug);
      if (target) e.next.title = target.title;
    }
  }
  return ensayos;
}

const ensayos = build();
mkdirSync(dirname(OUT_FILE), { recursive: true });
const out = `// AUTO-GENERATED by scripts/build-ensayos.ts. Do not edit by hand.
import type { Ensayo } from '@shared/ensayo-types';

export const ensayos: Ensayo[] = ${JSON.stringify(ensayos, null, 2)};
`;
writeFileSync(OUT_FILE, out, 'utf8');
console.log(`Generated ${OUT_FILE} with ${ensayos.length} ensayos.`);
