import { describe, expect, it } from 'vitest';

import { BLOG_POSTS, findBlogPost } from '../blog-registry';

describe('BLOG_POSTS registry', () => {
  it('loads 19 posts', () => {
    expect(BLOG_POSTS).toHaveLength(19);
  });

  it('every entry has non-empty slug/title/summary/body and type blog', () => {
    for (const p of BLOG_POSTS) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.summary.length).toBeGreaterThan(0);
      expect(p.body.length).toBeGreaterThan(0);
      expect(p.body).not.toMatch(/^---\n/);
      expect(p.type).toBe('blog');
      expect(p.readingMinutes).toBeGreaterThanOrEqual(1);
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });

  it('sorts newest first by publishedAt', () => {
    for (let i = 1; i < BLOG_POSTS.length; i++) {
      const prev = BLOG_POSTS[i - 1];
      const curr = BLOG_POSTS[i];
      expect(prev).toBeDefined();
      expect(curr).toBeDefined();
      expect((prev?.publishedAt ?? '') >= (curr?.publishedAt ?? '')).toBe(true);
    }
  });

  it('findBlogPost returns by slug, undefined for unknown', () => {
    const first = BLOG_POSTS[0];
    expect(first).toBeDefined();
    const slug = first?.slug ?? '';
    expect(findBlogPost(slug)?.slug).toBe(slug);
    expect(findBlogPost('does-not-exist')).toBeUndefined();
  });

  it('title/summary are fully unquoted (no leading/trailing quote, no doubled quote)', () => {
    for (const p of BLOG_POSTS) {
      expect(p.title).not.toMatch(/^['"]|['"]$/);
      expect(p.summary).not.toMatch(/^['"]|['"]$/);
      expect(p.title).not.toContain("''");
      expect(p.summary).not.toContain("''");
    }
  });
});
