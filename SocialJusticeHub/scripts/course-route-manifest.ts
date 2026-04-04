import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "./db-neon";
import {
  courseManifestSchema,
  ensureCourseManifestDefaults,
} from "../shared/course-content";

dotenv.config();

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT_DIR, "content", "courses");

const {
  courseDefinitions,
  courseRevisions,
  courseLessonIdentities,
  courseRevisionLessons,
  courseRevisionQuizzes,
} = schema;

export interface CourseRouteManifestLesson {
  id: number;
  key: string;
  slug: string;
  path: string;
  indexable: boolean;
}

export interface CourseRouteManifestCourse {
  definitionId: number;
  revisionId: number;
  slug: string;
  path: string;
  indexable: boolean;
  hasQuiz: boolean;
  quizPath: string | null;
  lessons: CourseRouteManifestLesson[];
}

export interface CourseRouteManifest {
  generatedAt: string;
  hubPath: string;
  courseCount: number;
  lessonCount: number;
  quizCount: number;
  totalRouteCount: number;
  courses: CourseRouteManifestCourse[];
}

async function listCourseDirectories() {
  const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function getOutArg() {
  const outArg = process.argv.find((arg) => arg.startsWith("--out="));
  return outArg?.slice("--out=".length);
}

export async function buildCourseRouteManifest(): Promise<CourseRouteManifest> {
  const directories = await listCourseDirectories();
  const courses: CourseRouteManifestCourse[] = [];

  for (const directory of directories) {
    const manifestPath = path.join(CONTENT_ROOT, directory, "course.json");
    const manifestRaw = await fs.readFile(manifestPath, "utf8");
    const manifest = ensureCourseManifestDefaults(courseManifestSchema.parse(JSON.parse(manifestRaw)));

    if (!manifest.isPublished) {
      continue;
    }

    const [definition] = await db
      .select()
      .from(courseDefinitions)
      .where(eq(courseDefinitions.slug, manifest.slug))
      .limit(1);

    if (!definition?.currentPublishedRevisionId) {
      continue;
    }

    const [revision] = await db
      .select()
      .from(courseRevisions)
      .where(eq(courseRevisions.id, definition.currentPublishedRevisionId))
      .limit(1);

    if (!revision?.isPublished) {
      continue;
    }

    const revisionLessons = await db
      .select({
        identity: courseLessonIdentities,
        lesson: courseRevisionLessons,
      })
      .from(courseRevisionLessons)
      .innerJoin(
        courseLessonIdentities,
        eq(courseLessonIdentities.id, courseRevisionLessons.lessonIdentityId),
      )
      .where(eq(courseRevisionLessons.courseRevisionId, revision.id))
      .orderBy(asc(courseRevisionLessons.orderIndex));

    const [quiz] = await db
      .select()
      .from(courseRevisionQuizzes)
      .where(eq(courseRevisionQuizzes.courseRevisionId, revision.id))
      .limit(1);

    courses.push({
      definitionId: definition.id,
      revisionId: revision.id,
      slug: manifest.slug,
      path: `/recursos/guias-estudio/${manifest.slug}`,
      indexable: revision.indexable !== false,
      hasQuiz: Boolean(quiz),
      quizPath: quiz ? `/recursos/guias-estudio/${manifest.slug}/quiz` : null,
      lessons: revisionLessons.map(({ identity, lesson }) => ({
        id: identity.legacyLessonId ?? identity.id,
        key: identity.key,
        slug: manifest.slug,
        path: `/recursos/guias-estudio/${manifest.slug}/leccion/${identity.legacyLessonId ?? identity.id}`,
        indexable: lesson.indexable !== false,
      })),
    });
  }

  const lessonCount = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const quizCount = courses.filter((course) => course.hasQuiz).length;

  return {
    generatedAt: new Date().toISOString(),
    hubPath: "/recursos/guias-estudio",
    courseCount: courses.length,
    lessonCount,
    quizCount,
    totalRouteCount: 1 + courses.length + lessonCount + quizCount,
    courses,
  };
}

async function main() {
  const manifest = await buildCourseRouteManifest();
  const outPath = getOutArg();

  if (outPath) {
    const absoluteOutPath = path.resolve(ROOT_DIR, outPath);
    await fs.mkdir(path.dirname(absoluteOutPath), { recursive: true });
    await fs.writeFile(absoluteOutPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`Wrote course route manifest to ${absoluteOutPath}`);
    return;
  }

  console.log(JSON.stringify(manifest, null, 2));
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  }).then(() => {
    process.exit(0);
  });
}
