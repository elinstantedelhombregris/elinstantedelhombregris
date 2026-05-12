/**
 * Level curve: level n requires SUM_{k=1..n-1}(100 * k) = 100 * (n-1) * n / 2
 * total XP. So level 1: 0 XP, level 2: 100, level 3: 300, level 4: 600,
 * level 5: 1000, level 6: 1500, …
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return (100 * n * (n + 1)) / 2;
}

export function levelForXp(xp: number): number {
  if (xp < 100) return 1;
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function xpToNextLevel(xp: number): {
  currentLevel: number;
  nextLevel: number;
  xpIntoLevel: number;
  xpForCurrent: number;
  xpForNext: number;
} {
  const currentLevel = levelForXp(xp);
  const xpForCurrent = xpForLevel(currentLevel);
  const xpForNext = xpForLevel(currentLevel + 1);
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    xpIntoLevel: xp - xpForCurrent,
    xpForCurrent,
    xpForNext,
  };
}
