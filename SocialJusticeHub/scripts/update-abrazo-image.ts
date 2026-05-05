import { db, schema } from './db-neon';
import { eq } from 'drizzle-orm';

async function main() {
  const newUrl = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop';
  const slug = 'el-abrazo-que-no-supimos-sostener';

  const before = await db.select({ id: schema.blogPosts.id, imageUrl: schema.blogPosts.imageUrl })
    .from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug));
  console.log('BEFORE:', JSON.stringify(before, null, 2));

  const updated = await db.update(schema.blogPosts)
    .set({ imageUrl: newUrl })
    .where(eq(schema.blogPosts.slug, slug))
    .returning({ id: schema.blogPosts.id, imageUrl: schema.blogPosts.imageUrl });
  console.log('AFTER:', JSON.stringify(updated, null, 2));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
