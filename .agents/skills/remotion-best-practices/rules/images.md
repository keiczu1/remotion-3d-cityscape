---
name: images
description: Встраивание изображений в Remotion через компонент <Img>
metadata:
  tags: images, img, staticFile, png, jpg, svg, webp
---

# Использование изображений в Remotion

## Компонент `<Img>`

Для показа изображений всегда используй компонент `<Img>` из `remotion`:

```tsx
import { Img, staticFile } from "remotion";

export const MyComposition = () => {
  return <Img src={staticFile("photo.png")} />;
};
```

## Важные ограничения

**Нужно использовать именно `<Img>` из `remotion`.** Не используй:

- Нативные HTML-элементы `<img>`
- Компонент `<Image>` из Next.js
- CSS `background-image`

Компонент `<Img>` гарантирует, что изображение будет полностью загружено до рендера, и тем самым защищает от мерцания и пустых кадров при экспорте видео.

## Локальные изображения через `staticFile()`

Храни изображения в папке `public/` и ссылайся на них через `staticFile()`:

```
my-video/
├─ public/
│  ├─ logo.png
│  ├─ avatar.jpg
│  └─ icon.svg
├─ src/
├─ package.json
```

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("logo.png")} />;
```

## Удаленные изображения

Удаленные URL можно использовать напрямую, без `staticFile()`:

```tsx
<Img src="https://example.com/image.png" />
```

Убедись, что у удаленных изображений включен CORS.

Для анимированных GIF вместо этого используй компонент `<Gif>` из `@remotion/gif`.

## Размер и позиционирование

Используй prop `style`, чтобы управлять размером и положением:

```tsx
<Img
  src={staticFile("photo.png")}
  style={{
    width: 500,
    height: 300,
    position: "absolute",
    top: 100,
    left: 50,
    objectFit: "cover",
  }}
/>
```

## Динамические пути к изображениям

Для динамических ссылок на файлы используй template literals:

```tsx
import { Img, staticFile, useCurrentFrame } from "remotion";

const frame = useCurrentFrame();

// Последовательность изображений
<Img src={staticFile(`frames/frame${frame}.png`)} />

// Выбор изображения на основе props
<Img src={staticFile(`avatars/${props.userId}.png`)} />

// Условное изображение
<Img src={staticFile(`icons/${isActive ? "active" : "inactive"}.svg`)} />
```

Такой паттерн полезен для:

- последовательностей изображений, то есть frame-by-frame анимаций
- аватаров и картинок, зависящих от пользователя
- иконок, зависящих от темы
- графики, зависящей от состояния интерфейса

## Получение размеров изображения

Используй `getImageDimensions()`, чтобы получить размеры изображения:

```tsx
import { getImageDimensions, staticFile } from "remotion";

const { width, height } = await getImageDimensions(staticFile("photo.png"));
```

Это полезно для расчета aspect ratio и динамического задания размера композиции:

```tsx
import {
  getImageDimensions,
  staticFile,
  CalculateMetadataFunction,
} from "remotion";

const calculateMetadata: CalculateMetadataFunction = async () => {
  const { width, height } = await getImageDimensions(staticFile("photo.png"));
  return {
    width,
    height,
  };
};
```
