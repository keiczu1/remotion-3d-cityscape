# Review Notes

## Проект

- Slug проекта: `2026-03-20-most-visited-websites`
- Человеческое название: Самые посещаемые сайты в мире
- Начато: 2026-03-20
- Обновлено: 2026-03-21

## Предпросмотр

- Цикл review: 1
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
- Решение: ожидает решения пользователя
- Проверенный охват: hero-модуль, фон, данные, ассеты, scramble, fps
- Что подтверждено: визуальный язык, производительность, структура данных, корректность ассетов
- Результат director-pass-проверки: `ok`
- Director-pass-заметки: эскалация по сценам держится через усиление фона, data streams в средней части и церемониальный payoff у лидеров; вторичная жизнь не требует смены hero-концепта, но должна быть повторно просмотрена после optimization-pass
- Перетягивает ли вторичная жизнь внимание с героя: `no`
- Результат layout-проверки: `ok`
- Layout-заметки: data-панель и sizing доменов держатся на текущем preview-наборе; после optimization-pass нужен быстрый re-preview дальних standby/minimal стел и финального flyover
- Какие изменения обязательны: короткий re-preview после optimization-pass/presentation-pass с акцентом на дальние стелы, переходы `minimal -> standby -> full`, высокие лидерские карточки и финальный cinematic tail
- Можно ли идти дальше без повторного предпросмотра: нет
- Нужно ли обязательно повторить предпросмотр: да, короткий re-preview
- Верификация или подтверждающие материалы: `npm test`, `npm run lint`, `npm run build`, локальная проверка композиции `MostVisitedWebsites` в Remotion Studio; preview-export в project-container пока не сохранён

## Финальное утверждение

- Цикл финального review: —
- Статус: —
- Проверенный build: —
- Проверенный снимок данных: —
- Заметки: —
- Обязательные последующие действия: —
- Блокирующие причины: —

## Аудит библиотеки

- Дата аудита: —
- Результат аудита: —
- Покрытие существующей библиотекой: —
- Обновления реестра: —

| candidateId | currentStatus | proposedDecision | targetPlacement | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- |

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
