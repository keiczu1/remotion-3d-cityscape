---
name: extract-frames
description: Извлечение кадров из видео по таймкодам через Mediabunny
metadata:
  tags: frames, extract, video, thumbnail, filmstrip, canvas
---

# Извлечение кадров из видео

Используй Mediabunny, чтобы извлекать кадры из видео по конкретным таймкодам. Это полезно для генерации thumbnails, filmstrip и обработки отдельных кадров.

## Функция `extractFrames()`

Эту функцию можно скопировать в любой проект.

```tsx
import {
  ALL_FORMATS,
  Input,
  UrlSource,
  VideoSample,
  VideoSampleSink,
} from "mediabunny";

type Options = {
  track: { width: number; height: number };
  container: string;
  durationInSeconds: number | null;
};

export type ExtractFramesTimestampsInSecondsFn = (
  options: Options,
) => Promise<number[]> | number[];

export type ExtractFramesProps = {
  src: string;
  timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
  onVideoSample: (sample: VideoSample) => void;
  signal?: AbortSignal;
};

export async function extractFrames({
  src,
  timestampsInSeconds,
  onVideoSample,
  signal,
}: ExtractFramesProps): Promise<void> {
  using input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src),
  });

  const [durationInSeconds, format, videoTrack] = await Promise.all([
    input.computeDuration(),
    input.getFormat(),
    input.getPrimaryVideoTrack(),
  ]);

  if (!videoTrack) {
    throw new Error("No video track found in the input");
  }

  if (signal?.aborted) {
    throw new Error("Aborted");
  }

  const timestamps =
    typeof timestampsInSeconds === "function"
      ? await timestampsInSeconds({
          track: {
            width: videoTrack.displayWidth,
            height: videoTrack.displayHeight,
          },
          container: format.name,
          durationInSeconds,
        })
      : timestampsInSeconds;

  if (timestamps.length === 0) {
    return;
  }

  if (signal?.aborted) {
    throw new Error("Aborted");
  }

  const sink = new VideoSampleSink(videoTrack);

  for await (using videoSample of sink.samplesAtTimestamps(timestamps)) {
    if (signal?.aborted) {
      break;
    }

    if (!videoSample) {
      continue;
    }

    onVideoSample(videoSample);
  }
}
```

## Базовое использование

Извлечение кадров по конкретным таймкодам:

```tsx
await extractFrames({
  src: "https://remotion.media/video.mp4",
  timestampsInSeconds: [0, 1, 2, 3, 4],
  onVideoSample: (sample) => {
    const canvas = document.createElement("canvas");
    canvas.width = sample.displayWidth;
    canvas.height = sample.displayHeight;
    const ctx = canvas.getContext("2d");
    sample.draw(ctx!, 0, 0);
  },
});
```

## Создание filmstrip-ленты

Используй callback, чтобы динамически вычислять таймкоды на основе metadata видео:

```tsx
const canvasWidth = 500;
const canvasHeight = 80;
const fromSeconds = 0;
const toSeconds = 10;

await extractFrames({
  src: "https://remotion.media/video.mp4",
  timestampsInSeconds: async ({ track, durationInSeconds }) => {
    const aspectRatio = track.width / track.height;
    const amountOfFramesFit = Math.ceil(
      canvasWidth / (canvasHeight * aspectRatio),
    );
    const segmentDuration = toSeconds - fromSeconds;
    const timestamps: number[] = [];

    for (let i = 0; i < amountOfFramesFit; i++) {
      timestamps.push(
        fromSeconds + (segmentDuration / amountOfFramesFit) * (i + 0.5),
      );
    }

    return timestamps;
  },
  onVideoSample: (sample) => {
    console.log(`Frame at ${sample.timestamp}s`);

    const canvas = document.createElement("canvas");
    canvas.width = sample.displayWidth;
    canvas.height = sample.displayHeight;
    const ctx = canvas.getContext("2d");
    sample.draw(ctx!, 0, 0);
  },
});
```

## Отмена через `AbortSignal`

Можно отменить извлечение кадров по таймауту:

```tsx
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);

try {
  await extractFrames({
    src: "https://remotion.media/video.mp4",
    timestampsInSeconds: [0, 1, 2, 3, 4],
    onVideoSample: (sample) => {
      using frame = sample;
      const canvas = document.createElement("canvas");
      canvas.width = frame.displayWidth;
      canvas.height = frame.displayHeight;
      const ctx = canvas.getContext("2d");
      frame.draw(ctx!, 0, 0);
    },
    signal: controller.signal,
  });

  console.log("Frame extraction complete!");
} catch (error) {
  console.error("Frame extraction was aborted or failed:", error);
}
```

## Таймаут через `Promise.race`

```tsx
const controller = new AbortController();

const timeoutPromise = new Promise<never>((_, reject) => {
  const timeoutId = setTimeout(() => {
    controller.abort();
    reject(new Error("Frame extraction timed out after 10 seconds"));
  }, 10000);

  controller.signal.addEventListener("abort", () => clearTimeout(timeoutId), {
    once: true,
  });
});

try {
  await Promise.race([
    extractFrames({
      src: "https://remotion.media/video.mp4",
      timestampsInSeconds: [0, 1, 2, 3, 4],
      onVideoSample: (sample) => {
        using frame = sample;
        const canvas = document.createElement("canvas");
        canvas.width = frame.displayWidth;
        canvas.height = frame.displayHeight;
        const ctx = canvas.getContext("2d");
        frame.draw(ctx!, 0, 0);
      },
      signal: controller.signal,
    }),
    timeoutPromise,
  ]);

  console.log("Frame extraction complete!");
} catch (error) {
  console.error("Frame extraction was aborted or failed:", error);
}
```
