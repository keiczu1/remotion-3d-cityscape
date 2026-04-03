# launch-card: 2026-03-30-richest-women

Сохраняется как `projects/2026-03-30-richest-women/launch-card.md`.

## Проект

- Slug проекта: `2026-03-30-richest-women`
- Человекочитаемое название: Самые богатые женщины
- Тема: Исторический рейтинг самых богатых женщин с portrait-first hero-модулем и длинными биографическими описаниями
- Создано: 2026-03-30
- Обновлено: 2026-03-31
- Статус запуска: `draft`
- Источник утверждения core-направления: `explicit-user-text`

## Базовый контракт

- Объект ранжирования: женщины из исторического wealth-рейтинга
- Метрика: состояние / wealth
- Режим источника данных: `user-dataset`
- Языковой режим: данные на английском, рабочая коммуникация проекта на русском

## Выбор формата

- Тип главного объекта:
  - название: Portrait biography stele
  - id: `image-pillar`
  - краткая логика укладки данных: крупный портрет доминирует в верхнем hero-slot, rank и wealth читаются внутри стелы, а длинные `source_detail` и `fact` вынесены в отдельную фиксированную карточку справа
  - приоритет героя: `image-first`
  - политика media-layout: `adaptive-safe`
  - политика соседних границ: `hard-fit`
  - защищенная data-zone: `true`
  - размещение ранга: `on-media`
- Пакет сцены и камеры:
  - название: Hero preview stage
  - id: `hero-preview-stage`
  - политика reuse: `none`
  - source-of-truth files: `src/lib/ranking-corridor/hero/portrait-biography-stele.tsx`, `src/compositions/2026-03-30-richest-women/scene/Scene.tsx`
  - что считается зафиксированным без пересборки: grammar одиночного hero/object preview зафиксирован в library-backed hero-модуле; отдельная variant-composition позже выведена из Studio как больше не нужная
- Пакет появления hero-модуля:
  - название: Portrait biography stele reveal
  - id: `portrait-biography-stele-v1`
  - политика reuse: `implementation-locked`
  - source-of-truth files: `src/lib/ranking-corridor/hero/portrait-biography-stele.tsx`
  - `2026-04-01 refresh`: library baseline widened the fixed-size right biography-card, increased content typography, removed shell tilt and replaced the flat pedestal treatment with a sculpted stone pedestal rendered through embedded `ThreeCanvas`
  - что считается зафиксированным без пересборки: image-first portrait stele shell, правая biography-card, pedestal + flag assembly и staged shell/media/copy reveal
- Тип фона:
  - название: Dark premium preview field
  - id: `hero-preview-field`
  - источник выбора: `ai-custom`
  - предварительная роль в шоу: убрать визуальный шум и оставить только премиальный фон для чтения hero-модуля
- Стратегия длительности: короткий Studio-preview для проверки и финализации одного hero/object family
- Система появления: `approved-custom`

## Дополнительный контекст по теме

- Охват: исторический dataset
- География: международная
- Целевое число объектов: `93`

## Стратегия шоу

- Тон шоу: премиальный исторический data-show
- Стиль хука: один финальный hero-модуль без comparison-шумов
- Стратегия глав: в рамках этого контейнера не фиксируется, так как он используется как hero-preview
- Ключевые кульминации: крупный портрет, value-driven pedestal, флаг на мачте и отдельная biography-card
- Подача лидеров: не фиксируется в launch-card этого preview-only контейнера
- Стиль финального payoff: не фиксируется

## Зоны контроля

- Утвержденное creative-направление: один выбранный вариант башни для проекта "Самые богатые женщины" с крупным фото, value-driven пьедесталом и вынесенной biography-card
- Что зафиксировано референсом: image-first подача, flag-pole grammar из `most-visited-websites`, темный корпус с cyan accent-зонами и production-like pedestal
- Что допускает адаптацию: конкретные тексты, размер правой карточки под dataset, нормализацию флагов и масштаб pedestal-height под метрику
- Что `director pass` может режиссерски дообогатить без пересогласования core-направления: только будущий corridor-world, camera-package и pacing полного ролика
- Заметки со статусом `design-only`: comparison из трех вариантов закрыт; production-baseline выбран и зафинален

## Заметки по данным

- Нужен ли ресерч: нет
- Основные источники: `public/final_ranking.json`, `public/final_images/`
- Дата актуальности: 2026-03-31
- Заметки по конфликтам: dataset хранит страны полными именами, поэтому flag-layer использует project-local нормализацию в `src/compositions/2026-03-30-richest-women/model/data.ts`

## Допущения

- Preview продолжает использовать entry `#16 Marguerite Harbert` как контрольный кейс для длинной biography-card
- Этот container фиксирует финальный hero/object family, но не заменяет будущий corridor-preview полного ролика

## Открытые вопросы по запуску

- Полный corridor production pass остается отдельным следующим этапом и не входит в этот hero-finalization pass
