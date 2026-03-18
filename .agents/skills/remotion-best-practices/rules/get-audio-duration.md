---
name: get-audio-duration
description: Получение длительности аудиофайла в секундах через Mediabunny
metadata:
  tags: duration, audio, length, time, seconds, mp3, wav
---

# Получение длительности аудио через Mediabunny

Mediabunny умеет получать длительность аудиофайла. Это работает в браузере, Node.js и Bun.

## Получение длительности аудио

```tsx title="get-audio-duration.ts"
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getAudioDuration = async (src: string) => {
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
const duration = await getAudioDuration("https://remotion.media/audio.mp3");
console.log(duration); // Например, 180.5 секунд
```

## Использование со `staticFile()` в Remotion

Если работаешь с локальным файлом, оборачивай путь в `staticFile()`:

```tsx
import { staticFile } from "remotion";

const duration = await getAudioDuration(staticFile("audio.mp3"));
```

## В Node.js и Bun

Вместо `UrlSource` используй `FileSource`:

```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // Объект File из input или drag-drop
});
```
