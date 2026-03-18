---
name: voiceover
description: Добавление AI-озвучки в Remotion compositions через ElevenLabs TTS
metadata:
  tags: voiceover, audio, elevenlabs, tts, speech, calculateMetadata, dynamic duration
---

# Добавление AI-озвучки в Remotion composition

Используй ElevenLabs TTS, чтобы генерировать speech audio для каждой сцены, а затем через [`calculateMetadata`](./calculate-metadata.md) динамически подгоняй длительность composition под звук.

## Подготовка

Нужен **ElevenLabs API key**, доступный через переменную окружения `ELEVENLABS_API_KEY`.

Если `ELEVENLABS_API_KEY` не задан, **нужно** запросить его у пользователя. Переходить на другие TTS-инструменты вместо ElevenLabs **нельзя**.

Убедись, что переменная окружения доступна во время запуска скрипта генерации:

```bash
node --strip-types generate-voiceover.ts
```

## Генерация аудио через ElevenLabs

Сделай скрипт, который читает конфиг, вызывает ElevenLabs API для каждой сцены и сохраняет MP3 в `public/`, чтобы Remotion мог получить к ним доступ через `staticFile()`.

Базовый API-вызов для одной сцены:

```ts title="generate-voiceover.ts"
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: "Welcome to the show.",
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
      },
    }),
  },
);

const audioBuffer = Buffer.from(await response.arrayBuffer());
writeFileSync(`public/voiceover/${compositionId}/${scene.id}.mp3`, audioBuffer);
```

## Динамическая длительность composition через `calculateMetadata`

Используй [`calculateMetadata`](./calculate-metadata.md), чтобы измерить [длительность аудио](./get-audio-duration.md) и на ее основе задать длину composition.

```tsx
import { CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDuration } from "./get-audio-duration";

const FPS = 30;

const SCENE_AUDIO_FILES = [
  "voiceover/my-comp/scene-01-intro.mp3",
  "voiceover/my-comp/scene-02-main.mp3",
  "voiceover/my-comp/scene-03-outro.mp3",
];

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const durations = await Promise.all(
    SCENE_AUDIO_FILES.map((file) => getAudioDuration(staticFile(file))),
  );

  const sceneDurations = durations.map((durationInSeconds) => {
    return durationInSeconds * FPS;
  });

  return {
    durationInFrames: Math.ceil(sceneDurations.reduce((sum, d) => sum + d, 0)),
  };
};
```

Вычисленные `sceneDurations` нужно передавать в компонент через prop `voiceover`, чтобы компонент знал длительность каждой сцены.

Если composition использует [`<TransitionSeries>`](./transitions.md), вычитай overlap из общей длительности: [./transitions.md#calculating-total-composition-duration](./transitions.md#calculating-total-composition-duration)

## Рендер аудио в компоненте

Подробности о рендере аудио в компоненте смотри в [audio.md](./audio.md).

## Задержка старта аудио

Как откладывать старт аудио, смотри в [audio.md#задержка-старта](./audio.md#задержка-старта).
