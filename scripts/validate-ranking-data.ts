import path from 'node:path';

import {
  rankingDataValidationUsage,
  validateRankingDataPath,
} from './validate-ranking-data-core';

const rawArg = process.argv[2] ?? '';

if (!rawArg.trim()) {
  console.error(rankingDataValidationUsage);
  process.exit(1);
}

const result = validateRankingDataPath(rawArg);

if (result.errors.length > 0) {
  console.error(
    `Валидация ranking data провалена: ${path.relative(process.cwd(), result.dataPath)}`,
  );
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }

  if (result.warnings.length > 0) {
    console.error('Предупреждения:');
    for (const warning of result.warnings) {
      console.error(`- ${warning}`);
    }
  }

  process.exit(1);
}

console.log(
  `Ranking data валиден: ${path.relative(process.cwd(), result.dataPath)}`,
);

if (result.warnings.length > 0) {
  console.log('Предупреждения:');
  for (const warning of result.warnings) {
    console.log(`- ${warning}`);
  }
}
