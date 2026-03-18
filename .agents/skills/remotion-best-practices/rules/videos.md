---
name: videos
description: Встраивание видео в Remotion: обрезка, громкость, скорость, зацикливание и высота тона
metadata:
  tags: video, media, trim, volume, speed, loop, pitch
---

# Использование видео в Remotion

## Подготовка

Сначала установи пакет `@remotion/media`.
Если он еще не установлен, используй одну из следующих команд:

```bash
npx remotion add @remotion/media # If project uses npm
bunx remotion add @remotion/media # If project uses bun
yarn remotion add @remotion/media # If project uses yarn
pnpm exec remotion add @remotion/media # If project uses pnpm
```

Используй `<Video>` из `@remotion/media`, чтобы встроить видео в composition.

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Video src={staticFile("video.mp4")} />;
};
```

Удаленные URL тоже поддерживаются:

```tsx
<Video src="https://remotion.media/video.mp4" />
```

## Обрезка

Используй `trimBefore` и `trimAfter`, чтобы обрезать части видео. Значения задаются в кадрах.

```tsx
const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    trimAfter={10 * fps} // End at the 10 second mark
  />
);
```

## Задержка старта

Оберни видео в `<Sequence>`, чтобы сдвинуть момент появления:

```tsx
import { Sequence, staticFile } from "remotion";
import { Video } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Sequence from={1 * fps}>
    <Video src={staticFile("video.mp4")} />
  </Sequence>
);
```

Видео появится через 1 секунду.

## Размер и позиционирование

Используй prop `style`, чтобы управлять размером и положением:

```tsx
<Video
  src={staticFile("video.mp4")}
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

## Громкость

Можно задать статическую громкость от `0` до `1`:

```tsx
<Video src={staticFile("video.mp4")} volume={0.5} />
```

Или передать callback для динамической громкости на основе текущего кадра:

```tsx
import { interpolate } from "remotion";

const { fps } = useVideoConfig();

return (
  <Video
    src={staticFile("video.mp4")}
    volume={(f) =>
      interpolate(f, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" })
    }
  />
);
```

Используй `muted`, чтобы полностью выключить звук у видео:

```tsx
<Video src={staticFile("video.mp4")} muted />
```

## Скорость

Используй `playbackRate`, чтобы изменить скорость воспроизведения:

```tsx
<Video src={staticFile("video.mp4")} playbackRate={2} /> {/* 2x speed */}
<Video src={staticFile("video.mp4")} playbackRate={0.5} /> {/* Half speed */}
```

Обратное воспроизведение не поддерживается.

## Зацикливание

Используй `loop`, чтобы зациклить видео без ограничения:

```tsx
<Video src={staticFile("video.mp4")} loop />
```

С помощью `loopVolumeCurveBehavior` можно управлять тем, как ведет себя счетчик кадров при зацикливании:

- `"repeat"`: счетчик кадров сбрасывается в `0` на каждом цикле, это удобно для callback в `volume`
- `"extend"`: счетчик кадров продолжает расти без сброса

```tsx
<Video
  src={staticFile("video.mp4")}
  loop
  loopVolumeCurveBehavior="extend"
  volume={(f) => interpolate(f, [0, 300], [1, 0])} // Fade out over multiple loops
/>
```

## Высота тона

Используй `toneFrequency`, чтобы менять высоту тона без изменения скорости. Допустимые значения от `0.01` до `2`:

```tsx
<Video
  src={staticFile("video.mp4")}
  toneFrequency={1.5} // Higher pitch
/>
<Video
  src={staticFile("video.mp4")}
  toneFrequency={0.8} // Lower pitch
/>
```

Изменение pitch работает только при server-side rendering, но не в превью Remotion Studio и не в `<Player />`.
