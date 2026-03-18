---
name: can-decode
description: Проверка, может ли браузер декодировать видео через Mediabunny
metadata:
  tags: decode, validation, video, audio, compatibility, browser
---

# Проверка, можно ли декодировать видео

Используй Mediabunny, чтобы до воспроизведения проверить, сможет ли браузер декодировать видео.

## Функция `canDecode()`

Эту функцию можно просто скопировать в любой проект.

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const canDecode = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  try {
    await input.getFormat();
  } catch {
    return false;
  }

  const videoTrack = await input.getPrimaryVideoTrack();
  if (videoTrack && !(await videoTrack.canDecode())) {
    return false;
  }

  const audioTrack = await input.getPrimaryAudioTrack();
  if (audioTrack && !(await audioTrack.canDecode())) {
    return false;
  }

  return true;
};
```

## Использование

```tsx
const src = "https://remotion.media/video.mp4";
const isDecodable = await canDecode(src);

if (isDecodable) {
  console.log("Video can be decoded");
} else {
  console.log("Video cannot be decoded by this browser");
}
```

## Использование с `Blob`

Для загрузки файлов или drag-and-drop используй `BlobSource`:

```tsx
import { Input, ALL_FORMATS, BlobSource } from "mediabunny";

export const canDecodeBlob = async (blob: Blob) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(blob),
  });

  // Та же логика проверки, что и выше
};
```
