# Ranking Corridor: Обзор Рабочего Процесса И Переносимого Пакета

**Дата:** 2026-03-18

## Назначение

Этот файл описывает стабильный системный контур `ranking corridor`.

Он нужен, чтобы быстро понять:

- из каких частей состоит переносимый пакет;
- какой repo-session контракт поднимается первым;
- какой документ за что отвечает;
- как проект проходит путь от темы до финального статуса;
- где проходит граница между каноном, skills, project-container и библиотекой.

Этот файл не хранит оперативный статус внедрения `v1` и не дублирует детальные runtime-контракты.

Для текущего статуса внедрения использовать:

- `docs/workflow/ranking-corridor-v1-implementation-plan.md`

Для точного рабочего цикла, статусов и контрактов project-артефактов использовать:

- `docs/canon/ranking-corridor-working-mode.md`

Для точной структуры `projects/<project-slug>/` использовать:

- `projects/README.md`

## Что должен давать переносимый пакет

После `git clone` и открытия репозитория должно быть возможно:

1. Поднять `AGENTS.md` как первую точку входа.
2. Открыть `docs/README.md` как карту активной документации.
3. Дать тему одной фразой.
4. Получить сначала короткий `concept-pack`, а затем при необходимости один пакет вопросов.
5. После ответа получить и сохранить короткую `launch-card`.
6. После `director pass` собрать project-local `build-plan`.
7. Дойти до `preview-gate`, а не сразу до полного ролика.
8. После review построить полную композицию без обязательного экспорта финального медиафайла.
9. После финального статуса провести аудит библиотеки и обновить документацию.

Главная идея:

- знания о формате живут в Git;
- новый диалог не требует повторного длинного онбординга;
- workflow воспроизводим без опоры только на память предыдущего чата.

## Состав пакета

### Repo-session контракт

- `AGENTS.md`

### Канон

- `docs/canon/ranking-corridor-format.md`
- `docs/canon/ranking-corridor-working-mode.md`
- `docs/canon/remotion-project-rules.md`

### Workflow

- `docs/workflow/ranking-corridor-workflow-implementation-plan.md`
- `docs/workflow/ranking-corridor-v1-implementation-plan.md`

### Референсы

- `docs/Examples/Ranking-towers-reverse-prompt.md`
- `docs/Examples/Military.md`

### Skills

- `.agents/skills/ranking-corridor-launch/SKILL.md`
- `.agents/skills/ranking-corridor-production/SKILL.md`

### Шаблоны project-артефактов

- `docs/templates/ranking-corridor-launch-card-template.md`
- `docs/templates/ranking-corridor-build-plan-template.md`
- `docs/templates/ranking-corridor-asset-manifest-template.md`
- `docs/templates/ranking-corridor-review-notes-template.md`

### Реестр библиотеки

- `docs/library/ranking-corridor-module-registry.md`

### Project-container

- `projects/<project-slug>/`

## Роли документов

- `AGENTS.md` — быстрый session-контракт репозитория, дефолты работы и обязательные локальные skills.
- `docs/canon/ranking-corridor-format.md` — жанр, канон формата и допустимая вариативность.
- `docs/canon/ranking-corridor-working-mode.md` — единственный владелец runtime-процесса, review-статусов и контрактов артефактов.
- `docs/canon/remotion-project-rules.md` — технические инварианты проекта.
- Этот файл — стабильный обзор системы.
- `docs/workflow/ranking-corridor-v1-implementation-plan.md` — только текущий статус внедрения и следующий шаг.
- `projects/README.md` — единственный владелец структуры `projects/<project-slug>/`.
- `docs/Examples/` — референсы, но не правила.

## Высокоуровневый ход проекта

1. ИИ поднимает `AGENTS.md`.
2. ИИ открывает `docs/README.md`.
3. Пользователь дает тему одной фразой.
4. `ranking-corridor-launch` классифицирует тему, сначала делает `concept-pack` и при необходимости добавляет один пакет вопросов.
5. После ответа создается `projects/<project-slug>/launch-card.md`.
6. `ranking-corridor-production` поднимает project-container и `director-pass.md`.
7. После `director pass` создается `projects/<project-slug>/build-plan.md` и через него собирается `preview-build`.
8. Собираются данные, локальные ассеты и `asset-manifest`.
9. Делается `preview-gate`.
10. После решения по предпросмотру разблокируется `post-preview-build` и допускается полная сборка композиции.
11. После полной сборки композиции фиксируется финальный статус проекта.
12. Только после финального статуса запускается аудит библиотеки.
13. При необходимости обновляются registry, reusable-слой и связанные docs.

## Рост библиотеки

Библиотека растет только после финального проекта.

В библиотеку попадают только решения, которые:

- пережили полный рабочий цикл;
- получили финальный статус проекта;
- не слишком привязаны к одной теме;
- реально упрощают следующие ролики.

История локального решения живет в `review-notes.md`, а подтвержденный библиотечный результат — в `docs/library/ranking-corridor-module-registry.md`.

## Границы документа

Здесь не должны жить:

- точные перечисления статусов и enum-значений;
- подробный контракт `launch-card`, `asset-manifest` и `review-notes`;
- точная структура `projects/<project-slug>/`;
- оперативный статус внедрения `v1`.

Это сознательно вынесено в другие документы, чтобы не плодить дубли.
