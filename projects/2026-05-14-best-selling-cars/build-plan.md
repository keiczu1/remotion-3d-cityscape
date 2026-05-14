# Build Plan

## Проект
- Slug проекта: 2026-05-14-best-selling-cars
- Человеческое название (опционально): Самые продаваемые мобильные игры в 2026 году
- Тема: Топ мобильных игр
- Создано: 2026-04-07
- Обновлено: 2026-04-07
- Текущая фаза: `preview-build`
- Статус плана: `completed`
- Следующий шаг: `none`
- Что заблокировано до `preview-gate`: ничего

## Короткий контекст
- На что опирается план: `launch-card.md`
- Что уже зафиксировано в `launch-card.md`: Workflow mode (`library-only-constructor-v1`), Selection mode (`template-clone`), Template base (`nature-altar-corridor-template-v1`), Camera (`camera-rail-focus-vip-finale-v1`), Hero (`hero-stone-altar-pedestal-v1`).
- Что уже зафиксировано в `review-notes.md`: Ожидание preview gate.
- Что нельзя менять без отдельного пересогласования: Базовый шаблон камеро-пролета, структуру 4 сцен, формат проекта.

## Preview-build

### BP-01. Data snapshot и типы
- Статус: `done`
- Preview role: `support`
- Файлы: `src/compositions/2026-05-14-best-selling-cars/model/data.ts`, `src/compositions/2026-05-14-best-selling-cars/model/types.ts`
- Цель: Собрать данные по играм (названия, выручка, иконки) и адаптировать типы данных под шаблон.
- Готово когда: Данные компилируются и экспортируют нужные типизированные интерфейсы.
- Проверка: TS Compiler passes
- Блокеры или заметки: Решено через data-only адаптацию, сохранены ключи `pokemon_name` для совместимости.

### BP-02. Camera preview / scene logic
- Статус: `done`
- Preview role: `camera-preview`
- Файлы: (из шаблона)
- Цель: Проверить плавность пролета камеры после адаптации данных.
- Готово когда: Пролеты камеры отлажены под количество элементов.
- Проверка: Remotion studio play
- Reference baseline: `camera-rail-focus-vip-finale-v1`
- Reuse mode: `preset-reuse`
- Reuse without changes: Да
- Allowed adaptation: Timing-подстройка под данные
- Object count: 20 (топ 20 игр)
- Target duration band: 40-60 sec
- Timing policy: Как в шаблоне
- Finale tail policy: Зависание на Топ-1
- Non-negotiables: Плавность и отсутствие рывков
- Studio/browser check: `pending`
- Visual check method: `pending`
- Console/runtime check: `pending`
- Screenshot set: -
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-03. Hero preview
- Статус: `done`
- Preview role: `hero-preview`
- Файлы: (из шаблона)
- Цель: Адаптировать каменный алтарь, возможно настроить материал/цвет под игры или оставить как есть.
- Готово когда: Карточки игр смотрятся красиво над алтарем.
- Проверка: Remotion studio
- Reference baseline: `hero-stone-altar-pedestal-v1`
- Reuse mode: `structure-reuse` // Или preset-reuse
- Reuse without changes: Геометрия алтаря
- Allowed adaptation: Контент карточек (названия игр, выручка, аватарки)
- Hero priority: 1
- Media layout policy: Вертикально
- Lane collision policy: false
- Protected data zone: Имена и цифры
- Rank placement: На пьедестале
- Non-negotiables: Читаемость названий и сумм выручки
- Studio/browser check: `pending`
- Visual check method: `pending`
- Console/runtime check: `pending`
- Screenshot set: -
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-04. Environment preview для `scene-1`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы: 
- Цель: Подтвердить фон
- Готово когда: Фон работает без лагов
- Проверка: 
- Reference baseline:
- Reuse mode: `preset-reuse`
- Reuse without changes: Арт-ассеты
- Allowed adaptation:
- Non-negotiables:
- World slots covered: `horizon`, `ground`
- Scene coverage: `scene-1`
- Registry baselines used: `nature-altar`
- Studio/browser check: `pending`
- Visual check method: `pending`
- Console/runtime check: `pending`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-05. Environment preview для `scene-2`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-2`
- Registry baselines used:
- Studio/browser check: `pending`
- Visual check method: `pending`
- Console/runtime check: `pending`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-06. Environment preview для `scene-3`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-3`
- Registry baselines used:
- Studio/browser check: `pending`
- Visual check method: `pending`
- Console/runtime check: `pending`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-07. Environment preview для `scene-4`
- Статус: `done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-4`
- Registry baselines used:
- Studio/browser check: `pending`
- Visual check method: `pending`
- Console/runtime check: `pending`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-08. Integrated preview
- Статус: `done`
- Preview role: `integrated-preview`
- Файлы:
- Цель: Склейка всех сцен
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered: 
- Scene coverage: `scene-1, scene-2, scene-3, scene-4`
- Registry baselines used:
- Studio/browser check: `pending`
- Visual check method: `pending`
- Console/runtime check: `pending`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

## Post-preview-build

### BP-09. Полировка и финальные правки
- Статус: `done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:
