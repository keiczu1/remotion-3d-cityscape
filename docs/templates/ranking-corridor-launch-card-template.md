# Шаблон launch-card

Сохраняется как `projects/<project-slug>/launch-card.md`.

## Назначение

Этот шаблон задает файловую форму `launch-card.md` для единственного активного маршрута:

`constructor / template selector -> launch-card -> build-plan`

`launch-card` является последней обязательной точкой выбора до исполнения.

## Шаблон

```md
# Launch Card

## Проект
- Slug проекта:
- Человеческое название (опционально):
- Тема:
- Создано:
- Обновлено:
- Workflow mode: `library-only-constructor-v1`
- Selection mode: `block-constructor | template-clone`
- Статус запуска: `draft`
- Library-only: `true`
- Locked after launch: `true`
- Источник утверждения core-направления: `constructor | template-clone | explicit-user-text`

## Базовый контракт
- Объект ранжирования:
- Метрика:
- Режим источника данных: `user-dataset | ai-research | mixed-sources`
- Режим фактологичности рейтинга: `official-only | creative-ranking | hybrid-curated`
- Языковой режим:
- Нужен ли ресерч: `yes | no`

## Выбор конструктора

### Scene count
- Scene count: `4`

### Scene sequence
- Scene sequence:
  - `scene-1`:
  - `scene-2`:
  - `scene-3`:
  - `scene-4`:

### Scene world config
- Scene world config:
  - `scene-1`:
    - `horizon`:
    - `side-dressing`:
    - `atmospheric-motion`:
    - `directed-motion`:
    - `ground`:
    - `light-weather`:
    - `payoff`:
  - `scene-2`:
    - `horizon`:
    - `side-dressing`:
    - `atmospheric-motion`:
    - `directed-motion`:
    - `ground`:
    - `light-weather`:
    - `payoff`:
  - `scene-3`:
    - `horizon`:
    - `side-dressing`:
    - `atmospheric-motion`:
    - `directed-motion`:
    - `ground`:
    - `light-weather`:
    - `payoff`:
  - `scene-4`:
    - `horizon`:
    - `side-dressing`:
    - `atmospheric-motion`:
    - `directed-motion`:
    - `ground`:
    - `light-weather`:
    - `payoff`:

## Camera package
- Название:
- Package id:
- Source projects:
- Source-of-truth files:
- Что считается locked baseline:

## Hero package
- Название:
- Package id:
- Source projects:
- Source-of-truth files:
- Что считается locked baseline:

## Template base
- Template base id:
- Template base source project:
- Allowed adaptation scope: `data-only | assets-only | theme-tuning | scene-world-tuning | template-fork-required`
- Fallback rule:

## Стратегия шоу
- Тон шоу:
- Стиль хука:
- Стратегия глав:
- Ключевые кульминации:
- Подача лидеров:
- Стиль финального payoff:

## Зоны контроля
- Что зафиксировано без пересборки:
- Что допускает адаптацию:
- Что остается только data/theme-tuning:
- Какой nearest allowed fallback выбран, если полного покрытия нет:

## Заметки по данным
- Основные источники:
- Дата актуальности:
- Фактологическая оговорка (если не `official-only`):
- Заметки по конфликтам:

## Допущения
- ...

## Открытые вопросы по запуску
- ...
```

## Комментарии

- `Workflow mode` для новых `launch-card` всегда равен `library-only-constructor-v1`.
- `Scene count` для v1 фиксирован в `4`.
- `Scene world config` должен быть заполнен уже на launch-этапе.
- В новом режиме нельзя тихо уходить в custom, greenfield и `policy reuse: none`.
- Если проект создан через `template-clone`, поля `Template base id`, `Template base source project` и `Allowed adaptation scope` обязательны.
