/**
 * Frontmatter schemas for MDX content.
 *
 * Each content type (blog post, ensayo, course lesson, plan) has its
 * own frontmatter shape. The build-time pipeline validates every MDX
 * file against these schemas; an unparseable frontmatter is a build
 * failure, not a runtime error.
 */
import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(slugRegex, 'Slugs must be kebab-case alphanumeric.');

// gray-matter auto-parses ISO date strings into JS Date objects, so the
// schema accepts both. We re-emit ISO strings downstream.
const isoDateSchema = z
  .union([
    z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Must be an ISO 8601 date.' }),
    z.date(),
  ])
  .transform((v) => (typeof v === 'string' ? v : v.toISOString()));

/**
 * Blog post frontmatter.
 *
 * The body of the file is the post content; the slug + title +
 * publishedAt drive routing and ordering.
 */
export const blogFrontmatterSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  publishedAt: isoDateSchema,
  authorUsername: z.string().min(1),
  tags: z.array(z.string().min(1)).max(20).default([]),
  coverImageUrl: z.string().url().optional(),
  /** When set, hides the post from public listings (still reachable by URL). */
  draft: z.boolean().default(false),
});
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

/**
 * Ensayo frontmatter.
 *
 * Ensayos belong to a series ("primer ciclo", "indagaciones") and
 * carry an order index for sequential reading. Series + orderIndex
 * together form the natural reading flow.
 */
export const ensayoFrontmatterSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  summary: z.string().min(1).max(800),
  /** 'primer-ciclo' | 'indagaciones' | 'sueltos' */
  series: z.string().min(1).max(60),
  /** Position within the series (1-based). Drives next/prev nav. */
  orderIndex: z.number().int().positive(),
  publishedAt: isoDateSchema,
  /** Estimated reading time in minutes. */
  readingMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string().min(1)).max(20).default([]),
  draft: z.boolean().default(false),
});
export type EnsayoFrontmatter = z.infer<typeof ensayoFrontmatterSchema>;

/**
 * PLAN frontmatter — for the 22 ¡BASTA! PLANs in content/planes/.
 */
export const planFrontmatterSchema = z.object({
  slug: slugSchema,
  /** PLAN code (PLANSUS, PLANEB, PLANRUTA, …). Uppercase, max 20 chars. */
  code: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Z][A-Z0-9]*$/, 'PLAN codes must be uppercase ASCII.'),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(800),
  /** Order in the canonical PLAN list. Distinct from PLANRUTA which is meta. */
  orderIndex: z.number().int().nonnegative(),
  /** Marks PLANRUTA — the bootstrap/meta plan, not counted among the 22. */
  isMeta: z.boolean().default(false),
  /** Five-year cascade phases for the plan, optional. */
  phases: z
    .array(
      z.object({
        year: z.number().int().min(1).max(20),
        title: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
  draft: z.boolean().default(false),
});
export type PlanFrontmatter = z.infer<typeof planFrontmatterSchema>;

/**
 * Course lesson frontmatter — used by content/courses/<course-slug>/<lesson>.mdx.
 */
export const lessonFrontmatterSchema = z.object({
  slug: slugSchema,
  courseSlug: slugSchema,
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  orderIndex: z.number().int().nonnegative(),
  estimatedMinutes: z.number().int().positive().optional(),
  draft: z.boolean().default(false),
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
