import { slugCanonico } from '@v2/shared/content';
import { describe, expect, it } from 'vitest';

import { BLOG_POSTS, findBlogPost, findBlogPostByLegacySlug } from '../blog-registry';

describe('BLOG_POSTS registry', () => {
  it('loads 22 posts', () => {
    expect(BLOG_POSTS).toHaveLength(22);
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

  it('every slug is the canonical slug of its own title (the repair, T4)', () => {
    for (const p of BLOG_POSTS) {
      expect(p.slug).toBe(slugCanonico(p.title));
    }
  });

  it('slugs are unique', () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('legacySlugs are kebab-case, distinct from their own slug, and disjoint from the canonical set', () => {
    const canonicos = new Set(BLOG_POSTS.map((p) => p.slug));
    for (const p of BLOG_POSTS) {
      for (const legacy of p.legacySlugs) {
        expect(legacy).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        expect(legacy).not.toBe(p.slug);
        expect(canonicos.has(legacy)).toBe(false);
      }
    }
  });

  it('findBlogPostByLegacySlug resolves to the owning post, undefined otherwise', () => {
    const owner = BLOG_POSTS.find((p) => p.legacySlugs.length > 0);
    expect(owner).toBeDefined();
    const legacy = owner?.legacySlugs[0] ?? '';
    expect(findBlogPostByLegacySlug(legacy)?.slug).toBe(owner?.slug);
    expect(findBlogPostByLegacySlug('no-existe')).toBeUndefined();
  });

  it('still has 22 posts, all with non-empty bodies', () => {
    expect(BLOG_POSTS).toHaveLength(22);
    for (const p of BLOG_POSTS) {
      expect(p.body.length).toBeGreaterThan(0);
    }
  });

  it('las portadas piloto tienen ruta pública, texto alternativo, leyenda y crédito', () => {
    const conPortada = BLOG_POSTS.filter((post) => post.coverImageUrl !== '');
    expect(conPortada).toHaveLength(6);
    for (const post of conPortada) {
      expect(post.coverImageUrl).toMatch(/^\/media\/bitacora\/pilotos\/.+\.webp$/);
      expect(post.coverImageAlt.length).toBeGreaterThan(20);
      expect(post.coverImageCaption.length).toBeGreaterThan(10);
      expect(post.coverImageCredit.length).toBeGreaterThan(5);
      expect(post.updatedAt).toBe('2026-08-14T00:00:00Z');
    }
  });
});
