---
name: animations
description: Базовые правила анимации для Remotion
metadata:
  tags: animations, transitions, frames, useCurrentFrame
---

Все анимации должны управляться через хук `useCurrentFrame()`.
Тайминг удобно задавать в секундах и умножать на `fps` из `useVideoConfig()`.

```tsx
import { useCurrentFrame } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return <div style={{ opacity }}>Hello World!</div>;
};
```

CSS transitions и CSS animations запрещены: они не будут корректно рендериться в Remotion.
Tailwind animation classes тоже запрещены по той же причине.

Если в проекте есть remap timeline или slowdown для камеры, все связанные reveal/focus/presentation-анимации должны использовать ту же систему времени, что и камера.
Нельзя анимировать маршрут камеры по одному frame-space, а LOD, visibility или reveal по другому: это даёт рассинхрон, пропадание объектов и резкие стыки в пролётах.
