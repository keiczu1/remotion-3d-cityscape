# План Интеграции: `library-only-constructor-v1`

## Статус

- Тип: `implementation note`
- Слой: `docs/workflow/`
- Дата: `2026-04-05`
- Состояние: `completed`

## Итог

Репозиторий переведен на один активный workflow:

`тема -> constructor / template selector -> launch-card -> build-plan -> preview-build -> preview-gate -> post-preview-build -> final approval`

В активном контуре больше нет дополнительных creative-first и post-project шагов.

## Выполненные этапы

- Этап 1. Owner-level workflow contract: `done`
- Этап 2. Machine-readable constructor/template layer: `done`
- Этап 3. Launch-card template: `done`
- Этап 4. Build-plan / review-notes templates: `done`
- Этап 5. Launch skill: `done`
- Этап 6. Production skill: `done`
- Этап 7. Validator и machine-check: `done`
- Этап 8. Docs sync и cleanup: `done`
- Этап 9. Verification sweep: `done`

## Что реально изменено

- активный канон переписан под один новый маршрут;
- удалены устаревшие template-файлы и helper-примеры;
- возвращен корневой `docs/README.md` как главный вход в документацию;
- launch и production skills синхронизированы с новым маршрутом;
- validator очищен от старых workflow-веток и проверяет один режим;
- constructor/template catalog и scaffold layer оставлены как machine-readable основа нового запуска;
- scaffold `template-clone` теперь materialize-ит не только composition/assets, но и template project-container без копирования legacy project-файлов и без порчи бинарных ассетов;
- validator и owner-docs синхронизированы по `Template base source project`, machine-step контракту `Следующий шаг` и active scripts-map;
- active docs и machine-layer больше не ссылаются на старый процесс.
- исторические project-container тоже очищены от retired workflow-файлов и прямых ссылок на старые фазы.

## Cleanup

Во время cutover удалены:

- старые workflow- и plans-note, которые больше не нужны как рабочий слой;
- устаревшие template-файлы, не входящие в новый маршрут;
- helper-примеры, завязанные на прежний процесс.

## Definition of done

Переход считается завершенным, потому что:

- активный owner-layer больше не ведет в старый процесс;
- `launch-card` является последней точкой выбора до production;
- `review-notes` держит только `Preview gate` и `Final approval`;
- `build-plan` и validator живут в одном machine-контракте;
- корневая документация снова указывает на актуальный вход;
- sweep по активному контуру не показывает старых workflow-связей.
