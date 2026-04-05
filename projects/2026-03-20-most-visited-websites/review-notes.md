# Review Notes

## Проект

- Slug проекта: `2026-03-20-most-visited-websites`
- Человеческое название: Самые посещаемые сайты в мире
- Начато: 2026-03-20
- Обновлено: 2026-03-21

## Предпросмотр

- Цикл review: 2
- Пакет предпросмотра:
  - Сцена запущена в Remotion Studio, композиция `MostVisitedWebsites`
  - Видны стелы #40 (dzen.ru), #39 (ebay.com) на frame ~735
  - Реальный hero-модуль: медиа-стела с встроенным экраном (логотип), светлой data-панелью и флагом на древке
  - Реальные данные: domain, visits, type, country
  - Реальные ассеты: favicons, flags — переиспользованы из ranking-towers
  - Светлое окружение «Цифровой сад»: grid-пол, облака, абстрактные вертикали на горизонте
  - Scramble-эффекты: работают для 5 семейств появления
  - FPS: 59.3 — стабильно
  - После optimization-pass: standby/minimal стелы переведены на более дешёвый render-path, добавлены тесты scene-logic, исправлен hook-order в финальных background-эффектах
  - После presentation-pass: reveal карточек переведён на preset-driven projection gate без index-specific/hardcoded стартов; высокая карточка раскрывается только после входа верхней кромки в camera safe-zone
  - После persistence-fix: projection gate теперь определяет только activation-frame первого показа, а уже раскрытая карточка остаётся видимой и не исчезает при следующем смещении камеры
  - После early-activation-fix: activation-frame ищется по всей timeline, поэтому обычные соседние карточки снова появляются заранее, как в corridor-ритме, а высокие лидеры всё ещё блокируются до safe-zone
  - После vip-focus-pass: самые высокие объекты автоматически получают отдельный camera mode по percentile-height: короткий settle, центрированный orbit-hold и резкий vertical launch к следующему лидеру
  - Финальный re-preview пользователем прошёл через серии правок по лидерам, финальному flyover и storm-зоне; layout и pacing подтверждены как годные для полного ролика
- Решение: `approve with changes`
- Проверенный охват: hero-модуль, фон, данные, ассеты, scramble, fps
- Что подтверждено: визуальный язык, производительность, структура данных, корректность ассетов
- Результат pre-build review-проверки: `ok`
- Pre-build review-заметки: эскалация по сценам держится через усиление фона, data streams в средней части и церемониальный payoff у лидеров; вторичная жизнь не требует смены hero-концепта, но должна быть повторно просмотрена после optimization-pass
- Перетягивает ли вторичная жизнь внимание с героя: `no`
- Результат layout-проверки: `ok`
- Layout-заметки: data-панель и sizing доменов выдержали re-preview на дальних состояниях, лидерских карточках, финальном cinematic tail и storm-сегменте
- Какие изменения обязательны: выполнены в production-pass: projection-aware reveal без хардкода, latched presence для карточек, VIP-focus на лидерах, плавный финальный tail, screen-space fallback в wide flyover, instanced storm/finale particles
- Можно ли идти дальше без повторного предпросмотра: да
- Нужно ли обязательно повторить предпросмотр: нет
- Верификация или подтверждающие материалы: `npm test`, `npm run lint`, `npm run build`, локальная серия Studio-preview/re-preview и финальное подтверждение пользователя без отдельного preview-export в project-container

## Финальное утверждение

- Цикл финального review: 1
- Статус: `final-approved`
- Проверенный build: `npm test`, `npm run lint`, `npm run build`
- Проверенный снимок данных: `src/compositions/most-visited-websites/model/data.ts`, `projects/2026-03-20-most-visited-websites/asset-manifest.md` со статусом `final-ready`
- Заметки: финальное утверждение получено после полного production-pass и серии пользовательских re-preview на leader-zone, final flyover и storm/FPS-hotspots; финальный media export не выполнялся, потому что он не запрашивался
- Обязательные последующие действия: нет — аудит библиотеки выполнен в этом же pass
- Блокирующие причины: нет

## Ручной Review Reusable-Кандидатов

- Дата аудита: 2026-03-21
- Результат аудита: `auto-promotion-applied`
- Покрытие существующей библиотекой: до этого pass реестр `ranking-corridor` был пуст; reusable-слой поднят только для действительно подтверждённых контрактов из финального проекта
- Обновления реестра: добавлены `projection-presentation-gate-v1`, `rail-focus-vip-finale-v1`, `dashboard-card-reveal-effects-v1`, `three-instanced-batches-v1`, `media-stele-shell-v1`, `low-poly-cloud-v1`, `wind-turbine-v1`, `forest-backdrop-v1`, `horizon-mountain-ridge-v1`, `highway-ribbon-v1`, `storm-effects-v1`

| candidateId | currentStatus | proposedDecision | targetPlacement | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- |
| projection-presentation-gate-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/presentation/projection-gate.ts`, `src/lib/ranking-corridor/presentation/rail-focus-presentation-preset.ts` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `projects/2026-03-20-most-visited-websites/asset-manifest.md`, `docs/library/ranking-corridor-module-registry.md` | Projection-aware reveal/presence gate с latched activation, без rank/index hardcode; текущий проект уже переведён на library-адаптер |
| rail-focus-vip-finale-v1 | project-local | promote-to-library | registry-only contract, reference-реализация пока остаётся в `src/compositions/most-visited-websites/scene/scene-logic.ts` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Data-driven rail-focus camera/timing preset: VIP-focus по height percentile, slowed finale, sync remap для camera/focus/detail-window и screen-space fallback в flyover |
| dashboard-card-reveal-effects-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/presentation/card-reveal-effects.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Семейство reveal-анимаций карточек вынесено в reusable render-slot API; проект сохраняет свои Website-специфичные слоты, а choreography-layer теперь библиотечный |
| three-instanced-batches-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/three/instances.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Общий helper для `StaticInstances`, `DynamicInstances` и matrix-compose теперь покрывает forest, fireworks, golden rain и storm rain без локального дублирования |
| media-stele-shell-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/art/objects/media-stele-shell.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | В библиотеку поднят именно арт-объект оболочки стелы: корпус, top-cap и edge-strips; data dashboard и flag-assembly всё ещё собираются проектом |
| media-stele-hero-v1 | project-local | stay-project-local | `src/compositions/most-visited-websites/components/Stele.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md` | Полный герой с dashboard и flag всё ещё привязан к grammar сайтов, хотя shell-арт-объект уже промоутнут |
| low-poly-cloud-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/art/objects/low-poly-cloud.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Базовая low-poly cloud form уже reusable как миростроительный арт-примитив; storm-логика остаётся локальной |
| wind-turbine-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/art/objects/wind-turbine.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Арт-объект ветряка вынесен отдельно от проектной расстановки и world pacing |
| forest-backdrop-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/art/world/forest-backdrop.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Плотный ранний лес уже отделён от темы сайтов и пригоден как reusable world-backdrop; проект теперь использует библиотечную forest-сборку напрямую |
| horizon-mountain-ridge-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Дальний low-poly mountain ridge пережил финальный ролик и больше не зависит от конкретных карточек/данных; это reusable горизонтальный world-layer |
| highway-ribbon-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/art/world/highway-ribbon.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Извилистая ribbon-дорога с разметкой, знаками и трафиком уже даёт самостоятельный corridor-world мотив и не требует темы сайтов |
| storm-effects-v1 | project-local | promote-to-library | `src/lib/ranking-corridor/art/world/storm-effects.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | Штормовой layer поднят как reusable world-effect: instanced rain и directed lightning bursts вынесены из проекта без потери storm pacing |
| digital-garden-secondary-life-v1 | project-local | stay-project-local | `src/compositions/most-visited-websites/components/BackgroundEnvironment.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md` | Полная secondary-life драматургия среды всё ещё собирается проектом: clouds, sun, particles, finale payoff и pacing остаются theme-specific, хотя часть world-слоёв уже поднята в библиотеку |
| dynamic-particle-instancing-v1 | project-local | keep-design-only | `src/compositions/most-visited-websites/components/BackgroundEnvironment.tsx` | `projects/2026-03-20-most-visited-websites/review-notes.md` | Конкретные particle setups и цветовые payoff-группы остаются частью темы проекта; в библиотеку поднят только базовый instancing-layer |

## Общие заметки

- Проект использует данные и ассеты из reference-проекта `ranking-towers`
- Визуальный язык: медиа-стелы со светлым окружением «Цифровой сад»
- Проверка preview пока подтверждена через Remotion Studio, без сохранённого preview-export в `projects/.../exports/`
- Optimization-pass сохранил hero-модуль в полном качестве и разгрузил дальние состояния сцены через более дешёвые standby/minimal тела стел
- Presentation-pass вынес reveal карточек в projection-aware preset (`camera-presentation.ts` + shared dashboard metrics), чтобы тот же camera/timing contract можно было переносить в следующие ranking-corridor проекты без локального хардкода
- VIP-focus-pass оставил top-tier поведение data-driven: без hardcoded top-3 веток, через scene-math по height percentile и reusable focus-lock preset
- Forest-instancing-pass перевёл плотный ранний лес из сотен отдельных tree-групп на shared instanced meshes, чтобы разгрузить декоративный background-слой без потери текущего визуального языка «Цифрового сада»
- Cinematic-detail-window-pass сузил финальный tail до focus-aware окна вокруг текущего `lookX` камеры: в cinematic-режиме полные статичные карточки живут только рядом с активной точкой пролёта, а дальние стелы уходят в `minimal`, что снижает пик draw calls в самом дорогом участке ролика
- Finale-particle-instancing-pass перевёл финальные `Fireworks` и `GoldenRain` с сотен отдельных particle-mesh на цветовые instanced batches и убрал дорогой per-frame `random(...frame)` в хвосте салюта, чтобы разгрузить последний payoff-участок без смены его визуального жеста
- Cinematic-overview-detail-fix добавил в финальный tail динамическое `standby`-кольцо от высоты/глубины cinematic-камеры: широкий обзор снова показывает заметное число объектов, но узкое `cinematic`-ядро и performance-ограничение остаются на месте
- Cinematic-slowdown-sync-fix перевёл `focusedIndex` и detail-window финального tail на `getCameraTimelineFrame(frame)`, чтобы после slowdown камера и карточки оставались в одном и том же участке пролёта и не исчезали из-за рассинхрона таймлайна
- Cinematic-visibility-tail-fix перевёл финальный flyover с чистого index-window на screen-space visibility fallback: если карточка реально попадает в кадр, стела больше не уходит в `minimal`, даже когда `focusedIndex` смещается дальше по пролёту
- Storm-rain-instancing-pass перевёл `StormRain` с 600 отдельных прозрачных mesh-капель на один instanced render-path, чтобы снять основной постоянный FPS-hotspot, который начинается вместе со штормом около `2:41.5`; lightning/cloud flashes пока оставлены без изменения как вторичный spike-слой
- Manual reusable review-pass поднял в reusable-слой generic projection/presentation gate и зафиксировал rail-focus VIP finale как registry-level preset; тема-специфичные hero/background решения сознательно оставлены `project-local`
- Library-promotion-pass поднял ещё два code-level модуля: library-level family reveal-анимаций карточек через render-slot API и общий three-instancing helper; сам hero-объект и конкретные particle/world setups всё ещё остаются проектными
- Art-object-promotion-pass поднял в библиотеку три 3D-примитива, на которые уже были потрачены production-усилия: `MediaSteleShell`, `LowPolyCloud` и `WindTurbine`; проект теперь собирает стелы, облака и ветряки через reusable art-layer
- World-module-promotion-pass поднял в библиотеку reusable world-слои `ForestBackdrop`, `HorizonMountainRidge`, `HighwayRibbon` и `storm-effects`; сам `BackgroundEnvironment` остался project-local режиссурой, но больше не хранит локальные дубли леса, гор, шоссе и storm-эффектов
- Library-review-fix-pass дочистил два пост-promotion хвоста: `StormLightningBursts` больше не зависит от скрытой seed-схемы project-local clouds и принимает явные lightning anchors, а `digital-rain` в библиотечном reveal-family снова скремблит не только domain, но и rank/visits, как в финальном проекте
