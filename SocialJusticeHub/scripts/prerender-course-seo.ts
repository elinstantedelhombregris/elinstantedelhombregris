import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "./db-neon";
import {
  buildCourseHubMetadata,
  buildCourseMetadata,
  buildLessonMetadata,
  buildLessonSummary,
  buildQuizMetadata,
  COURSE_HUB_PATH,
  DEFAULT_SITE_URL,
} from "../shared/course-seo";
import { deriveSearchSummary } from "../shared/course-content";

dotenv.config();

const {
  courseDefinitions,
  courseRevisions,
  courseLessonIdentities,
  courseRevisionLessons,
  courseRevisionQuizzes,
} = schema;

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const DIST_PUBLIC = path.join(ROOT_DIR, "dist", "public");
const SITE_URL = (
  [process.env.BASE_URL, process.env.CORS_ORIGIN, DEFAULT_SITE_URL]
    .find((value) => value && !/localhost|127\.0\.0\.1/.test(value))
  || process.env.BASE_URL
  || process.env.CORS_ORIGIN
  || DEFAULT_SITE_URL
).replace(/\/$/, "");

type PublishedCourseBundle = {
  course: any;
  lessons: Array<any>;
  quiz: any | null;
};

async function ensureDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(routePath: string) {
  return `${SITE_URL}${routePath}`;
}

function replaceTag(source: string, pattern: RegExp, replacement: string) {
  if (pattern.test(source)) {
    return source.replace(pattern, replacement);
  }
  return source;
}

function applySeoTemplate(template: string, metadata: ReturnType<typeof buildCourseHubMetadata>, bodyHtml: string) {
  let html = template
    .replace(/<link rel="canonical"[\s\S]*?\/>\s*/gi, "")
    .replace(/<meta (property|name)="og:[^"]+"[\s\S]*?\/>\s*/gi, "")
    .replace(/<meta name="twitter:[^"]+"[\s\S]*?\/>\s*/gi, "")
    .replace(/<script type="application\/ld\+json" data-seo-jsonld="true">[\s\S]*?<\/script>\s*/gi, "");
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  html = replaceTag(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = replaceTag(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
  );

  html = html.replace(
    /<\/head>/i,
    [
      `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`,
      `<meta property="og:title" content="${escapeHtml(metadata.ogTitle)}" />`,
      `<meta property="og:description" content="${escapeHtml(metadata.ogDescription)}" />`,
      `<meta property="og:type" content="${escapeHtml(metadata.ogType)}" />`,
      `<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />`,
      `<meta property="og:locale" content="${escapeHtml(metadata.locale)}" />`,
      metadata.ogImageUrl
        ? `<meta property="og:image" content="${escapeHtml(metadata.ogImageUrl)}" />`
        : "",
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${escapeHtml(metadata.ogTitle)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(metadata.ogDescription)}" />`,
      metadata.ogImageUrl
        ? `<meta name="twitter:image" content="${escapeHtml(metadata.ogImageUrl)}" />`
        : "",
      ...metadata.jsonLd.map(
        (entry) =>
          `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(entry)}</script>`,
      ),
      "</head>",
    ].filter(Boolean).join("\n"),
  );

  html = html.replace(
    /<div id="root"><\/div>/i,
    `<div id="root"><div data-prerendered="course-seo">${bodyHtml}</div></div>`,
  );

  return html;
}

function buildHubBody(courses: PublishedCourseBundle[]) {
  return `
    <main class="course-prerender" style="max-width:960px;margin:0 auto;padding:48px 20px 80px;">
      <header style="margin-bottom:32px;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;margin:0 0 12px;">Recursos</p>
        <h1 style="font-size:42px;line-height:1.1;color:#0f172a;margin:0 0 16px;">Rutas de Transformación</h1>
        <p style="font-size:18px;line-height:1.7;color:#334155;max-width:760px;margin:0;">
          Un mapa de cursos y lecciones para pensar con claridad, actuar con criterio y construir transformación real desde Argentina.
        </p>
      </header>
      <section>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:18px;">
          ${courses.map(({ course }) => `
            <li style="border:1px solid #cbd5e1;border-radius:20px;padding:20px;background:#fff;">
              <a href="${COURSE_HUB_PATH}/${course.slug}" style="text-decoration:none;color:inherit;">
                <h2 style="font-size:24px;line-height:1.3;margin:0 0 8px;color:#0f172a;">${escapeHtml(course.title)}</h2>
                <p style="margin:0 0 8px;color:#475569;line-height:1.7;">${escapeHtml(course.description)}</p>
                <p style="margin:0;color:#0f766e;font-size:14px;">${escapeHtml(deriveSearchSummary(course.searchSummary, course.excerpt || course.description, 180))}</p>
              </a>
            </li>
          `).join("")}
        </ul>
      </section>
    </main>
  `;
}

function buildCourseBody(bundle: PublishedCourseBundle) {
  const summary = deriveSearchSummary(bundle.course.searchSummary, bundle.course.excerpt || bundle.course.description, 220);

  return `
    <main class="course-prerender" style="max-width:960px;margin:0 auto;padding:48px 20px 80px;">
      <nav style="font-size:14px;margin-bottom:18px;">
        <a href="/recursos" style="color:#0f766e;text-decoration:none;">Recursos</a> /
        <a href="${COURSE_HUB_PATH}" style="color:#0f766e;text-decoration:none;">Rutas de Transformación</a>
      </nav>
      <header style="margin-bottom:28px;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;margin:0 0 12px;">Curso</p>
        <h1 style="font-size:42px;line-height:1.1;color:#0f172a;margin:0 0 16px;">${escapeHtml(bundle.course.title)}</h1>
        <p style="font-size:18px;line-height:1.7;color:#334155;margin:0 0 16px;">${escapeHtml(bundle.course.description)}</p>
        <div style="border:1px solid #99f6e4;background:#f0fdfa;border-radius:18px;padding:16px 18px;">
          <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;margin:0 0 8px;">En síntesis</p>
          <p style="font-size:15px;line-height:1.7;color:#134e4a;margin:0;">${escapeHtml(summary)}</p>
        </div>
      </header>
      <section style="margin-bottom:32px;">
        <ul style="display:flex;flex-wrap:wrap;gap:14px;list-style:none;padding:0;margin:0;color:#475569;font-size:14px;">
          <li><strong>Nivel:</strong> ${escapeHtml(bundle.course.level || "general")}</li>
          ${bundle.course.duration ? `<li><strong>Duración:</strong> ${bundle.course.duration} min</li>` : ""}
          <li><strong>Lecciones:</strong> ${bundle.lessons.length}</li>
          ${bundle.course.lastReviewedAt ? `<li><strong>Revisado:</strong> ${escapeHtml(new Date(bundle.course.lastReviewedAt).toLocaleDateString("es-AR"))}</li>` : ""}
        </ul>
      </section>
      <section>
        <h2 style="font-size:28px;line-height:1.3;color:#0f172a;margin:0 0 14px;">Lecciones</h2>
        <ol style="padding-left:20px;margin:0;display:grid;gap:12px;">
          ${bundle.lessons.map((lesson) => `
            <li style="padding-left:4px;">
              <a href="${COURSE_HUB_PATH}/${bundle.course.slug}/leccion/${lesson.id}" style="text-decoration:none;color:#0f766e;">
                <strong>${escapeHtml(lesson.title)}</strong>
              </a>
              <div style="color:#475569;line-height:1.7;">${escapeHtml(buildLessonSummary(lesson))}</div>
            </li>
          `).join("")}
        </ol>
      </section>
    </main>
  `;
}

function buildLessonBody(bundle: PublishedCourseBundle, lesson: any) {
  const summary = buildLessonSummary(lesson);

  return `
    <main class="course-prerender" style="max-width:860px;margin:0 auto;padding:48px 20px 80px;">
      <nav style="font-size:14px;margin-bottom:18px;">
        <a href="/recursos" style="color:#0f766e;text-decoration:none;">Recursos</a> /
        <a href="${COURSE_HUB_PATH}" style="color:#0f766e;text-decoration:none;">Rutas de Transformación</a> /
        <a href="${COURSE_HUB_PATH}/${bundle.course.slug}" style="color:#0f766e;text-decoration:none;">${escapeHtml(bundle.course.title)}</a>
      </nav>
      <header style="margin-bottom:28px;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0369a1;margin:0 0 12px;">Lección</p>
        <h1 style="font-size:38px;line-height:1.15;color:#0f172a;margin:0 0 16px;">${escapeHtml(lesson.title)}</h1>
        ${lesson.description ? `<p style="font-size:18px;line-height:1.7;color:#334155;margin:0 0 16px;">${escapeHtml(lesson.description)}</p>` : ""}
        <div style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:18px;padding:16px 18px;">
          <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0369a1;margin:0 0 8px;">En síntesis</p>
          <p style="font-size:15px;line-height:1.7;color:#0c4a6e;margin:0;">${escapeHtml(summary)}</p>
        </div>
      </header>
      <article class="prose" style="color:#0f172a;line-height:1.8;">
        ${lesson.content}
      </article>
    </main>
  `;
}

function buildQuizBody(bundle: PublishedCourseBundle) {
  return `
    <main class="course-prerender" style="max-width:860px;margin:0 auto;padding:48px 20px 80px;">
      <nav style="font-size:14px;margin-bottom:18px;">
        <a href="/recursos" style="color:#0f766e;text-decoration:none;">Recursos</a> /
        <a href="${COURSE_HUB_PATH}" style="color:#0f766e;text-decoration:none;">Rutas de Transformación</a> /
        <a href="${COURSE_HUB_PATH}/${bundle.course.slug}" style="color:#0f766e;text-decoration:none;">${escapeHtml(bundle.course.title)}</a>
      </nav>
      <h1 style="font-size:36px;line-height:1.15;color:#0f172a;margin:0 0 16px;">Quiz del curso</h1>
      <p style="font-size:18px;line-height:1.7;color:#334155;margin:0 0 16px;">
        Este quiz forma parte del recorrido de ${escapeHtml(bundle.course.title)} y se rinde desde la experiencia interactiva del curso.
      </p>
      <p style="margin:0;">
        <a href="${COURSE_HUB_PATH}/${bundle.course.slug}" style="color:#0f766e;text-decoration:none;">Volver al curso</a>
      </p>
    </main>
  `;
}

async function writeRouteHtml(routePath: string, html: string) {
  const routeDirectory = path.join(DIST_PUBLIC, routePath.replace(/^\//, ""));
  await ensureDirectory(routeDirectory);
  await fs.writeFile(path.join(routeDirectory, "index.html"), html, "utf8");
}

async function loadPublishedCourses(): Promise<PublishedCourseBundle[]> {
  const rows = await db
    .select({
      definition: courseDefinitions,
      revision: courseRevisions,
      lessonCount: sql<number>`(
        select count(*)
        from ${courseRevisionLessons}
        where ${courseRevisionLessons.courseRevisionId} = ${courseRevisions.id}
      )`,
    })
    .from(courseDefinitions)
    .innerJoin(courseRevisions, eq(courseRevisions.id, courseDefinitions.currentPublishedRevisionId))
    .where(eq(courseRevisions.isPublished, true))
    .orderBy(asc(courseRevisions.orderIndex), asc(courseDefinitions.slug));

  const bundles: PublishedCourseBundle[] = [];

  for (const row of rows) {
    const lessons = await db
      .select({
        identity: courseLessonIdentities,
        lesson: courseRevisionLessons,
      })
      .from(courseRevisionLessons)
      .innerJoin(courseLessonIdentities, eq(courseLessonIdentities.id, courseRevisionLessons.lessonIdentityId))
      .where(eq(courseRevisionLessons.courseRevisionId, row.revision.id))
      .orderBy(asc(courseRevisionLessons.orderIndex));

    const [quiz] = await db
      .select()
      .from(courseRevisionQuizzes)
      .where(eq(courseRevisionQuizzes.courseRevisionId, row.revision.id))
      .limit(1);

    bundles.push({
      course: {
        id: row.definition.id,
        slug: row.definition.slug,
        title: row.revision.title,
        description: row.revision.description,
        excerpt: row.revision.excerpt,
        category: row.revision.category,
        level: row.revision.level,
        duration: row.revision.duration,
        thumbnailUrl: row.revision.thumbnailUrl,
        ogImageUrl: row.revision.ogImageUrl,
        seoTitle: row.revision.seoTitle,
        seoDescription: row.revision.seoDescription,
        searchSummary: row.revision.searchSummary,
        lastReviewedAt: row.revision.lastReviewedAt,
        indexable: row.revision.indexable,
        lessonCount: Number(row.lessonCount || 0),
      },
      lessons: lessons.map(({ identity, lesson }) => ({
        id: identity.legacyLessonId ?? identity.id,
        key: identity.key,
        title: lesson.title,
        description: lesson.description,
        content: lesson.contentHtml,
        orderIndex: lesson.orderIndex,
        type: lesson.type,
        duration: lesson.duration,
        searchSummary: lesson.searchSummary,
        seoTitle: lesson.seoTitle,
        seoDescription: lesson.seoDescription,
        indexable: lesson.indexable,
      })),
      quiz: quiz ? { id: quiz.id, title: quiz.title } : null,
    });
  }

  return bundles;
}

async function writeSitemaps(bundles: PublishedCourseBundle[]) {
  const courseUrls = [
    {
      loc: absoluteUrl(COURSE_HUB_PATH),
      lastmod: new Date().toISOString(),
    },
    ...bundles.flatMap((bundle) => [
      ...(bundle.course.indexable === false
        ? []
        : [{
            loc: absoluteUrl(`${COURSE_HUB_PATH}/${bundle.course.slug}`),
            lastmod: bundle.course.lastReviewedAt || new Date().toISOString(),
          }]),
      ...bundle.lessons
        .filter((lesson) => lesson.indexable !== false)
        .map((lesson) => ({
        loc: absoluteUrl(`${COURSE_HUB_PATH}/${bundle.course.slug}/leccion/${lesson.id}`),
        lastmod: bundle.course.lastReviewedAt || new Date().toISOString(),
      })),
    ]),
  ];

  const courseSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${courseUrls
    .map(
      (entry) =>
        `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${absoluteUrl("/sitemap-courses.xml")}</loc>\n  </sitemap>\n</sitemapindex>\n`;

  await fs.writeFile(path.join(DIST_PUBLIC, "sitemap-courses.xml"), courseSitemap, "utf8");
  await fs.writeFile(path.join(DIST_PUBLIC, "sitemap.xml"), sitemapIndex, "utf8");
}

async function writeRobots() {
  const robots = [
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Disallow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `Sitemap: ${absoluteUrl("/sitemap-courses.xml")}`,
    "",
  ].join("\n");

  await fs.writeFile(path.join(DIST_PUBLIC, "robots.txt"), robots, "utf8");

  if (process.env.INDEXNOW_KEY) {
    await fs.writeFile(
      path.join(DIST_PUBLIC, `${process.env.INDEXNOW_KEY}.txt`),
      `${process.env.INDEXNOW_KEY}\n`,
      "utf8",
    );
  }
}

async function main() {
  if (/localhost|127\.0\.0\.1/.test(SITE_URL) && process.env.NODE_ENV === "production") {
    throw new Error(`Refusing to prerender production metadata with a localhost site URL: ${SITE_URL}`);
  }

  const templatePath = path.join(DIST_PUBLIC, "index.html");
  const template = await fs.readFile(templatePath, "utf8");
  const bundles = await loadPublishedCourses();
  let generatedRouteCount = 0;
  const expectedRouteCount = 1
    + bundles.length
    + bundles.reduce((sum, bundle) => sum + bundle.lessons.length, 0)
    + bundles.filter((bundle) => bundle.quiz).length;

  const hubMetadata = buildCourseHubMetadata(SITE_URL);
  await writeRouteHtml(COURSE_HUB_PATH, applySeoTemplate(template, hubMetadata, buildHubBody(bundles)));
  generatedRouteCount += 1;

  for (const bundle of bundles) {
    const courseMetadata = buildCourseMetadata(bundle.course, SITE_URL);
    await writeRouteHtml(
      `${COURSE_HUB_PATH}/${bundle.course.slug}`,
      applySeoTemplate(template, courseMetadata, buildCourseBody(bundle)),
    );
    generatedRouteCount += 1;

    for (const lesson of bundle.lessons) {
      const lessonMetadata = buildLessonMetadata(bundle.course, lesson, SITE_URL);
      await writeRouteHtml(
        `${COURSE_HUB_PATH}/${bundle.course.slug}/leccion/${lesson.id}`,
        applySeoTemplate(template, lessonMetadata, buildLessonBody(bundle, lesson)),
      );
      generatedRouteCount += 1;
    }

    if (bundle.quiz) {
      const quizMetadata = buildQuizMetadata(bundle.course, SITE_URL);
      await writeRouteHtml(
        `${COURSE_HUB_PATH}/${bundle.course.slug}/quiz`,
        applySeoTemplate(template, quizMetadata, buildQuizBody(bundle)),
      );
      generatedRouteCount += 1;
    }
  }

  await writeSitemaps(bundles);
  await writeRobots();

  if (generatedRouteCount !== expectedRouteCount) {
    throw new Error(`Prerender route count mismatch: generated ${generatedRouteCount}, expected ${expectedRouteCount}.`);
  }

  console.log(`Prerendered ${bundles.length} course pages into ${DIST_PUBLIC}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).then(() => {
  process.exit(0);
});
