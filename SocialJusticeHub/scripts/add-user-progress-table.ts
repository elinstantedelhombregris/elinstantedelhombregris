import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema-sqlite';

// Connect to SQLite database
const sqlite = new Database('./local.db');
const db = drizzle(sqlite, { schema });

async function addUserProgressTable() {
  try {
    console.log('🚀 Adding user_progress table...');
    
    // Create user_progress table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        level INTEGER DEFAULT 1,
        points INTEGER DEFAULT 0,
        rank TEXT DEFAULT 'Novato',
        total_actions INTEGER DEFAULT 0,
        last_action_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    
    console.log('✅ user_progress table created successfully');
    
    // Check if table exists
    const tableInfo = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_progress'").get();
    if (tableInfo) {
      console.log('✅ Verified: user_progress table exists');
    } else {
      console.error('❌ Error: user_progress table was not created');
    }
    
  } catch (error) {
    console.error('❌ Error creating user_progress table:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

addUserProgressTable()
  .then(() => {
    console.log('✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

