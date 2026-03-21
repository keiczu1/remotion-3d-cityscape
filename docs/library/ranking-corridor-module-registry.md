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
- в таком случае все равно нужно обновить реестр, `review-notes` проекта и связанные docs.

## Шаблон записи

Каждая запись должна содержать:

- `moduleId`
- `status`
- `moduleType`
- `sourceProjects`
- `promotionReason`
- `contract`
- `placement`
- `docsUpdated`
- `notes`

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
- `status`: `library-module`
- `moduleType`: `camera preset`
- `sourceProjects`:
  - `2026-03-20-most-visited-websites`
- `promotionReason`: preset пережил финальный ролик, подтвердил читаемость лидерской зоны, мягкий cinematic-tail и исправление пропаданий/рывков без жёстких top-3 веток и без ручного rank-hardcode.
- `contract`: непрерывный rail-focus corridor camera с data-driven VIP-focus по height percentile, замедленным финальным tail, единым remapped frame для camera/focus/detail-window/preload и screen-space fallback в wide flyover до перехода в `minimal`.
- `placement`:
  - registry-level contract
  - текущая reference-реализация: `src/compositions/most-visited-websites/scene/scene-logic.ts`
- `docsUpdated`:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- `notes`: код пока оставлен в проекте; extraction в отдельный library-module отложен до второго проекта, чтобы не зацементировать слишком ранний API поверх живой scene-math.

### 3. `dashboard-card-reveal-effects-v1`

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

### 4. `three-instanced-batches-v1`

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

### 5. `media-stele-shell-v1`

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

### 6. `low-poly-cloud-v1`

- `moduleId`: `low-poly-cloud-v1`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
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

### 7. `wind-turbine-v1`

- `moduleId`: `wind-turbine-v1`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
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

### 8. `forest-backdrop-v1`

- `moduleId`: `forest-backdrop-v1`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
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

### 9. `horizon-mountain-ridge-v1`

- `moduleId`: `horizon-mountain-ridge-v1`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
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

### 10. `highway-ribbon-v1`

- `moduleId`: `highway-ribbon-v1`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
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

### 11. `storm-effects-v1`

- `moduleId`: `storm-effects-v1`
- `status`: `library-module`
- `moduleType`: `background / ambient / secondary-life system`
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
