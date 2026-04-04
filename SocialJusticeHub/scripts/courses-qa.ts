import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { COURSE_HUB_PATH, DEFAULT_SITE_URL } from "../shared/course-seo";
import { buildCourseRouteManifest } from "./course-route-manifest";

dotenv.config();

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const DIST_PUBLIC = path.join(ROOT_DIR, "dist", "public");
const SITE_URL = (
  [process.env.BASE_URL, process.env.CORS_ORIGIN, DEFAULT_SITE_URL]
    .find((value) => value && !/localhost|127\.0\.0\.1/.test(value))
  || process.env.BASE_URL
  || process.env.CORS_ORIGIN
  || DEFAULT_SITE_URL
).replace(/\/$/, "");

type QaIssue = {
  scope: string;
  message: string;
};

function absoluteUrl(routePath: string) {
  return `${SITE_URL}${routePath}`;
}

function routeHtmlPath(routePath: string) {
  return path.join(DIST_PUBLIC, routePath.replace(/^\//, ""), "index.html");
}

async function readText(filePath: string) {
  return fs.readFile(filePath, "utf8");
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectHtmlFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(entryPath));
      continue;
    }

    if (entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function expectIncludes(issues: QaIssue[], scope: string, html: string, pattern: RegExp, message: string) {
  if (!pattern.test(html)) {
    issues.push({ scope, message });
  }
}

function expectSitemapContains(issues: QaIssue[], scope: string, sitemap: string, routePath: string) {
  if (!sitemap.includes(absoluteUrl(routePath))) {
    issues.push({ scope, message: `Sitemap is missing ${routePath}.` });
  }
}

function expectSitemapExcludes(issues: QaIssue[], scope: string, sitemap: string, routePath: string) {
  if (sitemap.includes(absoluteUrl(routePath))) {
    issues.push({ scope, message: `Sitemap should not include ${routePath}.` });
  }
}

async function main() {
  const issues: QaIssue[] = [];
  const manifest = await buildCourseRouteManifest();

  await fs.writeFile(
    path.join(DIST_PUBLIC, "course-route-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  const hubHtmlPath = routeHtmlPath(COURSE_HUB_PATH);
  if (!(await pathExists(hubHtmlPath))) {
    throw new Error(`Missing prerendered hub page at ${hubHtmlPath}`);
  }

  const hubHtml = await readText(hubHtmlPath);
  expectIncludes(
    issues,
    "hub",
    hubHtml,
    new RegExp(`<link rel="canonical" href="${absoluteUrl(COURSE_HUB_PATH).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
    "Hub canonical is missing or incorrect.",
  );
  expectIncludes(issues, "hub", hubHtml, /<meta name="robots" content="index,follow"/, "Hub robots tag must be index,follow.");
  expectIncludes(issues, "hub", hubHtml, /application\/ld\+json/, "Hub JSON-LD is missing.");
  expectIncludes(issues, "hub", hubHtml, /data-prerendered="course-seo"/, "Hub prerender marker is missing.");

  for (const course of manifest.courses) {
    const courseHtmlPath = routeHtmlPath(course.path);
    if (!(await pathExists(courseHtmlPath))) {
      issues.push({ scope: course.slug, message: `Missing course page ${course.path}.` });
      continue;
    }

    const courseHtml = await readText(courseHtmlPath);
    expectIncludes(
      issues,
      course.slug,
      courseHtml,
      new RegExp(`<link rel="canonical" href="${absoluteUrl(course.path).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
      "Course canonical is missing or incorrect.",
    );
    expectIncludes(
      issues,
      course.slug,
      courseHtml,
      new RegExp(`<meta name="robots" content="${course.indexable ? "index,follow" : "noindex,follow"}"`),
      "Course robots tag is incorrect.",
    );
    expectIncludes(issues, course.slug, courseHtml, /property="og:title"/, "Course OG metadata is missing.");
    expectIncludes(issues, course.slug, courseHtml, /application\/ld\+json/, "Course JSON-LD is missing.");

    for (const lesson of course.lessons) {
      const lessonHtmlPath = routeHtmlPath(lesson.path);
      if (!(await pathExists(lessonHtmlPath))) {
        issues.push({ scope: `${course.slug}:${lesson.key}`, message: `Missing lesson page ${lesson.path}.` });
        continue;
      }

      const lessonHtml = await readText(lessonHtmlPath);
      expectIncludes(
        issues,
        `${course.slug}:${lesson.key}`,
        lessonHtml,
        new RegExp(`<link rel="canonical" href="${absoluteUrl(lesson.path).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
        "Lesson canonical is missing or incorrect.",
      );
      expectIncludes(
        issues,
        `${course.slug}:${lesson.key}`,
        lessonHtml,
        new RegExp(`<meta name="robots" content="${lesson.indexable ? "index,follow" : "noindex,follow"}"`),
        "Lesson robots tag is incorrect.",
      );
      expectIncludes(issues, `${course.slug}:${lesson.key}`, lessonHtml, /property="og:title"/, "Lesson OG metadata is missing.");
      expectIncludes(issues, `${course.slug}:${lesson.key}`, lessonHtml, /application\/ld\+json/, "Lesson JSON-LD is missing.");
    }

    if (course.hasQuiz && course.quizPath) {
      const quizHtmlPath = routeHtmlPath(course.quizPath);
      if (!(await pathExists(quizHtmlPath))) {
        issues.push({ scope: `${course.slug}:quiz`, message: `Missing quiz page ${course.quizPath}.` });
      } else {
        const quizHtml = await readText(quizHtmlPath);
        expectIncludes(
          issues,
          `${course.slug}:quiz`,
          quizHtml,
          new RegExp(`<link rel="canonical" href="${absoluteUrl(course.path).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
          "Quiz canonical must point to the course page.",
        );
        expectIncludes(
          issues,
          `${course.slug}:quiz`,
          quizHtml,
          /<meta name="robots" content="noindex,follow"/,
          "Quiz robots tag must be noindex,follow.",
        );
      }
    }
  }

  const sitemap = await readText(path.join(DIST_PUBLIC, "sitemap-courses.xml"));
  expectSitemapContains(issues, "sitemap", sitemap, COURSE_HUB_PATH);

  for (const course of manifest.courses) {
    if (course.indexable) {
      expectSitemapContains(issues, "sitemap", sitemap, course.path);
    } else {
      expectSitemapExcludes(issues, "sitemap", sitemap, course.path);
    }

    if (course.quizPath) {
      expectSitemapExcludes(issues, "sitemap", sitemap, course.quizPath);
    }

    for (const lesson of course.lessons) {
      if (lesson.indexable) {
        expectSitemapContains(issues, "sitemap", sitemap, lesson.path);
      } else {
        expectSitemapExcludes(issues, "sitemap", sitemap, lesson.path);
      }
    }
  }

  const sitemapIndex = await readText(path.join(DIST_PUBLIC, "sitemap.xml"));
  expectIncludes(issues, "sitemap-index", sitemapIndex, /sitemap-courses\.xml/, "Sitemap index must reference sitemap-courses.xml.");

  const robots = await readText(path.join(DIST_PUBLIC, "robots.txt"));
  expectIncludes(issues, "robots", robots, /User-agent: OAI-SearchBot[\s\S]*Allow: \//, "robots.txt must allow OAI-SearchBot.");
  expectIncludes(issues, "robots", robots, /User-agent: GPTBot[\s\S]*Disallow: \//, "robots.txt must block GPTBot.");

  const routeHtmlRoot = path.join(DIST_PUBLIC, COURSE_HUB_PATH.replace(/^\//, ""));
  const htmlFiles = await collectHtmlFiles(routeHtmlRoot);
  if (htmlFiles.length !== manifest.totalRouteCount) {
    issues.push({
      scope: "routes",
      message: `Expected ${manifest.totalRouteCount} prerendered HTML files under ${COURSE_HUB_PATH}, found ${htmlFiles.length}.`,
    });
  }

  if (issues.length > 0) {
    throw new Error(issues.map((issue) => `[${issue.scope}] ${issue.message}`).join("\n"));
  }

  console.log(
    `Course QA passed for ${manifest.courseCount} courses, ${manifest.lessonCount} lessons, ${manifest.quizCount} quizzes.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).then(() => {
  process.exit(0);
});
