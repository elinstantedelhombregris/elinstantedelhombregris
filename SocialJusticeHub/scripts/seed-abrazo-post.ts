import { db, schema } from './db-neon';
const { blogPosts, postTags } = schema;
import { blogContentUpdates } from "../shared/blogContent";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const slug = createSlug("El abrazo que no supimos sostener");
const content = blogContentUpdates[slug];

if (!content) {
  console.error("No content found for slug:", slug);
  process.exit(1);
}

async function seedAbrazoPost() {
  console.log("Inserting 'El abrazo que no supimos sostener' blog post...");

  try {
    const result = await db.insert(blogPosts).values({
      title: "El abrazo que no supimos sostener",
      slug,
      excerpt: content.excerpt,
      content: content.content,
      category: "Filosofía",
      type: "blog",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop",
      authorId: 1,
      publishedAt: new Date("2026-04-17").toISOString(),
    }).returning();

    const postId = result[0].id;

    const tags = ["Argentina", "identidad", "Mundial", "comunidad", "transformación", "coreografía social"];
    for (const tag of tags) {
      await db.insert(postTags).values({ postId, tag });
    }

    console.log(`Created blog post: "El abrazo que no supimos sostener" (id: ${postId})`);
  } catch (error) {
    console.error("Error inserting post:", error);
  }
}

seedAbrazoPost().then(() => {
  console.log('Done.');
  process.exit(0);
});
