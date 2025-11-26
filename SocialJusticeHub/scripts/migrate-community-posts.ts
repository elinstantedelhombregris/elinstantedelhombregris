import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';

const sqlite = new Database('./local.db');
const db = drizzle(sqlite);

async function migrateCommunityPosts() {
  console.log('🚀 Starting community posts migration...');

  try {
    // Add new columns to community_posts table
    console.log('📝 Adding new columns to community_posts table...');
    
    // Check if columns exist before adding them
    const tableInfo = sqlite.prepare("PRAGMA table_info(community_posts)").all() as any[];
    const existingColumns = tableInfo.map(col => col.name);
    
    const newColumns = [
      { name: 'status', sql: "ALTER TABLE community_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'active'" },
      { name: 'views', sql: "ALTER TABLE community_posts ADD COLUMN views INTEGER DEFAULT 0" },
      { name: 'expires_at', sql: "ALTER TABLE community_posts ADD COLUMN expires_at TEXT" },
      { name: 'contact_email', sql: "ALTER TABLE community_posts ADD COLUMN contact_email TEXT" },
      { name: 'contact_phone', sql: "ALTER TABLE community_posts ADD COLUMN contact_phone TEXT" },
      { name: 'updated_at', sql: "ALTER TABLE community_posts ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP" }
    ];

    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`  ➕ Adding column: ${column.name}`);
        sqlite.exec(column.sql);
      } else {
        console.log(`  ✅ Column ${column.name} already exists`);
      }
    }

    // Create new tables
    console.log('📝 Creating new tables...');

    // Create community_post_interactions table
    const interactionsTableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='community_post_interactions'
    `).get();

    if (!interactionsTableExists) {
      console.log('  ➕ Creating community_post_interactions table...');
      sqlite.exec(`
        CREATE TABLE community_post_interactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER,
          user_id INTEGER,
          type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          message TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES community_posts (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
    } else {
      console.log('  ✅ community_post_interactions table already exists');
    }

    // Create community_messages table
    const messagesTableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='community_messages'
    `).get();

    if (!messagesTableExists) {
      console.log('  ➕ Creating community_messages table...');
      sqlite.exec(`
        CREATE TABLE community_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER,
          receiver_id INTEGER,
          post_id INTEGER,
          subject TEXT NOT NULL,
          content TEXT NOT NULL,
          read INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users (id),
          FOREIGN KEY (receiver_id) REFERENCES users (id),
          FOREIGN KEY (post_id) REFERENCES community_posts (id)
        )
      `);
    } else {
      console.log('  ✅ community_messages table already exists');
    }

    // Create community_post_activity table
    const activityTableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='community_post_activity'
    `).get();

    if (!activityTableExists) {
      console.log('  ➕ Creating community_post_activity table...');
      sqlite.exec(`
        CREATE TABLE community_post_activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER,
          user_id INTEGER,
          activity_type TEXT NOT NULL,
          metadata TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES community_posts (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
    } else {
      console.log('  ✅ community_post_activity table already exists');
    }

    console.log('✅ Community posts migration completed successfully!');
    
    // Show updated schema
    console.log('\n📋 Updated community_posts schema:');
    const updatedTableInfo = sqlite.prepare("PRAGMA table_info(community_posts)").all();
    console.table(updatedTableInfo);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// Run migration
migrateCommunityPosts()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
