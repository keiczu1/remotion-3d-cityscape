---
name: ranking-corridor-launch
description: "Запускай новый проект формата `ranking corridor` в режиме `library-only-constructor-v1`: проведи constructor/template selector только по каталогу библиотеки и template-catalog, затем собери и сохрани `launch-card` вместе со skeleton `review-notes`. Не переходи в production."
---

# Ranking Corridor Launch

Запускай новый `ranking corridor` проект от темы до `launch-card`.

Маршрут этого skill:

- `тема -> constructor / template selector -> launch-card`

На этом этапе не переходи в:

- `build-plan`
- `preview-build`
- `preview-gate`
- `post-preview-build`
- `final approval`
- код композиции

## Сначала подними контекст

Используй только активный контур:

- `AGENTS.md`
- `docs/README.md`
- `docs/canon/ranking-corridor-format.md`
- `docs/canon/ranking-corridor-working-mode.md`
- `docs/templates/ranking-corridor-launch-card-template.md`
- `docs/templates/ranking-corridor-review-notes-template.md`
- `docs/library/ranking-corridor-constructor-catalog.md`
- `docs/library/ranking-corridor-template-catalog.md`
- `src/lib/ranking-corridor/catalog/constructor-catalog.ts`
- `src/lib/ranking-corridor/catalog/template-catalog.ts`
- `projects/README.md`, если materialize-ится `project-container`

## Что считается дефолтом

Для новых проектов launch работает только в режиме:

- `workflowMode: library-only-constructor-v1`

Допустимы два способа запуска:

- `Selection mode: block-constructor`
- `Selection mode: template-clone`

Число сцен для `v1` фиксировано:

- `Scene count: 4`

В новом режиме запрещены любые скрытые custom-обходы, свободные обходные ветки и вне-контрактные шаги.

Если библиотека не покрывает тему полностью, предлагай ближайший допустимый catalog/template fallback. Не уходи в свободную сборку.

## Состояние 1. Есть только тема

Если пользователь дал только тему или неполный контекст:

1. Быстро классифицируй тему.
2. Определи, что ближе: `block-constructor` или `template-clone`.
3. Покажи один полный selector-пакет.

Selector-пакет должен включать:

- `🎬 Структура ролика`
- `🌍 Мир сцены`
- `🎥 Камера`
- `🏛 Hero package`
- `🧩 Template mode`, если есть сильная template-база

Показывай только реальные library-backed и template-backed варианты. По возможности указывай, из каких проектов они пришли.

## Состояние 2. Выбор уже по сути сделан

Если пользователь уже выбрал scene structure, мир, камеру, hero package или template:

- не задавай лишних вопросов;
- собери `launch-card`;
- предложи или выбери `project-slug` по канону `YYYY-MM-DD-short-topic-slug`;
- сохрани `projects/<project-slug>/launch-card.md`;
- одновременно создай skeleton `projects/<project-slug>/review-notes.md`;
- остановись на launch-этапе.

## Как выбирать между `block-constructor` и `template-clone`

Выбирай `block-constructor`, если:

- тему можно собрать из существующих camera/world/hero package;
- не нужно физически клонировать готовую композицию.

Выбирай `template-clone`, если:

- есть близкая template-база;
- пользователь по сути хочет режим `возьми базовый проект и адаптируй`.

## Что обязательно фиксировать в `launch-card`

Минимально обязательны:

- `Workflow mode`
- `Selection mode`
- `Scene count`
- `Scene sequence`
- `Scene world config`
- `Camera package`
- `Hero package`
- `Library-only`
- `Locked after launch`

Для `template-clone` дополнительно:

- `Template base id`
- `Template base source project`
- `Allowed adaptation scope`

## Как materialize-ить launch-артефакты

Минимум launch-only container:

- `projects/<project-slug>/launch-card.md`
- `projects/<project-slug>/review-notes.md`

`review-notes.md` создается как skeleton с секциями:

- `Preview gate`
- `Final approval`

## Чего launch skill не должен делать

- строить `build-plan`;
- писать код композиции;
- materialize-ить template-код;
- добавлять дополнительные промежуточные шаги вне launch-контракта;
- запускать дополнительные post-project процессы.
