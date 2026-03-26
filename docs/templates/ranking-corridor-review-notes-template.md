# Шаблон review-notes

Сохраняется как `projects/<project-slug>/review-notes.md`.

## Проект

- Slug проекта:
- Человеческое название (опционально):
- Начато:
- Обновлено:

## Режиссерский план

- Цикл review:
- Проверяемый director-pass:
- Решение: `pending | approved | revise`
- Что подтверждено:
- Что нужно изменить:
- Можно ли переходить к build-plan: `yes | no`
- Подтверждающие комментарии:

## Предпросмотр

- Цикл review:
- Пакет предпросмотра:
- Решение: `approve | approve with changes | reject`
- Проверенный охват:
- Что подтверждено:
- Обещанные world-slot из `director-pass`:
- Реально реализованные world-slot:
- Проверенное покрытие сцен: `scene-1, scene-2, scene-3, scene-4`
- Результат director-pass-проверки: `ok | warning | fail`
- Director-pass-заметки: держится ли эскалация, живая ли вторичная жизнь, где есть просадка или перегруз
- Перетягивает ли вторичная жизнь внимание с героя: `no | slight | yes`
- Результат layout-проверки: `ok | warning | fail`
- Layout-заметки: где есть `layout-warning` или `layout-fail`
- Результат image-first policy-проверки: `ok | warning | fail | n/a`
- Image-first policy-заметки: доминирует ли media, ранг над media, защищена ли data-zone, нет ли lane-overlap
- Результат browser/Studio-проверки: `ok | warning | fail`
- Метод browser/Studio-проверки: `mcp-playwright | remotion-studio | built-in-browser`
- Результат console/runtime-проверки: `ok | warning | fail`
- Папка screenshot-артефактов:
- Visual checklist:
  - Hero / readability:
  - Image-first / media policy:
  - Ground / podium separation:
  - Camera / pacing:
  - Environment / secondary-life:
  - Director-pass match:
- Какие изменения обязательны:
- Можно ли идти дальше без повторного предпросмотра:
- Нужно ли обязательно повторить предпросмотр:
- Верификация или подтверждающие материалы:

## Финальное утверждение

- Цикл финального review:
- Статус: `final-approved | final-approved-with-notes | not-final`
- Проверенный build:
- Проверенный снимок данных:
- Заметки:
- Обязательные последующие действия:
- Блокирующие причины:

## Аудит библиотеки

- Дата аудита:
- Результат аудита: `no-promotion | auto-promotion-applied | checkpoint-needed`
- Покрытие существующей библиотекой:
- Проверенные категории:
- Категории без зрелых кандидатов:
- Обновления реестра:
- Допустимые `candidateType` и `proposedDecision` бери из `docs/canon/ranking-corridor-working-mode.md`.

| candidateId | candidateType | currentStatus | sourceLocation | reusableWhy | proposedDecision | targetPlacement | finalEvidence | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| example-module | candidate-type | project-local | src/... or projects/... | why it is reusable and not theme-specific | proposed-decision | src/... or docs/library/... or docs-only contract | where it proved itself in final project | docs touched | |

## Общие заметки

- ...
