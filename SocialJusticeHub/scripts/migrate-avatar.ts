import { db } from './db-neon';
import { sql } from 'drizzle-orm';

async function migrateAvatar() {
  console.log('🔄 Starting avatar migration...');

  try {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    console.log('✅ Added avatar_url column to users table');

    console.log('🎉 Avatar migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateAvatar();
