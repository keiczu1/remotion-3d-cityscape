# Build Plan

## Проект
- Slug проекта: 2026-03-25-strongest-pokemon
- Человеческое название: Самые сильные покемоны всех времен
- Тема: Топ-100 покемонов
- Создано: 2026-03-25
- Обновлено: 2026-03-26
- Текущая фаза: `post-preview-build`
- Статус плана: `full-complete`
- Следующий шаг: completed
- Что заблокировано до `preview-gate`: ничего; `preview-gate`, final approval и historical reusable review уже закрыты

## Короткий контекст
- На что опирается план: `launch-card.md`, `review-notes.md`
- Что уже зафиксировано в `launch-card.md`: `image-first` hero policy, `rail-focus-vip-finale-v1`, reveal-stack и mountain-storm направление.
- Что уже зафиксировано на launch-этапе: 4 сцены, эскалация от леса к грозовой вершине, directed-motion через дальние train-lines и evolving corridor-relief ground.
- Что нельзя менять без отдельного пересогласования: Базовый пресет камеры (`rail-focus-vip-finale-v1`) и reveal baseline (`image-pillar-dashboard-reveal-stack-v1`).

## Preview-build

### BP-01. Data snapshot и типы
- Статус: `done`
- Preview role: `support`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/data/dataset.ts`
  - `src/compositions/2026-03-25-strongest-pokemon/data/types.ts`
- Цель: Подключить локальный JSON и типизировать данные (имя, ранг, Power, image).
- Готово когда: Экспортируется строго типизированный массив из 100 элементов.
- Проверка: `npx tsc --noEmit`, `npm run validate:data -- 2026-03-25-strongest-pokemon`
- Блокеры или заметки: Данные лежат локально в `public`; проект честно оформлен как `creative-ranking`.

### BP-02. Camera preview / scene logic
- Статус: `done`
- Preview role: `camera-preview`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/scene/scene-logic.ts`
- Цель: Подключить `rail-focus-vip-finale-v1` и собрать count-aware camera/runtime math для 100 объектов.
- Готово когда: Сцена имеет milestone-логику для 100 объектов, камера идет по рельсам без дерганья и сохраняет finale slowdown contract.
- Проверка: Проверка движения камеры и handoff в Studio, плюс машинный build-pass.
- Reference baseline: `src/lib/ranking-corridor/scene-presets/rail-focus-vip-finale-v1/package.ts`, `src/compositions/most-visited-websites/scene/scene-logic.ts`, `src/compositions/most-visited-websites/scene/camera-presentation.ts`
- Reuse mode: `preset-reuse`
- Reuse without changes: camera path math, VIP-focus, scene progression geometry, intro/main handoff и orbit/VIP/tower behavior reuse-ятся как единый motion-пакет без пересборки базовой логики.
- Allowed adaptation: data normalization, safe offsets, дистанция камеры, topic-specific framing и count-aware retiming без смены preset contract.
- Object count: `100`
- Timing policy: `rail-focus-vip-finale-v1/adaptive-v1`
- Target duration band: `130-480`
- Finale tail policy: `off`
- Greenfield justification:
- Non-negotiables: Камера не должна дергаться; финал должен замедляться и оставаться читаемым на длинных именах.
- Studio/browser check: `ok`
- Visual check method: `remotion-studio`
- Console/runtime check: `ok`
- Screenshot set: `review-artifacts/final`
- Mini-review:
  - Что было baseline: `rail-focus-vip-finale-v1` из website-project как implementation-locked camera package.
  - Что reuse-нуто без изменений: motion math, adaptive scene progression, intro/main handoff и VIP focus behavior.
  - Что адаптировано под тему: framing под высоту алтарей, data normalization для Pokémon dataset и безопасные дистанции камеры.
  - Что еще пока слабое: single-project tuning под очень высокие финальные алтари еще не обкатан на второй теме.
  - Почему это уже не scaffold: пакет пережил полный ролик на 100 объектах и дошел до final-approved проекта.

### BP-03. Hero preview
- Статус: `done`
- Preview role: `hero-preview`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/scene/HeroPedestal.tsx`
- Цель: Собрать image-first hero-module с адаптивным media-frame, крупным именем, рангом и вторичным data-panel.
- Готово когда: Один покемон корректно рендерится с reveal-анимацией, image-dominant hierarchy держится, data-zone защищена, ранг остается над media.
- Проверка: Preview в Studio и машинный build-pass на полной композиции.
- Reference baseline: `src/lib/ranking-corridor/art/objects/stone-altar-pedestal.tsx`, `src/compositions/most-visited-websites/components/SteleDashboard.tsx`, `src/lib/ranking-corridor/presentation/projection-gate.ts`, `src/lib/ranking-corridor/presentation/card-reveal-effects.tsx`
- Reuse mode: `preset-reuse`
- Reuse without changes: activation / presentation gate, reveal staging order, shell-to-data choreography, timing метрики и effect family reuse-ятся как единый пакет; image-dominant hierarchy, protected data-zone и safe-gap между media и нижним data-block сохранены.
- Allowed adaptation: тема, материалы, aspect-aware media frame, typography, layout-safe offsets, content slots и topic-specific surface.
- Hero priority: `image-first`
- Media layout policy: `adaptive-safe`
- Lane collision policy: `hard-fit`
- Protected data zone: `true`
- Rank placement: `above-media`
- Greenfield justification:
- Non-negotiables: Имя и silhouette героя доминируют; media не залезает в data-zone; rank всегда читается отдельно над media.
- Studio/browser check: `ok`
- Visual check method: `remotion-studio`
- Console/runtime check: `ok`
- Screenshot set: `review-artifacts/final`
- Mini-review:
  - Что было baseline: `image-pillar-dashboard-reveal-stack-v1` как implementation-locked reveal baseline.
  - Что reuse-нуто без изменений: gate, reveal staging, shell-to-data choreography, metric/badge/rank effect family.
  - Что адаптировано под тему: stone altar shell, Pokémon media sizing, имя как доминирующий текст и типовая badge-подача.
  - Что еще пока слабое: layout policy пока подтверждена только на одном tower-family и одном dataset family.
  - Почему это уже не scaffold: hero-module прошел полный ролик и сохранил читаемость на длинных именах и image-heavy ассетах.

### BP-04. Environment preview для `scene-1`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/scene/EnvironmentLayer.tsx`
- Цель: Собрать ранний лесной мир с мягким relief ground и дальними train-lines.
- Готово когда: Для позиций 100-76 читаются лес, светлое небо, спокойные облака, живой рельеф и directed-motion за башнями.
- Проверка: Preview раннего сегмента в Studio и полный build-pass без runtime ошибок.
- Reference baseline: `src/lib/ranking-corridor/art/world/forest-backdrop.tsx`, `src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx`, `src/lib/ranking-corridor/art/objects/low-poly-cloud.tsx`
- Reuse mode: `structure-reuse`
- Reuse without changes: базовая low-poly геометрия forest/horizon/cloud reuse-ится как world foundation без смены контрактов этих registry-модулей.
- Allowed adaptation: scene-specific placement, плотность леса, облачная палитра, project-local train path routing и light-tone relief tuning под тему.
- Greenfield justification:
- Non-negotiables: Вторичная жизнь не должна отвлекать от героя; active lane не уходит в темный провал.
- World slots covered: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather`
- Scene coverage: `scene-1`
- Registry baselines used: `forest-backdrop-v1, horizon-mountain-ridge-v1, low-poly-cloud-v1`
- Studio/browser check: `ok`
- Visual check method: `remotion-studio`
- Console/runtime check: `ok`
- Screenshot set: `review-artifacts/final`
- Mini-review:
  - Что было baseline: forest, mountain ridge и low-poly cloud библиотечные world layers.
  - Что reuse-нуто без изменений: базовая геометрия леса, ridge и cloud primitive из registry-backed слоев.
  - Что адаптировано под тему: лесная плотность, светлый ground-tone, локальный train routing за башнями и мягкий рельеф раннего акта.
  - Что еще пока слабое: train layer пока обкатан только как дальний motion, без richer signage/rail-network вариантов.
  - Почему это уже не scaffold: мир читался как отдельный акт и удержал hero-first и ground separation в финальном проекте.

### BP-05. Environment preview для `scene-2`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/scene/EnvironmentLayer.tsx`
- Цель: Адаптировать окружение для позиций 75-51 с переходом к более холодному горному состоянию.
- Готово когда: Лес редеет, свет холодеет, рельеф становится жестче, directed-motion сохраняется в фоне и не ломает hero clarity.
- Проверка: Preview в Studio на среднем акте и build-pass.
- Reference baseline: `src/lib/ranking-corridor/art/world/forest-backdrop.tsx`, `src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx`, `src/lib/ranking-corridor/art/objects/low-poly-cloud.tsx`
- Reuse mode: `structure-reuse`
- Reuse without changes: ridge/cloud/forest foundation reuse-ится без смены registry contract и базовой геометрии.
- Allowed adaptation: density fade, cloud palette, mountain contrast, локальная train visibility, act weighting и relief harshness под переходный акт.
- Greenfield justification:
- Non-negotiables: Переход освещения должен оставаться плавным, а ground под башнями — светлым или средним по тону.
- World slots covered: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather`
- Scene coverage: `scene-2`
- Registry baselines used: `forest-backdrop-v1, horizon-mountain-ridge-v1, low-poly-cloud-v1`
- Studio/browser check: `ok`
- Visual check method: `remotion-studio`
- Console/runtime check: `ok`
- Screenshot set: `review-artifacts/final`
- Mini-review:
  - Что было baseline: те же registry-backed world layers, что и в раннем акте.
  - Что reuse-нуто без изменений: reusable geometry и deterministic motion foundation для forest/ridge/cloud registry-слоев.
  - Что адаптировано под тему: ритм редеющего леса, холодный свет, более жесткий ground и clearer mountain plateau feeling.
  - Что еще пока слабое: mid-act palette сильно завязана на эту mountain theme и требует второй проверки на urban family.
  - Почему это уже не scaffold: акт стал самостоятельной стадией эскалации, а не просто копией scene-1 с другим цветом.

### BP-06. Environment preview для `scene-3`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/scene/EnvironmentLayer.tsx`
- Цель: Собрать сумерки и дождь для позиций 50-26 с живым relief и дальним directed-motion.
- Готово когда: Сумрачное освещение, дождь и train-lines читаются как world escalation, но не бьют по тексту.
- Проверка: Preview в Studio на storm-act и build-pass.
- Reference baseline: `src/lib/ranking-corridor/art/world/storm-effects.tsx`, `src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx`
- Reuse mode: `structure-reuse`
- Reuse without changes: storm rain logic и mountain horizon reuse-ятся без hidden state и без смены базового storm contract.
- Allowed adaptation: скальный landscape mix, rain intensity, project-local puddle presence вне active lane, train readability и fog balance под акт сумерек.
- Greenfield justification:
- Non-negotiables: Дождь не должен мешать чтению длинных имен; puddles нельзя заводить в active lane под башнями.
- World slots covered: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather`
- Scene coverage: `scene-3`
- Registry baselines used: `storm-effects-v1, horizon-mountain-ridge-v1`
- Studio/browser check: `ok`
- Visual check method: `remotion-studio`
- Console/runtime check: `ok`
- Screenshot set: `review-artifacts/final`
- Mini-review:
  - Что было baseline: `storm-effects-v1` и horizon ridge из существующей библиотеки.
  - Что reuse-нуто без изменений: rain logic и ridge foundation из существующей библиотеки.
  - Что адаптировано под тему: отказ от dense forest, лужи вне lane, более резкий relief и nightward palette.
  - Что еще пока слабое: puddle/material tuning пока подтвержден только на storm-heavy теме.
  - Почему это уже не scaffold: акт держит собственное драматическое состояние и при этом сохраняет hero readability.

### BP-07. Environment preview для `scene-4`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/scene/EnvironmentLayer.tsx`
- Цель: Довести финальный storm-payoff до эпичного состояния без потери separation.
- Готово когда: Ночь, молнии, жесткий relief и дальние train-lines поддерживают payoff, а башни и карточки остаются читаемыми.
- Проверка: Preview финального акта в Studio и build-pass.
- Reference baseline: `src/lib/ranking-corridor/art/world/storm-effects.tsx`, `src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx`
- Reuse mode: `structure-reuse`
- Reuse without changes: lightning/rain logic и ridge foundation reuse-ятся как единый storm world package без пересборки registry-модулей.
- Allowed adaptation: lightning timing, storm density, локальные relief/ground решения, train visibility и payoff emphasis под late-game.
- Greenfield justification:
- Non-negotiables: Вспышки редкие, но мощные; ground под башнями не уходит в dark lane; payoff не убивает data readability.
- World slots covered: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather, payoff`
- Scene coverage: `scene-4`
- Registry baselines used: `storm-effects-v1, horizon-mountain-ridge-v1`
- Studio/browser check: `ok`
- Visual check method: `remotion-studio`
- Console/runtime check: `ok`
- Screenshot set: `review-artifacts/final`
- Mini-review:
  - Что было baseline: storm/horizon package плюс локально рожденные train и relief modules.
  - Что reuse-нуто без изменений: storm contract и ridge foundation из существующей библиотеки.
  - Что адаптировано под тему: финальная night palette, lightning cadence, harsher plateau feel и payoff emphasis на топе.
  - Что еще пока слабое: финальный act-heavy lighting пока не доказан вне fantasy/nature family.
  - Почему это уже не scaffold: финальный акт стал production-ready payoff и дожил до library promotion кандидатов.

### BP-08. Integrated preview
- Статус: `done`
- Preview role: `integrated-preview`
- Файлы:
  - `src/compositions/2026-03-25-strongest-pokemon/PokemonComposition.tsx`
- Цель: Связать героя, камеру и все 4 сцены воедино, проверить layout и runtime на полном маршруте.
- Готово когда: Композиция плавно проходит от сцены 1 к 4, длинные имена не ломаются, environment escalation и hero policy не конфликтуют.
- Проверка: Полный pass в Studio, `npm run build`, `npm run lint`.
- Reference baseline: `src/lib/ranking-corridor/scene-presets/rail-focus-vip-finale-v1/package.ts`, `src/lib/ranking-corridor/art/objects/stone-altar-pedestal.tsx`
- Reuse mode: `structure-reuse`
- Reuse without changes: launch-card и launch-note контракты по hero/camera/environment сохраняются как верхний связующий контракт без пересборки базовых модулей.
- Allowed adaptation: z-order, light balancing, runtime glue, visibility tuning и cross-module integration offsets под конкретный ролик.
- Greenfield justification: Сборка камеры, героя, данных и среды воедино остается task-specific интеграцией конкретного проекта, даже если отдельные world-модули уже reusable.
- Non-negotiables: Отсутствие runtime ошибок Remotion/Three.js и стабильная читаемость на всем маршруте.
- World slots covered: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather, payoff`
- Scene coverage: `scene-1, scene-2, scene-3, scene-4`
- Registry baselines used: `forest-backdrop-v1, horizon-mountain-ridge-v1, low-poly-cloud-v1, storm-effects-v1, steam-train-line-v1, corridor-relief-ground-v1`
- Studio/browser check: `ok`
- Visual check method: `remotion-studio`
- Console/runtime check: `ok`
- Screenshot set: `review-artifacts/final`
- Mini-review:
  - Что было baseline: нет единого старого baseline; это проектная интеграция поверх подтвержденных camera/reveal/world packages и локальных world-кандидатов.
  - Что reuse-нуто без изменений: scene preset, hero reveal baseline и forest/ridge/cloud/storm foundation.
  - Что адаптировано под тему: data binding, tower heights, локальные train/relief/altar решения, mountain-storm pacing и Pokémon-specific world direction.
  - Что еще пока слабое: интеграционный glue по-прежнему project-local и не должен автоматически ехать в библиотеку целиком.
  - Почему это уже не scaffold: композиция прошла полный production route, machine-check и дошла до финального approved состояния.
- Блокеры или заметки: Пакет для `preview-gate` был принят, после чего проект перешел в final approval и historical reusable review.

## Post-preview-build

### FB-01. Доработка layout сложных имен
- Статус: `done`
- Файлы: `src/compositions/2026-03-25-strongest-pokemon/scene/HeroPedestal.tsx`
- Цель: Стабилизировать типографику длинных имен и layout-safe media frame.
- Готово когда: Длинные имена, ранг и media-block не конфликтуют между собой.
- Проверка: Финальный Studio pass на длинных именах и `npm run build`.
- Блокеры или заметки: Закрыто в финальной версии hero policy.

### FB-02. Финальная сборка
- Статус: `done`
- Файлы: `src/compositions/2026-03-25-strongest-pokemon/PokemonComposition.tsx`
- Цель: Подтвердить seamless работу всей композиции от 100 до 1 и подготовить проект к final approval.
- Готово когда: Полный build и Studio pass проходят без runtime проблем.
- Проверка: `npm run build`, `npm run lint`.
- Блокеры или заметки: Финальный проект утвержден и использован для historical reusable review.

## История обновлений
- Дата: 2026-03-25
  - Что изменилось в плане: Инициализация плана после launch-note review.
- Дата: 2026-03-26
  - Что изменилось в плане: План доведен до final-approved состояния, backfilled machine-contract по preview/build и добавлена фиксация historical reusable review с promotion train / stone altar / corridor relief.
