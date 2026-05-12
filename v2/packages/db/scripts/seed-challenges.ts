#!/usr/bin/env tsx
/**
 * Seed the starter challenge catalog + their steps. Idempotent —
 * slug-keyed, skipped if already present.
 */
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { badges, challenges, challengeSteps } from '../src/schema/gamification.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

interface SeedChallenge {
  slug: string;
  title: string;
  description: string;
  cadence: 'daily' | 'weekly' | 'monthly' | 'one_time';
  xpReward: number;
  badgeSlug?: string;
  steps: { title: string; description?: string; xpReward?: number }[];
}

const STARTER_CHALLENGES: SeedChallenge[] = [
  {
    slug: 'lector-diario',
    title: 'Leé un ensayo hoy',
    description: 'Abrí un artículo o ensayo y dedicale al menos un rato.',
    cadence: 'daily',
    xpReward: 10,
    steps: [{ title: 'Leer un artículo' }],
  },
  {
    slug: 'participacion-semanal',
    title: 'Sumá 3 pulsos esta semana',
    description: 'Mandá tres señales al mandato vivo en los próximos siete días.',
    cadence: 'weekly',
    xpReward: 50,
    steps: [
      { title: 'Primer pulso' },
      { title: 'Segundo pulso' },
      { title: 'Tercer pulso' },
    ],
  },
  {
    slug: 'evaluacion-semanal',
    title: 'Completá 2 cuestionarios',
    description: 'Hacé dos cuestionarios de áreas de vida esta semana.',
    cadence: 'weekly',
    xpReward: 50,
    steps: [
      { title: 'Primer cuestionario' },
      { title: 'Segundo cuestionario' },
    ],
  },
  {
    slug: 'diagnostico-completo',
    title: 'Hacé tu diagnóstico ciudadano',
    description: 'Completá la auto-evaluación cívica y ganá la insignia base.',
    cadence: 'one_time',
    xpReward: 100,
    badgeSlug: 'civic-baseline',
    steps: [{ title: 'Completar el diagnóstico' }],
  },
  {
    slug: 'voz-de-la-comunidad',
    title: 'Compartí tu primera propuesta',
    description: 'Publicá una propuesta en el feed comunitario.',
    cadence: 'one_time',
    xpReward: 30,
    badgeSlug: 'community-voice',
    steps: [{ title: 'Publicar una propuesta' }],
  },
];

const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is required to seed challenges');
}

const pool = new pg.Pool({ connectionString: url });
const db = drizzle(pool);

let created = 0;
let kept = 0;
for (const c of STARTER_CHALLENGES) {
  const [existing] = await db.select().from(challenges).where(eq(challenges.slug, c.slug)).limit(1);
  if (existing) {
    kept++;
    continue;
  }

  // Look up badge id if the challenge auto-awards one. The badge
  // seed must run first; if the badge is missing we leave badgeId
  // null and log a warning instead of erroring.
  let badgeId: number | null = null;
  if (c.badgeSlug) {
    const [badge] = await db.select().from(badges).where(eq(badges.slug, c.badgeSlug)).limit(1);
    if (badge) badgeId = badge.id;
    else process.stderr.write(`warning: badge slug "${c.badgeSlug}" not found for challenge "${c.slug}"\n`);
  }

  const [challengeRow] = await db
    .insert(challenges)
    .values({
      slug: c.slug,
      title: c.title,
      description: c.description,
      cadence: c.cadence,
      xpReward: c.xpReward,
      badgeId,
      isActive: true,
    })
    .returning();
  if (!challengeRow) throw new Error(`Failed to insert challenge ${c.slug}`);

  for (let i = 0; i < c.steps.length; i++) {
    const step = c.steps[i];
    if (!step) continue;
    await db.insert(challengeSteps).values({
      challengeId: challengeRow.id,
      title: step.title,
      description: step.description ?? null,
      orderIndex: i,
      xpReward: step.xpReward ?? 0,
    });
  }
  created++;
}

await pool.end();
process.stdout.write(`challenges seeded: ${String(created)} new, ${String(kept)} kept\n`);
