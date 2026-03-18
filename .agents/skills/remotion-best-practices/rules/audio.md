---
name: audio
description: Работа со звуком в Remotion: импорт, обрезка, громкость, скорость и высота тона
metadata:
  tags: audio, media, trim, volume, speed, loop, pitch, mute, sound, sfx
---

# Использование аудио в Remotion

## Подготовка

Сначала убедись, что установлен пакет `@remotion/media`.
Если его нет, используй следующую команду:

```bash
npx remotion add @remotion/media
```

## Импорт аудио

Используй `<Audio>` из `@remotion/media`, чтобы добавить звук в композицию.

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Audio src={staticFile("audio.mp3")} />;
};
```

Удаленные URL тоже поддерживаются:

```tsx
<Audio src="https://remotion.media/audio.mp3" />
```

По умолчанию аудио воспроизводится с начала, на полной громкости и целиком.
Несколько дорожек можно наслаивать, добавляя несколько компонентов `<Audio>`.

## Обрезка

Используй `trimBefore` и `trimAfter`, чтобы обрезать части аудио. Значения задаются в кадрах.

```tsx
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    trimBefore={2 * fps} // Skip the first 2 seconds
    trimAfter={10 * fps} // End at the 10 second mark
  />
);
```

Аудио все равно стартует в начале композиции, но проигрывается только указанный фрагмент.

## Задержка старта

Оберни аудио в `<Sequence>`, чтобы сдвинуть момент старта:

```tsx
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

const { fps } = useVideoConfig();

return (
  <Sequence from={1 * fps}>
    <Audio src={staticFile("audio.mp3")} />
  </Sequence>
);
```

Аудио начнет играть через 1 секунду.

## Громкость

Можно задать статическую громкость от `0` до `1`:

```tsx
<Audio src={staticFile("audio.mp3")} volume={0.5} />
```

Или передать callback для динамической громкости на основе текущего кадра:

```tsx
import { interpolate } from "remotion";

const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    volume={(f) =>
      interpolate(f, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" })
    }
  />
);
```

Значение `f` начинается с `0` в момент старта самого аудио, а не всей композиции.

## Отключение звука

Используй `muted`, чтобы выключить звук. Это свойство можно задавать динамически:

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

return (
  <Audio
    src={staticFile("audio.mp3")}
    muted={frame >= 2 * fps && frame <= 4 * fps} // Mute between 2s and 4s
  />
);
```

## Скорость

Используй `playbackRate`, чтобы изменить скорость воспроизведения:

```tsx
<Audio src={staticFile("audio.mp3")} playbackRate={2} /> {/* 2x speed */}
<Audio src={staticFile("audio.mp3")} playbackRate={0.5} /> {/* Half speed */}
```

Обратное воспроизведение не поддерживается.

## Зацикливание

Используй `loop`, чтобы зациклить аудио без ограничения:

```tsx
<Audio src={staticFile("audio.mp3")} loop />
```

С помощью `loopVolumeCurveBehavior` можно управлять тем, как ведет себя счетчик кадров при зацикливании:

- `"repeat"`: счетчик кадров сбрасывается в `0` на каждом цикле, это поведение по умолчанию
- `"extend"`: счетчик кадров продолжает расти без сброса

```tsx
<Audio
  src={staticFile("audio.mp3")}
  loop
  loopVolumeCurveBehavior="extend"
  volume={(f) => interpolate(f, [0, 300], [1, 0])} // Fade out over multiple loops
/>
```

## Высота тона

Используй `toneFrequency`, чтобы менять высоту тона без изменения скорости. Допустимые значения от `0.01` до `2`:

```tsx
<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={1.5} // Higher pitch
/>
<Audio
  src={staticFile("audio.mp3")}
  toneFrequency={0.8} // Lower pitch
/>
```

Изменение pitch работает только при server-side rendering, но не в превью Remotion Studio и не в `<Player />`.
