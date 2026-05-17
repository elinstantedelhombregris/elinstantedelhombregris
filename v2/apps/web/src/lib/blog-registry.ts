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
  body: string;
}

const files = import.meta.glob<string>('../../../../content/blog/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

interface ParsedFrontmatter {
  scalars: Record<string, unknown>;
  tags: string[];
}

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
  if (!match) return { scalars: {}, tags: [] };
  const scalars: Record<string, unknown> = {};
  const tags: string[] = [];
  const yaml = match[1] ?? '';
  const lines = yaml.split('\n');
  let inTags = false;
  for (const line of lines) {
    if (inTags) {
      const tagMatch = /^ {2}- (.+)$/.exec(line);
      if (tagMatch && tagMatch[1] !== undefined) {
        tags.push(unquote(tagMatch[1].trim()));
        continue;
      }
      inTags = false;
    }
    if (/^tags\s*:\s*$/.test(line)) {
      inTags = true;
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
  return { scalars, tags };
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
    const { scalars, tags } = parseFrontmatter(raw);
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
      tags,
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
