---
name: measuring-text
description: Измерение размеров текста, подгонка под контейнер и проверка overflow
metadata:
  tags: measure, text, layout, dimensions, fitText, fillTextBox
---

# Измерение текста в Remotion

## Подготовка

Если `@remotion/layout-utils` еще не установлен, сначала добавь его:

```bash
npx remotion add @remotion/layout-utils
```

## Измерение размеров текста

Используй `measureText()`, чтобы вычислить ширину и высоту текста:

```tsx
import { measureText } from "@remotion/layout-utils";

const { width, height } = measureText({
  text: "Hello World",
  fontFamily: "Arial",
  fontSize: 32,
  fontWeight: "bold",
});
```

Результаты кэшируются, поэтому повторный вызов с теми же параметрами вернет значение из кэша.

## Подгонка текста под ширину

Используй `fitText()`, чтобы подобрать оптимальный размер шрифта под контейнер:

```tsx
import { fitText } from "@remotion/layout-utils";

const { fontSize } = fitText({
  text: "Hello World",
  withinWidth: 600,
  fontFamily: "Inter",
  fontWeight: "bold",
});

return (
  <div
    style={{
      fontSize: Math.min(fontSize, 80), // Ограничение до 80px
      fontFamily: "Inter",
      fontWeight: "bold",
    }}
  >
    Hello World
  </div>
);
```

## Проверка overflow текста

Используй `fillTextBox()`, чтобы проверить, не выходит ли текст за пределы блока:

```tsx
import { fillTextBox } from "@remotion/layout-utils";

const box = fillTextBox({ maxBoxWidth: 400, maxLines: 3 });

const words = ["Hello", "World", "This", "is", "a", "test"];
for (const word of words) {
  const { exceedsBox } = box.add({
    text: word + " ",
    fontFamily: "Arial",
    fontSize: 24,
  });
  if (exceedsBox) {
    // Текст выйдет за пределы блока, обработай это отдельно
    break;
  }
}
```

## Лучшие практики

**Сначала загружай шрифты:** функции измерения нужно вызывать только после того, как шрифты полностью загружены.

```tsx
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily, waitUntilDone } = loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

waitUntilDone().then(() => {
  // Теперь измерение безопасно
  const { width } = measureText({
    text: "Hello",
    fontFamily,
    fontSize: 32,
  });
});
```

**Используй `validateFontIsLoaded`:** так проблемы с загрузкой шрифта всплывут раньше:

```tsx
measureText({
  text: "Hello",
  fontFamily: "MyCustomFont",
  fontSize: 32,
  validateFontIsLoaded: true, // Бросит ошибку, если шрифт не загружен
});
```

**Совмещай параметры шрифта:** для измерения и для рендера используй один и тот же набор свойств:

```tsx
const fontStyle = {
  fontFamily: "Inter",
  fontSize: 32,
  fontWeight: "bold" as const,
  letterSpacing: "0.5px",
};

const { width } = measureText({
  text: "Hello",
  ...fontStyle,
});

return <div style={fontStyle}>Hello</div>;
```

**Избегай `padding` и `border`:** лучше использовать `outline`, чтобы не получить расхождения в layout:

```tsx
<div style={{ outline: "2px solid red" }}>Text</div>
```
