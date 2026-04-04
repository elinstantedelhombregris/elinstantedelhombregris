import {
  courseDefinitions,
  courseLessonIdentities,
  courseRevisionLessons,
  courseRevisionQuizQuestions,
  courseRevisionQuizzes,
  courseRevisions,
  courses,
  courseLessons,
  courseQuizzes,
  quizQuestions,
  type Course,
  type CourseDefinition,
  type CourseLesson,
  type CourseLessonIdentity,
  type CourseQuiz,
  type CourseRevision,
  type CourseRevisionLesson,
  type CourseRevisionQuiz,
  type CourseRevisionQuizQuestion,
  type QuizQuestion,
} from "@shared/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "./db";
import { deriveSearchSummary } from "@shared/course-content";

type PublishedCourseRecord = {
  definition: CourseDefinition;
  revision: CourseRevision;
};

function isPublicCourseRevision(revision: CourseRevision) {
  return revision.isPublished === true;
}

function getExternalCourseId(definition: CourseDefinition) {
  return definition.legacyCourseId ?? definition.id;
}

function getExternalLessonId(identity: CourseLessonIdentity) {
  return identity.legacyLessonId ?? identity.id;
}

function getExternalQuizId(quiz: CourseRevisionQuiz) {
  return quiz.legacyQuizId ?? quiz.id;
}

function getExternalQuestionId(question: CourseRevisionQuizQuestion) {
  return question.legacyQuestionId ?? question.id;
}

export async function hasPublishedCourseContent(): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseDefinitions)
    .where(sql`${courseDefinitions.currentPublishedRevisionId} is not null`);

  return Number(result[0]?.count || 0) > 0;
}

export function mapPublishedCourse(
  definition: CourseDefinition,
  revision: CourseRevision,
  extras?: { lessonCount?: number; hasQuiz?: boolean },
): Course & {
  courseDefinitionId?: number;
  legacyCourseId?: number | null;
  lessonCount?: number;
  hasQuiz?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  searchSummary?: string | null;
  ogImageUrl?: string | null;
  lastReviewedAt?: string | null;
  indexable?: boolean | null;
} {
  return {
    id: getExternalCourseId(definition),
    courseDefinitionId: definition.id,
    legacyCourseId: definition.legacyCourseId,
    title: revision.title,
    slug: definition.slug,
    description: revision.description,
    excerpt: revision.excerpt,
    category: revision.category,
    level: revision.level,
    duration: revision.duration,
    thumbnailUrl: revision.thumbnailUrl,
    videoUrl: revision.videoUrl,
    orderIndex: revision.orderIndex,
    isPublished: revision.isPublished,
    isFeatured: revision.isFeatured,
    requiresAuth: revision.requiresAuth,
    authorId: revision.authorId,
    viewCount: definition.viewCount ?? 0,
    createdAt: definition.createdAt,
    updatedAt: definition.updatedAt,
    lessonCount: extras?.lessonCount,
    hasQuiz: extras?.hasQuiz,
    seoTitle: revision.seoTitle,
    seoDescription: revision.seoDescription,
    searchSummary: revision.searchSummary,
    ogImageUrl: revision.ogImageUrl,
    lastReviewedAt: revision.lastReviewedAt,
    indexable: revision.indexable,
  };
}

export function mapPublishedLesson(
  identity: CourseLessonIdentity,
  lesson: CourseRevisionLesson,
  courseId: number,
): CourseLesson & {
  key?: string;
  lessonIdentityId?: number;
  legacyLessonId?: number | null;
  searchSummary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  indexable?: boolean | null;
} {
  return {
    id: getExternalLessonId(identity),
    lessonIdentityId: identity.id,
    legacyLessonId: identity.legacyLessonId,
    courseId,
    title: lesson.title,
    description: lesson.description,
    content: lesson.contentHtml,
    orderIndex: lesson.orderIndex,
    type: lesson.type,
    videoUrl: lesson.videoUrl,
    documentUrl: lesson.documentUrl,
    duration: lesson.duration,
    isRequired: lesson.isRequired,
    createdAt: lesson.createdAt,
    updatedAt: lesson.createdAt,
    key: identity.key,
    searchSummary: lesson.searchSummary,
    seoTitle: lesson.seoTitle,
    seoDescription: lesson.seoDescription,
    indexable: lesson.indexable,
  };
}

export function mapPublishedQuiz(
  courseId: number,
  quiz: CourseRevisionQuiz,
): CourseQuiz & { quizRevisionId?: number; legacyQuizId?: number | null } {
  return {
    id: getExternalQuizId(quiz),
    quizRevisionId: quiz.id,
    legacyQuizId: quiz.legacyQuizId,
    courseId,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    allowRetakes: quiz.allowRetakes,
    maxAttempts: quiz.maxAttempts,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}

export function mapPublishedQuizQuestion(
  question: CourseRevisionQuizQuestion,
  quizId: number,
): QuizQuestion & { quizQuestionRevisionId?: number; legacyQuestionId?: number | null } {
  return {
    id: getExternalQuestionId(question),
    quizQuestionRevisionId: question.id,
    legacyQuestionId: question.legacyQuestionId,
    quizId,
    question: question.question,
    type: question.type,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    points: question.points,
    orderIndex: question.orderIndex,
    createdAt: question.createdAt,
  };
}

async function getPublishedCourseRecordBySlug(slug: string): Promise<PublishedCourseRecord | undefined> {
  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.slug, slug))
    .limit(1);

  if (!definition?.currentPublishedRevisionId) {
    return undefined;
  }

  const [revision] = await db
    .select()
    .from(courseRevisions)
    .where(eq(courseRevisions.id, definition.currentPublishedRevisionId))
    .limit(1);

  if (!revision || !isPublicCourseRevision(revision)) return undefined;

  return { definition, revision };
}

async function getCurrentCourseRecordByDefinitionId(courseDefinitionId: number): Promise<PublishedCourseRecord | undefined> {
  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.id, courseDefinitionId))
    .limit(1);

  if (!definition?.currentPublishedRevisionId) {
    return undefined;
  }

  const [revision] = await db
    .select()
    .from(courseRevisions)
    .where(eq(courseRevisions.id, definition.currentPublishedRevisionId))
    .limit(1);

  if (!revision) return undefined;

  return { definition, revision };
}

export async function hasCurrentRevisionForCourseSlug(slug: string): Promise<boolean> {
  const [definition] = await db
    .select({ currentPublishedRevisionId: courseDefinitions.currentPublishedRevisionId })
    .from(courseDefinitions)
    .where(eq(courseDefinitions.slug, slug))
    .limit(1);

  return Boolean(definition?.currentPublishedRevisionId);
}

export async function hasCurrentRevisionForCourseId(courseId: number): Promise<boolean> {
  const [definitionByLegacy] = await db
    .select({ currentPublishedRevisionId: courseDefinitions.currentPublishedRevisionId })
    .from(courseDefinitions)
    .where(eq(courseDefinitions.legacyCourseId, courseId))
    .limit(1);

  if (definitionByLegacy?.currentPublishedRevisionId) {
    return true;
  }

  const directRecord = await getCurrentCourseRecordByDefinitionId(courseId);
  if (directRecord) {
    return true;
  }

  return false;
}

export async function resolvePublishedCourseDefinitionId(courseId: number): Promise<number | undefined> {
  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.legacyCourseId, courseId))
    .limit(1);

  if (!definition?.currentPublishedRevisionId) {
    const directRecord = await getCurrentCourseRecordByDefinitionId(courseId);
    return directRecord?.definition.id;
  }

  return definition.id;
}

async function getPublishedCourseRecordById(courseId: number): Promise<PublishedCourseRecord | undefined> {
  const definitionId = await resolvePublishedCourseDefinitionId(courseId);
  if (!definitionId) {
    return undefined;
  }

  const record = await getCurrentCourseRecordByDefinitionId(definitionId);
  if (!record || !isPublicCourseRevision(record.revision)) {
    return undefined;
  }

  return record;
}

export async function getPublishedCourseBySlug(slug: string) {
  const record = await getPublishedCourseRecordBySlug(slug);
  if (!record) return undefined;

  const lessons = await db
    .select({ id: courseRevisionLessons.id })
    .from(courseRevisionLessons)
    .where(eq(courseRevisionLessons.courseRevisionId, record.revision.id));

  const [quiz] = await db
    .select()
    .from(courseRevisionQuizzes)
    .where(eq(courseRevisionQuizzes.courseRevisionId, record.revision.id))
    .limit(1);

  return mapPublishedCourse(record.definition, record.revision, {
    lessonCount: lessons.length,
    hasQuiz: Boolean(quiz),
  });
}

export async function getPublishedCourseById(courseId: number) {
  const record = await getPublishedCourseRecordById(courseId);
  if (!record) return undefined;

  return mapPublishedCourse(record.definition, record.revision);
}

export async function incrementPublishedCourseView(courseId: number) {
  await db
    .update(courseDefinitions)
    .set({
      viewCount: sql`${courseDefinitions.viewCount} + 1`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(courseDefinitions.id, courseId));
}

export async function getPublishedCourses(filters?: {
  category?: string;
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  featured?: boolean;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 12;
  const offset = (page - 1) * limit;

  const conditions = [
    sql`${courseDefinitions.currentPublishedRevisionId} is not null`,
    eq(courseRevisions.isPublished, true),
  ];

  if (filters?.category) {
    conditions.push(eq(courseRevisions.category, filters.category as any));
  }
  if (filters?.level) {
    conditions.push(eq(courseRevisions.level, filters.level as any));
  }
  if (filters?.featured === true) {
    conditions.push(eq(courseRevisions.isFeatured, true));
  }
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(or(
      ilike(courseRevisions.title, searchTerm),
      ilike(courseRevisions.description, searchTerm),
      ilike(courseRevisions.searchSummary, searchTerm),
    )!);
  }

  const whereCondition = and(...conditions);

  const totalRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseDefinitions)
    .innerJoin(courseRevisions, eq(courseRevisions.id, courseDefinitions.currentPublishedRevisionId))
    .where(whereCondition);

  const total = Number(totalRows[0]?.count || 0);

  let orderByClause;
  if (filters?.sortBy === "popular") {
    orderByClause = [desc(courseDefinitions.viewCount), desc(courseRevisions.orderIndex)];
  } else if (filters?.sortBy === "recent") {
    orderByClause = [desc(courseRevisions.publishedAt), desc(courseDefinitions.createdAt)];
  } else if (filters?.sortBy === "duration") {
    orderByClause = [asc(courseRevisions.duration), desc(courseRevisions.orderIndex)];
  } else {
    orderByClause = [desc(courseRevisions.orderIndex), desc(courseRevisions.publishedAt)];
  }

  const rows = await db
    .select({
      definition: courseDefinitions,
      revision: courseRevisions,
      lessonCount: sql<number>`(
        select count(*)
        from ${courseRevisionLessons}
        where ${courseRevisionLessons.courseRevisionId} = ${courseRevisions.id}
      )`,
      hasQuiz: sql<boolean>`exists(
        select 1
        from ${courseRevisionQuizzes}
        where ${courseRevisionQuizzes.courseRevisionId} = ${courseRevisions.id}
      )`,
    })
    .from(courseDefinitions)
    .innerJoin(courseRevisions, eq(courseRevisions.id, courseDefinitions.currentPublishedRevisionId))
    .where(whereCondition)
    .orderBy(...orderByClause)
    .limit(limit)
    .offset(offset);

  return {
    courses: rows.map((row) =>
      mapPublishedCourse(row.definition, row.revision, {
        lessonCount: Number(row.lessonCount || 0),
        hasQuiz: Boolean(row.hasQuiz),
      }),
    ),
    total,
    page,
    limit,
  };
}

export async function getPublishedCourseWithLessons(courseId: number) {
  const record = await getPublishedCourseRecordById(courseId);
  if (!record) return undefined;
  const externalCourseId = getExternalCourseId(record.definition);

  const lessons = await db
    .select({
      identity: courseLessonIdentities,
      revisionLesson: courseRevisionLessons,
    })
    .from(courseRevisionLessons)
    .innerJoin(
      courseLessonIdentities,
      eq(courseLessonIdentities.id, courseRevisionLessons.lessonIdentityId),
    )
    .where(eq(courseRevisionLessons.courseRevisionId, record.revision.id))
    .orderBy(asc(courseRevisionLessons.orderIndex));

  return {
    course: mapPublishedCourse(record.definition, record.revision, {
      lessonCount: lessons.length,
    }),
    lessons: lessons.map((row) => mapPublishedLesson(row.identity, row.revisionLesson, externalCourseId)),
  };
}

export async function getPublishedCourseQuiz(courseId: number) {
  const record = await getPublishedCourseRecordById(courseId);
  if (!record) return undefined;

  const [quiz] = await db
    .select()
    .from(courseRevisionQuizzes)
    .where(eq(courseRevisionQuizzes.courseRevisionId, record.revision.id))
    .limit(1);

  if (!quiz) return undefined;

  const questions = await db
    .select()
    .from(courseRevisionQuizQuestions)
    .where(eq(courseRevisionQuizQuestions.quizRevisionId, quiz.id))
    .orderBy(asc(courseRevisionQuizQuestions.orderIndex));
  const externalCourseId = getExternalCourseId(record.definition);
  const externalQuizId = getExternalQuizId(quiz);

  return {
    quiz: mapPublishedQuiz(externalCourseId, quiz),
    questions: questions.map((question) => mapPublishedQuizQuestion(question, externalQuizId)),
    courseRevisionId: record.revision.id,
    quizRevisionId: quiz.id,
  };
}

export async function getPublishedLessonByIdentityId(lessonIdentityId: number) {
  const [identityByLegacy] = await db
    .select()
    .from(courseLessonIdentities)
    .where(eq(courseLessonIdentities.legacyLessonId, lessonIdentityId))
    .limit(1);

  const identity = identityByLegacy ?? (await db
    .select()
    .from(courseLessonIdentities)
    .where(eq(courseLessonIdentities.id, lessonIdentityId))
    .limit(1))[0];

  if (!identity?.courseDefinitionId) {
    return undefined;
  }

  const record = await getPublishedCourseRecordById(identity.courseDefinitionId);
  if (!record) return undefined;

  const [lesson] = await db
    .select()
    .from(courseRevisionLessons)
    .where(
      and(
        eq(courseRevisionLessons.courseRevisionId, record.revision.id),
        eq(courseRevisionLessons.lessonIdentityId, identity.id),
      ),
    )
    .limit(1);

  if (!lesson) return undefined;

  return {
    identity,
    lesson,
    courseDefinition: record.definition,
    courseRevision: record.revision,
    course: mapPublishedCourse(record.definition, record.revision),
  };
}

export async function getPublishedQuizByRevisionQuizId(quizRevisionId: number) {
  const [quiz] = await db
    .select()
    .from(courseRevisionQuizzes)
    .where(eq(courseRevisionQuizzes.id, quizRevisionId))
    .limit(1);

  if (!quiz?.courseRevisionId) return undefined;

  const [courseRevision] = await db
    .select()
    .from(courseRevisions)
    .where(eq(courseRevisions.id, quiz.courseRevisionId))
    .limit(1);

  if (!courseRevision?.courseDefinitionId) return undefined;

  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.id, courseRevision.courseDefinitionId))
    .limit(1);

  if (!definition) return undefined;

  const questions = await db
    .select()
    .from(courseRevisionQuizQuestions)
    .where(eq(courseRevisionQuizQuestions.quizRevisionId, quiz.id))
    .orderBy(asc(courseRevisionQuizQuestions.orderIndex));

  return {
    definition,
    revision: courseRevision,
    quiz,
    questions,
  };
}

export async function getCourseDefinitionIdByLegacyCourseId(legacyCourseId: number) {
  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.legacyCourseId, legacyCourseId))
    .limit(1);

  return definition?.id;
}

export async function getCourseExternalIdByDefinitionId(courseDefinitionId: number) {
  const [definition] = await db
    .select()
    .from(courseDefinitions)
    .where(eq(courseDefinitions.id, courseDefinitionId))
    .limit(1);

  return definition ? getExternalCourseId(definition) : undefined;
}

export async function getLessonIdentityIdByLegacyLessonId(legacyLessonId: number) {
  const [identity] = await db
    .select()
    .from(courseLessonIdentities)
    .where(eq(courseLessonIdentities.legacyLessonId, legacyLessonId))
    .limit(1);

  return identity?.id;
}

export async function getLessonExternalIdByIdentityId(lessonIdentityId: number) {
  const [identity] = await db
    .select()
    .from(courseLessonIdentities)
    .where(eq(courseLessonIdentities.id, lessonIdentityId))
    .limit(1);

  return identity ? getExternalLessonId(identity) : undefined;
}

export async function getCurrentRevisionForCourseDefinition(courseDefinitionId: number) {
  const record = await getCurrentCourseRecordByDefinitionId(courseDefinitionId);
  return record?.revision;
}

export async function getLegacyCourseById(courseId: number) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return course;
}

export async function getLegacyLessonById(lessonId: number) {
  const [lesson] = await db.select().from(courseLessons).where(eq(courseLessons.id, lessonId)).limit(1);
  return lesson;
}

export async function getLegacyCourseQuizByCourseId(courseId: number) {
  const [quiz] = await db
    .select()
    .from(courseQuizzes)
    .where(eq(courseQuizzes.courseId, courseId))
    .limit(1);

  if (!quiz) return undefined;

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(asc(quizQuestions.orderIndex));

  return { quiz, questions };
}

export function deriveCourseSummary(course: Pick<Course, "description" | "excerpt"> & { searchSummary?: string | null }) {
  return deriveSearchSummary(course.searchSummary, course.excerpt || course.description, 220);
}
