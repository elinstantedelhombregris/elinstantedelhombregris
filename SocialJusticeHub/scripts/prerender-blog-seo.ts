import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db-neon";
import {
  BLOG_ALL_PATH,
  BLOG_HUB_PATH,
  VLOG_HUB_PATH,
  buildBlogHubMetadata,
  buildBlogPostMetadata,
  buildBlogPostPath,
  buildBlogSlugPathMap,
  buildLegacyBlogPostPath,
  buildBlogHubPath,
  buildYouTubeEmbedUrl,
  buildYouTubeThumbnailUrl,
  normalizeBlogContentForRendering,
  normalizeBlogReadTime,
  type BlogSeoLike,
} from "../shared/blog-seo";
import { DEFAULT_SITE_URL } from "../shared/course-seo";
import { blogContentUpdates } from "../shared/blogContent";

dotenv.config();

const { blogPosts, postTags, users } = schema;

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const DIST_PUBLIC = path.join(ROOT_DIR, "dist", "public");
const SITE_URL = (
  [process.env.BASE_URL, process.env.CORS_ORIGIN, DEFAULT_SITE_URL]
    .find((value) => value && !/localhost|127\.0\.0\.1/.test(value))
  || process.env.BASE_URL
  || process.env.CORS_ORIGIN
  || DEFAULT_SITE_URL
).replace(/\/$/, "");

type BlogRecord = BlogSeoLike & {
  id: number;
  tags: Array<{ tag: string }>;
};

type HubKind = "all" | "blog" | "vlog";

function absoluteUrl(routePath: string) {
  return `${SITE_URL}${routePath}`;
}

async function ensureDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
}

async function readTextIfPresent(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTag(source: string, pattern: RegExp, replacement: string) {
  if (pattern.test(source)) {
    return source.replace(pattern, replacement);
  }
  return source;
}

function applySeoTemplate(
  template: string,
  metadata: ReturnType<typeof buildBlogHubMetadata>,
  bodyHtml: string,
  marker = "blog-seo",
) {
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
    `<div id="root"><div data-prerendered="${marker}">${bodyHtml}</div></div>`,
  );

  return html;
}

async function writeRouteHtml(routePath: string, html: string) {
  const routeDirectory = path.join(DIST_PUBLIC, routePath.replace(/^\//, ""));
  await ensureDirectory(routeDirectory);
  await fs.writeFile(path.join(routeDirectory, "index.html"), html, "utf8");
}

async function loadBlogPosts(): Promise<BlogRecord[]> {
  const rows = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      category: blogPosts.category,
      type: blogPosts.type,
      imageUrl: blogPosts.imageUrl,
      videoUrl: blogPosts.videoUrl,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id));

  const postIds = rows.map((row) => row.id);
  const tagRows = postIds.length > 0
    ? await db
        .select({
          postId: postTags.postId,
          tag: postTags.tag,
        })
        .from(postTags)
        .where(inArray(postTags.postId, postIds))
    : [];

  const tagsByPost = new Map<number, Array<{ tag: string }>>();
  tagRows.forEach((tag) => {
    if (!tagsByPost.has(tag.postId)) {
      tagsByPost.set(tag.postId, []);
    }
    tagsByPost.get(tag.postId)!.push({ tag: tag.tag });
  });

  return rows.map((row) => {
    const override = blogContentUpdates[row.slug];
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: override?.excerpt ?? row.excerpt ?? "",
      content: override?.content ?? row.content ?? "",
      category: row.category ?? "",
      type: row.type,
      imageUrl: row.imageUrl,
      videoUrl: row.videoUrl,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      author: {
        name: row.authorName || "El Instante del Hombre Gris",
      },
      tags: tagsByPost.get(row.id) || [],
    };
  });
}

function buildHubBody(kind: HubKind, posts: BlogRecord[]) {
  const filteredPosts = kind === "all" ? posts : posts.filter((post) => post.type === kind);
  const hubLabel = kind === "vlog" ? "Vlog" : kind === "blog" ? "Blog" : "Blog y Vlog";
  const intro =
    kind === "vlog"
      ? "Cápsulas audiovisuales para aterrizar ideas complejas en ejemplos concretos y accionables."
      : kind === "blog"
        ? "Artículos para entender patrones, pensar sistémicamente y diseñar transformación real."
        : "Artículos y videos para pasar de la intuición a la comprensión y de la comprensión a la acción.";

  const emptyCopy =
    kind === "vlog"
      ? "Todavía no hay videos publicados en esta colección."
      : "Todavía no hay artículos publicados en esta colección.";

  return `
    <main class="blog-prerender" style="max-width:960px;margin:0 auto;padding:48px 20px 80px;">
      <nav style="font-size:14px;margin-bottom:18px;">
        <a href="/recursos" style="color:#0f766e;text-decoration:none;">Recursos</a>
      </nav>
      <header style="margin-bottom:28px;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;margin:0 0 12px;">${escapeHtml(hubLabel)}</p>
        <h1 style="font-size:42px;line-height:1.1;color:#0f172a;margin:0 0 16px;">${escapeHtml(hubLabel)}</h1>
        <p style="font-size:18px;line-height:1.7;color:#334155;margin:0;max-width:760px;">${escapeHtml(intro)}</p>
      </header>
      <section>
        ${filteredPosts.length === 0 ? `
          <div style="border:1px solid #cbd5e1;border-radius:20px;padding:24px;background:#fff;color:#475569;line-height:1.7;">
            ${escapeHtml(emptyCopy)}
          </div>
        ` : `
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:18px;">
            ${filteredPosts.map((post) => `
              <li style="border:1px solid #cbd5e1;border-radius:20px;padding:20px;background:#fff;">
                <a href="${buildBlogPostPath(post)}" style="text-decoration:none;color:inherit;">
                  <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;margin:0 0 10px;">
                    ${escapeHtml(post.type === "vlog" ? "Vlog" : "Blog")} · ${escapeHtml(post.category || "General")}
                  </p>
                  <h2 style="font-size:26px;line-height:1.25;margin:0 0 10px;color:#0f172a;">${escapeHtml(post.title)}</h2>
                  <p style="margin:0 0 12px;color:#475569;line-height:1.7;">${escapeHtml(post.excerpt || "")}</p>
                  <p style="margin:0;color:#0f766e;font-size:14px;">${escapeHtml(new Date(post.publishedAt || Date.now()).toLocaleDateString("es-AR"))}</p>
                </a>
              </li>
            `).join("")}
          </ul>
        `}
      </section>
    </main>
  `;
}

function buildPostBody(post: BlogRecord, slugToPath: Record<string, string>) {
  const hubPath = buildBlogHubPath(post.type);
  const hubLabel = post.type === "vlog" ? "Vlog" : "Blog";
  const normalizedContent = normalizeBlogContentForRendering(post.content, slugToPath);
  const readTimeMinutes = normalizeBlogReadTime(normalizedContent);
  const thumbnailUrl = post.imageUrl || buildYouTubeThumbnailUrl(post.videoUrl);
  const embedUrl = buildYouTubeEmbedUrl(post.videoUrl);

  return `
    <main class="blog-prerender" style="max-width:860px;margin:0 auto;padding:48px 20px 80px;">
      <nav style="font-size:14px;margin-bottom:18px;">
        <a href="/recursos" style="color:#0f766e;text-decoration:none;">Recursos</a> /
        <a href="${hubPath}" style="color:#0f766e;text-decoration:none;">${escapeHtml(hubLabel)}</a>
      </nav>
      <header style="margin-bottom:28px;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0369a1;margin:0 0 12px;">${escapeHtml(post.category || hubLabel)}</p>
        <h1 style="font-size:40px;line-height:1.12;color:#0f172a;margin:0 0 16px;">${escapeHtml(post.title)}</h1>
        <p style="font-size:18px;line-height:1.7;color:#334155;margin:0 0 18px;">${escapeHtml(post.excerpt || "")}</p>
        <ul style="display:flex;flex-wrap:wrap;gap:14px;list-style:none;padding:0;margin:0;color:#475569;font-size:14px;">
          <li><strong>Publicado:</strong> ${escapeHtml(new Date(post.publishedAt || Date.now()).toLocaleDateString("es-AR"))}</li>
          <li><strong>Autor:</strong> ${escapeHtml(post.author?.name || "El Instante del Hombre Gris")}</li>
          <li><strong>Lectura:</strong> ${readTimeMinutes} min</li>
        </ul>
      </header>
      ${post.type === "vlog" && embedUrl ? `
        <section style="margin-bottom:24px;">
          <div style="position:relative;padding-top:56.25%;overflow:hidden;border-radius:20px;background:#0f172a;">
            <iframe
              src="${embedUrl}"
              title="${escapeHtml(post.title)}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
            ></iframe>
          </div>
        </section>
      ` : thumbnailUrl ? `
        <section style="margin-bottom:24px;">
          <img
            src="${thumbnailUrl}"
            alt="${escapeHtml(post.title)}"
            style="width:100%;height:auto;border-radius:20px;display:block;"
          />
        </section>
      ` : ""}
      <article class="prose" style="color:#0f172a;line-height:1.8;">
        ${normalizedContent}
      </article>
    </main>
  `;
}

async function writeBlogSitemap(posts: BlogRecord[]) {
  const blogUrls = [
    {
      loc: absoluteUrl(BLOG_ALL_PATH),
      lastmod: posts[0]?.updatedAt || posts[0]?.publishedAt || new Date().toISOString(),
    },
    {
      loc: absoluteUrl(BLOG_HUB_PATH),
      lastmod: posts.find((post) => post.type === "blog")?.updatedAt
        || posts.find((post) => post.type === "blog")?.publishedAt
        || new Date().toISOString(),
    },
    ...posts
      .filter((post) => post.type === "vlog")
      .slice(0, 1)
      .map((post) => ({
        loc: absoluteUrl(VLOG_HUB_PATH),
        lastmod: post.updatedAt || post.publishedAt || new Date().toISOString(),
      })),
    ...posts.map((post) => ({
      loc: absoluteUrl(buildBlogPostPath(post)),
      lastmod: post.updatedAt || post.publishedAt || new Date().toISOString(),
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blogUrls
    .map(
      (entry) =>
        `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

  await fs.writeFile(path.join(DIST_PUBLIC, "sitemap-blog.xml"), sitemap, "utf8");
}

async function updateSitemapIndex() {
  const indexPath = path.join(DIST_PUBLIC, "sitemap.xml");
  const existing = await readTextIfPresent(indexPath);
  const sitemapLoc = absoluteUrl("/sitemap-blog.xml");

  if (existing) {
    if (existing.includes(sitemapLoc)) return;
    const updated = existing.replace(
      /<\/sitemapindex>\s*$/i,
      `  <sitemap>\n    <loc>${sitemapLoc}</loc>\n  </sitemap>\n</sitemapindex>\n`,
    );
    await fs.writeFile(indexPath, updated, "utf8");
    return;
  }

  const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${sitemapLoc}</loc>\n  </sitemap>\n</sitemapindex>\n`;
  await fs.writeFile(indexPath, index, "utf8");
}

async function updateRobots() {
  const robotsPath = path.join(DIST_PUBLIC, "robots.txt");
  const existing = await readTextIfPresent(robotsPath);
  const sitemapLine = `Sitemap: ${absoluteUrl("/sitemap-blog.xml")}`;

  if (existing) {
    if (existing.includes(sitemapLine)) return;
    await fs.writeFile(robotsPath, `${existing.trimEnd()}\n${sitemapLine}\n`, "utf8");
    return;
  }

  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    sitemapLine,
    "",
  ].join("\n");

  await fs.writeFile(robotsPath, robots, "utf8");
}

async function main() {
  if (/localhost|127\.0\.0\.1/.test(SITE_URL) && process.env.NODE_ENV === "production") {
    throw new Error(`Refusing to prerender production metadata with a localhost site URL: ${SITE_URL}`);
  }

  const templatePath = path.join(DIST_PUBLIC, "index.html");
  const template = await fs.readFile(templatePath, "utf8");
  const posts = await loadBlogPosts();
  const slugToPath = buildBlogSlugPathMap(posts);

  await writeRouteHtml(
    BLOG_ALL_PATH,
    applySeoTemplate(template, buildBlogHubMetadata("all", SITE_URL), buildHubBody("all", posts)),
  );
  await writeRouteHtml(
    BLOG_HUB_PATH,
    applySeoTemplate(template, buildBlogHubMetadata("blog", SITE_URL), buildHubBody("blog", posts)),
  );
  await writeRouteHtml(
    VLOG_HUB_PATH,
    applySeoTemplate(template, buildBlogHubMetadata("vlog", SITE_URL), buildHubBody("vlog", posts)),
  );

  for (const post of posts) {
    const canonicalMetadata = buildBlogPostMetadata(post, SITE_URL);
    const body = buildPostBody(post, slugToPath);

    await writeRouteHtml(
      buildBlogPostPath(post),
      applySeoTemplate(template, canonicalMetadata, body),
    );

    await writeRouteHtml(
      buildLegacyBlogPostPath(post.slug),
      applySeoTemplate(template, canonicalMetadata, body),
    );
  }

  await writeBlogSitemap(posts);
  await updateSitemapIndex();
  await updateRobots();

  console.log(`Prerendered ${posts.length} blog routes into ${DIST_PUBLIC}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).then(() => {
  process.exit(0);
});
