---
name: calculate-metadata
description: Динамическая настройка длительности composition, размеров и props
metadata:
  tags: calculateMetadata, duration, dimensions, props, dynamic
---

# Использование `calculateMetadata`

Используй `calculateMetadata` у `<Composition>`, чтобы до рендера динамически задавать длительность, размеры и преобразованные props.

```tsx
<Composition
  id="MyComp"
  component={MyComponent}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ videoSrc: "https://remotion.media/video.mp4" }}
  calculateMetadata={calculateMetadata}
/>
```

## Задание длительности по видео

Используй правила [`getVideoDuration`](./get-video-duration.md) и [`getVideoDimensions`](./get-video-dimensions.md), чтобы получить длительность и размеры видео:

```tsx
import { CalculateMetadataFunction } from "remotion";
import { getVideoDuration } from "./get-video-duration";

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const durationInSeconds = await getVideoDuration(props.videoSrc);

  return {
    durationInFrames: Math.ceil(durationInSeconds * 30),
  };
};
```

## Подгонка размеров под видео

Используй правило [`getVideoDimensions`](./get-video-dimensions.md), чтобы получить размеры видео:

```tsx
import { CalculateMetadataFunction } from "remotion";
import { getVideoDuration } from "./get-video-duration";
import { getVideoDimensions } from "./get-video-dimensions";

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const dimensions = await getVideoDimensions(props.videoSrc);

  return {
    width: dimensions.width,
    height: dimensions.height,
  };
};
```

## Задание длительности по нескольким видео

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const metadataPromises = props.videos.map((video) =>
    getVideoDuration(video.src),
  );
  const allMetadata = await Promise.all(metadataPromises);

  const totalDuration = allMetadata.reduce(
    (sum, durationInSeconds) => sum + durationInSeconds,
    0,
  );

  return {
    durationInFrames: Math.ceil(totalDuration * 30),
  };
};
```

## Задание `defaultOutName`

Можно задать имя выходного файла по умолчанию на основе props:

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  return {
    defaultOutName: `video-${props.id}.mp4`,
  };
};
```

## Преобразование props

До рендера можно загрузить данные или преобразовать props:

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
  abortSignal,
}) => {
  const response = await fetch(props.dataUrl, { signal: abortSignal });
  const data = await response.json();

  return {
    props: {
      ...props,
      fetchedData: data,
    },
  };
};
```

`abortSignal` отменяет устаревшие запросы, когда props меняются в Studio.

## Возвращаемое значение

Все поля опциональны. Возвращенные значения переопределяют props у `<Composition>`:

- `durationInFrames`: количество кадров
- `width`: ширина композиции в пикселях
- `height`: высота композиции в пикселях
- `fps`: кадров в секунду
- `props`: преобразованные props, передаваемые в компонент
- `defaultOutName`: имя выходного файла по умолчанию
- `defaultCodec`: codec для рендера по умолчанию
