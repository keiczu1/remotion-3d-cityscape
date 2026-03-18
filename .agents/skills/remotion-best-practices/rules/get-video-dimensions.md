---
name: get-video-dimensions
description: Получение ширины и высоты видеофайла через Mediabunny
metadata:
  tags: dimensions, width, height, resolution, size, video
---

# Получение размеров видео через Mediabunny

Mediabunny умеет получать ширину и высоту видеофайла. Это работает в браузере, Node.js и Bun.

## Получение размеров видео

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getVideoDimensions = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack) {
    throw new Error("No video track found");
  }

  return {
    width: videoTrack.displayWidth,
    height: videoTrack.displayHeight,
  };
};
```

## Использование

```tsx
const dimensions = await getVideoDimensions("https://remotion.media/video.mp4");
console.log(dimensions.width); // Например, 1920
console.log(dimensions.height); // Например, 1080
```

## Использование с локальными файлами

Для локальных файлов используй `FileSource` вместо `UrlSource`:

```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // Объект File из input или drag-drop
});

const videoTrack = await input.getPrimaryVideoTrack();
const width = videoTrack.displayWidth;
const height = videoTrack.displayHeight;
```

## Использование со `staticFile()` в Remotion

```tsx
import { staticFile } from "remotion";

const dimensions = await getVideoDimensions(staticFile("video.mp4"));
```
