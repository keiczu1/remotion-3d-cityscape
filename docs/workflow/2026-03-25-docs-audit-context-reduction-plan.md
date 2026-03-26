# План: аудит workflow и сокращение активного контекста без деградации качества

## Цель

Сократить лишний активный контекст в workflow `ranking corridor`, убрать дубли между каноном, skills, шаблонами и навигацией, но не ослабить production-процесс и не ухудшить результат.

## Неприкасаемые инварианты

- не убирать `preview-gate`;
- не убирать файловую воспроизводимость через project-артефакты;
- не ломать маршрут `launch-card -> director-pass -> build-plan -> preview-build -> preview-gate -> post-preview-build -> final approval -> library audit`;
- не ослаблять `review-notes.md`, registry и post-final promotion guardrails;
- не убирать machine-check и visual evidence gate из `scripts/validate-ranking-build-plan.ts`;
- не переносить правило в менее строгий слой без явного владельца-заменителя.

## Что уже видно по аудиту

- часть правил повторяется между `AGENTS.md`, `docs/README.md`, каноном и skills;
- `docs/canon/ranking-corridor-working-mode.md` перегружен: там смешаны канон процесса, routing, статусы, шаблонные контракты и validator-aware детали;
- `ranking-corridor-launch` и `ranking-corridor-production` местами дублируют канон вместо того, чтобы быть тонкими operational-слоями;
- `docs/templates/` местами повторяют канон и validator-контракт;
- навигационный слой раньше плохо отделял активный контур от рабочих и исторических планов.

## Этап 1. Разделить активный и рабочий слой

- Файлы:
  - `docs/README.md`
  - `docs/workflow/README.md`
- Что меняется:
  - активный source-of-truth отделяется от рабочих планов и historical-layer;
  - `docs/workflow/` получает явный контракт: это рабочая папка, а не канон;
  - `docs/plans.md`, `docs/plans/`, `docs/workflow/` больше не выглядят как конкурирующие владельцы правил.
- Критерий готовности:
  - новая навигация уменьшает риск читать лишнее до входа в канон;
  - ни один production-rule не переносится в более слабый слой.

## Этап 2. Собрать карту владельцев правил

- Файлы:
  - `docs/workflow/2026-03-25-docs-audit-context-reduction-plan.md`
  - далее при необходимости `docs/workflow/*`
- Что меняется:
  - для каждого класса правил фиксируется единственный владелец: session-contract, canon, template, skill, validator, registry или project-artifact;
  - повторяющиеся формулировки отмечаются как кандидаты на удаление или замену ссылкой.
- Критерий готовности:
  - у каждого важного правила есть один главный файл-владелец;
  - операционные слои не спорят между собой.

## Этап 3. Утоньшить навигационные и operational-слои

- Файлы:
  - `AGENTS.md`
  - `docs/README.md`
  - `.agents/skills/ranking-corridor-launch/SKILL.md`
  - `.agents/skills/ranking-corridor-production/SKILL.md`
- Что меняется:
  - дублирующий пересказ канона заменяется на более короткие routing-правила и ссылки на владельцев;
  - skills остаются исполнимыми, но перестают быть вторым каноном.
- Критерий готовности:
  - вход в задачу требует меньше чтения;
  - качество и stop-condition не ослаблены.

## Этап 4. Разгрузить канон от лишнего operational-пересказа

- Файлы:
  - `docs/canon/ranking-corridor-working-mode.md`
  - `docs/templates/*.md`
  - `scripts/validate-ranking-build-plan.ts`
- Что меняется:
  - validator-aware детали и шаблонные повторения проверяются на предмет лишнего дублирования;
  - сохраняется только то, что реально нужно как владеющий контракт или machine-check.
- Критерий готовности:
  - канон остается строгим, но становится легче сканироваться;
  - шаблоны не пересказывают канон без необходимости;
  - validator остается техническим enforcement-слоем, а не случайным hidden canon.

## Этап 5. Проверить на реальных сценариях

- Сценарии:
  - старт нового ролика с одной темы;
  - продолжение проекта по существующему `launch-card.md`;
  - продолжение между `director-pass.md` и `build-plan.md`;
  - закрытие preview-задачи через validator;
  - post-final library audit.
- Критерий готовности:
  - ни один сценарий не требует больше контекста, чем раньше;
  - ни один сценарий не теряет guardrails.

## Первый пакет выполнения

- отделить активный и рабочий слой в `docs/README.md`;
- зафиксировать контракт папки `docs/workflow/`;
- вести дальнейший аудит и change-plan уже в этом файле, а не размазывать его по чату и случайным документам.

## Статус выполнения

- выполнено: активный и рабочий слой разделены в `docs/README.md`;
- выполнено: в `docs/workflow/README.md` зафиксировано, что папка не является каноном;
- выполнено: собрана карта владельцев правил и карта дублей для безопасной дедупликации следующих слоев;
- выполнено: верхние owner-lists в `ranking-corridor-launch` и `ranking-corridor-production` сокращены без изменения execution-логики;
- выполнено: вводные workflow-пояснения в helper-шаблонах сокращены и привязаны к `working-mode` как владельцу процесса;
- выполнено: validator-aware reminders в `launch-card` и `build-plan` template сжаты без изменения полей, enum и machine-check требований;
- выполнено: onboarding-пересказ в `AGENTS.md` сокращен и сильнее опирается на `docs/README.md` и `working-mode` как на владельцев деталей;
- выполнено: field-by-field пересказ `launch-card` контракта в `working-mode` сжат до уровня обязательных слоев и implementation-locked оговорок;
- выполнено: build-plan секция `working-mode` сжата до owner-level контракта, а точные field-level и finalize детали оставлены template/validator слою;
- выполнено: секции `director pass`, `preview-gate` и preview-review в `working-mode` сжаты до owner-level контракта без изменения approve/preview guardrails.
- выполнено: data/assets секции `working-mode` привязаны к `asset-manifest`, `launch-card` и `build-plan` как к владельцам файловой формы и field-level policy без ослабления `image-first` guardrails.
- выполнено: нижний routing-блок `Где что должно жить` в `working-mode` сжат до owner-level карты слоев и статусных контрактов без повтора структуры контейнера и списка шаблонов.
- выполнено: `review-notes` template очищен от длинного enum-примера library-audit таблицы; owner набора `candidateType` и `proposedDecision` оставлен канону.
- выполнено: `asset-manifest` template очищен от длинного enum-примера inventory-строки; owner наборов `assetStatus`, `discoveredBy`, `quality` и `usageStage` оставлен канону.
- выполнено: `library-audit` helper-шаблон очищен от повторного перечисления candidate decisions; owner набора решений оставлен канону.
- выполнено: в каноне и preview-review добавлен короткий дефолт `пол под башнями не темный: только light-tone или mid-tone` с явной preview-проверкой separation от подиума.
- выполнено: `director pass` усилен правилом, что `ground` обязан быть живым evolving-слоем сцены, а не сухой плоской подложкой; практическая форма добавлена в director-pass template.

## Что считать успехом

- меньше точек входа, которые надо читать перед работой;
- меньше повторяющихся правил в нескольких местах;
- ноль потерянных quality gates;
- ноль неоднозначных владельцев для ключевых правил;
- ноль “скрытого канона” в рабочих планах и исторических заметках.
