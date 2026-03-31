# Review Notes

## Проект

- Slug проекта: `2026-03-30-richest-women`
- Человекочитаемое название: Самые богатые женщины
- Начато: 2026-03-30
- Обновлено: 2026-03-31

## Режиссерский план

- Цикл review: 1
- Проверяемый director-pass: `interactive hero-finalization pass`
- Решение: `approved`
- Что подтверждено: выбран один production-baseline hero/object family для длинных биографических описаний: portrait-first stele с правой biography-card, value-driven pedestal и флагом на мачте
- Что нужно изменить: -
- Можно ли переходить к build-plan: `yes`
- Подтверждающие комментарии: пользователь последовательно утвердил variant 1, затем довел layout, photo policy, flag grammar, pedestal и biography-card до финального состояния

## Предпросмотр

- Цикл review: 1
- Пакет предпросмотра: композиция `RichestWomenVariantComparison`, финальный single-hero preview на entry `#16 Marguerite Harbert`, контрольный still `projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png`
- Решение: `approve`
- Проверенный охват: hero-module, portrait-slot, typography, right biography-card, flag/pole grammar, value-driven pedestal
- Что подтверждено: фото не кропается по высоте, имя переносится в 2 строки, biography-card адаптируется по контенту, флаг сидит в grammar `most-visited-websites`, визуальный шум убран
- Обещанные world-slot из `director-pass`: `n/a`
- Реально реализованные world-slot: `n/a`
- Проверенное покрытие сцен: `scene-1`
- Результат director-pass-проверки: `warning`
- Director-pass-заметки: container используется как preview-only hero stage и не претендует на полный 4-scene corridor-pass
- Перетягивает ли вторичная жизнь внимание с героя: `no`
- Результат layout-проверки: `ok`
- Layout-заметки: стела, biography-card, мачта и pedestal читаются как один production-like объект без overlap на текстовые зоны
- Результат image-first policy-проверки: `ok`
- Image-first policy-заметки: media доминирует, rank живет поверх media, data-zone защищена, длинный text вынесен из shell в правую карточку
- Результат browser/Studio-проверки: `ok`
- Метод browser/Studio-проверки: `built-in-browser`
- Результат console/runtime-проверки: `ok`
- Папка screenshot-артефактов: `projects/2026-03-30-richest-women/review-artifacts/`
- Visual checklist:
  - Hero / readability: имя, годы и wealth читаются без ужатия
  - Image-first / media policy: portrait-slot сохраняет высоту фото без кропа
  - Camera / pacing: reveal мягкий и staged, без визуального шума
  - Environment / secondary-life: intentionally omitted в этом preview-only pass
  - Director-pass match: финальный hero соответствует утвержденному пользователем варианту 1
- Какие изменения обязательны: выполнены в этом же pass
- Можно ли идти дальше без повторного предпросмотра: yes
- Нужно ли обязательно повторить предпросмотр: no
- Верификация или подтверждающие материалы: `npm test`, `npm run lint`, `npm run build`, `npx remotion still build RichestWomenVariantComparison projects/2026-03-30-richest-women/review-artifacts/richest-women-variant-comparison-website-flag-baseline.png --frame=180`

## Финальное утверждение

- Цикл финального review: 1
- Статус: `final-approved-with-notes`
- Проверенный build: `npm test`, `npm run lint`, `npm run build`
- Проверенный снимок данных: `public/final_ranking.json`, `projects/2026-03-30-richest-women/asset-manifest.md`
- Заметки: финально утвержден hero/object family и его Studio-ready preview; полный corridor package, director-pass и scene-build полного ролика остаются отдельным будущим этапом
- Обязательные последующие действия: library-audit выполнен в этом же pass
- Блокирующие причины: -

## Аудит библиотеки

- Дата аудита: 2026-03-31
- Результат аудита: `auto-promotion-applied`
- Покрытие существующей библиотекой: reusable reveal, scene-preset, art-object и world-layer слои уже существовали; новым зрелым кандидатом стал именно biography-oriented hero/object family
- Проверенные категории: `camera preset`, `timing preset`, `reveal/effect module`, `hero/object family`, `background / ambient / secondary-life system`, `utility / helper`
- Категории без зрелых кандидатов: `camera preset`, `timing preset`, `reveal/effect module`, `background / ambient / secondary-life system`, `utility / helper`
- Обновления реестра: `portrait-biography-stele-v1`

| candidateId | candidateType | currentStatus | sourceLocation | reusableWhy | proposedDecision | targetPlacement | finalEvidence | docsUpdated | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| portrait-biography-stele-v1 | hero/object family | project-local | `src/compositions/2026-03-30-richest-women-variants/RichestWomenVariantsComposition.tsx` | модуль отделим от темы "богатые женщины": он решает общую corridor-задачу image-first portrait stele с длинной biography-card, pedestal и flag assembly | promote-to-library | `src/lib/ranking-corridor/hero/portrait-biography-stele.tsx`, `src/lib/ranking-corridor/hero/index.ts` | accepted user review, final still, library-backed preview, `npm test`, `npm run lint`, `npm run build` | `projects/2026-03-30-richest-women/launch-card.md`, `projects/2026-03-30-richest-women/asset-manifest.md`, `projects/2026-03-30-richest-women/review-notes.md`, `docs/library/ranking-corridor-module-registry.md` | в библиотеку поднят именно hero/object family; dataset binding, country-to-flag mapping и composition-level wealth normalization остаются project-local |

## Общие заметки

- Preview composition переведена на library-backed hero вместо локальной копии
- Пользовательские dataset-файлы и портреты добавлены в коммит как source-of-truth для этого preview-container
