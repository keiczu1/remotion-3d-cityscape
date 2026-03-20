---
name: ranking-corridor-production
description: "Веди `ranking corridor` проект после `launch-card`: создавай и обновляй project-артефакты, делай короткий `director pass`, собирай данные и ассеты, проходи `preview-gate`, проводи полную сборку только после review предпросмотра, фиксируй финальное утверждение и запускай аудит библиотеки только после финального статуса. Используй, когда у проекта уже есть `launch-card` или готовый project-container и нужно продолжить рабочий цикл производства."
---

# Ranking Corridor Production

Веди `ranking corridor` проект от `launch-card` до финального статуса и аудита библиотеки, соблюдая все stop-condition из канона.

Не пропускай `preview-gate`, не запускай аудит библиотеки раньше `final-approved` или `final-approved-with-notes` и не придумывай свои форматы проектных артефактов.

## Сначала подними рабочий контекст

Перед работой используй такие источники:

- `AGENTS.md`
- `docs/README.md`
- `docs/canon/ranking-corridor-format.md`
- `docs/canon/ranking-corridor-working-mode.md`
- `docs/canon/remotion-project-rules.md`
- `docs/library/ranking-corridor-module-registry.md`
- `docs/templates/ranking-corridor-launch-card-template.md`
- `docs/templates/ranking-corridor-director-pass-template.md`
- `docs/templates/ranking-corridor-asset-manifest-template.md`
- `docs/templates/ranking-corridor-library-audit-template.md`
- `docs/templates/ranking-corridor-review-notes-template.md`
- `projects/README.md`

Когда начинаешь писать или менять Remotion-код, также учитывай локальный skill `remotion-best-practices` и опирайся на текущий `src/compositions/ranking-towers/` как на reference implementation, а не как на жесткий закон.

## Работай как рабочий процесс с тремя состояниями

### Состояние 1. До review предпросмотра

Если есть `launch-card`, но нет подтвержденного результата review предпросмотра:

- создай или обнови project-артефакты;
- сделай `director pass`;
- собери data snapshot и `asset-manifest`;
- сделай `preview-gate`;
- обнови `review-notes.md` в секции `Предпросмотр`;
- остановись и жди решения админа.

### Состояние 2. После review предпросмотра, но до финального утверждения

Если review предпросмотра уже дал `approve` или `approve with changes` и нет блокера на re-preview:

- доведи проект до полной сборки композиции;
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
- `projects/<project-slug>/director-pass.md`
- `projects/<project-slug>/asset-manifest.md`
- `projects/<project-slug>/review-notes.md`
- `projects/<project-slug>/data/`
- `projects/<project-slug>/exports/`

Опционально, если по правилам из `projects/README.md` проекту уже нужен отдельный входной файл:

- `projects/<project-slug>/README.md`

Используй только шаблоны из `docs/templates/`.

Если `launch-card.md`, `director-pass.md`, `asset-manifest.md` или `review-notes.md` уже существуют, обновляй их, а не пересоздавай.

## Шаг 2. Сделай `director pass`

Делай это после `launch-card` и до `preview-gate`.

Опирайся на:

- `docs/canon/ranking-corridor-working-mode.md`
- `docs/templates/ranking-corridor-director-pass-template.md`

Что обязательно:

- не пересобирай ролик заново и не спорь с уже утвержденным creative-направлением без сильной причины;
- зафиксируй, что остается стабильным из `launch-card`;
- раздели ролик на `4-6` сцен;
- отдельно продумай систему вторичной жизни;
- покажи, как вторичная жизнь и мир эволюционируют от начала к финалу;
- для каждой сцены объясни, чем изменение удерживает интерес и усиливает напряжение;
- явно назови риски перегруза.

Сохрани результат в:

- `projects/<project-slug>/director-pass.md`

Не меняй через `director pass` hero-модуль, базовую камеру или базовый ритм, зафиксированные в `launch-card`.

Если у тебя появляется сильная идея такого изменения, не внедряй ее молча: пометь ее только как `design-only` заметку и не считай новой правдой проекта.

## Шаг 3. Собери data snapshot и `asset-manifest`

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

## Шаг 4. Сделай `preview-gate`

До полной сборки композиции ты обязан собрать preview-пакет.

Ориентируйся на канон:

- репрезентативный набор примерно на `5` объектов по всей шкале;
- реальный hero-модуль;
- примененный `director pass`;
- реальные данные;
- реальные локальные ассеты хотя бы для preview-набора;
- короткий вступительный фрагмент;
- фрагмент с соседними объектами;
- фрагмент ближе к лидерам;
- стоп-кадр или крупный план по читаемости;
- отдельный director-pass-проход: ранняя сцена, середина ролика и финальная треть должны отличаться по ощущению, а вторичная жизнь не должна проседать;
- отдельный layout-pass на сложных случаях: длинные названия, крупные числа, широкие логотипы, плотные соседние объекты и разные дистанции камеры;
- короткий фрагмент payoff.

Зафиксируй preview-состояние в `review-notes.md`:

- какой пакет показан;
- что именно проверяется;
- как сработал `director pass` и держится ли вторичная жизнь;
- не начинает ли вторичная жизнь перетягивать внимание с героя;
- держится ли укладка данных на сложных случаях и где есть `layout-warning` или `layout-fail`;
- решение админа:
  - `approve`
  - `approve with changes`
  - `reject`
- какие изменения нужны;
- нужен ли повторный preview.

После этого шага:

- если `reject` — не иди в полную сборку композиции;
- если `approve with changes` и правки затрагивают hero-модуль, укладку данных, `director pass`, вторичную жизнь, фон, pacing, камеру или способ подачи контента — сначала обнови preview;
- если `approve with changes` касается мелких текстовых или data-правок без смены визуального языка — можно продолжать, но зафиксируй это в `review-notes.md`;
- если `approve` — переходи дальше.

## Шаг 5. Делай полную сборку композиции только после review предпросмотра

Только после допустимого результата review предпросмотра:

- достраивай полный dataset pass;
- достраивай весь corridor;
- собирай полный main pass;
- доводи payoff и polishing;
- поддерживай канон `image-first`, если не зафиксирован осознанный особый случай.

Под полной сборкой композиции здесь понимается:

- полностью собранная Remotion-композиция;
- подключенные локальные данные и локальные ассеты;
- пройденная техническая проверка.

Это не означает автоматический экспорт `.mp4`, `.mov` или другого финального медиафайла. Экспорт делается только по явному запросу пользователя.

Когда начинается реальный build сцены, можно создавать и обновлять:

- `src/compositions/<project-slug>/`
- `public/ranking-corridor/<project-slug>/`

Не уноси решения в переиспользуемый слой на этом этапе.

## Шаг 6. Сделай verification и `Финальное утверждение`

Перед любым заявлением о готовности:

- пройди техническую проверку по `docs/canon/remotion-project-rules.md`;
- проверь математику сцены и duration;
- проверь читаемость;
- проверь, что режиссерская эскалация и вторичная жизнь не потерялись после полной сборки;
- проверь, что сборка и базовые инженерные инварианты не сломаны.

Затем обнови секцию `Финальное утверждение` в `review-notes.md` с одним из статусов:

- `final-approved`
- `final-approved-with-notes`
- `not-final`

Если статус `not-final`, не запускай аудит библиотеки.

## Шаг 7. Запусти аудит библиотеки только после финального статуса

После `final-approved` или `final-approved-with-notes`:

- сначала проведи audit-first проход по новым решениям проекта;
- опирайся на `docs/templates/ranking-corridor-library-audit-template.md`, если нужен user-facing prompt или короткий checklist этого этапа;
- проверь отдельно категории:
  - `camera preset`
  - `timing preset`
  - `reveal/effect module`
  - `hero/object family`
  - `background / ambient / secondary-life system`
  - `utility / helper`
- не пытайся обязательно найти кандидата в каждой категории;
- если в категории зрелого кандидата нет, так и зафиксируй;
- для каждого найденного кандидата зафиксируй, где он живет, чем подтвержден в финальном ролике и почему он reusable, а не тема-специфичный декор;
- только после этого отдели `project-local` от реально переиспользуемых кандидатов;
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

Если кандидат относится к `camera preset` или `timing preset`, promotion может быть не только кодовым переносом, но и фиксацией preset-контракта в docs/registry, если нового library-модуля не требуется.

Не добавляй в библиотеку:

- одноразовый декоративный ход;
- тему-специфичный стиль;
- решение, не пережившее финальный проект;
- модуль без ясного контракта.

## Жесткие stop-condition

Никогда не делай:

- полную сборку композиции до review предпросмотра;
- аудит библиотеки до финального статуса;
- promotion в библиотеку, если решение спорное и требует checkpoint;
- молчаливое изменение канона без обновления docs.

## Быстрая самопроверка перед завершением

Перед финальным ответом проверь:

- project-артефакты созданы или обновлены по шаблонам;
- `director-pass.md` создан или обновлен и не спорит с `launch-card`;
- `asset-manifest.md` содержит реальные локальные пути и исходные URL;
- `review-notes.md` отражает текущее состояние проекта;
- review предпросмотра или финальный статус действительно зафиксированы;
- ты не перепрыгнул через `preview-gate`;
- аудит библиотеки не запущен раньше времени;
- если менялся код, есть свежая верификация.
