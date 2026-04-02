# Asset Manifest

## Проект

- Slug проекта: `2026-03-30-richest-women`
- Человекочитаемое название: Самые богатые женщины
- Обновлено: 2026-04-02
- Статус манифеста: `final-ready`

## Снимок данных

- Режим источника данных: `user-dataset`
- Проверено на дату: 2026-03-31
- Локальный рабочий dataset: `public/final_ranking.json`
- Основные источники: `public/final_ranking.json`, `public/final_images/`
- Заметки по иерархии источников: composition читает данные напрямую из пользовательского JSON, а фотографии - из `public/final_images/`
- Заметки по конфликтам: flag-layer использует project-local mapping `country -> flagCode`, потому что dataset хранит полные названия стран
- Какие точки данных еще отсутствуют: отсутствующих country-flag assets для текущего dataset нет; shared `public/flags/` теперь содержит полный world flag pack и единый `svg` baseline

## Инвентарь ассетов

| assetId | rankingItem | assetKind | localPath | sourceUrl | sourceLabel | discoveredBy | assetStatus | quality | usageStage | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| richest-women-dataset | all 93 entries | dataset | `public/final_ranking.json` | - | user-provided | user | selected | high | final | основной JSON для preview и будущего corridor-pass |
| richest-women-portraits | all 93 entries | image-set | `public/final_images/*.jpg` | - | user-provided | user | selected | high | final | портреты используются как image-first media-slot |
| richest-women-portraits-optimized | all 93 entries | image-set | `public/ranking-corridor/2026-03-30-richest-women/photos-optimized/*.jpg` | - | derived from user-provided portraits | ai | selected | high | final | project-local optimized runtime pack для `RichestWomenCorridor`: уменьшенный decode-cost без потери читаемости в 1080p |
| shared-flags | countries with local flag assets | image-set | `public/flags/*.{png,svg}` | - | existing repo assets + imported world svg pack | ai | selected | high | final | shared flag base покрывает текущий dataset и общий мировой набор country flags; единый runtime baseline идет через `svg`, legacy png сохранены только как исторические assets |
| review-still-final | entry #16 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png` | - | local render | ai | selected | high | final | контрольный still финализированного hero-модуля |
| review-still-refresh-2026-04-01 | entry #16 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png` | - | local render | ai | selected | high | final | still обновлен после user-refresh library hero: widened right card, larger content typography, front-facing shell и sculpted stone pedestal |
| review-still-tail-perf-2026-04-02 | frame 75200 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/perf-tail-fixed-75200.png` | - | local render | ai | selected | high | final | контрольный still late-tail после perf-fix: visual contract коридора сохранен, а invisible off-screen overlay больше не участвует в runtime |
| review-still-cinematic-perf-2026-04-02 | frame 38000 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/perf-cinematic-batch-38000.png` | - | local render | ai | selected | high | final | контрольный still cinematic-overview после instanced stele batch: layout, flag grammar и hero readability сохранены, а повторяющиеся shell-слои больше не платят отдельными draw calls |
| review-still-overlay-freeze-2026-04-02 | frame 38000 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/perf-overlay-freeze-38000.png` | - | local render | ai | selected | high | final | контрольный still после freeze settled overlay-state: внешний вид biography-card сохранен, но browser/runtime больше не перерисовывает ее внутренний shimmer/glow на каждом кадре |
| review-still-sidebar-opacity-fix-2026-04-02 | frame 12455 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/sidebar-opacity-fix-12455.png` | - | local render | ai | selected | high | final | контрольный still ранней reveal-фазы Rosalia Mera после развязки parent overlay opacity и side-card: правая biography-card снова держит плотный темный фон без просвета world-layer |
| review-still-main-pass-timing-fix-2026-04-02 | frames 15658/15685 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/timing-fix-15658.png`, `projects/2026-03-30-richest-women/review-artifacts/timing-fix-15685.png` | - | local render | ai | selected | high | final | контрольные still сразу после порога `4:17`: на раннем кадре следующая карточка еще входит, на позднем уже раскрыта; это подтверждает возврат entrance-анимации после переноса slowdown только на cinematic tail |
| review-still-side-card-transition-fix-2026-04-02 | frames 20350/20358/20366 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/transition-fix-20350.png`, `projects/2026-03-30-richest-women/review-artifacts/transition-fix-20358.png`, `projects/2026-03-30-richest-women/review-artifacts/transition-fix-20366.png` | - | local render | ai | selected | high | final | контрольные still перехода `Barbara Cox Anthony`: panel правой biography-card больше не плавает и не светлеет при входе, а анимация остается только на тексте внутри карточки |

## Очередь недостающих или заменяемых ассетов

- Для новых datasets с дополнительными странами нужно только добрасывать новые assets и code mapping, но текущий richest-women snapshot покрыт полностью

## Заметки

- Этот manifest относится к hero-finalization pass, а не к полному corridor production package
- Library promotion не потребовал новых медиа-ассетов: в reusable-слой вынесен только код hero/object family
- `2026-04-01 refresh`: визуальный контракт library hero изменился на уровне layout/code, но не потребовал новых внешних ассетов; обновлен только контрольный still того же preview-container
- `2026-04-02 perf pass`: runtime проекта переведен на optimized portrait pack, потому что исходные `1200x1500` фото были избыточны для реального photo-slot `RichestWomenCorridor`
- `2026-04-02 tail perf fix`: root cause находился не в количестве mounted стел, а в invisible current-focus overlay, который в late tail продолжал рендериться далеко вне viewport и раздувался до многотысячного DOM-card; после fix визуально подтвержден still `perf-tail-fixed-75200.png`
- `2026-04-02 cinematic perf fix`: в cinematic-участке повторяющиеся stele shell/top-cap/accent-strip/mast слои переведены на instanced batch без изменения видимой flag-wave текстуры и approved composition grammar; контрольный still сохранен как `perf-cinematic-batch-38000.png`
- `2026-04-02 overlay settle fix`: после сравнения с `most-visited-websites` и `2026-03-25-strongest-pokemon` подтверждено, что проблемой был не object count, а тяжелый DOM overlay; settled biography-card теперь freeze-ится в финальном состоянии вместо постоянной внутренней repaint-анимации
- `2026-04-02 sidebar opacity fix`: у current-focus overlay правая biography-card больше не наследует внешний fade контейнера после появления side-card; opacity остается только на левой stele-shell, поэтому темный фон справа не становится полупрозрачным в handoff/reveal-фазе
- `2026-04-02 main-pass timing fix`: legacy slowdown больше не стартует на `4:17`; для `RichestWomenCorridor` весь ranking main-pass снова живет в 1x-тайминге, а замедление оставлено только на cinematic tail после `sequenceCompleteFrame`, поэтому камера не “залипает” посреди прохода и biography-card снова появляется с нормальной entrance-анимацией
- `2026-04-02 side-card transition fix`: правый biography panel больше не анимирует собственный background через `opacity + translate`; во время перехода panel остается в финальной позиции с плотным темным фоном, а fade/slide сохранены только у внутреннего текстового контента
- `2026-04-02 camera retime pass`: main-pass камеры переведен с continuous rail-follow на формат `cut -> hold -> orbit`; runtime теперь держит активную стелу в читаемом окне около `240` кадров, переключается на следующую через короткий `24`-кадровый handoff и использует только легкую орбитальную левитацию без непрерывного rail-проезда
- `2026-04-02 camera retime stills`: визуальный контроль нового ритма сохранен в `camera-hold-cut-2792.png`, `camera-hold-cut-2816.png`, `camera-hold-cut-2920.png`, `camera-hold-cut-3020.png`, `camera-hold-cut-13352.png`, `camera-hold-cut-13500.png`; эти артефакты подтверждают резкий cut на новый пьедестал и дальнейшее удержание камеры на объекте
- `2026-04-02 rail handoff correction`: user-review подтвердил, что hard cut между башнями ломает формат. Main-pass handoff исправлен на короткий rail-проезд: текущая башня сохраняет focus до `arriveFrame` следующей, а камера физически доезжает по `X/lookX/Z` к новому пьедесталу, после чего продолжает читаемый hold и orbit
- `2026-04-02 rail handoff speed tweak`: скорость перехода дополнительно снижена на `25%` относительно rail-версии с `36` кадрами; move-gap увеличен до `48` кадров, а hold и orbit после прибытия оставлены без изменений
- `2026-04-02 rail handoff speed tweak v2`: по follow-up правке скорость перехода снижена еще на `50%` относительно версии с `48` кадрами; move-gap увеличен до `72` кадров без изменения hold и post-arrival orbit
- `2026-04-02 stable rail hold pass`: post-arrival motion переведен с orbit-like `back/forward` качания на стабильный rail-дрифт; камера после прибытия почти не меняет глубину, а продолжает ровный пролет вдоль ряда с мягким hover по `Y`
- `2026-04-02 stable rail hold correction`: финальная корректировка убрала post-arrival settle назад; после `arriveFrame` камера сохраняет глубину и продолжает только монотонный пролет вправо
- `2026-04-02 rail handoff stills`: контрольные артефакты rail-переезда сохранены как `rail-move-3164.png`, `rail-move-3182.png`, `rail-move-3198.png`; они фиксируют сам проезд, позднюю фазу доезда и прибытие на новую башню
