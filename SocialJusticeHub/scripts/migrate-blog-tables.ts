import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../shared/schema';

const sqlite = new Database('local.db');
const db = drizzle(sqlite, { schema });

async function main() {
  console.log('Creating blog tables...');
  
  try {
    // Create blog_posts table
    await db.run(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        published_at DATETIME,
        category TEXT,
        featured BOOLEAN DEFAULT FALSE,
        image_url TEXT,
        video_url TEXT,
        view_count INTEGER DEFAULT 0,
        type TEXT NOT NULL DEFAULT 'blog',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `);
    console.log('✅ blog_posts table created');

    // Create post_tags table
    await db.run(`
      CREATE TABLE IF NOT EXISTS post_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        tag TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
        UNIQUE(post_id, tag)
      )
    `);
    console.log('✅ post_tags table created');

    // Create post_likes table
    await db.run(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(post_id, user_id)
      )
    `);
    console.log('✅ post_likes table created');

    // Create post_comments table
    await db.run(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES post_comments (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ post_comments table created');

    // Create post_bookmarks table
    await db.run(`
      CREATE TABLE IF NOT EXISTS post_bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(post_id, user_id)
      )
    `);
    console.log('✅ post_bookmarks table created');

    // Create post_views table
    await db.run(`
      CREATE TABLE IF NOT EXISTS post_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )
    `);
    console.log('✅ post_views table created');

    // Create indexes for better performance
    await db.run(`CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts (author_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts (category)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_blog_posts_type ON blog_posts (type)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (published_at)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags (post_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes (post_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments (post_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON post_bookmarks (user_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views (post_id)`);

    console.log('✅ Blog tables and indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating blog tables:', error);
  }
}

// Run the main function
main().finally(() => {
  console.log('Closing database connection...');
  sqlite.close();
  console.log('Database connection closed.');
});
