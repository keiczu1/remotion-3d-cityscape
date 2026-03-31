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
- Какие точки данных еще отсутствуют: часть флагов отсутствует в `public/flags/`, поэтому для library promotion зафиксирован только сам hero/object family, а не dataset-wide flag coverage

## Инвентарь ассетов

| assetId | rankingItem | assetKind | localPath | sourceUrl | sourceLabel | discoveredBy | assetStatus | quality | usageStage | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| richest-women-dataset | all 93 entries | dataset | `public/final_ranking.json` | - | user-provided | user | selected | high | final | основной JSON для preview и будущего corridor-pass |
| richest-women-portraits | all 93 entries | image-set | `public/final_images/*.jpg` | - | user-provided | user | selected | high | final | портреты используются как image-first media-slot |
| shared-flags | countries with local flag assets | image-set | `public/flags/*.png` | - | existing repo assets | ai | selected | medium | final | flag shader опирается на уже существующие flag PNG из репозитория |
| review-still-final | entry #16 | review-artifact | `projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png` | - | local render | ai | selected | high | final | контрольный still финализированного hero-модуля |

## Очередь недостающих или заменяемых ассетов

- Для полного corridor-pass стоит добрать недостающие флаги в `public/flags/`, если в production timeline будут показаны страны без локального flag asset

## Заметки

- Этот manifest относится к hero-finalization pass, а не к полному corridor production package
- Library promotion не потребовал новых медиа-ассетов: в reusable-слой вынесен только код hero/object family
