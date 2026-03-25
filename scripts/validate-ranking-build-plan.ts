import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

type TaskPhase = 'preview-build' | 'post-preview-build';

type Task = {
  id: string;
  title: string;
  phase: TaskPhase;
  line: number;
  fields: Record<string, string>;
  miniReview: Record<string, string>;
};

type LaunchCardSelection = {
  exists: boolean;
  path: string;
  objectFamilyId: string;
  scenePresetPackageId: string;
  scenePresetReusePolicy: string;
  scenePresetSourceOfTruthFiles: string[];
  scenePresetLockedBehavior: string;
  heroRevealPackageId: string;
  heroRevealReusePolicy: string;
  heroRevealSourceOfTruthFiles: string[];
  heroRevealLockedBehavior: string;
  mainCameraId: string;
  timingId: string;
};

type RegistryCameraPreset = {
  moduleId: string;
  reusePolicy: string;
  sourceOfTruthFiles: string[];
  lockedBehavior: string;
  timingContract: string;
  supportedFps: number | null;
  timingPolicyId: string;
  defaultFinaleTailPolicy: string;
  supportedCountRange: [number, number] | null;
  targetDurationBandSeconds: [number, number] | null;
};

type RegistryRevealModule = {
  moduleId: string;
  heroFamilyFit: string[];
  reusePolicy: string;
  sourceOfTruthFiles: string[];
  lockedBehavior: string;
};

type CliOptions = {
  buildPlanArg: string;
  finalizeTaskId: string | null;
};

type BuildPlanScanTask = {
  id: string;
  phase: TaskPhase | null;
  status: string;
  previewRole: string;
  lineIndex: number;
  statusLineIndex: number;
};

type BuildPlanScan = {
  currentPlanPhase: string;
  nextStepLineIndex: number;
  updatedLineIndex: number;
  tasks: BuildPlanScanTask[];
};

type ProjectDataSnapshot = {
  slug: string;
  path: string;
  count: number | null;
};

const allowedPlanStatuses = new Set([
  'draft',
  'active',
  'preview-complete',
  'full-complete',
]);

const allowedTaskStatuses = new Set(['todo', 'in_progress', 'blocked', 'done']);
const allowedPreviewRoles = new Set([
  'support',
  'hero-preview',
  'camera-preview',
  'environment-preview',
  'integrated-preview',
]);
const allowedNextSteps = new Set([
  'preview-gate',
  'final-approval',
  'library-audit',
  'completed',
]);
const allowedVisualChecks = new Set(['pending', 'ok', 'warning', 'fail']);
const allowedVisualMethods = new Set([
  'mcp-playwright',
  'remotion-studio',
  'built-in-browser',
]);
const allowedFinaleTailPolicies = new Set(['off', 'legacy-cinematic-slowdown']);
const allowedReuseModes = new Set([
  'preset-reuse',
  'structure-reuse',
  'system-reuse',
  'greenfield-approved',
]);
const allowedDirectorPassReviewDecisions = new Set([
  'pending',
  'approved',
  'revise',
]);
const allowedWorldSlots = new Set([
  'horizon',
  'side-dressing',
  'atmospheric-motion',
  'directed-motion',
  'ground',
  'light-weather',
  'payoff',
]);
const requiredEnvironmentPreviewScenes = [
  'scene-1',
  'scene-2',
  'scene-3',
  'scene-4',
];
const requiredEnvironmentSlots = [
  'horizon',
  'side-dressing',
  'atmospheric-motion',
  'directed-motion',
  'ground',
  'light-weather',
];

const normalizeMarkdownValue = (value: string) =>
  value.trim().replace(/^`|`$/g, '').trim();

const parseSupportedCountRange = (value: string): [number, number] | null => {
  const match = value.trim().match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) {
    return null;
  }

  const min = Number(match[1]);
  const max = Number(match[2]);

  if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max < min) {
    return null;
  }

  return [min, max];
};

const parseTargetDurationBandSeconds = (value: string): [number, number] | null =>
  parseSupportedCountRange(value);

const parseSupportedFps = (value: string): number | null => {
  const fps = Number.parseInt(value.trim(), 10);
  return Number.isInteger(fps) && fps > 0 ? fps : null;
};

const formatNumericRange = (range: [number, number]) => `${range[0]}-${range[1]}`;

const resolveProjectDataSnapshot = (buildPlanPath: string): ProjectDataSnapshot => {
  const normalizedPath = buildPlanPath.replace(/\\/g, '/');
  const slugMatch = normalizedPath.match(/\/projects\/([^/]+)\/build-plan\.md$/);
  const slug = slugMatch?.[1] ?? '';
  const dataPath = slug
    ? path.resolve(process.cwd(), 'public', 'ranking-corridor', slug, 'data.json')
    : '';

  if (!slug || !dataPath || !existsSync(dataPath)) {
    return {
      slug,
      path: dataPath,
      count: null,
    };
  }

  try {
    const raw = JSON.parse(readFileSync(dataPath, 'utf8')) as {
      total_entries?: unknown;
      entries?: unknown;
    };
    const totalEntries =
      typeof raw.total_entries === 'number' && Number.isInteger(raw.total_entries)
        ? raw.total_entries
        : Array.isArray(raw.entries)
          ? raw.entries.length
          : null;

    return {
      slug,
      path: dataPath,
      count: totalEntries && totalEntries > 0 ? totalEntries : null,
    };
  } catch {
    return {
      slug,
      path: dataPath,
      count: null,
    };
  }
};

const parseCliArgs = (argv: string[]): CliOptions => {
  let buildPlanArg = '';
  let finalizeTaskId: string | null = null;

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];

    if (arg === '--finalize') {
      const maybeTaskId = argv[index + 1];
      if (!maybeTaskId) {
        console.error(
          'Использование: npm run validate:build-plan -- <path-to-build-plan.md> [--finalize <task-id>]',
        );
        console.error('Для `--finalize` нужно явно указать task id.');
        process.exit(1);
      }
      finalizeTaskId = maybeTaskId.trim();
      index += 1;
      continue;
    }

    if (!buildPlanArg) {
      buildPlanArg = arg;
      continue;
    }

    console.error(`Неизвестный аргумент: ${arg}`);
    console.error(
      'Использование: npm run validate:build-plan -- <path-to-build-plan.md> [--finalize <task-id>]',
    );
    process.exit(1);
  }

  if (!buildPlanArg) {
    console.error(
      'Использование: npm run validate:build-plan -- <path-to-build-plan.md> [--finalize <task-id>]',
    );
    process.exit(1);
  }

  return {buildPlanArg, finalizeTaskId};
};

const formatBuildPlanDate = () => {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const replaceFieldLineValue = (planLines: string[], lineIndex: number, value: string) => {
  const currentLine = planLines[lineIndex];
  const fieldMatch = currentLine.match(/^(- [^:]+:\s*).+$/);

  if (!fieldMatch) {
    throw new Error(`Не удалось обновить поле в строке ${lineIndex + 1}.`);
  }

  planLines[lineIndex] = `${fieldMatch[1]}${value}`;
};

const scanBuildPlan = (planLines: string[]): BuildPlanScan => {
  let currentPhase: TaskPhase | null = null;
  let currentTask: BuildPlanScanTask | null = null;
  let currentPlanPhase = '';
  let nextStepLineIndex = -1;
  let updatedLineIndex = -1;
  const tasks: BuildPlanScanTask[] = [];

  const pushCurrentTask = () => {
    if (currentTask) {
      tasks.push(currentTask);
      currentTask = null;
    }
  };

  for (let index = 0; index < planLines.length; index++) {
    const line = planLines[index];

    if (/^## Preview-build\b/.test(line)) {
      pushCurrentTask();
      currentPhase = 'preview-build';
      continue;
    }

    if (/^## Post-preview-build\b/.test(line)) {
      pushCurrentTask();
      currentPhase = 'post-preview-build';
      continue;
    }

    const taskMatch = line.match(/^###\s+([A-Z]{2}-\d+)\.\s+(.+)$/);
    if (taskMatch) {
      pushCurrentTask();
      currentTask = {
        id: taskMatch[1],
        phase: currentPhase,
        status: '',
        previewRole: '',
        lineIndex: index,
        statusLineIndex: -1,
      };
      continue;
    }

    const fieldMatch = line.match(/^- ([^:]+):\s*(.*)$/);
    if (!fieldMatch) {
      continue;
    }

    const key = fieldMatch[1].trim();
    const value = normalizeMarkdownValue(fieldMatch[2]);

    if (!currentTask) {
      if (key === 'Текущая фаза') {
        currentPlanPhase = value;
      }

      if (key === 'Следующий шаг') {
        nextStepLineIndex = index;
      }

      if (key === 'Обновлено') {
        updatedLineIndex = index;
      }

      continue;
    }

    if (key === 'Статус') {
      currentTask.status = value;
      currentTask.statusLineIndex = index;
    }

    if (key === 'Preview role') {
      currentTask.previewRole = value;
    }
  }

  pushCurrentTask();

  return {
    currentPlanPhase,
    nextStepLineIndex,
    updatedLineIndex,
    tasks,
  };
};

const buildFinalizedText = (originalText: string, taskId: string) => {
  const hadTrailingNewline = originalText.endsWith('\n');
  const planLines = originalText.split('\n');
  const scan = scanBuildPlan(planLines);
  const targetTask = scan.tasks.find((task) => task.id === taskId);

  if (!targetTask) {
    throw new Error(`Задача \`${taskId}\` не найдена в build-plan.`);
  }

  if (!targetTask.phase) {
    throw new Error(
      `Задача \`${taskId}\` объявлена вне секции Preview-build/Post-preview-build и не может быть финализирована.`,
    );
  }

  if (!scan.currentPlanPhase) {
    throw new Error('В build-plan отсутствует top-level поле `Текущая фаза`.');
  }

  if (targetTask.phase !== scan.currentPlanPhase) {
    throw new Error(
      `Нельзя финализировать задачу \`${taskId}\` вне текущей фазы \`${scan.currentPlanPhase}\`.`,
    );
  }

  if (targetTask.statusLineIndex < 0) {
    throw new Error(`У задачи \`${taskId}\` не найдено поле \`Статус\`.`);
  }

  if (targetTask.status === 'done') {
    throw new Error(`Задача \`${taskId}\` уже имеет статус \`done\`.`);
  }

  replaceFieldLineValue(planLines, targetTask.statusLineIndex, '`done`');

  const remainingCurrentPhaseTasks = scan.tasks.filter((task) => {
    if (task.phase !== targetTask.phase) {
      return false;
    }

    const taskStatus = task.id === taskId ? 'done' : task.status;
    return taskStatus !== 'done';
  });

  const nextStepValue =
    targetTask.phase === 'preview-build'
      ? (remainingCurrentPhaseTasks[0]?.id ?? 'preview-gate')
      : (remainingCurrentPhaseTasks[0]?.id ?? 'final-approval');

  if (scan.nextStepLineIndex >= 0) {
    replaceFieldLineValue(planLines, scan.nextStepLineIndex, nextStepValue);
  }

  if (scan.updatedLineIndex >= 0) {
    replaceFieldLineValue(planLines, scan.updatedLineIndex, formatBuildPlanDate());
  }

  const serialized = planLines.join('\n');
  return hadTrailingNewline && !serialized.endsWith('\n')
    ? `${serialized}\n`
    : serialized;
};

const {buildPlanArg, finalizeTaskId} = parseCliArgs(process.argv.slice(2));


const buildPlanPath = path.resolve(process.cwd(), buildPlanArg);
const projectDataSnapshot = resolveProjectDataSnapshot(buildPlanPath);

if (!existsSync(buildPlanPath)) {
  console.error(`Файл build-plan не найден: ${buildPlanPath}`);
  process.exit(1);
}

const buildPlanDir = path.dirname(buildPlanPath);
const originalText = readFileSync(buildPlanPath, 'utf8').replace(/\r\n/g, '\n');
let text = originalText;

if (finalizeTaskId) {
  try {
    text = buildFinalizedText(originalText, finalizeTaskId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Не удалось перевести задачу ${finalizeTaskId} в \`done\`: ${message}`);
    process.exit(1);
  }
}

const lines = text.split('\n');

const errors: string[] = [];
const warnings: string[] = [];

const topLevel: Record<string, string> = {};
const tasks: Task[] = [];

let currentPhase: TaskPhase | null = null;
let currentTask: Task | null = null;
let insideMiniReview = false;

const pushCurrentTask = () => {
  if (currentTask) {
    tasks.push(currentTask);
    currentTask = null;
  }
};

const cleanValue = normalizeMarkdownValue;

const isPlaceholder = (value: string | undefined) => {
  if (value === undefined) {
    return true;
  }

  const normalized = cleanValue(value).toLowerCase();
  return (
    normalized === '' ||
    normalized === '—' ||
    normalized === '-' ||
    normalized === 'pending' ||
    normalized === 'n/a' ||
    normalized === 'na' ||
    normalized === 'not applicable' ||
    normalized === 'not-applicable'
  );
};

const fieldValue = (task: Task, name: string) => cleanValue(task.fields[name] ?? '');
const parseWorldSlots = (value: string) =>
  value
    .split(/[,|]/)
    .map((part) => cleanValue(part))
    .filter(Boolean);
const parseSceneCoverage = (value: string) =>
  Array.from(new Set((value.match(/scene-\d+/gi) ?? []).map((part) => part.toLowerCase())));
const parseRegistryBaselines = (value: string) =>
  value
    .split(',')
    .map((part) => cleanValue(part))
    .filter(Boolean);
const includesNormalized = (value: string, needle: string) =>
  cleanValue(value).toLowerCase().includes(needle.toLowerCase());
const hasAnyMarker = (value: string, markers: string[]) =>
  markers.some((marker) => includesNormalized(value, marker));
const normalizeContractText = (value: string) =>
  cleanValue(value)
    .toLowerCase()
    .replace(/[`"'()[\]{}.,;:!?]/g, ' ')
    .replace(/[–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const parseRepoRelativePaths = (value: string) =>
  Array.from(
    new Set(
      (value.match(
        /(?:src|public|projects|docs|scripts|\.agents)\/[A-Za-z0-9._\-/]+/g,
      ) ?? []
      ).map((part) => part.trim()),
    ),
  );

const parseLaunchCardSelection = (): LaunchCardSelection => {
  const launchCardPath = path.resolve(buildPlanDir, 'launch-card.md');

  if (!existsSync(launchCardPath)) {
    return {
      exists: false,
      path: launchCardPath,
      objectFamilyId: '',
      scenePresetPackageId: '',
      scenePresetReusePolicy: '',
      scenePresetSourceOfTruthFiles: [],
      scenePresetLockedBehavior: '',
      heroRevealPackageId: '',
      heroRevealReusePolicy: '',
      heroRevealSourceOfTruthFiles: [],
      heroRevealLockedBehavior: '',
      mainCameraId: '',
      timingId: '',
    };
  }

  const launchCardText = readFileSync(launchCardPath, 'utf8').replace(/\r\n/g, '\n');
  const launchCardLines = launchCardText.split('\n');
  let currentSection = '';
  let currentBlock = '';
  const blockFields = new Map<string, Record<string, string>>();

  for (const line of launchCardLines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      currentBlock = '';
      continue;
    }

    if (currentSection !== 'Выбор формата') {
      continue;
    }

    const blockMatch = line.match(/^- ([^:]+):\s*(.*)$/);
    if (blockMatch) {
      currentBlock = blockMatch[1].trim();
      if (!blockFields.has(currentBlock)) {
        blockFields.set(currentBlock, {});
      }
      continue;
    }

    const fieldMatch = line.match(/^\s+- ([^:]+):\s*(.*)$/);
    if (!fieldMatch || !currentBlock) {
      continue;
    }

    const fields = blockFields.get(currentBlock) ?? {};
    fields[fieldMatch[1].trim()] = cleanValue(fieldMatch[2]);
    blockFields.set(currentBlock, fields);
  }

  const scenePresetFields = blockFields.get('Пакет сцены и камеры') ?? {};
  const heroRevealFields = blockFields.get('Пакет появления hero-модуля') ?? {};
  const objectFields = blockFields.get('Тип главного объекта') ?? {};
  const cameraFields = blockFields.get('Тип главной камеры') ?? {};
  const timingFields = blockFields.get('Тип ритма') ?? {};

  return {
    exists: true,
    path: launchCardPath,
    objectFamilyId: cleanValue(objectFields['id'] ?? ''),
    scenePresetPackageId: cleanValue(scenePresetFields['id'] ?? ''),
    scenePresetReusePolicy: cleanValue(scenePresetFields['политика reuse'] ?? ''),
    scenePresetSourceOfTruthFiles: parseRepoRelativePaths(
      cleanValue(scenePresetFields['source-of-truth files'] ?? ''),
    ),
    scenePresetLockedBehavior: cleanValue(
      scenePresetFields['что считается зафиксированным без пересборки'] ?? '',
    ),
    heroRevealPackageId: cleanValue(heroRevealFields['id'] ?? ''),
    heroRevealReusePolicy: cleanValue(heroRevealFields['политика reuse'] ?? ''),
    heroRevealSourceOfTruthFiles: parseRepoRelativePaths(
      cleanValue(heroRevealFields['source-of-truth files'] ?? ''),
    ),
    heroRevealLockedBehavior: cleanValue(
      heroRevealFields['что считается зафиксированным без пересборки'] ?? '',
    ),
    mainCameraId: cleanValue(cameraFields['id'] ?? ''),
    timingId: cleanValue(timingFields['id'] ?? ''),
  };
};

const parseRegistryCameraPresets = () => {
  const registryPath = path.resolve(
    process.cwd(),
    'docs/library/ranking-corridor-module-registry.md',
  );

  if (!existsSync(registryPath)) {
    return {
      exists: false,
      path: registryPath,
      presets: new Map<string, RegistryCameraPreset>(),
    };
  }

  const registryText = readFileSync(registryPath, 'utf8').replace(/\r\n/g, '\n');
  const registryLines = registryText.split('\n');
  const presets = new Map<string, RegistryCameraPreset>();

  let currentModuleId = '';
  let currentModuleType = '';
  let currentReusePolicy = '';
  let currentSourceOfTruthFiles: string[] = [];
  let currentLockedBehavior = '';
  let currentTimingContract = '';
  let currentSupportedFps: number | null = null;
  let currentTimingPolicyId = '';
  let currentDefaultFinaleTailPolicy = '';
  let currentSupportedCountRange: [number, number] | null = null;
  let currentTargetDurationBandSeconds: [number, number] | null = null;
  let currentListField = '';

  const pushCurrentPreset = () => {
    if (!currentModuleId || currentModuleType !== 'camera preset') {
      return;
    }

    presets.set(currentModuleId, {
      moduleId: currentModuleId,
      reusePolicy: currentReusePolicy,
      sourceOfTruthFiles: currentSourceOfTruthFiles,
      lockedBehavior: currentLockedBehavior,
      timingContract: currentTimingContract,
      supportedFps: currentSupportedFps,
      timingPolicyId: currentTimingPolicyId,
      defaultFinaleTailPolicy: currentDefaultFinaleTailPolicy,
      supportedCountRange: currentSupportedCountRange,
      targetDurationBandSeconds: currentTargetDurationBandSeconds,
    });
  };

  for (const line of registryLines) {
    const moduleMatch = line.match(/^###\s+\d+\.\s+`([^`]+)`/);
    if (moduleMatch) {
      pushCurrentPreset();
      currentModuleId = moduleMatch[1];
      currentModuleType = '';
      currentReusePolicy = '';
      currentSourceOfTruthFiles = [];
      currentLockedBehavior = '';
      currentTimingContract = '';
      currentSupportedFps = null;
      currentTimingPolicyId = '';
      currentDefaultFinaleTailPolicy = '';
      currentSupportedCountRange = null;
      currentTargetDurationBandSeconds = null;
      currentListField = '';
      continue;
    }

    const fieldMatch = line.match(/^- `([^`]+)`:\s*(.*)$/);
    if (fieldMatch) {
      const key = fieldMatch[1];
      const value = cleanValue(fieldMatch[2]);
      currentListField = '';

      if (key === 'moduleType') {
        currentModuleType = value;
      }

      if (key === 'reusePolicy') {
        currentReusePolicy = value;
      }

      if (key === 'sourceOfTruthFiles') {
        currentListField = key;
        if (value) {
          currentSourceOfTruthFiles = parseRepoRelativePaths(value);
        }
      }

      if (key === 'lockedBehavior') {
        currentLockedBehavior = value;
      }

      if (key === 'timingContract') {
        currentTimingContract = value;
      }

      if (key === 'supportedFps') {
        currentSupportedFps = parseSupportedFps(value);
      }

      if (key === 'timingPolicyId') {
        currentTimingPolicyId = value;
      }

      if (key === 'defaultFinaleTailPolicy') {
        currentDefaultFinaleTailPolicy = value;
      }

      if (key === 'supportedCountRange') {
        currentSupportedCountRange = parseSupportedCountRange(value);
      }

      if (key === 'targetDurationBandSeconds') {
        currentTargetDurationBandSeconds = parseTargetDurationBandSeconds(value);
      }

      continue;
    }

    if (currentListField === 'sourceOfTruthFiles') {
      const listItemMatch = line.match(/^\s+-\s+`?([^`]+?)`?\s*$/);
      if (listItemMatch) {
        currentSourceOfTruthFiles.push(cleanValue(listItemMatch[1]));
      }
    }
  }

  pushCurrentPreset();

  return {
    exists: true,
    path: registryPath,
    presets,
  };
};

const parseRegistryRevealModules = () => {
  const registryPath = path.resolve(
    process.cwd(),
    'docs/library/ranking-corridor-module-registry.md',
  );

  if (!existsSync(registryPath)) {
    return {
      exists: false,
      path: registryPath,
      modules: new Map<string, RegistryRevealModule>(),
    };
  }

  const registryText = readFileSync(registryPath, 'utf8').replace(/\r\n/g, '\n');
  const registryLines = registryText.split('\n');
  const modules = new Map<string, RegistryRevealModule>();

  let currentModuleId = '';
  let currentModuleType = '';
  let currentHeroFamilyFit: string[] = [];
  let currentReusePolicy = '';
  let currentSourceOfTruthFiles: string[] = [];
  let currentLockedBehavior = '';
  let currentListField = '';

  const pushCurrentModule = () => {
    if (!currentModuleId || currentModuleType !== 'reveal/effect module' || !currentReusePolicy) {
      return;
    }

    modules.set(currentModuleId, {
      moduleId: currentModuleId,
      heroFamilyFit: currentHeroFamilyFit,
      reusePolicy: currentReusePolicy,
      sourceOfTruthFiles: currentSourceOfTruthFiles,
      lockedBehavior: currentLockedBehavior,
    });
  };

  for (const line of registryLines) {
    const moduleMatch = line.match(/^###\s+\d+\.\s+`([^`]+)`/);
    if (moduleMatch) {
      pushCurrentModule();
      currentModuleId = moduleMatch[1];
      currentModuleType = '';
      currentHeroFamilyFit = [];
      currentReusePolicy = '';
      currentSourceOfTruthFiles = [];
      currentLockedBehavior = '';
      currentListField = '';
      continue;
    }

    const fieldMatch = line.match(/^- `([^`]+)`:\s*(.*)$/);
    if (fieldMatch) {
      const key = fieldMatch[1];
      const value = cleanValue(fieldMatch[2]);
      currentListField = '';

      if (key === 'moduleType') {
        currentModuleType = value;
      }

      if (key === 'reusePolicy') {
        currentReusePolicy = value;
      }

      if (key === 'heroFamilyFit') {
        currentHeroFamilyFit = value
          .split('|')
          .map((part) => cleanValue(part))
          .filter(Boolean);
      }

      if (key === 'sourceOfTruthFiles') {
        currentListField = key;
        if (value) {
          currentSourceOfTruthFiles = parseRepoRelativePaths(value);
        }
      }

      if (key === 'lockedBehavior') {
        currentLockedBehavior = value;
      }

      continue;
    }

    if (currentListField === 'sourceOfTruthFiles') {
      const listItemMatch = line.match(/^\s+-\s+`?([^`]+?)`?\s*$/);
      if (listItemMatch) {
        currentSourceOfTruthFiles.push(cleanValue(listItemMatch[1]));
      }
    }
  }

  pushCurrentModule();

  return {
    exists: true,
    path: registryPath,
    modules,
  };
};

const parseDirectorPassReview = () => {
  const reviewNotesPath = path.resolve(buildPlanDir, 'review-notes.md');

  if (!existsSync(reviewNotesPath)) {
    return {
      exists: false,
      path: reviewNotesPath,
      decision: '',
      canProceed: '',
    };
  }

  const reviewText = readFileSync(reviewNotesPath, 'utf8').replace(/\r\n/g, '\n');
  const reviewLines = reviewText.split('\n');
  let currentSection = '';
  let decision = '';
  let canProceed = '';

  for (const line of reviewLines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    if (currentSection !== 'Режиссерский план') {
      continue;
    }

    const fieldMatch = line.match(/^- ([^:]+):\s*(.*)$/);
    if (!fieldMatch) {
      continue;
    }

    const key = fieldMatch[1].trim();
    const value = cleanValue(fieldMatch[2]);

    if (key === 'Решение') {
      decision = value;
    }

    if (key === 'Можно ли переходить к build-plan') {
      canProceed = value.toLowerCase();
    }
  }

  return {
    exists: true,
    path: reviewNotesPath,
    decision,
    canProceed,
  };
};

for (let index = 0; index < lines.length; index++) {
  const line = lines[index];
  const lineNo = index + 1;

  if (/^## Preview-build\b/.test(line)) {
    pushCurrentTask();
    currentPhase = 'preview-build';
    insideMiniReview = false;
    continue;
  }

  if (/^## Post-preview-build\b/.test(line)) {
    pushCurrentTask();
    currentPhase = 'post-preview-build';
    insideMiniReview = false;
    continue;
  }

  const taskMatch = line.match(/^###\s+([A-Z]{2}-\d+)\.\s+(.+)$/);
  if (taskMatch) {
    pushCurrentTask();

    if (!currentPhase) {
      errors.push(`Строка ${lineNo}: задача объявлена вне секции Preview-build/Post-preview-build.`);
      continue;
    }

    currentTask = {
      id: taskMatch[1],
      title: taskMatch[2].trim(),
      phase: currentPhase,
      line: lineNo,
      fields: {},
      miniReview: {},
    };
    insideMiniReview = false;
    continue;
  }

  const metaFieldMatch = line.match(/^- ([^:]+):\s*(.*)$/);
  if (!currentTask && metaFieldMatch) {
    topLevel[metaFieldMatch[1].trim()] = metaFieldMatch[2];
    continue;
  }

  if (!currentTask) {
    continue;
  }

  const taskFieldMatch = line.match(/^- ([^:]+):\s*(.*)$/);
  if (taskFieldMatch) {
    const key = taskFieldMatch[1].trim();
    const value = taskFieldMatch[2];
    currentTask.fields[key] = value;
    insideMiniReview = key === 'Mini-review';
    continue;
  }

  if (insideMiniReview) {
    const miniReviewMatch = line.match(/^\s+- ([^:]+):\s*(.*)$/);
    if (miniReviewMatch) {
      currentTask.miniReview[miniReviewMatch[1].trim()] = miniReviewMatch[2];
      continue;
    }
  }
}

pushCurrentTask();

if (Object.prototype.hasOwnProperty.call(topLevel, 'Следующая задача')) {
  errors.push(
    'Используй top-level поле `Следующий шаг`, а не устаревшее `Следующая задача`.',
  );
}

const currentPlanPhase = cleanValue(topLevel['Текущая фаза'] ?? '');
if (currentPlanPhase !== 'preview-build' && currentPlanPhase !== 'post-preview-build') {
  errors.push('Top-level поле `Текущая фаза` должно быть `preview-build` или `post-preview-build`.');
}

const planStatus = cleanValue(topLevel['Статус плана'] ?? '');
if (!allowedPlanStatuses.has(planStatus)) {
  errors.push(
    'Top-level поле `Статус плана` должно быть одним из `draft | active | preview-complete | full-complete`.',
  );
}

const nextStep = cleanValue(topLevel['Следующий шаг'] ?? '');
if (!nextStep) {
  errors.push('Top-level поле `Следующий шаг` обязательно.');
}

const directorPassReview = parseDirectorPassReview();
const launchCardSelection = parseLaunchCardSelection();
const registryCameraPresets = parseRegistryCameraPresets();
const registryRevealModules = parseRegistryRevealModules();

if (!launchCardSelection.exists) {
  errors.push(
    `Рядом с build-plan должен существовать launch-card.md: ${path.relative(process.cwd(), launchCardSelection.path)}`,
  );
}

if (!registryCameraPresets.exists) {
  errors.push(
    `Не найден registry camera preset: ${path.relative(process.cwd(), registryCameraPresets.path)}`,
  );
}

if (!registryRevealModules.exists) {
  errors.push(
    `Не найден registry reveal module: ${path.relative(process.cwd(), registryRevealModules.path)}`,
  );
}

if (launchCardSelection.exists && isPlaceholder(launchCardSelection.objectFamilyId)) {
  errors.push(
    'В launch-card поле `Тип главного объекта -> id` обязательно и не может быть пустым: без него validator не может проверить `objectFamily` и совместимость `heroRevealPackage`.',
  );
}

let lockedScenePreset: RegistryCameraPreset | null = null;
let lockedHeroRevealPackage: RegistryRevealModule | null = null;

if (launchCardSelection.exists && registryCameraPresets.exists) {
  const explicitScenePackageId = launchCardSelection.scenePresetPackageId;
  const explicitScenePackage = explicitScenePackageId
    ? registryCameraPresets.presets.get(explicitScenePackageId)
    : null;

  if (explicitScenePackageId && !explicitScenePackage) {
    errors.push(
      `В launch-card выбран неизвестный \`Пакет сцены и камеры\`: \`${explicitScenePackageId}\`. Его нет в registry camera preset.`,
    );
  }

  if (explicitScenePackage?.reusePolicy === 'implementation-locked') {
    if (isPlaceholder(launchCardSelection.scenePresetReusePolicy)) {
      errors.push(
        `В launch-card для implementation-locked пакета \`${explicitScenePackage.moduleId}\` поле \`политика reuse\` обязательно и не может быть пустым.`,
      );
    } else if (launchCardSelection.scenePresetReusePolicy !== explicitScenePackage.reusePolicy) {
      errors.push(
        `В launch-card поле \`политика reuse\` для пакета \`${explicitScenePackage.moduleId}\` должно совпадать с registry и быть \`${explicitScenePackage.reusePolicy}\`, а не \`${launchCardSelection.scenePresetReusePolicy}\`.`,
      );
    }

    if (launchCardSelection.scenePresetSourceOfTruthFiles.length === 0) {
      errors.push(
        `В launch-card для implementation-locked пакета \`${explicitScenePackage.moduleId}\` поле \`source-of-truth files\` обязательно и должно дублировать registry \`sourceOfTruthFiles\`.`,
      );
    } else {
      const missingLaunchCardPaths = explicitScenePackage.sourceOfTruthFiles.filter(
        (filePath) => !launchCardSelection.scenePresetSourceOfTruthFiles.includes(filePath),
      );
      if (missingLaunchCardPaths.length > 0) {
        errors.push(
          `В launch-card поле \`source-of-truth files\` для пакета \`${explicitScenePackage.moduleId}\` должно включать все registry paths: ${missingLaunchCardPaths.join(', ')}.`,
        );
      }
    }

    if (isPlaceholder(launchCardSelection.scenePresetLockedBehavior)) {
      errors.push(
        `В launch-card для implementation-locked пакета \`${explicitScenePackage.moduleId}\` поле \`что считается зафиксированным без пересборки\` обязательно и должно дублировать registry \`lockedBehavior\`.`,
      );
    } else if (
      normalizeContractText(launchCardSelection.scenePresetLockedBehavior) !==
      normalizeContractText(explicitScenePackage.lockedBehavior)
    ) {
      errors.push(
        `В launch-card поле \`что считается зафиксированным без пересборки\` для пакета \`${explicitScenePackage.moduleId}\` должно совпадать с registry \`lockedBehavior\`.`,
      );
    }

    if (
      launchCardSelection.mainCameraId &&
      launchCardSelection.mainCameraId !== explicitScenePackage.moduleId
    ) {
      errors.push(
        `В launch-card при implementation-locked пакете \`${explicitScenePackage.moduleId}\` поле \`Тип главной камеры -> id\` не должно указывать на другой preset: \`${launchCardSelection.mainCameraId}\`.`,
      );
    }

    if (
      launchCardSelection.timingId &&
      launchCardSelection.timingId !== explicitScenePackage.moduleId
    ) {
      errors.push(
        `В launch-card при implementation-locked пакете \`${explicitScenePackage.moduleId}\` \`Тип ритма\` не является отдельным выбором и не должен ссылаться на другой preset: \`${launchCardSelection.timingId}\`.`,
      );
    }

    lockedScenePreset = explicitScenePackage;
  } else if (
    !explicitScenePackageId &&
    launchCardSelection.mainCameraId &&
    registryCameraPresets.presets.get(launchCardSelection.mainCameraId)?.reusePolicy ===
      'implementation-locked'
  ) {
    const inferredPreset = registryCameraPresets.presets.get(launchCardSelection.mainCameraId)!;
    errors.push(
      `В launch-card implementation-locked preset \`${inferredPreset.moduleId}\` должен быть оформлен через явный блок \`Пакет сцены и камеры\`, а не через отдельный \`Тип главной камеры\`${launchCardSelection.timingId ? ' / `Тип ритма`' : ''}.`,
    );
  }
}

if (launchCardSelection.exists && registryRevealModules.exists) {
  const explicitHeroRevealId = launchCardSelection.heroRevealPackageId;
  const explicitHeroReveal = explicitHeroRevealId
    ? registryRevealModules.modules.get(explicitHeroRevealId)
    : null;
  const matchingHeroRevealPackages = Array.from(registryRevealModules.modules.values()).filter(
    (module) =>
      module.reusePolicy === 'implementation-locked' &&
      (module.heroFamilyFit.includes(launchCardSelection.objectFamilyId) ||
        module.heroFamilyFit.includes('universal')),
  );

  if (explicitHeroRevealId && !explicitHeroReveal) {
    errors.push(
      `В launch-card выбран неизвестный \`Пакет появления hero-модуля\`: \`${explicitHeroRevealId}\`. Его нет в registry reveal modules.`,
    );
  }

  if (
    explicitHeroReveal &&
    launchCardSelection.objectFamilyId &&
    !explicitHeroReveal.heroFamilyFit.includes(launchCardSelection.objectFamilyId) &&
    !explicitHeroReveal.heroFamilyFit.includes('universal')
  ) {
    errors.push(
      `В launch-card reveal-пакет \`${explicitHeroReveal.moduleId}\` несовместим с object family \`${launchCardSelection.objectFamilyId}\`: \`heroFamilyFit\` в registry = \`${explicitHeroReveal.heroFamilyFit.join(' | ')}\`.`,
    );
  }

  if (
    !explicitHeroRevealId &&
    launchCardSelection.objectFamilyId &&
    matchingHeroRevealPackages.length === 1
  ) {
    errors.push(
      `В launch-card для object family \`${launchCardSelection.objectFamilyId}\` должен быть явно оформлен блок \`Пакет появления hero-модуля\`: подходит implementation-locked reveal baseline \`${matchingHeroRevealPackages[0].moduleId}\`.`,
    );
  }

  if (explicitHeroReveal?.reusePolicy === 'implementation-locked') {
    if (isPlaceholder(launchCardSelection.heroRevealReusePolicy)) {
      errors.push(
        `В launch-card для implementation-locked reveal-пакета \`${explicitHeroReveal.moduleId}\` поле \`политика reuse\` обязательно и не может быть пустым.`,
      );
    } else if (launchCardSelection.heroRevealReusePolicy !== explicitHeroReveal.reusePolicy) {
      errors.push(
        `В launch-card поле \`политика reuse\` для reveal-пакета \`${explicitHeroReveal.moduleId}\` должно совпадать с registry и быть \`${explicitHeroReveal.reusePolicy}\`, а не \`${launchCardSelection.heroRevealReusePolicy}\`.`,
      );
    }

    if (launchCardSelection.heroRevealSourceOfTruthFiles.length === 0) {
      errors.push(
        `В launch-card для implementation-locked reveal-пакета \`${explicitHeroReveal.moduleId}\` поле \`source-of-truth files\` обязательно и должно дублировать registry \`sourceOfTruthFiles\`.`,
      );
    } else {
      const missingLaunchCardPaths = explicitHeroReveal.sourceOfTruthFiles.filter(
        (filePath) => !launchCardSelection.heroRevealSourceOfTruthFiles.includes(filePath),
      );
      if (missingLaunchCardPaths.length > 0) {
        errors.push(
          `В launch-card поле \`source-of-truth files\` для reveal-пакета \`${explicitHeroReveal.moduleId}\` должно включать все registry paths: ${missingLaunchCardPaths.join(', ')}.`,
        );
      }
    }

    if (isPlaceholder(launchCardSelection.heroRevealLockedBehavior)) {
      errors.push(
        `В launch-card для implementation-locked reveal-пакета \`${explicitHeroReveal.moduleId}\` поле \`что считается зафиксированным без пересборки\` обязательно и должно дублировать registry \`lockedBehavior\`.`,
      );
    } else if (
      normalizeContractText(launchCardSelection.heroRevealLockedBehavior) !==
      normalizeContractText(explicitHeroReveal.lockedBehavior)
    ) {
      errors.push(
        `В launch-card поле \`что считается зафиксированным без пересборки\` для reveal-пакета \`${explicitHeroReveal.moduleId}\` должно совпадать с registry \`lockedBehavior\`.`,
      );
    }

    lockedHeroRevealPackage = explicitHeroReveal;
  }
}

if (!directorPassReview.exists) {
  errors.push(
    `Рядом с build-plan должен существовать review-notes.md с секцией \`Режиссерский план\`: ${path.relative(process.cwd(), directorPassReview.path)}`,
  );
} else {
  if (!allowedDirectorPassReviewDecisions.has(directorPassReview.decision)) {
    errors.push(
      'В секции `Режиссерский план` файла `review-notes.md` поле `Решение` должно быть одним из `pending | approved | revise`.',
    );
  }

  if (!directorPassReview.canProceed) {
    errors.push(
      'В секции `Режиссерский план` файла `review-notes.md` поле `Можно ли переходить к build-plan` обязательно и должно быть `yes` или `no`.',
    );
  } else if (directorPassReview.canProceed !== 'yes' && directorPassReview.canProceed !== 'no') {
    errors.push(
      'В секции `Режиссерский план` файла `review-notes.md` поле `Можно ли переходить к build-plan` должно быть `yes` или `no`.',
    );
  }

  if (directorPassReview.decision !== 'approved') {
    errors.push(
      'Build-plan невалиден, пока в `review-notes.md` секция `Режиссерский план` не имеет `Решение: approved`.',
    );
  }

  if (directorPassReview.decision === 'approved' && directorPassReview.canProceed === 'no') {
    errors.push(
      'В `review-notes.md` режиссерский план уже `approved`, поэтому поле `Можно ли переходить к build-plan` не может оставаться `no`.',
    );
  }

  if (directorPassReview.decision !== 'approved' && directorPassReview.canProceed === 'yes') {
    errors.push(
      'В `review-notes.md` нельзя разрешать переход к build-plan (`yes`), пока режиссерский план не имеет `Решение: approved`.',
    );
  }
}

const taskIds = new Set(tasks.map((task) => task.id));
const taskById = new Map(tasks.map((task) => [task.id, task]));

if (nextStep && !allowedNextSteps.has(nextStep) && !taskIds.has(nextStep)) {
  errors.push(
    `Поле \`Следующий шаг\` содержит неизвестное значение: \`${nextStep}\`. Используй существующий task id или один из системных шагов: preview-gate, final-approval, library-audit, completed.`,
  );
}

let inProgressCount = 0;
let inProgressTaskId: string | null = null;
const environmentSceneTaskMap = new Map<string, string[]>();

if (nextStep && taskById.has(nextStep)) {
  const nextStepTask = taskById.get(nextStep)!;
  if (fieldValue(nextStepTask, 'Статус') === 'done') {
    errors.push(
      `Поле \`Следующий шаг\` не может ссылаться на уже закрытую задачу \`${nextStep}\`.`,
    );
  }
}

for (const task of tasks) {
  const status = fieldValue(task, 'Статус');
  if (!allowedTaskStatuses.has(status)) {
    errors.push(
      `Задача ${task.id}: поле \`Статус\` должно быть одним из todo | in_progress | blocked | done.`,
    );
  }

  if (status === 'in_progress') {
    inProgressCount += 1;
    inProgressTaskId = task.id;
  }

  if (task.phase === 'preview-build') {
    const previewRole = fieldValue(task, 'Preview role');
    if (!allowedPreviewRoles.has(previewRole)) {
      errors.push(
        `Задача ${task.id}: для preview-задачи поле \`Preview role\` обязательно и должно быть одним из support | hero-preview | camera-preview | environment-preview | integrated-preview.`,
      );
    }

    const studioCheck = fieldValue(task, 'Studio/browser check');
    const consoleCheck = fieldValue(task, 'Console/runtime check');
    const visualMethod = fieldValue(task, 'Visual check method');

    if (studioCheck && !allowedVisualChecks.has(studioCheck)) {
      errors.push(
        `Задача ${task.id}: поле \`Studio/browser check\` должно быть pending | ok | warning | fail.`,
      );
    }

    if (consoleCheck && !allowedVisualChecks.has(consoleCheck)) {
      errors.push(
        `Задача ${task.id}: поле \`Console/runtime check\` должно быть pending | ok | warning | fail.`,
      );
    }

    if (visualMethod && visualMethod !== 'pending' && !allowedVisualMethods.has(visualMethod)) {
      errors.push(
        `Задача ${task.id}: поле \`Visual check method\` должно быть одним из mcp-playwright | remotion-studio | built-in-browser.`,
      );
    }

    if (studioCheck && studioCheck !== 'pending' && isPlaceholder(visualMethod)) {
      errors.push(
        `Задача ${task.id}: поле \`Visual check method\` обязательно, если \`Studio/browser check\` уже не равно \`pending\`.`,
      );
    }

    const isQualityCheckpoint =
      previewRole === 'hero-preview' ||
      previewRole === 'camera-preview' ||
      previewRole === 'environment-preview' ||
      previewRole === 'integrated-preview';
    const isWorldAssemblyCheckpoint =
      previewRole === 'environment-preview' ||
      previewRole === 'integrated-preview';

    const reuseMode = fieldValue(task, 'Reuse mode');
    const referenceBaseline = fieldValue(task, 'Reference baseline');
    const reuseWithoutChanges = fieldValue(task, 'Reuse without changes');
    const allowedAdaptation = fieldValue(task, 'Allowed adaptation');
    const objectCountValue = fieldValue(task, 'Object count');
    const timingPolicy = fieldValue(task, 'Timing policy');
    const targetDurationBand = fieldValue(task, 'Target duration band');
    const finaleTailPolicy = fieldValue(task, 'Finale tail policy');
    const greenfieldJustification = fieldValue(task, 'Greenfield justification');
    const worldSlotsCovered = fieldValue(task, 'World slots covered');
    const sceneCoverage = fieldValue(task, 'Scene coverage');
    const registryBaselinesUsed = fieldValue(task, 'Registry baselines used');
    const referenceBaselinePaths = parseRepoRelativePaths(referenceBaseline);

    if (previewRole === 'camera-preview' && lockedScenePreset && status !== 'todo') {
      if (reuseMode !== 'preset-reuse') {
        errors.push(
          `Задача ${task.id}: при выбранном implementation-locked scene preset \`${lockedScenePreset.moduleId}\` поле \`Reuse mode\` обязано быть \`preset-reuse\`.`,
        );
      }

      const missingBaselinePaths = lockedScenePreset.sourceOfTruthFiles.filter(
        (filePath) => !referenceBaselinePaths.includes(filePath),
      );
      if (missingBaselinePaths.length > 0) {
        errors.push(
          `Задача ${task.id}: \`Reference baseline\` должна включать exact \`sourceOfTruthFiles\` выбранного scene preset \`${lockedScenePreset.moduleId}\`: ${missingBaselinePaths.join(', ')}.`,
        );
      }

      const reuseRequirements = [
        ['camera path math', 'camera math', 'путь камеры'],
        ['transition', 'переход'],
        ['hold'],
        ['scene progression', 'progression', 'сценичес'],
        ['finale', 'финал'],
      ];

      if (lockedScenePreset.timingContract === 'adaptive') {
        reuseRequirements.splice(
          0,
          reuseRequirements.length,
          ['camera path math', 'camera math', 'путь камеры'],
          ['scene progression', 'progression', 'сценичес'],
          ['handoff', 'push-in', 'intro/main'],
          ['orbit', 'vip-focus', 'tower', 'motion', 'rail-focus'],
        );
      }

      const missingReuseMarkers = reuseRequirements.filter(
        (markers) => !hasAnyMarker(reuseWithoutChanges, markers),
      );
      if (missingReuseMarkers.length > 0 && lockedScenePreset.timingContract === 'adaptive') {
        errors.push(
          `Задача ${task.id}: для implementation-locked scene preset \`${lockedScenePreset.moduleId}\` с adaptive timing поле \`Reuse without changes\` должно явно перечислять motion-locked часть: camera path math, scene progression, intro/main handoff и orbit/VIP/tower behavior.`,
        );
      } else if (missingReuseMarkers.length > 0) {
        errors.push(
          `Задача ${task.id}: для implementation-locked scene preset \`${lockedScenePreset.moduleId}\` поле \`Reuse without changes\` должно явно перечислять camera path math, переходные тайминги, hold rhythm, scene progression и finale behavior, а не только общий текст.`,
        );
      }

      const adaptationRequirements = [
        ['data normalization', 'нормализ'],
        ['offset'],
        ['distance', 'дистанц'],
        ['framing', 'кадрир'],
      ];

      if (lockedScenePreset.timingContract === 'adaptive') {
        adaptationRequirements.push(['timing', 'retiming', 'adaptive', 'count-aware']);
      }

      const missingAdaptationMarkers = adaptationRequirements.filter(
        (markers) => !hasAnyMarker(allowedAdaptation, markers),
      );
      if (missingAdaptationMarkers.length > 0 && lockedScenePreset.timingContract === 'adaptive') {
        errors.push(
          `Задача ${task.id}: для implementation-locked scene preset \`${lockedScenePreset.moduleId}\` с adaptive timing поле \`Allowed adaptation\` должно явно ограничиваться data normalization, offsets, дистанцией камеры, topic-specific framing и count-aware retiming.`,
        );
      } else if (missingAdaptationMarkers.length > 0) {
        errors.push(
          `Задача ${task.id}: для implementation-locked scene preset \`${lockedScenePreset.moduleId}\` поле \`Allowed adaptation\` должно явно ограничиваться data normalization, offsets, дистанцией камеры и topic-specific framing.`,
        );
      }

      if (lockedScenePreset.timingContract === 'adaptive') {
        const objectCount = Number.parseInt(objectCountValue, 10);
        const declaredTargetDurationBand = parseTargetDurationBandSeconds(targetDurationBand);
        if (!lockedScenePreset.supportedFps) {
          warnings.push(
            `Задача ${task.id}: adaptive scene preset \`${lockedScenePreset.moduleId}\` должен иметь в registry явный \`supportedFps\`.`,
          );
        }

        if (!lockedScenePreset.targetDurationBandSeconds) {
          errors.push(
            `Задача ${task.id}: adaptive scene preset \`${lockedScenePreset.moduleId}\` должен иметь в registry явный \`targetDurationBandSeconds\`.`,
          );
        }

        if (!objectCountValue) {
          errors.push(
            `Задача ${task.id}: для adaptive scene preset \`${lockedScenePreset.moduleId}\` поле \`Object count\` обязательно.`,
          );
        } else if (!Number.isInteger(objectCount) || objectCount <= 0) {
          errors.push(
            `Задача ${task.id}: поле \`Object count\` должно быть положительным целым числом.`,
          );
        } else if (
          lockedScenePreset.supportedCountRange &&
          (objectCount < lockedScenePreset.supportedCountRange[0] ||
            objectCount > lockedScenePreset.supportedCountRange[1])
        ) {
          errors.push(
            `Задача ${task.id}: \`Object count\` = ${objectCount} выходит за supportedCountRange preset \`${lockedScenePreset.moduleId}\` (${lockedScenePreset.supportedCountRange[0]}-${lockedScenePreset.supportedCountRange[1]}).`,
          );
        }

        if (!projectDataSnapshot.count) {
          warnings.push(
            `Задача ${task.id}: для adaptive scene preset \`${lockedScenePreset.moduleId}\` validator должен подтвердить actual object count по project data snapshot. Не удалось прочитать count из \`${path.relative(process.cwd(), projectDataSnapshot.path || buildPlanPath)}\`.`,
          );
        } else if (
          lockedScenePreset.supportedCountRange &&
          (projectDataSnapshot.count < lockedScenePreset.supportedCountRange[0] ||
            projectDataSnapshot.count > lockedScenePreset.supportedCountRange[1])
        ) {
          errors.push(
            `Задача ${task.id}: actual project data count ${projectDataSnapshot.count} из \`${path.relative(process.cwd(), projectDataSnapshot.path)}\` выходит за supportedCountRange preset \`${lockedScenePreset.moduleId}\` (${lockedScenePreset.supportedCountRange[0]}-${lockedScenePreset.supportedCountRange[1]}).`,
          );
        } else if (Number.isInteger(objectCount) && objectCount > 0 && objectCount !== projectDataSnapshot.count) {
          errors.push(
            `Задача ${task.id}: \`Object count\` = ${objectCount} не совпадает с actual project data count ${projectDataSnapshot.count} из \`${path.relative(process.cwd(), projectDataSnapshot.path)}\`.`,
          );
        }

        if (!targetDurationBand) {
          errors.push(
            `Задача ${task.id}: для adaptive scene preset \`${lockedScenePreset.moduleId}\` поле \`Target duration band\` обязательно.`,
          );
        } else if (!declaredTargetDurationBand) {
          errors.push(
            `Задача ${task.id}: поле \`Target duration band\` должно быть в формате \`min-max\` в секундах, например \`130-480\`.`,
          );
        } else if (
          lockedScenePreset.targetDurationBandSeconds &&
          (declaredTargetDurationBand[0] !== lockedScenePreset.targetDurationBandSeconds[0] ||
            declaredTargetDurationBand[1] !== lockedScenePreset.targetDurationBandSeconds[1])
        ) {
          errors.push(
            `Задача ${task.id}: \`Target duration band\` должна совпадать с registry \`targetDurationBandSeconds\` выбранного scene preset \`${lockedScenePreset.moduleId}\`: \`${formatNumericRange(lockedScenePreset.targetDurationBandSeconds)}\`.`,
          );
        }

        if (!timingPolicy) {
          errors.push(
            `Задача ${task.id}: для adaptive scene preset \`${lockedScenePreset.moduleId}\` поле \`Timing policy\` обязательно.`,
          );
        } else if (
          lockedScenePreset.timingPolicyId &&
          normalizeContractText(timingPolicy) !== normalizeContractText(lockedScenePreset.timingPolicyId)
        ) {
          errors.push(
            `Задача ${task.id}: \`Timing policy\` должна совпадать с registry \`timingPolicyId\` выбранного scene preset \`${lockedScenePreset.moduleId}\`: \`${lockedScenePreset.timingPolicyId}\`.`,
          );
        }

        if (!finaleTailPolicy) {
          errors.push(
            `Задача ${task.id}: для adaptive scene preset \`${lockedScenePreset.moduleId}\` поле \`Finale tail policy\` обязательно.`,
          );
        } else if (!allowedFinaleTailPolicies.has(finaleTailPolicy)) {
          errors.push(
            `Задача ${task.id}: \`Finale tail policy\` должна быть одной из: ${Array.from(allowedFinaleTailPolicies).join(', ')}.`,
          );
        } else if (
          lockedScenePreset.defaultFinaleTailPolicy &&
          finaleTailPolicy !== lockedScenePreset.defaultFinaleTailPolicy &&
          finaleTailPolicy !== 'legacy-cinematic-slowdown'
        ) {
          errors.push(
            `Задача ${task.id}: \`Finale tail policy\` для preset \`${lockedScenePreset.moduleId}\` должна соответствовать registry default \`${lockedScenePreset.defaultFinaleTailPolicy}\` или явному legacy override.`,
          );
        }
      }
    }

    if (previewRole === 'hero-preview' && lockedHeroRevealPackage && status !== 'todo') {
      if (reuseMode !== 'preset-reuse') {
        errors.push(
          `Задача ${task.id}: при выбранном implementation-locked hero reveal package \`${lockedHeroRevealPackage.moduleId}\` поле \`Reuse mode\` обязано быть \`preset-reuse\`.`,
        );
      }

      const missingBaselinePaths = lockedHeroRevealPackage.sourceOfTruthFiles.filter(
        (filePath) => !referenceBaselinePaths.includes(filePath),
      );
      if (missingBaselinePaths.length > 0) {
        errors.push(
          `Задача ${task.id}: \`Reference baseline\` должна включать exact \`sourceOfTruthFiles\` выбранного hero reveal package \`${lockedHeroRevealPackage.moduleId}\`: ${missingBaselinePaths.join(', ')}.`,
        );
      }

      const reuseRequirements = [
        ['activation', 'gate', 'presentation'],
        ['reveal', 'staging', 'choreograph', 'появлен'],
        ['shell', 'корпус', 'оболоч'],
        ['data', 'card', 'dashboard', 'panel', 'hologram', 'карточ', 'панел', 'голограм'],
        ['metric', 'badge', 'rank', 'метрик', 'бейдж', 'ранг'],
      ];

      const missingReuseMarkers = reuseRequirements.filter(
        (markers) => !hasAnyMarker(reuseWithoutChanges, markers),
      );
      if (missingReuseMarkers.length > 0) {
        errors.push(
          `Задача ${task.id}: для implementation-locked hero reveal package \`${lockedHeroRevealPackage.moduleId}\` поле \`Reuse without changes\` должно явно перечислять activation / presentation gate, reveal staging order, shell-to-data choreography, timing метрики и effect family, а не только общий текст.`,
        );
      }

      const adaptationRequirements = [
        ['theme', 'тема'],
        ['material', 'материал'],
        ['layout', 'slot', 'слот', 'уклад'],
        ['offset'],
        ['content', 'контент'],
      ];

      const missingAdaptationMarkers = adaptationRequirements.filter(
        (markers) => !hasAnyMarker(allowedAdaptation, markers),
      );
      if (missingAdaptationMarkers.length > 0) {
        errors.push(
          `Задача ${task.id}: для implementation-locked hero reveal package \`${lockedHeroRevealPackage.moduleId}\` поле \`Allowed adaptation\` должно явно ограничиваться темой, материалами, layout-safe offsets, content slots и topic-specific поверхностью.`,
        );
      }
    }

    if (previewRole === 'environment-preview') {
      if (isPlaceholder(sceneCoverage)) {
        errors.push(
          `Задача ${task.id}: для scene-specific environment-preview поле \`Scene coverage\` обязательно и не может быть пустым.`,
        );
      } else {
        const environmentScenes = parseSceneCoverage(sceneCoverage);
        if (environmentScenes.length !== 1) {
          errors.push(
            `Задача ${task.id}: каждая scene-specific environment-preview задача должна покрывать ровно один scene-id. Сейчас указано: \`${sceneCoverage}\`.`,
          );
        } else {
          const sceneId = environmentScenes[0];
          const existing = environmentSceneTaskMap.get(sceneId) ?? [];
          existing.push(task.id);
          environmentSceneTaskMap.set(sceneId, existing);
        }
      }
    }

    if (isQualityCheckpoint && !allowedReuseModes.has(reuseMode)) {
      errors.push(
        `Задача ${task.id}: поле \`Reuse mode\` должно быть одним из preset-reuse | structure-reuse | system-reuse | greenfield-approved, а не свободным описанием.`,
      );
    }

    if (isQualityCheckpoint && status !== 'todo') {
      if (reuseMode !== 'greenfield-approved' && isPlaceholder(referenceBaseline)) {
        errors.push(
          `Задача ${task.id}: для key preview task со статусом \`${status}\` поле \`Reference baseline\` обязательно, если \`Reuse mode\` не равен \`greenfield-approved\`.`,
        );
      }

      if (isPlaceholder(reuseWithoutChanges)) {
        errors.push(
          `Задача ${task.id}: для key preview task со статусом \`${status}\` поле \`Reuse without changes\` должно быть заполнено.`,
        );
      }

      if (isPlaceholder(allowedAdaptation)) {
        errors.push(
          `Задача ${task.id}: для key preview task со статусом \`${status}\` поле \`Allowed adaptation\` должно быть заполнено.`,
        );
      }

      if (reuseMode === 'greenfield-approved' && isPlaceholder(greenfieldJustification)) {
        errors.push(
          `Задача ${task.id}: \`greenfield-approved\` требует непустое поле \`Greenfield justification\` с источником решения.`,
        );
      }

      if (isWorldAssemblyCheckpoint) {
        if (isPlaceholder(worldSlotsCovered)) {
          errors.push(
            `Задача ${task.id}: для ${previewRole} со статусом \`${status}\` поле \`World slots covered\` должно быть заполнено.`,
          );
        } else {
          const slots = parseWorldSlots(worldSlotsCovered);
          const invalidSlots = slots.filter((slot) => !allowedWorldSlots.has(slot));
          if (invalidSlots.length > 0) {
            errors.push(
              `Задача ${task.id}: поле \`World slots covered\` содержит неизвестные slot id: ${invalidSlots.join(', ')}.`,
            );
          }

          const missingRequired = requiredEnvironmentSlots.filter(
            (slot) => !slots.includes(slot),
          );
          if (missingRequired.length > 0) {
            errors.push(
              `Задача ${task.id}: для ${previewRole} в \`World slots covered\` обязательны минимум slot id ${requiredEnvironmentSlots.join(', ')}. Сейчас отсутствуют: ${missingRequired.join(', ')}.`,
            );
          }
        }

        if (previewRole === 'integrated-preview') {
          if (isPlaceholder(sceneCoverage)) {
            errors.push(
              `Задача ${task.id}: для integrated-preview поле \`Scene coverage\` должно быть заполнено минимум четырьмя сценами.`,
            );
          } else if (parseSceneCoverage(sceneCoverage).length < 4) {
            errors.push(
              `Задача ${task.id}: поле \`Scene coverage\` для integrated-preview должно содержать минимум четыре scene-id в формате \`scene-1, scene-2, scene-3, scene-4\`.`,
            );
          }
        }

        if (isPlaceholder(registryBaselinesUsed)) {
          errors.push(
            `Задача ${task.id}: для ${previewRole} со статусом \`${status}\` поле \`Registry baselines used\` должно быть заполнено.`,
          );
        } else {
          const baselines = parseRegistryBaselines(registryBaselinesUsed);
          const isExplicitNone = baselines.length === 1 && baselines[0] === 'none';
          const invalidBaselines = baselines.filter(
            (baseline) => baseline !== 'none' && !/^[a-z0-9][a-z0-9-]*$/.test(baseline),
          );

          if (invalidBaselines.length > 0) {
            errors.push(
              `Задача ${task.id}: поле \`Registry baselines used\` должно содержать список \`moduleId\` через запятую или literal \`none\`. Сейчас некорректны: ${invalidBaselines.join(', ')}.`,
            );
          }

          if (!isExplicitNone && baselines.includes('none')) {
            errors.push(
              `Задача ${task.id}: literal \`none\` в \`Registry baselines used\` нельзя смешивать с moduleId. Используй либо \`none\`, либо список registry moduleId.`,
            );
          }
        }
      }
    }

    if (status === 'done' && isQualityCheckpoint) {
      for (const fieldName of [
        'Reuse mode',
        'Reuse without changes',
        'Allowed adaptation',
        'Non-negotiables',
        'Studio/browser check',
        'Visual check method',
        'Console/runtime check',
        'Screenshot set',
      ]) {
        if (isPlaceholder(task.fields[fieldName])) {
          errors.push(
            `Задача ${task.id}: поле \`${fieldName}\` обязательно для completed quality-checkpoint и не может быть пустым или \`—\`.`,
          );
        }
      }

      if (isWorldAssemblyCheckpoint) {
        for (const fieldName of [
          'World slots covered',
          'Scene coverage',
          'Registry baselines used',
        ]) {
          if (isPlaceholder(task.fields[fieldName])) {
            errors.push(
              `Задача ${task.id}: поле \`${fieldName}\` обязательно для completed ${previewRole} и не может быть пустым или \`—\`.`,
            );
          }
        }
      }

      if (reuseMode !== 'greenfield-approved' && isPlaceholder(task.fields['Reference baseline'])) {
        errors.push(
          `Задача ${task.id}: completed quality-checkpoint обязан иметь непустое \`Reference baseline\`, если \`Reuse mode\` не равен \`greenfield-approved\`.`,
        );
      }

      if (reuseMode === 'greenfield-approved' && isPlaceholder(task.fields['Greenfield justification'])) {
        errors.push(
          `Задача ${task.id}: completed quality-checkpoint с \`greenfield-approved\` обязан иметь непустое \`Greenfield justification\`.`,
        );
      }

      if (studioCheck === 'fail') {
        errors.push(
          `Задача ${task.id}: completed quality-checkpoint не может иметь \`Studio/browser check = fail\`.`,
        );
      }

      if (consoleCheck === 'fail') {
        errors.push(
          `Задача ${task.id}: completed quality-checkpoint не может иметь \`Console/runtime check = fail\`.`,
        );
      }

      const screenshotSet = fieldValue(task, 'Screenshot set');
      if (screenshotSet) {
        const screenshotPath = path.resolve(buildPlanDir, screenshotSet);
        if (!existsSync(screenshotPath)) {
          errors.push(
            `Задача ${task.id}: путь из \`Screenshot set\` не найден на диске: ${screenshotSet}`,
          );
        }
      }

      for (const miniKey of [
        'Что было baseline',
        'Что reuse-нуто без изменений',
        'Что адаптировано под тему',
        'Что еще пока слабое',
        'Почему это уже не scaffold',
      ]) {
        if (isPlaceholder(task.miniReview[miniKey])) {
          errors.push(
            `Задача ${task.id}: mini-review поле \`${miniKey}\` обязательно для completed quality-checkpoint и не может быть пустым или \`—\`.`,
          );
        }
      }
    }
  }
}

for (const sceneId of requiredEnvironmentPreviewScenes) {
  const coveringTasks = environmentSceneTaskMap.get(sceneId) ?? [];
  if (coveringTasks.length === 0) {
    errors.push(
      `В preview-build должна быть отдельная scene-specific environment-preview задача для \`${sceneId}\`. Сейчас она отсутствует.`,
    );
  }

  if (coveringTasks.length > 1) {
    errors.push(
      `Для \`${sceneId}\` найдены дублирующиеся environment-preview задачи: ${coveringTasks.join(', ')}. На одну сцену нужна одна отдельная environment-задача.`,
    );
  }
}

if (inProgressCount > 1) {
  errors.push('В build-plan одновременно может быть только одна задача со статусом `in_progress`.');
}

if (inProgressTaskId && nextStep && nextStep !== inProgressTaskId) {
  errors.push(
    `Если есть задача \`${inProgressTaskId}\` в статусе \`in_progress\`, поле \`Следующий шаг\` должно указывать именно на нее до завершения.`,
  );
}

const previewTasks = tasks.filter((task) => task.phase === 'preview-build');
const remainingPreviewTasks = previewTasks.filter((task) => {
  const status = fieldValue(task, 'Статус');
  return status !== 'done';
});

if (currentPlanPhase === 'preview-build') {
  if (remainingPreviewTasks.length === 0 && nextStep !== 'preview-gate') {
    errors.push(
      'Если все задачи preview-build закрыты, `Следующий шаг` должен быть `preview-gate`.',
    );
  }

  if (nextStep === 'preview-gate' && remainingPreviewTasks.length > 0) {
    errors.push(
      'Нельзя переходить к `preview-gate`, пока в секции preview-build еще есть незакрытые задачи.',
    );
  }
}

if (currentPlanPhase === 'post-preview-build' && nextStep === 'preview-gate') {
  errors.push('После перехода в post-preview-build `Следующий шаг` уже не может быть `preview-gate`.');
}

if (errors.length > 0) {
  console.error(`Валидация build-plan провалена: ${path.relative(process.cwd(), buildPlanPath)}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  if (warnings.length > 0) {
    console.error('Предупреждения:');
    for (const warning of warnings) {
      console.error(`- ${warning}`);
    }
  }
  process.exit(1);
}

if (finalizeTaskId) {
  writeFileSync(buildPlanPath, text, 'utf8');
  console.log(
    `Build-plan валиден, задача ${finalizeTaskId} переведена в \`done\`: ${path.relative(process.cwd(), buildPlanPath)}`,
  );
} else {
  console.log(`Build-plan валиден: ${path.relative(process.cwd(), buildPlanPath)}`);
}

if (warnings.length > 0) {
  console.log('Предупреждения:');
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}
