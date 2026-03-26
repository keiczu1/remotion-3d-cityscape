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

> Короткий machine-check reminder:
> - implementation-locked registry preset оформляется как единый `Пакет сцены и камеры`; `Тип главной камеры` и `Тип ритма` в этом режиме остаются только производными read-only полями и могут быть опущены;
> - validator `build-plan` сверяет этот пакет по `source-of-truth files` и полю `что считается зафиксированным без пересборки`, которое должно совпадать с registry `lockedBehavior`;
> - implementation-locked reveal-baseline оформляется как `Пакет появления hero-модуля` и так же сверяется по `source-of-truth files` и `lockedBehavior`;
> - поле `Тип главного объекта -> id` обязательно: это machine-readable `objectFamily` для проверки совместимости `heroRevealPackage`;
> - `Тип фона` на launch-этапе по умолчанию остается только предварительным `theme-default`.

- Тип главного объекта:
  - название:
  - id:
  - краткая логика укладки данных:
  - эти поля задают `objectFamily`, а не policy показа изображения
  - приоритет героя: `image-first | balanced | data-first`
  - политика media-layout: `adaptive-safe | fixed | compact`
  - политика соседних границ: `hard-fit | soft-overlap`
  - защищенная data-zone: `true | false`
  - размещение ранга: `above-media | on-media | integrated`
  - эти пять полей выше описывают cross-family media policy: их можно reuse-ить поверх разных семейств башен, не привязывая к одному стилю корпуса
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
  - этот блок обычно опускается
  - используй его только как производное read-only поле для читаемости, если уже выбран `Пакет сцены и камеры` и нужно явно показать, какой camera behavior в него входит
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
  - этот блок по умолчанию опускается
  - заполняется только в редком исключительном axis-level режиме, если verified package-база реально не покрыла тему или пользователь сам прямо попросил кастомный разбор по осям
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
    - на launch-этапе только краткая предварительная атмосфера; детальная `secondary-life system` фиксируется позже в `director-pass`
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
