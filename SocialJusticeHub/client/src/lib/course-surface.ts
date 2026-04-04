export interface CourseSurfaceLesson {
  id: number;
  orderIndex: number;
  isRequired: boolean;
}

interface LessonAccessContext {
  lessons: CourseSurfaceLesson[];
  completedLessonIds: number[];
  requiresAuth: boolean;
  isLoggedIn: boolean;
}

interface ContinueLessonContext extends LessonAccessContext {
  currentLessonId?: number | null;
}

export function parseCompletedLessonIds(...values: unknown[]): number[] {
  const completed = new Set<number>();

  for (const value of values) {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === "number") {
          completed.add(entry);
        }
      });
      continue;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          parsed.forEach((entry) => {
            if (typeof entry === "number") {
              completed.add(entry);
            }
          });
        }
      } catch {
        continue;
      }
    }
  }

  return Array.from(completed);
}

export function isLessonLocked(
  lesson: CourseSurfaceLesson,
  context: LessonAccessContext,
): boolean {
  if (context.requiresAuth && !context.isLoggedIn) {
    return true;
  }

  const completed = new Set(context.completedLessonIds);
  const priorRequiredLessons = context.lessons.filter(
    (entry) => entry.orderIndex < lesson.orderIndex && entry.isRequired,
  );

  return priorRequiredLessons.some((entry) => !completed.has(entry.id));
}

export function getContinueLessonId(context: ContinueLessonContext): number | null {
  if (context.lessons.length === 0) {
    return null;
  }

  const sortedLessons = [...context.lessons].sort((left, right) => left.orderIndex - right.orderIndex);
  const completed = new Set(context.completedLessonIds);

  if (context.currentLessonId) {
    const currentLesson = sortedLessons.find((entry) => entry.id === context.currentLessonId);
    if (currentLesson && !isLessonLocked(currentLesson, context)) {
      return currentLesson.id;
    }
  }

  const firstUnlockedIncomplete = sortedLessons.find(
    (entry) => !completed.has(entry.id) && !isLessonLocked(entry, context),
  );
  if (firstUnlockedIncomplete) {
    return firstUnlockedIncomplete.id;
  }

  const firstUnlockedLesson = sortedLessons.find((entry) => !isLessonLocked(entry, context));
  return firstUnlockedLesson?.id ?? sortedLessons[0]?.id ?? null;
}

export function getNextUnlockedLessonId(
  lessonId: number,
  context: LessonAccessContext,
): number | null {
  const sortedLessons = [...context.lessons].sort((left, right) => left.orderIndex - right.orderIndex);
  const currentIndex = sortedLessons.findIndex((entry) => entry.id === lessonId);
  if (currentIndex === -1) {
    return null;
  }

  for (let index = currentIndex + 1; index < sortedLessons.length; index += 1) {
    const candidate = sortedLessons[index];
    if (!isLessonLocked(candidate, context)) {
      return candidate.id;
    }
  }

  return null;
}

export function areRequiredLessonsComplete(
  lessons: CourseSurfaceLesson[],
  completedLessonIds: number[],
): boolean {
  const requiredLessons = lessons.filter((lesson) => lesson.isRequired);
  if (requiredLessons.length === 0) {
    return true;
  }

  const completed = new Set(completedLessonIds);
  return requiredLessons.every((lesson) => completed.has(lesson.id));
}
