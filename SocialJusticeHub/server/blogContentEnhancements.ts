import type { BlogPost } from "@shared/schema";
import { blogContentUpdates } from "@shared/blogContent";

type PostWithContent = Pick<BlogPost, "slug" | "content" | "excerpt"> & Record<string, any>;

export const applyBlogContentEnhancements = <T extends PostWithContent>(post: T): T => {
  if (!post?.slug) {
    return post;
  }

  const update = blogContentUpdates[post.slug];
  if (!update) {
    return post;
  }

  return {
    ...post,
    content: update.content ?? post.content,
    excerpt: update.excerpt ?? post.excerpt,
  };
};

export const applyEnhancementsToList = <T extends PostWithContent>(posts: T[]): T[] => {
  return posts.map((post) => applyBlogContentEnhancements(post));
};
