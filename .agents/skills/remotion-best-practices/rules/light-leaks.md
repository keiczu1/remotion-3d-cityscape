---
name: light-leaks
description: Эффекты light leak overlay для Remotion через @remotion/light-leaks.
metadata:
  tags: light-leaks, overlays, effects, transitions
---

## Эффект Light Leaks

Это работает только начиная с Remotion `4.0.415`. Проверить текущую версию можно через `npx remotion versions`, а обновиться через `npx remotion upgrade`.

`<LightLeak>` из `@remotion/light-leaks` рендерит WebGL-эффект light leak. В первой половине своей длительности он раскрывается, а во второй половине уходит обратно.

Обычно его используют внутри `<TransitionSeries.Overlay>`, чтобы проигрывать поверх точки склейки между двумя сценами. По `TransitionSeries` смотри правило `transitions`.

## Подготовка

```bash
npx remotion add @remotion/light-leaks
```

## Базовое использование с `TransitionSeries`

```tsx
import { TransitionSeries } from "@remotion/transitions";
import { LightLeak } from "@remotion/light-leaks";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Overlay durationInFrames={30}>
    <LightLeak />
  </TransitionSeries.Overlay>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Параметры

- `durationInFrames?` - по умолчанию берется длительность родительской sequence или composition. В первой половине эффект раскрывается, во второй уходит обратно.
- `seed?` - задает форму паттерна light leak. Разные значения дают разный рисунок. Значение по умолчанию: `0`.
- `hueShift?` - поворачивает hue в градусах от `0` до `360`. Значение по умолчанию: `0`, это диапазон от желтого к оранжевому. `120` дает зеленый, `240` дает синий.

## Настройка внешнего вида

```tsx
import { LightLeak } from "@remotion/light-leaks";

// Синий light leak с другим паттерном
<LightLeak seed={5} hueShift={240} />;

// Зеленый light leak
<LightLeak seed={2} hueShift={120} />;
```

## Отдельное использование

`<LightLeak>` можно использовать и вне `<TransitionSeries>`, например как декоративный overlay в любой composition:

```tsx
import { AbsoluteFill } from "remotion";
import { LightLeak } from "@remotion/light-leaks";

const MyComp: React.FC = () => (
  <AbsoluteFill>
    <MyContent />
    <LightLeak durationInFrames={60} seed={3} />
  </AbsoluteFill>
);
```
