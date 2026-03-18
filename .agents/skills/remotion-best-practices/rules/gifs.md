---
name: gif
description: Отображение GIF, APNG, AVIF и WebP в Remotion
metadata:
  tags: gif, animation, images, animated, apng, avif, webp
---

# Использование анимированных изображений в Remotion

## Базовое использование

Используй `<AnimatedImage>`, чтобы показывать GIF, APNG, AVIF или WebP синхронно с таймлайном Remotion:

```tsx
import { AnimatedImage, staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <AnimatedImage src={staticFile("animation.gif")} width={500} height={500} />
  );
};
```

Удаленные URL тоже поддерживаются, но на стороне сервера должен быть включен CORS:

```tsx
<AnimatedImage
  src="https://example.com/animation.gif"
  width={500}
  height={500}
/>
```

## Размер и fit

С помощью prop `fit` можно управлять тем, как изображение заполняет контейнер:

```tsx
// Растянуть на весь контейнер, это поведение по умолчанию
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="fill" />

// Сохранить пропорции и вписать внутрь контейнера
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="contain" />

// Заполнить контейнер, при необходимости обрезав края
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="cover" />
```

## Скорость воспроизведения

Используй `playbackRate`, чтобы менять скорость анимации:

```tsx
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} playbackRate={2} /> {/* 2x speed */}
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} playbackRate={0.5} /> {/* Half speed */}
```

## Поведение при зацикливании

Можно задать, что произойдет после завершения анимации:

```tsx
// Зацикливать бесконечно, это значение по умолчанию
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="loop" />

// Проиграть один раз и оставить последний кадр
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="pause-after-finish" />

// Проиграть один раз и очистить canvas
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="clear-after-finish" />
```

## Стилизация

Для дополнительных CSS-стилей используй prop `style`, а размер задавай через `width` и `height`:

```tsx
<AnimatedImage
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  style={{
    borderRadius: 20,
    position: "absolute",
    top: 100,
    left: 50,
  }}
/>
```

## Получение длительности GIF

Используй `getGifDurationInSeconds()` из `@remotion/gif`, чтобы получить длительность GIF.

```bash
npx remotion add @remotion/gif
```

```tsx
import { getGifDurationInSeconds } from "@remotion/gif";
import { staticFile } from "remotion";

const duration = await getGifDurationInSeconds(staticFile("animation.gif"));
console.log(duration); // Например, 2.5
```

Это полезно, если нужно подогнать длительность композиции под сам GIF:

```tsx
import { getGifDurationInSeconds } from "@remotion/gif";
import { staticFile, CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction = async () => {
  const duration = await getGifDurationInSeconds(staticFile("animation.gif"));
  return {
    durationInFrames: Math.ceil(duration * 30),
  };
};
```

## Альтернатива

Если `<AnimatedImage>` не подходит, например из-за ограничений поддержки браузера, можно использовать `<Gif>` из `@remotion/gif`.

```bash
npx remotion add @remotion/gif # If project uses npm
bunx remotion add @remotion/gif # If project uses bun
yarn remotion add @remotion/gif # If project uses yarn
pnpm exec remotion add @remotion/gif # If project uses pnpm
```

```tsx
import { Gif } from "@remotion/gif";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Gif src={staticFile("animation.gif")} width={500} height={500} />;
};
```

У `<Gif>` те же props, что и у `<AnimatedImage>`, но он работает только с файлами GIF.
