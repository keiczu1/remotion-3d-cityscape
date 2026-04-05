# Шаблон review-notes

Сохраняется как `projects/<project-slug>/review-notes.md`.

## Назначение

Этот шаблон задает owner-файл решений для единственного активного режима.

Он обязан содержать только:

- `Preview gate`
- `Final approval`

## Шаблон

```md
# Review Notes

## Проект
- Slug проекта:
- Человеческое название (опционально):
- Workflow mode: `library-only-constructor-v1`
- Начато:
- Обновлено:

## Preview gate
- Цикл review:
- Проверяемый preview-пакет:
- Решение: `approve | approve with changes | reject`
- Проверенный охват:
- Что подтверждено:
- Проверенные world-slot:
- Проверенное покрытие сцен: `scene-1, scene-2, scene-3, scene-4`
- Результат layout-проверки: `ok | warning | fail`
- Layout-заметки:
- Результат image-first policy-проверки: `ok | warning | fail | n/a`
- Image-first policy-заметки:
- Результат browser/Studio-проверки: `ok | warning | fail`
- Метод browser/Studio-проверки: `mcp-playwright | remotion-studio | built-in-browser`
- Результат console/runtime-проверки: `ok | warning | fail`
- Папка screenshot-артефактов:
- Какие изменения обязательны:
- Можно ли идти дальше без повторного предпросмотра:
- Нужно ли обязательно повторить предпросмотр:
- Верификация или подтверждающие материалы:

## Final approval
- Цикл финального review:
- Статус: `final-approved | final-approved-with-notes | not-final`
- Проверенный build:
- Проверенный снимок данных:
- Заметки:
- Обязательные последующие действия:
- Блокирующие причины:

## Общие заметки
- ...
```

## Комментарии

- Skeleton `review-notes.md` materialize-ится вместе с `launch-card.md`.
- `Preview gate` и `Final approval` являются human-readable секциями, а machine-step значения в `build-plan` остаются `preview-gate` и `final-approval`.
