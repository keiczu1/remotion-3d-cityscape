# Карта владельцев правил и дублей

## Назначение

Этот файл нужен для безопасной дедупликации workflow-документации.

Цель не в том, чтобы упростить процесс, а в том, чтобы у каждого класса правил был один явный владелец, а остальные слои оставались только routing, operational-form или machine-enforcement.

## Карта владельцев

| Класс правил | Главный владелец | Где еще повторяется | Что делать дальше |
| --- | --- | --- | --- |
| session-contract, язык ответов, repo defaults | `AGENTS.md` | `docs/README.md`, местами skills | оставить норму в `AGENTS.md`, в остальных слоях оставить только краткие ссылки |
| карта активной документации и разделение active / working layer | `docs/README.md` | частично `AGENTS.md`, рабочие планы | держать здесь навигацию, не дублировать ее в каноне |
| канон жанра `ranking corridor` и допустимые оси вариативности | `docs/canon/ranking-corridor-format.md` | `ranking-corridor-launch/SKILL.md`, helper-templates | сократить в skills и шаблонах пересказ жанра до ссылок и минимальных operational-reminders |
| рабочий цикл, фазы, stop-condition, статусы и контракты project-артефактов | `docs/canon/ranking-corridor-working-mode.md` | `AGENTS.md`, launch-skill, production-skill, templates | оставить здесь норму, а в skills оставить исполнимый routing и file-state logic |
| структура `projects/<project-slug>/` | `projects/README.md` | `AGENTS.md`, `ranking-corridor-working-mode.md`, production-skill | оставить состав контейнера только здесь, в остальных файлах давать ссылку и краткий operational-context |
| launch execution order | `.agents/skills/ranking-corridor-launch/SKILL.md` | `AGENTS.md`, `working-mode`, concept-pack template | оставить в skill только порядок действий и stop-condition; поля и допустимые режимы брать из владельцев |
| production execution order и file-state routing | `.agents/skills/ranking-corridor-production/SKILL.md` | `working-mode`, `projects/README.md`, templates | оставить в skill только routing, phase detection и checkpoints выполнения |
| форма `launch-card`, `director-pass`, `build-plan`, `asset-manifest`, `review-notes` | `docs/templates/*.md` | `working-mode`, skills | шаблоны должны владеть формой файла, а не пересказывать весь workflow |
| validator-aware machine-contract для `build-plan` | `scripts/validate-ranking-build-plan.ts` | `working-mode`, build-plan template, production-skill | подробный enforcement держать в скрипте; в тексте оставить только то, что нужно человеку для воспроизводимого заполнения |
| registry truth для library-модулей, preset-пакетов и reveal-baseline | `docs/library/ranking-corridor-module-registry.md` | `working-mode`, skills, project review-notes | сохранять registry как единственный владелец promoted reusable-layer |
| project-specific truth по текущему ролику | `projects/<project-slug>/*.md` | чат, skills, исторические планы | при любом расхождении продолжать ориентироваться на файловое состояние проекта |

## Основные зоны перегруза

### 1. Навигационный дубль

- `AGENTS.md` и `docs/README.md` оба задают порядок чтения и часть source-of-truth иерархии.
- Это допустимо как короткий onboarding, но не должно перерастать в второй канон.

### 2. Workflow-дубль

- `docs/canon/ranking-corridor-working-mode.md` уже владеет фазами, статусами и stop-condition.
- При этом launch и production skills местами повторяют те же правила почти как второй источник истины.

### 3. Template-дубль

- часть шаблонов объясняет не только форму файла, но и заново пересказывает логику workflow.
- Это увеличивает контекст и делает риск drift выше.

### 4. Validator hidden-canon

- некоторые обязательные поля и связи фактически определяются не только текстом в каноне, но и `validate-ranking-build-plan.ts`.
- Это не ошибка само по себе, но человеку должно быть ясно, где заканчивается норма документа и начинается machine-enforcement.

### 5. Historical-layer шум

- `docs/plans.md`, `docs/plans/` и `docs/workflow/` полезны как история решений и change-plans.
- Без явной маркировки они легко воспринимаются как еще один живой слой правил.

## Следующие безопасные сокращения

- укоротить в `AGENTS.md` и skills повторяющийся пересказ source-of-truth, оставив только routing и ссылки;
- проверить `docs/canon/ranking-corridor-working-mode.md` на блоки, которые по сути принадлежат template или validator-слою;
- проверить шаблоны на длинные объяснения, которые уже живут в каноне;
- после каждой такой правки прогонять сценарии `launch`, `continue-from-launch-card`, `continue-from-build-plan`, `preview-finalize`, `library-audit`.

## Что нельзя резать в рамках дедупликации

- `preview-gate`;
- file-state routing;
- review approvals;
- machine validation и visual evidence;
- post-final library audit;
- различие между canon, template, skill, registry и project-local truth.
