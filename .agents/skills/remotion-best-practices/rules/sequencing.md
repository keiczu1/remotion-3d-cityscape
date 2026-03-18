---
name: sequencing
description: Паттерны sequencing в Remotion: задержка, обрезка и ограничение длительности элементов
metadata:
  tags: sequence, series, timing, delay, trim
---

Используй `<Sequence>`, чтобы сдвигать момент появления элемента на таймлайне.

```tsx
import { Sequence } from "remotion";

const {fps} = useVideoConfig();

<Sequence from={1 * fps} durationInFrames={2 * fps} premountFor={1 * fps}>
  <Title />
</Sequence>
<Sequence from={2 * fps} durationInFrames={2 * fps} premountFor={1 * fps}>
  <Subtitle />
</Sequence>
```

По умолчанию это оборачивает компонент в absolute fill контейнер.
Если такого поведения не нужно, используй prop `layout`:

```tsx
<Sequence layout="none">
  <Title />
</Sequence>
```

## Premounting

Это загружает компонент на таймлайне до фактического старта воспроизведения.
Любую `<Sequence>` лучше premount-ить заранее.

```tsx
<Sequence premountFor={1 * fps}>
  <Title />
</Sequence>
```

## Серии

Используй `<Series>`, когда элементы должны проигрываться друг за другом без наложения.

```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={45}>
    <Intro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <MainContent />
  </Series.Sequence>
  <Series.Sequence durationInFrames={30}>
    <Outro />
  </Series.Sequence>
</Series>;
```

Как и в случае с `<Sequence>`, элементы внутри `<Series.Sequence>` по умолчанию будут обернуты в absolute fill, если только `layout` не установлен в `none`.

### Series с overlap

Для overlap между последовательностями используй отрицательный `offset`:

```tsx
<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence offset={-15} durationInFrames={60}>
    {/* Стартует за 15 кадров до окончания SceneA */}
    <SceneB />
  </Series.Sequence>
</Series>
```

## Локальные кадры внутри `Sequence`

Внутри `Sequence` вызов `useCurrentFrame()` возвращает локальный кадр, начиная с `0`:

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent />
  {/* Внутри MyComponent useCurrentFrame() вернет 0-29, а не 60-89 */}
</Sequence>
```

## Вложенные `Sequence`

`Sequence` можно вкладывать друг в друга для более сложного тайминга:

```tsx
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Sequence from={15} durationInFrames={90} layout="none">
    <Title />
  </Sequence>
  <Sequence from={45} durationInFrames={60} layout="none">
    <Subtitle />
  </Sequence>
</Sequence>
```

## Вложение одной composition в другую

Чтобы поместить одну composition внутрь другой, используй `<Sequence>` с props `width` и `height`, задающими размер вложенной композиции.

```tsx
<AbsoluteFill>
  <Sequence width={COMPOSITION_WIDTH} height={COMPOSITION_HEIGHT}>
    <CompositionComponent />
  </Sequence>
</AbsoluteFill>
```
