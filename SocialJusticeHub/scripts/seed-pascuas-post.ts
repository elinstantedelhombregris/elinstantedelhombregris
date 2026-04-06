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

const slug = createSlug("El Cristo que llevás dentro");
const content = blogContentUpdates[slug];

if (!content) {
  console.error("No content found for slug:", slug);
  process.exit(1);
}

async function seedPascuasPost() {
  console.log("Inserting Pascuas blog post...");

  try {
    const result = await db.insert(blogPosts).values({
      title: "El Cristo que llevás dentro",
      slug,
      excerpt: content.excerpt,
      content: content.content,
      category: "Filosofía",
      type: "blog",
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1504700610630-ac6edd9b9e29?w=800&h=400&fit=crop",
      authorId: 1,
      publishedAt: new Date("2026-04-05").toISOString(),
    }).returning();

    const postId = result[0].id;

    const tags = ["pascuas", "consciencia", "despertar", "etimología", "transformación"];
    for (const tag of tags) {
      await db.insert(postTags).values({ postId, tag });
    }

    console.log(`Created blog post: "El Cristo que llevás dentro" (id: ${postId})`);
  } catch (error) {
    console.error("Error inserting post:", error);
  }
}

seedPascuasPost().then(() => {
  console.log('Done.');
  process.exit(0);
});
