# Launch Card

## Проект
- Slug проекта: `2026-05-14-best-selling-cars`
- Человеческое название (опционально): Самые продаваемые мобильные игры в 2026 году
- Тема: Топ мобильных игр
- Создано: 2026-04-07
- Обновлено: 2026-04-07
- Workflow mode: `library-only-constructor-v1`
- Selection mode: `template-clone`
- Статус запуска: `draft`
- Library-only: `true`
- Locked after launch: `true`
- Источник утверждения core-направления: `explicit-user-text`

## Базовый контракт
- Объект ранжирования: Мобильные игры
- Метрика: Продажи/Выручка
- Режим источника данных: `ai-research`
- Режим фактологичности рейтинга: `official-only`
- Языковой режим: Русский
- Нужен ли ресерч: `yes`

## Выбор конструктора

### Scene count
- Scene count: `4`

### Scene sequence
- Scene sequence:
  - `scene-1`: Intro
  - `scene-2`: 20-11
  - `scene-3`: 10-4
  - `scene-4`: Top 3

### Scene world config
- Scene world config:
  - `scene-1`:
    - `horizon`: `horizon-mountain-ridge-v1` (или из базы шаблона - `nature-altar`)
    - `side-dressing`: (из шаблона)
    - `atmospheric-motion`: (из шаблона)
    - `directed-motion`: (из шаблона)
    - `ground`: (из шаблона)
    - `light-weather`: (из шаблона)
    - `payoff`: (из шаблона)
  - `scene-2`:
    - `horizon`: (из шаблона)
    - `side-dressing`: (из шаблона)
    - `atmospheric-motion`: (из шаблона)
    - `directed-motion`: (из шаблона)
    - `ground`: (из шаблона)
    - `light-weather`: (из шаблона)
    - `payoff`: (из шаблона)
  - `scene-3`:
    - `horizon`: (из шаблона)
    - `side-dressing`: (из шаблона)
    - `atmospheric-motion`: (из шаблона)
    - `directed-motion`: (из шаблона)
    - `ground`: (из шаблона)
    - `light-weather`: (из шаблона)
    - `payoff`: (из шаблона)
  - `scene-4`:
    - `horizon`: (из шаблона)
    - `side-dressing`: (из шаблона)
    - `atmospheric-motion`: (из шаблона)
    - `directed-motion`: (из шаблона)
    - `ground`: (из шаблона)
    - `light-weather`: (из шаблона)
    - `payoff`: (из шаблона)

## Camera package
- Название: Прямой рельсовый фокус
- Package id: `camera-rail-focus-vip-finale-v1`
- Source projects: `2026-03-25-strongest-pokemon`, `2026-03-20-most-visited-websites`
- Source-of-truth files: (будут из клона композиции)
- Что считается locked baseline: Камера, тайминги пролетов.

## Hero package
- Название: Каменный altar-пьедестал
- Package id: `hero-stone-altar-pedestal-v1`
- Source projects: `2026-03-25-strongest-pokemon`
- Source-of-truth files: (будут из клона композиции)
- Что считается locked baseline: Геометрия башен, логика рендеринга.

## Template base
- Template base id: `nature-altar-corridor-template-v1`
- Template base source project: `2026-03-25-strongest-pokemon`
- Allowed adaptation scope: `scene-world-tuning`
- Fallback rule: Строгое следование канону шаблона

## Стратегия шоу
- Тон шоу: Эпичный
- Стиль хука: Захват внимания крупным планом
- Стратегия глав: Плавное нарастание масштаба башен/выручки
- Ключевые кульминации: Финальный Топ-3
- Подача лидеров: Остановка камеры, детали
- Стиль финального payoff: Зависание на топ-1

## Зоны контроля
- Что зафиксировано без пересборки: Камера, Hero Package.
- Что допускает адаптацию: Данные, Мир сцены, Текстуры.
- Что остается только data/theme-tuning: Data.
- Какой nearest allowed fallback выбран, если полного покрытия нет: -

## Заметки по данным
- Основные источники: Sensor Tower / Data.ai (открытые данные)
- Дата актуальности: 2026 год
- Фактологическая оговорка (если не `official-only`): Оценочные данные
- Заметки по конфликтам: -

## Допущения
- Будем использовать данные по глобальной выручке мобильных игр (App Store + Google Play)

## Открытые вопросы по запуску
- - 
