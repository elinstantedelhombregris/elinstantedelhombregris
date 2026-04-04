// Migration: Add mission_slug column to community_posts table
// This is additive — no data loss, no breaking changes.

import { db } from './db-neon';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Adding mission_slug column to community_posts...');

  try {
    await db.execute(sql`
      ALTER TABLE community_posts
      ADD COLUMN IF NOT EXISTS mission_slug TEXT
    `);
    console.log('mission_slug column added (or already exists).');

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
