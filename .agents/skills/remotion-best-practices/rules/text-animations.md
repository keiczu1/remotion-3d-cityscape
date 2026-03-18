---
name: text-animations
description: Паттерны типографики и анимации текста для Remotion.
metadata:
  tags: typography, text, typewriter, highlighter ken
---

## Анимации текста

На базе `useCurrentFrame()` можно укорачивать строку символ за символом, чтобы получить typewriter-эффект.

## Эффект печатной машинки

См. [Typewriter](assets/text-animations-typewriter.tsx) для более продвинутого примера с мигающим курсором и паузой после первого предложения.

Для typewriter-эффекта всегда используй slicing строки. Не анимируй по отдельности opacity каждого символа.

## Выделение слов

См. [Word Highlight](assets/text-animations-word-highlight.tsx) для примера анимации выделения слова, как маркером.
