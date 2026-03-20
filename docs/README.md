# Документация

## Точка входа

Эта папка хранит активную документацию по `ranking corridor`.

Официальная первая точка входа в репозиторий:

- `AGENTS.md`

Этот файл читается сразу после `AGENTS.md` и работает как карта владельцев документации.

Если нужно быстро войти в контекст после `AGENTS.md`, читай документы в таком порядке:

1. `docs/canon/ranking-corridor-format.md`
2. `docs/canon/ranking-corridor-working-mode.md`
3. `docs/canon/remotion-project-rules.md`
4. `projects/README.md`

## Кто чем владеет

- `AGENTS.md` — быстрый session-контракт репозитория, дефолты работы и обязательные repo-local skills.
- `docs/canon/ranking-corridor-format.md` — канон формата ролика.
- `docs/canon/ranking-corridor-working-mode.md` — единственный владелец рабочего цикла, статусов и контрактов project-артефактов.
- `docs/canon/remotion-project-rules.md` — технические правила и инварианты Remotion-проекта.
- `projects/README.md` — единственный владелец структуры `projects/<project-slug>/`.
- `docs/templates/` — шаблоны project-артефактов.
- `docs/templates/ranking-corridor-theme-to-concept-pack-template.md` — дефолтный helper-шаблон prompt для первого chat-first `concept-pack` по теме.
- `docs/templates/ranking-corridor-theme-to-reverse-prompt-template.md` — более глубокий helper-шаблон для `reverse-style brief` уже после выбора направления.
- `docs/library/ranking-corridor-module-registry.md` — реестр модулей, уже перенесенных в библиотеку.
- `docs/Examples/` — референсы и примеры, но не источник правил.

## Порядок источников правды

Для новых роликов порядок такой:

1. `AGENTS.md` как repo-session контракт
2. этот `docs/README.md` как карта владельцев документации
3. канон в `docs/canon/`
4. `projects/README.md` как владелец структуры project-container
5. templates, registry и examples как вспомогательный слой

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
- Если нужно создать или проверить project-container, открывай `projects/README.md`.
- Если нужно сначала превратить короткую тему в понятные creative-направления, открывай `docs/templates/ranking-corridor-theme-to-concept-pack-template.md`.
- Если после выбора направления нужен более глубокий `design-only` brief, открывай `docs/templates/ranking-corridor-theme-to-reverse-prompt-template.md`.
