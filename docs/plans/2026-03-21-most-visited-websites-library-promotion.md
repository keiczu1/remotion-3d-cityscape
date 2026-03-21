# План: post-final promotion для `most-visited-websites`

## Цель

После `final-approved` поднять в reusable-слой только те части проекта, которые уже пережили финальный ролик и имеют ясный контракт:

- семейство анимаций появления карточек;
- общий helper для static/dynamic instanced batches в Three.js;
- reusable art objects: `MediaSteleShell`, `LowPolyCloud`, `WindTurbine`;
- reusable world modules: `ForestBackdrop`, `HorizonMountainRidge`, `HighwayRibbon`, `StormRainLayer`, `StormLightningBursts`;
- синхронизацию project audit и library registry.

## Границы

- Не переносить в библиотеку сам hero-объект стелы.
- Не переносить целиком окружение `Digital Garden`.
- Не менять визуальный язык проекта намеренно; допустим только безопасный extraction/reuse-pass.
- Обязательно обновить `review-notes.md` и `docs/library/ranking-corridor-module-registry.md` вместе с promotion.

## Этап 1. Card reveal family

- Файлы:
  - `src/lib/ranking-corridor/presentation/card-reveal-effects.tsx`
  - `src/lib/ranking-corridor/presentation/index.ts`
  - `src/compositions/most-visited-websites/components/SteleDashboard.tsx`
- Что меняется:
  - существующие reveal-эффекты карточек получают library-level API;
  - проект начинает использовать библиотечный registry эффектов через thin project adapter.
- Критерий готовности:
  - визуальное поведение не деградирует;
  - проект не хранит эффектный registry только локально.

## Этап 2. Three instancing helpers

- Файлы:
  - `src/lib/ranking-corridor/three/instances.tsx`
  - `src/lib/ranking-corridor/three/index.ts`
  - `src/compositions/most-visited-websites/components/BackgroundEnvironment.tsx`
- Что меняется:
  - `StaticInstances`, `DynamicInstances` и matrix helper уходят в reusable-layer;
  - `BackgroundEnvironment` использует библиотечный helper вместо локальной копии.
- Критерий готовности:
  - forest / storm / finale-instancing продолжают работать без регрессии;
  - локальный background не дублирует общую instancing-механику.

## Этап 3. Audit и registry

- Файлы:
  - `projects/2026-03-20-most-visited-websites/review-notes.md`
  - `docs/library/ranking-corridor-module-registry.md`
- Что меняется:
  - аудит библиотеки отражает новые promotion-решения;
  - фиксируется, что hero/object family и окружение пока остаются `project-local`.
- Критерий готовности:
  - docs совпадают с реальным кодовым состоянием библиотеки;
- нет молчаливых promotion без записи в registry.

## Этап 4. Art objects

- Файлы:
  - `src/lib/ranking-corridor/art/objects/media-stele-shell.tsx`
  - `src/lib/ranking-corridor/art/objects/low-poly-cloud.tsx`
  - `src/lib/ranking-corridor/art/objects/wind-turbine.tsx`
  - `src/compositions/most-visited-websites/components/Stele.tsx`
  - `src/compositions/most-visited-websites/components/BackgroundEnvironment.tsx`
- Что меняется:
  - в библиотеку поднимаются reusable 3D-объекты, а проект начинает использовать их как строительные блоки;
  - тематические world-assemblies остаются локальными.
- Критерий готовности:
  - визуальный результат проекта сохраняется;
  - в library-layer появляются реальные art primitives, которые можно повторно использовать в следующих роликах.

## Этап 5. World modules

- Файлы:
  - `src/lib/ranking-corridor/art/world/forest-backdrop.tsx`
  - `src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx`
  - `src/lib/ranking-corridor/art/world/highway-ribbon.tsx`
  - `src/lib/ranking-corridor/art/world/storm-effects.tsx`
  - `src/compositions/most-visited-websites/components/BackgroundEnvironment.tsx`
- Что меняется:
  - лес, горный горизонт, шоссе и storm-слой поднимаются в reusable world-layer;
  - проект больше не хранит локальные дубли этих world-блоков и использует библиотечные модули напрямую.
- Критерий готовности:
  - визуальная драматургия окружения не меняется;
  - full `Digital Garden` всё ещё не цементируется целиком как один library-world;
  - review-notes и module-registry фиксируют promotion отдельных world-модулей, а не всего окружения сразу.

## Проверки

- `npm test`
- `npm run lint`
- `npm run build`
