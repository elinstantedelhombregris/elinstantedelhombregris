import { describe, expect, it } from 'vitest';

import { ENSAYOS, findEnsayoBySlug } from '../ensayos-registry';

const EXPECTED_SERIES = ['primer-ciclo', 'indagaciones', 'interdependencia'] as const;

describe('ENSAYOS registry', () => {
  it('loads 21 ensayos across the three cycles', () => {
    expect(ENSAYOS).toHaveLength(21);
  });

  it('every entry has non-empty slug/title/summary/body and a valid form', () => {
    for (const e of ENSAYOS) {
      expect(e.slug).toMatch(/^[a-z0-9-]+$/);
      expect(e.title.length).toBeGreaterThan(0);
      expect(e.summary.length).toBeGreaterThan(0);
      expect(e.body.length).toBeGreaterThan(0);
      expect(e.body).not.toMatch(/^---\n/);
      expect(['ensayo', 'acta']).toContain(e.form);
    }
  });

  it('each of the three cycles has exactly 7 ensayos, in order 1..7', () => {
    for (const series of EXPECTED_SERIES) {
      const items = ENSAYOS.filter((e) => e.series === series).sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );
      expect(items).toHaveLength(7);
      expect(items.map((e) => e.orderIndex)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    }
  });

  it('no series outside the three known cycles', () => {
    const seriesSet = new Set(ENSAYOS.map((e) => e.series));
    expect([...seriesSet].sort()).toEqual([...EXPECTED_SERIES].sort());
  });

  it('exactly one acta: "Acta de la Interdependencia", the closer of the third cycle', () => {
    const actas = ENSAYOS.filter((e) => e.form === 'acta');
    expect(actas).toHaveLength(1);
    expect(actas[0]?.slug).toBe('acta-de-la-interdependencia');
    expect(actas[0]?.series).toBe('interdependencia');
    expect(actas[0]?.orderIndex).toBe(7);
  });

  it('findEnsayoBySlug returns by slug, undefined for unknown', () => {
    const first = ENSAYOS[0];
    expect(first).toBeDefined();
    const slug = first?.slug ?? '';
    expect(findEnsayoBySlug(slug)?.slug).toBe(slug);
    expect(findEnsayoBySlug('does-not-exist')).toBeUndefined();
  });

  it('title/summary are fully unquoted (no leading/trailing quote, no doubled quote)', () => {
    for (const e of ENSAYOS) {
      expect(e.title).not.toMatch(/^['"]|['"]$/);
      expect(e.summary).not.toMatch(/^['"]|['"]$/);
      expect(e.title).not.toContain("''");
      expect(e.summary).not.toContain("''");
    }
  });
});
