import fs from "fs/promises";
import path from "path";
import {
  courseManifestSchema,
  ensureCourseManifestDefaults,
  quizManifestSchema,
  stripRichText,
} from "../shared/course-content";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT_DIR, "content", "courses");
const PUBLIC_ROOT = path.join(ROOT_DIR, "public");

type Issue = {
  slug: string;
  level: "error" | "warn";
  message: string;
};

const COURSE_METADATA_FIELDS = [
  "seoTitle",
  "seoDescription",
  "searchSummary",
  "ogImageUrl",
  "lastReviewedAt",
] as const;

const LESSON_METADATA_FIELDS = [
  "description",
  "seoTitle",
  "seoDescription",
  "searchSummary",
] as const;

const STUB_PATTERNS = [
  /blueprint/i,
  /lessons-overhaul/i,
  /placeholder/i,
  /coming soon/i,
  /por definir/i,
];

const ENGLISH_PATTERNS = [
  /\bgame theory\b/i,
  /\bfeedback loop(s)?\b/i,
  /\bcontrol theory\b/i,
  /\bcomplexity science\b/i,
  /\bmindset\b/i,
  /\bburnout\b/i,
  /\benforcement\b/i,
  /\binput-output\b/i,
  /\bcompounding\b/i,
];

const PRACTICE_PATTERNS = [
  /^(##|###)\s+Aplicación práctica\b/gim,
  /^(##|###)\s+Cómo se ve en el territorio\b/gim,
  /^(##|###)\s+Aplicación argentina\b/gim,
  /^(##|###)\s+Caso(s)?\b/gim,
];

const EXERCISE_PATTERNS = [
  /^(##|###)\s+Ejercicio(\s+guiado|\s+de aplicación)?\b/gim,
  /^(##|###)\s+Actividad\b/gim,
  /^(##|###)\s+Práctica\b/gim,
  /^(##|###)\s+Reflexión\b/gim,
  /^(##|###)\s+Checklist\b/gim,
];

const TAKEAWAY_PATTERNS = [
  /^(##|###)\s+Idea fuerza\b/gim,
  /^(##|###)\s+Cierre\b/gim,
  /^(##|###)\s+Conclusión\b/gim,
  /^(##|###)\s+Para cerrar\b/gim,
  /^(##|###)\s+Resumen final\b/gim,
  /^(##|###)\s+Checklist de salida\b/gim,
  /^(##|###)\s+La clave\b/gim,
  /^(##|###)\s+¿Entendiste\??\b/gim,
  /^(##|###)\s+Próximo paso\b/gim,
  /^(##|###)\s+Preparación para\b/gim,
];

const ALLOWED_HTML_TAGS = new Set([
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "caption",
  "colgroup",
  "col",
  "pre",
  "code",
  "svg",
  "g",
  "defs",
  "path",
  "line",
  "rect",
  "circle",
  "ellipse",
  "polygon",
  "polyline",
  "text",
  "tspan",
  "lineargradient",
  "radialgradient",
  "stop",
  "marker",
  "strong",
  "em",
  "b",
  "i",
]);

function countWords(content: string) {
  const text = stripRichText(content);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function targetLessonWordMinimum(level: string) {
  return level === "advanced" ? 650 : 500;
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function summarizeIssue(issue: Issue) {
  return `[${issue.level.toUpperCase()}] [${issue.slug}] ${issue.message}`;
}

function hasAnyPattern(content: string, patterns: RegExp[]) {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  });
}

function countSectionHeadings(content: string) {
  return (content.match(/^(##|###)\s+/gm) || []).length;
}

function hasOpeningParagraph(content: string) {
  const withoutLeadHeadings = content
    .replace(/^\s*[^\n#<][^\n]{3,}\n+/, "")
    .replace(/^\s*(?:#{1,3}\s+[^\n]+\n+){0,2}/, "")
    .trimStart();
  const paragraph = withoutLeadHeadings.split(/\n\s*\n/)[0] || "";
  return stripRichText(paragraph).length >= 90;
}

async function validateAssetReference(
  issues: Issue[],
  slug: string,
  lessonTitle: string,
  lessonPath: string,
  src: string,
) {
  if (/^https?:\/\//i.test(src) || /^data:/i.test(src)) return;

  const resolved = src.startsWith("/")
    ? path.join(PUBLIC_ROOT, src.replace(/^\//, ""))
    : path.join(path.dirname(lessonPath), src);

  if (!(await pathExists(resolved))) {
    issues.push({
      slug,
      level: "error",
      message: `Lesson "${lessonTitle}" references missing asset "${src}".`,
    });
  }
}

async function main() {
  const issues: Issue[] = [];
  const courseDirs = (await fs.readdir(CONTENT_ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const slug of courseDirs) {
    const courseDir = path.join(CONTENT_ROOT, slug);
    const manifestPath = path.join(courseDir, "course.json");
    const manifestRaw = await fs.readFile(manifestPath, "utf8");
    const manifest = ensureCourseManifestDefaults(courseManifestSchema.parse(JSON.parse(manifestRaw)));

    if (manifest.slug !== slug) {
      issues.push({ slug, level: "error", message: `Manifest slug "${manifest.slug}" does not match directory.` });
    }

    const courseTextForLanguage = [
      manifest.title,
      manifest.description,
      manifest.excerpt,
      manifest.searchSummary,
      manifest.seoTitle,
      manifest.seoDescription,
    ]
      .filter(Boolean)
      .join("\n");
    if (ENGLISH_PATTERNS.some((pattern) => pattern.test(courseTextForLanguage))) {
      issues.push({ slug, level: "error", message: "Course metadata still contains English-first terminology." });
    }

    for (const field of COURSE_METADATA_FIELDS) {
      if (!manifest[field]) {
        issues.push({ slug, level: "error", message: `Missing course metadata field "${field}".` });
      }
    }

    if (!manifest.thumbnailUrl || /^https?:\/\//i.test(manifest.thumbnailUrl)) {
      issues.push({ slug, level: "error", message: "Course thumbnailUrl must be a local asset path." });
    }

    let totalWords = 0;
    let lessonDurationSum = 0;
    let englishHits = 0;
    let emojiHits = 0;
    let styleHits = 0;

    for (const lesson of manifest.lessons) {
      for (const field of LESSON_METADATA_FIELDS) {
        if (!lesson[field]) {
          issues.push({ slug, level: "error", message: `Lesson "${lesson.title}" is missing "${field}".` });
        }
      }

      const lessonTextForLanguage = [
        lesson.title,
        lesson.description,
        lesson.searchSummary,
        lesson.seoTitle,
        lesson.seoDescription,
      ]
        .filter(Boolean)
        .join("\n");
      if (ENGLISH_PATTERNS.some((pattern) => pattern.test(lessonTextForLanguage))) {
        issues.push({ slug, level: "error", message: `Lesson "${lesson.title}" metadata still contains English-first terminology.` });
      }

      const lessonPath = path.join(courseDir, lesson.contentFile);
      if (!(await pathExists(lessonPath))) {
        issues.push({ slug, level: "error", message: `Missing lesson file ${lesson.contentFile}.` });
        continue;
      }

      const raw = await fs.readFile(lessonPath, "utf8");
      const words = countWords(raw);
      totalWords += words;
      lessonDurationSum += Number(lesson.duration) || 0;

      if (words < targetLessonWordMinimum(manifest.level)) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" is too short at ${words} words.`,
        });
      }

      if (STUB_PATTERNS.some((pattern) => pattern.test(raw))) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" still contains stub or blueprint language.`,
        });
      }

      if (/(^|[\s<])style\s*=\s*['"]/i.test(raw)) {
        styleHits += 1;
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" still contains inline style attributes.`,
        });
      }

      const disallowedTags = Array.from(new Set(
        [...raw.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9:-]*)\b/g)]
          .map((match) => match[1].toLowerCase())
          .filter((tag) => !ALLOWED_HTML_TAGS.has(tag)),
      ));
      if (disallowedTags.length > 0) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" contains disallowed HTML tags: ${disallowedTags.join(", ")}.`,
        });
      }

      if (!hasOpeningParagraph(raw)) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" is missing a strong opening paragraph.`,
        });
      }

      if (countSectionHeadings(raw) < 4) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" does not have enough section structure.`,
        });
      }

      if (!hasAnyPattern(raw, PRACTICE_PATTERNS)) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" is missing a practice or territory section.`,
        });
      }

      if (!hasAnyPattern(raw, EXERCISE_PATTERNS)) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" is missing an explicit exercise or reflection block.`,
        });
      }

      if (!hasAnyPattern(raw, TAKEAWAY_PATTERNS)) {
        issues.push({
          slug,
          level: "error",
          message: `Lesson "${lesson.title}" is missing a closing takeaway section.`,
        });
      }

      if (ENGLISH_PATTERNS.some((pattern) => pattern.test(raw))) {
        englishHits += 1;
      }

      if (/[\p{Extended_Pictographic}]/u.test(raw)) {
        emojiHits += 1;
      }

      for (const match of raw.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
        await validateAssetReference(issues, slug, lesson.title, lessonPath, match[1]);
      }

      for (const match of raw.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)) {
        await validateAssetReference(issues, slug, lesson.title, lessonPath, match[1]);
      }
    }

    if (slug === "argentina-sistema-viviente-primeros-principios" && (manifest.lessons.length < 12 || manifest.lessons.length > 16)) {
      issues.push({
        slug,
        level: "error",
        message: `Course must be restructured to 12-16 lessons, currently ${manifest.lessons.length}.`,
      });
    }

    if (manifest.duration && Math.abs(lessonDurationSum - manifest.duration) > 5) {
      issues.push({
        slug,
        level: "error",
        message: `Course duration ${manifest.duration} does not match lesson sum ${lessonDurationSum}.`,
      });
    }

    const avgWords = manifest.lessons.length > 0 ? Math.round(totalWords / manifest.lessons.length) : 0;
    if (avgWords < targetLessonWordMinimum(manifest.level)) {
      issues.push({
        slug,
        level: "error",
        message: `Average lesson depth is too low at ${avgWords} words.`,
      });
    }

    if (englishHits > 0) {
      issues.push({
        slug,
        level: "warn",
        message: `${englishHits} lessons still contain English terminology.`,
      });
    }

    if (emojiHits > 0) {
      issues.push({
        slug,
        level: "warn",
        message: `${emojiHits} lessons still contain emoji scaffolding or decoration.`,
      });
    }

    if (styleHits > 0) {
      issues.push({
        slug,
        level: "warn",
        message: `${styleHits} lessons still contain inline styles.`,
      });
    }

    if (manifest.quizFile) {
      const quizPath = path.join(courseDir, manifest.quizFile);
      if (!(await pathExists(quizPath))) {
        issues.push({ slug, level: "error", message: `Missing quiz manifest "${manifest.quizFile}".` });
      } else {
        const quizRaw = await fs.readFile(quizPath, "utf8");
        const quiz = quizManifestSchema.parse(JSON.parse(quizRaw));
        if (quiz.questions.length < manifest.lessons.length) {
          issues.push({
            slug,
            level: "error",
            message: `Quiz coverage is too low: ${quiz.questions.length} questions for ${manifest.lessons.length} lessons.`,
          });
        }
      }
    }
  }

  if (issues.length > 0) {
    const errors = issues.filter((issue) => issue.level === "error");
    const warnings = issues.filter((issue) => issue.level === "warn");
    if (warnings.length > 0) {
      console.warn(warnings.map(summarizeIssue).join("\n"));
    }
    if (errors.length > 0) {
      throw new Error(errors.map(summarizeIssue).join("\n"));
    }
  }

  console.log(`Content audit passed for ${courseDirs.length} course packages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
