export const FIVE_STAR_BASE = 0.006;
export function fiveStarChance(pity) {
  if (pity >= 89) return 1;
  if (pity < 73) return FIVE_STAR_BASE;
  // Явная эмпирическая кривая: +6 процентных пунктов с 74-й крутки.
  return Math.min(1, FIVE_STAR_BASE + (pity - 72) * 0.06);
}
export function fourStarChance(pity) {
  if (pity >= 9) return 1;
  if (pity < 7) return 0.051;
  return Math.min(1, 0.051 + (pity - 6) * 0.25);
}
