---
name: transitions
description: Переходы между сценами и overlays для Remotion через TransitionSeries
metadata:
  tags: transitions, overlays, fade, slide, wipe, scenes
---

## TransitionSeries

`<TransitionSeries>` собирает сцены в цепочку и поддерживает два способа усилить точку склейки между ними:

- **Transitions** через `<TransitionSeries.Transition>`: crossfade, slide, wipe и другие переходы между двумя сценами. Они укорачивают итоговый таймлайн, потому что обе сцены частично проигрываются одновременно.
- **Overlays** через `<TransitionSeries.Overlay>`: накладывают эффект поверх точки склейки, например light leak, но не сокращают общую длительность таймлайна.

Дочерние элементы внутри `<TransitionSeries>` позиционируются абсолютно.

## Подготовка

```bash
npx remotion add @remotion/transitions
```

## Пример transition

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Пример overlay

В роли overlay можно использовать любой React-компонент. Для готового эффекта смотри правило `light-leaks`.

```tsx
import { TransitionSeries } from "@remotion/transitions";
import { LightLeak } from "@remotion/light-leaks";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Overlay durationInFrames={20}>
    <LightLeak />
  </TransitionSeries.Overlay>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Смешивание transitions и overlays

Transitions и overlays могут сосуществовать в одном `<TransitionSeries>`, но overlay нельзя ставить вплотную к transition или к другому overlay.

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
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
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneC />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Параметры transition

`<TransitionSeries.Transition>` требует:

- `presentation` - визуальный эффект, например `fade()`, `slide()` или `wipe()`
- `timing` - объект, управляющий скоростью и easing, например `linearTiming()` или `springTiming()`

## Параметры overlay

`<TransitionSeries.Overlay>` принимает:

- `durationInFrames` - как долго overlay должен быть виден
- `offset?` - сдвиг относительно центра точки склейки. Положительное значение двигает overlay позже, отрицательное раньше. Значение по умолчанию: `0`

## Доступные типы transition

Переходы импортируются из отдельных модулей:

```tsx
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
```

## Slide transition с направлением

```tsx
import { slide } from "@remotion/transitions/slide";

<TransitionSeries.Transition
  presentation={slide({ direction: "from-left" })}
  timing={linearTiming({ durationInFrames: 20 })}
/>;
```

Поддерживаемые направления: `"from-left"`, `"from-right"`, `"from-top"`, `"from-bottom"`

## Варианты timing

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

// Линейный timing: постоянная скорость
linearTiming({ durationInFrames: 20 });

// Spring timing: более органичное движение
springTiming({ config: { damping: 200 }, durationInFrames: 25 });
```

## Расчет длительности

Transitions перекрывают соседние сцены, поэтому итоговая длина композиции получается **короче**, чем сумма длительностей всех sequence. Overlays на общую длительность **не влияют**.

Пример для двух sequence по 60 кадров и transition на 15 кадров:

- без transition: `60 + 60 = 120` кадров
- с transition: `60 + 60 - 15 = 105` кадров

Если между другими сценами добавить overlay, общая длина не изменится.

### Получение длительности transition

Используй метод `getDurationInFrames()` у объекта timing:

```tsx
import { linearTiming, springTiming } from "@remotion/transitions";

const linearDuration = linearTiming({
  durationInFrames: 20,
}).getDurationInFrames({ fps: 30 });
// Возвращает 20

const springDuration = springTiming({
  config: { damping: 200 },
}).getDurationInFrames({ fps: 30 });
// Возвращает длительность, вычисленную на основе spring physics
```

У `springTiming` без явно заданного `durationInFrames` длительность зависит от `fps`, потому что вычисляется момент, когда spring успокаивается.

### Расчет общей длительности composition

```tsx
import { linearTiming } from "@remotion/transitions";

const scene1Duration = 60;
const scene2Duration = 60;
const scene3Duration = 60;

const timing1 = linearTiming({ durationInFrames: 15 });
const timing2 = linearTiming({ durationInFrames: 20 });

const transition1Duration = timing1.getDurationInFrames({ fps: 30 });
const transition2Duration = timing2.getDurationInFrames({ fps: 30 });

const totalDuration =
  scene1Duration +
  scene2Duration +
  scene3Duration -
  transition1Duration -
  transition2Duration;
// 60 + 60 + 60 - 15 - 20 = 145 frames
```
