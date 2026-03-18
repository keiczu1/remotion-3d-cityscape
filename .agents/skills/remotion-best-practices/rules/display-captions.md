---
name: display-captions
description: Отображение captions в Remotion со страницами в стиле TikTok и подсветкой слов
metadata:
  tags: captions, subtitles, display, tiktok, highlight
---

# Отображение captions в Remotion

Это руководство объясняет, как выводить captions в Remotion, если у тебя уже есть данные в формате [`Caption`](https://www.remotion.dev/docs/captions/caption).

## Подготовка

Если captions еще не сгенерированы, сначала открой [Транскрибацию аудио](transcribe-captions.md).

Сначала установи пакет [`@remotion/captions`](https://www.remotion.dev/docs/captions).
Если он еще не установлен, используй команду:

```bash
npx remotion add @remotion/captions
```

## Загрузка captions

Сначала загрузи JSON-файл с captions. Используй [`useDelayRender()`](https://www.remotion.dev/docs/use-delay-render), чтобы удерживать рендер до завершения загрузки:

```tsx
import { useState, useEffect, useCallback } from "react";
import { AbsoluteFill, staticFile, useDelayRender } from "remotion";
import type { Caption } from "@remotion/captions";

export const MyComponent: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  const fetchCaptions = useCallback(async () => {
    try {
      // Предполагается, что captions.json лежит в папке public/
      const response = await fetch(staticFile("captions123.json"));
      const data = await response.json();
      setCaptions(data);
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

  return <AbsoluteFill>{/* Здесь можно рендерить captions */}</AbsoluteFill>;
};
```

## Создание страниц

Используй `createTikTokStyleCaptions()`, чтобы группировать captions по страницам. Опция `combineTokensWithinMilliseconds` управляет тем, сколько слов появляется одновременно:

```tsx
import { useMemo } from "react";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption } from "@remotion/captions";

// Как часто captions должны переключаться, в миллисекундах
// Чем больше значение, тем больше слов на одной странице
// Чем меньше значение, тем ближе поведение к word-by-word
const SWITCH_CAPTIONS_EVERY_MS = 1200;

const { pages } = useMemo(() => {
  return createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
  });
}, [captions]);
```

## Рендер через `Sequence`

Пройди по страницам и отрендери каждую через `<Sequence>`. Стартовый кадр и длительность вычисляй из тайминга страницы:

```tsx
import { Sequence, useVideoConfig, AbsoluteFill } from "remotion";
import type { TikTokPage } from "@remotion/captions";

const CaptionedContent: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          startFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps,
        );
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
```

## Сохранение пробелов

Captions чувствительны к пробелам. В поле `text` пробелы перед словами нужно сохранять, а в стилях использовать `whiteSpace: "pre"`.

## Отдельный компонент для captions

Логику captions лучше выносить в отдельный компонент.
Сделай для него отдельный файл.

## Подсветка слов

Внутри caption page есть `tokens`, и по ним можно подсвечивать слово, которое произносится прямо сейчас:

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { TikTokPage } from "@remotion/captions";

const HIGHLIGHT_COLOR = "#39E508";

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Текущее время относительно начала sequence
  const currentTimeMs = (frame / fps) * 1000;
  // Перевод в абсолютное время с учетом старта страницы
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontSize: 80, fontWeight: "bold", whiteSpace: "pre" }}>
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

          return (
            <span
              key={token.fromMs}
              style={{ color: isActive ? HIGHLIGHT_COLOR : "white" }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

## Показ captions поверх видео

По умолчанию размещай captions рядом с видеоконтентом, чтобы они гарантированно оставались синхронными.
Для каждого видео лучше иметь отдельный JSON-файл captions.

```tsx
<AbsoluteFill>
  <Video src={staticFile("video.mp4")} />
  <CaptionPage page={page} />
</AbsoluteFill>
```
