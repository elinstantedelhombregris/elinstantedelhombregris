import { db } from './db-neon';
import { sql } from 'drizzle-orm';

async function migrateOpenData() {
  console.log('🔄 Starting open data migration...');

  try {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS data_share_opt_out BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Added data_share_opt_out column to users table');

    console.log('🎉 Open data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateOpenData();
