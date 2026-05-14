# Документация Remotion

## Назначение

`docs/README.md` — главный вход в актуальную документацию репозитория.

Если нужно понять, как сейчас должен работать проект, сначала читай именно этот файл, а потом уже переходи к канону и библиотеке.

## Активный контур

В активный owner-layer входят:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/canon/ranking-corridor-format.md`
4. `docs/canon/remotion-project-rules.md`
5. `projects/README.md`
6. `docs/library/`
7. `.agents/skills/`
8. `scripts/scaffold-ranking-project-from-template.ts`

## Что читать по порядку

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/canon/ranking-corridor-format.md`
4. `docs/canon/remotion-project-rules.md`
5. `projects/README.md`

## Карта слоев

- `docs/canon/` — owner-level правила формата.
- `docs/library/` — constructor-catalog, template-catalog и registry reusable-слоя.
- `scripts/scaffold-ranking-project-from-template.ts` — клонирование шаблона в новый проект.
- `scripts/validate-ranking-catalog.ts` — валидация каталога.
- `scripts/validate-ranking-data.ts` — валидация данных проекта.

## Дефолтный маршрут

`тема -> выбор шаблона -> scaffold -> замена данных -> адаптация -> проверка в Studio`

## Правило синхронизации

Если меняется шаблон, каталог или reusable-layer, обновляй:

- канон;
- связанные каталоги;
- skills;
- эту карту документации.
