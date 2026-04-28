import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ensayos } from '../client/src/content/ensayos.generated';
import { DEFAULT_SITE_URL } from '../shared/course-seo';

dotenv.config();

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const DIST_PUBLIC = path.join(ROOT_DIR, 'dist', 'public');

const SITE_URL = (
  [process.env.BASE_URL, process.env.CORS_ORIGIN, DEFAULT_SITE_URL]
    .find((value) => value && !/localhost|127\.0\.0\.1/.test(value))
  || process.env.BASE_URL
  || process.env.CORS_ORIGIN
  || DEFAULT_SITE_URL
).replace(/\/$/, '');

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function absoluteUrl(routePath: string): string {
  return `${SITE_URL}${routePath}`;
}

interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogImageUrl?: string;
  locale: string;
  robots: string;
  jsonLd: Array<Record<string, unknown>>;
}

function applySeoTemplate(
  template: string,
  metadata: SeoMetadata,
  bodyHtml: string,
  marker = 'ensayos-seo',
): string {
  let html = template
    .replace(/<link rel="canonical"[\s\S]*?\/>\s*/gi, '')
    .replace(/<meta (property|name)="og:[^"]+"[\s\S]*?\/>\s*/gi, '')
    .replace(/<meta name="twitter:[^"]+"[\s\S]*?\/>\s*/gi, '')
    .replace(/<script type="application\/ld\+json" data-seo-jsonld="true">[\s\S]*?<\/script>\s*/gi, '');

  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  } else {
    html = html.replace(/<\/head>/i, `  <title>${escapeHtml(metadata.title)}</title>\n</head>`);
  }

  if (/<meta name="description" content="[^"]*"\s*\/?>/i.test(html)) {
    html = html.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    );
  } else {
    html = html.replace(
      /<\/head>/i,
      `  <meta name="description" content="${escapeHtml(metadata.description)}" />\n</head>`,
    );
  }

  if (/<meta name="robots" content="[^"]*"\s*\/?>/i.test(html)) {
    html = html.replace(
      /<meta name="robots" content="[^"]*"\s*\/?>/i,
      `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
    );
  }

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
        : '',
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${escapeHtml(metadata.ogTitle)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(metadata.ogDescription)}" />`,
      metadata.ogImageUrl
        ? `<meta name="twitter:image" content="${escapeHtml(metadata.ogImageUrl)}" />`
        : '',
      ...metadata.jsonLd.map(
        (entry) =>
          `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(entry)}</script>`,
      ),
      '</head>',
    ].filter(Boolean).join('\n'),
  );

  html = html.replace(
    /<div id="root"><\/div>/i,
    `<div id="root"><div data-prerendered="${marker}">${bodyHtml}</div></div>`,
  );

  return html;
}

async function ensureDirectory(directory: string) {
  await fs.mkdir(directory, { recursive: true });
}

async function writeRouteHtml(routePath: string, html: string) {
  const routeDirectory = path.join(DIST_PUBLIC, routePath.replace(/^\//, ''));
  await ensureDirectory(routeDirectory);
  await fs.writeFile(path.join(routeDirectory, 'index.html'), html, 'utf8');
}

function buildIndexBody(): string {
  const items = ensayos
    .map((ensayo) => `
      <li style="border:1px solid #1f2937;border-radius:20px;padding:20px;background:#0f172a;color:#e2e8f0;">
        <a href="/recursos/ensayos/${ensayo.slug}" style="text-decoration:none;color:inherit;">
          <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#fcd34d;margin:0 0 10px;">
            Ensayo ${String(ensayo.order).padStart(2, '0')} · ${escapeHtml(ensayo.type)}
          </p>
          <h2 style="font-size:26px;line-height:1.25;margin:0 0 10px;color:#f8fafc;">${escapeHtml(ensayo.title)}</h2>
          <p style="margin:0 0 12px;color:#cbd5e1;line-height:1.7;">${escapeHtml(truncate(ensayo.opening, 220))}</p>
          <p style="margin:0;color:#fcd34d;font-size:14px;">${ensayo.readingMinutes} min de lectura</p>
        </a>
      </li>
    `)
    .join('');

  return `
    <main class="ensayos-prerender" style="max-width:960px;margin:0 auto;padding:48px 20px 80px;">
      <nav style="font-size:14px;margin-bottom:18px;">
        <a href="/recursos" style="color:#fcd34d;text-decoration:none;">Recursos</a>
      </nav>
      <header style="margin-bottom:28px;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#fcd34d;margin:0 0 12px;">Pensamiento</p>
        <h1 style="font-size:42px;line-height:1.1;color:#f8fafc;margin:0 0 16px;">Ensayos</h1>
        <p style="font-size:18px;line-height:1.7;color:#cbd5e1;margin:0;max-width:760px;">
          Un cuaderno abierto del Hombre Gris. Textos largos para pensar la república desde abajo.
        </p>
      </header>
      <section>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:18px;">
          ${items}
        </ul>
      </section>
    </main>
  `;
}

function buildEssayBody(slug: string): string {
  const ensayo = ensayos.find((e) => e.slug === slug);
  if (!ensayo) return '';
  return `
    <main class="ensayos-prerender" style="max-width:860px;margin:0 auto;padding:48px 20px 80px;">
      <nav style="font-size:14px;margin-bottom:18px;">
        <a href="/recursos" style="color:#fcd34d;text-decoration:none;">Recursos</a> /
        <a href="/recursos/ensayos" style="color:#fcd34d;text-decoration:none;">Ensayos</a>
      </nav>
      <header style="margin-bottom:28px;">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#fcd34d;margin:0 0 12px;">${String(ensayo.order).padStart(2, '0')} · ${escapeHtml(ensayo.type)}</p>
        <h1 style="font-size:40px;line-height:1.12;color:#f8fafc;margin:0 0 16px;">${escapeHtml(ensayo.title)}</h1>
        <p style="font-size:18px;line-height:1.7;color:#cbd5e1;font-style:italic;margin:0 0 18px;">${escapeHtml(ensayo.subtitle)}</p>
        <p style="margin:0;color:#94a3b8;font-size:14px;">${ensayo.readingMinutes} min de lectura</p>
      </header>
      <article class="prose" style="color:#e2e8f0;line-height:1.85;">
        ${ensayo.bodyHtml}
      </article>
    </main>
  `;
}

function buildIndexMetadata(): SeoMetadata {
  const title = 'Ensayos — El Instante del Hombre Gris';
  const description = 'Un cuaderno abierto del Hombre Gris. Textos largos para pensar la república desde abajo.';
  const canonicalUrl = absoluteUrl('/recursos/ensayos');
  return {
    title,
    description,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    locale: 'es_AR',
    robots: 'index,follow',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: canonicalUrl,
        inLanguage: 'es-AR',
        hasPart: ensayos.map((e) => ({
          '@type': 'Article',
          headline: e.title,
          url: absoluteUrl(`/recursos/ensayos/${e.slug}`),
        })),
      },
    ],
  };
}

function buildEssayMetadata(slug: string): SeoMetadata | null {
  const ensayo = ensayos.find((e) => e.slug === slug);
  if (!ensayo) return null;
  const title = `${ensayo.title} — Ensayos — El Instante del Hombre Gris`;
  const description = truncate(ensayo.opening, 160);
  const canonicalUrl = absoluteUrl(`/recursos/ensayos/${ensayo.slug}`);
  return {
    title,
    description,
    canonicalUrl,
    ogTitle: ensayo.title,
    ogDescription: description,
    ogType: 'article',
    locale: 'es_AR',
    robots: 'index,follow',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: ensayo.title,
        description,
        url: canonicalUrl,
        inLanguage: 'es-AR',
        author: {
          '@type': 'Organization',
          name: 'El Instante del Hombre Gris',
        },
      },
    ],
  };
}

async function readTextIfPresent(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function writeEnsayosSitemap() {
  const urls = [
    { loc: absoluteUrl('/recursos/ensayos'), lastmod: new Date().toISOString() },
    ...ensayos.map((e) => ({
      loc: absoluteUrl(`/recursos/ensayos/${e.slug}`),
      lastmod: new Date().toISOString(),
    })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
    .join('\n')}\n</urlset>\n`;
  await fs.writeFile(path.join(DIST_PUBLIC, 'sitemap-ensayos.xml'), sitemap, 'utf8');
}

async function updateSitemapIndex() {
  const indexPath = path.join(DIST_PUBLIC, 'sitemap.xml');
  const existing = await readTextIfPresent(indexPath);
  const sitemapLoc = absoluteUrl('/sitemap-ensayos.xml');
  if (existing) {
    if (existing.includes(sitemapLoc)) return;
    const updated = existing.replace(
      /<\/sitemapindex>\s*$/i,
      `  <sitemap>\n    <loc>${sitemapLoc}</loc>\n  </sitemap>\n</sitemapindex>\n`,
    );
    await fs.writeFile(indexPath, updated, 'utf8');
    return;
  }
  const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${sitemapLoc}</loc>\n  </sitemap>\n</sitemapindex>\n`;
  await fs.writeFile(indexPath, index, 'utf8');
}

async function updateRobots() {
  const robotsPath = path.join(DIST_PUBLIC, 'robots.txt');
  const existing = await readTextIfPresent(robotsPath);
  const sitemapLine = `Sitemap: ${absoluteUrl('/sitemap-ensayos.xml')}`;
  if (existing) {
    if (existing.includes(sitemapLine)) return;
    await fs.writeFile(robotsPath, `${existing.trimEnd()}\n${sitemapLine}\n`, 'utf8');
    return;
  }
  const robots = ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', sitemapLine, ''].join('\n');
  await fs.writeFile(robotsPath, robots, 'utf8');
}

async function main() {
  if (/localhost|127\.0\.0\.1/.test(SITE_URL) && process.env.NODE_ENV === 'production') {
    throw new Error(`Refusing to prerender production metadata with a localhost site URL: ${SITE_URL}`);
  }

  const templatePath = path.join(DIST_PUBLIC, 'index.html');
  const template = await fs.readFile(templatePath, 'utf8');

  await writeRouteHtml(
    '/recursos/ensayos',
    applySeoTemplate(template, buildIndexMetadata(), buildIndexBody()),
  );

  for (const ensayo of ensayos) {
    const metadata = buildEssayMetadata(ensayo.slug);
    if (!metadata) continue;
    const body = buildEssayBody(ensayo.slug);
    await writeRouteHtml(
      `/recursos/ensayos/${ensayo.slug}`,
      applySeoTemplate(template, metadata, body),
    );
  }

  await writeEnsayosSitemap();
  await updateSitemapIndex();
  await updateRobots();

  console.log(`Prerendered ${ensayos.length + 1} ensayos pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).then(() => {
  process.exit(0);
});
