import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and, or, like } from "drizzle-orm";
import { blogPosts, postTags, users } from "../shared/schema";

const sqlite = new Database("./local.db");
const db = drizzle(sqlite);

async function testGetBlogPosts() {
  try {
    console.log("Testing getBlogPosts...");
    
    const filters: any = {
      page: 1,
      limit: 12
    };

    // Apply pagination
    const offset = filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0;
    const limit = filters?.limit || 10;
    
    // Build the query base
    let query = db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      authorId: blogPosts.authorId,
      publishedAt: blogPosts.publishedAt,
      category: blogPosts.category,
      featured: blogPosts.featured,
      imageUrl: blogPosts.imageUrl,
      videoUrl: blogPosts.videoUrl,
      viewCount: blogPosts.viewCount,
      type: blogPosts.type
    })
    .from(blogPosts);

    // Build where conditions
    const conditions: any[] = [];
    
    if (filters?.type && typeof filters.type === 'string' && filters.type.trim() !== '') {
      conditions.push(eq(blogPosts.type, filters.type as 'blog' | 'vlog'));
    }
    
    if (filters?.category && typeof filters.category === 'string' && filters.category.trim() !== '') {
      conditions.push(eq(blogPosts.category, filters.category));
    }
    
    if (filters?.featured !== undefined && filters.featured !== null) {
      conditions.push(eq(blogPosts.featured, filters.featured));
    }
    
    if (filters?.search && typeof filters.search === 'string' && filters.search.trim() !== '') {
      conditions.push(
        or(
          like(blogPosts.title, `%${filters.search}%`),
          like(blogPosts.excerpt, `%${filters.search}%`),
          like(blogPosts.content, `%${filters.search}%`)
        )!
      );
    }

    // Apply where conditions
    if (conditions.length === 1) {
      query = query.where(conditions[0]);
    } else if (conditions.length > 1) {
      query = query.where(and(...conditions)!);
    }
    
    console.log("Executing query...");
    const allPosts = await query
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    console.log(`✅ Found ${allPosts.length} posts`);
    
    // Get author info and tags for each post
    const postsWithAuthors = await Promise.all(allPosts.map(async (post) => {
      let author = null;
      if (post.authorId) {
        const authorResult = await db.select({
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email
        })
        .from(users)
        .where(eq(users.id, post.authorId))
        .limit(1);
        author = authorResult[0] || null;
      }

      const tags = await db.select({
        tag: postTags.tag
      })
      .from(postTags)
      .where(eq(postTags.postId, post.id));

      return {
        ...post,
        author: author || { id: post.authorId || 0, name: 'Usuario', username: 'usuario', email: '' },
        tags: tags || []
      };
    }));

    console.log(`✅ Processed ${postsWithAuthors.length} posts with authors and tags`);
    console.log("First post:", JSON.stringify(postsWithAuthors[0], null, 2));
    
    sqlite.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
    sqlite.close();
    process.exit(1);
  }
}

testGetBlogPosts();






