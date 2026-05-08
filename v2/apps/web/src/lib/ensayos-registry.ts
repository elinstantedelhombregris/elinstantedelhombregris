/**
 * Build-time registry of ensayos (essays) MDX files.
 * Same shape as plans-registry — eager-loaded via Vite import.meta.glob.
 */
import { stripFrontmatter } from './markdown';

export interface EnsayoEntry {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  series: string;
  orderIndex: number;
  publishedAt: string;
  readingMinutes: number;
  body: string;
}

const files = import.meta.glob<string>('../../../../content/ensayos/*.mdx', {
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
    let value: string = m[2] ?? '';
    if (!key) continue;
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    if (value === 'true') fm[key] = true;
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

function buildRegistry(): EnsayoEntry[] {
  const entries: EnsayoEntry[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const fm = parseFrontmatter(raw);
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '').toLowerCase() ?? '';
    entries.push({
      slug: readString(fm, 'slug', fallbackSlug),
      title: readString(fm, 'title', '(sin título)'),
      subtitle: readString(fm, 'subtitle', ''),
      summary: readString(fm, 'summary', ''),
      series: readString(fm, 'series', 'sueltos'),
      orderIndex: readNumber(fm, 'orderIndex', 99),
      publishedAt: readString(fm, 'publishedAt', ''),
      readingMinutes: readNumber(fm, 'readingMinutes', 0),
      body: stripFrontmatter(raw),
    });
  }
  return entries.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const ENSAYOS: readonly EnsayoEntry[] = buildRegistry();

export function findEnsayoBySlug(slug: string): EnsayoEntry | undefined {
  return ENSAYOS.find((e) => e.slug === slug);
}
