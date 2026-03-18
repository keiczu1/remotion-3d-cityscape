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
- Обновления реестра:

| candidateId | currentStatus | proposedDecision | targetPlacement | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- |
| example-module | project-local | stay-project-local / keep-design-only / promote-to-library / checkpoint-needed | src/... or docs/library/... | docs touched | |

## Общие заметки

- ...
