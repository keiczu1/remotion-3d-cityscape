# Ranking Corridor: Constructor Catalog

Этот файл описывает человекочитаемый слой поверх machine-readable constructor catalog.

Source-of-truth для автоматизации живет в:

- `src/lib/ranking-corridor/catalog/constructor-catalog.ts`

## Scene count

- `scene-count-4` — `4` сцены, базовый и единственный поддерживаемый scene-count для формата.

## Camera packages

- `camera-soft-side-orbit-classic-v1` — `Классический башенный проход`
  - package id: `soft-side-orbit-classic-v1`
  - source projects: `ranking-towers`, `2026-03-25-strongest-pokemon`
- `camera-rail-focus-vip-finale-v1` — `Прямой рельсовый фокус`
  - package id: `rail-focus-vip-finale-v1`
  - source projects: `2026-03-20-most-visited-websites`
- `camera-biography-stele-focus-hold-v1` — `Biography hold`
  - package id: `biography-stele-focus-hold-v1`
  - source projects: `2026-03-30-richest-women`

## Hero packages

- `hero-tower-hologram-monolith-v1` — `Башенный монолит`
- `hero-media-stele-shell-v1` — `Медиа-стела`
- `hero-portrait-biography-stele-v1` — `Портретная biography-стела`
- `hero-stone-altar-pedestal-v1` — `Каменный altar-пьедестал`

## World options

- `horizon-mountain-ridge-v1` — дальний горный горизонт
- `forest-backdrop-v1` — лесной дальний фон
- `birch-backdrop-v1` — светлый березовый боковой фон
- `wind-turbine-v1` — боковые ветряки
- `low-poly-cloud-v1` — облака
- `steam-train-line-v1` — поезд
- `highway-ribbon-v1` — шоссе с машинами
- `corridor-relief-ground-v1` — рельефная земля
- `storm-effects-v1` — грозовые эффекты

Если варианта нет в этом каталоге, он не считается частью default constructor path.
