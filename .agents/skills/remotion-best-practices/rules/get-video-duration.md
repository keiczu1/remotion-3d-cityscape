---
name: get-video-duration
description: Получение длительности видеофайла в секундах через Mediabunny
metadata:
  tags: duration, video, length, time, seconds
---

# Получение длительности видео через Mediabunny

Mediabunny умеет получать длительность видеофайла. Это работает в браузере, Node.js и Bun.

## Получение длительности видео

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getVideoDuration = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const durationInSeconds = await input.computeDuration();
  return durationInSeconds;
};
```

## Использование

```tsx
const duration = await getVideoDuration("https://remotion.media/video.mp4");
console.log(duration); // Например, 10.5 секунд
```

## Видео из каталога `public/`

Не забудь обернуть путь в `staticFile()`:

```tsx
import { staticFile } from "remotion";

const duration = await getVideoDuration(staticFile("video.mp4"));
```

## В Node.js и Bun

Вместо `UrlSource` используй `FileSource`:

```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // Объект File из input или drag-drop
});

const durationInSeconds = await input.computeDuration();
```
