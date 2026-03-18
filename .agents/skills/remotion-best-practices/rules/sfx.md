---
name: sfx
description: Добавление звуковых эффектов
metadata:
  tags: sfx, sound, effect, audio
---

Чтобы добавить звуковой эффект, используй тег `<Audio>`:

```tsx
import { Audio } from "@remotion/sfx";

<Audio src={"https://remotion.media/whoosh.wav"} />;
```

Доступны следующие звуковые эффекты:

- `https://remotion.media/whoosh.wav`
- `https://remotion.media/whip.wav`
- `https://remotion.media/page-turn.wav`
- `https://remotion.media/switch.wav`
- `https://remotion.media/mouse-click.wav`
- `https://remotion.media/shutter-modern.wav`
- `https://remotion.media/shutter-old.wav`

Если нужен более широкий набор эффектов, можно искать дополнительные библиотеки. Неплохой источник: https://github.com/kapishdima/soundcn/tree/main/assets.
