/**
 * CoursesRepository — courses, lessons, quizzes, progress, certificates.
 */
import { and, asc, desc, eq } from 'drizzle-orm';

import {
  courseCertificates,
  courseLessons,
  courseQuizQuestions,
  courseQuizzes,
  courses,
  userCourseProgress,
} from '../schema/courses.js';

import type { Db } from '../client.js';
import type {
  Course,
  CourseCertificate,
  CourseLesson,
  CourseQuiz,
  CourseQuizQuestion,
  NewCourse,
  NewCourseCertificate,
  NewCourseLesson,
  NewCourseQuiz,
  NewCourseQuizQuestion,
  UserCourseProgress,
} from '../schema/courses.js';

export class CoursesRepository {
  constructor(private readonly db: Db) {}

  // ---------- Courses ----------

  async createCourse(input: NewCourse): Promise<Course> {
    const [row] = await this.db.insert(courses).values(input).returning();
    if (!row) throw new Error('Failed to insert course');
    return row;
  }

  async findCourseBySlug(slug: string): Promise<Course | undefined> {
    const [row] = await this.db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    return row;
  }

  async listPublishedCourses(): Promise<Course[]> {
    return this.db
      .select()
      .from(courses)
      .where(eq(courses.status, 'published'))
      .orderBy(desc(courses.publishedAt));
  }

  // ---------- Lessons ----------

  async createLesson(input: NewCourseLesson): Promise<CourseLesson> {
    const [row] = await this.db.insert(courseLessons).values(input).returning();
    if (!row) throw new Error('Failed to insert lesson');
    return row;
  }

  async listLessons(courseId: number): Promise<CourseLesson[]> {
    return this.db
      .select()
      .from(courseLessons)
      .where(and(eq(courseLessons.courseId, courseId), eq(courseLessons.isPublished, true)))
      .orderBy(asc(courseLessons.orderIndex));
  }

  async findLessonBySlug(courseId: number, slug: string): Promise<CourseLesson | undefined> {
    const [row] = await this.db
      .select()
      .from(courseLessons)
      .where(and(eq(courseLessons.courseId, courseId), eq(courseLessons.slug, slug)))
      .limit(1);
    return row;
  }

  // ---------- Quizzes ----------

  async createQuiz(input: NewCourseQuiz): Promise<CourseQuiz> {
    const [row] = await this.db.insert(courseQuizzes).values(input).returning();
    if (!row) throw new Error('Failed to insert quiz');
    return row;
  }

  async findQuiz(id: number): Promise<CourseQuiz | undefined> {
    const [row] = await this.db.select().from(courseQuizzes).where(eq(courseQuizzes.id, id)).limit(1);
    return row;
  }

  async listQuizzesForCourse(courseId: number): Promise<CourseQuiz[]> {
    return this.db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  async addQuizQuestion(input: NewCourseQuizQuestion): Promise<CourseQuizQuestion> {
    const [row] = await this.db.insert(courseQuizQuestions).values(input).returning();
    if (!row) throw new Error('Failed to insert quiz question');
    return row;
  }

  async listQuizQuestions(quizId: number): Promise<CourseQuizQuestion[]> {
    return this.db
      .select()
      .from(courseQuizQuestions)
      .where(eq(courseQuizQuestions.quizId, quizId))
      .orderBy(asc(courseQuizQuestions.orderIndex));
  }

  // ---------- Progress ----------

  async enrollUser(userId: number, courseId: number): Promise<UserCourseProgress> {
    const existing = await this.findProgress(userId, courseId);
    if (existing) return existing;
    const [row] = await this.db
      .insert(userCourseProgress)
      .values({ userId, courseId, status: 'enrolled' })
      .returning();
    if (!row) throw new Error('Failed to enroll user');
    return row;
  }

  async findProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined> {
    const [row] = await this.db
      .select()
      .from(userCourseProgress)
      .where(and(eq(userCourseProgress.userId, userId), eq(userCourseProgress.courseId, courseId)))
      .limit(1);
    return row;
  }

  async updateProgress(
    id: number,
    patch: Partial<Pick<UserCourseProgress, 'status' | 'lessonsCompleted' | 'quizzesPassed' | 'progressPct' | 'completedAt' | 'lastActivityAt'>>,
  ): Promise<UserCourseProgress | undefined> {
    const [row] = await this.db
      .update(userCourseProgress)
      .set(patch)
      .where(eq(userCourseProgress.id, id))
      .returning();
    return row;
  }

  // ---------- Certificates ----------

  async issueCertificate(input: NewCourseCertificate): Promise<CourseCertificate> {
    const [row] = await this.db.insert(courseCertificates).values(input).returning();
    if (!row) throw new Error('Failed to issue certificate');
    return row;
  }

  async findCertificateByCode(verificationCode: string): Promise<CourseCertificate | undefined> {
    const [row] = await this.db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.verificationCode, verificationCode))
      .limit(1);
    return row;
  }
}
