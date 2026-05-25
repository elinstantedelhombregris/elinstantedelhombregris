import { eq } from 'drizzle-orm';
import { db, schema } from './db-neon';
const { blogPosts } = schema;
import { blogContentUpdates } from '../shared/blogContent';

// Must match the slugify used for keys in blogContent.ts and the DB slug.
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Updates the content + excerpt of an EXISTING blog post from blogContent.ts.
// Use this to edit a published post (the seed script only inserts, it skips existing slugs).
// Usage: npx tsx scripts/update-blog-content.ts "<title or slug>"
async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: npx tsx scripts/update-blog-content.ts "<title or slug>"');
    process.exit(1);
  }
  const slug = slugify(arg);
  const entry = blogContentUpdates[slug];
  if (!entry) {
    console.error(`❌ No content entry in blogContent.ts for slug "${slug}"`);
    process.exit(1);
  }
  const updated = await db
    .update(blogPosts)
    .set({ content: entry.content, excerpt: entry.excerpt, updatedAt: new Date().toISOString() })
    .where(eq(blogPosts.slug, slug))
    .returning({ id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title });
  if (updated.length === 0) {
    console.error(`❌ No post with slug "${slug}" exists in the DB. Nothing updated.`);
    process.exit(1);
  }
  console.log(`✅ Updated post id ${updated[0].id} — "${updated[0].title}" (${updated[0].slug})`);
  process.exit(0);
}

main();
