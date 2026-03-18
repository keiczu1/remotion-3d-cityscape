---
name: subtitles
description: Правила для subtitles и captions
metadata:
  tags: subtitles, captions, remotion, json
---

Все captions должны обрабатываться в JSON-формате. Для них нужно использовать тип `Caption`:

```ts
import type { Caption } from "@remotion/captions";
```

Определение типа:

```ts
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};
```

## Генерация captions

Чтобы транскрибировать видео или аудио и получить captions, открой [./transcribe-captions.md](./transcribe-captions.md).

## Отображение captions

Чтобы отобразить captions в видео, открой [./display-captions.md](./display-captions.md).

## Импорт captions

Чтобы импортировать captions из `.srt`-файла, открой [./import-srt-captions.md](./import-srt-captions.md).
