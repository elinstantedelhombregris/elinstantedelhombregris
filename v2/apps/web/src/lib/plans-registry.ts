/**
 * Build-time registry of all PLAN MDX files.
 *
 * Vite's `import.meta.glob` eagerly loads every plan as raw text.
 * Each file's frontmatter is parsed once at module load; the result is
 * memoized for the lifetime of the bundle.
 */
import { stripFrontmatter } from './markdown';

export interface PlanRegistryEntry {
  /** Lowercase slug used in URLs (e.g. "plansus"). */
  slug: string;
  /** Uppercase code as authored in frontmatter ("PLANSUS"). */
  code: string;
  title: string;
  summary: string;
  orderIndex: number;
  isMeta: boolean;
  /** Raw mdx body (no frontmatter). */
  body: string;
}

const planFiles = import.meta.glob<string>('../../../../content/planes/*.mdx', {
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
    // Strip surrounding quotes (single or double).
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

function buildRegistry(): PlanRegistryEntry[] {
  const entries: PlanRegistryEntry[] = [];
  for (const [path, raw] of Object.entries(planFiles)) {
    const fm = parseFrontmatter(raw);
    const fallbackSlug = path.split('/').pop()?.replace('.mdx', '').toLowerCase() ?? '';
    const slug = typeof fm.slug === 'string' ? fm.slug : fallbackSlug;
    const code = typeof fm.code === 'string' ? fm.code : slug.toUpperCase();
    entries.push({
      slug,
      code,
      title: typeof fm.title === 'string' ? fm.title : '(sin título)',
      summary: typeof fm.summary === 'string' ? fm.summary : '',
      orderIndex: typeof fm.orderIndex === 'number' ? fm.orderIndex : 99,
      isMeta: fm.isMeta === true,
      body: stripFrontmatter(raw),
    });
  }
  return entries.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const PLAN_REGISTRY: readonly PlanRegistryEntry[] = buildRegistry();

export function findPlanByCode(code: string): PlanRegistryEntry | undefined {
  const upper = code.toUpperCase();
  return PLAN_REGISTRY.find((p) => p.code === upper);
}

export function findPlanBySlug(slug: string): PlanRegistryEntry | undefined {
  const lower = slug.toLowerCase();
  return PLAN_REGISTRY.find((p) => p.slug === lower);
}
