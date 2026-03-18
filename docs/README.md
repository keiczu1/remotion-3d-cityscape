# Документация

## Точка входа

Эта папка хранит активную документацию по `ranking corridor`.

Если нужно быстро войти в контекст, читай документы в таком порядке:

1. `docs/canon/ranking-corridor-format.md`
2. `docs/canon/ranking-corridor-working-mode.md`
3. `docs/canon/remotion-project-rules.md`
4. `docs/workflow/ranking-corridor-workflow-implementation-plan.md`
5. `docs/workflow/ranking-corridor-v1-implementation-plan.md`

## Кто чем владеет

- `docs/canon/ranking-corridor-format.md` — канон формата ролика.
- `docs/canon/ranking-corridor-working-mode.md` — единственный владелец рабочего цикла, статусов и контрактов project-артефактов.
- `docs/canon/remotion-project-rules.md` — технические правила и инварианты Remotion-проекта.
- `docs/workflow/ranking-corridor-workflow-implementation-plan.md` — стабильный обзор системы и переносимого пакета.
- `docs/workflow/ranking-corridor-v1-implementation-plan.md` — только текущий статус внедрения `v1`, следующий шаг и критерии пилота.
- `projects/README.md` — единственный владелец структуры `projects/<project-slug>/`.
- `docs/templates/` — шаблоны project-артефактов.
- `docs/library/ranking-corridor-module-registry.md` — реестр модулей, уже перенесенных в библиотеку.
- `docs/Examples/` — референсы и примеры, но не источник правил.

## Порядок источников правды

Для новых роликов порядок такой:

1. канон в `docs/canon/`
2. обзор workflow в `docs/workflow/ranking-corridor-workflow-implementation-plan.md`
3. текущий статус внедрения в `docs/workflow/ranking-corridor-v1-implementation-plan.md`
4. templates, registry и examples как вспомогательный слой

## Язык новой документации

Вся новая активная документация и новые project-артефакты должны вестись на русском языке.

На английском оставляются только технические сущности, которые нельзя безопасно переводить:

- код
- команды
- пути
- URL
- API
- названия пакетов
- ключи конфигурации
- `id` и `enum`-значения

## Что читать в разных ситуациях

- Если нужно понять сам жанр, открывай `docs/canon/ranking-corridor-format.md`.
- Если нужно понять, как ИИ должен вести проект, открывай `docs/canon/ranking-corridor-working-mode.md`.
- Если нужно понять текущий статус внедрения, открывай `docs/workflow/ranking-corridor-v1-implementation-plan.md`.
- Если нужно создать или проверить project-container, открывай `projects/README.md`.
