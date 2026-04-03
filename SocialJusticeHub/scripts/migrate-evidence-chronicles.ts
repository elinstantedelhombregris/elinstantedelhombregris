// Migration: Create mission_evidence and mission_chronicles tables
// This is additive — no data loss, no breaking changes.

import { db } from './db-neon';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Creating mission_evidence and mission_chronicles tables...');

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mission_evidence (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id),
        milestone_id INTEGER REFERENCES initiative_milestones(id),
        user_id INTEGER REFERENCES users(id),
        evidence_type TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        latitude TEXT,
        longitude TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        flag_category TEXT,
        verified_by INTEGER REFERENCES users(id),
        verified_at TEXT,
        created_at TEXT DEFAULT now()
      )
    `);
    console.log('mission_evidence table created (or already exists).');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS mission_evidence_post_id_idx
      ON mission_evidence(post_id)
    `);
    console.log('Index on mission_evidence.post_id created (or already exists).');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS mission_chronicles (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id),
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        highlighted_evidence_ids TEXT,
        published_at TEXT,
        created_at TEXT DEFAULT now()
      )
    `);
    console.log('mission_chronicles table created (or already exists).');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS mission_chronicles_post_id_idx
      ON mission_chronicles(post_id)
    `);
    console.log('Index on mission_chronicles.post_id created (or already exists).');

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
