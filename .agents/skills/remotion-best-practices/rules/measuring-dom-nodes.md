---
name: measuring-dom-nodes
description: Измерение размеров DOM-элементов в Remotion
metadata:
  tags: measure, layout, dimensions, getBoundingClientRect, scale
---

# Измерение DOM-узлов в Remotion

Remotion применяет к контейнеру видео трансформацию `scale()`, поэтому значения из `getBoundingClientRect()` искажаются. Используй `useCurrentScale()`, чтобы получить корректные размеры.

## Измерение размеров элемента

```tsx
import { useCurrentScale } from "remotion";
import { useRef, useEffect, useState } from "react";

export const MyComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useCurrentScale();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setDimensions({
      width: rect.width / scale,
      height: rect.height / scale,
    });
  }, [scale]);

  return <div ref={ref}>Content to measure</div>;
};
```
