# Проекты

## Назначение

`projects/` хранит project-container для каждого отдельного ролика формата `ranking corridor`.

Базовый принцип:

- один ролик = одна папка `projects/<project-slug>/`

Это позволяет:

- работать в одном репозитории и одном окне IDE;
- не смешивать канон и рабочие артефакты конкретного ролика;
- держать историю данных, предпросмотра и решений рядом.

Режим по умолчанию:

- отдельный `git worktree` или отдельный репозиторий для нового ролика не нужен;
- изоляция по умолчанию решается внутри текущего репозитория через `projects/<project-slug>/`.

## Формат `project-slug`

Рекомендуемый формат:

- `YYYY-MM-DD-short-topic-slug`

Пример:

- `projects/2026-03-17-best-selling-games-2025/`

Полное человекочитаемое название ролика лучше хранить внутри project-артефактов, а не в имени папки.

## Минимальная структура `v1`

Обязательный минимум для launch-only контейнера:

- `projects/<project-slug>/launch-card.md`

Для нового режима `library-only-constructor-v1` рекомендуется materialize-ить вместе с `launch-card.md` и skeleton-файл:

- `projects/<project-slug>/review-notes.md`

Обязательный минимум для production-цикла к моменту первого `preview-gate`
production-цикл наследует launch-only минимум и к первому `preview-gate` дополнительно требует:

- `projects/<project-slug>/build-plan.md`
- `projects/<project-slug>/asset-manifest.md`
- `projects/<project-slug>/review-notes.md`
- `projects/<project-slug>/data/`
- `projects/<project-slug>/exports/`

Опционально:

- `projects/<project-slug>/README.md`

`README.md` проекта нужен только если проект живет дольше одной короткой сессии, требует handoff или накопил длинную историю решений.

`build-plan.md` обязателен после `launch-card.md` и до `preview-gate`. Это project-local исполнительный чеклист, который разносит `preview-build` и `post-preview-build` и позволяет продолжать работу по файловому состоянию проекта.

Практически это означает:

- при первом materialize production-container можно создать стартовый минимум без `build-plan.md`;
- для нового режима `build-plan.md` materialize-ится сразу после утверждения `launch-card.md`;
`build-plan.md` materialize-ится сразу после `launch-card.md`. `asset-manifest.md`, `data/` и `exports/` не нужно материализовать заранее на launch-этапе: они становятся обязательной частью production-контейнера к первому `preview-gate`. `review-notes.md` materialize-ится как skeleton уже вместе с `launch-card.md`.

## Роль файлов

- `launch-card.md` — короткий контракт запуска ролика.
- `build-plan.md` — project-local план реализации и декомпозиция задач между `launch-card.md` и production-сборкой.
- `asset-manifest.md` — рабочий снимок данных, источников и локальных ассетов для preview/full цикла.
- `review-notes.md` — единый owner-файл для `Preview gate` и `Final approval`.
- `data/` — локальные данные, research-notes и source snapshots.
- `exports/` — кадры, фрагменты и другие материалы для проверки.

Если в проекте есть `README.md`, он работает как короткая точка входа и не должен дублировать `launch-card.md`.

## Границы этого файла

Этот файл владеет только структурой `projects/<project-slug>/`.

Точный рабочий цикл, статусы и контракты project-артефактов описаны в:

- `docs/canon/ranking-corridor-working-mode.md`
