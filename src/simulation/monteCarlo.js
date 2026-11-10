import { initialPulls, lightPullsFromBalance } from './economy.js';
import { runBanner, runStandard } from './banner.js';

function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function simulate(input, iterations = 100000, onProgress) {
  const start = initialPulls(input), outcomes = [], traces = [], successPullCounts = [];
  let success = 0, sum = 0;
  for (let n = 0; n < iterations; n++) {
    const rng = seeded(0xC011CE + n);
    const standard = runStandard(input, rng, start.standard);
    let eventResult = runBanner(input, rng, start.eventTotal);
    let bannerState = eventResult;
    let lightBalance = Math.max(0, input.light - start.eventFromLight * 20) + standard.light + eventResult.light;
    const rows = [];
    if (start.standard) rows.push({ label: 'Стандартный баннер · отдельный pity', pulls: start.standard, result: standard, standard: true });
    rows.push({ label: 'Ивентовый баннер · стартовые ресурсы', pulls: start.eventTotal, result: eventResult });
    let recursivePulls = 0, cycles = 0;
    while (cycles++ < 8) {
      const extra = lightPullsFromBalance(lightBalance, input);
      if (!extra) break;
      lightBalance -= extra * 20;
      const next = runBanner(input, rng, extra, bannerState);
      rows.push({ label: `Кэшбек звёздным светом · цикл ${cycles}`, pulls: extra, lightSpent: extra * 20, result: next });
      recursivePulls += extra;
      bannerState = next;
      eventResult = { ...next, event5: eventResult.event5 + next.event5, light: eventResult.light + next.light, fiveStars: eventResult.fiveStars + next.fiveStars, fourStars: eventResult.fourStars + next.fourStars };
      lightBalance += next.light;
    }
    const got = eventResult.event5;
    const succeeded = got >= input.target;
    success += succeeded ? 1 : 0; sum += got; outcomes.push(got);
    traces.push({ got, rows, lightBalance, total: eventResult, recursivePulls });
    if (onProgress && n % 2500 === 0) onProgress(n / iterations);
  }
  outcomes.sort((a,b) => a-b);
  const probability = success / iterations;
  const error = Math.sqrt(probability * (1 - probability) / iterations);
  const mean = sum / iterations;
  const averagePullsUsed = traces.reduce((sum, trace) => sum + trace.rows.filter(row=>!row.standard).reduce((s,row) => s + row.pulls, 0), 0) / traces.length;
  const representative = traces.reduce((best, trace) => {
    const score = item => Math.abs(item.got - mean) * 4 + Math.abs(item.rows.filter(row=>!row.standard).reduce((s,row) => s + row.pulls, 0) - averagePullsUsed);
    return score(trace) < score(best) ? trace : best;
  }, traces[0]);
  // Lightweight planning estimate (not a second nested Monte-Carlo run).
  // Extrapolate from the remaining probability gap and target count; pity makes
  // the true relationship nonlinear, so the UI explicitly labels it an estimate.
  const extraPulls = probability >= input.desired / 100 ? 0 : Math.ceil(
    (input.desired / 100 - probability) * Math.max(1, input.target) * 90 / Math.max(0.05, 1 - probability)
  );
  return { probability, error, mean, median: outcomes[Math.floor(iterations / 2)], p10: outcomes[Math.floor(iterations * .1)], p90: outcomes[Math.floor(iterations * .9)], pulls: start, counts: { recursive: representative.recursivePulls }, trace: representative, extraPulls, iterations };
}
