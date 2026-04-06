import { deriveSearchSummary, normalizeSummary, stripRichText } from "./course-content";
import { DEFAULT_SITE_URL, type SeoMetadata } from "./course-seo";

export const BLOG_ALL_PATH = "/blog-vlog";
export const BLOG_HUB_PATH = "/recursos/blog";
export const VLOG_HUB_PATH = "/recursos/vlog";

type BlogHubKind = "all" | "blog" | "vlog";
type BlogPostType = "blog" | "vlog";

export interface BlogSeoLike {
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  type: BlogPostType;
  imageUrl?: string | null;
  videoUrl?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  author?: {
    name?: string | null;
  } | null;
  tags?: Array<{ tag: string } | string> | null;
}

const HUB_METADATA: Record<BlogHubKind, { title: string; description: string; path: string; label: string }> = {
  all: {
    title: "Blog y Vlog | El Instante del Hombre Gris",
    description:
      "Artículos y videos para pensar con claridad, leer patrones sociales y diseñar transformación real desde Argentina.",
    path: BLOG_ALL_PATH,
    label: "Blog y Vlog",
  },
  blog: {
    title: "Blog | El Instante del Hombre Gris",
    description:
      "Artículos sobre pensamiento sistémico, transformación social, cultura cívica y diseño institucional desde Argentina.",
    path: BLOG_HUB_PATH,
    label: "Blog",
  },
  vlog: {
    title: "Vlog | El Instante del Hombre Gris",
    description:
      "Videos y cápsulas para bajar ideas complejas a ejemplos concretos sobre ciudadanía, cultura y transformación.",
    path: VLOG_HUB_PATH,
    label: "Vlog",
  },
};

function absoluteUrl(routePath: string, siteUrl = DEFAULT_SITE_URL) {
  return new URL(routePath, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).toString();
}

function buildBreadcrumbList(items: Array<{ name: string; path: string }>, siteUrl = DEFAULT_SITE_URL) {
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

function normalizeTags(tags?: BlogSeoLike["tags"]) {
  return (tags || [])
    .map((tag) => (typeof tag === "string" ? tag : tag?.tag))
    .filter((tag): tag is string => Boolean(tag && tag.trim()))
    .map((tag) => tag.trim());
}

function buildBlogSummary(post: BlogSeoLike) {
  return deriveSearchSummary(post.excerpt, post.content, 220);
}

export function buildBlogHubPath(type: BlogPostType) {
  return type === "vlog" ? VLOG_HUB_PATH : BLOG_HUB_PATH;
}

export function buildBlogPostPath(post: Pick<BlogSeoLike, "slug" | "type">) {
  return `${buildBlogHubPath(post.type)}/${post.slug}`;
}

export function buildLegacyBlogPostPath(slug: string) {
  return `${BLOG_ALL_PATH}/${slug}`;
}

export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i,
    /youtube\.com\/embed\/([^"&?/\s]{11})/i,
    /youtube\.com\/watch\?v=([^"&?/\s]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return /^[a-zA-Z0-9_-]{11}$/.test(url) ? url : null;
}

export function buildYouTubeThumbnailUrl(url?: string | null) {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

export function buildYouTubeEmbedUrl(url?: string | null) {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function normalizeBlogContentHtml(content?: string | null) {
  if (!content) return "";

  return content
    .trim()
    .replace(/^<article[^>]*>\s*/i, "")
    .replace(/\s*<\/article>\s*$/i, "")
    .replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "")
    .trim();
}

export function normalizeBlogReadTime(content?: string | null, wordsPerMinute = 200) {
  const plainText = stripRichText(content || "");
  if (!plainText) return 1;
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function rewriteBlogInternalLinks(content: string, slugToPath: Record<string, string>) {
  return content.replace(/href=(["'])\/blog-vlog\/([^"']+)\1/gi, (_match, quote: string, slug: string) => {
    const rewrittenPath = slugToPath[slug] || `${BLOG_HUB_PATH}/${slug}`;
    return `href=${quote}${rewrittenPath}${quote}`;
  });
}

export function normalizeBlogContentForRendering(
  content?: string | null,
  slugToPath: Record<string, string> = {},
) {
  const normalized = normalizeBlogContentHtml(content);
  return Object.keys(slugToPath).length > 0 ? rewriteBlogInternalLinks(normalized, slugToPath) : normalized;
}

export function buildBlogHubMetadata(kind: BlogHubKind, siteUrl = DEFAULT_SITE_URL): SeoMetadata {
  const metadata = HUB_METADATA[kind];
  const canonicalUrl = absoluteUrl(metadata.path, siteUrl);

  return {
    title: metadata.title,
    description: metadata.description,
    canonicalUrl,
    robots: "index,follow",
    ogTitle: metadata.title,
    ogDescription: metadata.description,
    ogType: "website",
    ogImageUrl: null,
    locale: "es_AR",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: metadata.title,
        description: metadata.description,
        url: canonicalUrl,
        inLanguage: "es-AR",
      },
      buildBreadcrumbList(
        [
          { name: "Recursos", path: "/recursos" },
          { name: metadata.label, path: metadata.path },
        ],
        siteUrl,
      ),
    ],
  };
}

export function buildBlogPostMetadata(post: BlogSeoLike, siteUrl = DEFAULT_SITE_URL): SeoMetadata {
  const canonicalPath = buildBlogPostPath(post);
  const canonicalUrl = absoluteUrl(canonicalPath, siteUrl);
  const hubPath = buildBlogHubPath(post.type);
  const hubLabel = post.type === "vlog" ? "Vlog" : "Blog";
  const description = normalizeSummary(post.excerpt || buildBlogSummary(post), 160);
  const authorName = post.author?.name?.trim() || "El Instante del Hombre Gris";
  const ogImageUrl = post.imageUrl || buildYouTubeThumbnailUrl(post.videoUrl) || null;
  const keywords = normalizeTags(post.tags);
  const embedUrl = buildYouTubeEmbedUrl(post.videoUrl);

  const primaryStructuredData =
    post.type === "vlog"
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: post.title,
          description,
          thumbnailUrl: ogImageUrl || undefined,
          uploadDate: post.publishedAt || undefined,
          embedUrl: embedUrl || undefined,
          contentUrl: post.videoUrl || undefined,
          keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
          inLanguage: "es-AR",
          url: canonicalUrl,
        }
      : {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description,
          image: ogImageUrl ? [ogImageUrl] : undefined,
          datePublished: post.publishedAt || undefined,
          dateModified: post.updatedAt || post.publishedAt || undefined,
          author: {
            "@type": "Person",
            name: authorName,
          },
          publisher: {
            "@type": "Organization",
            name: "El Instante del Hombre Gris",
            url: siteUrl,
          },
          articleSection: post.category || undefined,
          keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
          inLanguage: "es-AR",
          mainEntityOfPage: canonicalUrl,
          url: canonicalUrl,
        };

  return {
    title: `${post.title} | ${hubLabel} | El Instante del Hombre Gris`,
    description,
    canonicalUrl,
    robots: "index,follow",
    ogTitle: `${post.title} | ${hubLabel} | El Instante del Hombre Gris`,
    ogDescription: description,
    ogType: post.type === "vlog" ? "video.other" : "article",
    ogImageUrl,
    locale: "es_AR",
    jsonLd: [
      primaryStructuredData,
      buildBreadcrumbList(
        [
          { name: "Recursos", path: "/recursos" },
          { name: hubLabel, path: hubPath },
          { name: post.title, path: canonicalPath },
        ],
        siteUrl,
      ),
    ],
  };
}

export function buildBlogSlugPathMap(posts: Array<Pick<BlogSeoLike, "slug" | "type">>) {
  return Object.fromEntries(posts.map((post) => [post.slug, buildBlogPostPath(post)]));
}
