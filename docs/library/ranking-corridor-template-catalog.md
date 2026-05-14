# Ranking Corridor: Template Catalog

Этот файл описывает человекочитаемый слой поверх machine-readable template catalog.

Source-of-truth для автоматизации живет в:

- `src/lib/ranking-corridor/catalog/template-catalog.ts`

## Активные template entry

### `classic-tower-template-v1`

- Человеческое имя: `Classic Tower Corridor`
- База: `src/compositions/ranking-towers`
- Режим: `composition-only`
- Камера: `camera-soft-side-orbit-classic-v1`
- Герой: `hero-tower-hologram-monolith-v1`
- Допустимая адаптация: `theme-tuning`

### `media-stele-corridor-template-v1`

- Человеческое имя: `Media Stele Corridor`
- База: `2026-03-20-most-visited-websites`
- Режим: `project-container`
- Камера: `camera-rail-focus-vip-finale-v1`
- Герой: `hero-media-stele-shell-v1`
- Допустимая адаптация: `data-only`

### `nature-altar-corridor-template-v1`

- Человеческое имя: `Nature Altar Corridor`
- База: `2026-03-25-strongest-pokemon`
- Режим: `project-container`
- Камера: `camera-rail-focus-vip-finale-v1`
- Герой: `hero-stone-altar-pedestal-v1`
- Допустимая адаптация: `scene-world-tuning`

### `portrait-biography-corridor-template-v1`

- Человеческое имя: `Portrait Biography Corridor`
- База: `2026-03-30-richest-women`
- Режим: `project-container`
- Камера: `camera-biography-stele-focus-hold-v1`
- Герой: `hero-portrait-biography-stele-v1`
- Допустимая адаптация: `theme-tuning`

## Materialization

- dry-run: `npm run scaffold:template -- <template-id> <project-slug> --dry-run`
- real scaffold: `npm run scaffold:template -- <template-id> <project-slug>`

Текущий v1-поток materialize-ит:

- `projects/<project-slug>/`, если у template есть `projectContainerPath`
- `src/compositions/<project-slug>/`
- `public/ranking-corridor/<project-slug>/`, если у template есть локальные public assets
- регистрацию новой композиции в `src/Root.tsx`

При клонировании из source project не копируются директории с результатами старых экспортов:

- `review-artifacts/`
- `exports/`
