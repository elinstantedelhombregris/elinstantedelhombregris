import { marked } from "marked";
import { z } from "zod";

export const COURSE_CATEGORY_VALUES = [
  "vision",
  "action",
  "community",
  "reflection",
  "hombre-gris",
  "economia",
  "comunicacion",
  "civica",
] as const;

export const COURSE_LEVEL_VALUES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const LESSON_TYPE_VALUES = [
  "text",
  "video",
  "interactive",
  "document",
] as const;

export const QUIZ_QUESTION_TYPE_VALUES = [
  "multiple_choice",
  "true_false",
  "short_answer",
] as const;

export const COURSE_CONTENT_SCHEMA_VERSION = 1;

export const optionalText = z.string().trim().min(1).optional().nullable();

export const seoFieldsSchema = z.object({
  seoTitle: optionalText,
  seoDescription: optionalText,
  searchSummary: optionalText,
  ogImageUrl: optionalText,
  lastReviewedAt: optionalText,
  indexable: z.boolean().optional(),
});

export const lessonManifestEntrySchema = seoFieldsSchema.extend({
  key: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1),
  description: optionalText,
  type: z.enum(LESSON_TYPE_VALUES),
  duration: z.number().int().nonnegative().optional().nullable(),
  orderIndex: z.number().int().nonnegative(),
  isRequired: z.boolean().default(true),
  contentFile: z.string().trim().min(1),
  videoUrl: optionalText,
  documentUrl: optionalText,
  legacyLessonId: z.number().int().positive().optional().nullable(),
});

export const quizQuestionManifestSchema = z.object({
  question: z.string().trim().min(1),
  type: z.enum(QUIZ_QUESTION_TYPE_VALUES),
  options: z.array(z.string()).optional().nullable(),
  correctAnswer: z.unknown(),
  explanation: optionalText,
  points: z.number().int().positive().default(1),
  orderIndex: z.number().int().nonnegative(),
  legacyQuestionId: z.number().int().positive().optional().nullable(),
});

export const quizManifestSchema = z.object({
  title: z.string().trim().min(1),
  description: optionalText,
  passingScore: z.number().int().min(0).max(100).default(70),
  timeLimit: z.number().int().positive().optional().nullable(),
  allowRetakes: z.boolean().default(true),
  maxAttempts: z.number().int().positive().optional().nullable(),
  legacyQuizId: z.number().int().positive().optional().nullable(),
  questions: z.array(quizQuestionManifestSchema).default([]),
});

export const lessonRekeySchema = z.object({
  fromKey: z.string().trim().min(1).max(120),
  toKey: z.string().trim().min(1).max(120),
  legacyLessonId: z.number().int().positive().optional().nullable(),
});

export const courseManifestSchema = seoFieldsSchema.extend({
  schemaVersion: z.number().int().default(COURSE_CONTENT_SCHEMA_VERSION),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  excerpt: optionalText,
  category: z.enum(COURSE_CATEGORY_VALUES),
  level: z.enum(COURSE_LEVEL_VALUES),
  duration: z.number().int().nonnegative().optional().nullable(),
  thumbnailUrl: optionalText,
  videoUrl: optionalText,
  orderIndex: z.number().int().default(0),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  requiresAuth: z.boolean().default(false),
  authorId: z.number().int().positive().optional().nullable(),
  legacyCourseId: z.number().int().positive().optional().nullable(),
  quizFile: z.string().trim().min(1).optional().nullable(),
  rekeys: z.array(lessonRekeySchema).default([]),
  lessons: z.array(lessonManifestEntrySchema),
});

export type SeoFields = z.infer<typeof seoFieldsSchema>;
export type CourseManifest = z.infer<typeof courseManifestSchema>;
export type LessonManifestEntry = z.infer<typeof lessonManifestEntrySchema>;
export type QuizManifest = z.infer<typeof quizManifestSchema>;
export type QuizQuestionManifest = z.infer<typeof quizQuestionManifestSchema>;
export type LessonRekey = z.infer<typeof lessonRekeySchema>;

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function slugifyCourseContentKey(input: string): string {
  const normalized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "contenido";
}

export function buildStableLessonKey(title: string, orderIndex: number): string {
  return `${String(orderIndex + 1).padStart(2, "0")}-${slugifyCourseContentKey(title)}`;
}

export function renderCourseMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

export function stripRichText(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ")
    .replace(/[`*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSummary(input?: string | null, maxLength = 160): string {
  const collapsed = stripRichText(input || "");
  if (!collapsed) return "";
  if (collapsed.length <= maxLength) return collapsed;

  const truncated = collapsed.slice(0, maxLength).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
}

export function deriveSearchSummary(
  preferred: string | null | undefined,
  fallback: string | null | undefined,
  maxLength = 220,
): string {
  const preferredSummary = normalizeSummary(preferred, maxLength);
  if (preferredSummary) return preferredSummary;
  return normalizeSummary(fallback, maxLength);
}

export function ensureCourseManifestDefaults(manifest: CourseManifest): CourseManifest {
  return {
    ...manifest,
    schemaVersion: manifest.schemaVersion ?? COURSE_CONTENT_SCHEMA_VERSION,
    isPublished: manifest.isPublished ?? true,
    isFeatured: manifest.isFeatured ?? false,
    requiresAuth: manifest.requiresAuth ?? false,
    rekeys: manifest.rekeys ?? [],
    lessons: manifest.lessons.map((lesson, index) => ({
      ...lesson,
      key: lesson.key || buildStableLessonKey(lesson.title, lesson.orderIndex ?? index),
      orderIndex: lesson.orderIndex ?? index,
      isRequired: lesson.isRequired ?? true,
      indexable: lesson.indexable ?? true,
    })),
    indexable: manifest.indexable ?? true,
  };
}

export function serializePrettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
