# Шаблон build-plan

Сохраняется как `projects/<project-slug>/build-plan.md`.

## Назначение

Этот шаблон задает файловую форму `build-plan.md`.

Он работает как практический мост между `launch-card.md` и реальной сборкой проекта.

## Правила

- `build-plan` живет только внутри `projects/<project-slug>/`.
- `build-plan` создается сразу после утверждения `launch-card.md`.
- В каждый момент времени только одна задача может быть в статусе `in_progress`.
- Секция `post-preview-build` остается заблокированной, пока в `review-notes.md` нет допустимого решения по `Preview gate`.
- Для key preview task обязательны machine-readable поля `Reuse mode`, `Reference baseline`, `Reuse without changes`, `Allowed adaptation`, `Non-negotiables`.
- `Reuse mode` для key preview task должен быть одним из: `preset-reuse | structure-reuse | system-reuse`.
- `Reference baseline` не может быть пустым.
- Для `environment-preview` и `integrated-preview` обязательны `World slots covered`, `Scene coverage`, `Registry baselines used`.
- Для completed quality-checkpoint обязательны `Studio/browser check`, `Visual check method`, `Console/runtime check`, `Screenshot set`, `Mini-review`.

## Шаблон

```md
# Build Plan

## Проект
- Slug проекта:
- Человеческое название (опционально):
- Тема:
- Создано:
- Обновлено:
- Текущая фаза: `preview-build | post-preview-build`
- Статус плана: `draft | active | preview-complete | full-complete`
- Следующий шаг:
- Что заблокировано до `preview-gate`:

## Короткий контекст
- На что опирается план:
- Что уже зафиксировано в `launch-card.md`:
- Что уже зафиксировано в `review-notes.md`:
- Что нельзя менять без отдельного пересогласования:

## Preview-build

### BP-01. Data snapshot и типы
- Статус: `todo | in_progress | blocked | done`
- Preview role: `support`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:

### BP-02. Camera preview / scene logic
- Статус: `todo | in_progress | blocked | done`
- Preview role: `camera-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse`
- Reuse without changes:
- Allowed adaptation:
- Object count:
- Target duration band:
- Timing policy:
- Finale tail policy:
- Non-negotiables:
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-03. Hero preview
- Статус: `todo | in_progress | blocked | done`
- Preview role: `hero-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse`
- Reuse without changes:
- Allowed adaptation:
- Hero priority:
- Media layout policy:
- Lane collision policy:
- Protected data zone:
- Rank placement:
- Non-negotiables:
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-04. Environment preview для `scene-1`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-1`
- Registry baselines used:
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-05. Environment preview для `scene-2`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-2`
- Registry baselines used:
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-06. Environment preview для `scene-3`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-3`
- Registry baselines used:
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-07. Environment preview для `scene-4`
- Статус: `todo | in_progress | blocked | done`
- Preview role: `environment-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-4`
- Registry baselines used:
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
- Screenshot set:
- Mini-review:
  - Что было baseline:
  - Что reuse-нуто без изменений:
  - Что адаптировано под тему:
  - Что еще пока слабое:
  - Почему это уже не scaffold:
- Блокеры или заметки:

### BP-08. Integrated preview
- Статус: `todo | in_progress | blocked | done`
- Preview role: `integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse`
- Reuse without changes:
- Allowed adaptation:
- Non-negotiables:
- World slots covered:
- Scene coverage: `scene-1, scene-2, scene-3, scene-4`
- Registry baselines used:
- Studio/browser check: `pending | ok | warning | fail`
- Visual check method: `pending | mcp-playwright | remotion-studio | built-in-browser`
- Console/runtime check: `pending | ok | warning | fail`
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
- Статус: `todo | in_progress | blocked | done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:
```
