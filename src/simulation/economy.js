export const PULL_COST = 160;
export const LIGHT_PULL_COST = 20;

// Пепел намеренно не участвует в калькуляторе: игрок конвертирует его сам.
export function initialPulls(input) {
  const jade = input.jade + (input.spendPremium ? input.premium : 0);
  const eventFromJade = Math.floor(jade / PULL_COST);
  const eventFromLight = input.spendLight ? Math.floor(Math.max(0, input.light - input.lightReserve) / LIGHT_PULL_COST) : 0;
  const standard = input.useStandard ? input.standardPulls : 0;
  return {
    eventOwned: input.pulls,
    eventFromJade,
    eventFromLight,
    standard,
    eventTotal: input.pulls + eventFromJade + eventFromLight,
    total: input.pulls + eventFromJade + eventFromLight
  };
}

export function lightPullsFromBalance(light, input) {
  return input.spendLight ? Math.floor(Math.max(0, light - input.lightReserve) / LIGHT_PULL_COST) : 0;
}

export function rewardFor({ rarity, kind, duplicate, maxed }) {
  if (kind === 'character' && !duplicate) return { light: 0 };
  if (rarity === 4) return { light: maxed ? 20 : 8 };
  if (rarity === 5) return { light: maxed ? 100 : 40 };
  return { light: 0 };
}
