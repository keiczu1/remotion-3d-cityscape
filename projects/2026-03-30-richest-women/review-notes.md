# Review Notes

## Проект

- Slug проекта: `2026-03-30-richest-women`
- Человекочитаемое название: Самые богатые женщины
- Начато: 2026-03-30
- Обновлено: 2026-04-02

## Режиссерский план

- Цикл review: 1
- Проверяемый director-pass: `interactive hero-finalization pass`
- Решение: `approved`
- Что подтверждено: выбран один production-baseline hero/object family для длинных биографических описаний: portrait-first stele с правой biography-card, value-driven pedestal и флагом на мачте
- Что нужно изменить: -
- Можно ли переходить к build-plan: `yes`
- Подтверждающие комментарии: пользователь последовательно утвердил variant 1, затем довел layout, photo policy, flag grammar, pedestal и biography-card до финального состояния

## Предпросмотр

- Цикл review: 1
- Пакет предпросмотра: композиция `RichestWomenVariantComparison`, финальный single-hero preview на entry `#16 Marguerite Harbert`, контрольный still `projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png`
- `2026-04-01 refresh`: контрольный still подтверждает user-updated library baseline с более широкой правой biography-card, увеличенной типографикой контента, фронтальной shell-посадкой и sculpted stone pedestal
- Решение: `approve`
- Проверенный охват: hero-module, portrait-slot, typography, right biography-card, flag/pole grammar, value-driven pedestal
- Что подтверждено: фото не кропается по высоте, имя переносится в 2 строки, biography-card адаптируется по контенту, флаг сидит в grammar `most-visited-websites`, визуальный шум убран
- Обещанные world-slot из `director-pass`: `n/a`
- Реально реализованные world-slot: `n/a`
- Проверенное покрытие сцен: `scene-1`
- Результат director-pass-проверки: `warning`
- Director-pass-заметки: container используется как preview-only hero stage и не претендует на полный 4-scene corridor-pass
- Перетягивает ли вторичная жизнь внимание с героя: `no`
- Результат layout-проверки: `ok`
- Layout-заметки: стела, biography-card, мачта и pedestal читаются как один production-like объект без overlap на текстовые зоны
- Результат image-first policy-проверки: `ok`
- Image-first policy-заметки: media доминирует, rank живет поверх media, data-zone защищена, длинный text вынесен из shell в правую карточку
- Результат browser/Studio-проверки: `ok`
- Метод browser/Studio-проверки: `built-in-browser`
- Результат console/runtime-проверки: `ok`
- Папка screenshot-артефактов: `projects/2026-03-30-richest-women/review-artifacts/`
- Visual checklist:
  - Hero / readability: имя, годы и wealth читаются без ужатия
  - Image-first / media policy: portrait-slot сохраняет высоту фото без кропа
  - Camera / pacing: reveal мягкий и staged, без визуального шума
  - Environment / secondary-life: intentionally omitted в этом preview-only pass
  - Director-pass match: финальный hero соответствует утвержденному пользователем варианту 1
- Какие изменения обязательны: выполнены в этом же pass
- Можно ли идти дальше без повторного предпросмотра: yes
- Нужно ли обязательно повторить предпросмотр: no
- Верификация или подтверждающие материалы: `npm test`, `npm run lint`, `npm run build`, `npx remotion still build RichestWomenVariantComparison projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png --frame=180`

## Финальное утверждение

- Цикл финального review: 1
- Статус: `final-approved-with-notes`
- Проверенный build: `npm test`, `npm run lint`, `npm run build`
- Проверенный снимок данных: `public/final_ranking.json`, `projects/2026-03-30-richest-women/asset-manifest.md`
- Заметки: финально утвержден hero/object family и его Studio-ready preview; полный corridor package, director-pass и scene-build полного ролика остаются отдельным будущим этапом
- Обязательные последующие действия: library-audit выполнен в этом же pass
- Блокирующие причины: -

## Аудит библиотеки

- Дата аудита: 2026-03-31
- Результат аудита: `auto-promotion-applied`
- Покрытие существующей библиотекой: reusable reveal, scene-preset, art-object и world-layer слои уже существовали; новым зрелым кандидатом стал именно biography-oriented hero/object family
- Проверенные категории: `camera preset`, `timing preset`, `reveal/effect module`, `hero/object family`, `background / ambient / secondary-life system`, `utility / helper`
- Категории без зрелых кандидатов: `camera preset`, `timing preset`, `reveal/effect module`, `background / ambient / secondary-life system`, `utility / helper`
- Обновления реестра: `portrait-biography-stele-v1`

| candidateId | candidateType | currentStatus | sourceLocation | reusableWhy | proposedDecision | targetPlacement | finalEvidence | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| portrait-biography-stele-v1 | hero/object family | project-local | `src/compositions/2026-03-30-richest-women-variants/RichestWomenVariantsComposition.tsx` | модуль отделим от темы "богатые женщины": он решает общую corridor-задачу image-first portrait stele с длинной biography-card, pedestal и flag assembly | promote-to-library | `src/lib/ranking-corridor/hero/portrait-biography-stele.tsx`, `src/lib/ranking-corridor/hero/index.ts` | accepted user review, final still, library-backed preview, `npm test`, `npm run lint`, `npm run build` | `projects/2026-03-30-richest-women/launch-card.md`, `projects/2026-03-30-richest-women/asset-manifest.md`, `projects/2026-03-30-richest-women/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | в библиотеку поднят именно hero/object family; dataset binding, country-to-flag mapping и composition-level wealth normalization остаются project-local |

## Общие заметки

- Preview composition переведена на library-backed hero вместо локальной копии
- Пользовательские dataset-файлы и портреты добавлены в коммит как source-of-truth для этого preview-container
- `2026-04-02 perf audit`: для `RichestWomenCorridor` введен scene-level mount policy, optimized portrait runtime pack и safe-pass по background systems без изменения approved visual contract активной `био-стелы`
- `2026-04-02 tail perf root cause`: на frame `75200` active `FocusedBiographyOverlay` оставался в current-focus ветке даже при `overlayProgress = 0` и полном уходе из viewport; в результате late tail продолжал рендерить invisible DOM hero-card с расчетной высотой `5151.98px`
- `2026-04-02 tail perf fix`: current-focus overlay теперь не рендерится, когда projection gate закрыт и объект уже вне viewport; slow-tail background motion дополнительно привязан к remapped camera timeline и облегчен через `tail-safe` birch pass
- `2026-04-02 tail perf verification`: `npx remotion benchmark src/index.ts RichestWomenCorridor --frames=75200-75260 --runs=1 --concurrency=1 --muted` улучшился с `30.41865s` до `26.23978s`; контрольный диапазон `38000-38060` остался близким (`20.48464s` -> `19.86559s`); визуальный контрольный still сохранен как `projects/2026-03-30-richest-women/review-artifacts/perf-tail-fixed-75200.png`
- `2026-04-02 cinematic perf root cause`: после снятия invisible overlay sustained hotspot переехал в cinematic-overview around `38000`, где одновременно жили `24` смонтированные стелы и десятки одинаковых shell/top-cap/accent-strip draw calls при одном и том же визуальном grammar `standby/cinematic`
- `2026-04-02 cinematic perf fix`: в cinematic-режиме повторяющиеся корпуса стел, top-cap, accent-strip и flag-mast assembly переведены на instanced batch; индивидуальными оставлены только текстурные waving-flag meshes, чтобы сохранить approved look без упрощения кадра
- `2026-04-02 cinematic perf verification`: `38000-38060` улучшился с `16.39084s` до `13.42022s`, `65000-65060` с `12.83181s` до `11.10675s`, `75200-75260` с `13.68894s` до `12.37164s`; визуальный контрольный still cinematic-участка сохранен как `projects/2026-03-30-richest-women/review-artifacts/perf-cinematic-batch-38000.png`
- `2026-04-02 cross-project perf root cause`: сравнение с `most-visited-websites` и `2026-03-25-strongest-pokemon` показало, что число объектов само по себе не виновато: оба baseline-проекта держат `93-100` стел прямо внутри одного `ThreeCanvas`, тогда как `RichestWomenCorridor` дополнительно держит тяжелый DOM-based `FocusedBiographyOverlay` с крупной biography-card поверх WebGL-сцены
- `2026-04-02 overlay settle fix`: когда текущая biography-card уже полностью раскрыта, ее внутренний hero-frame теперь замораживается на settle-state вместо бессмысленной per-frame перерисовки shimmer/glow; позиция и opacity overlay при этом продолжают жить по projection logic без визуального слома
- `2026-04-02 sidebar opacity root cause`: у правой biography-card темный фон выглядел полупрозрачным не из-за background-градиента, а из-за двойного fade: current-focus overlay гасил весь hero контейнер снаружи, а сама side-card внутри дополнительно жила на `motion.copyOpacity`
- `2026-04-02 sidebar opacity fix`: после появления side-card current-focus overlay больше не применяет parent `opacity` ко всему hero целиком; внешний fade перенесен только на левую stele-shell через `shellOpacityMultiplier`, поэтому правая карточка сохраняет плотный dark-panel в reveal/handoff-фазе
- `2026-04-02 sidebar opacity verification`: `npm run lint`, `npm run build`, still-контроль на кадрах `12445`, `12455`, `12470`; контрольный артефакт ранней reveal-фазы сохранен как `projects/2026-03-30-richest-women/review-artifacts/sidebar-opacity-fix-12455.png`
- `2026-04-02 side-card transition root cause`: даже после развязки внешнего overlay fade сама `InfoSideCard` продолжала анимировать весь panel через `opacity + translate`, поэтому в Studio на входе карточка выглядела серее нормы и слегка "плавала" относительно финальной позиции
- `2026-04-02 side-card transition fix`: внешний panel правой biography-card теперь остается на месте и всегда держит плотный dark background; внутрь карточки перенесены только fade/slide текста, поэтому во время перехода исчезли и ложная прозрачность panel, и микросдвиг всей карточки
- `2026-04-02 side-card transition verification`: still-контроль на кадрах `20350`, `20358`, `20366` для `Barbara Cox Anthony` показывает стабильный темный фон panel с плавным проявлением только содержимого; подтверждающие артефакты: `projects/2026-03-30-richest-women/review-artifacts/transition-fix-20350.png`, `projects/2026-03-30-richest-women/review-artifacts/transition-fix-20358.png`, `projects/2026-03-30-richest-women/review-artifacts/transition-fix-20366.png`; свежие проверки: `npm run lint`, `npm run build`
- `2026-04-02 main-pass timing root cause`: на отметке `4:17` (`frame 15420`) проект входил в legacy `finalCameraSlowdown`, потому что shared plan стартовал замедление уже с `frame 15403`; из-за этого camera/focus шли по slowed `cameraFrame`, а reveal biography-card продолжал жить по обычному `frame`, поэтому новые карточки после порога приезжали почти без entrance-анимации
- `2026-04-02 main-pass timing fix`: для этого проекта slowdown перенесен только на cinematic tail после `sequenceCompleteFrame`, а весь ranking main-pass снова идет в 1x-тайминге; это вернуло прежнюю скорость камеры и синхрон входа biography-card без отката overlay/perf-фиксов
- `2026-04-02 main-pass timing verification`: `cameraFrame` на кадрах `15420`, `15440`, `15500` снова совпадает с `frame`; still `projects/2026-03-30-richest-women/review-artifacts/timing-fix-15658.png` показывает раннюю фазу входа следующей карточки, а `projects/2026-03-30-richest-women/review-artifacts/timing-fix-15685.png` подтверждает ее штатное раскрытие; свежие проверки: `npm run lint`, `npm run build`
