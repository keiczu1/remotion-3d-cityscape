import {PokemonEntry} from './types';
import data from '../../../../public/ranking-corridor/2026-04-07-best-selling-mobile-games/data.json';

const rawEntries = data.entries as PokemonEntry[];
const entryCount = Math.max(1, rawEntries.length - 1);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getVisualScale = (entry: PokemonEntry) => {
  // Строгая линейная прогрессия по рангам для точной ступенчатости
  // 60-е место получит 0, 1-е место получит 1
  return clamp01(1 - (entry.rank - 1) / entryCount);
};

export const dataset = rawEntries.map(e => ({
  ...e,
  relHeight: getVisualScale(e),
}));
