/**
 * Courses domain.
 *
 * v1 had 15 tables for courses including a speculative versioning
 * system (courseDefinitions / courseRevisions / *RevisionLessons /
 * etc.) that was never meaningfully used. Here we consolidate to 6:
 *   - courses
 *   - course_lessons
 *   - course_quizzes
 *   - course_quiz_questions
 *   - user_course_progress (also tracks lesson + quiz state)
 *   - course_certificates
 *
 * Lesson + quiz CONTENT lives as MDX in `content/courses/<slug>/`.
 * The DB row holds metadata + ordering + author intent.
 */
import { sql } from 'drizzle-orm';
import { boolean, index, integer, json, pgTable, real, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const courses = pgTable(
  'courses',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    coverImageUrl: text('cover_image_url'),
    /** 'beginner' | 'intermediate' | 'advanced' */
    difficulty: text('difficulty').notNull().default('beginner'),
    estimatedHours: real('estimated_hours'),
    /** 'draft' | 'published' | 'archived' */
    status: text('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('courses_slug_unique').on(t.slug),
    index('courses_status_idx').on(t.status, t.publishedAt.desc()),
  ],
);

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export const courseLessons = pgTable(
  'course_lessons',
  {
    id: serial('id').primaryKey(),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    /** MDX file relative to content/courses/<course-slug>/. Server resolves at runtime. */
    contentPath: text('content_path').notNull(),
    /** Display order within the course. */
    orderIndex: integer('order_index').notNull(),
    estimatedMinutes: integer('estimated_minutes'),
    isPublished: boolean('is_published').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('course_lessons_course_slug_unique').on(t.courseId, t.slug),
    index('course_lessons_course_order_idx').on(t.courseId, t.orderIndex),
  ],
);

export type CourseLesson = typeof courseLessons.$inferSelect;
export type NewCourseLesson = typeof courseLessons.$inferInsert;

export const courseQuizzes = pgTable(
  'course_quizzes',
  {
    id: serial('id').primaryKey(),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    /** Optional: lesson this quiz belongs to. Null = end-of-course quiz. */
    lessonId: integer('lesson_id').references(() => courseLessons.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    /** Percent of correct answers required to pass. 0-100. */
    passingScore: integer('passing_score').notNull().default(70),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('course_quizzes_course_idx').on(t.courseId)],
);

export type CourseQuiz = typeof courseQuizzes.$inferSelect;
export type NewCourseQuiz = typeof courseQuizzes.$inferInsert;

export const courseQuizQuestions = pgTable(
  'course_quiz_questions',
  {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => courseQuizzes.id, { onDelete: 'cascade' }),
    /** 'single_choice' | 'multiple_choice' | 'true_false' | 'text' */
    kind: text('kind').notNull(),
    prompt: text('prompt').notNull(),
    /** Choices + correctness. Shape: [{ id, label, isCorrect }] */
    choices: json('choices'),
    /** Free-text expected answer for kind='text'. */
    expectedAnswer: text('expected_answer'),
    explanation: text('explanation'),
    orderIndex: integer('order_index').notNull(),
  },
  (t) => [index('course_quiz_questions_quiz_idx').on(t.quizId, t.orderIndex)],
);

export type CourseQuizQuestion = typeof courseQuizQuestions.$inferSelect;
export type NewCourseQuizQuestion = typeof courseQuizQuestions.$inferInsert;

/**
 * Per-user course progression. One row per (user, course); evolves as
 * the user advances. lessonsCompleted / quizzesPassed are JSON arrays
 * of ids — fine at this scale (most courses have <20 lessons), and
 * cheap to read into the dashboard in one query.
 */
export const userCourseProgress = pgTable(
  'user_course_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    /** 'enrolled' | 'in_progress' | 'completed' | 'abandoned' */
    status: text('status').notNull().default('enrolled'),
    /** [lessonId, ...] — completed lessons, ordered by completion. */
    lessonsCompleted: json('lessons_completed').notNull().default(sql`'[]'::json`),
    /** [quizId, ...] — quizzes passed. */
    quizzesPassed: json('quizzes_passed').notNull().default(sql`'[]'::json`),
    /** Latest progress percentage shown in the UI (0-100). */
    progressPct: integer('progress_pct').notNull().default(0),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('user_course_progress_user_course_unique').on(t.userId, t.courseId),
    index('user_course_progress_user_status_idx').on(t.userId, t.status),
  ],
);

export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type NewUserCourseProgress = typeof userCourseProgress.$inferInsert;

/**
 * Issued certificates. One row per (user, course) on completion. The
 * issued_at timestamp + a deterministic verification_code form the
 * public-shareable record (verifiable at /verificar-certificado/CODE).
 */
export const courseCertificates = pgTable(
  'course_certificates',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'restrict' }),
    /** Public-shareable URL slug. Random hex; never derived from user data. */
    verificationCode: text('verification_code').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('course_certificates_code_unique').on(t.verificationCode),
    uniqueIndex('course_certificates_user_course_unique').on(t.userId, t.courseId),
  ],
);

export type CourseCertificate = typeof courseCertificates.$inferSelect;
export type NewCourseCertificate = typeof courseCertificates.$inferInsert;
