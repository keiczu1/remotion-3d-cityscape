# Ranking Corridor: Реестр Библиотечных Модулей

**Дата:** 2026-03-17

## Назначение

Этот файл нужен, чтобы переиспользуемый слой не рос хаотично и не оставался только в памяти чата.

Здесь фиксируется:

- какие элементы уже перенесены в библиотеку;
- на основании каких проектов это произошло;
- какой у модуля контракт;
- какие документы были обновлены вместе с переносом в библиотеку;
- что еще остается `project-local` или `design-only`.

## Как использовать этот файл

ИИ должен обновлять этот реестр только когда происходит одно из трех событий:

1. финально утвержденный проект дал новый `library-module`;
2. существующий библиотечный модуль меняет контракт, совместимость или статус;
3. библиотечный модуль выводится из активного переиспользуемого слоя.

Если элемент остался локальным решением одного ролика или только кандидатом на перенос в библиотеку, в реестр его вносить не нужно.

Такие решения должны оставаться в `projects/<project-slug>/review-notes.md`, в секции `Аудит библиотеки`.

## Как `director pass` использует этот реестр

Для готовых world-элементов source-of-truth находится здесь, а не в памяти чата и не в повторном обходе всего репозитория.

Правила такие:

- перед сборкой `secondary-life system` ИИ сначала читает этот реестр;
- для каждого world-slot ИИ сначала предлагает подходящие registry-backed варианты;
- если в реестре для слота есть подходящий модуль, он должен быть показан первым;
- только если реестр не закрывает слот, ИИ может предложить `adapt-from-base` от project-local baseline или новый слой;
- project-local код не считается общей базой по умолчанию, пока он не promoted в этот реестр.

Практически это значит:

- `director pass` не должен каждый раз заново анализировать весь проект, чтобы понять, “что у нас уже есть”;
- он должен фильтровать готовые world-модули по их metadata из этого реестра;
- новый элемент предлагается только как осознанное дополнение к базе, а не как молчаливый greenfield-дефолт.

## Базовая политика переноса в библиотеку

Новый элемент не должен сразу считаться библиотекой.

Нормальный путь такой:

1. идея или гипотеза появляется в проекте;
2. элемент проходит `preview-gate`;
3. элемент доходит до полного ролика;
4. проект получает финальное утверждение;
5. ИИ делает аудит библиотеки;
6. только после этого элемент либо остается локальным, либо переносится в переиспользуемый слой.

## Что ИИ должен предлагать сам

Если после финального утверждения проекта элемент выглядит повторяемым, ИИ должен сам вынести короткое предложение с тремя вариантами:

1. оставить `project-local`;
2. выделить в локальный helper внутри проекта;
3. перенести в `library-module`.

Для варианта переноса в библиотеку ИИ должен указать:

- что именно выделяется;
- почему это не слишком привязано к теме;
- где модуль должен жить в коде;
- какие документы нужно обновить.

## Что считается хорошим кандидатом в библиотеку

- элемент пережил полный проход по проекту;
- он прошел проверку администратором;
- проект с этим элементом признан финальным;
- он не завязан намертво на одну тему;
- у него понятный интерфейс;
- он не ломает performance-policy;
- у него ожидается повторное использование;
- перенос уменьшает сложность следующих роликов.

## Что не нужно поднимать в библиотеку

- одноразовый декоративный ход;
- частный стиль под одну тему;
- нестабильную идею уровня `design-only`;
- решение, которое еще не пережило полный финальный проект;
- модуль, который пока не имеет ясного контракта.

## Правило обновления документации

При переносе в библиотеку ИИ должен обновлять не один кодовый модуль, а весь связанный след.

Минимальный пакет:

- `projects/<project-slug>/review-notes.md`
- этот реестр

Дополнительно, только если реально изменился канон:

- `docs/canon/ranking-corridor-format.md`
- `docs/canon/ranking-corridor-working-mode.md`
- `docs/canon/remotion-project-rules.md`

Правило простое:

- новый переиспользуемый модуль не обязан менять канон;
- но новый переиспользуемый модуль обязан быть зафиксирован в реестре;
- канон меняется только если меняется разрешенная грамматика, рабочий процесс или техническое правило общего уровня.

## Аудит библиотеки после финала проекта

После статуса `final-approved` или `final-approved-with-notes` ИИ должен сам пройтись по проекту и проверить:

- какие элементы уже покрываются текущей библиотекой;
- какие решения повторяют знакомые паттерны, но собраны локально;
- какие новые элементы реально стоят переноса в библиотеку;
- какие части лучше оставить `project-local`.

Аудит должен отдельно проходить по категориям:

- `camera preset`
- `timing preset`
- `reveal/effect module`
- `hero/object family`
- `background / ambient / secondary-life system`
- `utility / helper`

Важно:

- не в каждой категории обязан появиться кандидат;
- отсутствие кандидатов в категории — нормальный результат, а не ошибка аудита.

Если кандидат на перенос в библиотеку очевиден, ИИ должен:

- вынести модуль в переиспользуемый слой;
- обновить этот реестр;
- обновить связанную документацию;
- зафиксировать источник переноса в `review-notes` проекта.

Если решение спорное, ИИ должен показать короткий checkpoint до переноса в библиотеку.

Если решение не перенесено, вывод аудита библиотеки все равно должен быть сохранен в `review-notes.md` проекта.

Для `camera preset` и `timing preset` допустим более легкий режим promotion:

- если логика уже существует и не требует отдельного library-модуля, ИИ может оформить promotion как registry/contract-level решение;
- если `camera preset` помечен как `reusePolicy: implementation-locked`, такое promotion означает не только naming-контракт, но и жесткий implementation baseline для следующих проектов;
- в таком случае все равно нужно обновить реестр, `review-notes` проекта и связанные docs.

## Шаблон записи

Каждая запись должна содержать:

- `moduleId`
- `userFacingName`, если модуль должен предлагаться пользователю как готовый вариант
- `status`
- `moduleType`
- `sourceProjects`
- `promotionReason`
- `contract`
- `placement`
- `docsUpdated`
- `notes`

Для записей типа `background / ambient / secondary-life system` дополнительно нужны:

- `worldSlot`: одно или несколько значений из `horizon | side-dressing | atmospheric-motion | directed-motion | ground | light-weather | payoff`; если значений несколько, разделяй их через `|`
- `environmentFamily`: одно или несколько значений из `nature | urban | arena | industrial | fantasy | neutral`; если значений несколько, разделяй их через `|`
- `role`: `core | support | accent`
- `combineWith`
- `stageFit`
- `costTier`: `low | medium | high`

Для записей типа `camera preset` дополнительно нужны:

- `presetScope`: `camera-only | scene-package`
- `reusePolicy`: `implementation-locked | contract-only`
- `sourceOfTruthFiles`: repo-relative файлы, которые считаются рабочей реализацией preset-пакета
- `lockedBehavior`: что именно reuse-ится без пересборки
- `allowedAdaptation`: что можно менять без выхода за пределы preset-характера
- `forbiddenChanges`: какие отклонения требуют отдельного approve или `greenfield-approved`

Для implementation-locked записей типа `reveal/effect module`, которые служат reveal-baseline для hero-модуля, дополнительно нужны:

- `heroFamilyFit`: `image-pillar | tower-monolith | universal`
- `reusePolicy`: `implementation-locked | contract-only`
- `sourceOfTruthFiles`: repo-relative файлы, которые считаются рабочей реализацией reveal-пакета
- `lockedBehavior`: что именно reuse-ится без пересборки
- `allowedAdaptation`: что можно менять без выхода за пределы reveal-характера
- `forbiddenChanges`: какие отклонения требуют отдельного approve или `greenfield-approved`

## Текущие записи

### 1. `projection-presentation-gate-v1`

- `moduleId`: `projection-presentation-gate-v1`
- `status`: `library-module`
- `moduleType`: `reveal/effect module`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: финальный проект подтвердил, что projection-aware reveal и latched activation убирают hardcoded ранние/поздние старты карточек и переживают высокие лидеры, обычные объекты и финальный flyover без index-specific костылей.
- `contract`: модуль принимает `ResolvedCameraPose`, world-metrics карточки, viewport size и preset safe-zone/focus/readability gate; на выходе даёт projection-aware `PresentationState`, поиск `activationFrame` и latched `presentation progress`.
- `placement`:
  - `src/lib/ranking-corridor/presentation/projection-gate.ts`
  - `src/lib/ranking-corridor/presentation/rail-focus-presentation-preset.ts`
  - `src/lib/ranking-corridor/presentation/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `projects/2026-03-20-most-visited-websites/asset-manifest.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: текущая reference-интеграция живет в `src/compositions/most-visited-websites/scene/camera-presentation.ts`, который теперь остался тонким адаптером под конкретную камеру проекта.

### 2. `rail-focus-vip-finale-v1`

- `moduleId`: `rail-focus-vip-finale-v1`
- `userFacingName`: `Прямой рельсовый фокус`
- `status`: `library-module`
- `moduleType`: `camera preset`
- `presetScope`: `scene-package`
- `reusePolicy`: `implementation-locked`
- `timingContract`: `adaptive`
- `supportedFps`: `60`
- `timingPolicyId`: `rail-focus-vip-finale-v1/adaptive-v1`
- `supportedCountRange`: `20-150`
- `targetDurationBandSeconds`: `130-480`
- `defaultFinaleTailPolicy`: `off`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: preset пережил финальный ролик, подтвердил читаемость лидерской зоны, мягкий cinematic-tail и исправление пропаданий/рывков без жёстких top-3 веток и без ручного rank-hardcode.
- `contract`: непрерывный rail-focus corridor camera с data-driven VIP-focus по height percentile, единым remapped frame для camera/focus/detail-window/preload и count-aware timing policy, которая подстраивает main pass под `itemCount`, а финальный cinematic tail держит как optional policy, а не как обязательный default.
- `sourceOfTruthFiles`:
  - `src/compositions/most-visited-websites/scene/scene-logic.ts`
  - `src/compositions/most-visited-websites/scene/camera-presentation.ts`
- `lockedBehavior`: camera path math, VIP-focus, scene progression geometry, intro-to-main handoff и cinematic framing reuse-ятся как единый motion-пакет.
- `allowedAdaptation`: data normalization, world-scale offsets, безопасная дистанция камеры, topic-specific framing и count-aware retiming через `timingPolicyId` без смены характера preset.
- `forbiddenChanges`: не переписывать camera path math с нуля, не смешивать preset с чужим motion family и не отключать VIP-focus без отдельного approve.
- `placement`:
  - registry-level contract
  - текущая reference-реализация: `src/compositions/most-visited-websites/scene/scene-logic.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: это не только visual preset, а жесткий implementation baseline. Код пока оставлен в проекте; extraction в отдельный library-module отложен до второго проекта, чтобы не зацементировать слишком ранний API поверх живой scene-math.

### 3. `soft-side-orbit-classic-v1`

- `moduleId`: `soft-side-orbit-classic-v1`
- `userFacingName`: `Классический башенный проход`
- `status`: `library-module`
- `moduleType`: `camera preset`
- `presetScope`: `scene-package`
- `reusePolicy`: `implementation-locked`
- `timingContract`: `adaptive`
- `supportedFps`: `60`
- `timingPolicyId`: `soft-side-orbit-classic-v1/adaptive-v1`
- `supportedCountRange`: `20-150`
- `targetDurationBandSeconds`: `140-550`
- `defaultFinaleTailPolicy`: `off`
- `sourceProjects`:
  - `ranking-towers`
- `promotionReason`: базовый reference-композишен формата уже многоразово служит эталоном для launch- и production-решений; его камера и тайминг имеют устойчивый контракт, покрыты scene-logic тестами и остаются главным baseline-вариантом бокового corridor-прохода.
- `contract`: мягкий corridor camera preset с боковым ракурсом около `3/4`, стартовым intro push-in без jump-cut handoff, orbit drift contract и count-aware timing policy, которая сохраняет башенный характер пролета, но пересчитывает hold cadence под `itemCount`; финальный slowdown допускается как legacy-policy, а не как обязательный default.
- `sourceOfTruthFiles`:
  - `src/compositions/ranking-towers/scene/scene-logic.ts`
  - `src/compositions/ranking-towers/scene/camera-updater.tsx`
- `lockedBehavior`: camera path math, intro push-in, orbit drift contract, tower-side `3/4` framing и базовая scene progression reuse-ятся как единый motion-пакет.
- `allowedAdaptation`: scale remap, рабочая дистанция камеры, безопасные offsets под другой hero/layout, data normalization и count-aware retiming через `timingPolicyId` без потери бокового `3/4` характера.
- `forbiddenChanges`: не заменять preset на новый custom rail-path, не пересобирать motion-характер с нуля и не смешивать его с другим motion family без отдельного approve.
- `placement`:
  - registry-level contract
  - текущая reference-реализация: `src/compositions/ranking-towers/scene/scene-logic.ts`
  - camera runtime adapter: `src/compositions/ranking-towers/scene/camera-updater.tsx`
- `docsUpdated`:
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: это осознанное legacy-reference исключение: `ranking-towers` предшествует project-container workflow, поэтому preset зафиксирован в реестре по текущей канонической reference-реализации и тестам, а не по `projects/<slug>/review-notes.md`. Для новых проектов он тоже считается жестким implementation baseline, а не только visual-настроением.

### 4. `dashboard-card-reveal-effects-v1`

- `moduleId`: `dashboard-card-reveal-effects-v1`
- `status`: `library-module`
- `moduleType`: `reveal/effect module`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: финальный проект подтвердил, что reveal-семейства карточек уже устойчивы как choreography-layer, а не как часть одной темы; после extraction проект сохранил локальные data/media slots, а библиотека получила reusable motion-family.
- `contract`: модуль предоставляет registry reveal-эффектов карточки и selection-by-index без rank-hardcode; проект передает render-slot API для screen/panel/rank/media/domain/value/badge и layout/theme metrics.
- `placement`:
  - `src/lib/ranking-corridor/presentation/card-reveal-effects.tsx`
  - `src/lib/ranking-corridor/presentation/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: сам visual content карточки не поднимается в библиотеку автоматически; библиотечным стал именно motion/choreography слой.

### 5. `three-instanced-batches-v1`

- `moduleId`: `three-instanced-batches-v1`
- `status`: `library-module`
- `moduleType`: `utility / helper`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: один и тот же helper уже обслуживает forest, fireworks, golden rain и storm rain; это чистый reusable-layer, который снижает повторное копирование instanced batch logic в следующих 3D-сценах.
- `contract`: модуль дает `composeInstanceMatrix`, `StaticInstances` и `DynamicInstances` для shared geometry/material инстансов в static и dynamic режимах.
- `placement`:
  - `src/lib/ranking-corridor/three/instances.tsx`
  - `src/lib/ranking-corridor/three/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: конкретные particle systems и environment-sets остаются `project-local`; в библиотеку поднят только instancing foundation.

### 6. `media-stele-shell-v1`

- `moduleId`: `media-stele-shell-v1`
- `status`: `library-module`
- `moduleType`: `hero/object family`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: сам корпус стелы уже доказал ценность как reusable арт-объект, а не как одноразовая разметка: он пережил full/standby/minimal/cinematic состояния и уже отделим от сайт-специфичной data panel.
- `contract`: модуль рендерит стелу-оболочку с premium body для `full`, более дешёвым shared body для дальних состояний, cyan top-cap и edge-strips как арт-слой без данных поверх.
- `placement`:
  - `src/lib/ranking-corridor/art/objects/media-stele-shell.tsx`
  - `src/lib/ranking-corridor/art/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: полный `website stele hero` не промоутится целиком; библиотечным стал именно shell-арт-объект.

### 7. `low-poly-cloud-v1`

- `moduleId`: `low-poly-cloud-v1`
- `userFacingName`: `Низкополигональные облака`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
- `worldSlot`: `atmospheric-motion`
- `environmentFamily`: `nature | neutral`
- `role`: `support`
- `combineWith`:
  - `horizon-mountain-ridge-v1`
  - `forest-backdrop-v1`
  - `storm-effects-v1`
  - `highway-ribbon-v1`
- `stageFit`: `scene-1 | scene-2 | scene-3 | scene-4`
- `costTier`: `low`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: low-poly cloud форма уже выступает как чистый атмосферный примитив, который пригодится в разных corridor-мирах без завязки на тему сайтов.
- `contract`: модуль рендерит reusable low-poly cloud cluster с контролем `opacity`, `color` и `flashIntensity`, пригодный и для спокойного фона, и для storm-lite вариаций.
- `placement`:
  - `src/lib/ranking-corridor/art/objects/low-poly-cloud.tsx`
  - `src/lib/ranking-corridor/art/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: storm choreography, looping cloud lanes и lightning остаются проектным world-слоем.

### 8. `wind-turbine-v1`

- `moduleId`: `wind-turbine-v1`
- `userFacingName`: `Ветряные турбины`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
- `worldSlot`: `side-dressing`
- `environmentFamily`: `industrial | nature`
- `role`: `support`
- `combineWith`:
  - `forest-backdrop-v1`
  - `horizon-mountain-ridge-v1`
  - `highway-ribbon-v1`
  - `low-poly-cloud-v1`
- `stageFit`: `scene-1 | scene-2 | scene-3 | scene-4`
- `costTier`: `low`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: ветряк — это уже самостоятельный reusable арт-объект, а не спецэффект одного проекта; он даёт читаемую дальнюю промышленную жизнь и не зависит от темы сайтов.
- `contract`: модуль рендерит low-poly wind turbine с контролем `position`, `height`, `rotSpeed`, `yRot` и `frame`, чтобы проект мог сам управлять world-placement и pacing.
- `placement`:
  - `src/lib/ranking-corridor/art/objects/wind-turbine.tsx`
  - `src/lib/ranking-corridor/art/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: сам сет из множества турбин и его распределение по глубине остаются project-local world-assembly.

### 9. `forest-backdrop-v1`

- `moduleId`: `forest-backdrop-v1`
- `userFacingName`: `Лесной задник`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
- `worldSlot`: `side-dressing`
- `environmentFamily`: `nature`
- `role`: `core`
- `combineWith`:
  - `horizon-mountain-ridge-v1`
  - `low-poly-cloud-v1`
  - `wind-turbine-v1`
  - `storm-effects-v1`
- `stageFit`: `scene-1 | scene-2 | scene-3 | scene-4`
- `costTier`: `medium`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: ранний плотный лес пережил финальный ролик, уже доказал визуальную устойчивость и не зависит от темы сайтов; это самостоятельный reusable world-backdrop для corridor-сцен.
- `contract`: модуль рендерит плотный low-poly forest backdrop с pine/bush mix, seeded spatial distribution по `maxX` и контролем `groundY`, оставаясь совместимым с instanced render-path.
- `placement`:
  - `src/lib/ranking-corridor/art/world/forest-backdrop.tsx`
  - `src/lib/ranking-corridor/art/world/index.ts`
  - `src/lib/ranking-corridor/art/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: конкретная режиссура смены актов и весь `Digital Garden` не поднимаются целиком; библиотечным стал именно reusable forest-layer.

### 10. `horizon-mountain-ridge-v1`

- `moduleId`: `horizon-mountain-ridge-v1`
- `userFacingName`: `Горный хребет на горизонте`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
- `worldSlot`: `horizon`
- `environmentFamily`: `nature | neutral`
- `role`: `core`
- `combineWith`:
  - `forest-backdrop-v1`
  - `low-poly-cloud-v1`
  - `storm-effects-v1`
  - `highway-ribbon-v1`
- `stageFit`: `scene-1 | scene-2 | scene-3 | scene-4`
- `costTier`: `low`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: дальний mountain ridge уже работает как независимый world-horizon слой и не требует сайта-специфичных данных или hero-логики.
- `contract`: модуль собирает seeded horizon ridge из low-poly mountain masses с контролем `groundY`; проект управляет только world-placement, а не внутренней генерацией массива.
- `placement`:
  - `src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx`
  - `src/lib/ranking-corridor/art/world/index.ts`
  - `src/lib/ranking-corridor/art/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: солнце, облака и fog pacing остаются частью project-local environment direction.

### 11. `highway-ribbon-v1`

- `moduleId`: `highway-ribbon-v1`
- `userFacingName`: `Шоссе с машинами`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
- `worldSlot`: `directed-motion`
- `environmentFamily`: `urban | industrial | neutral`
- `role`: `core`
- `combineWith`:
  - `horizon-mountain-ridge-v1`
  - `wind-turbine-v1`
  - `forest-backdrop-v1`
  - `low-poly-cloud-v1`
- `stageFit`: `scene-1 | scene-2 | scene-3 | scene-4`
- `costTier`: `medium`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: ribbon-шоссе с трафиком и signage уже стало устойчивым мотивом окружения и стоит повторного использования в будущих corridor-world сценах.
- `contract`: модуль рендерит извилистую `CatmullRom` ribbon-road с дорожной разметкой, знаками, traffic lanes и движущимися машинами, принимая `frame` и `groundY`.
- `placement`:
  - `src/lib/ranking-corridor/art/world/highway-ribbon.tsx`
  - `src/lib/ranking-corridor/art/world/index.ts`
  - `src/lib/ranking-corridor/art/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: конкретная связка шоссе с этим городом/садом остаётся локальной; библиотечным стал сам reusable road-world primitive.

### 12. `storm-effects-v1`

- `moduleId`: `storm-effects-v1`
- `userFacingName`: `Грозовые эффекты`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
- `worldSlot`: `atmospheric-motion | light-weather | payoff`
- `environmentFamily`: `neutral | industrial | fantasy`
- `role`: `accent`
- `combineWith`:
  - `low-poly-cloud-v1`
  - `horizon-mountain-ridge-v1`
  - `highway-ribbon-v1`
  - `forest-backdrop-v1`
- `stageFit`: `scene-2 | scene-3 | scene-4`
- `costTier`: `high`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: storm-pass пережил production, оптимизацию и финальный review; instanced rain и directed lightning bursts уже имеют понятный reusable контракт и доказали пользу в performance-sensitive world-сценах.
- `contract`: модуль экспортирует `getStormRainIntensity`, `StormRainLayer` и `StormLightningBursts`; проект задаёт `frame`, `progress`, `maxX`, `cloudSpeedMultiplier`, `groundY` и явные `anchors` для lightning bursts, чтобы storm-layer оставался deterministic, instanced-friendly и не зависел от скрытой seed-схемы конкретного cloud-движка.
- `placement`:
  - `src/lib/ranking-corridor/art/world/storm-effects.tsx`
  - `src/lib/ranking-corridor/art/world/index.ts`
  - `src/lib/ranking-corridor/art/index.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: full storm dramaturgy всё ещё не считается целиком библиотечным миром; cloud lanes, sun fade и finale payoff продолжают жить в project-local environment direction.

### 13. `image-pillar-dashboard-reveal-stack-v1`

- `moduleId`: `image-pillar-dashboard-reveal-stack-v1`
- `userFacingName`: `Появление стелы с dashboard-слоем`
- `status`: `library-module`
- `moduleType`: `reveal/effect module`
- `heroFamilyFit`: `image-pillar`
- `reusePolicy`: `implementation-locked`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: финальный website-проект подтвердил, что связка projection gate, reveal-эффектов карточки и layered dashboard удерживает quality bar hero-модуля без статичного входа и без ручных one-off анимаций под каждый rank.
- `contract`: reveal-пакет управляет activation / presentation gate, staged появлением dashboard-слоев, shell-to-data choreography, таймингом метрики и badge/rank-слоя, сохраняя читаемость hero при движении камеры и смене фаз `full -> standby -> minimal`.
- `sourceOfTruthFiles`:
  - `src/compositions/most-visited-websites/components/SteleDashboard.tsx`
  - `src/lib/ranking-corridor/presentation/projection-gate.ts`
  - `src/lib/ranking-corridor/presentation/card-reveal-effects.tsx`
- `lockedBehavior`: activation / presentation gate, reveal staging order, shell-to-data choreography, timing метрики, badge/rank/data-card effect family reuse-ятся как единый пакет.
- `allowedAdaptation`: тема, материалы, layout-safe offsets, content slots, topic-specific surface и data normalization без смены reveal-характера.
- `forbiddenChanges`: не выключать reveal совсем, не заменять staged dashboard на статичную карточку, не переписывать gate/choreography с нуля без отдельного approve.
- `placement`:
  - registry-level contract
  - текущая reference-реализация: `src/compositions/most-visited-websites/components/SteleDashboard.tsx`
  - shared reveal foundation: `src/lib/ranking-corridor/presentation/projection-gate.ts`
  - shared reveal effects: `src/lib/ranking-corridor/presentation/card-reveal-effects.tsx`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: это жесткий reveal-baseline для image-first стел и похожих pillar-hero; проект может менять тему и наполнение, но не должен скатываться в статичный shell без reveal-пакета.

### 14. `tower-hologram-dashboard-reveal-v1`

- `moduleId`: `tower-hologram-dashboard-reveal-v1`
- `userFacingName`: `Появление башни с голографическим dashboard`
- `status`: `library-module`
- `moduleType`: `reveal/effect module`
- `heroFamilyFit`: `tower-monolith`
- `reusePolicy`: `implementation-locked`
- `sourceProjects`:
  - `ranking-towers`
- `promotionReason`: tower-reference уже многократно служил эталоном формата и подтвердил, что layered hologram reveal делает башню живой и драматичной без перегруза и без потери читаемости данных.
- `contract`: reveal-пакет управляет staged включением голографического dashboard, shell-first входом башни, появлением данных и метрики поверх корпуса и синхронизацией с reveal-окном hero.
- `sourceOfTruthFiles`:
  - `src/compositions/ranking-towers/components/HologramDashboard.tsx`
  - `src/compositions/ranking-towers/components/Tower.tsx`
- `lockedBehavior`: shell-first reveal, hologram dashboard choreography, staged data appearance, timing метрики и общий reveal-характер башни reuse-ятся как единый пакет.
- `allowedAdaptation`: тема, материалы, palette/glow, layout-safe offsets, content slots и scale remap без пересборки базовой reveal-драматургии.
- `forbiddenChanges`: не убирать staged reveal, не заменять пакет статичным tower-state, не переписывать timing/choreography с нуля без отдельного approve.
- `placement`:
  - registry-level contract
  - текущая reference-реализация: `src/compositions/ranking-towers/components/HologramDashboard.tsx`
  - shell integration: `src/compositions/ranking-towers/components/Tower.tsx`
- `docsUpdated`:
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: это implementation-locked reveal-baseline для tower/monolith hero-family; для новых башенных проектов он должен считаться default reveal-пакетом, а не только красивым референсом.
