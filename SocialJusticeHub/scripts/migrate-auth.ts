import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateAuth() {
  console.log('🔄 Starting authentication migration...');
  
  try {
    // Add new columns to users table (without default values for SQLite compatibility)
    await db.run(sql`
      ALTER TABLE users ADD COLUMN updated_at TEXT;
    `);
    console.log('✅ Added updated_at column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN last_login TEXT;
    `);
    console.log('✅ Added last_login column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN login_attempts INTEGER;
    `);
    console.log('✅ Added login_attempts column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN locked_until TEXT;
    `);
    console.log('✅ Added locked_until column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN is_active INTEGER;
    `);
    console.log('✅ Added is_active column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN email_verified INTEGER;
    `);
    console.log('✅ Added email_verified column');
    
    // Set default values for existing records
    await db.run(sql`
      UPDATE users SET 
        updated_at = CURRENT_TIMESTAMP,
        login_attempts = 0,
        is_active = 1,
        email_verified = 0
      WHERE updated_at IS NULL;
    `);
    console.log('✅ Set default values for existing records');
    
    // Make email unique
    await db.run(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);
    `);
    console.log('✅ Added unique constraint on email');
    
    console.log('🎉 Authentication migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAuth()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateAuth };
