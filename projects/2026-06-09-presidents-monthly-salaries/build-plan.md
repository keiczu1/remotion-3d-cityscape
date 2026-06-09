# Build Plan

## Проект
- Slug проекта: `2026-06-09-presidents-monthly-salaries`
- Текущая фаза: `studio-ready-check`
- Статус плана: `completed`

## Этапы
- Data snapshot: собрать `data.json` из CSV, исключив строки без числовой зарплаты.
- Composition clone: адаптировать клон `2026-05-14-best-selling-cars` под salary/leader data.
- Population layer: добавить понятный secondary visual для населения.
- Registration: добавить composition id в `src/Root.tsx`.
- Verification: прогнать data validation, tests, lint, build и Studio smoke.

## Готово когда
- Новая композиция открывается в Remotion Studio.
- Зарплата является главной метрикой высоты и порядка.
- Население видно как контекст масштаба, но не спорит с зарплатой.
- Все ассеты локальные, без сетевой зависимости в рендере.

## Проверки
- `npm run validate:data -- 2026-06-09-presidents-monthly-salaries` — passed.
- `npm test` — passed.
- `npm run lint` — passed.
- `npm run build` — passed.
- `npm run dev -- --port 3000` — Studio responded with HTTP 200.
- `npx remotion still 2026-06-09-presidents-monthly-salaries projects\2026-06-09-presidents-monthly-salaries\exports\frame-720-overlay.png --frame=720` — passed, readable overlay verified.
- `npx remotion still 2026-06-09-presidents-monthly-salaries projects\2026-06-09-presidents-monthly-salaries\exports\qa-final-verified.png --frame=22200 --bundle-cache=false` — passed, finale verified.

## Visual QA
- Intro: тема и caveat читаются.
- Main pass: overlay показывает rank, лидера, страну, месячную зарплату и население без конфликта с 3D-портретами.
- Population scale: световая платформа у основания и шкала в overlay дают ощущение масштаба страны, но не меняют критерий рейтинга.
- Finale: `#1` Хавьер Милей, Аргентина, `$208,000 / месяц`, население `46.4 млн`.
