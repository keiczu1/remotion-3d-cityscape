---
name: ranking-corridor-production
description: "Веди `ranking corridor` проект после `launch-card` в режиме `library-only-constructor-v1`: при необходимости materialize-ь template через scaffold, собирай `build-plan`, выполняй `preview-build`, проходи `preview-gate`, затем `post-preview-build` и `final approval`."
---

# Ranking Corridor Production

Веди `ranking corridor` проект от `launch-card` до `final approval`.

Активный маршрут:

- `launch-card -> build-plan -> preview-build -> preview-gate -> post-preview-build -> final approval`

Дополнительные устаревшие или вне-контрактные шаги в этот маршрут не входят.

## Сначала подними контекст

Используй:

- `AGENTS.md`
- `docs/README.md`
- `docs/canon/ranking-corridor-format.md`
- `docs/canon/ranking-corridor-working-mode.md`
- `docs/canon/remotion-project-rules.md`
- `projects/README.md`
- `projects/<project-slug>/launch-card.md`
- `projects/<project-slug>/build-plan.md`
- `projects/<project-slug>/asset-manifest.md`
- `projects/<project-slug>/review-notes.md`
- `src/lib/ranking-corridor/catalog/template-catalog.ts`
- `docs/templates/ranking-corridor-build-plan-template.md`
- `docs/templates/ranking-corridor-review-notes-template.md`

Когда меняешь Remotion-код, также учитывай skill `remotion-best-practices`.

## Шаг 0. Разреши режим и фазу

Перед любым действием:

1. Разреши `project-slug`.
2. Прочитай `launch-card.md`.
3. Убедись, что `Workflow mode = library-only-constructor-v1`.
4. Определи текущую фазу по файловому состоянию, а не по памяти чата.

Если `Workflow mode` отсутствует или не равен `library-only-constructor-v1`, это ошибка контракта.

## Шаг 1. Materialization и минимальный container

Если project-container еще не доведен до рабочего состояния, собери минимум:

- `projects/<project-slug>/launch-card.md`
- `projects/<project-slug>/review-notes.md`
- `projects/<project-slug>/asset-manifest.md`
- `projects/<project-slug>/data/`
- `projects/<project-slug>/exports/`

### Для `template-clone`

Если `Selection mode: template-clone` и код/ассеты еще не materialize-нуты:

- прочитай `Template base id` из `launch-card.md`;
- используй `template-catalog` как source-of-truth;
- запускай `npm run scaffold:template -- <template-id> <project-slug>`;
- после scaffold проверь, что новая композиция зарегистрирована в `src/Root.tsx`;
- проверь, что старые `build-plan.md`, `review-notes.md`, `exports/`, `review-artifacts/` не были скопированы в новый проект.

## Шаг 2. Собери `build-plan`

`build-plan` создается сразу после `launch-card`.

При создании:

- опирайся только на `launch-card`;
- не придумывай новые hero/camera/world решения поверх зафиксированных;
- не открывай свободные обходные ветки вне launch-контракта;
- используй machine tokens:
  - `preview-gate`
  - `final-approval`
  - `completed`

## Шаг 3. Выполняй `preview-build`

До `preview-gate` обязан пройти через preview-срез.

Главные правила:

- активна одна рабочая задача;
- статусы в `build-plan.md` обновляются по факту;
- `environment-preview` сверяется с `Scene world config` из `launch-card.md`;
- `integrated-preview` покрывает `scene-1, scene-2, scene-3, scene-4`;
- evidence для preview собирается до закрытия ключевых preview-задач.

## Шаг 4. Пройди `preview-gate`

Перед `preview-gate` подготовь:

- актуальный `build-plan.md`;
- preview evidence;
- обновленный `review-notes.md` в секции `Preview gate`.

Допустимые решения:

- `approve`
- `approve with changes`
- `reject`

## Шаг 5. Выполняй `post-preview-build`

После `approve` или допустимого `approve with changes`:

- продолжай оставшиеся задачи полной сборки;
- не ломай launch-контракт;
- делай финальные visual/runtime проверки.

## Шаг 6. Закрой `Final approval`

После post-preview:

- обнови секцию `Final approval` в `review-notes.md`;
- зафиксируй финальный статус;
- только после этого считай production завершенным.

## Resume-routing

- есть `launch-card.md`, но нет `build-plan.md` — создай `build-plan`;
- `preview-build` не завершен — продолжай первую незавершенную preview-задачу;
- `preview-build` завершен, но нет решения по `Preview gate` — пройди `preview-gate`;
- `Preview gate` одобрен, но `post-preview-build` не завершен — продолжай post-preview задачи;
- post-preview завершен, но нет финального статуса — закрой `Final approval`;
- есть финальный статус — workflow завершен.
