---
name: remotion-best-practices
description: Лучшие практики Remotion для создания видео в React
metadata:
  tags: remotion, video, react, animation, composition
---

## Когда использовать

Используй этот skill каждый раз, когда работа касается кода на Remotion и нужна доменная экспертиза по сборке видео в React.

## Язык ответов

- Все ответы, пояснения, вопросы, планы и отчеты по этому skill должны быть на русском языке.
- Не переводи только код, команды, API, пути, URL, названия пакетов и другие технические идентификаторы, которые должны оставаться точными.

## Субтитры

Если задача связана с captions или subtitles, открой файл [./rules/subtitles.md](./rules/subtitles.md).

## Использование FFmpeg

Для операций вроде обрезки видео или определения тишины используй FFmpeg. Подробности находятся в [./rules/ffmpeg.md](./rules/ffmpeg.md).

## Визуализация аудио

Если нужно визуализировать аудио, например через спектр, waveform или bass-reactive эффекты, открой [./rules/audio-visualization.md](./rules/audio-visualization.md).

## Звуковые эффекты

Если нужно использовать звуковые эффекты, открой [./rules/sfx.md](./rules/sfx.md).

## Как использовать

Читай отдельные rule-файлы для подробных объяснений и примеров кода:

- [rules/3d.md](rules/3d.md) - 3D-контент в Remotion на базе Three.js и React Three Fiber
- [rules/animations.md](rules/animations.md) - базовые правила анимации в Remotion
- [rules/assets.md](rules/assets.md) - импорт изображений, видео, аудио и шрифтов в Remotion
- [rules/audio.md](rules/audio.md) - работа со звуком в Remotion: импорт, trim, volume, speed, pitch
- [rules/calculate-metadata.md](rules/calculate-metadata.md) - динамический расчет длительности композиции, размеров и props
- [rules/can-decode.md](rules/can-decode.md) - проверка, может ли браузер декодировать видео через Mediabunny
- [rules/charts.md](rules/charts.md) - паттерны графиков и визуализации данных в Remotion
- [rules/compositions.md](rules/compositions.md) - описание compositions, stills, folders, default props и динамических metadata
- [rules/extract-frames.md](rules/extract-frames.md) - извлечение кадров из видео по таймкодам через Mediabunny
- [rules/fonts.md](rules/fonts.md) - загрузка Google Fonts и локальных шрифтов в Remotion
- [rules/get-audio-duration.md](rules/get-audio-duration.md) - получение длительности аудио в секундах через Mediabunny
- [rules/get-video-dimensions.md](rules/get-video-dimensions.md) - получение ширины и высоты видео через Mediabunny
- [rules/get-video-duration.md](rules/get-video-duration.md) - получение длительности видео в секундах через Mediabunny
- [rules/gifs.md](rules/gifs.md) - показ GIF, синхронизированных с таймлайном Remotion
- [rules/images.md](rules/images.md) - встраивание изображений в Remotion через компонент `Img`
- [rules/light-leaks.md](rules/light-leaks.md) - эффекты light leak поверх видео через `@remotion/light-leaks`
- [rules/lottie.md](rules/lottie.md) - встраивание Lottie-анимаций в Remotion
- [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md) - измерение размеров DOM-элементов в Remotion
- [rules/measuring-text.md](rules/measuring-text.md) - измерение текста, подгонка в контейнер и проверка overflow
- [rules/sequencing.md](rules/sequencing.md) - sequencing-паттерны в Remotion: delay, trim и ограничение длительности
- [rules/tailwind.md](rules/tailwind.md) - использование TailwindCSS в Remotion
- [rules/text-animations.md](rules/text-animations.md) - паттерны типографики и анимации текста в Remotion
- [rules/timing.md](rules/timing.md) - кривые интерполяции в Remotion: linear, easing и spring-анимации
- [rules/transitions.md](rules/transitions.md) - паттерны переходов между сценами
- [rules/transparent-videos.md](rules/transparent-videos.md) - рендер видео с прозрачностью
- [rules/trimming.md](rules/trimming.md) - паттерны trim в Remotion: как обрезать начало или конец анимации
- [rules/videos.md](rules/videos.md) - встраивание видео в Remotion: trim, volume, speed, loop, pitch
- [rules/parameters.md](rules/parameters.md) - параметризация видео через Zod-схему
- [rules/maps.md](rules/maps.md) - добавление карты на базе Mapbox и ее анимация
- [rules/voiceover.md](rules/voiceover.md) - добавление AI voiceover в Remotion-композиции через ElevenLabs TTS
