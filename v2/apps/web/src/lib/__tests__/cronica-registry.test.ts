import { describe, expect, it } from 'vitest';

import { CRONICA_CHAPTERS, findCronicaChapterBySlug } from '../cronica-registry';

const EXPECTED_TITLES = [
  'La Semilla',
  'La Prueba',
  'La Circunscripción',
  'La Cabecera de Puente',
  'La Ejecución',
];

describe('CRONICA_CHAPTERS registry', () => {
  it('loads exactly the 5 chapters of «La crónica del país que viene»', () => {
    expect(CRONICA_CHAPTERS).toHaveLength(5);
  });

  it('every entry has non-empty slug/title/subtitle/epigraph/body', () => {
    for (const c of CRONICA_CHAPTERS) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.subtitle.length).toBeGreaterThan(0);
      expect(c.epigraph.length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(0);
      expect(c.body).not.toMatch(/^---\n/);
    }
  });

  it('is sorted by orderIndex 1..5 — order is explicit, never filename-derived', () => {
    expect(CRONICA_CHAPTERS.map((c) => c.orderIndex)).toEqual([1, 2, 3, 4, 5]);
    // Re-sorting by orderIndex must be a no-op: the registry itself is the
    // sorted source of truth, not an artifact of glob/filesystem order.
    const resorted = [...CRONICA_CHAPTERS].sort((a, b) => a.orderIndex - b.orderIndex);
    expect(resorted.map((c) => c.slug)).toEqual(CRONICA_CHAPTERS.map((c) => c.slug));
  });

  it('titles match the source novela, in chapter order', () => {
    expect(CRONICA_CHAPTERS.map((c) => c.title)).toEqual(EXPECTED_TITLES);
  });

  it('findCronicaChapterBySlug returns by slug, undefined for unknown', () => {
    const first = CRONICA_CHAPTERS[0];
    expect(first).toBeDefined();
    const slug = first?.slug ?? '';
    expect(findCronicaChapterBySlug(slug)?.slug).toBe(slug);
    expect(findCronicaChapterBySlug('does-not-exist')).toBeUndefined();
  });

  it('title/subtitle/epigraph are fully unquoted (no leading/trailing quote, no doubled quote)', () => {
    for (const c of CRONICA_CHAPTERS) {
      expect(c.title).not.toMatch(/^['"]|['"]$/);
      expect(c.subtitle).not.toMatch(/^['"]|['"]$/);
      expect(c.epigraph).not.toMatch(/^['"]|['"]$/);
      expect(c.title).not.toContain("''");
    }
  });
});
