---
name: lottie
description: Встраивание Lottie-анимаций в Remotion.
metadata:
  category: Animation
---

# Использование Lottie-анимаций в Remotion

## Подготовка

Сначала установи пакет `@remotion/lottie`.
Если он еще не установлен, используй одну из следующих команд:

```bash
npx remotion add @remotion/lottie # If project uses npm
bunx remotion add @remotion/lottie # If project uses bun
yarn remotion add @remotion/lottie # If project uses yarn
pnpm exec remotion add @remotion/lottie # If project uses pnpm
```

## Отображение Lottie-файла

Чтобы импортировать Lottie-анимацию:

- Загрузи сам Lottie-ассет
- Оберни загрузку в `delayRender()` и `continueRender()`
- Сохрани данные анимации в state
- Отрендери анимацию через компонент `Lottie` из `@remotion/lottie`

```tsx
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyAnimation = () => {
  const [handle] = useState(() => delayRender("Loading Lottie animation"));

  const [animationData, setAnimationData] =
    useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch("https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json")
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} />;
};
```

## Стилизация и анимация

Lottie поддерживает prop `style`, поэтому к нему можно применять стили и анимацию:

```tsx
return (
  <Lottie animationData={animationData} style={{ width: 400, height: 400 }} />
);
```
