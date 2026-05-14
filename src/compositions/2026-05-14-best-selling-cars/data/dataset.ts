import {CarEntry} from './types';
import data from '../../../../public/ranking-corridor/2026-05-14-best-selling-cars/data.json';

const rawEntries = data.entries as CarEntry[];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const minSales = rawEntries[rawEntries.length - 1].sales_value;
const maxSales = rawEntries[0].sales_value;

const getVisualScale = (entry: CarEntry) => {
  return clamp01((entry.sales_value - minSales) / (maxSales - minSales));
};

export const dataset = rawEntries.map(e => ({
  ...e,
  relHeight: getVisualScale(e),
}));
