# Шаблон build-plan

Сохраняется как `projects/<project-slug>/build-plan.md`.

## Назначение

Этот шаблон нужен как исполнительный мост между `director-pass.md` и реальной сборкой проекта.

Он не заменяет:

- `launch-card.md`;
- `director-pass.md`;
- `asset-manifest.md`;
- `review-notes.md`;
- `preview-gate`.

Его задача:

- разложить ближайшую реализацию на конкретные задачи;
- удержать фокус на одной активной задаче;
- отделить `preview-build` от `post-preview-build`;
- помочь ИИ продолжать проект по файловому состоянию, а не по памяти чата.

## Правила

- `build-plan` живет только внутри `projects/<project-slug>/`.
- Он должен оставаться плоским и практичным, а не превращаться в новый большой PRD.
- Обычно хватает `6-10` задач на весь цикл.
- У задачи должен быть один понятный результат, а не размытый “разберись со сценой”.
- В каждый момент времени только одна задача должна быть в статусе `in_progress`.
- Секция `post-preview-build` остается заблокированной, пока в `review-notes.md` нет допустимого решения по `preview-gate`.
- При продолжении проекта ИИ идет с первой незавершенной задачи, но сначала делает минимальную сверку с реальным состоянием файлов.
- Если задача помечена как выполненная, но минимальная сверка показывает расхождение, ИИ возвращает ее в `todo` или `blocked`, а не доверяет чекбоксу слепо.
- Нельзя писать в чат, что задача завершена или что началась следующая, пока в том же рабочем шаге не обновлены статус текущей задачи, `Следующий шаг` и `in_progress` у новой активной задачи.
- Поле `Следующий шаг` должно содержать существующий `task id` или один из системных шагов: `preview-gate`, `final-approval`, `library-audit`, `completed`.
- `Статус плана` обновляется по жизненному циклу:
  - `draft` — план еще неполон или заблокирован;
  - `active` — план готов к исполнению и по нему идет работа;
  - `preview-complete` — `preview-build` закрыт и `post-preview-build` разблокирован;
  - `full-complete` — все задачи закрыты и verification пройден.
- `Preview-build` в этом шаблоне означает не MVP и не rough scaffold, а `reference-anchored quality slice`.
- Для ключевых задач preview-качества (`camera`, `hero`, `environment`, `integrated-preview`) обязателен `Reference baseline`, машинно читаемый `Reuse mode`, список `Non-negotiables` и явная граница между reuse и адаптацией.
- Для `camera`, `hero` и `environment` reuse по умолчанию идет от verified implementation или явно названного reference baseline, а не только от словесной идеи.
- `Reference baseline` должен указывать на точный source-of-truth: `moduleId`, preset id, repo-relative путь к файлу или иной однозначный reference, а не на расплывчатое описание "что-то вроде стелы".
- `Reuse mode` для key preview task должен быть одним из: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`.
- `greenfield-approved` не является дефолтом. Он допустим только если пользователь явно согласовал выход за пределы baseline или если в артефактах проекта зафиксировано, что подходящего baseline нет.
- Если выбран `greenfield-approved`, обязательно заполни `Greenfield justification` с источником решения: сообщение пользователя, `launch-card.md` или `director-pass.md`. Во всех остальных случаях поле оставляй пустым.
- Если выбран любой reuse-режим кроме `greenfield-approved`, поле `Reference baseline` не может быть пустым или декоративным.
- `Studio/browser check = ok | warning` допустим только вместе с непустым `Visual check method`: нельзя писать "проверено", не указав, чем именно реально смотрели композицию.
- Нельзя переводить ключевую preview-задачу в `done`, если код компилируется, но результат все еще выглядит как бедный scaffold и нарушает `Non-negotiables`.
- Внутри `preview-build` обязательно должны быть quality checkpoints для `hero-preview`, `camera-preview`, `environment-preview` и `integrated-preview`.
- Для quality-checkpoint-задачи со статусом `in_progress` или `done` обязательны валидные `Reuse mode`, `Reference baseline` (если это не `greenfield-approved`), `Reuse without changes` и `Allowed adaptation`.
- Для quality-checkpoint-задачи со статусом `done` обязательны непустые `Mini-review`, `Studio/browser check`, `Visual check method`, `Console/runtime check` и `Screenshot set`.
- После каждого изменения статусов запускай `npm run validate:build-plan -- projects/<project-slug>/build-plan.md`.

## Минимальная сверка при возобновлении

- целевые файлы существуют;
- файлы не пустые;
- ожидаемые экспорты или точки входа присутствуют;
- очевидные импорты и связи не сломаны.

## Полная сверка на воротах

Делается только:

- перед `preview-gate`;
- перед переходом к полному `post-preview-build`;
- перед финальным заявлением о готовности.

Полная сверка обычно включает:

- `npx tsc --noEmit` или эквивалентную техническую проверку;
- открытие композиции в Remotion Studio без runtime-ошибок;
- просмотр целевого среза сцены без явных layout/runtime-проблем.

## Визуальные доказательства

Для ключевых preview-задач обязательны:

- browser/Studio-проверка живой композиции, а не только чтение кода;
- явная фиксация способа просмотра: `mcp-playwright | remotion-studio | built-in-browser`;
- проверка console/runtime без игнорирования ошибок и missing-asset warning;
- screenshot set в `projects/<project-slug>/exports/preview-checks/`;
- краткая visual-note, если есть `warning`, но задача все равно переводится в `done`.

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
- Что уже зафиксировано в `director-pass.md`:
- Что нельзя менять без отдельного пересогласования:

## Preview-build

> Для ключевых preview-задач обязательно заполняй `Preview role`, `Reference baseline` (если это не `greenfield-approved`), `Reuse mode`, `Reuse without changes`, `Allowed adaptation`, `Non-negotiables`, `Studio/browser check`, `Visual check method`, `Console/runtime check`, `Screenshot set` и `Mini-review`. Если конкретная задача не относится к quality checkpoint, укажи `Preview role: support`.

### BP-01. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Preview role: `support | hero-preview | camera-preview | environment-preview | integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
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

### BP-02. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Preview role: `support | hero-preview | camera-preview | environment-preview | integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
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

### BP-03. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Preview role: `support | hero-preview | camera-preview | environment-preview | integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
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

### BP-04. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Preview role: `support | hero-preview | camera-preview | environment-preview | integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
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

### BP-05. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Preview role: `support | hero-preview | camera-preview | environment-preview | integrated-preview`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Reference baseline:
- Reuse mode: `preset-reuse | structure-reuse | system-reuse | greenfield-approved`
- Reuse without changes:
- Allowed adaptation:
- Greenfield justification:
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

## Post-preview-build

> Эта секция остается заблокированной до допустимого решения по `preview-gate`.

### FB-01. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:

### FB-02. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:

### FB-03. <краткое имя задачи>
- Статус: `todo | in_progress | blocked | done`
- Файлы:
- Цель:
- Готово когда:
- Проверка:
- Блокеры или заметки:

## История обновлений
- Дата:
  - Что изменилось в плане:
```

## Что считается хорошим результатом

Хороший `build-plan`:

- не дублирует `director pass`, а превращает его в исполнимые задачи;
- не пытается распланировать все до микрошагов;
- помогает собрать preview-пакет без раннего full build;
- заставляет делать `preview-build` как reference-anchored quality slice, а не как бедный scaffold;
- не дает закрыть quality-checkpoint без visual evidence и machine-check через валидатор;
- держит project-файлы синхронными с тем, что агент уже объявил в чате;
- позволяет продолжить проект в новом запуске без потери контекста.
