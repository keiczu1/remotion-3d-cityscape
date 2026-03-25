---
name: ranking-corridor-production
description: "Веди `ranking corridor` проект после `launch-card`: создавай и обновляй project-артефакты, делай подробный `director pass`, собирай данные и ассеты, проходи `preview-gate`, проводи полную сборку только после review предпросмотра, фиксируй финальное утверждение и запускай аудит библиотеки только после финального статуса. Используй, когда у проекта уже есть `launch-card` или готовый project-container и нужно продолжить рабочий цикл производства."
---

# Ranking Corridor Production

Веди `ranking corridor` проект от `launch-card` до финального статуса и аудита библиотеки, соблюдая все stop-condition из канона.

Не пропускай `preview-gate`, не запускай аудит библиотеки раньше `final-approved` или `final-approved-with-notes` и не придумывай свои форматы проектных артефактов.

## Сначала подними рабочий контекст

Перед работой используй такие источники:

- `AGENTS.md`
- `docs/README.md`
- `docs/canon/ranking-corridor-format.md`
- `docs/canon/ranking-corridor-working-mode.md`
- `docs/canon/remotion-project-rules.md`
- `docs/library/ranking-corridor-module-registry.md`
- `docs/templates/ranking-corridor-launch-card-template.md`
- `docs/templates/ranking-corridor-director-pass-template.md`
- `docs/templates/ranking-corridor-build-plan-template.md`
- `docs/templates/ranking-corridor-asset-manifest-template.md`
- `docs/templates/ranking-corridor-library-audit-template.md`
- `docs/templates/ranking-corridor-review-notes-template.md`
- `projects/README.md`

Когда начинаешь писать или менять Remotion-код, также учитывай локальный skill `remotion-best-practices` и опирайся на текущий `src/compositions/ranking-towers/` как на reference implementation, а не как на жесткий закон.

## Шаг 0. Определи фазу по файловому состоянию

Перед любым действием:

- сначала разреши целевой `project-slug`, а не придумывай его автоматически:
  - если пользователь явно дал `project-slug` или путь к project-container, используй его;
  - если `project-slug` явно не дан, сначала найди подходящий существующий container в `projects/` и предпочти продолжение уже начатого проекта;
  - новый `project-slug` выбирай только если подходящего container действительно нет;
  - если нашлось несколько правдоподобных container-кандидатов, не создавай новый молча: кратко запроси уточнение у пользователя;
- после разрешения `project-slug` прочитай `projects/<project-slug>/launch-card.md`, если он уже есть;
- прочитай `projects/<project-slug>/director-pass.md`, если он уже есть;
- прочитай `projects/<project-slug>/build-plan.md`, если он уже есть;
- прочитай `projects/<project-slug>/review-notes.md`, если он уже есть;
- определи фазу не по памяти чата, а по содержимому и статусам в этих файлах.

Правила routing:

- если есть `launch-card.md`, но нет `director-pass.md` — сначала сделай `director pass`, обнови секцию `Режиссерский план` в `review-notes.md` до `pending` и остановись для approve пользователя;
- если `director-pass.md` уже есть, но в `review-notes.md` нет секции `Режиссерский план` со статусом `approved` — сначала покажи пользователю режиссерский план и дождись approve, а не переходи дальше;
- если есть `director-pass.md` и он уже approved в `review-notes.md`, но нет `build-plan.md` — сначала собери `build-plan`;
- если `build-plan.md` существует и в нем есть незавершенные задачи `preview-build` — продолжай с первой незавершенной задачи этой секции;
- если `preview-build` завершен, но в `review-notes.md` нет допустимого решения по preview — сначала сделай `preview-gate`;
- если preview уже дал `approve` или допустимый `approve with changes` и секция `post-preview-build` разблокирована — продолжай с первой незавершенной задачи этой секции;
- если `build-plan.md` помечает задачу как завершенную, но минимальная сверка показывает расхождение с реальными файлами, верни задачу в `todo` или `blocked`, а не доверяй чекбоксу слепо.

Минимальная сверка при возобновлении:

- целевые файлы существуют;
- файлы не пустые;
- ожидаемые экспорты или точки входа присутствуют;
- очевидные импорты и связи не сломаны.

Полная сверка делается только на дорогих воротах:

- перед `preview-gate`;
- перед переходом к активному `post-preview-build`;
- перед финальным заявлением о готовности.

## Работай как рабочий процесс с тремя состояниями

### Состояние 1. До review предпросмотра

Если есть `launch-card`, но нет подтвержденного результата review предпросмотра:

- создай или обнови project-артефакты;
- сделай `director pass`;
- остановись на approve режиссерского плана;
- собери `build-plan`;
- выполни задачи `preview-build`;
- сделай `preview-gate`;
- обнови `review-notes.md` в секции `Предпросмотр`;
- остановись и жди решения админа.

### Состояние 2. После review предпросмотра, но до финального утверждения

Если review предпросмотра уже дал `approve` или `approve with changes` и нет блокера на re-preview:

- выполни задачи `post-preview-build`;
- сделай verification;
- обнови секцию `Финальное утверждение` в `review-notes.md`;
- остановись, если статус еще не финальный.

### Состояние 3. После финального утверждения

Если проект получил `final-approved` или `final-approved-with-notes`:

- проведи аудит библиотеки;
- если promotion очевиден, обнови registry и связанные docs;
- если promotion спорный, зафиксируй checkpoint и не делай перенос молча.

## Шаг 1. Нормализуй входы

Перед активной работой проверь, что у тебя есть:

- тема и `launch-card`;
- разрешенный `project-slug` или явный сигнал, что нового container еще нет;
- понимание текущего состояния review;
- доступ к проектному контейнеру или право его создать.

Если подходящий existing container уже найден, используй его `project-slug` и не создавай новый.

Если подходящего container нет, предложи или выбери новый `project-slug` по канону `YYYY-MM-DD-short-topic-slug`.

Если project-container отсутствует, создай минимум:

- `projects/<project-slug>/launch-card.md`
- `projects/<project-slug>/director-pass.md`
- `projects/<project-slug>/asset-manifest.md`
- `projects/<project-slug>/review-notes.md`
- `projects/<project-slug>/data/`
- `projects/<project-slug>/exports/`

Опционально, если по правилам из `projects/README.md` проекту уже нужен отдельный входной файл:

- `projects/<project-slug>/README.md`

Используй только шаблоны из `docs/templates/`.

Если `build-plan.md` еще не существует, создай его только после явного approve режиссерского плана, а не заранее пустым placeholder-файлом и не автоматически сразу после draft-версии `director pass`.

Если `launch-card.md`, `director-pass.md`, `build-plan.md`, `asset-manifest.md` или `review-notes.md` уже существуют, обновляй их, а не пересоздавай.

## Шаг 2. Сделай `director pass`

Делай это после `launch-card` и до `preview-gate`.

Это основной этап `content enrichment` для проекта.

Опирайся на:

- `docs/canon/ranking-corridor-working-mode.md`
- `docs/templates/ranking-corridor-director-pass-template.md`

Что обязательно:

- не пересобирай ролик заново и не спорь с уже утвержденным creative-направлением без сильной причины;
- зафиксируй, что остается стабильным из `launch-card`;
- раздели ролик ровно на `4` сцены;
- отдельно продумай систему вторичной жизни / фоновой активности;
- для готовых world-элементов сначала читай `docs/library/ranking-corridor-module-registry.md`, а не анализируй весь репозиторий заново;
- собирай вторичную жизнь как обязательное ядро world-slot, а не как свободный список эффектов:
  - `horizon`
  - `side-dressing`
  - `atmospheric-motion`
  - `directed-motion`
  - `ground`
  - `light-weather`
- `payoff` используй как отдельный поздний акцентный слот, если у ролика есть самостоятельный финальный payoff, но не как обязательный слой для каждой scene-task;
- если в реестре для world-slot есть подходящий модуль, предложи его первым;
- `Окружение вдоль коридора` должно содержать минимум `2` семейства;
- держи минимум `1` slot как сквозной якорь через весь ролик и минимум `3` slot, которые заметно меняются по сценам;
- при необходимости пересобери предварительную `secondary-life system`, намеченную в `concept-pack`, если это не ломает `hero`, базовую камеру и базовый ритм;
- описывай эту систему по-человечески и предметно: что видно на горизонте и в дальнем плане, какие art-объекты поддерживают мир, какие движения, анимации и смены происходят по сценам;
- покажи, как вторичная жизнь и мир эволюционируют от начала к финалу;
- для каждой сцены объясни, чем изменение удерживает интерес и усиливает напряжение;
- явно назови риски перегруза.

Сохрани результат в:

- `projects/<project-slug>/director-pass.md`
- `projects/<project-slug>/review-notes.md`

После сохранения `director-pass.md` сразу обнови секцию `Режиссерский план` в `review-notes.md`:

- если `director pass` создан впервые или materially обновлен — поставь `Решение: pending`;
- кратко зафиксируй, что уже подтверждено и что пользователь должен проверить;
- выставь `Можно ли переходить к build-plan: no`;
- затем остановись и дождись явного approve пользователя, а не продолжай в `build-plan` автоматически.

Не меняй через `director pass` hero-модуль, базовую камеру или базовый ритм, зафиксированные в `launch-card`.

Если у тебя появляется сильная идея такого изменения, не внедряй ее молча: пометь ее только как `design-only` заметку и не считай новой правдой проекта.

## Шаг 3. Собери `build-plan`

Сделай это только после явного approve режиссерского плана и до активной реализации.

Опирайся на:

- `docs/canon/ranking-corridor-working-mode.md`
- `docs/templates/ranking-corridor-build-plan-template.md`

Что обязательно:

- сохрани результат в `projects/<project-slug>/build-plan.md`;
- разложи ближайшую реализацию на `8-14` конкретных задач;
- для каждой задачи явно зафиксируй `id`, `phase`, `status`, затронутые файлы, цель, критерий готовности и проверку;
- для ключевых задач preview-качества (`camera`, `hero`, `environment`, `integrated-preview`) дополнительно зафиксируй `Reference baseline`, `Reuse mode`, `Reuse without changes`, `Allowed adaptation`, `Non-negotiables`, `Studio/browser check`, `Visual check method`, `Console/runtime check` и `Screenshot set`;
- для `environment-preview` и `integrated-preview` дополнительно зафиксируй `World slots covered`, `Scene coverage` и `Registry baselines used`;
- не собирай всю среду в одну общую environment-задачу: сделай отдельные `environment-preview` задачи минимум для `scene-1`, `scene-2`, `scene-3` и `scene-4`;
- каждая scene-specific `environment-preview` задача должна иметь `Scene coverage` ровно с одним scene-id;
- `integrated-preview` должен собирать минимум `scene-1, scene-2, scene-3, scene-4` вместе и проверять, что мир эволюционирует по сценам, а не только выглядит достойно в одном кадре;
- используй top-level поле `Следующий шаг`, а не свободный текст `Следующая задача`;
- в `Следующий шаг` записывай либо существующий `task id`, либо один из системных шагов `preview-gate | final-approval | library-audit | completed`;
- держи только одну задачу в `in_progress`;
- разделяй задачи на `preview-build` и `post-preview-build`;
- считай `post-preview-build` заблокированным до допустимого решения по preview;
- обнови top-level `Статус плана` осмысленно, а не формально:
  - `draft` — только если план еще неполон, упирается в блокер или требует явного уточнения;
  - `active` — когда план готов к исполнению и по нему идет работа;
  - `preview-complete` — когда `preview-build` закрыт, preview-решение допустимо и `post-preview-build` разблокирован;
  - `full-complete` — когда все задачи закрыты и verification пройден;
- не превращай `build-plan` в новый большой PRD или архитектурный трактат.
- сразу после создания или обновления `build-plan.md` запусти `npm run validate:build-plan -- projects/<project-slug>/build-plan.md`.

Считай `preview-build` не MVP и не rough scaffold, а `reference-anchored quality slice`.

Это означает:

- для `camera`, `hero` и `environment` по умолчанию reuse идет от конкретной verified implementation или явно названного reference baseline, а не только от словесной идеи;
- `Reference baseline` записывай как точный source-of-truth: `moduleId`, preset id, repo-relative путь к файлу или иной однозначный reference, а не как расплывчатое описание;
- `Reuse mode` для key preview task не является свободным текстом и должен быть одним из: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`;
- если в `launch-card.md` выбран `scenePresetPackage` с `reusePolicy: implementation-locked`, для `camera-preview` по умолчанию обязателен `Reuse mode: preset-reuse`, а `Reference baseline` должен ссылаться на `sourceOfTruthFiles` выбранного пакета;
- для такого implementation-locked пакета в `Reuse without changes` явно перечисляй camera path math, переходные тайминги, hold rhythm, базовую scene progression и finale behavior;
- для такого implementation-locked пакета в `Allowed adaptation` оставляй только data normalization, рабочие offsets, безопасную дистанцию камеры и topic-specific framing без пересборки характера preset;
- после обновления `build-plan.md` валидатор должен подтвердить, что `camera-preview` согласован с выбранным `scenePresetPackage` из `launch-card.md`, exact `sourceOfTruthFiles` из registry и launch-card полем `что считается зафиксированным без пересборки`, которое должно совпадать с registry `lockedBehavior`;
- если в `launch-card.md` выбран `heroRevealPackage` с `reusePolicy: implementation-locked`, для `hero-preview` по умолчанию обязателен `Reuse mode: preset-reuse`, а `Reference baseline` должен ссылаться на `sourceOfTruthFiles` выбранного reveal-пакета;
- для такого implementation-locked reveal-пакета в `Reuse without changes` явно перечисляй activation / presentation gate, reveal staging order, shell/data choreography, timing метрики и effect family;
- для такого implementation-locked reveal-пакета в `Allowed adaptation` оставляй только тему, материалы, layout-safe offsets, content slots и topic-specific поверхности без пересборки reveal-характера;
- после обновления `build-plan.md` валидатор должен подтвердить, что `hero-preview` согласован с выбранным `heroRevealPackage` из `launch-card.md`, exact `sourceOfTruthFiles` из registry, launch-card полем `что считается зафиксированным без пересборки` и совместимостью reveal-пакета с `objectFamily`;
- `greenfield-approved` не является дефолтом: он допустим только если пользователь явно одобрил выход за пределы baseline или если в `launch-card.md` / `director-pass.md` уже зафиксировано отсутствие подходящего baseline;
- если выбран `greenfield-approved`, до старта реализации заполни `Greenfield justification` и укажи источник решения;
- если выбран любой reuse-режим кроме `greenfield-approved`, не начинай писать `hero`, `camera` или `environment` как greenfield-модуль: сначала reuse baseline, потом theme adaptation;
- для key preview task со статусом `in_progress` или `done` `Reuse mode`, `Reference baseline` (если это не `greenfield-approved`), `Reuse without changes` и `Allowed adaptation` уже должны быть заполнены;
- `Scene coverage` записывай только в машинно читаемом виде: для scene-specific `environment-preview` это ровно один id (`scene-1`), а для `integrated-preview` — минимум `scene-1, scene-2, scene-3, scene-4`; человекочитаемые названия сцен в `director-pass` должны ссылаться на те же id;
- `Registry baselines used` записывай либо списком registry `moduleId` через запятую, либо literal `none`, если registry-backed baseline для world-slot отсутствует;
- в `preview-build` важнее глубина ключевых слоев, чем попытка быстро закрыть больше задач за один проход;
- нельзя считать задачу `done`, если код компилируется, но результат все еще выглядит как бедный scaffold и нарушает `Non-negotiables`.

Используй такие типы задач как ориентир, а не как жесткий список:

- data snapshot и типы;
- scene-logic, milestones и camera math;
- hero-модуль для preview-среза;
- фон и secondary-life для preview-среза;
- reveal / layout / payoff preview slices;
- preview verification package;
- post-preview full corridor;
- polishing и финальная verification.

`Build-plan` можно коротко показать пользователю как soft-checkpoint, но по умолчанию не жди отдельного обязательного approve, если только план не стал явно рискованным.

Это не отменяет обязательный approve режиссерского плана: без `Решение: approved` в секции `Режиссерский план` workflow не идет дальше.

## Шаг 4. Выполни задачи `preview-build` и собери data snapshot

До `preview-gate` ты обязан пройти через задачи из секции `preview-build` в `build-plan.md`.

Что обязательно:

- отмечай текущую активную задачу как `in_progress`;
- после завершения задачи обновляй ее статус в `build-plan.md`;
- не пиши в чат, что текущая задача завершена или что началась следующая, пока в том же рабочем шаге не обновлены `build-plan.md`, поле `Следующий шаг` и статус следующей активной задачи, независимо от того, как названы сами задачи;
- держи `Статус плана` в `active`, пока проект реально исполняется и еще не достиг `preview-complete` или `full-complete`;
- не переходи к следующей задаче, пока текущая не закрыта или не помечена как `blocked`;
- зафиксируй источники данных;
- зафиксируй дату проверки данных;
- сохрани локальную рабочую версию dataset в `projects/<project-slug>/data/`;
- собери локальные ассеты;
- сохрани исходные URL и статусы ассетов в `asset-manifest.md`;
- если реальный data snapshot или реальные ассеты заметно меняют ощущение масштаба, плотность мира или характер фоновой активности, обнови `director pass` до `preview-gate`, а не держись за раннюю chat-first версию.
- если такое обновление materially меняет world-slot, scene structure, escalation или payoff, верни секцию `Режиссерский план` в `pending`, обнови `review-notes.md` и снова остановись до approve пользователя.

Для `preview-build` обязательно пройди через такие quality checkpoints:

- `hero-preview` — один контрольный объект должен уже выглядеть как честный quality slice, а не как placeholder;
- если для текущего hero/object family уже есть reveal-baseline, `hero-preview` без анимации появления не проходит quality bar и не может считаться `done`;
- `camera-preview` — камера и тайминги должны быть узнаваемо близки к выбранному preset или baseline, а не только совпадать по API;
- если выбран implementation-locked `scenePresetPackage`, `camera-preview` не пишется с нуля: reuse-ится рабочая реализация выбранного пакета, а отклонения требуют отдельного согласования;
- если валидатор не видит exact `sourceOfTruthFiles` выбранного implementation-locked пакета в `Reference baseline`, такая задача не может считаться корректно оформленной;
- `environment-preview` — среда должна уже давать depth, secondary-life и ощущение мира, а не пустой scaffold, и покрывать world-slot, выбранные в `director pass`;
- `environment-preview` делай посценным: каждая environment-задача отвечает за одну конкретную сцену, а не за всю world-evolution сразу;
- `integrated-preview` — на контрольном срезе hero, camera и environment должны работать вместе как единая сцена и держать минимум `4` сцены world-evolution.

Перед переводом ключевой preview-задачи в `done` коротко зафиксируй mini-review:

- что было `Reference baseline`;
- что reuse-нуто без изменений;
- что адаптировано под тему;
- что еще пока слабое;
- почему это уже не scaffold.

Перед переводом key preview task в `done` обязательно сделай visual evidence gate:

- открой композицию в браузере или Remotion Studio, а не ориентируйся только на код и скрипты;
- явно зафиксируй способ этой проверки как `mcp-playwright | remotion-studio | built-in-browser`;
- если у тебя есть доступ к MCP Playwright или встроенному браузеру, используй один из этих инструментов как основной способ visual-check вместо слепой оценки по коду;
- проверь console/runtime без игнорирования ошибок и missing-asset warning;
- сохрани screenshot set в `projects/<project-slug>/exports/preview-checks/`;
- обнови в `build-plan.md` поля `Studio/browser check`, `Visual check method`, `Console/runtime check` и `Screenshot set`;
- для `environment-preview` и `integrated-preview` также обнови `World slots covered`, `Scene coverage` и `Registry baselines used`;
- `Scene coverage` держи по роли: для scene-specific `environment-preview` — ровно один scene-id, для `integrated-preview` — минимум `scene-1, scene-2, scene-3, scene-4`;
- в `Registry baselines used` используй либо список `moduleId`, либо literal `none`, без самодельных формулировок;
- после обновления статуса снова запусти `npm run validate:build-plan -- projects/<project-slug>/build-plan.md`.

Пути по умолчанию:

- dataset snapshot: `projects/<project-slug>/data/`
- публичные ассеты: `public/ranking-corridor/<project-slug>/`
- preview exports: `projects/<project-slug>/exports/preview/`
- preview checks: `projects/<project-slug>/exports/preview-checks/`

На этом этапе уже допустимо создавать и обновлять:

- `src/compositions/<project-slug>/`
- `public/ranking-corridor/<project-slug>/`

Но только в объеме, нужном для `preview-build`, а не для полного ролика.

Не считай `asset-manifest` формальностью. Это рабочий контракт воспроизводимости.

## Шаг 5. Сделай `preview-gate`

До полной сборки композиции ты обязан собрать preview-пакет.

Ориентируйся на канон:

- репрезентативный набор примерно на `5` объектов по всей шкале;
- реальный hero-модуль;
- примененный `director pass`;
- реальные данные;
- реальные локальные ассеты хотя бы для preview-набора;
- короткий вступительный фрагмент;
- фрагмент с соседними объектами;
- фрагмент ближе к лидерам;
- стоп-кадр или крупный план по читаемости;
- отдельный director-pass-проход: ранняя сцена, середина ролика и финальная треть должны отличаться по ощущению, а вторичная жизнь не должна проседать;
- отдельный layout-pass на сложных случаях: длинные названия, крупные числа, широкие логотипы, плотные соседние объекты и разные дистанции камеры;
- короткий фрагмент payoff.

Перед `preview-gate` сделай полную сверку:

- запусти `npx tsc --noEmit` или эквивалентную техническую проверку;
- проверь, что композиция открывается в Remotion Studio без runtime-ошибок;
- проверь, что целевой preview-срез просматривается без явных layout/runtime-проблем.

Зафиксируй preview-состояние в `review-notes.md`:

- какой пакет показан;
- что именно проверяется;
- как сработал `director pass` и держится ли вторичная жизнь;
- какие world-slot из `director pass` реально реализованы и как они меняются по сценам;
- не начинает ли вторичная жизнь перетягивать внимание с героя;
- держится ли укладка данных на сложных случаях и где есть `layout-warning` или `layout-fail`;
- результат browser/Studio-проверки;
- какой именно метод browser/Studio-проверки использован;
- результат console/runtime-проверки;
- папку screenshot-артефактов;
- короткий visual checklist по hero, camera, environment и director-pass match;
- решение админа:
  - `approve`
  - `approve with changes`
  - `reject`
- какие изменения нужны;
- нужен ли повторный preview.

После этого шага:

- если `reject` — не иди в полную сборку композиции;
- если `approve with changes` и правки затрагивают hero-модуль, укладку данных, `director pass`, вторичную жизнь, фон, pacing, камеру или способ подачи контента — сначала обнови preview;
- если `approve with changes` касается мелких текстовых или data-правок без смены визуального языка — можно продолжать, но зафиксируй это в `review-notes.md`;
- если решение по preview допустимо, обнови `build-plan.md`: закрой фазу `preview-build`, разблокируй `post-preview-build`, выставь `Статус плана = preview-complete`, переключи `Текущую фазу` на `post-preview-build`, обнови `Следующий шаг` и снова прогони валидатор;
- если `approve` — переходи дальше.

## Шаг 6. Делай `post-preview-build` только после review предпросмотра

Только после допустимого результата review предпросмотра:

- продолжай с первой незавершенной задачи секции `post-preview-build`;
- достраивай полный dataset pass;
- достраивай весь corridor;
- собирай полный main pass;
- доводи payoff и polishing;
- поддерживай канон `image-first`, если не зафиксирован осознанный особый случай.

Под полной сборкой композиции здесь понимается:

- полностью собранная Remotion-композиция;
- подключенные локальные данные и локальные ассеты;
- пройденная техническая проверка.

Это не означает автоматический экспорт `.mp4`, `.mov` или другого финального медиафайла. Экспорт делается только по явному запросу пользователя.

Не уноси решения в переиспользуемый слой на этом этапе.

## Шаг 7. Сделай verification и `Финальное утверждение`

Перед любым заявлением о готовности:

- обнови статусы задач в `build-plan.md`;
- пройди техническую проверку по `docs/canon/remotion-project-rules.md`;
- проверь математику сцены и duration;
- проверь читаемость;
- проверь, что режиссерская эскалация и вторичная жизнь не потерялись после полной сборки;
- проверь, что сборка и базовые инженерные инварианты не сломаны.
- только после этого, если все задачи закрыты и verification реально пройден, переведи `Статус плана` в `full-complete`.

Затем обнови секцию `Финальное утверждение` в `review-notes.md` с одним из статусов:

- `final-approved`
- `final-approved-with-notes`
- `not-final`

Если статус `not-final`, не запускай аудит библиотеки.

## Шаг 8. Запусти аудит библиотеки только после финального статуса

После `final-approved` или `final-approved-with-notes`:

- сначала проведи audit-first проход по новым решениям проекта;
- опирайся на `docs/templates/ranking-corridor-library-audit-template.md`, если нужен user-facing prompt или короткий checklist этого этапа;
- проверь отдельно категории:
  - `camera preset`
  - `timing preset`
  - `reveal/effect module`
  - `hero/object family`
  - `background / ambient / secondary-life system`
  - `utility / helper`
- не пытайся обязательно найти кандидата в каждой категории;
- если в категории зрелого кандидата нет, так и зафиксируй;
- для каждого найденного кандидата зафиксируй, где он живет, чем подтвержден в финальном ролике и почему он reusable, а не тема-специфичный декор;
- только после этого отдели `project-local` от реально переиспользуемых кандидатов;
- обнови секцию `Аудит библиотеки` в `review-notes.md` и зафиксируй общий результат:
  - `no-promotion`
  - `auto-promotion-applied`
  - `checkpoint-needed`
- если promotion очевиден, обнови `docs/library/ranking-corridor-module-registry.md`;
- если promotion меняет канон, обнови и канонические docs.

Для каждого кандидата зафиксируй одно решение:

- `stay-project-local`
- `keep-design-only`
- `promote-to-library`
- `checkpoint-needed`

Если кандидат относится к `camera preset` или `timing preset`, promotion может быть не только кодовым переносом, но и фиксацией preset-контракта в docs/registry, если нового library-модуля не требуется.

Не добавляй в библиотеку:

- одноразовый декоративный ход;
- тему-специфичный стиль;
- решение, не пережившее финальный проект;
- модуль без ясного контракта.

## Жесткие stop-condition

Никогда не делай:

- полную сборку композиции до review предпросмотра;
- аудит библиотеки до финального статуса;
- promotion в библиотеку, если решение спорное и требует checkpoint;
- молчаливое изменение канона без обновления docs.

## Быстрая самопроверка перед завершением

Перед финальным ответом проверь:

- project-артефакты созданы или обновлены по шаблонам;
- `director-pass.md` создан или обновлен и не спорит с `launch-card`;
- `build-plan.md` создан или обновлен, отражает текущую фазу и не содержит двух активных задач одновременно;
- `asset-manifest.md` содержит реальные локальные пути и исходные URL;
- `review-notes.md` отражает текущее состояние проекта;
- review предпросмотра или финальный статус действительно зафиксированы;
- ты не перепрыгнул через `preview-gate`;
- аудит библиотеки не запущен раньше времени;
- если менялся код, есть свежая верификация.
