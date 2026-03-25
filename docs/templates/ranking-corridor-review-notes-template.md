# Шаблон review-notes

Сохраняется как `projects/<project-slug>/review-notes.md`.

## Проект

- Slug проекта:
- Человеческое название (опционально):
- Начато:
- Обновлено:

## Предпросмотр

- Цикл review:
- Пакет предпросмотра:
- Решение: `approve | approve with changes | reject`
- Проверенный охват:
- Что подтверждено:
- Результат director-pass-проверки: `ok | warning | fail`
- Director-pass-заметки: держится ли эскалация, живая ли вторичная жизнь, где есть просадка или перегруз
- Перетягивает ли вторичная жизнь внимание с героя: `no | slight | yes`
- Результат layout-проверки: `ok | warning | fail`
- Layout-заметки: где есть `layout-warning` или `layout-fail`
- Результат browser/Studio-проверки: `ok | warning | fail`
- Метод browser/Studio-проверки: `mcp-playwright | remotion-studio | built-in-browser`
- Результат console/runtime-проверки: `ok | warning | fail`
- Папка screenshot-артефактов:
- Visual checklist:
  - Hero / readability:
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

| candidateId | candidateType | currentStatus | sourceLocation | reusableWhy | proposedDecision | targetPlacement | finalEvidence | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| example-module | camera preset / timing preset / reveal/effect module / hero/object family / background / ambient / secondary-life system / utility / helper | project-local | src/... or projects/... | why it is reusable and not theme-specific | stay-project-local / keep-design-only / promote-to-library / checkpoint-needed | src/... or docs/library/... or docs-only contract | where it proved itself in final project | docs touched | |

## Общие заметки

- ...
