# Документация

## Точка входа

Эта папка хранит активную документацию и рабочие материалы по `ranking corridor`.

Официальная первая точка входа в репозиторий:

- `AGENTS.md`

Этот файл читается сразу после `AGENTS.md` и работает как карта владельцев документации.

## Активный контур

Если нужно быстро войти в актуальный контекст после `AGENTS.md`, читай документы в таком порядке:

1. `docs/canon/ranking-corridor-format.md`
2. `docs/canon/ranking-corridor-working-mode.md`
3. `docs/canon/remotion-project-rules.md`
4. `projects/README.md`

Именно этот слой считается активным source-of-truth для рабочих решений в репозитории.

## Кто чем владеет

- `AGENTS.md` — быстрый session-контракт репозитория, дефолты работы и обязательные repo-local skills.
- `docs/canon/ranking-corridor-format.md` — канон формата ролика.
- `docs/canon/ranking-corridor-working-mode.md` — единственный владелец рабочего цикла, статусов и контрактов project-артефактов.
- `docs/canon/remotion-project-rules.md` — технические правила и инварианты Remotion-проекта.
- `projects/README.md` — единственный владелец структуры `projects/<project-slug>/`.
- `docs/templates/` — шаблоны project-артефактов.
- `docs/templates/ranking-corridor-theme-to-concept-pack-template.md` — дефолтный helper-шаблон prompt для первого chat-first `concept-pack` по теме: `4` режима опоры героя, hero-first выбор башни/стелы и `ANSI`-макет с раскладкой данных.
- `docs/templates/ranking-corridor-theme-to-reverse-prompt-template.md` — более глубокий helper-шаблон для `reverse-style brief` уже после выбора направления, когда нужно развить выбранный hero/layout без перехода к коду.
- `docs/templates/ranking-corridor-director-pass-template.md` — шаблон короткого режиссерского прохода между `launch-card` и `preview-gate`.
- `docs/templates/ranking-corridor-build-plan-template.md` — шаблон project-local декомпозиции реализации между `director-pass.md` и `preview-gate`.
- `docs/templates/ranking-corridor-library-audit-template.md` — шаблон post-final prompt для аудита библиотеки и promotion-кандидатов.
- `docs/library/ranking-corridor-module-registry.md` — реестр модулей, уже перенесенных в библиотеку.
- `docs/Examples/` — референсы и примеры, но не источник правил.
- `docs/plans.md`, `docs/plans/`, `docs/workflow/` — рабочие планы изменений, аудиты и implementation-notes; это не источник правил поверх канона.

## Порядок источников правды

Для новых роликов порядок такой:

1. `AGENTS.md` как repo-session контракт
2. этот `docs/README.md` как карта владельцев документации
3. канон в `docs/canon/`
4. `projects/README.md` как владелец структуры project-container
5. templates, registry и examples как вспомогательный слой

## Язык новой документации

Правило языка задается в `AGENTS.md`.

Короткая версия:

- новая активная документация и project-артефакты ведутся на русском языке;
- технические сущности, которые нельзя безопасно переводить, остаются на английском.

## Рабочий и исторический слой

Не считай автоматическим source-of-truth такие папки и файлы:

- `docs/plans.md`
- `docs/plans/`
- `docs/workflow/`
- `docs/Examples/`

Их роль:

- хранить рабочие планы внедрения, аудиты, change-notes и референсы;
- помогать понять, почему менялся workflow;
- не подменять собой канон, skills, шаблоны и validator-контракты.

Если рабочий план уже реализован, итоговые правила должны жить не в нем, а в активном контуре выше.

## Что читать в разных ситуациях

- Если нужно понять сам жанр, открывай `docs/canon/ranking-corridor-format.md`.
- Если нужно понять, как ИИ должен вести проект, открывай `docs/canon/ranking-corridor-working-mode.md`.
- Если нужно создать или проверить project-container, открывай `projects/README.md`.
- Если нужно сначала превратить короткую тему в понятные creative-направления и выбрать shell/layout героя, открывай `docs/templates/ranking-corridor-theme-to-concept-pack-template.md`.
- Если после выбора направления нужен более глубокий `design-only` brief уже по выбранному hero/layout, открывай `docs/templates/ranking-corridor-theme-to-reverse-prompt-template.md`.
- Если после `launch-card` нужно усилить сцены, вторичную жизнь и драматургию перед `preview-gate`, открывай `docs/templates/ranking-corridor-director-pass-template.md`.
- Если после `director-pass.md` нужно разложить реализацию на проверяемые production-задачи и уметь возобновлять проект по файлам, открывай `docs/templates/ranking-corridor-build-plan-template.md`.
- Если проект уже финально утвержден и нужно провести аудит библиотеки, открывай `docs/templates/ranking-corridor-library-audit-template.md`.
- Если идет работа над самим workflow, дедупликацией документации или снижением контекста, используй `docs/workflow/` как рабочий слой, но не как замену канону.
