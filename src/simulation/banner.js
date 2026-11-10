import { fiveStarChance, fourStarChance } from './pity.js';
import { rewardFor } from './economy.js';

export function runBanner(input, rng, pulls, state = {}) {
  let pity5 = state.pity5 ?? input.pity5, pity4 = state.pity4 ?? input.pity4, guaranteed5 = state.guaranteed5 ?? input.guaranteed5;
  let guaranteed4 = state.guaranteed4 ?? false;
  let event5 = 0, light = 0, fourStars = 0, fiveStars = 0;
  let copies4 = state.copies4 ?? 0, copies5 = state.copies5 ?? 0;
  for (let i = 0; i < pulls; i++) {
    const p5 = fiveStarChance(pity5), p4 = fourStarChance(pity4);
    if (rng() < p5) {
      const featured = guaranteed5 || rng() < 0.5;
      event5 += featured ? 1 : 0; fiveStars++;
      if (!featured) guaranteed5 = true; else guaranteed5 = false;
      const duplicate5 = copies5 > 0;
      light += rewardFor({ rarity: 5, kind: 'character', duplicate: duplicate5, maxed: duplicate5 && rng() < input.maxed5 / 7 }).light;
      copies5++; pity5 = 0; pity4++;
    } else if (rng() < p4 / Math.max(0.0001, 1 - p5)) {
      const featured = guaranteed4 || rng() < 0.5;
      guaranteed4 = !featured;
      fourStars++; copies4++;
      light += rewardFor({ rarity: 4, kind: featured ? 'character' : 'lightcone', duplicate: true, maxed: featured && rng() < input.maxed4 / 3 }).light;
      pity4 = 0; pity5++;
    } else { pity5++; pity4++; }
  }
  return { event5, light, pity5, pity4, guaranteed5, guaranteed4, copies4, copies5, fiveStars, fourStars, pulls };
}

// Стандартный баннер имеет собственный pity и никогда не увеличивает event5.
export function runStandard(input, rng, pulls) {
  let pity5 = 0, pity4 = 0;
  let light = 0, fourStars = 0, fiveStars = 0;
  for (let i = 0; i < pulls; i++) {
    const p5 = fiveStarChance(pity5), p4 = fourStarChance(pity4);
    if (rng() < p5) {
      fiveStars++;
      // The seven standard 5★ characters are a known pool; the entered E6+
      // count directly determines the share of maxed-duplicate rewards.
      const isCharacter = rng() < 0.5;
      if (!isCharacter) light += 40;
      else {
        const isOwned = rng() < 0.5; // User does not enter their full roster.
        if (isOwned) light += rng() < input.maxed5 / 7 ? 100 : 40;
      }
      pity5 = 0; pity4++;
    } else if (rng() < p4 / Math.max(0.0001, 1 - p5)) {
      const isCharacter = rng() < 0.5;
      if (!isCharacter) light += 8;
      else if (rng() < 0.5) light += rng() < input.maxed4 / 3 ? 20 : 8;
      fourStars++; pity4 = 0; pity5++;
    } else { pity5++; pity4++; }
  }
  return { pulls, light, fourStars, fiveStars, pity5, pity4 };
}
