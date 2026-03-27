import {PokemonEntry} from './types';
import data from '../../../../public/ranking-corridor/2026-03-25-strongest-pokemon/data.json';

const rawEntries = data.entries as PokemonEntry[];
const maxPower = Math.max(...rawEntries.map(e => e.base_stat_total));
const minPower = Math.min(...rawEntries.map(e => e.base_stat_total));
const powerRange = Math.max(1, maxPower - minPower);
const entryCount = Math.max(1, rawEntries.length - 1);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getVisualScale = (entry: PokemonEntry) => {
  const metricProgress = clamp01((entry.base_stat_total - minPower) / powerRange);
  const metricSpread = Math.pow(metricProgress, 0.58);
  const rankProgress = clamp01(1 - (entry.rank - 1) / entryCount);

  // Visual scale stays faithful to the metric, but rank helps break large tie clusters.
  return clamp01(metricSpread * 0.75 + rankProgress * 0.25);
};

export const dataset = rawEntries.map(e => ({
  ...e,
  relHeight: getVisualScale(e),
}));
