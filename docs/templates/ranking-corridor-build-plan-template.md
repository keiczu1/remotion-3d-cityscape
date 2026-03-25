# Шаблон build-plan

Сохраняется как `projects/<project-slug>/build-plan.md`.

## Назначение

Этот шаблон нужен как исполнительный мост между `director-pass.md` и реальной сборкой проекта.

Он не заменяет:

- `launch-card.md`;
- `director-pass.md`;
- `asset-manifest.md`;
- `review-notes.md`;
- `preview-gate`.

Его задача:

- разложить ближайшую реализацию на конкретные задачи;
- удержать фокус на одной активной задаче;
- отделить `preview-build` от `post-preview-build`;
- помочь ИИ продолжать проект по файловому состоянию, а не по памяти чата.

## Правила

- `build-plan` живет только внутри `projects/<project-slug>/`.
- `build-plan` создается только после явного approve режиссерского плана в секции `Режиссерский план` файла `review-notes.md`.
- Он должен оставаться плоским и практичным, а не превращаться в новый большой PRD.
- Обычно хватает `8-14` задач на весь цикл.
- У задачи должен быть один понятный результат, а не размытый “разберись со сценой”.
- В каждый момент времени только одна задача должна быть в статусе `in_progress`.
- Секция `post-preview-build` остается заблокированной, пока в `review-notes.md` нет допустимого решения по `preview-gate`.
- При продолжении проекта ИИ идет с первой незавершенной задачи, но сначала делает минимальную сверку с реальным состоянием файлов.
- Если задача помечена как выполненная, но минимальная сверка показывает расхождение, ИИ возвращает ее в `todo` или `blocked`, а не доверяет чекбоксу слепо.
- Нельзя писать в чат, что задача завершена или что началась следующая, пока в том же рабочем шаге не обновлены статус текущей задачи, `Следующий шаг` и `in_progress` у новой активной задачи.
- Поле `Следующий шаг` должно содержать существующий `task id` или один из системных шагов: `preview-gate`, `final-approval`, `library-audit`, `completed`.
- `Статус плана` обновляется по жизненному циклу:
  - `draft` — план еще неполон или заблокирован;
  - `active` — план готов к исполнению и по нему идет работа;
  - `preview-complete` — `preview-build` закрыт и `post-preview-build` разблокирован;
  - `full-complete` — все задачи закрыты и verification пройден.
- `Preview-build` в этом шаблоне означает не MVP и не rough scaffold, а `reference-anchored quality slice`.
- Для ключевых задач preview-качества (`camera`, `hero`, `environment`, `integrated-preview`) обязателен `Reference baseline`, машинно читаемый `Reuse mode`, список `Non-negotiables` и явная граница между reuse и адаптацией.
- Для `camera`, `hero` и `environment` reuse по умолчанию идет от verified implementation или явно названного reference baseline, а не только от словесной идеи.
- `Reference baseline` должен указывать на точный source-of-truth: `moduleId`, preset id, repo-relative путь к файлу или иной однозначный reference, а не на расплывчатое описание "что-то вроде стелы".
- `Reuse mode` для key preview task должен быть одним из: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`.
- `greenfield-approved` не является дефолтом. Он допустим только если пользователь явно согласовал выход за пределы baseline или если в артефактах проекта зафиксировано, что подходящего baseline нет.
- Если выбран `greenfield-approved`, обязательно заполни `Greenfield justification` с источником решения: сообщение пользователя, `launch-card.md` или `director-pass.md`. Во всех остальных случаях поле оставляй пустым.
- Если выбран любой reuse-режим кроме `greenfield-approved`, поле `Reference baseline` не может быть пустым или декоративным.
- `Studio/browser check = ok | warning` допустим только вместе с непустым `Visual check method`: нельзя писать "проверено", не указав, чем именно реально смотрели композицию.
- Нельзя переводить ключевую preview-задачу в `done`, если код компилируется, но результат все еще выглядит как бедный scaffold и нарушает `Non-negotiables`.
- Внутри `preview-build` обязательно должны быть quality checkpoints для `hero-preview`, `camera-preview`, `environment-preview` и `integrated-preview`.
- Для quality-checkpoint-задачи со статусом `in_progress` или `done` обязательны валидные `Reuse mode`, `Reference baseline` (если это не `greenfield-approved`), `Reuse without changes` и `Allowed adaptation`.
- Для `hero-preview` дополнительно обязательны `Hero priority`, `Media layout policy`, `Lane collision policy`, `Protected data zone` и `Rank placement`: это отдельный policy-слой hero-модуля, а не дублирование `objectFamily`.
- Для `environment-preview` и `integrated-preview` дополнительно обязательны `World slots covered`, `Scene coverage` и `Registry baselines used`.
- Не сворачивай всю world-evolution в одну общую environment-задачу: разложи среду на отдельные scene-specific `environment-preview` задачи минимум для `scene-1`, `scene-2`, `scene-3` и `scene-4`.
- Каждая scene-specific `environment-preview` задача должна иметь `Scene coverage` ровно с одним scene-id; `integrated-preview` собирает их вместе и покрывает минимум `scene-1, scene-2, scene-3, scene-4`.
- `World slots covered` заполняй машинно читаемыми id через запятую. Обязательное ядро: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather`. `payoff` добавляй только если эта задача реально покрывает поздние финальные акценты.
- `Scene coverage` заполняй по роли: для scene-specific `environment-preview` это ровно один scene-id (`scene-1`), для `integrated-preview` — минимум `scene-1, scene-2, scene-3, scene-4`.
- `Registry baselines used` заполняй списком `moduleId` через запятую. Если для world-slot в реестре нет подходящего baseline и задача опирается только на project-local baseline или новый слой, указывай literal `none`.
- Для quality-checkpoint-задачи со статусом `done` обязательны непустые `Mini-review`, `Studio/browser check`, `Visual check method`, `Console/runtime check` и `Screenshot set`.
- `Visual check method` агент выбирает сам из разрешенных вариантов `mcp-playwright | remotion-studio | built-in-browser`, но выбор должен быть явно зафиксирован до финализации задачи.
- Для обычной проверки запускай `npm run validate:build-plan -- projects/<project-slug>/build-plan.md`.
- Для перевода key preview task в `done` не меняй статус вручную: используй `npm run validate:build-plan -- projects/<project-slug>/build-plan.md --finalize <task-id>`. Этот же скрипт сам переведет задачу в `done`, обновит `Следующий шаг` и остановится, если visual evidence или обязательные поля еще не готовы.

## Минимальная сверка при возобновлении

- целевые файлы существуют;
- файлы не пустые;
- ожидаемые экспорты или точки входа присутствуют;
- очевидные импорты и связи не сломаны.

## Полная сверка на воротах

Делается только:

- перед `preview-gate`;
- перед переходом к полному `post-preview-build`;
- перед финальным заявлением о готовности.

Полная сверка обычно включает:

- `npx tsc --noEmit` или эквивалентную техническую проверку;
- открытие композиции в Remotion Studio без runtime-ошибок;
- просмотр целевого среза сцены без явных layout/runtime-проблем.

## Визуальные доказательства

Для ключевых preview-задач обязательны:

- browser/Studio-проверка живой композиции, а не только чтение кода;
- явная фиксация способа просмотра: `mcp-playwright | remotion-studio | built-in-browser`;
- проверка console/runtime без игнорирования ошибок и missing-asset warning;
- screenshot set в `projects/<project-slug>/exports/preview-checks/`;
- краткая visual-note, если есть `warning`, но задача все равно переводится в `done`.

## Шаблон

```md
# Build Plan

## Проект
- Slug проекта:
- Человеческое название (опционально):
- Тема:
- Создано:
- Обновлено:
- Текущая фаза: `preview-build | post-preview-build`
- Статус плана: `draft | active | preview-complete | full-complete`
- Следующий шаг:
- Что заблокировано до `preview-gate`:

## Короткий контекст
- На что опирается план:
- Что уже зафиксировано в `launch-card.md`:
- Что уже зафиксировано в `director-pass.md`:
- Что нельзя менять без отдельного пересогласования:

## Preview-build

> Для ключевых preview-задач обязательно заполняй `Preview role`, `Reference baseline` (если это не `greenfield-approved`), `Reuse mode`, `Reuse without changes`, `Allowed adaptation`, `Non-negotiables`, `Studio/browser check`, `Visual check method`, `Console/runtime check`, `Screenshot set` и `Mini-review`. Для `environment-preview` и `integrated-preview` дополнительно обязательны `World slots covered`, `Scene coverage` и `Registry baselines used`. Если конкретная задача не относится к quality checkpoint, укажи `Preview role: support`. Среду не сворачивай в одну общую задачу: для minimum contract нужны отдельные scene-specific environment-задачи как минимум для `scene-1`, `scene-2`, `scene-3` и `scene-4`. Если в `launch-card.md` выбран `scenePresetPackage` с `reusePolicy: implementation-locked`, для `camera-preview` обязательны `Reuse mode: preset-reuse`, точный `Reference baseline` по `sourceOfTruthFiles` из registry и явный список зафиксированного поведения в `Reuse without changes`. Если в `launch-card.md` выбран `heroRevealPackage` с `reusePolicy: implementation-locked`, для `hero-preview` обязательны `Reuse mode: preset-reuse`, точный `Reference baseline` по `sourceOfTruthFiles` из registry и явный список зафиксированного reveal-поведения в `Reuse without changes`. Валидатор сверяет эти блоки не только локально по `build-plan.md`, но и против `launch-card.md`, registry и launch-card поля `что считается зафиксированным без пересборки`, которое должно совпадать с registry `lockedBehavior`.
> Если выбран implementation-locked camera preset с `timingContract: adaptive`, для `camera-preview` дополнительно фиксируй `Object count`, `Target duration band`, `Timing policy` и `Finale tail policy`: это отдельный contract-level слой, чтобы count-aware retiming был явным, а не спрятанным в произвольном описании.
> Для `hero-preview` поля `Hero priority`, `Media layout policy`, `Lane collision policy`, `Protected data zone` и `Rank placement` трактуются как cross-family media policy: валидатор сверяет их с `launch-card.md`, а не считает частью одного конкретного tower-стиля.

### BP-01. Data snapshot и типы
- Статус: `todo | in_progress | blocked | done`
- Preview role: `support | hero-preview | camera-preview | environment-preview | integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
- Non-negotiables:
- World slots covered: `environment-preview | integrated-preview only`
- Scene coverage: `environment-preview -> scene-1 | integrated-preview -> scene-1, scene-2, scene-3, scene-4 | иначе пусто`
- Registry baselines used: `environment-preview | integrated-preview only: module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-02. Camera preview / scene logic
- Статус: `todo | in_progress | blocked | done`
- Preview role: `camera-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Object count:
- Target duration band:
- Timing policy:
- Finale tail policy:
- Greenfield justification:
- Non-negotiables:
- Для implementation-locked preset-пакета:
  - `Reuse mode`: только `preset-reuse`
  - `Reference baseline`: `sourceOfTruthFiles` выбранного registry-пакета
  - `Reuse without changes`: camera path math, motion-характер preset, scene progression, intro/main handoff, VIP/tower orbit behavior
  - `Allowed adaptation`: только data normalization, рабочие offsets, безопасная дистанция камеры, topic-specific framing и count-aware retiming через закрепленный timing policy
  - `FPS contract`: текущие adaptive camera preset рассчитаны только на `60 fps`; build-plan не должен трактовать их как универсальные для другого fps
  - `Object count`: фактическое количество объектов текущего проекта; для snapshot-проектов validator сверяет его с `supportedCountRange` выбранного preset и с actual count из `public/ranking-corridor/<project-slug>/data.json`
  - `Target duration band`: exact `targetDurationBandSeconds` из registry для adaptive-пакета; это явный project-level audit trail budget-а, а не скрытая runtime-магия
  - `Timing policy`: exact `timingPolicyId` из registry для adaptive-пакета
  - `Finale tail policy`: `off | legacy-cinematic-slowdown` в рамках того, что разрешено registry-контрактом
  - validator cross-check: `build-plan.md` сверяется с выбранным `scenePresetPackage` из `launch-card.md`, exact `sourceOfTruthFiles` из registry и launch-card полем `что считается зафиксированным без пересборки`
- World slots covered: `environment-preview | integrated-preview only`
- Scene coverage: `environment-preview -> scene-1 | integrated-preview -> scene-1, scene-2, scene-3, scene-4 | иначе пусто`
- Registry baselines used: `environment-preview | integrated-preview only: module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-03. Hero preview
- Статус: `todo | in_progress | blocked | done`
- Preview role: `hero-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Hero priority:
- Media layout policy:
- Lane collision policy:
- Protected data zone:
- Rank placement:
- Greenfield justification:
- Non-negotiables:
- Для implementation-locked reveal-пакета:
  - `Reuse mode`: только `preset-reuse`
  - `Reference baseline`: `sourceOfTruthFiles` выбранного registry reveal-пакета
  - `Reuse without changes`: activation / presentation gate, reveal staging order, shell-to-data choreography, timing метрики, effect family
  - `Allowed adaptation`: только тема, материалы, layout-safe offsets, content slots и topic-specific поверхности
  - validator cross-check: `build-plan.md` сверяется с выбранным `heroRevealPackage` из `launch-card.md`, exact `sourceOfTruthFiles` из registry, launch-card полем `что считается зафиксированным без пересборки` и совместимостью reveal-пакета с `objectFamily`
- Для `image-first` hero-модуля:
  - `Hero priority`: `image-first`
  - `Media layout policy`: `adaptive-safe`
  - `Lane collision policy`: `hard-fit`
  - `Protected data zone`: `true`
  - `Rank placement`: `above-media`
  - `Reuse without changes`: image-dominant hierarchy, protected нижний data-block, safe-gap между media и data-zone
  - `Allowed adaptation`: тема, материалы, aspect-aware media frame, типографика и layout-safe offsets без отказа от image-first доминанты
  - эти поля задают media policy hero-модуля и должны одинаково работать поверх разных `objectFamily`, а не только на одной теме или одной форме башни
- World slots covered: `environment-preview | integrated-preview only`
- Scene coverage: `environment-preview -> scene-1 | integrated-preview -> scene-1, scene-2, scene-3, scene-4 | иначе пусто`
- Registry baselines used: `environment-preview | integrated-preview only: module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-04. Environment preview для `scene-1`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-1`
- Registry baselines used: `module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-05. Environment preview для `scene-2`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-2`
- Registry baselines used: `module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-06. Environment preview для `scene-3`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-3`
- Registry baselines used: `module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-07. Environment preview для `scene-4`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-4`
- Registry baselines used: `module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-08. Integrated preview
- Статус: `todo | in_progress | blocked | done`
- Preview role: `integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-1, scene-2, scene-3, scene-4`
- Registry baselines used: `module-id, another-module-id | none`
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

## Post-preview-build

> Эта секция остается заблокированной до допустимого решения по `preview-gate`.

### FB-01. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:

### FB-02. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:

### FB-03. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:

## История обновлений
- Дата:
  - Что изменилось в плане:
```

## Что считается хорошим результатом

Хороший `build-plan`:

- не дублирует `director pass`, а превращает его в исполнимые задачи;
- не пытается распланировать все до микрошагов;
- помогает собрать preview-пакет без раннего full build;
- заставляет делать `preview-build` как reference-anchored quality slice, а не как бедный scaffold;
- не дает закрыть quality-checkpoint без visual evidence и machine-check через валидатор;
- держит project-файлы синхронными с тем, что агент уже объявил в чате;
- позволяет продолжить проект в новом запуске без потери контекста.
