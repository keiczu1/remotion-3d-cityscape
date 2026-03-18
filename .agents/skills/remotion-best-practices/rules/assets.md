---
name: assets
description: Импорт изображений, видео, аудио и шрифтов в Remotion
metadata:
  tags: assets, staticFile, images, fonts, public
---

# Импорт ассетов в Remotion

## Папка `public`

Складывай ассеты в папку `public/` в корне проекта.

## Использование `staticFile()`

Для ссылок на файлы из `public/` нужно использовать `staticFile()`:

```tsx
import { Img, staticFile } from "remotion";

export const MyComposition = () => {
  return <Img src={staticFile("logo.png")} />;
};
```

Эта функция возвращает корректно закодированный URL, который нормально работает и при деплое в подкаталог.

## Использование с компонентами

**Изображения:**

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("photo.png")} />;
```

**Видео:**

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

<Video src={staticFile("clip.mp4")} />;
```

**Аудио:**

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

<Audio src={staticFile("music.mp3")} />;
```

**Шрифты:**

```tsx
import { staticFile } from "remotion";

const fontFamily = new FontFace("MyFont", `url(${staticFile("font.woff2")})`);
await fontFamily.load();
document.fonts.add(fontFamily);
```

## Удаленные URL

Удаленные URL можно использовать напрямую, без `staticFile()`:

```tsx
<Img src="https://example.com/image.png" />
<Video src="https://remotion.media/video.mp4" />
```

## Важные замечания

- Компоненты Remotion (`<Img>`, `<Video>`, `<Audio>`) гарантируют, что ассеты будут полностью загружены до рендера
- Специальные символы в именах файлов (`#`, `?`, `&`) кодируются автоматически
