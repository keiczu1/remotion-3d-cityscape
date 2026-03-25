import {existsSync, readFileSync} from 'node:fs';
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
const allowedReuseModes = new Set([
  'preset-reuse',
  'structure-reuse',
  'system-reuse',
  'greenfield-approved',
]);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    'Использование: npm run validate:build-plan -- <path-to-build-plan.md>',
  );
  process.exit(1);
}

const buildPlanArg = args[0];
const buildPlanPath = path.resolve(process.cwd(), buildPlanArg);

if (!existsSync(buildPlanPath)) {
  console.error(`Файл build-plan не найден: ${buildPlanPath}`);
  process.exit(1);
}

const buildPlanDir = path.dirname(buildPlanPath);
const text = readFileSync(buildPlanPath, 'utf8').replace(/\r\n/g, '\n');
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

const cleanValue = (value: string) => value.trim().replace(/^`|`$/g, '').trim();

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

const taskIds = new Set(tasks.map((task) => task.id));

if (nextStep && !allowedNextSteps.has(nextStep) && !taskIds.has(nextStep)) {
  errors.push(
    `Поле \`Следующий шаг\` содержит неизвестное значение: \`${nextStep}\`. Используй существующий task id или один из системных шагов: preview-gate, final-approval, library-audit, completed.`,
  );
}

let inProgressCount = 0;
let inProgressTaskId: string | null = null;

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

    const reuseMode = fieldValue(task, 'Reuse mode');
    const referenceBaseline = fieldValue(task, 'Reference baseline');
    const reuseWithoutChanges = fieldValue(task, 'Reuse without changes');
    const allowedAdaptation = fieldValue(task, 'Allowed adaptation');
    const greenfieldJustification = fieldValue(task, 'Greenfield justification');

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

console.log(`Build-plan валиден: ${path.relative(process.cwd(), buildPlanPath)}`);

if (warnings.length > 0) {
  console.log('Предупреждения:');
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}
