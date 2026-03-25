# Шаблон launch-card

Сохраняется как `projects/<project-slug>/launch-card.md`.

## Проект

- Slug проекта:
- Человеческое название (опционально):
- Тема:
- Создано:
- Обновлено:
- Статус запуска: `draft`
- Источник утверждения core-направления: `concept-pack | verified-preset | explicit-user-text | user-approved-default`

## Базовый контракт

- Объект ранжирования:
- Метрика:
- Режим источника данных: `user-dataset | ai-research | creative-ranking`
- Языковой режим:

## Выбор формата

> Если выбран registry-backed verified preset с `reusePolicy: implementation-locked`, фиксируй его как единый `Пакет сцены и камеры`: в этом случае камера, ритм и базовая scene progression не подбираются по отдельности и не смешиваются с другими preset-family без отдельного пересогласования.
> Для такого пакета `launch-card.md` становится частью machine-check: validator `build-plan` сверяет `camera-preview` с выбранным `Пакетом сцены и камеры`, его registry `sourceOfTruthFiles` и полем `что считается зафиксированным без пересборки`, которое должно дублировать registry `lockedBehavior`.
> Для такого пакета `Тип ритма` не является отдельным выбором. Он считается унаследованным от `Пакета сцены и камеры` и может быть опущен.
> Если для выбранного `objectFamily` уже есть registry-backed reveal-baseline с `reusePolicy: implementation-locked`, фиксируй его как `Пакет появления hero-модуля`: validator `build-plan` сверяет `hero-preview` с выбранным пакетом, его registry `sourceOfTruthFiles` и полем `что считается зафиксированным без пересборки`, которое должно дублировать registry `lockedBehavior`.
> Поле `Тип главного объекта -> id` обязательно: validator использует его как machine-readable `objectFamily` для проверки совместимости `heroRevealPackage`.

- Тип главного объекта:
  - название:
  - id:
  - краткая логика укладки данных:
- Пакет сцены и камеры:
  - название:
    - для registry-backed implementation-locked варианта: `userFacingName`
  - id:
    - для registry-backed implementation-locked варианта: `moduleId`
  - политика reuse: `implementation-locked | contract-only | none`
  - source-of-truth files:
  - что считается зафиксированным без пересборки:
- Пакет появления hero-модуля:
  - название:
    - для registry-backed implementation-locked варианта: `userFacingName`
  - id:
    - для registry-backed implementation-locked варианта: `moduleId`
  - политика reuse: `implementation-locked | contract-only | none`
  - source-of-truth files:
  - что считается зафиксированным без пересборки:
- Тип главной камеры:
  - название:
    - для registry-backed verified-варианта: `userFacingName`
    - если выбран `Пакет сцены и камеры` с `implementation-locked`, поле должно дублировать его название
  - id:
    - для registry-backed verified-варианта: `moduleId`
    - если выбран `Пакет сцены и камеры` с `implementation-locked`, поле должно дублировать его `moduleId`
  - источник выбора: `preset | user-custom | ai-custom`
    - если выбран `Пакет сцены и камеры` с `implementation-locked`, отдельный источник выбора камеры не фиксируется: это производное read-only поле от пакета
  - краткое описание логики:
    - если выбран `Пакет сцены и камеры` с `implementation-locked`, отдельную новую логику камеры здесь не описывай: достаточно пакета сцены и камеры
  - обоснование кастома (если `ai-custom`):
- Тип ритма:
  - этот блок заполняется только если НЕ выбран `Пакет сцены и камеры` с `implementation-locked`
  - если выбран implementation-locked пакет, отдельный выбор ритма не фиксируется: ритм унаследован от пакета сцены и камеры
  - название:
    - для registry-backed verified-варианта: `userFacingName`
  - id:
    - для registry-backed verified-варианта: `moduleId`
  - источник выбора: `preset | user-custom | ai-custom`
  - краткое описание логики:
  - обоснование кастома (если `ai-custom`):
- Тип фона:
  - название:
  - id:
  - источник выбора: `preset | theme-default | user-custom | ai-custom`
  - предварительная роль в шоу:
- Режим представления контента:
  - название:
  - id:
- Стратегия длительности:
- Система появления: `registry-first-default | approved-custom`

## Дополнительный контекст по теме

- Охват (опционально):
- Временное окно (опционально):
- География (опционально):
- Целевое число объектов (опционально):

## Стратегия шоу

- Тон шоу:
- Стиль хука:
- Стратегия глав:
- Ключевые кульминации:
- Подача лидеров:
- Стиль финального payoff:

## Зоны контроля

- Утвержденное creative-направление:
- Что зафиксировано референсом:
- Что допускает адаптацию:
- Что `director pass` может режиссерски дообогатить без пересогласования core-направления:
- Заметки со статусом `design-only`:

## Заметки по данным

- Нужен ли ресерч:
- Основные источники:
- Дата актуальности:
- Заметки по конфликтам:

## Допущения

- ...

## Открытые вопросы по запуску

- ...
