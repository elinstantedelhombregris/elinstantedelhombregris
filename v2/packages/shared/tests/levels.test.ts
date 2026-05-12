import { describe, expect, it } from 'vitest';

import { levelForXp, xpForLevel, xpToNextLevel } from '../src/gamification/levels.js';

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });
  it('matches the documented curve', () => {
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(4)).toBe(600);
    expect(xpForLevel(5)).toBe(1000);
  });
});

describe('levelForXp', () => {
  it('returns 1 below 100 XP', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
  });
  it('crosses to level 2 at exactly 100 XP', () => {
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(299)).toBe(2);
  });
  it('crosses to level 3 at 300 XP', () => {
    expect(levelForXp(300)).toBe(3);
  });
  it('handles large XP values', () => {
    expect(levelForXp(10_000)).toBeGreaterThan(10);
  });
});

describe('xpToNextLevel', () => {
  it('reports xpIntoLevel correctly mid-level', () => {
    const r = xpToNextLevel(150);
    expect(r.currentLevel).toBe(2);
    expect(r.nextLevel).toBe(3);
    expect(r.xpForCurrent).toBe(100);
    expect(r.xpForNext).toBe(300);
    expect(r.xpIntoLevel).toBe(50);
  });
});
