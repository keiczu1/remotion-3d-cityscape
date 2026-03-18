---
name: trimming
description: Паттерны trimming в Remotion: обрезка начала и конца анимации
metadata:
  tags: sequence, trim, clip, cut, offset
---

Используй `<Sequence>` с отрицательным значением `from`, чтобы обрезать начало анимации.

## Обрезка начала

Отрицательное значение `from` сдвигает время назад, поэтому анимация начинается как будто не с нуля:

```tsx
import { Sequence, useVideoConfig } from "remotion";

const fps = useVideoConfig();

<Sequence from={-0.5 * fps}>
  <MyAnimation />
</Sequence>;
```

Анимация появится уже на 15-м кадре своего внутреннего прогресса, а первые 15 кадров будут отброшены.
Внутри `<MyAnimation>` вызов `useCurrentFrame()` начнется с `15`, а не с `0`.

## Обрезка конца

Используй `durationInFrames`, чтобы размонтировать контент через заданную длительность:

```tsx
<Sequence durationInFrames={1.5 * fps}>
  <MyAnimation />
</Sequence>
```

Анимация проиграется 45 кадров, после чего компонент размонтируется.

## Trim и задержка одновременно

Вложенные sequences позволяют одновременно обрезать начало и сдвинуть момент появления:

```tsx
<Sequence from={30}>
  <Sequence from={-15}>
    <MyAnimation />
  </Sequence>
</Sequence>
```

Внутренняя sequence отрезает 15 кадров от начала, а внешняя сдвигает уже готовый результат на 30 кадров.
