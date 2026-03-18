---
name: ranking-corridor-production
description: "Веди `ranking corridor` проект после `launch-card`: создавай и обновляй project-артефакты, собирай данные и ассеты, делай `preview-gate`, проводи полную сборку только после review предпросмотра, фиксируй финальное утверждение и запускай аудит библиотеки только после финального статуса. Используй, когда у проекта уже есть `launch-card` или готовый project-container, и нужно продолжить рабочий цикл производства до preview, финальной сборки и постфинальной донастройки."
---

# Ranking Corridor Production

Веди `ranking corridor` проект от `launch-card` до финального статуса и аудита библиотеки, соблюдая все stop-condition из канона.

Не пропускай `preview-gate`, не запускай аудит библиотеки раньше `final-approved` или `final-approved-with-notes` и не придумывай свои форматы проектных артефактов.

## Сначала подними рабочий контекст

Перед работой используй такие источники:

- `docs/README.md`
- `docs/canon/ranking-corridor-format.md`
- `docs/canon/ranking-corridor-working-mode.md`
- `docs/canon/remotion-project-rules.md`
- `docs/library/ranking-corridor-module-registry.md`
- `docs/templates/ranking-corridor-launch-card-template.md`
- `docs/templates/ranking-corridor-asset-manifest-template.md`
- `docs/templates/ranking-corridor-review-notes-template.md`
- `projects/README.md`

Когда начинаешь писать или менять Remotion-код, также учитывай локальный skill `remotion-best-practices` и опирайся на текущий `src/compositions/ranking-towers/` как на reference implementation, а не как на жесткий закон.

## Работай как рабочий процесс с тремя состояниями

### Состояние 1. До review предпросмотра

Если есть `launch-card`, но нет подтвержденного результата review предпросмотра:

- создай или обнови project-артефакты;
- собери data snapshot и `asset-manifest`;
- сделай `preview-gate`;
- обнови `review-notes.md` в секции `Предпросмотр`;
- остановись и жди решения админа.

### Состояние 2. После review предпросмотра, но до финального утверждения

Если review предпросмотра уже дал `approve` или `approve with changes` и нет блокера на re-preview:

- доведи проект до full build;
- сделай verification;
- обнови секцию `Финальное утверждение` в `review-notes.md`;
- остановись, если статус еще не финальный.

### Состояние 3. После финального утверждения

Если проект получил `final-approved` или `final-approved-with-notes`:

- проведи аудит библиотеки;
- если promotion очевиден, обнови registry и связанные docs;
- если promotion спорный, зафиксируй checkpoint и не делай перенос молча.

## Шаг 1. Нормализуй входы

Перед активной работой проверь, что у тебя есть:

- тема и `launch-card`;
- `project-slug` или возможность предложить его;
- понимание текущего состояния review;
- доступ к проектному контейнеру или право его создать.

Если `project-slug` еще не выбран, предложи или выбери его по канону `YYYY-MM-DD-short-topic-slug`.

Если project-container отсутствует, создай минимум:

- `projects/<project-slug>/launch-card.md`
- `projects/<project-slug>/asset-manifest.md`
- `projects/<project-slug>/review-notes.md`
- `projects/<project-slug>/data/`
- `projects/<project-slug>/exports/`

Опционально, если проект уже длинный, требует handoff или пережил несколько review-циклов:

- `projects/<project-slug>/README.md`

Используй только шаблоны из `docs/templates/`.

Если `launch-card.md`, `asset-manifest.md` или `review-notes.md` уже существуют, обновляй их, а не пересоздавай.

## Шаг 2. Собери data snapshot и `asset-manifest`

Делай это до preview-gate.

Обязательный минимум:

- зафиксируй источники данных;
- зафиксируй дату проверки данных;
- сохрани локальную рабочую версию dataset в `projects/<project-slug>/data/`;
- собери локальные ассеты;
- сохрани исходные URL и статусы ассетов в `asset-manifest.md`.

Пути по умолчанию:

- dataset snapshot: `projects/<project-slug>/data/`
- публичные ассеты: `public/ranking-corridor/<project-slug>/`
- preview exports: `projects/<project-slug>/exports/preview/`

Не считай `asset-manifest` формальностью. Это рабочий контракт воспроизводимости.

## Шаг 3. Сделай `preview-gate`

До полного build ты обязан собрать preview-пакет.

Ориентируйся на канон:

- репрезентативный набор примерно на `5` объектов по всей шкале;
- реальный hero-модуль;
- реальные данные;
- реальные локальные ассеты хотя бы для preview-набора;
- intro fragment;
- fragment с соседними объектами;
- fragment ближе к лидерам;
- still или close-up по читаемости;
- payoff fragment.

Зафиксируй preview-состояние в `review-notes.md`:

- какой пакет показан;
- что именно проверяется;
- решение админа:
  - `approve`
  - `approve with changes`
  - `reject`
- какие изменения нужны;
- нужен ли повторный preview.

После этого шага:

- если `reject` — не иди в full build;
- если `approve with changes` и правки затрагивают hero-модуль, фон, pacing, камеру или способ подачи контента — сначала обнови preview;
- если `approve with changes` касается мелких текстовых или data-правок без смены визуального языка — можно продолжать, но зафиксируй это в `review-notes.md`;
- если `approve` — переходи дальше.

## Шаг 4. Делай full build только после review предпросмотра

Только после допустимого результата review предпросмотра:

- достраивай полный dataset pass;
- достраивай весь corridor;
- собирай полный main pass;
- доводи payoff и polishing;
- поддерживай канон `image-first`, если не зафиксирован осознанный особый случай.

Когда начинается реальный build сцены, можно создавать и обновлять:

- `src/compositions/<project-slug>/`
- `public/ranking-corridor/<project-slug>/`

Не уноси решения в переиспользуемый слой на этом этапе.

## Шаг 5. Сделай verification и `Финальное утверждение`

Перед любым заявлением о готовности:

- пройди техническую проверку по `docs/canon/remotion-project-rules.md`;
- проверь математику сцены и duration;
- проверь читаемость;
- проверь, что сборка и базовые инженерные инварианты не сломаны.

Затем обнови секцию `Финальное утверждение` в `review-notes.md` с одним из статусов:

- `final-approved`
- `final-approved-with-notes`
- `not-final`

Если статус `not-final`, не запускай аудит библиотеки.

## Шаг 6. Запусти аудит библиотеки только после финального статуса

После `final-approved` или `final-approved-with-notes`:

- пройди по новым решениям проекта;
- отдели `project-local` от реально переиспользуемых кандидатов;
- обнови секцию `Аудит библиотеки` в `review-notes.md` и зафиксируй общий результат:
  - `no-promotion`
  - `auto-promotion-applied`
  - `checkpoint-needed`
- если promotion очевиден, обнови `docs/library/ranking-corridor-module-registry.md`;
- если promotion меняет канон, обнови и канонические docs.

Для каждого кандидата зафиксируй одно решение:

- `stay-project-local`
- `keep-design-only`
- `promote-to-library`
- `checkpoint-needed`

Не добавляй в библиотеку:

- одноразовый декоративный ход;
- тему-специфичный стиль;
- решение, не пережившее финальный проект;
- модуль без ясного контракта.

## Жесткие stop-condition

Никогда не делай:

- full build до review предпросмотра;
- аудит библиотеки до финального статуса;
- promotion в библиотеку, если решение спорное и требует checkpoint;
- молчаливое изменение канона без обновления docs.

## Быстрая самопроверка перед завершением

Перед финальным ответом проверь:

- project-артефакты созданы или обновлены по шаблонам;
- `asset-manifest.md` содержит реальные локальные пути и source URL;
- `review-notes.md` отражает текущее состояние проекта;
- review предпросмотра или финальный статус действительно зафиксированы;
- ты не перепрыгнул через `preview-gate`;
- аудит библиотеки не запущен раньше времени;
- если менялся код, есть свежая верификация.
