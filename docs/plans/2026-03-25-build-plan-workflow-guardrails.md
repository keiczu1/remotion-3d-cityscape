# План: `build-plan` и файловый routing для production-цикла

## Цель

Усилить `ranking corridor` workflow так, чтобы ИИ:

- не терял фазу проекта после `concept-pack` и `launch-card`;
- не перепрыгивал от `director pass` сразу к полной сборке;
- декомпозировал реализацию на конкретные задачи;
- мог надежно продолжать работу по файловому состоянию проекта, а не по памяти чата.

## Границы

- Обновить канон рабочего цикла.
- Обновить `launch` и `production` skills.
- Добавить project-local артефакт `build-plan.md`.
- Добавить шаблон `docs/templates/ranking-corridor-build-plan-template.md`.
- Обновить карту документации и структуру `projects/<project-slug>/`.

## Этап 1. Закрепить файловую точку входа launch-этапа

- Файлы:
  - `.agents/skills/ranking-corridor-launch/SKILL.md`
  - `.agents/skills/ranking-corridor-launch/agents/openai.yaml`
- Что меняется:
  - после первого содержательного ответа пользователя `launch-card` материализуется в `projects/<project-slug>/launch-card.md`;
  - launch-этап заканчивается не только сообщением в чате, но и файловым контрактом проекта.
- Критерий готовности:
  - `launch-card.md` становится обязательным результатом launch-этапа;
  - skill по-прежнему останавливается до production.

## Этап 2. Встроить `build-plan` в production-цикл

- Файлы:
  - `docs/canon/ranking-corridor-working-mode.md`
  - `.agents/skills/ranking-corridor-production/SKILL.md`
  - `.agents/skills/ranking-corridor-production/agents/openai.yaml`
- Что меняется:
  - между `director pass` и `preview-gate` появляется обязательный `projects/<project-slug>/build-plan.md`;
  - реализация делится на `preview-build` и `post-preview-build`;
  - routing идет по файловому состоянию и статусам внутри project-артефактов.
- Критерий готовности:
  - full build нельзя начать до допустимого решения по `preview-gate`;
  - агент умеет продолжать работу с первой незавершенной задачи.

## Этап 3. Добавить шаблон и обновить структуру project-container

- Файлы:
  - `docs/templates/ranking-corridor-build-plan-template.md`
  - `docs/README.md`
  - `projects/README.md`
- Что меняется:
  - появляется стабильный формат `build-plan.md`;
  - карта документации показывает новый шаблон;
  - `projects/<project-slug>/build-plan.md` становится частью production-контейнера.
- Критерий готовности:
  - ИИ больше не изобретает формат `build-plan` заново;
  - структура проекта и канон не расходятся.

## Проверки

- Проверить поиском, что `build-plan` присутствует в каноне, `production` skill и шаблонах.
- Проверить, что `launch` skill явно материализует `launch-card.md`.
- Проверить, что `production` skill содержит:
  - `Step 0` для file-state routing;
  - правило `preview-build` -> `preview-gate` -> `post-preview-build`;
  - правило возобновления из частично выполненного `build-plan`.
- Проверить, что `projects/README.md` и `docs/README.md` знают про новый артефакт.
