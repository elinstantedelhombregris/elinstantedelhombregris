import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateAdvancedAuth() {
  console.log('🔄 Starting advanced authentication features migration...');
  
  try {
    // Email verification columns
    await db.run(sql`
      ALTER TABLE users ADD COLUMN email_verification_token TEXT;
    `);
    console.log('✅ Added email_verification_token column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN email_verification_expires TEXT;
    `);
    console.log('✅ Added email_verification_expires column');
    
    // Password reset columns
    await db.run(sql`
      ALTER TABLE users ADD COLUMN password_reset_token TEXT;
    `);
    console.log('✅ Added password_reset_token column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN password_reset_expires TEXT;
    `);
    console.log('✅ Added password_reset_expires column');
    
    // 2FA columns
    await db.run(sql`
      ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
    `);
    console.log('✅ Added two_factor_enabled column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
    `);
    console.log('✅ Added two_factor_secret column');
    
    await db.run(sql`
      ALTER TABLE users ADD COLUMN two_factor_backup_codes TEXT;
    `);
    console.log('✅ Added two_factor_backup_codes column');
    
    console.log('🎉 Advanced authentication migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAdvancedAuth()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateAdvancedAuth };

