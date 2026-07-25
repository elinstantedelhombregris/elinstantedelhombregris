/**
 * Build-time registry of «La crónica del país que viene» chapters.
 *
 * v1's five-chapter novela (formerly embedded inline in the
 * `UnaRutaParaArgentina` page). Same shape as ensayos-registry /
 * plans-registry — eager-loaded via Vite import.meta.glob.
 * `orderIndex` is the explicit chapter number carried over from the
 * source; reading order is derived from it, never from file name.
 */
import { stripFrontmatter } from './markdown';

export interface CronicaChapter {
  slug: string;
  title: string;
  /** Year or year-range the chapter is set in (e.g. "2026", "2029 — 2034"). */
  subtitle: string;
  /** The chapter's opening epigraph line. */
  epigraph: string;
  /** 1-based position in the five-chapter novela. */
  orderIndex: number;
  /** Raw mdx body (no frontmatter). */
  body: string;
}

const files = import.meta.glob<string>('../../../../content/cronica/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!match) return {};
  const fm: Record<string, unknown> = {};
  const yaml = match[1] ?? '';
  for (const line of yaml.split('\n')) {
    const m = /^([a-zA-Z0-9_]+)\s*:\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const key = m[1];
    const raw2: string = m[2] ?? '';
    if (!key) continue;
    // A quoted scalar (e.g. subtitle: '2026') must stay a string even when
    // its contents look numeric/boolean — quoting is the author's explicit
    // type signal, so it takes priority over the bareword coercion below.
    const quoted =
      (raw2.startsWith("'") && raw2.endsWith("'")) || (raw2.startsWith('"') && raw2.endsWith('"'));
    const value = quoted ? raw2.slice(1, -1) : raw2;
    if (quoted) fm[key] = value;
    else if (value === 'true') fm[key] = true;
    else if (value === 'false') fm[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(value)) fm[key] = Number(value);
    else fm[key] = value;
  }
  return fm;
}

function readString(fm: Record<string, unknown>, key: string, fallback: string): string {
  const v = fm[key];
  return typeof v === 'string' ? v : fallback;
}
function readNumber(fm: Record<string, unknown>, key: string, fallback: number): number {
  const v = fm[key];
  return typeof v === 'number' ? v : fallback;
}

function buildRegistry(): CronicaChapter[] {
  const entries: CronicaChapter[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const fm = parseFrontmatter(raw);
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '').toLowerCase() ?? '';
    entries.push({
      slug: readString(fm, 'slug', fallbackSlug),
      title: readString(fm, 'title', '(sin título)'),
      subtitle: readString(fm, 'subtitle', ''),
      epigraph: readString(fm, 'epigraph', ''),
      orderIndex: readNumber(fm, 'orderIndex', 99),
      body: stripFrontmatter(raw),
    });
  }
  return entries.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const CRONICA_CHAPTERS: readonly CronicaChapter[] = buildRegistry();

export function findCronicaChapterBySlug(slug: string): CronicaChapter | undefined {
  return CRONICA_CHAPTERS.find((c) => c.slug === slug);
}
