import {LeaderSalaryEntry} from './types';
import data from '../../../../public/ranking-corridor/2026-06-09-presidents-monthly-salaries/data.json';

type RawLeaderSalaryEntry = Omit<LeaderSalaryEntry, 'relHeight'>;

const rawEntries = data.entries as RawLeaderSalaryEntry[];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const minSalary = rawEntries[rawEntries.length - 1].salary_usd_monthly_equivalent;
const maxSalary = rawEntries[0].salary_usd_monthly_equivalent;

const getVisualScale = (entry: RawLeaderSalaryEntry) => {
  return clamp01((entry.salary_usd_monthly_equivalent - minSalary) / (maxSalary - minSalary));
};

export const dataset = rawEntries.map(e => ({
  ...e,
  relHeight: getVisualScale(e),
}));
