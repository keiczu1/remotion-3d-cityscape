---
name: fonts
description: Загрузка Google Fonts и локальных шрифтов в Remotion
metadata:
  tags: fonts, google-fonts, typography, text
---

# Использование шрифтов в Remotion

## Google Fonts через `@remotion/google-fonts`

Это рекомендуемый способ подключения Google Fonts. Он type-safe и автоматически блокирует рендер, пока шрифт не будет готов.

### Подготовка

Сначала установи пакет `@remotion/google-fonts`.
Если его нет, используй одну из следующих команд:

```bash
npx remotion add @remotion/google-fonts # If project uses npm
bunx remotion add @remotion/google-fonts # If project uses bun
yarn remotion add @remotion/google-fonts # If project uses yarn
pnpm exec remotion add @remotion/google-fonts # If project uses pnpm
```

```tsx
import { loadFont } from "@remotion/google-fonts/Lobster";

const { fontFamily } = loadFont();

export const MyComposition = () => {
  return <div style={{ fontFamily }}>Hello World</div>;
};
```

По возможности указывай только нужные `weights` и `subsets`, чтобы не тянуть лишние данные:

```tsx
import { loadFont } from "@remotion/google-fonts/Roboto";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
```

### Ожидание загрузки шрифта

Используй `waitUntilDone()`, если важно дождаться полной загрузки шрифта:

```tsx
import { loadFont } from "@remotion/google-fonts/Lobster";

const { fontFamily, waitUntilDone } = loadFont();

await waitUntilDone();
```

## Локальные шрифты через `@remotion/fonts`

Для локальных файлов шрифтов используй пакет `@remotion/fonts`.

### Подготовка

Сначала установи `@remotion/fonts`:

```bash
npx remotion add @remotion/fonts # If project uses npm
bunx remotion add @remotion/fonts # If project uses bun
yarn remotion add @remotion/fonts # If project uses yarn
pnpm exec remotion add @remotion/fonts # If project uses pnpm
```

### Загрузка локального шрифта

Положи файл шрифта в `public/` и загрузи его через `loadFont()`:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await loadFont({
  family: "MyFont",
  url: staticFile("MyFont-Regular.woff2"),
});

export const MyComposition = () => {
  return <div style={{ fontFamily: "MyFont" }}>Hello World</div>;
};
```

### Загрузка нескольких weight

Каждый `weight` загружай отдельно, но с одним и тем же `family`:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await Promise.all([
  loadFont({
    family: "Inter",
    url: staticFile("Inter-Regular.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "Inter",
    url: staticFile("Inter-Bold.woff2"),
    weight: "700",
  }),
]);
```

### Доступные опции

```tsx
loadFont({
  family: "MyFont", // Обязательно: имя, которое будет использоваться в CSS
  url: staticFile("font.woff2"), // Обязательно: URL файла шрифта
  format: "woff2", // Опционально: обычно определяется по расширению
  weight: "400", // Опционально: font weight
  style: "normal", // Опционально: normal или italic
  display: "block", // Опционально: поведение font-display
});
```

## Использование в компонентах

Вызывай `loadFont()` на верхнем уровне компонента или в отдельном файле, который импортируется заранее:

```tsx
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const Title: React.FC<{ text: string }> = ({ text }) => {
  return (
    <h1
      style={{
        fontFamily,
        fontSize: 80,
        fontWeight: "bold",
      }}
    >
      {text}
    </h1>
  );
};
```
