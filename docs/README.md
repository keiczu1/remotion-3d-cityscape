# Документация Remotion

## Назначение

`docs/README.md` — главный вход в актуальную документацию репозитория.

Если нужно понять, как сейчас должен работать проект, сначала читай именно этот файл, а потом уже переходи к канону, шаблонам и skills.

## Активный контур

В активный owner-layer входят:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/canon/ranking-corridor-format.md`
4. `docs/canon/ranking-corridor-working-mode.md`
5. `docs/canon/remotion-project-rules.md`
6. `projects/README.md`
7. `docs/templates/`
8. `docs/library/`
9. `.agents/skills/`
10. `scripts/validate-ranking-build-plan.ts`

## Что читать по порядку

Если нужен рабочий контракт формата `ranking corridor`, используй такой порядок:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/canon/ranking-corridor-format.md`
4. `docs/canon/ranking-corridor-working-mode.md`
5. `docs/canon/remotion-project-rules.md`
6. `projects/README.md`

## Карта слоев

- `docs/canon/` — owner-level правила формата и workflow.
- `docs/templates/` — шаблоны project-артефактов.
- `docs/library/` — constructor-catalog, template-catalog и registry reusable-слоя.
- `docs/workflow/` — текущие implementation notes и verification notes; это не source-of-truth.
- `docs/plans.md` — короткая служебная заметка; это не source-of-truth.

## Дефолтный маршрут

Активный workflow только один:

`тема -> constructor / template selector -> launch-card -> build-plan -> preview-build -> preview-gate -> post-preview-build -> final approval`

Любые старые промежуточные creative-first этапы и дополнительные post-project шаги не входят в активный маршрут.

## Правило синхронизации

Если меняется workflow, шаблон артефакта, validator или reusable-layer, обновляй:

- канон;
- связанные шаблоны;
- skills;
- machine-check слой;
- эту карту документации.
