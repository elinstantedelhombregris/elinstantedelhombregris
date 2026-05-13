/**
 * One-shot: read v1 markdown ensayos and emit v2 MDX with the frontmatter
 * shape consumed by apps/web/src/lib/ensayos-registry.ts.
 *
 * Run: pnpm tsx scripts/content/migrate-ensayos-v1-to-v2.ts
 *
 * Idempotent: skips slugs that already exist in v2/content/ensayos/.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const ENSAYOS_SRC = resolve(REPO_ROOT, 'Ensayos');
const ENSAYOS_OUT = resolve(V2_ROOT, 'content/ensayos');

interface SourceFile {
  series: 'primer-ciclo' | 'indagaciones';
  orderIndex: number;
  srcRelative: string;
  slug: string;
  summary: string;
  tags: string[];
}

const SOURCES: SourceFile[] = [
  // Primer ciclo — belleza is already migrated (06-belleza.mdx → renamed to belleza.mdx)
  {
    series: 'primer-ciclo',
    orderIndex: 1,
    srcRelative: 'presidencia, democracia y belleza/01-presidencia.md',
    slug: 'presidencia',
    summary:
      'Por qué una sola persona sentada en una sola silla nunca pudo ni va a poder gobernar un país de 45 millones — y qué construir en su lugar.',
    tags: ['presidencia', 'arquitectura', 'republica', 'argentina'],
  },
  {
    series: 'primer-ciclo',
    orderIndex: 2,
    srcRelative: 'presidencia, democracia y belleza/02-democracia.md',
    slug: 'democracia',
    summary:
      'La democracia tal como la heredamos no es una conversación entre iguales; es un ritual cada cuatro años que tapa qué decisiones nunca se nos consultaron.',
    tags: ['democracia', 'representacion', 'republica'],
  },
  {
    series: 'primer-ciclo',
    orderIndex: 3,
    srcRelative: 'presidencia, democracia y belleza/03-poder.md',
    slug: 'poder',
    summary:
      'La palabra poder fue el caballo de Troya: la usamos como sustantivo cuando en realidad es siempre un verbo, una relación viva entre los que actúan.',
    tags: ['poder', 'lenguaje', 'politica'],
  },
  {
    series: 'primer-ciclo',
    orderIndex: 4,
    srcRelative: 'presidencia, democracia y belleza/04-arquitectura.md',
    slug: 'arquitectura',
    summary:
      'Si la presidencia es una idea estúpida y el poder no es un objeto, qué arquitectura cívica nos queda para sostener una república sin trono.',
    tags: ['arquitectura', 'infraestructura', 'autogobierno'],
  },
  {
    series: 'primer-ciclo',
    orderIndex: 5,
    srcRelative: 'presidencia, democracia y belleza/05-soberania.md',
    slug: 'soberania',
    summary:
      'Cada vez que tu identidad, tu plata, tu memoria y tu deliberación viven en infraestructuras que no son tuyas, perdés soberanía aunque nadie haya cruzado la frontera.',
    tags: ['soberania', 'infraestructura', 'datos'],
  },
  {
    series: 'primer-ciclo',
    orderIndex: 7,
    srcRelative: 'presidencia, democracia y belleza/07-carta.md',
    slug: 'carta-al-nieto',
    summary:
      'Una carta a quien aún no nació, explicando qué hicimos con el país que le vamos a dejar — y por qué construir importa más que ganar elecciones.',
    tags: ['carta', 'futuro', 'legado'],
  },
  // Indagaciones
  {
    series: 'indagaciones',
    orderIndex: 1,
    srcRelative: 'indagaciones/01-fabrica-obediencia.md',
    slug: 'fabrica-obediencia',
    summary:
      'Sobre lo que la escuela argentina enseña sin nombrarlo: obedecer, esperar permiso, repetir lo que ya está dicho.',
    tags: ['educacion', 'obediencia', 'autoridad'],
  },
  {
    series: 'indagaciones',
    orderIndex: 2,
    srcRelative: 'indagaciones/02-caudillo-camino-sin-camino.md',
    slug: 'caudillo-camino-sin-camino',
    summary:
      'Sobre por qué seguimos buscando un líder que nos salve, y qué pasaría si dejáramos de buscarlo.',
    tags: ['liderazgo', 'caudillismo', 'argentina'],
  },
  {
    series: 'indagaciones',
    orderIndex: 3,
    srcRelative: 'indagaciones/03-miedo-y-devenir.md',
    slug: 'miedo-y-devenir',
    summary:
      'Sobre la economía emocional de un país que vive entre el miedo a perder y la nostalgia de no haber sido — y cómo sale del laberinto.',
    tags: ['miedo', 'emocion', 'argentina'],
  },
  {
    series: 'indagaciones',
    orderIndex: 4,
    srcRelative: 'indagaciones/04-libertad-de-lo-conocido.md',
    slug: 'libertad-de-lo-conocido',
    summary:
      'Sobre cómo soltar la Argentina heredada para ver la real, sin el ruido de las identidades prestadas.',
    tags: ['libertad', 'identidad', 'desapego'],
  },
  {
    series: 'indagaciones',
    orderIndex: 5,
    srcRelative: 'indagaciones/05-conocerse-sin-espejo.md',
    slug: 'conocerse-sin-espejo',
    summary:
      'Sobre el autoconocimiento como acto político: una república sólo es adulta si sus ciudadanos también lo son.',
    tags: ['autoconocimiento', 'politica', 'madurez'],
  },
  {
    series: 'indagaciones',
    orderIndex: 6,
    srcRelative: 'indagaciones/06-amor-sin-apego.md',
    slug: 'amor-sin-apego',
    summary:
      'Sobre la militancia como dependencia, la lealtad sin propiedad, y el amor que no necesita encadenar para sostenerse.',
    tags: ['amor', 'militancia', 'lealtad'],
  },
  {
    series: 'indagaciones',
    orderIndex: 7,
    srcRelative: 'indagaciones/07-sensibilidad-como-infraestructura.md',
    slug: 'sensibilidad-como-infraestructura',
    summary:
      'Sobre la naturaleza, la belleza y el silencio como tecnologías cívicas — tan reales como una ruta o un tribunal.',
    tags: ['sensibilidad', 'belleza', 'silencio'],
  },
];

const PUBLISHED_AT_PRIMER = '2026-04-15T00:00:00Z';
const PUBLISHED_AT_INDAG = '2026-04-29T00:00:00Z';

function readSource(srcRelative: string): { title: string; subtitle: string; body: string } {
  const raw = readFileSync(resolve(ENSAYOS_SRC, srcRelative), 'utf-8');
  const lines = raw.split('\n');

  let i = 0;
  while (i < lines.length && lines[i]!.trim() === '') i++;
  if (i >= lines.length || !lines[i]!.startsWith('# ')) {
    throw new Error(`No H1 title found in ${srcRelative}`);
  }
  const title = lines[i]!.replace(/^# /, '').trim();
  i++;

  while (i < lines.length && lines[i]!.trim() === '') i++;

  let subtitle = '';
  if (i < lines.length && lines[i]!.startsWith('## ')) {
    const next = lines[i]!.replace(/^## /, '').trim();
    if (!/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s/.test(next)) {
      subtitle = next;
      i++;
      while (i < lines.length && lines[i]!.trim() === '') i++;
    }
  }

  const body = lines.slice(i).join('\n').trimStart();
  return { title, subtitle, body };
}

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

function yamlEscape(s: string): string {
  if (/[:#]|^\s*-/.test(s) || /^['"]/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

function buildMdx(src: SourceFile): string {
  const { title, subtitle, body } = readSource(src.srcRelative);
  const readingMinutes = estimateReadingMinutes(body);
  const publishedAt = src.series === 'primer-ciclo' ? PUBLISHED_AT_PRIMER : PUBLISHED_AT_INDAG;
  const tagsBlock = src.tags.map((t) => `  - ${t}`).join('\n');

  return `---
slug: ${src.slug}
title: ${yamlEscape(title)}
subtitle: ${yamlEscape(subtitle)}
summary: ${yamlEscape(src.summary)}
series: ${src.series}
orderIndex: ${src.orderIndex}
publishedAt: ${publishedAt}
readingMinutes: ${readingMinutes}
tags:
${tagsBlock}
draft: false
---

${body}`;
}

function main(): void {
  let written = 0;
  let skipped = 0;
  for (const src of SOURCES) {
    const outPath = resolve(ENSAYOS_OUT, `${src.slug}.mdx`);
    if (existsSync(outPath)) {
      console.log(`skip   ${src.slug} (already exists)`);
      skipped++;
      continue;
    }
    const mdx = buildMdx(src);
    writeFileSync(outPath, mdx, 'utf-8');
    console.log(`wrote  ${src.slug}.mdx`);
    written++;
  }
  console.log(`\nDone: ${written} written, ${skipped} skipped.`);
}

main();
