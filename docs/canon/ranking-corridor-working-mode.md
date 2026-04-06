# Ranking Corridor: Рабочий Режим

**Дата:** 2026-04-05

## Назначение

Этот документ фиксирует единственный активный workflow для новых роликов формата `ranking corridor`.

## Активный маршрут

Для новых проектов используется только такой путь:

1. `Прием темы`
2. `Constructor / template selector`
3. `Launch-card`
4. `Build-plan`
5. `Preview-build`
6. `Preview-gate`
7. `Post-preview-build`
8. `Final approval`

Никаких дополнительных обязательных фаз у этого маршрута нет.

## Базовые правила режима

- Активный `workflow mode` только один: `library-only-constructor-v1`.
- Для `v1` число сцен фиксировано: `4`.
- Допустимы только два способа запуска:
  - `block-constructor`
  - `template-clone`
- Запрещены любые устаревшие creative-first шаги, скрытые custom-обходы и свободные greenfield-ветки вне constructor/template контракта.

Если библиотека не покрывает тему полностью, ИИ предлагает ближайший допустимый library-backed или template-backed вариант. Тихий уход в свободную сборку запрещен.

## Этап 1. Прием темы

Пользователь может дать тему одной фразой.

ИИ обязан сам сделать первичную классификацию:

- что именно ранжируется;
- какая метрика подразумевается;
- нужен ли интернет-ресерч;
- какой template или какой набор library-backed блоков ближе теме.

## Этап 2. Constructor / template selector

После классификации ИИ запускает constructor-first выбор.

В selector-пакете фиксируются:

- `Scene count`
- `Scene sequence`
- `Scene world config`
- `Camera package`
- `Hero package`
- `Template base`, если выбран `template-clone`

По умолчанию selector показывает только существующие library-backed и template-backed варианты.

## Этап 3. Launch-card

После выбора ИИ обязан materialize-ить:

- `projects/<project-slug>/launch-card.md`
- `projects/<project-slug>/review-notes.md`

`launch-card` является последней обязательной точкой выбора до исполнения.

В `launch-card` обязательно фиксируются:

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

## Этап 4. Build-plan

После `launch-card` ИИ создает `projects/<project-slug>/build-plan.md`.

`build-plan`:

- разносит `preview-build` и `post-preview-build`;
- держит одну активную задачу;
- является source-of-truth для resume внутри production-фазы.

Machine-step значения:

- `task id` текущей активной задачи, пока внутри фазы еще есть незавершенная работа
- `preview-gate`
- `final-approval`
- `completed`

Human-readable секции в `review-notes.md`:

- `Preview gate`
- `Final approval`

## Этап 5. Preview-build

До `preview-gate` ИИ обязан пройти через preview-срез.

Обязательные quality-checkpoint задачи:

- `camera-preview`
- `hero-preview`
- `environment-preview` для `scene-1`
- `environment-preview` для `scene-2`
- `environment-preview` для `scene-3`
- `environment-preview` для `scene-4`
- `integrated-preview`

Для key preview task обязательны:

- `Reuse mode`
- `Reference baseline`
- `Reuse without changes`
- `Allowed adaptation`
- `Non-negotiables`
- `Studio/browser check`
- `Visual check method`
- `Console/runtime check`
- `Screenshot set`
- `Mini-review`

Допустимые `reuse mode`:

- `preset-reuse`
- `structure-reuse`
- `system-reuse`

## Этап 6. Preview-gate

`Preview gate` ведется в `review-notes.md`.

Допустимые решения:

- `approve`
- `approve with changes`
- `reject`

Переход к `post-preview-build` разрешен только после `approve` или `approve with changes`.

## Этап 7. Post-preview-build

После успешного `Preview gate` ИИ закрывает оставшиеся production-задачи, не ломая launch-контракт.

## Этап 8. Final approval

`Final approval` ведется в `review-notes.md`.

Допустимые статусы:

- `final-approved`
- `final-approved-with-notes`
- `not-final`

Только после финального статуса проект считается завершенным.

## Контракт по данным

К первому `preview-gate` в project-container должны существовать:

- `launch-card.md`
- `review-notes.md`
- `build-plan.md`
- `asset-manifest.md`
- `data/`
- `exports/`

Если тема требует актуальных данных, в project-local snapshot должны быть зафиксированы:

- источники;
- дата проверки;
- допущения;
- конфликтующие места, если они были.

## Resume-routing

При продолжении проекта ИИ ориентируется только на файловое состояние.

Правило resume такое:

- есть `launch-card.md`, но нет `build-plan.md` — создать `build-plan`;
- `preview-build` не завершен — продолжить первую незавершенную preview-задачу;
- `preview-build` завершен, но нет решения по `Preview gate` — пройти `preview-gate`;
- `Preview gate` одобрен, но `post-preview-build` не завершен — продолжить post-preview задачи;
- post-preview завершен, но нет финального статуса — закрыть `Final approval`;
- есть финальный статус — workflow завершен.

## Проверки

Обязательные ворота:

- `npm run validate:build-plan -- projects/<project-slug>/build-plan.md`
