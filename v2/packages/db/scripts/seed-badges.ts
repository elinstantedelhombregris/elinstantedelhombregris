#!/usr/bin/env tsx
/**
 * Seed the starter badge catalog. Idempotent — re-running just inserts
 * badges that don't yet exist (slug-keyed) and leaves the rest alone.
 */
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { badges } from '../src/schema/gamification.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

interface SeedBadge {
  slug: string;
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const STARTER_BADGES: SeedBadge[] = [
  {
    slug: 'civic-baseline',
    title: 'Línea de base',
    description: 'Completaste tu primera auto-evaluación cívica.',
    tier: 'bronze',
  },
  {
    slug: 'first-quiz',
    title: 'Primer mapa',
    description: 'Completaste tu primer quiz de áreas de vida.',
    tier: 'bronze',
  },
  {
    slug: 'first-goal',
    title: 'Primer objetivo',
    description: 'Definiste tu primer objetivo y empezaste a moverte.',
    tier: 'bronze',
  },
  {
    slug: 'goal-crusher',
    title: 'Cumplidor',
    description: 'Completaste tu primer objetivo.',
    tier: 'silver',
  },
  {
    slug: 'first-pulse',
    title: 'Voz registrada',
    description: 'Mandaste tu primera señal al mandato vivo.',
    tier: 'bronze',
  },
  {
    slug: 'community-voice',
    title: 'Voz de comunidad',
    description: 'Publicaste tu primer post en la comunidad.',
    tier: 'silver',
  },
];

const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is required to seed badges');
}

const pool = new pg.Pool({ connectionString: url });
const db = drizzle(pool);

let created = 0;
let kept = 0;
for (const b of STARTER_BADGES) {
  const [existing] = await db.select().from(badges).where(eq(badges.slug, b.slug)).limit(1);
  if (existing) {
    kept++;
    continue;
  }
  await db.insert(badges).values({
    slug: b.slug,
    title: b.title,
    description: b.description,
    tier: b.tier,
  });
  created++;
}

await pool.end();
process.stdout.write(`badges seeded: ${String(created)} new, ${String(kept)} kept\n`);
