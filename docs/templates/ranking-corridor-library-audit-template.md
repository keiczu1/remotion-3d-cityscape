# Шаблон prompt: final-approved -> library audit

## Назначение

Этот шаблон нужен для post-final этапа, когда проект уже получил `final-approved` или `final-approved-with-notes` и нужно провести аудит библиотеки.

Он помогает не тащить в reusable-слой все подряд и не делать promotion по памяти чата.

Результат этого шаблона:

- список реально проверенных кандидатов на promotion;
- явная фиксация категорий, где кандидатов нет;
- решение по каждому кандидату:
  - `stay-project-local`
  - `keep-design-only`
  - `promote-to-library`
  - `checkpoint-needed`
- применение только очевидных promotion-кандидатов.

## Практический контур

Рекомендуемый путь такой:

1. Проект получает `final-approved` или `final-approved-with-notes`.
2. ИИ делает audit-first проход.
3. ИИ показывает кандидатов и решения по ним.
4. Только после этого применяет promotion для действительно очевидных случаев.
5. Все спорное остается как `checkpoint-needed`.

## Prompt

```md
Проект уже получил `final-approved` или `final-approved-with-notes`.

Проведи аудит библиотеки по этому проекту.

Рабочий режим:
- сначала сделай audit-first проход;
- не пытайся обязательно найти кандидата в каждой категории;
- если в категории нет зрелого кандидата, так и напиши;
- не делай promotion молча до списка кандидатов и решений;
- не тащи в библиотеку тему-специфичный декор, одноразовые трюки и решения без ясного контракта.

Проверь отдельно категории:
- `camera preset`
- `timing preset`
- `reveal/effect module`
- `hero/object family`
- `background / ambient / secondary-life system`
- `utility / helper`

Для каждого кандидата укажи:
- что это за сущность;
- где она живет в проекте;
- чем подтверждена в финальном ролике;
- почему это reusable, а не тема-специфичный декор;
- какое решение предлагаешь:
  - `stay-project-local`
  - `keep-design-only`
  - `promote-to-library`
  - `checkpoint-needed`

Отдельное правило:
- для `camera preset` и `timing preset` promotion может быть не только кодовым переносом, но и registry/contract-level решением, если новый library-модуль не нужен.

После списка кандидатов:
- внеси только очевидные кандидаты со статусом `promote-to-library`;
- все спорное оставь как `checkpoint-needed`;
- обнови `projects/<project-slug>/review-notes.md`;
- обнови связанные docs и registry вместе с promotion.
```
