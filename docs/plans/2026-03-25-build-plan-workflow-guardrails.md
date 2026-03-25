# План: `build-plan` и файловый routing для production-цикла

## Цель

Усилить `ranking corridor` workflow так, чтобы ИИ:

- не терял фазу проекта после `concept-pack` и `launch-card`;
- не перепрыгивал от `director pass` сразу к полной сборке;
- декомпозировал реализацию на конкретные задачи;
- мог надежно продолжать работу по файловому состоянию проекта, а не по памяти чата.

## Границы

- Обновить канон рабочего цикла.
- Обновить `launch` и `production` skills.
- Добавить project-local артефакт `build-plan.md`.
- Добавить шаблон `docs/templates/ranking-corridor-build-plan-template.md`.
- Обновить карту документации и структуру `projects/<project-slug>/`.
- Уточнить `director pass` и registry так, чтобы world-элементы предлагались из базы по обязательным слотам, а не подбирались заново по памяти.

## Этап 1. Закрепить файловую точку входа launch-этапа

- Файлы:
  - `.agents/skills/ranking-corridor-launch/SKILL.md`
  - `.agents/skills/ranking-corridor-launch/agents/openai.yaml`
- Что меняется:
  - после первого содержательного ответа пользователя `launch-card` материализуется в `projects/<project-slug>/launch-card.md`;
  - launch-этап заканчивается не только сообщением в чате, но и файловым контрактом проекта.
- Критерий готовности:
  - `launch-card.md` становится обязательным результатом launch-этапа;
  - skill по-прежнему останавливается до production.

## Этап 2. Встроить `build-plan` в production-цикл

- Файлы:
  - `docs/canon/ranking-corridor-working-mode.md`
  - `.agents/skills/ranking-corridor-production/SKILL.md`
  - `.agents/skills/ranking-corridor-production/agents/openai.yaml`
- Что меняется:
  - после создания или материального обновления `director-pass.md` workflow останавливается на явный approve пользователя, зафиксированный в секции `Режиссерский план` файла `review-notes.md`;
  - до `Решение: approved` и `Можно ли переходить к build-plan: yes` ИИ не имеет права переходить к `build-plan`;
  - между `director pass` и `preview-gate` появляется обязательный `projects/<project-slug>/build-plan.md`;
  - реализация делится на `preview-build` и `post-preview-build`;
  - routing идет по файловому состоянию и статусам внутри project-артефактов.
- Критерий готовности:
  - `director pass` становится жесткими воротами перед `build-plan`, а не soft-checkpoint;
  - full build нельзя начать до допустимого решения по `preview-gate`;
  - агент умеет продолжать работу с первой незавершенной задачи.

## Этап 3. Добавить шаблон и обновить структуру project-container

- Файлы:
  - `docs/templates/ranking-corridor-build-plan-template.md`
  - `docs/README.md`
  - `projects/README.md`
- Что меняется:
  - появляется стабильный формат `build-plan.md`;
  - карта документации показывает новый шаблон;
  - `projects/<project-slug>/build-plan.md` становится частью production-контейнера.
- Критерий готовности:
  - ИИ больше не изобретает формат `build-plan` заново;
  - структура проекта и канон не расходятся.

## Этап 4. Усилить качество preview-build через baseline и checkpoints

- Файлы:
  - `.agents/skills/ranking-corridor-production/SKILL.md`
  - `docs/canon/ranking-corridor-working-mode.md`
  - `docs/templates/ranking-corridor-build-plan-template.md`
- Что меняется:
  - `preview-build` фиксируется как `reference-anchored quality slice`, а не как MVP или rough scaffold;
  - для ключевых задач `camera`, `hero`, `environment` и `integrated-preview` появляются поля `Reference baseline`, `Reuse mode`, `Reuse without changes`, `Allowed adaptation`, `Non-negotiables` и условный `Greenfield justification`;
  - если в `launch-card` выбран registry-backed camera preset с `reusePolicy: implementation-locked`, он трактуется как готовый `scenePresetPackage`, а не как soft creative-направление;
  - для такого пакета `camera-preview` обязан reuse-ить exact `sourceOfTruthFiles`, а не писать новую camera math и новые тайминги "по мотивам";
  - если такой camera preset помечен как `timingContract: adaptive`, `camera-preview` обязан явно фиксировать `Object count`, `Target duration band`, `Timing policy` и `Finale tail policy`, а сам preset считается `60fps-only` через registry `supportedFps: 60`;
  - actual `Object count` machine-check сейчас гарантирован для snapshot-проектов, где есть `public/ranking-corridor/<project-slug>/data.json`;
  - если для выбранного hero/object family в `launch-card` выбран registry-backed reveal baseline с `reusePolicy: implementation-locked`, он трактуется как готовый `heroRevealPackage`, а не как свободный `revealSystem`;
  - для такого пакета `hero-preview` обязан reuse-ить exact `sourceOfTruthFiles`, а не писать новую reveal-анимацию "по мотивам";
  - validator `build-plan` cross-check-ит это правило против `launch-card.md` и registry, а не только против локального текста задачи;
  - для `environment-preview` и `integrated-preview` добавляются `World slots covered`, `Scene coverage` и `Registry baselines used`;
  - `Scene coverage` получает role-aware machine-readable формат: для scene-specific `environment-preview` это ровно один scene-id, а для `integrated-preview` — минимум `scene-1, scene-2, scene-3, scene-4`; `Registry baselines used` — либо список `moduleId`, либо literal `none`;
  - вместо одной общей environment-задачи `preview-build` получает отдельные scene-specific `environment-preview` задачи минимум для `scene-1`, `scene-2`, `scene-3` и `scene-4`;
  - внутри `preview-build` закрепляются quality checkpoints `hero-preview`, `camera-preview`, `environment-preview` и `integrated-preview`;
  - перед переводом ключевой preview-задачи в `done` агент обязан оставить короткий mini-review по baseline, reuse и качеству результата.
- Критерий готовности:
  - verified preset и reference implementation reuse-ятся как базовая реализация, а не только как словесная идея;
  - выбранный implementation-locked camera preset больше нельзя тихо разложить на новые независимые `camera` и `timing` решения;
  - silent greenfield для `hero/camera/environment` больше не допускается: нужен либо reuse baseline, либо явно согласованный `greenfield-approved`;
  - каждая scene-specific `environment-preview` задача покрывает ровно одну сцену, а `integrated-preview` охватывает минимум `scene-1, scene-2, scene-3, scene-4`;
  - `environment-preview` больше нельзя закрыть без явной привязки к обязательному ядру world-slot из `director-pass`;
  - слабый scaffold больше не может быть объявлен допустимым preview только потому, что код компилируется.

## Этап 4A. Сделать world-assembly машинно понятным

- Файлы:
  - `docs/library/ranking-corridor-module-registry.md`
  - `docs/templates/ranking-corridor-director-pass-template.md`
  - `docs/canon/ranking-corridor-working-mode.md`
  - `.agents/skills/ranking-corridor-production/SKILL.md`
- Что меняется:
  - world-модули в registry получают metadata `worldSlot`, `environmentFamily`, `role`, `combineWith`, `stageFit`, `costTier`;
  - `worldSlot` и `environmentFamily` допускают несколько значений, но только через delimiter `|`;
  - `director pass` переходит от свободного описания фона к обязательным world-slot;
  - для каждого slot ИИ сначала предлагает варианты из базы;
  - `director pass` требует минимум `4` сцены, минимум `1` сквозной world-anchor и минимум `3` slot, которые заметно меняются по сценам.
- Критерий готовности:
  - ИИ не должен каждый раз заново анализировать весь репозиторий, чтобы понять, какие world-элементы уже существуют;
  - source-of-truth для готовых world-модулей — registry, а не память чата;
  - director-pass больше не может ограничиться туманом, светом и абстрактной “атмосферой”.

## Этап 5. Добавить machine validation и visual evidence gate

- Файлы:
  - `scripts/validate-ranking-build-plan.ts`
  - `package.json`
  - `.agents/skills/ranking-corridor-production/SKILL.md`
  - `docs/canon/ranking-corridor-working-mode.md`
  - `docs/templates/ranking-corridor-build-plan-template.md`
  - `docs/templates/ranking-corridor-review-notes-template.md`
- Что меняется:
  - `build-plan` получает единый machine-check через `scripts/validate-ranking-build-plan.ts` без второго скрипта;
  - top-level поле `Следующий шаг` становится структурированным и проверяемым;
  - key preview tasks нельзя закрыть без browser/Studio-проверки, явного `Visual check method`, screenshot set и console/runtime evidence;
  - тот же скрипт получает режим `--finalize <task-id>` и становится единственным gatekeeper для перевода key preview task в `done`;
  - preview review фиксирует visual checklist, `Метод browser/Studio-проверки` и ссылку на screenshot-артефакты.
- Критерий готовности:
  - агент не может безошибочно пройти дальше с битым `build-plan`;
  - состояние `done без visual evidence` становится невалидным технически, а не только текстово нежелательным;
  - состояние `browser check есть, но метод не указан` тоже становится невалидным технически.

## Проверки

- Проверить поиском, что `build-plan` присутствует в каноне, `production` skill и шаблонах.
- Проверить, что `launch` skill явно материализует `launch-card.md`.
- Проверить, что `production` skill содержит:
  - `Step 0` для file-state routing;
  - правило `preview-build` -> `preview-gate` -> `post-preview-build`;
  - правило возобновления из частично выполненного `build-plan`;
  - reference baseline, перечислимый `Reuse mode`, `Reuse without changes`, `Allowed adaptation` и quality checkpoints для ключевых preview-задач;
  - registry-first поведение для world-slot в `director pass`.
- Проверить, что `projects/README.md` и `docs/README.md` знают про новый артефакт.
- Проверить, что шаблон `build-plan` не позволяет закрыть `hero/camera/environment` без заполненных `Reference baseline`, `Reuse without changes`, `Allowed adaptation` и mini-review.
- Проверить, что `npm run validate:build-plan -- <path>` падает на битом `build-plan` и проходит на корректном.
- Проверить, что `npm run validate:build-plan -- <path> --finalize <task-id>` не пишет `done`, если visual evidence или обязательные поля еще не готовы.
- Проверить, что `preview` контракт теперь требует browser/Studio-проверку, явный `Visual check method` и screenshot-артефакты.
- Проверить, что `environment-preview` и `integrated-preview` требуют `World slots covered`, `Scene coverage` и `Registry baselines used`.
- Проверить, что `Scene coverage` использует role-aware grammar: для scene-specific `environment-preview` это ровно один scene-id, а для `integrated-preview` — минимум `scene-1, scene-2, scene-3, scene-4`; `Registry baselines used` — только список `moduleId` или literal `none`.
