import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "./db-neon";
import {
  COURSE_CONTENT_SCHEMA_VERSION,
  buildStableLessonKey,
  courseManifestSchema,
  ensureCourseManifestDefaults,
  quizManifestSchema,
  renderCourseMarkdown,
  serializePrettyJson,
  type CourseManifest,
  type LessonRekey,
  type LessonManifestEntry,
  type QuizManifest,
} from "../shared/course-content";

dotenv.config();

const {
  courses,
  courseLessons,
  courseQuizzes,
  quizQuestions,
  userCourseProgress,
  userLessonProgress,
  quizAttempts,
  courseCertificates,
  courseDefinitions,
  courseRevisions,
  courseLessonIdentities,
  courseRevisionLessons,
  courseRevisionQuizzes,
  courseRevisionQuizQuestions,
} = schema;

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT_DIR, "content", "courses");
const SITE_URL = [process.env.BASE_URL, process.env.CORS_ORIGIN, "https://elinstantedelhombregris.com"]
  .find((value) => value && !/localhost|127\.0\.0\.1/.test(value))
  || process.env.BASE_URL
  || process.env.CORS_ORIGIN
  || "https://elinstantedelhombregris.com";
const SKIP_LEGACY_PROGRESS_SYNC = process.env.SKIP_LEGACY_PROGRESS_SYNC === "true";

type LoadedLesson = LessonManifestEntry & {
  absolutePath: string;
  sourceMarkdown: string;
  renderedHtml: string;
};

type LoadedCoursePackage = {
  directory: string;
  manifestPath: string;
  manifest: CourseManifest;
  lessons: LoadedLesson[];
  quiz: QuizManifest | null;
};

type AuditIssue = {
  slug: string;
  message: string;
};

function getSlugArg(): string | undefined {
  const slugArg = process.argv.find((arg) => arg.startsWith("--slug="));
  return slugArg?.slice("--slug=".length);
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

async function ensureDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
}

async function writeTextFile(filePath: string, content: string) {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf8");
}

function computeContentHash(payload: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function revisionMatchesPackage(revisionId: number, coursePackage: LoadedCoursePackage) {
  const [lessonCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseRevisionLessons)
    .where(eq(courseRevisionLessons.courseRevisionId, revisionId));

  if (Number(lessonCountRow?.count ?? 0) !== coursePackage.lessons.length) {
    return false;
  }

  const [quizRevision] = await db
    .select({ id: courseRevisionQuizzes.id })
    .from(courseRevisionQuizzes)
    .where(eq(courseRevisionQuizzes.courseRevisionId, revisionId))
    .limit(1);

  if (Boolean(quizRevision) !== Boolean(coursePackage.quiz)) {
    return false;
  }

  if (!quizRevision || !coursePackage.quiz) {
    return true;
  }

  const [questionCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseRevisionQuizQuestions)
    .where(eq(courseRevisionQuizQuestions.quizRevisionId, quizRevision.id));

  return Number(questionCountRow?.count ?? 0) === coursePackage.quiz.questions.length;
}

async function syncRevisionContent(courseDefinitionId: number, revisionId: number, coursePackage: LoadedCoursePackage) {
  await db
    .delete(courseRevisionLessons)
    .where(eq(courseRevisionLessons.courseRevisionId, revisionId));

  const publishedLessonIds: number[] = [];
  for (const lesson of coursePackage.lessons) {
    const identity = await upsertLessonIdentity(courseDefinitionId, lesson);
    publishedLessonIds.push(identity.id);

    await db.insert(courseRevisionLessons).values({
      courseRevisionId: revisionId,
      lessonIdentityId: identity.id,
      title: lesson.title,
      description: lesson.description ?? null,
      contentMarkdown: lesson.sourceMarkdown,
      contentHtml: lesson.renderedHtml,
      orderIndex: lesson.orderIndex,
      type: lesson.type,
      videoUrl: lesson.videoUrl ?? null,
      documentUrl: lesson.documentUrl ?? null,
      duration: lesson.duration ?? null,
      isRequired: lesson.isRequired ?? true,
      legacyLessonId: identity.legacyLessonId ?? lesson.legacyLessonId ?? null,
      seoTitle: lesson.seoTitle ?? null,
      seoDescription: lesson.seoDescription ?? null,
      searchSummary: lesson.searchSummary ?? null,
      indexable: lesson.indexable ?? true,
    });
  }

  const [existingQuizRevision] = await db
    .select()
    .from(courseRevisionQuizzes)
    .where(eq(courseRevisionQuizzes.courseRevisionId, revisionId))
    .limit(1);

  if (existingQuizRevision) {
    await db
      .delete(courseRevisionQuizQuestions)
      .where(eq(courseRevisionQuizQuestions.quizRevisionId, existingQuizRevision.id));
  }

  if (!coursePackage.quiz) {
    if (existingQuizRevision) {
      await db
        .update(quizAttempts)
        .set({
          courseQuizRevisionId: null,
        })
        .where(eq(quizAttempts.courseQuizRevisionId, existingQuizRevision.id));

      await db
        .delete(courseRevisionQuizzes)
        .where(eq(courseRevisionQuizzes.id, existingQuizRevision.id));
    }

    return publishedLessonIds;
  }

  const quizRevisionId = existingQuizRevision
    ? (
      await db
        .update(courseRevisionQuizzes)
        .set({
          legacyQuizId: coursePackage.quiz.legacyQuizId ?? null,
          title: coursePackage.quiz.title,
          description: coursePackage.quiz.description ?? null,
          passingScore: coursePackage.quiz.passingScore,
          timeLimit: coursePackage.quiz.timeLimit ?? null,
          allowRetakes: coursePackage.quiz.allowRetakes,
          maxAttempts: coursePackage.quiz.maxAttempts ?? null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(courseRevisionQuizzes.id, existingQuizRevision.id))
        .returning({ id: courseRevisionQuizzes.id })
    )[0].id
    : (
      await db
        .insert(courseRevisionQuizzes)
        .values({
          courseRevisionId: revisionId,
          legacyQuizId: coursePackage.quiz.legacyQuizId ?? null,
          title: coursePackage.quiz.title,
          description: coursePackage.quiz.description ?? null,
          passingScore: coursePackage.quiz.passingScore,
          timeLimit: coursePackage.quiz.timeLimit ?? null,
          allowRetakes: coursePackage.quiz.allowRetakes,
          maxAttempts: coursePackage.quiz.maxAttempts ?? null,
        })
        .returning({ id: courseRevisionQuizzes.id })
    )[0].id;

  for (const question of coursePackage.quiz.questions) {
    await db.insert(courseRevisionQuizQuestions).values({
      quizRevisionId,
      legacyQuestionId: question.legacyQuestionId ?? null,
      question: question.question,
      type: question.type,
      options: question.options ? JSON.stringify(question.options) : null,
      correctAnswer: JSON.stringify(question.correctAnswer),
      explanation: question.explanation ?? null,
      points: question.points ?? 1,
      orderIndex: question.orderIndex,
    });
  }

  return publishedLessonIds;
}

function parseStoredJson(value: string | null | undefined) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listCourseDirectories(targetSlug?: string) {
  await ensureDirectory(CONTENT_ROOT);
  const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => (targetSlug ? slug === targetSlug : true))
    .sort();
}

async function exportCurrentCourses(targetSlug?: string, allowOverwrite = false) {
  await ensureDirectory(CONTENT_ROOT);

  const courseRows = await db
    .select()
    .from(courses)
    .where(targetSlug ? eq(courses.slug, targetSlug) : undefined)
    .orderBy(desc(courses.orderIndex), desc(courses.createdAt));

  for (const course of courseRows) {
    const lessons = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, course.id))
      .orderBy(asc(courseLessons.orderIndex));

    const [quiz] = await db
      .select()
      .from(courseQuizzes)
      .where(eq(courseQuizzes.courseId, course.id))
      .limit(1);

    const questions = quiz
      ? await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, quiz.id))
          .orderBy(asc(quizQuestions.orderIndex))
      : [];

    const courseDir = path.join(CONTENT_ROOT, course.slug);
    const lessonsDir = path.join(courseDir, "lessons");
    if ((await pathExists(courseDir)) && !allowOverwrite) {
      throw new Error(
        `Refusing to overwrite existing course package for "${course.slug}". ` +
        "Use --allow-overwrite only for bootstrap regeneration.",
      );
    }
    await fs.rm(courseDir, { recursive: true, force: true });
    await ensureDirectory(lessonsDir);

    const lessonEntries: LessonManifestEntry[] = [];

    for (const lesson of lessons) {
      const lessonKey = buildStableLessonKey(lesson.title, lesson.orderIndex);
      const lessonFileName = `${String(lesson.orderIndex + 1).padStart(2, "0")}-${lessonKey}.md`;
      const lessonFile = path.join(lessonsDir, lessonFileName);
      await writeTextFile(lessonFile, `${lesson.content}\n`);

      lessonEntries.push({
        key: lessonKey,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isRequired: lesson.isRequired ?? true,
        contentFile: path.join("lessons", lessonFileName),
        videoUrl: lesson.videoUrl,
        documentUrl: lesson.documentUrl,
        legacyLessonId: lesson.id,
        indexable: true,
      });
    }

    const manifest: CourseManifest = ensureCourseManifestDefaults({
      schemaVersion: COURSE_CONTENT_SCHEMA_VERSION,
      slug: course.slug,
      title: course.title,
      description: course.description,
      excerpt: course.excerpt,
      category: course.category,
      level: course.level,
      duration: course.duration,
      thumbnailUrl: course.thumbnailUrl,
      videoUrl: course.videoUrl,
      orderIndex: course.orderIndex ?? 0,
      isPublished: course.isPublished ?? false,
      isFeatured: course.isFeatured ?? false,
      requiresAuth: course.requiresAuth ?? false,
      authorId: course.authorId,
      legacyCourseId: course.id,
      quizFile: quiz ? "quiz.json" : null,
      indexable: true,
      lessons: lessonEntries,
    });

    await writeTextFile(path.join(courseDir, "course.json"), serializePrettyJson(manifest));

    if (quiz) {
      const quizManifest: QuizManifest = quizManifestSchema.parse({
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        allowRetakes: quiz.allowRetakes,
        maxAttempts: quiz.maxAttempts,
        legacyQuizId: quiz.id,
        questions: questions.map((question) => ({
          question: question.question,
          type: question.type,
          options: Array.isArray(parseStoredJson(question.options))
            ? parseStoredJson(question.options)
            : question.options
              ? [String(parseStoredJson(question.options))]
              : null,
          correctAnswer: parseStoredJson(question.correctAnswer),
          explanation: question.explanation,
          points: question.points ?? 1,
          orderIndex: question.orderIndex,
          legacyQuestionId: question.id,
        })),
      });

      await writeTextFile(path.join(courseDir, "quiz.json"), serializePrettyJson(quizManifest));
    }
  }

  console.log(`Exported ${courseRows.length} course packages into ${CONTENT_ROOT}`);
}

async function loadCoursePackage(directory: string): Promise<LoadedCoursePackage> {
  const manifestPath = path.join(CONTENT_ROOT, directory, "course.json");
  const manifestRaw = await fs.readFile(manifestPath, "utf8");
  const manifest = ensureCourseManifestDefaults(courseManifestSchema.parse(JSON.parse(manifestRaw)));

  const seenKeys = new Set<string>();
  const lessons: LoadedLesson[] = [];

  for (const lesson of manifest.lessons) {
    if (seenKeys.has(lesson.key)) {
      throw new Error(`Duplicate lesson key "${lesson.key}" in ${directory}`);
    }
    seenKeys.add(lesson.key);

    const absolutePath = path.join(CONTENT_ROOT, directory, lesson.contentFile);
    const sourceMarkdown = await fs.readFile(absolutePath, "utf8");
    lessons.push({
      ...lesson,
      absolutePath,
      sourceMarkdown,
      renderedHtml: renderCourseMarkdown(sourceMarkdown),
    });
  }

  let quiz: QuizManifest | null = null;
  if (manifest.quizFile) {
    const quizPath = path.join(CONTENT_ROOT, directory, manifest.quizFile);
    const quizRaw = await fs.readFile(quizPath, "utf8");
    quiz = quizManifestSchema.parse(JSON.parse(quizRaw));
  }

  return {
    directory,
    manifestPath,
    manifest,
    lessons,
    quiz,
  };
}

async function validatePackages(targetSlug?: string) {
  const directories = await listCourseDirectories(targetSlug);
  const packages: LoadedCoursePackage[] = [];

  for (const directory of directories) {
    const loadedPackage = await loadCoursePackage(directory);
    if (loadedPackage.manifest.slug !== directory) {
      throw new Error(`Course folder "${directory}" does not match manifest slug "${loadedPackage.manifest.slug}"`);
    }
    if (loadedPackage.manifest.quizFile && !loadedPackage.quiz) {
      throw new Error(`Quiz manifest missing for ${directory}`);
    }

    await validatePackageSafety(loadedPackage);

    packages.push(loadedPackage);
  }

  console.log(`Validated ${packages.length} course packages`);
  return packages;
}

async function getCourseDefinitionBySlug(slug: string) {
  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.slug, slug))
    .limit(1);

  return definition;
}

async function getLegacyCourseMetrics(legacyCourseId?: number | null) {
  if (!legacyCourseId) {
    return null;
  }

  const [legacyCourse] = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      viewCount: courses.viewCount,
      isPublished: courses.isPublished,
    })
    .from(courses)
    .where(eq(courses.id, legacyCourseId))
    .limit(1);

  return legacyCourse ?? null;
}

async function getLessonIdentitiesForCourse(courseDefinitionId: number) {
  return db
    .select()
    .from(courseLessonIdentities)
    .where(eq(courseLessonIdentities.courseDefinitionId, courseDefinitionId));
}

type PersistedLessonIdentity = Awaited<ReturnType<typeof getLessonIdentitiesForCourse>>[number];

function getRekeyByToKey(rekeys: LessonRekey[]) {
  return new Map(rekeys.map((rekey) => [rekey.toKey, rekey]));
}

function formatIssue(issue: AuditIssue) {
  return `[${issue.slug}] ${issue.message}`;
}

function ensureLessonIdentityTransitionsAreSafe(
  coursePackage: LoadedCoursePackage,
  identities: PersistedLessonIdentity[],
) {
  if (identities.length === 0) {
    return;
  }

  const issues: string[] = [];
  const manifestKeys = new Set(coursePackage.manifest.lessons.map((lesson) => lesson.key));
  const existingByKey = new Map(identities.map((identity) => [identity.key, identity]));
  const existingByLegacyLessonId = new Map(
    identities
      .filter((identity) => identity.legacyLessonId)
      .map((identity) => [identity.legacyLessonId!, identity]),
  );
  const rekeyByToKey = getRekeyByToKey(coursePackage.manifest.rekeys);

  for (const rekey of coursePackage.manifest.rekeys) {
    if (rekey.fromKey === rekey.toKey) {
      issues.push(`Rekey "${rekey.fromKey}" -> "${rekey.toKey}" is a no-op.`);
      continue;
    }

    if (!manifestKeys.has(rekey.toKey)) {
      issues.push(`Rekey target "${rekey.toKey}" is not present in the manifest.`);
    }

    const fromIdentity = existingByKey.get(rekey.fromKey);
    const toIdentity = existingByKey.get(rekey.toKey);

    if (!fromIdentity && !toIdentity) {
      issues.push(`Rekey source "${rekey.fromKey}" does not exist in persisted identities.`);
      continue;
    }

    if (fromIdentity && toIdentity && fromIdentity.id !== toIdentity.id) {
      issues.push(`Rekey "${rekey.fromKey}" -> "${rekey.toKey}" collides with an existing persisted key.`);
    }

    const persistedIdentity = toIdentity ?? fromIdentity;
    if (rekey.legacyLessonId && persistedIdentity?.legacyLessonId && rekey.legacyLessonId !== persistedIdentity.legacyLessonId) {
      issues.push(`Rekey "${rekey.fromKey}" -> "${rekey.toKey}" has legacyLessonId ${rekey.legacyLessonId}, expected ${persistedIdentity.legacyLessonId}.`);
    }
  }

  for (const lesson of coursePackage.manifest.lessons) {
    if (existingByKey.has(lesson.key)) {
      continue;
    }

    const existingIdentity = lesson.legacyLessonId
      ? existingByLegacyLessonId.get(lesson.legacyLessonId) ?? null
      : null;

    if (!existingIdentity) {
      continue;
    }

    const explicitRekey = rekeyByToKey.get(lesson.key);
    if (!explicitRekey || explicitRekey.fromKey !== existingIdentity.key) {
      issues.push(
        `Lesson "${lesson.title}" changed key from "${existingIdentity.key}" to "${lesson.key}" without an explicit rekey mapping.`,
      );
      continue;
    }

    if (explicitRekey.legacyLessonId && explicitRekey.legacyLessonId !== lesson.legacyLessonId) {
      issues.push(
        `Lesson "${lesson.title}" rekey mapping legacyLessonId ${explicitRekey.legacyLessonId} does not match manifest legacyLessonId ${lesson.legacyLessonId}.`,
      );
    }
  }

  if (issues.length > 0) {
    throw new Error(issues.map((issue) => `[${coursePackage.manifest.slug}] ${issue}`).join("\n"));
  }
}

async function validatePackageSafety(coursePackage: LoadedCoursePackage) {
  const definition = await getCourseDefinitionBySlug(coursePackage.manifest.slug);
  if (!definition) {
    return;
  }

  const identities = await getLessonIdentitiesForCourse(definition.id);
  ensureLessonIdentityTransitionsAreSafe(coursePackage, identities);
}

async function upsertCourseDefinition(coursePackage: LoadedCoursePackage) {
  const sourcePath = path.relative(ROOT_DIR, path.join(CONTENT_ROOT, coursePackage.directory));
  const legacyCourse = await getLegacyCourseMetrics(coursePackage.manifest.legacyCourseId ?? null);
  const [existing] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.slug, coursePackage.manifest.slug))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(courseDefinitions)
      .set({
        legacyCourseId: coursePackage.manifest.legacyCourseId ?? existing.legacyCourseId ?? null,
        sourcePath,
        viewCount: Math.max(existing.viewCount ?? 0, legacyCourse?.viewCount ?? 0),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseDefinitions.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(courseDefinitions)
    .values({
      slug: coursePackage.manifest.slug,
      legacyCourseId: coursePackage.manifest.legacyCourseId ?? null,
      sourcePath,
      viewCount: legacyCourse?.viewCount ?? 0,
    })
    .returning();

  return created;
}

async function upsertLessonIdentity(courseDefinitionId: number, lesson: LoadedLesson) {
  const [existing] = await db
    .select()
    .from(courseLessonIdentities)
    .where(
      and(
        eq(courseLessonIdentities.courseDefinitionId, courseDefinitionId),
        eq(courseLessonIdentities.key, lesson.key),
      )
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(courseLessonIdentities)
      .set({
        legacyLessonId: existing.legacyLessonId ?? lesson.legacyLessonId ?? null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseLessonIdentities.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(courseLessonIdentities)
    .values({
      courseDefinitionId,
      key: lesson.key,
      legacyLessonId: lesson.legacyLessonId ?? null,
    })
    .returning();

  return created;
}

async function syncLegacyProgressMappings(courseDefinitionId: number) {
  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.id, courseDefinitionId))
    .limit(1);

  if (!definition) return;

  const [currentRevision] = await db
    .select()
    .from(courseRevisions)
    .where(eq(courseRevisions.id, definition.currentPublishedRevisionId!))
    .limit(1);

  const identities = await db
    .select()
    .from(courseLessonIdentities)
    .where(eq(courseLessonIdentities.courseDefinitionId, courseDefinitionId));

  const identityByLegacyLessonId = new Map<number, number>();
  identities.forEach((identity) => {
    if (identity.legacyLessonId) {
      identityByLegacyLessonId.set(identity.legacyLessonId, identity.id);
    }
  });

  const lessonIdentityIds = identities.map((identity) => identity.id);
  const legacyLessonIds = Array.from(identityByLegacyLessonId.keys());

  const courseProgressRows = await db
    .select()
    .from(userCourseProgress)
    .where(
      definition.legacyCourseId
        ? or(
            eq(userCourseProgress.courseDefinitionId, courseDefinitionId),
            eq(userCourseProgress.courseId, definition.legacyCourseId),
          )!
        : eq(userCourseProgress.courseDefinitionId, courseDefinitionId)
    );

  for (const progress of courseProgressRows) {
    const legacyCompleted = progress.completedLessons ? JSON.parse(progress.completedLessons) : [];
    const mappedCompleted = Array.from(
      new Set(
        (
          progress.completedLessonIdentityIds
            ? JSON.parse(progress.completedLessonIdentityIds)
            : legacyCompleted.map((legacyId: number) => identityByLegacyLessonId.get(legacyId)).filter(Boolean)
        ) as number[]
      )
    );

    const currentLessonIdentityId = progress.currentLessonIdentityId
      ?? (progress.currentLessonId ? identityByLegacyLessonId.get(progress.currentLessonId) ?? null : null);

    await db
      .update(userCourseProgress)
      .set({
        courseDefinitionId,
        currentLessonIdentityId,
        completedLessonIdentityIds: JSON.stringify(mappedCompleted),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userCourseProgress.id, progress.id));
  }

  if (legacyLessonIds.length > 0 || lessonIdentityIds.length > 0) {
    const lessonProgressRows = await db
      .select()
      .from(userLessonProgress)
      .where(
        or(
          legacyLessonIds.length > 0 ? inArray(userLessonProgress.lessonId, legacyLessonIds) : undefined,
          lessonIdentityIds.length > 0 ? inArray(userLessonProgress.lessonIdentityId, lessonIdentityIds) : undefined,
        )!
      );

    for (const lessonProgress of lessonProgressRows) {
      const lessonIdentityId = lessonProgress.lessonIdentityId
        ?? (lessonProgress.lessonId ? identityByLegacyLessonId.get(lessonProgress.lessonId) ?? null : null);

      await db
        .update(userLessonProgress)
        .set({
          lessonIdentityId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userLessonProgress.id, lessonProgress.id));
    }
  }

  const [quizRevision] = await db
    .select()
    .from(courseRevisionQuizzes)
    .where(eq(courseRevisionQuizzes.courseRevisionId, currentRevision?.id ?? -1))
    .limit(1);

  const attemptRows = await db
    .select()
    .from(quizAttempts)
    .where(
      definition.legacyCourseId
        ? or(
            eq(quizAttempts.courseDefinitionId, courseDefinitionId),
            eq(quizAttempts.courseId, definition.legacyCourseId),
          )!
        : eq(quizAttempts.courseDefinitionId, courseDefinitionId)
    );

  for (const attempt of attemptRows) {
    await db
      .update(quizAttempts)
      .set({
        courseDefinitionId,
        courseRevisionId: currentRevision?.id ?? null,
        courseQuizRevisionId: quizRevision?.id ?? null,
      })
      .where(eq(quizAttempts.id, attempt.id));
  }

  const certificateRows = await db
    .select()
    .from(courseCertificates)
    .where(
      definition.legacyCourseId
        ? or(
            eq(courseCertificates.courseDefinitionId, courseDefinitionId),
            eq(courseCertificates.courseId, definition.legacyCourseId),
          )!
        : eq(courseCertificates.courseDefinitionId, courseDefinitionId)
    );

  for (const certificate of certificateRows) {
    await db
      .update(courseCertificates)
      .set({
        courseDefinitionId,
        courseRevisionId: currentRevision?.id ?? null,
      })
      .where(eq(courseCertificates.id, certificate.id));
  }
}

async function maybeNotifyIndexNow(urls: string[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) {
    return;
  }

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList: urls,
      }),
    });

    if (!response.ok) {
      console.warn(`IndexNow submission failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn("IndexNow submission failed:", error);
  }
}

async function applyLessonRekeys(courseDefinitionId: number, rekeys: LessonRekey[]) {
  if (rekeys.length === 0) {
    return;
  }

  for (const rekey of rekeys) {
    const existingIdentities = await getLessonIdentitiesForCourse(courseDefinitionId);
    const identityByKey = new Map(existingIdentities.map((identity) => [identity.key, identity]));

    if (identityByKey.has(rekey.toKey)) {
      continue;
    }

    const identity = identityByKey.get(rekey.fromKey);
    if (!identity) {
      throw new Error(`Cannot apply rekey "${rekey.fromKey}" -> "${rekey.toKey}" because the source key does not exist.`);
    }

    await db
      .update(courseLessonIdentities)
      .set({
        key: rekey.toKey,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseLessonIdentities.id, identity.id));
  }
}

function buildRevisionPayload(coursePackage: LoadedCoursePackage) {
  return {
    manifest: {
      ...coursePackage.manifest,
      rekeys: [],
    },
    lessons: coursePackage.lessons.map((lesson) => ({
      key: lesson.key,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      duration: lesson.duration,
      orderIndex: lesson.orderIndex,
      isRequired: lesson.isRequired,
      contentFile: lesson.contentFile,
      videoUrl: lesson.videoUrl,
      documentUrl: lesson.documentUrl,
      legacyLessonId: lesson.legacyLessonId,
      indexable: lesson.indexable,
      seoTitle: lesson.seoTitle,
      seoDescription: lesson.seoDescription,
      searchSummary: lesson.searchSummary,
      sourceMarkdown: lesson.sourceMarkdown,
      renderedHtml: lesson.renderedHtml,
    })),
    quiz: coursePackage.quiz,
  };
}

async function syncCoursePackage(coursePackage: LoadedCoursePackage) {
  const definition = await upsertCourseDefinition(coursePackage);
  await applyLessonRekeys(definition.id, coursePackage.manifest.rekeys);

  const revisionPayload = buildRevisionPayload(coursePackage);
  const contentHash = computeContentHash(revisionPayload);

  const [currentRevision] = await db
    .select()
    .from(courseRevisions)
    .where(eq(courseRevisions.courseDefinitionId, definition.id))
    .orderBy(desc(courseRevisions.revisionNumber))
    .limit(1);

  const [matchingRevision] = currentRevision?.contentHash === contentHash
    ? [currentRevision]
    : await db
      .select()
      .from(courseRevisions)
      .where(
        and(
          eq(courseRevisions.courseDefinitionId, definition.id),
          eq(courseRevisions.contentHash, contentHash),
        ),
      )
      .limit(1);

  if (matchingRevision) {
    const revisionIsComplete = await revisionMatchesPackage(matchingRevision.id, coursePackage);

    if (!revisionIsComplete) {
      console.warn(
        `[${coursePackage.manifest.slug}] revision ${matchingRevision.id} matched content hash but is incomplete; repairing it in place.`,
      );

      const publishedLessonIds = await syncRevisionContent(definition.id, matchingRevision.id, coursePackage);

      await db
        .update(courseDefinitions)
        .set({
          legacyCourseId: coursePackage.manifest.legacyCourseId ?? definition.legacyCourseId ?? null,
          currentPublishedRevisionId: matchingRevision.id,
          sourcePath: path.relative(ROOT_DIR, path.join(CONTENT_ROOT, coursePackage.directory)),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(courseDefinitions.id, definition.id));

      if (!SKIP_LEGACY_PROGRESS_SYNC) {
        await syncLegacyProgressMappings(definition.id);
      }

      if (coursePackage.manifest.isPublished) {
        const lessonUrls = publishedLessonIds
          .map((lessonId, index) => ({ lessonId, lesson: coursePackage.lessons[index] }))
          .filter(({ lesson }) => lesson.indexable !== false)
          .map(({ lessonId }) => `${SITE_URL}/recursos/guias-estudio/${coursePackage.manifest.slug}/leccion/${lessonId}`);

        await maybeNotifyIndexNow([
          ...(coursePackage.manifest.indexable === false
            ? []
            : [`${SITE_URL}/recursos/guias-estudio/${coursePackage.manifest.slug}`]),
          ...lessonUrls,
        ]);
      }

      return { status: "repaired", definitionId: definition.id, revisionId: matchingRevision.id };
    }

    await db
      .update(courseDefinitions)
      .set({
        legacyCourseId: coursePackage.manifest.legacyCourseId ?? definition.legacyCourseId ?? null,
        currentPublishedRevisionId: matchingRevision.id,
        sourcePath: path.relative(ROOT_DIR, path.join(CONTENT_ROOT, coursePackage.directory)),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseDefinitions.id, definition.id));

    if (!SKIP_LEGACY_PROGRESS_SYNC) {
      await syncLegacyProgressMappings(definition.id);
    }
    return {
      status: matchingRevision.id === currentRevision?.id ? "unchanged" : "reused",
      definitionId: definition.id,
      revisionId: matchingRevision.id,
    };
  }

  const revisionNumber = (currentRevision?.revisionNumber ?? 0) + 1;
  const [revision] = await db
    .insert(courseRevisions)
    .values({
      courseDefinitionId: definition.id,
      revisionNumber,
      contentHash,
      title: coursePackage.manifest.title,
      description: coursePackage.manifest.description,
      excerpt: coursePackage.manifest.excerpt,
      category: coursePackage.manifest.category,
      level: coursePackage.manifest.level,
      duration: coursePackage.manifest.duration,
      thumbnailUrl: coursePackage.manifest.thumbnailUrl,
      videoUrl: coursePackage.manifest.videoUrl,
      orderIndex: coursePackage.manifest.orderIndex,
      isPublished: coursePackage.manifest.isPublished,
      isFeatured: coursePackage.manifest.isFeatured,
      requiresAuth: coursePackage.manifest.requiresAuth,
      authorId: coursePackage.manifest.authorId ?? null,
      legacyCourseId: coursePackage.manifest.legacyCourseId ?? definition.legacyCourseId ?? null,
      seoTitle: coursePackage.manifest.seoTitle ?? null,
      seoDescription: coursePackage.manifest.seoDescription ?? null,
      searchSummary: coursePackage.manifest.searchSummary ?? null,
      ogImageUrl: coursePackage.manifest.ogImageUrl ?? null,
      lastReviewedAt: coursePackage.manifest.lastReviewedAt ?? null,
      indexable: coursePackage.manifest.indexable ?? true,
      publishedAt: new Date().toISOString(),
    })
    .returning();

  const publishedLessonIds = await syncRevisionContent(definition.id, revision.id, coursePackage);

  await db
    .update(courseDefinitions)
    .set({
      legacyCourseId: coursePackage.manifest.legacyCourseId ?? definition.legacyCourseId ?? null,
      currentPublishedRevisionId: revision.id,
      sourcePath: path.relative(ROOT_DIR, path.join(CONTENT_ROOT, coursePackage.directory)),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(courseDefinitions.id, definition.id));

  if (!SKIP_LEGACY_PROGRESS_SYNC) {
    await syncLegacyProgressMappings(definition.id);
  }

  if (coursePackage.manifest.isPublished) {
    const lessonUrls = publishedLessonIds
      .map((lessonId, index) => ({ lessonId, lesson: coursePackage.lessons[index] }))
      .filter(({ lesson }) => lesson.indexable !== false)
      .map(({ lessonId }) => `${SITE_URL}/recursos/guias-estudio/${coursePackage.manifest.slug}/leccion/${lessonId}`);

    await maybeNotifyIndexNow([
      ...(coursePackage.manifest.indexable === false
        ? []
        : [`${SITE_URL}/recursos/guias-estudio/${coursePackage.manifest.slug}`]),
      ...lessonUrls,
    ]);
  }

  return { status: "published", definitionId: definition.id, revisionId: revision.id };
}

async function syncPackages(targetSlug?: string) {
  const packages = await validatePackages(targetSlug);
  const results = [];

  for (const coursePackage of packages) {
    const result = await syncCoursePackage(coursePackage);
    results.push({ slug: coursePackage.manifest.slug, ...result });
  }

  console.table(results);
}

async function auditPackages(targetSlug?: string) {
  const packages = await validatePackages(targetSlug);
  const issues: AuditIssue[] = [];
  const packageLessonTotal = packages.reduce((sum, coursePackage) => sum + coursePackage.lessons.length, 0);
  let publishedDefinitions = 0;
  let publishedLessonTotal = 0;

  if (!targetSlug) {
    const legacyCourseRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.isPublished, true));

    const legacyCourseCount = Number(legacyCourseRows[0]?.count || 0);
    if (legacyCourseCount !== packages.length) {
      issues.push({
        slug: "global",
        message: `File-first package count ${packages.length} does not match legacy published course count ${legacyCourseCount}.`,
      });
    }
  }

  for (const coursePackage of packages) {
    const legacyCourseId = coursePackage.manifest.legacyCourseId;
    const legacyCourse = await getLegacyCourseMetrics(legacyCourseId ?? null);

    if (!legacyCourse) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Missing legacy course for legacyCourseId ${legacyCourseId ?? "null"}.`,
      });
      continue;
    }

    const legacyLessons = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, legacyCourse.id))
      .orderBy(asc(courseLessons.orderIndex));

    const requiresLegacyLessonParity = coursePackage.lessons.every((lesson) => Boolean(lesson.legacyLessonId));

    if (requiresLegacyLessonParity && legacyLessons.length !== coursePackage.lessons.length) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Lesson count mismatch: package has ${coursePackage.lessons.length}, legacy has ${legacyLessons.length}.`,
      });
    }

    if (requiresLegacyLessonParity) {
      for (let index = 0; index < Math.min(legacyLessons.length, coursePackage.lessons.length); index += 1) {
        const packageLesson = coursePackage.lessons[index];
        const legacyLesson = legacyLessons[index];

        if (packageLesson.legacyLessonId !== legacyLesson.id) {
          issues.push({
            slug: coursePackage.manifest.slug,
            message: `Lesson ${index + 1} legacyLessonId mismatch: package has ${packageLesson.legacyLessonId}, legacy has ${legacyLesson.id}.`,
          });
        }

        if (packageLesson.orderIndex !== legacyLesson.orderIndex) {
          issues.push({
            slug: coursePackage.manifest.slug,
            message: `Lesson ${packageLesson.title} orderIndex mismatch: package has ${packageLesson.orderIndex}, legacy has ${legacyLesson.orderIndex}.`,
          });
        }
      }
    }

    if (!requiresLegacyLessonParity && coursePackage.manifest.legacyCourseId && legacyLessons.length === 0) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Legacy course ${coursePackage.manifest.legacyCourseId} has no lessons to compare against.`,
      });
    }

    const [legacyQuiz] = await db
      .select()
      .from(courseQuizzes)
      .where(eq(courseQuizzes.courseId, legacyCourse.id))
      .limit(1);

    if (Boolean(coursePackage.quiz) !== Boolean(legacyQuiz)) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Quiz presence mismatch between package and legacy course.`,
      });
    }

    const definition = await getCourseDefinitionBySlug(coursePackage.manifest.slug);
    if (!definition) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: "Missing course_definition row.",
      });
      continue;
    }

    if ((definition.viewCount ?? 0) < (legacyCourse.viewCount ?? 0)) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Definition viewCount ${definition.viewCount ?? 0} is behind legacy viewCount ${legacyCourse.viewCount ?? 0}.`,
      });
    }

    if (!definition.currentPublishedRevisionId) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: "Missing current published revision.",
      });
      continue;
    }

    publishedDefinitions += 1;

    const [currentRevision] = await db
      .select()
      .from(courseRevisions)
      .where(eq(courseRevisions.id, definition.currentPublishedRevisionId))
      .limit(1);

    if (!currentRevision) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Current published revision ${definition.currentPublishedRevisionId} was not found.`,
      });
      continue;
    }

    if (currentRevision.isPublished !== coursePackage.manifest.isPublished) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Revision isPublished=${currentRevision.isPublished} does not match manifest isPublished=${coursePackage.manifest.isPublished}.`,
      });
    }

    if ((currentRevision.indexable ?? true) !== (coursePackage.manifest.indexable ?? true)) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Revision indexable=${currentRevision.indexable ?? true} does not match manifest indexable=${coursePackage.manifest.indexable ?? true}.`,
      });
    }

    const revisionLessons = await db
      .select()
      .from(courseRevisionLessons)
      .where(eq(courseRevisionLessons.courseRevisionId, currentRevision.id))
      .orderBy(asc(courseRevisionLessons.orderIndex));

    publishedLessonTotal += revisionLessons.length;

    if (revisionLessons.length !== coursePackage.lessons.length) {
      issues.push({
        slug: coursePackage.manifest.slug,
        message: `Published lesson count mismatch: revision has ${revisionLessons.length}, package has ${coursePackage.lessons.length}.`,
      });
    }

    const identities = await getLessonIdentitiesForCourse(definition.id);
    const identityByLegacyLessonId = new Map(
      identities
        .filter((identity) => identity.legacyLessonId)
        .map((identity) => [identity.legacyLessonId!, identity]),
    );

    for (const lesson of coursePackage.lessons) {
      if (!lesson.legacyLessonId) {
        continue;
      }

      const identity = identityByLegacyLessonId.get(lesson.legacyLessonId);
      if (!identity) {
        issues.push({
          slug: coursePackage.manifest.slug,
          message: `No lesson identity found for legacyLessonId ${lesson.legacyLessonId}.`,
        });
        continue;
      }

      if (identity.key !== lesson.key) {
        issues.push({
          slug: coursePackage.manifest.slug,
          message: `Identity key mismatch for legacyLessonId ${lesson.legacyLessonId}: persisted "${identity.key}", manifest "${lesson.key}".`,
        });
      }
    }
  }

  if (publishedDefinitions !== packages.length) {
    issues.push({
      slug: "global",
      message: `Published definition coverage ${publishedDefinitions}/${packages.length} is incomplete.`,
    });
  }

  if (publishedLessonTotal !== packageLessonTotal) {
    issues.push({
      slug: "global",
      message: `Published lesson total ${publishedLessonTotal} does not match package lesson total ${packageLessonTotal}.`,
    });
  }

  const definitionRows = await db
    .select({
      id: courseDefinitions.id,
      slug: courseDefinitions.slug,
      legacyCourseId: courseDefinitions.legacyCourseId,
    })
    .from(courseDefinitions);

  for (const definition of definitionRows) {
    if (definition.legacyCourseId) {
      continue;
    }

    const [legacyCollision] = await db
      .select({
        id: courses.id,
        slug: courses.slug,
      })
      .from(courses)
      .where(eq(courses.id, definition.id))
      .limit(1);

    if (legacyCollision && legacyCollision.slug !== definition.slug) {
      issues.push({
        slug: definition.slug,
        message: `Definition id ${definition.id} collides with legacy course id ${legacyCollision.id} (${legacyCollision.slug}).`,
      });
    }
  }

  const lessonIdentityRows = await db
    .select({
      id: courseLessonIdentities.id,
      key: courseLessonIdentities.key,
      legacyLessonId: courseLessonIdentities.legacyLessonId,
    })
    .from(courseLessonIdentities);

  for (const identity of lessonIdentityRows) {
    if (identity.legacyLessonId) {
      continue;
    }

    const [legacyCollision] = await db
      .select({
        id: courseLessons.id,
        title: courseLessons.title,
      })
      .from(courseLessons)
      .where(eq(courseLessons.id, identity.id))
      .limit(1);

    if (legacyCollision && legacyCollision.id !== identity.legacyLessonId) {
      issues.push({
        slug: "global",
        message: `Lesson identity id ${identity.id} (${identity.key}) collides with legacy lesson id ${legacyCollision.id} (${legacyCollision.title}).`,
      });
    }
  }

  if (issues.length > 0) {
    throw new Error(issues.map(formatIssue).join("\n"));
  }

  console.log(
    `Audit passed for ${packages.length} courses, ${packageLessonTotal} lessons, ${publishedDefinitions} published definitions.`,
  );
}

async function main() {
  const command = process.argv[2];
  const slug = getSlugArg();
  const allowOverwrite = hasFlag("--allow-overwrite");

  if (!command) {
    throw new Error("Usage: tsx scripts/courses-cli.ts <export-current|validate|sync|audit> [--slug=<slug>] [--allow-overwrite]");
  }

  if (command === "export-current") {
    await exportCurrentCourses(slug, allowOverwrite);
    return;
  }

  if (command === "validate") {
    await validatePackages(slug);
    return;
  }

  if (command === "sync") {
    await syncPackages(slug);
    return;
  }

  if (command === "audit") {
    await auditPackages(slug);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).then(() => {
  process.exit(0);
});
