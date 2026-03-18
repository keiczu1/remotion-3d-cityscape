---
name: import-srt-captions
description: Импорт файлов субтитров .srt в Remotion через @remotion/captions
metadata:
  tags: captions, subtitles, srt, import, parse
---

# Импорт `.srt`-субтитров в Remotion

Если у тебя уже есть файл субтитров `.srt`, его можно импортировать в Remotion через `parseSrt()` из `@remotion/captions`.

Если `.srt`-файла еще нет, открой [Транскрибацию аудио](transcribe-captions.md), чтобы сгенерировать captions из аудио.

## Подготовка

Сначала установи пакет `@remotion/captions`.
Если он еще не установлен, используй одну из следующих команд:

```bash
npx remotion add @remotion/captions # If project uses npm
bunx remotion add @remotion/captions # If project uses bun
yarn remotion add @remotion/captions # If project uses yarn
pnpm exec remotion add @remotion/captions # If project uses pnpm
```

## Чтение `.srt`-файла

Используй `staticFile()` для ссылки на `.srt`-файл из папки `public`, затем загрузи и распарсь его:

```tsx
import { useState, useEffect, useCallback } from "react";
import { AbsoluteFill, staticFile, useDelayRender } from "remotion";
import { parseSrt } from "@remotion/captions";
import type { Caption } from "@remotion/captions";

export const MyComponent: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile("subtitles.srt"));
      const text = await response.text();
      const { captions: parsed } = parseSrt({ input: text });
      setCaptions(parsed);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  if (!captions) {
    return null;
  }

  return <AbsoluteFill>{/* Здесь можно использовать captions */}</AbsoluteFill>;
};
```

Удаленные URL тоже поддерживаются: вместо `staticFile()` можно сделать `fetch()` по прямому адресу.

## Использование импортированных captions

После парсинга субтитры будут в формате `Caption`, и их можно использовать со всеми утилитами из `@remotion/captions`.
