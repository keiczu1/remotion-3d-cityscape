# Review Notes

Сохраняется как `projects/2026-03-25-strongest-pokemon/review-notes.md`.

## Проект

- Slug проекта: 2026-03-25-strongest-pokemon
- Человеческое название: Самые сильные покемоны всех времен
- Начато: 2026-03-25
- Обновлено: 2026-03-26

## Исторический Pre-build Review

- Цикл review: 1
- Проверяемый pre-build review: `v1` (Эволюция от леса к грозовой вершине)
- Решение: `approved`
- Что подтверждено: Общая режиссерская задумка, 4-актная эскалация, world-slot каркас и theme-driven mountain-storm направление.
- Что нужно изменить: -
- Можно ли переходить к build-plan: `yes`
- Подтверждающие комментарии: Пользователь подтвердил режиссерское направление, после чего проект был доведен до готового ролика.

## Предпросмотр

- Цикл review: 2
- Пакет предпросмотра: `preview-build final pass`
- Решение: `approve`
- Проверенный охват: Главные checkpoint-задачи `BP-02 ... BP-08`, полный маршрут от ранних рангов к финалу и целостность image-first hero policy.
- Что подтверждено: Камера, hero reveal, mountain-storm environment, directed-motion train-lines, corridor-relief ground и финальный storm payoff работают совместно.
- Обещанные world-slot из `pre-build review`: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather, payoff`
- Реально реализованные world-slot: `horizon, side-dressing, atmospheric-motion, directed-motion, ground, light-weather, payoff`
- Проверенное покрытие сцен: `scene-1, scene-2, scene-3, scene-4`
- Результат pre-build review-проверки: `ok`
- Pre-build review-заметки: Эскалация держится от спокойного леса к грозовой вершине; поезд и relief дают живую среду, но остаются вторичным world-layer.
- Перетягивает ли вторичная жизнь внимание с героя: `no`
- Результат layout-проверки: `ok`
- Layout-заметки: Имя и ранг сохраняют доминирование; active lane и podium separation удержаны после осветления ground.
- Результат image-first policy-проверки: `ok`
- Image-first policy-заметки: Media доминирует, ранг остается над media, data-zone защищена, соседние башни не ломают hero layout.
- Результат browser/Studio-проверки: `ok`
- Метод browser/Studio-проверки: `remotion-studio`
- Результат console/runtime-проверки: `ok`
- Папка screenshot-артефактов: `projects/2026-03-25-strongest-pokemon/review-artifacts/final`
- Visual checklist:
  - Hero / readability: Имя, silhouette и ранг устойчиво читаются на всех актах.
  - Image-first / media policy: Media frame адаптивный и не залезает в нижний data-block.
  - Ground / podium separation: Основание башен отделяется от пола; dark-lane дефект не доминирует.
  - Camera / pacing: Rail-focus preset держит непрерывный проход и финальное замедление без дерганья.
  - Environment / secondary-life: Relief, поезда, лес, гроза и clouds живые, но не перетягивают внимание.
  - Pre-build review match: Финальный мир соответствует direction от леса к storm-plateau.
- Какие изменения обязательны: -
- Можно ли идти дальше без повторного предпросмотра: yes
- Нужно ли обязательно повторить предпросмотр: no
- Верификация или подтверждающие материалы: `projects/2026-03-25-strongest-pokemon/review-artifacts/final/post-promotion-frame-3000.png`, `projects/2026-03-25-strongest-pokemon/review-artifacts/final/post-promotion-frame-8000.png`, `projects/2026-03-25-strongest-pokemon/review-artifacts/final/post-promotion-frame-13000.png`, `projects/2026-03-25-strongest-pokemon/review-artifacts/final/post-promotion-frame-18000.png`, `projects/2026-03-25-strongest-pokemon/review-artifacts/final/post-promotion-frame-22000.png`, `npm run build`, `npm run lint`.

## Финальное утверждение

- Цикл финального review: 1
- Статус: `final-approved-with-notes`
- Проверенный build: `npm run build`, `npm run lint`
- Проверенный снимок данных: `public/ranking-corridor/2026-03-25-strongest-pokemon/data.json`, `npm run validate:data -- 2026-03-25-strongest-pokemon`
- Заметки: Финальный accepted проект использован как основа для manual reusable review; после самого promotion-pass сделаны свежие machine-check и новый still-set уже на library-backed версии сцены.
- Обязательные последующие действия: manual reusable review выполнен; reusable world/art modules вынесены в `src/lib/ranking-corridor`.
- Блокирующие причины: -

## Ручной Review Reusable-Кандидатов

- Дата аудита: 2026-03-26
- Результат аудита: `auto-promotion-applied`
- Покрытие существующей библиотекой: Камера, reveal-stack, cloud, forest, mountain ridge и storm effects уже покрывались библиотекой; новыми зрелыми кандидатами оказались directed-motion поезд, stone altar shell и corridor-relief ground.
- Проверенные категории: `camera preset`, `reveal/effect module`, `hero/object family`, `policy layer / layout policy`, `background / ambient / secondary-life system`, `utility / helper`
- Категории без зрелых кандидатов: `camera preset`, `timing preset`, `reveal/effect module`, `utility / helper`
- Обновления реестра: `stone-altar-pedestal-v1`, `steam-train-line-v1`, `corridor-relief-ground-v1`

| candidateId | candidateType | currentStatus | sourceLocation | reusableWhy | proposedDecision | targetPlacement | finalEvidence | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| image-pillar-adaptive-safe-media-v1 | policy layer / layout policy | project-local | `src/compositions/2026-03-25-strongest-pokemon/scene/HeroPedestal.tsx`, `src/compositions/2026-03-25-strongest-pokemon/components/stele-dashboard-layout.ts` | image-first media policy с aspect-aware frame, защищенной data-zone и рангом над media-block не завязана на Pokémon-тему и может reuse-иться поверх разных tower-family | checkpoint-needed | `src/lib/ranking-corridor/hero/` после отдельного policy-pass | accepted финальный Pokémon проект | `projects/2026-03-25-strongest-pokemon/review-notes.md` | policy уже сильная, но подтверждена пока только одним image-heavy hero-family |
| stone-altar-pedestal-v1 | hero/object family | project-local | `src/compositions/2026-03-25-strongest-pokemon/scene/Pedestal.tsx` | rough-stone altar shell не зависит от Pokémon-данных и подходит как reusable tower/pedestal корпус для nature / fantasy / arena world | promote-to-library | `src/lib/ranking-corridor/art/objects/stone-altar-pedestal.tsx` | full project, final-approved-with-notes, build/lint pass | `projects/2026-03-25-strongest-pokemon/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | promoted как shell-art object, а не как полный hero module |
| steam-train-line-v1 | background / ambient / secondary-life system | project-local | `src/compositions/2026-03-25-strongest-pokemon/scene/EnvironmentLayer.tsx` | паровой поезд с рельсовой линией — это reusable directed-motion слой; он не завязан на Pokémon-тему и может жить в nature / industrial / fantasy corridor worlds | promote-to-library | `src/lib/ranking-corridor/art/world/steam-train-line.tsx` | final directed-motion layer в accepted проекте, build/lint pass | `projects/2026-03-25-strongest-pokemon/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | project-local остается только routing кривых и act-level pacing |
| corridor-relief-ground-v1 | background / ambient / secondary-life system | project-local | `src/compositions/2026-03-25-strongest-pokemon/scene/EnvironmentLayer.tsx` | corridor-relief ground с deterministic seed, камнями и локальными лужами решает общую задачу ground эволюции и separation без темы покемонов | promote-to-library | `src/lib/ranking-corridor/art/world/corridor-relief-ground.tsx` | final ground layer в accepted проекте, build/lint pass | `projects/2026-03-25-strongest-pokemon/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | project-local остается theme-direction, palette и lane-specific tuning |

## Общие заметки

- В библиотеку не поднималась целиком Pokémon-specific интеграция сцены: локальными остаются act-level direction, camera/world glue и dataset binding.
