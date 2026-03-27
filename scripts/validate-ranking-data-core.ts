import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

export type FactualityMode =
  | 'official-only'
  | 'creative-ranking'
  | 'hybrid-curated';

export type FactCheckStatus = 'verified' | 'mixed' | 'creative';

type GenericRankingEntry = Record<string, unknown> & {
  rank?: unknown;
  image_file?: unknown;
};

type RankingDataFile = {
  project_slug?: unknown;
  total_entries?: unknown;
  methodology?: {
    mode?: unknown;
    fact_check_status?: unknown;
    scope?: unknown;
    scope_note?: unknown;
    image_base_path?: unknown;
  };
  entries?: unknown;
};

export type RankingDataValidationResult = {
  dataPath: string;
  projectSlug: string;
  errors: string[];
  warnings: string[];
};

export const rankingDataValidationUsage =
  'Использование: npm run validate:data -- <project-slug | path-to-data.json>';

const factualityModes = new Set<FactualityMode>([
  'official-only',
  'creative-ranking',
  'hybrid-curated',
]);

const factCheckStatuses = new Set<FactCheckStatus>([
  'verified',
  'mixed',
  'creative',
]);

const labelCandidateKeys = [
  'display_name',
  'name',
  'title',
  'label',
  'video_label',
  'pokemon_name',
  'domain',
] as const;

const asTrimmedString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const isPositiveInteger = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const parseLaunchCardFactualityMode = (launchCardText: string) => {
  const match = launchCardText.match(
    /^- Режим фактологичности рейтинга:\s*`?([^`\r\n]+?)`?\s*$/m,
  );
  return match?.[1]?.trim() ?? '';
};

const hasLaunchCardFactNote = (launchCardText: string) =>
  /^- Фактологическая оговорка:\s*(.+)$/m.test(launchCardText);

export const resolveRankingDataPath = (arg: string, cwd = process.cwd()) => {
  const trimmedArg = arg.trim();

  if (!trimmedArg) {
    return '';
  }

  const explicitPath = path.resolve(cwd, trimmedArg);
  if (existsSync(explicitPath)) {
    if (explicitPath.endsWith('.json')) {
      return explicitPath;
    }

    const nestedDataPath = path.join(explicitPath, 'data.json');
    if (existsSync(nestedDataPath)) {
      return nestedDataPath;
    }
  }

  return path.resolve(
    cwd,
    'public',
    'ranking-corridor',
    trimmedArg,
    'data.json',
  );
};

export const getProjectSlugFromRankingDataPath = (dataPath: string) => {
  const normalized = dataPath.replace(/\\/g, '/');
  const match = normalized.match(
    /\/public\/ranking-corridor\/([^/]+)\/data\.json$/,
  );
  return match?.[1] ?? '';
};

const getEntryLabel = (entry: GenericRankingEntry) => {
  for (const key of labelCandidateKeys) {
    const value = asTrimmedString(entry[key]);
    if (value) {
      return value;
    }
  }

  return '';
};

const validateEntry = ({
  entry,
  index,
  imageDir,
  seenRanks,
  seenImages,
  errors,
  warnings,
}: {
  entry: GenericRankingEntry;
  index: number;
  imageDir: string;
  seenRanks: Set<number>;
  seenImages: Set<string>;
  errors: string[];
  warnings: string[];
}) => {
  const rank = entry.rank;
  if (!isPositiveInteger(rank)) {
    errors.push(
      `Запись #${index + 1}: поле \`rank\` должно быть положительным целым числом.`,
    );
  } else {
    const rankValue = rank as number;

    if (seenRanks.has(rankValue)) {
      errors.push(`Запись #${index + 1}: rank \`${rankValue}\` дублируется.`);
      return;
    }

    seenRanks.add(rankValue);
  }

  if (!getEntryLabel(entry)) {
    warnings.push(
      `Запись #${index + 1}: не найдено ни одного человекочитаемого label-поля (${labelCandidateKeys.join(', ')}).`,
    );
  }

  const imageFile = asTrimmedString(entry.image_file);
  if (!imageFile) {
    errors.push(
      `Запись #${index + 1}: поле \`image_file\` обязательно для локального image-first dataset.`,
    );
    return;
  }

  if (seenImages.has(imageFile)) {
    errors.push(
      `Запись #${index + 1}: файл изображения \`${imageFile}\` используется повторно.`,
    );
  } else {
    seenImages.add(imageFile);
  }

  const imagePath = path.join(imageDir, imageFile);
  if (!existsSync(imagePath)) {
    errors.push(`Запись #${index + 1}: локальный ассет не найден: ${imagePath}`);
  }
};

export const validateRankingDataPath = (
  arg: string,
  cwd = process.cwd(),
): RankingDataValidationResult => {
  const dataPath = resolveRankingDataPath(arg, cwd);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dataPath) {
    return {
      dataPath: '',
      projectSlug: '',
      errors: [rankingDataValidationUsage],
      warnings,
    };
  }

  if (!existsSync(dataPath)) {
    return {
      dataPath,
      projectSlug: '',
      errors: [`Файл данных не найден: ${dataPath}`],
      warnings,
    };
  }

  const slugFromPath = getProjectSlugFromRankingDataPath(dataPath);
  if (!slugFromPath) {
    return {
      dataPath,
      projectSlug: '',
      errors: [`Не удалось вывести project slug из пути: ${dataPath}`],
      warnings,
    };
  }

  const launchCardPath = path.resolve(
    cwd,
    'projects',
    slugFromPath,
    'launch-card.md',
  );
  const imageDir = path.resolve(
    cwd,
    'public',
    'ranking-corridor',
    slugFromPath,
    'images',
  );

  let parsed: RankingDataFile;

  try {
    parsed = JSON.parse(readFileSync(dataPath, 'utf8')) as RankingDataFile;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      dataPath,
      projectSlug: slugFromPath,
      errors: [`Не удалось прочитать JSON: ${message}`],
      warnings,
    };
  }

  const projectSlug = asTrimmedString(parsed.project_slug);
  if (projectSlug !== slugFromPath) {
    errors.push(
      `Поле \`project_slug\` должно совпадать с slug из пути. Сейчас JSON = \`${projectSlug || 'пусто'}\`, путь = \`${slugFromPath}\`.`,
    );
  }

  const methodology = parsed.methodology ?? {};
  const factualityMode = asTrimmedString(methodology.mode);
  const factCheckStatus = asTrimmedString(methodology.fact_check_status);
  const scope = asTrimmedString(methodology.scope);
  const scopeNote = asTrimmedString(methodology.scope_note);
  const imageBasePath = asTrimmedString(methodology.image_base_path);

  if (!factualityModes.has(factualityMode as FactualityMode)) {
    errors.push(
      'Поле `methodology.mode` обязательно и должно быть одним из: official-only | creative-ranking | hybrid-curated.',
    );
  }

  if (!factCheckStatuses.has(factCheckStatus as FactCheckStatus)) {
    errors.push(
      'Поле `methodology.fact_check_status` обязательно и должно быть одним из: verified | mixed | creative.',
    );
  }

  if (!scope) {
    errors.push('Поле `methodology.scope` обязательно.');
  }

  if (factualityMode === 'official-only' && factCheckStatus !== 'verified') {
    errors.push(
      'Для `methodology.mode = official-only` поле `methodology.fact_check_status` должно быть `verified`.',
    );
  }

  if (
    factualityMode === 'creative-ranking' &&
    factCheckStatus !== 'creative'
  ) {
    errors.push(
      'Для `methodology.mode = creative-ranking` поле `methodology.fact_check_status` должно быть `creative`.',
    );
  }

  if (
    factualityMode === 'hybrid-curated' &&
    !['mixed', 'verified'].includes(factCheckStatus)
  ) {
    errors.push(
      'Для `methodology.mode = hybrid-curated` поле `methodology.fact_check_status` должно быть `mixed` или `verified`.',
    );
  }

  if (factualityMode !== 'official-only' && !scopeNote) {
    errors.push(
      'Для non-official ranking режима поле `methodology.scope_note` обязательно и должно явно описывать оговорку по фактам.',
    );
  }

  const expectedImageBasePath = `/ranking-corridor/${slugFromPath}/images/`;
  if (imageBasePath && imageBasePath !== expectedImageBasePath) {
    errors.push(
      `Поле \`methodology.image_base_path\` должно быть \`${expectedImageBasePath}\`, сейчас \`${imageBasePath}\`.`,
    );
  }

  if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) {
    errors.push(
      'Поле `entries` обязательно и должно содержать минимум одну запись.',
    );
  }

  const entries = Array.isArray(parsed.entries)
    ? (parsed.entries as GenericRankingEntry[])
    : [];

  if (
    isPositiveInteger(parsed.total_entries) &&
    parsed.total_entries !== entries.length
  ) {
    errors.push(
      `Поле \`total_entries\` должно совпадать с количеством записей. Сейчас total_entries = ${parsed.total_entries}, entries = ${entries.length}.`,
    );
  }

  const seenRanks = new Set<number>();
  const seenImages = new Set<string>();

  entries.forEach((entry, index) => {
    validateEntry({
      entry,
      index,
      imageDir,
      seenRanks,
      seenImages,
      errors,
      warnings,
    });
  });

  if (seenRanks.size === entries.length && entries.length > 0) {
    for (let expectedRank = 1; expectedRank <= entries.length; expectedRank++) {
      if (!seenRanks.has(expectedRank)) {
        errors.push(
          `Ранги должны образовывать непрерывную последовательность 1..${entries.length}. Отсутствует rank ${expectedRank}.`,
        );
      }
    }
  }

  if (!existsSync(launchCardPath)) {
    errors.push(`Не найден launch-card проекта: ${launchCardPath}`);
  } else {
    const launchCardText = readFileSync(launchCardPath, 'utf8');
    const launchCardFactualityMode =
      parseLaunchCardFactualityMode(launchCardText);

    if (!launchCardFactualityMode) {
      errors.push(
        `В launch-card отсутствует поле \`Режим фактологичности рейтинга\`: ${launchCardPath}`,
      );
    } else if (launchCardFactualityMode !== factualityMode) {
      errors.push(
        `Режим фактологичности должен совпадать между launch-card и data.json. Сейчас launch-card = \`${launchCardFactualityMode}\`, data.json = \`${factualityMode}\`.`,
      );
    }

    if (
      factualityMode !== 'official-only' &&
      !hasLaunchCardFactNote(launchCardText)
    ) {
      warnings.push(
        'Для non-official ranking режима в launch-card желательно явно держать `Фактологическая оговорка` в заметках по данным.',
      );
    }
  }

  return {
    dataPath,
    projectSlug: slugFromPath,
    errors,
    warnings,
  };
};
