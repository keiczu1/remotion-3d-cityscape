# План: точная интеграция `library-only constructor` в workflow `ranking corridor`

## Статус документа

- Тип: точный `implementation / integration plan`
- Слой: `docs/workflow/` и не source-of-truth
- Дата: 2026-04-05
- Основание: анализ и ревью файла `docs/workflow/2026-04-05-library-only-constructor-workflow-plan.md`
- Назначение: зафиксировать точный порядок migration без повторного brainstorm

## Что считаем уже решенным для v1

Ниже не открытые вопросы, а рабочие решения для первой интеграции.

1. Новый дефолтный маршрут:
   - `тема -> constructor / template selector -> launch-card -> build-plan -> execution -> preview-gate -> final approval`
2. Для нового режима отдельного `director pass` больше нет.
3. `launch-card` становится последней обязательной точкой выбора до исполнения.
4. Новый production-режим только один:
   - `library-only-constructor-v1`
5. Для совместимости с текущими и историческими проектами сохраняется legacy-режим:
   - `legacy-creative`
6. Для v1 число сцен фиксируем в `4`.
7. Для v1 поддерживаем два способа запуска:
   - `block-constructor`
   - `template-clone`
8. В `library-only-constructor-v1` запрещены:
   - `ai-custom`
   - `user-custom`
   - `approved-custom`
   - `greenfield-approved`
   - `policy reuse: none` для launch/build-контракта
9. Новый machine-readable слой для выбора и template reuse заводим отдельно от markdown-реестра.
10. `review-notes` в новом режиме остается обязательным owner-файлом для:
   - `preview-gate`
   - `final approval`
11. `library audit` больше не входит в основной workflow нового режима:
   - если когда-то понадобится, это будет отдельный ручной post-project процесс вне critical path.

## Границы этого migration

Входит в migration:

- смена дефолтного workflow;
- обновление канона и активной навигации;
- переделка `launch-card` и `build-plan` контракта;
- удаление обязательности `director pass` из нового режима;
- новый constructor/template catalog;
- обновление skills и prompt-конфигов;
- обновление validator и связанных checks;
- smoke/regression-прогоны.

Не входит в этот migration:

- одновременное расширение библиотеки новыми world-атомами вроде `birds`, `plane`, `city silhouette`;
- promotion новых reusable-модулей в библиотеку как отдельный R&D-поток;
- backfill всех старых проектов на новый режим;
- `library audit` как обязательный этап production-flow.

## Стратегия cutover и совместимости

Migration идем по dual-mode схеме.

### Новый режим

- `workflowMode: library-only-constructor-v1`
- используется для всех новых проектов после cutover

### Legacy-режим

- `workflowMode: legacy-creative`
- используется для уже существующих проектов, где маршрут уже шел через `concept-pack` и/или `director-pass.md`

### Правило cutover

- новые проекты запускаются только через `library-only-constructor-v1`;
- старые проекты продолжаются в своем режиме без принудительного backfill;
- validator и skills должны уметь распознавать оба режима;
- `director-pass.md` не удаляется из репозитория сразу, а переводится в `legacy-only`.

### Правило legacy-detection

Для совместимости со старыми проектами вводим явное правило распознавания:

- если в `launch-card` есть поле `Workflow mode`, используется его значение;
- отсутствие `Workflow mode` само по себе не должно переводить проект в legacy без дополнительных сигналов;
- legacy-fallback допустим только если выполняется хотя бы одно условие:
  - дата в `project-slug` раньше `constructorCutoverDate`;
  - рядом уже существует `director-pass.md`;
  - в `launch-card` есть явный legacy-marker, добавленный при backfill;
- если `Workflow mode` отсутствует и legacy-сигналов нет, это ошибка контракта, а не молчаливый fallback;
- validator и skills не имеют права трактовать отсутствие `Workflow mode` как новый режим.

### Правило fail-closed после cutover

После cutover для всех новых проектов действует жесткое правило:

- новый `launch-card` обязан содержать `Workflow mode`;
- новый `launch-card` без `Workflow mode` считается не legacy, а битым артефактом;
- system behavior должен fail-closed, а не fail-open.

### Source-of-truth для `constructorCutoverDate`

Чтобы cutover marker не расползался между docs, skills и validator, для v1 вводим один канонический machine-readable источник:

- новый файл `src/lib/ranking-corridor/catalog/workflow-cutover.ts`;
- в нем хранится export с одним значением `constructorCutoverDate` в ISO-формате;
- validator и любые helper-script должны читать cutover marker только из этого файла;
- owner-docs и skill-документы не считаются source-of-truth для даты, а только ссылаются на этот путь и при необходимости дублируют значение как human-readable mirror;
- менять дату cutover можно только вместе с синхронным обновлением validator/skills/docs в одном change-set.

## Новые точные сущности v1

### Поля `launch-card`

В новой файловой форме должны появиться как минимум такие обязательные поля:

- `Workflow mode`
- `Selection mode`
- `Scene count`
- `Scene sequence`
- `Scene world config`
- `Camera package`
- `Hero package`
- `Library-only`
- `Locked after launch`

Для режима `template-clone` дополнительно:

- `Template base id`
- `Template base source project`
- `Allowed adaptation scope`

### Enum для `Selection mode`

- `block-constructor`
- `template-clone`

### Enum для `Allowed adaptation scope`

- `data-only`
- `assets-only`
- `theme-tuning`
- `scene-world-tuning`
- `template-fork-required`

### Словарь machine tokens и human labels

Для нового режима надо жестко развести machine-readable значения и человекочитаемые заголовки.

Machine tokens:

- `preview-gate`
- `final-approval`
- `completed`

Human labels:

- `Preview gate`
- `Final approval`

Правило:

- в `build-plan.md`, validator и scripts используются только machine tokens;
- в `review-notes.md` и user-facing шаблонах используются human labels секций;
- mapping `preview-gate -> Preview gate` и `final-approval -> Final approval` фиксируется как обязательный словарь для docs/templates/scripts;
- нельзя смешивать `final approval` и `final-approval` как взаимозаменяемый текст в machine-полях.

### Новый контракт `review-notes` для нового режима

Для `library-only-constructor-v1` файл `review-notes.md` остается обязательным, но меняет смысл.

Он должен владеть как минимум двумя секциями:

- `Preview gate`
- `Final approval`

Для нового режима:

- секция `Режиссерский план` не обязательна;
- если она есть, то только для legacy-проектов;
- production skill и resume-flow должны ориентироваться на `Preview gate` и `Final approval`, а не на `Режиссерский план`.

Правило materialization:

- skeleton `review-notes.md` создается одновременно с новым `launch-card`;
- на launch-этапе он materialize-ится как пустой owner-файл с готовыми секциями `Preview gate` и `Final approval`;
- дальше этот файл обновляется уже на `preview-gate` и на этапе финального утверждения.

### Materialization-модель для `template-clone`

Для v1 не заводим отдельный большой физический каталог шаблонов вне текущих source-проектов.

Вместо этого каждый template entry в machine-readable template catalog обязан хранить:

- `sourceProjectSlug`
- `projectContainerPath`
- `compositionPath`
- `publicAssetsPath`
- `compositionIdTemplate`
- `rootRegistrationTarget`
- `copyPolicy`
- `placeholderReplacementPolicy`

Materialization в v1 работает так:

- template выбирается по `template-catalog`;
- отдельный scaffold-script копирует базовый skeleton из указанных source paths;
- затем выполняются замены slug/path/data binding по `placeholderReplacementPolicy`;
- затем scaffold-script обязан materialize-ить регистрацию новой композиции в текущем repo-способе подключения к Remotion Studio;
- для текущего состояния репозитория это значит обновление `src/Root.tsx`: добавить import новой композиции и новый `<Composition />` entry с корректным `id`;
- только после этого создается новый `launch-card` и project container нового проекта.

Правило `copyPolicy` для v1 должно быть явным и fail-safe.

По умолчанию:

- можно копировать:
  - `src/compositions/<source-slug>/`
  - `public/ranking-corridor/<source-slug>/`, если template реально требует локальные assets
- нельзя копировать как готовые артефакты:
  - `projects/<source-slug>/launch-card.md`
  - `projects/<source-slug>/build-plan.md`
  - `projects/<source-slug>/review-notes.md`
  - `projects/<source-slug>/director-pass.md`
  - `projects/<source-slug>/asset-manifest.md`
  - `projects/<source-slug>/review-artifacts/`
  - `projects/<source-slug>/exports/`

Эти файлы должны не копироваться, а пересоздаваться заново под новый проект.

Обязательные post-materialization проверки:

- в новых файлах не осталось старого `source-slug`, кроме явно разрешенных reference-case;
- `staticFile`, import paths и project-local пути переписаны на новый slug;
- target composition существует и открывается как новый проект;
- `src/Root.tsx` или другой актуальный registry-target действительно зарегистрировал новую композицию;
- новый проект не унаследовал старые review/build artifacts.

Это сознательно более простой v1-подход:

- source project выступает физической template-base;
- отдельный абстрактный `templates/` слой можно добавить позже, если понадобится.

## Точный план внедрения

### Этап 1. Зафиксировать новый owner-level workflow contract

- Зависимости: нет
- Файлы:
  - `AGENTS.md`
  - `docs/canon/ranking-corridor-working-mode.md`
  - `docs/canon/ranking-corridor-format.md`
  - `docs/README.md`
  - `projects/README.md`
  - `docs/plans.md`
- Конкретные изменения:
  - заменить старый launch-маршрут `concept-pack -> launch-card -> director pass -> build-plan` на новый маршрут `constructor/template selector -> launch-card -> build-plan`;
  - явно ввести dual-mode модель: `legacy-creative` и `library-only-constructor-v1`;
  - убрать обязательность `director pass` для нового режима;
  - убрать `library audit` из owner-level активного production-маршрута нового режима;
  - зафиксировать fail-closed правило для `Workflow mode` после cutover;
  - ввести `constructorCutoverDate` как repo-level cutover marker для validator/skills;
  - сослаться на один source-of-truth путь для cutover marker, а не дублировать правило в разных документах как независимое знание;
  - зафиксировать, что `launch-card` в новом режиме уже содержит весь обязательный world/camera/hero выбор;
  - перевести `concept-pack` из дефолтного маршрута в `legacy-only` или optional helper;
  - перевести `director-pass.md` из обязательного production-артефакта в `legacy-only` артефакт.
- Проверки:
  - `rg -n "concept-pack|director pass|director-pass|library audit|library-audit" AGENTS.md docs/README.md projects/README.md docs/canon docs/plans.md`
  - ручная перечитка маршрута: `AGENTS.md -> docs/README.md -> docs/canon/ranking-corridor-working-mode.md -> projects/README.md`
- Критерий готовности:
  - активные owner-документы описывают один и тот же новый маршрут;
  - нигде в активной документации `director pass` не остается обязательным шагом для `library-only-constructor-v1`.

### Этап 2. Ввести machine-readable constructor/template layer

- Зависимости: этап 1
- Файлы:
  - новый `src/lib/ranking-corridor/catalog/types.ts`
  - новый `src/lib/ranking-corridor/catalog/workflow-cutover.ts`
  - новый `src/lib/ranking-corridor/catalog/constructor-catalog.ts`
  - новый `src/lib/ranking-corridor/catalog/template-catalog.ts`
  - новый `src/lib/ranking-corridor/catalog/index.ts`
  - новый `scripts/scaffold-ranking-project-from-template.ts`
  - новый `scripts/validate-ranking-catalog.ts`
  - `package.json`
  - `src/Root.tsx`
  - новый `docs/library/ranking-corridor-constructor-catalog.md`
  - новый `docs/library/ranking-corridor-template-catalog.md`
  - `docs/library/ranking-corridor-module-registry.md`
- Конкретные изменения:
  - завести один machine-readable export для `constructorCutoverDate`;
  - завести machine-readable catalog для user-facing выбора по блокам:
    - scenes
    - world options
    - camera packages
    - hero packages
  - завести machine-readable template catalog с точными template entry:
    - `classic-tower-template-v1`
    - `media-stele-corridor-template-v1`
    - `nature-altar-corridor-template-v1`
    - `portrait-biography-corridor-template-v1`
  - в каждом template entry зафиксировать:
    - source project
    - source paths for materialization
    - camera baseline
    - hero baseline
    - scene/world baseline
    - required data shape
    - allowed adaptation scope
    - fallback rule
    - composition id template
    - root registration target
    - copy policy
    - placeholder replacement policy
  - добавить scaffold-script для `template-clone`, который материализует новый проект из source-project template-base;
  - в materialization-поток явно включить регистрацию новой композиции в `src/Root.tsx`, пока репозиторий использует ручной composition registry;
  - добавить machine-check `validate-ranking-catalog.ts` для catalog/template layer;
  - добавить в `package.json` отдельный script для такого materialization-потока;
  - добавить в `package.json` отдельный script `validate:catalog`;
  - зафиксировать явный include/exclude для `copyPolicy`;
  - зафиксировать machine token dictionary для `preview-gate` / `final-approval` и их human-readable секций;
  - в markdown-документах дать человекочитаемый каталог поверх machine-readable слоя;
  - в module registry добавить ссылки на новый constructor/template layer, но не смешивать его с текущим low-level registry.
- Проверки:
  - все catalog entry имеют machine-readable `id`;
  - все user-facing варианты ссылаются либо на module registry, либо на template catalog;
  - каждый template entry имеет непустые source paths;
  - каждый template entry имеет `compositionIdTemplate` и `rootRegistrationTarget`;
  - `npm run validate:catalog` проходит на валидном catalog;
  - scaffold-script можно запустить в dry-run режиме и получить предсказуемый список копируемых путей;
  - scaffold-script не копирует старые `build-plan`, `review-notes`, `director-pass`, `review-artifacts`, `exports`;
  - после materialization поиск по старому slug в целевых файлах либо пустой, либо совпадает с явно разрешенными исключениями;
  - после materialization новая композиция появилась в `src/Root.tsx` и видна в Remotion Studio;
  - `rg -n "template-v1|constructor-catalog|template-catalog" src/lib/ranking-corridor docs/library`
- Критерий готовности:
  - новый launch может строиться по catalog/template layer без чтения сырого кода и без импровизации;
  - `template-clone` имеет не только catalog-entry, но и реальный путь materialization в файловую структуру проекта;
  - materialized проект открывается в Studio без ручного дописывания registry после запуска scaffold-script.

### Этап 3. Пересобрать файловую форму `launch-card`

- Зависимости: этапы 1-2
- Файлы:
  - `docs/templates/ranking-corridor-launch-card-template.md`
- Конкретные изменения:
  - удалить dependence на `concept-pack` как обязательный `source of direction`;
  - добавить поля нового режима:
    - `Workflow mode`
    - `Selection mode`
    - `Scene count`
    - `Scene sequence`
    - `Scene world config`
    - `Camera package`
    - `Hero package`
    - `Library-only`
    - `Locked after launch`
  - добавить template-поля:
    - `Template base id`
    - `Template base source project`
    - `Allowed adaptation scope`
  - сделать `Workflow mode` обязательным для всех новых `launch-card` после cutover;
  - убрать утверждение, что детальная `secondary-life system` обязательно дообогащается позже через `director pass`;
  - оставить `launch-card` короткой, но сделать ее достаточной для немедленного перехода к `build-plan`.
- Проверки:
  - dry-run на двух карточках:
    - один `block-constructor`
    - один `template-clone`
  - ручная сверка, что по файлу можно собрать `build-plan` без дополнительного design-этапа.
- Критерий готовности:
  - `launch-card` является самодостаточным execution-input для нового режима.

### Этап 4. Пересобрать `build-plan`, `review-notes` и legacy-template контур

- Зависимости: этапы 1-3
- Файлы:
  - `docs/templates/ranking-corridor-build-plan-template.md`
  - `docs/templates/ranking-corridor-review-notes-template.md`
  - `docs/templates/ranking-corridor-director-pass-template.md`
  - `docs/templates/ranking-corridor-library-audit-template.md`
  - `docs/templates/ranking-corridor-theme-to-concept-pack-template.md`
  - `docs/templates/ranking-corridor-theme-to-reverse-prompt-template.md`
- Конкретные изменения:
  - пересобрать `build-plan` как мост `launch-card -> execution`, а не `director-pass -> execution`;
  - убрать требование approve секции `Режиссерский план` перед созданием `build-plan`;
  - зафиксировать единый mapping между machine steps и human section titles:
    - `preview-gate -> Preview gate`
    - `final-approval -> Final approval`
  - в `review-notes` зафиксировать новый обязательный минимальный контракт для нового режима:
    - `Preview gate`
    - `Final approval`
  - в `review-notes` убрать обязательную секцию `Режиссерский план` для нового режима;
  - оставить `Режиссерский план` только как legacy-секцию для старых проектов;
  - `ranking-corridor-director-pass-template.md` не удалять, а пометить `legacy-only`;
  - `theme-to-concept-pack` и `theme-to-reverse-prompt` убрать из дефолтного входа и пометить как `legacy-only / optional ideation helper`;
  - `ranking-corridor-library-audit-template.md` вывести из active path и пометить как `legacy-only / manual out-of-band`.
- Проверки:
  - `rg -n "Режиссерский план|director-pass|concept-pack" docs/templates`
  - dry-run чтения шаблонов как единого процесса: `launch-card template -> build-plan template -> review-notes template`
  - ручная сверка, что новый `review-notes` template покрывает `preview-gate` и `final approval` без `director-pass`.
- Критерий готовности:
  - в шаблонном слое новый режим больше не зависит от `director-pass.md`;
  - `review-notes` имеет четкий новый owner-contract;
  - legacy-файлы остаются в репозитории, но явно отделены от нового default path.

### Этап 5. Переписать launch skill и его prompt

- Зависимости: этапы 1-4
- Файлы:
  - `.agents/skills/ranking-corridor-launch/SKILL.md`
  - `.agents/skills/ranking-corridor-launch/agents/openai.yaml`
- Конкретные изменения:
  - заменить дефолтный шаг `concept-pack` на constructor-first flow;
  - добавить две ветки:
    - `block-constructor`
    - `template-clone`
  - обязать skill предлагать только library-backed и template-backed варианты;
  - убрать `ai-custom` и `user-custom` из нового дефолтного маршрута;
  - оставлять stop-condition на `launch-card`, но materialize-ить вместе с ней skeleton `review-notes.md` нового формата;
  - сохранить legacy-route только как fallback для старых проектов и исторических документов, а не как default.
- Проверки:
  - chat-first smoke:
    - `Новый ролик на тему ...`
    - `Хочу базу как у сайтов ...`
  - поиск по skill и yaml на остаточные default-инструкции про `concept-pack`.
- Критерий готовности:
  - новый launch skill стабильно приводит к новому `launch-card` без creative-first шага.

### Этап 6. Переписать production skill и его prompt

- Зависимости: этапы 1-5
- Файлы:
  - `.agents/skills/ranking-corridor-production/SKILL.md`
  - `.agents/skills/ranking-corridor-production/agents/openai.yaml`
- Конкретные изменения:
  - убрать обязательное ожидание `director-pass.md`;
  - поменять phase routing на:
    - `launch-card`
    - `build-plan`
    - `preview-build`
    - `preview-gate`
    - `post-preview-build`
    - `final approval`
  - для нового режима читать baseline напрямую из `launch-card`;
  - оставить поддержку legacy-проектов, где `director-pass.md` уже существует;
  - убрать формулировки, что `greenfield-approved` допустим по сигналам из `director-pass.md`;
  - для нового режима resume-flow должен опираться на:
    - `launch-card`
    - `build-plan`
    - `review-notes` секции `Preview gate` и `Final approval`
  - если `library audit` где-то еще описан в prompt/skill, перевести его в `manual out-of-band`, а не в системную фазу.
- Проверки:
  - сценарий `continue from launch-card` для нового режима;
  - сценарий `continue from legacy project` для старого режима;
  - сценарий resume по `review-notes` без `director-pass`.
- Критерий готовности:
  - production skill может продолжать новый проект сразу после `launch-card`;
  - при этом не ломается resume старых проектов.

### Этап 7. Обновить validator и связанные machine-check

- Зависимости: этапы 1-6
- Файлы:
  - `scripts/validate-ranking-build-plan.ts`
  - `scripts/validate-ranking-data-core.ts`
  - `scripts/validate-ranking-catalog.ts`
  - `src/lib/ranking-corridor/catalog/workflow-cutover.ts`
  - при необходимости `scripts/validate-ranking-data.ts`
- Конкретные изменения:
  - научить validator читать `workflowMode` и `selectionMode`;
  - научить validator читать `constructorCutoverDate` только из `src/lib/ranking-corridor/catalog/workflow-cutover.ts`;
  - зафиксировать legacy-detection:
    - отсутствие `workflowMode` само по себе не дает legacy-fallback
    - legacy-fallback допустим только при `projectSlugDate < constructorCutoverDate` или при явном legacy-сигнале
    - отсутствие `workflowMode` без legacy-сигналов считается ошибкой контракта
  - для `library-only-constructor-v1` запретить:
    - `greenfield-approved`
    - `approved-custom`
    - `policy reuse: none`
  - удалить зависимость нового режима от секции `Режиссерский план` в `review-notes.md`;
  - перевести validator на новый `review-notes` contract:
    - `Preview gate`
    - `Final approval`
  - зафиксировать machine-token dictionary:
    - `preview-gate`
    - `final-approval`
    - `completed`
  - удалить `library-audit` из допустимых системных значений `Следующий шаг` для нового режима;
  - валидировать:
    - `cameraPackage`
    - `heroPackage`
    - `sceneSequence`
    - `sceneWorldConfig`
    - `templateBaseId`
    - `allowedAdaptationScope`
  - сверять `build-plan` с machine-readable catalog/template layer, а не только с markdown-реестром;
  - `validate-ranking-data-core.ts` должен сохранять совместимость со старым `launch-card`, но корректно читать новый `workflowMode`.
  - `validate-ranking-catalog.ts` должен проверять:
    - duplicate `id`
    - broken module/template references
    - missing source paths
    - invalid `allowedAdaptationScope`
    - missing `compositionIdTemplate`
    - missing `rootRegistrationTarget`
- Проверки:
  - позитивный сценарий:
    - корректный `launch-card` и корректный `build-plan` проходят
    - корректный catalog/template layer проходит `npm run validate:catalog`
  - негативные сценарии:
    - `greenfield-approved` в новом режиме падает
    - `approved-custom` в новом режиме падает
    - неизвестный `templateBaseId` падает
    - `build-plan` вне `allowedAdaptationScope` падает
    - новый launch-card без `workflowMode` падает
    - legacy launch-card без `workflowMode`, но с valid legacy-сигналом, не ломает validator
    - duplicate catalog `id` падает
    - template entry без `rootRegistrationTarget` падает
  - команды:
    - `npm run validate:catalog`
    - `npm run validate:data -- <project-slug>`
    - `npm run validate:build-plan -- projects/<project-slug>/build-plan.md`
- Критерий готовности:
  - validator действительно держит новый режим, а не просто знает его по названию.

### Этап 8. Синхронно обновить навигацию и активные документы

- Зависимости: этапы 1-7
- Файлы:
  - `AGENTS.md`
  - `docs/README.md`
  - `projects/README.md`
  - `docs/plans.md`
  - `docs/canon/ranking-corridor-working-mode.md`
  - `docs/canon/ranking-corridor-format.md`
  - `docs/templates/ranking-corridor-launch-card-template.md`
  - `docs/templates/ranking-corridor-build-plan-template.md`
  - `docs/templates/ranking-corridor-review-notes-template.md`
  - `docs/templates/ranking-corridor-director-pass-template.md`
  - `docs/templates/ranking-corridor-library-audit-template.md`
  - `docs/templates/ranking-corridor-theme-to-concept-pack-template.md`
  - `docs/templates/ranking-corridor-theme-to-reverse-prompt-template.md`
- Конкретные изменения:
  - убрать конфликтующие упоминания старого default path;
  - перевести старые helper/template документы в `legacy-only`, где это нужно;
  - обновить карту документации и точку входа в репозиторий;
  - синхронизировать human-readable названия секций с machine token dictionary нового режима;
  - убедиться, что active docs больше не советуют `concept-pack`, `director-pass` и `library audit` как дефолт.
- Проверки:
  - `rg -n "concept-pack|director pass|director-pass|library audit|library-audit" AGENTS.md docs/README.md projects/README.md docs/canon docs/templates .agents/skills`
  - ручная сквозная перечитка активной документации.
- Критерий готовности:
  - пользователь и ИИ, читая только активные документы, видят один и тот же новый workflow.

### Этап 9. Прогнать verification и regression

- Зависимости: этапы 1-8
- Файлы:
  - project-local test notes или отдельный workflow verification note в `docs/workflow/`
  - реальные `projects/<project-slug>/launch-card.md` и `build-plan.md` для smoke-сценариев
  - synthetic fixture project для башенного baseline, если он нужен для regression
- Конкретные проверки:
  - новый запуск через `block-constructor`;
  - новый запуск через `template-clone`;
  - partial-coverage тема с nearest allowed fallback;
  - продолжение проекта сразу после `launch-card`;
  - validator positive path;
  - validator negative path;
  - regression на 3 реальные project-базы:
    - `2026-03-20-most-visited-websites`
    - `2026-03-25-strongest-pokemon`
    - `2026-03-30-richest-women`
  - отдельно synthetic tower fixture на базе `classic-tower-template-v1`, потому что `ranking-towers` сейчас существует как composition baseline, а не как project-container в `projects/`;
  - общие команды:
    - `npm run test`
    - `npm run lint`
    - `npm run validate:catalog`
    - `npm run validate:data -- <project-slug>`
    - `npm run validate:build-plan -- projects/<project-slug>/build-plan.md`
- Критерий готовности:
  - новый запуск реально быстрее и предсказуемее;
  - старые сильные паттерны не деградировали;
  - новый режим не уходит в скрытый custom/greenfield;
  - `template-clone` и synthetic tower fixture открываются в Remotion Studio без ручного дописывания `src/Root.tsx`.

## Зависимости между этапами

1. Этап 1 обязателен до любых skill/validator правок.
2. Этап 2 обязателен до launch skill и validator, потому что им нужен machine-readable catalog.
3. Этап 3 обязателен до production skill и validator, потому что новый режим читается из `launch-card`.
4. Этап 4 обязателен до полноценного cutover, потому что старые template guardrails иначе будут конфликтовать.
5. Этапы 5 и 6 должны идти после обновления шаблонов, иначе prompts начнут ссылаться на старую файловую форму.
6. Этап 7 нельзя считать завершенным без новых negative checks.
7. Этап 8 должен идти в том же change-set, что и логика, а не после реализации.
8. Этап 9 закрывает migration и является обязательным gate перед заявлением о завершении.

## Правило merge-координации

Чтобы не оставить репозиторий в полу-мигрированном состоянии:

- этапы 3-8 должны входить либо в один интеграционный change-set;
- либо включаться под временный compatibility gate, который не делает новый режим активным до завершения validator и docs cutover;
- нельзя отдельно вливать новый launch skill раньше, чем обновлены шаблоны, validator и active docs;
- нельзя объявлять cutover завершенным, пока owner-docs, skills и machine-check не синхронизированы в одной версии маршрута.

## Что считаем завершением migration

Migration считаем завершенным только если одновременно выполнено все ниже:

1. Новый проект стартует через `constructor/template selector`, а не через `concept-pack`.
2. Для нового режима `director pass` больше не обязателен и не стоит на critical path.
3. `launch-card` является последней точкой выбора до `build-plan`.
4. `build-plan` и validator жестко удерживают `library-only-constructor-v1`.
5. Есть минимум 4 реальные template entry в machine-readable template catalog, и у них есть рабочий materialization path вместе с корректной регистрацией композиции в Studio.
6. `review-notes` имеет новый owner-contract для `preview-gate` и `final approval`.
7. Launch и production skills согласованы с новым workflow.
8. `AGENTS.md`, канон, `docs/README.md`, `projects/README.md`, шаблоны и validator не противоречат друг другу.
9. Новый режим не требует `library audit` на critical path.
10. `constructorCutoverDate` и machine token dictionary имеют один source-of-truth и не дублируются как независимые правила.
11. `npm run validate:catalog` проходит, и catalog/template layer проверяется отдельно от smoke.
12. Пройдены smoke и regression-прогоны.

## Рекомендуемый порядок реальной реализации

1. Этап 1
2. Этап 2
3. Этап 3
4. Этап 4
5. Этап 5
6. Этап 6
7. Этап 7
8. Этап 8
9. Этап 9

Этот порядок выбран специально:

- сначала фиксируем контракт;
- затем заводим source-of-truth для выбора;
- затем меняем файловую форму;
- потом переподключаем skills;
- потом ставим machine-check;
- и только после этого считаем migration закрытым.
