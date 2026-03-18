---
name: timing
description: Кривые интерполяции в Remotion: linear, easing и spring-анимации
metadata:
  tags: spring, bounce, easing, interpolation
---

Простая линейная интерполяция делается через функцию `interpolate`.

```ts title="Going from 0 to 1 over 100 frames"
import { interpolate } from "remotion";

const opacity = interpolate(frame, [0, 100], [0, 1]);
```

По умолчанию значения не зажимаются, поэтому результат может выйти за диапазон `[0, 1]`.
Вот как включить clamp:

```ts title="Going from 0 to 1 over 100 frames with extrapolation"
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});
```

## Spring-анимации

Spring-анимации дают более естественное движение.
Со временем они переводят значение из `0` в `1`.

```ts title="Spring animation from 0 to 1 over 100 frames"
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const scale = spring({
  frame,
  fps,
});
```

### Физические параметры

Конфигурация по умолчанию: `mass: 1, damping: 10, stiffness: 100`.
Из-за этого перед остановкой анимация слегка подпрыгивает.

Переопределить config можно так:

```ts
const scale = spring({
  frame,
  fps,
  config: { damping: 200 },
});
```

Для естественного движения без bounce обычно подходит `{ damping: 200 }`.

Ниже несколько типичных конфигураций:

```tsx
const smooth = { damping: 200 }; // Плавно, без bounce
const snappy = { damping: 20, stiffness: 200 }; // Резко, с минимальным bounce
const bouncy = { damping: 8 }; // С заметным bounce
const heavy = { damping: 15, stiffness: 80, mass: 2 }; // Тяжелое, медленное движение
```

### Delay

По умолчанию анимация стартует сразу.
Параметр `delay` позволяет отложить старт на нужное число кадров.

```tsx
const entrance = spring({
  frame: frame - ENTRANCE_DELAY,
  fps,
  delay: 20,
});
```

### Duration

У `spring()` есть естественная длительность, зависящая от физических параметров.
Если ее нужно принудительно растянуть на конкретное число кадров, используй `durationInFrames`.

```tsx
const spring = spring({
  frame,
  fps,
  durationInFrames: 40,
});
```

### Комбинирование `spring()` с `interpolate()`

Можно преобразовать выход spring из диапазона `0-1` в любой другой диапазон:

```tsx
const springProgress = spring({
  frame,
  fps,
});

// Перевод в угол поворота
const rotation = interpolate(springProgress, [0, 1], [0, 360]);

<div style={{ rotate: rotation + "deg" }} />;
```

### Комбинирование нескольких spring

Spring возвращает обычные числа, поэтому над ними можно делать математику:

```tsx
const frame = useCurrentFrame();
const { fps, durationInFrames } = useVideoConfig();

const inAnimation = spring({
  frame,
  fps,
});
const outAnimation = spring({
  frame,
  fps,
  durationInFrames: 1 * fps,
  delay: durationInFrames - 1 * fps,
});

const scale = inAnimation - outAnimation;
```

## Easing

Easing можно добавить прямо в `interpolate`:

```ts
import { interpolate, Easing } from "remotion";

const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

По умолчанию используется `Easing.linear`.
Есть и другие варианты поведения:

- `Easing.in` для медленного старта с ускорением
- `Easing.out` для быстрого старта с замедлением
- `Easing.inOut`

А вот доступные кривые, от более линейных к более выраженным:

- `Easing.quad`
- `Easing.sin`
- `Easing.exp`
- `Easing.circle`

Поведение и кривая комбинируются вместе:

```ts
const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

Поддерживаются и cubic bezier-кривые:

```ts
const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```
