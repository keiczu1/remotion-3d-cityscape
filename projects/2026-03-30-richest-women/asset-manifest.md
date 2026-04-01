# Asset Manifest

## Проект

- Slug проекта: `2026-03-30-richest-women`
- Человекочитаемое название: Самые богатые женщины
- Обновлено: 2026-03-31
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
| shared-flags | countries with local flag assets | image-set | `public/flags/*.{png,svg}` | - | existing repo assets + imported world svg pack | ai | selected | high | final | shared flag base покрывает текущий dataset и общий мировой набор country flags; единый runtime baseline идет через `svg`, legacy png сохранены только как исторические assets |
| review-still-final | entry #16 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png` | - | local render | ai | selected | high | final | контрольный still финализированного hero-модуля |
| review-still-refresh-2026-04-01 | entry #16 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png` | - | local render | ai | selected | high | final | still обновлен после user-refresh library hero: widened right card, larger content typography, front-facing shell и sculpted stone pedestal |

## Очередь недостающих или заменяемых ассетов

- Для новых datasets с дополнительными странами нужно только добрасывать новые assets и code mapping, но текущий richest-women snapshot покрыт полностью

## Заметки

- Этот manifest относится к hero-finalization pass, а не к полному corridor production package
- Library promotion не потребовал новых медиа-ассетов: в reusable-слой вынесен только код hero/object family
- `2026-04-01 refresh`: визуальный контракт library hero изменился на уровне layout/code, но не потребовал новых внешних ассетов; обновлен только контрольный still того же preview-container
