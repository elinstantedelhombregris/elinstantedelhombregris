/**
 * Build-time registry of blog post MDX files.
 * Same shape as ensayos-registry — eager-loaded via Vite import.meta.glob.
 */
import { stripFrontmatter } from './markdown';

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  type: 'blog' | 'vlog';
  category: string;
  publishedAt: string;
  readingMinutes: number;
  tags: readonly string[];
  coverImageUrl: string;
  coverImageAlt: string;
  coverImageCaption: string;
  coverImageCredit: string;
  updatedAt: string;
  /** Direcciones viejas del post (slug de v1, con los acentos borrados). */
  legacySlugs: readonly string[];
  body: string;
}

const files = import.meta.glob<string>('../../../../content/blog/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

interface ParsedFrontmatter {
  scalars: Record<string, unknown>;
  /** Every `key:\n  - value` block list found, keyed by its field name. */
  lists: Record<string, string[]>;
}

/** Frontmatter keys that introduce a YAML block list (`key:\n  - value`). */
const LIST_KEYS = ['tags', 'legacySlugs'];

function unquote(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"')))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!match) return { scalars: {}, lists: {} };
  const scalars: Record<string, unknown> = {};
  const lists: Record<string, string[]> = {};
  const yaml = match[1] ?? '';
  const lines = yaml.split('\n');
  let currentListKey: string | null = null;
  for (const line of lines) {
    if (currentListKey !== null) {
      const itemMatch = /^ {2}- (.+)$/.exec(line);
      if (itemMatch?.[1] !== undefined) {
        (lists[currentListKey] ??= []).push(unquote(itemMatch[1].trim()));
        continue;
      }
      currentListKey = null;
    }
    const listKeyMatch = /^([a-zA-Z0-9_]+)\s*:\s*$/.exec(line);
    if (listKeyMatch?.[1] !== undefined && LIST_KEYS.includes(listKeyMatch[1])) {
      currentListKey = listKeyMatch[1];
      lists[currentListKey] ??= [];
      continue;
    }
    const m = /^([a-zA-Z0-9_]+)\s*:\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const key = m[1];
    if (!key) continue;
    const value = unquote(m[2] ?? '');
    if (value === 'true') scalars[key] = true;
    else if (value === 'false') scalars[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(value)) scalars[key] = Number(value);
    else scalars[key] = value;
  }
  return { scalars, lists };
}

function readString(fm: Record<string, unknown>, key: string, fallback: string): string {
  const v = fm[key];
  return typeof v === 'string' ? v : fallback;
}
function readNumber(fm: Record<string, unknown>, key: string, fallback: number): number {
  const v = fm[key];
  return typeof v === 'number' ? v : fallback;
}
function readBoolean(fm: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const v = fm[key];
  return typeof v === 'boolean' ? v : fallback;
}

function buildRegistry(): BlogPost[] {
  const entries: BlogPost[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const { scalars, lists } = parseFrontmatter(raw);
    if (readBoolean(scalars, 'draft', false)) continue;
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '').toLowerCase() ?? '';
    const type = readString(scalars, 'type', 'blog') === 'vlog' ? 'vlog' : 'blog';
    entries.push({
      slug: readString(scalars, 'slug', fallbackSlug),
      title: readString(scalars, 'title', '(sin título)'),
      summary: readString(scalars, 'summary', ''),
      type,
      category: readString(scalars, 'category', ''),
      publishedAt: readString(scalars, 'publishedAt', ''),
      readingMinutes: readNumber(scalars, 'readingMinutes', 0),
      tags: lists.tags ?? [],
      coverImageUrl: readString(scalars, 'coverImageUrl', ''),
      coverImageAlt: readString(scalars, 'coverImageAlt', ''),
      coverImageCaption: readString(scalars, 'coverImageCaption', ''),
      coverImageCredit: readString(scalars, 'coverImageCredit', ''),
      updatedAt: readString(scalars, 'updatedAt', ''),
      legacySlugs: lists.legacySlugs ?? [],
      body: stripFrontmatter(raw),
    });
  }
  return entries.sort((a, b) =>
    a.publishedAt < b.publishedAt
      ? 1
      : a.publishedAt > b.publishedAt
        ? -1
        : a.slug < b.slug
          ? -1
          : a.slug > b.slug
            ? 1
            : 0,
  );
}

export const BLOG_POSTS: readonly BlogPost[] = buildRegistry();

export function findBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Resuelve una dirección vieja (spec 3.4, decisión 10) al post que la declara. */
export function findBlogPostByLegacySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.legacySlugs.includes(slug));
}
