# launch-card: 2026-03-25-strongest-pokemon

Сохраняется как `projects/2026-03-25-strongest-pokemon/launch-card.md`.

## Проект

- Slug проекта: `2026-03-25-strongest-pokemon`
- Человеческое название: Самые сильные покемоны всех времен
- Тема: Топ-100 покемонов по сумме характеристик
- Создано: 2026-03-25
- Обновлено: 2026-03-26
- Статус запуска: `draft`
- Источник утверждения core-направления: `explicit-user-text`

## Базовый контракт

- Объект ранжирования: Покемоны
- Метрика: Power (сумма характеристик)
- Режим источника данных: `user-dataset`
- Режим фактологичности рейтинга: `creative-ranking`
- Языковой режим: Данные на английском (адаптация)

## Выбор формата

- Тип главного объекта:
  - название: Природный алтарь с акцентом на имя
  - id: `image-pillar`
  - краткая логика укладки данных: Имя покемона доминирует в hero-zone, ранг всегда читается отдельно над media, Power и типы остаются вторичным dashboard-слоем, а силуэт героя держится как главный визуальный крючок.
  - приоритет героя: `image-first`
  - политика media-layout: `adaptive-safe`
  - политика соседних границ: `hard-fit`
  - защищенная data-zone: `true`
  - размещение ранга: `above-media`
- Пакет сцены и камеры:
  - название: Прямой рельсовый фокус
  - id: `rail-focus-vip-finale-v1`
  - политика reuse: `implementation-locked`
  - source-of-truth files: `src/compositions/most-visited-websites/scene/scene-logic.ts`, `src/compositions/most-visited-websites/scene/camera-presentation.ts`
  - что считается зафиксированным без пересборки: camera path math, VIP-focus, scene progression geometry, intro-to-main handoff и cinematic framing reuse-ятся как единый motion-пакет.
- Пакет появления hero-модуля:
  - название: Появление стелы с dashboard-слоем
  - id: `image-pillar-dashboard-reveal-stack-v1`
  - политика reuse: `implementation-locked`
  - source-of-truth files: `src/compositions/most-visited-websites/components/SteleDashboard.tsx`, `src/lib/ranking-corridor/presentation/projection-gate.ts`, `src/lib/ranking-corridor/presentation/card-reveal-effects.tsx`
  - что считается зафиксированным без пересборки: activation / presentation gate, reveal staging order, shell-to-data choreography, timing метрики, badge/rank/data-card effect family reuse-ятся как единый пакет.
- Тип главной камеры:
  - название: Прямой рельсовый фокус
  - id: `rail-focus-vip-finale-v1`
  - источник выбора: `preset`
- Тип фона:
  - название: Горный хребет / природный фон
  - id: `horizon-mountain-ridge-v1`
  - источник выбора: `theme-default`
  - предварительная роль в шоу: Монументальная природная атмосфера для каменных алтарей с постепенной эскалацией к буре.
- Стратегия длительности: 100 объектов, длинный непрерывный проход с count-aware ритмом и без обязательного finale tail.
- Система появления: `registry-first-default`

## Дополнительный контекст по теме

- Охват: Топ-100 покемонов
- Временное окно: Все поколения ("всех времен")
- Целевое число объектов: 100

## Зоны контроля

- Утвержденное creative-направление: Каменный природный алтарь, где доминируют имя, ранг и силуэт покемона, а окружение эскалирует от леса к грозовой горной кульминации.
- Что зафиксировано референсом: Прямой рельсовый проход камеры, image-first hero policy, reveal-stack и финальная cinematic эскалация через `rail-focus-vip-finale-v1`.
- Что допускает адаптацию: Конкретная фактура камня, палитра сцены, вторичная жизнь мира, погодные акценты и directed-motion внутри общей mountain-storm темы.

## Заметки по данным

- Нужен ли ресерч: Нет.
- Основные источники: `public/ranking-corridor/2026-03-25-strongest-pokemon/data.json`
- Фактологическая оговорка: Это `creative-ranking` проект с curated dataset; список не ограничен только canon-official формами.
- Дата актуальности: 2026-03-25
- Заметки по конфликтам: Методология проекта и data-snapshot синхронизированы через `creative-ranking`, поэтому copy не должен обещать official-only рейтинг.

## Допущения

- Поскольку пользователь не задал другой format package, сохранен registry-backed baseline `rail-focus-vip-finale-v1`.
- Ground и directed-motion развиваются theme-driven внутри общей mountain-storm сцены, но не меняют object-family и hero policy.

## Открытые вопросы по запуску

- Нет.
