# Ranking Corridor: Обзор Рабочего Процесса И Переносимого Пакета

**Дата:** 2026-03-18

## Назначение

Этот файл описывает стабильный системный контур `ranking corridor`.

Он нужен, чтобы быстро понять:

- из каких частей состоит переносимый пакет;
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

1. Дать тему одной фразой.
2. Получить один пакет вопросов.
3. После ответа получить короткую `launch-card`.
4. Дойти до `preview-gate`, а не сразу до полного ролика.
5. После review построить полный проект.
6. После финального статуса провести аудит библиотеки и обновить документацию.

Главная идея:

- знания о формате живут в Git;
- новый диалог не требует повторного длинного онбординга;
- workflow воспроизводим без опоры только на память предыдущего чата.

## Состав пакета

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
- `docs/templates/ranking-corridor-asset-manifest-template.md`
- `docs/templates/ranking-corridor-review-notes-template.md`

### Реестр библиотеки

- `docs/library/ranking-corridor-module-registry.md`

### Project-container

- `projects/<project-slug>/`

## Роли документов

- `docs/canon/ranking-corridor-format.md` — жанр, канон формата и допустимая вариативность.
- `docs/canon/ranking-corridor-working-mode.md` — единственный владелец runtime-процесса, review-статусов и контрактов артефактов.
- `docs/canon/remotion-project-rules.md` — технические инварианты проекта.
- Этот файл — стабильный обзор системы.
- `docs/workflow/ranking-corridor-v1-implementation-plan.md` — только текущий статус внедрения и следующий шаг.
- `projects/README.md` — единственный владелец структуры `projects/<project-slug>/`.
- `docs/Examples/` — референсы, но не правила.

## Высокоуровневый ход проекта

1. Пользователь дает тему одной фразой.
2. `ranking-corridor-launch` классифицирует тему и задает один пакет вопросов.
3. После ответа собирается короткая `launch-card`.
4. `ranking-corridor-production` поднимает project-container и рабочие артефакты.
5. Собираются данные, локальные ассеты и `asset-manifest`.
6. Делается `preview-gate`.
7. После решения по предпросмотру допускается полный build.
8. После полного build фиксируется финальный статус проекта.
9. Только после финального статуса запускается аудит библиотеки.
10. При необходимости обновляются registry, reusable-слой и связанные docs.

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
