import { deriveSearchSummary, normalizeSummary, stripRichText } from "./course-content";

export const DEFAULT_SITE_URL = "https://elinstantedelhombregris.com";
export const COURSE_HUB_PATH = "/recursos/guias-estudio";

export interface CourseSeoLike {
  id: number;
  slug: string;
  title: string;
  description: string;
  excerpt?: string | null;
  category?: string | null;
  level?: string | null;
  duration?: number | null;
  lessonCount?: number | null;
  thumbnailUrl?: string | null;
  ogImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  searchSummary?: string | null;
  lastReviewedAt?: string | null;
  indexable?: boolean | null;
}

export interface LessonSeoLike {
  id: number;
  title: string;
  description?: string | null;
  content?: string | null;
  type?: string | null;
  duration?: number | null;
  orderIndex?: number | null;
  searchSummary?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  indexable?: boolean | null;
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogImageUrl?: string | null;
  locale: string;
  jsonLd: Array<Record<string, unknown>>;
}

const CATEGORY_LABELS: Record<string, string> = {
  vision: "Visión",
  action: "Acción",
  community: "Comunidad",
  reflection: "Reflexión",
  "hombre-gris": "Hombre Gris",
  economia: "Economía",
  comunicacion: "Comunicación",
  civica: "Cívica",
};

function absoluteUrl(path: string, siteUrl = DEFAULT_SITE_URL): string {
  return new URL(path, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).toString();
}

function buildBreadcrumbList(items: Array<{ name: string; path: string }>, siteUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteUrl),
    })),
  };
}

function buildCourseSummary(course: CourseSeoLike): string {
  return deriveSearchSummary(
    course.searchSummary ?? course.excerpt ?? course.seoDescription,
    course.description,
    220,
  );
}

export function buildLessonSummary(lesson: LessonSeoLike): string {
  const fallback = lesson.description || stripRichText(lesson.content || "");
  return deriveSearchSummary(lesson.searchSummary ?? lesson.seoDescription, fallback, 220);
}

export function buildCourseHubMetadata(siteUrl = DEFAULT_SITE_URL): SeoMetadata {
  const title = "Rutas de Transformación | Guías de estudio de El Instante del Hombre Gris";
  const description = "Cursos y lecciones para pensar, actuar y transformar con claridad en Argentina.";
  const canonicalUrl = absoluteUrl(COURSE_HUB_PATH, siteUrl);

  return {
    title,
    description,
    canonicalUrl,
    robots: "index,follow",
    ogTitle: title,
    ogDescription: description,
    ogType: "website",
    ogImageUrl: null,
    locale: "es_AR",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonicalUrl,
        inLanguage: "es-AR",
      },
    ],
  };
}

export function buildCourseMetadata(course: CourseSeoLike, siteUrl = DEFAULT_SITE_URL): SeoMetadata {
  const categoryLabel = course.category ? (CATEGORY_LABELS[course.category] || course.category) : "Transformación";
  const title = course.seoTitle?.trim() || `${course.title} | Ruta de ${categoryLabel} | El Instante del Hombre Gris`;
  const description = normalizeSummary(course.seoDescription || buildCourseSummary(course), 160);
  const canonicalUrl = absoluteUrl(`${COURSE_HUB_PATH}/${course.slug}`, siteUrl);
  const summary = buildCourseSummary(course);
  const ogImageUrl = course.ogImageUrl || course.thumbnailUrl || null;

  return {
    title,
    description,
    canonicalUrl,
    robots: course.indexable === false ? "noindex,follow" : "index,follow",
    ogTitle: title,
    ogDescription: description,
    ogType: "website",
    ogImageUrl,
    locale: "es_AR",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: summary || description,
        provider: {
          "@type": "Organization",
          name: "El Instante del Hombre Gris",
          url: siteUrl,
        },
        educationalLevel: course.level || undefined,
        timeRequired: course.duration ? `PT${course.duration}M` : undefined,
        inLanguage: "es-AR",
        url: canonicalUrl,
      },
      buildBreadcrumbList(
        [
          { name: "Recursos", path: "/recursos" },
          { name: "Rutas de Transformación", path: COURSE_HUB_PATH },
          { name: course.title, path: `${COURSE_HUB_PATH}/${course.slug}` },
        ],
        siteUrl,
      ),
    ],
  };
}

export function buildLessonMetadata(
  course: CourseSeoLike,
  lesson: LessonSeoLike,
  siteUrl = DEFAULT_SITE_URL,
): SeoMetadata {
  const title = lesson.seoTitle?.trim() || `${lesson.title} | ${course.title}`;
  const description = normalizeSummary(lesson.seoDescription || buildLessonSummary(lesson), 160);
  const canonicalUrl = absoluteUrl(`${COURSE_HUB_PATH}/${course.slug}/leccion/${lesson.id}`, siteUrl);
  const ogImageUrl = course.ogImageUrl || course.thumbnailUrl || null;

  return {
    title,
    description,
    canonicalUrl,
    robots: lesson.indexable === false ? "noindex,follow" : "index,follow",
    ogTitle: title,
    ogDescription: description,
    ogType: "article",
    ogImageUrl,
    locale: "es_AR",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": lesson.type === "document" ? "Article" : "LearningResource",
        headline: lesson.title,
        description,
        isPartOf: {
          "@type": "Course",
          name: course.title,
          url: absoluteUrl(`${COURSE_HUB_PATH}/${course.slug}`, siteUrl),
        },
        inLanguage: "es-AR",
        url: canonicalUrl,
      },
      buildBreadcrumbList(
        [
          { name: "Recursos", path: "/recursos" },
          { name: "Rutas de Transformación", path: COURSE_HUB_PATH },
          { name: course.title, path: `${COURSE_HUB_PATH}/${course.slug}` },
          { name: lesson.title, path: `${COURSE_HUB_PATH}/${course.slug}/leccion/${lesson.id}` },
        ],
        siteUrl,
      ),
    ],
  };
}

export function buildQuizMetadata(course: CourseSeoLike, siteUrl = DEFAULT_SITE_URL): SeoMetadata {
  const title = `Quiz | ${course.title}`;
  const description = normalizeSummary(
    course.searchSummary || course.excerpt || course.description,
    160,
  );
  const canonicalUrl = absoluteUrl(`${COURSE_HUB_PATH}/${course.slug}`, siteUrl);

  return {
    title,
    description,
    canonicalUrl,
    robots: "noindex,follow",
    ogTitle: title,
    ogDescription: description,
    ogType: "website",
    ogImageUrl: course.ogImageUrl || course.thumbnailUrl || null,
    locale: "es_AR",
    jsonLd: [
      buildBreadcrumbList(
        [
          { name: "Recursos", path: "/recursos" },
          { name: "Rutas de Transformación", path: COURSE_HUB_PATH },
          { name: course.title, path: `${COURSE_HUB_PATH}/${course.slug}` },
          { name: "Quiz", path: `${COURSE_HUB_PATH}/${course.slug}/quiz` },
        ],
        siteUrl,
      ),
    ],
  };
}
