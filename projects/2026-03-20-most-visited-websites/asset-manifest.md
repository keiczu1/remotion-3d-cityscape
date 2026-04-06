# Asset Manifest

## Проект

- Slug проекта: `2026-03-20-most-visited-websites`
- Человеческое название: Самые посещаемые сайты в мире
- Обновлено: 2026-03-21
- Статус манифеста: `final-ready`

## Снимок данных

- Режим источника данных: `user-dataset` (данные из reference-проекта `ranking-towers`)
- Проверено на дату: 2026-03-20
- Локальный рабочий dataset: `src/compositions/most-visited-websites/model/data.ts`
- Основные источники: `src/compositions/ranking-towers/model/data.ts` (reference-проект)
- Заметки по иерархии источников: данные копируются из reference без изменений
- Заметки по конфликтам: нет
- Какие точки данных еще отсутствуют: нет — полный набор из 40 объектов

## Инвентарь ассетов

Ассеты (favicons и flags) берутся из существующих путей `public/favicons/` и `public/flags/`, уже загруженных для reference-проекта.

| assetId | rankingItem | assetKind | localPath | sourceUrl | sourceLabel | discoveredBy | assetStatus | quality | usageStage | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| favicons-all | all 40 sites | favicon | public/favicons/*.png | — | reference project | ai | selected | high | both | Переиспользуются из ranking-towers |
| flags-all | all countries | flag | public/flags/*.{png,svg} | — | shared repo asset base | ai | selected | high | both | Переиспользуются из shared `public/flags/`; единый shared baseline теперь идет через world `svg` pack, legacy png оставлены только как исторические ассеты |

## Очередь недостающих или заменяемых ассетов

- нет

## Заметки

- Все ассеты полностью переиспользуются из reference-проекта `ranking-towers`
- Новому проекту не нужна отдельная директория `public/ranking-corridor/most-visited-websites/` — favicons и flags уже доступны
- После optimization-pass код не вводит новых project-local ассетов: воспроизводимость preview по данным и ассетам сохраняется
- После final-approved и historical reusable review-pass asset-set не менялся: promotion затронул только reusable math/preset слой и документацию, без новых медиа-ассетов
