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

Обязательный минимум для production-этапа
production-этап наследует launch-only минимум и дополнительно требует:

- `projects/<project-slug>/director-pass.md`
- `projects/<project-slug>/asset-manifest.md`
- `projects/<project-slug>/review-notes.md`
- `projects/<project-slug>/data/`
- `projects/<project-slug>/exports/`

Опционально:

- `projects/<project-slug>/README.md`

`README.md` проекта нужен только если проект живет дольше одной короткой сессии, требует handoff или накопил длинную историю решений.

`director-pass.md` обязателен после утверждения `launch-card`, если проект дошел до production-этапа и готовится к `preview-gate`.

`asset-manifest.md`, `review-notes.md`, `data/` и `exports/` не нужно материализовать на launch-этапе заранее. Они становятся обязательной частью контейнера, когда проект переходит в production-цикл.

## Роль файлов

- `launch-card.md` — короткий контракт запуска ролика.
- `director-pass.md` — подробный режиссерский проход и основной этап content enrichment между `launch-card` и `preview-gate`.
- `asset-manifest.md` — снимок данных, источников и локальных ассетов.
- `review-notes.md` — единый файл для `Предпросмотра`, `Финального утверждения` и `Аудита библиотеки`.
- `data/` — локальные данные, research-notes и source snapshots.
- `exports/` — кадры, фрагменты и другие материалы для проверки.

Если в проекте есть `README.md`, он работает как короткая точка входа и не должен дублировать `launch-card.md`.

## Границы этого файла

Этот файл владеет только структурой `projects/<project-slug>/`.

Точный рабочий цикл, статусы и контракты project-артефактов описаны в:

- `docs/canon/ranking-corridor-working-mode.md`
