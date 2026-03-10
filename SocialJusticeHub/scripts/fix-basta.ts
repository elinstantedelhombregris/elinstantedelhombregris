
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { blogPosts } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'local.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

async function fixBasta() {
  console.log('Starting BASTA -> ¡BASTA! correction...');

  try {
    // Ensure table exists
    const tableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='blog_posts'").get();
    if (!tableExists) {
        console.error("Table 'blog_posts' does not exist. Please run migrations first.");
        return;
    }

    // Fetch all blog posts
    const posts = await db.select().from(blogPosts).all();
    let updatedCount = 0;

    for (const post of posts) {
      let hasChanges = false;
      let newTitle = post.title;
      let newExcerpt = post.excerpt;
      let newContent = post.content;

      // Regex to match BASTA not preceded by ¡
      const regex = /(?<!¡)BASTA/g;

      if (newTitle && regex.test(newTitle)) {
        newTitle = newTitle.replace(regex, '¡BASTA!');
        hasChanges = true;
      }

      if (newExcerpt && regex.test(newExcerpt)) {
        newExcerpt = newExcerpt.replace(regex, '¡BASTA!');
        hasChanges = true;
      }

      if (newContent && regex.test(newContent)) {
        newContent = newContent.replace(regex, '¡BASTA!');
        hasChanges = true;
      }

      if (hasChanges) {
        await db.update(blogPosts)
          .set({
            title: newTitle,
            excerpt: newExcerpt,
            content: newContent,
          })
          .where(eq(blogPosts.id, post.id));
        
        console.log(`Updated post ID ${post.id}: "${post.title}" -> "${newTitle}"`);
        updatedCount++;
      }
    }

    console.log(`\nProcess completed. Updated ${updatedCount} posts.`);
  } catch (error) {
    console.error('Error updating posts:', error);
  }
}

fixBasta();
