---
name: compositions
description: Определение композиций, статичных кадров, папок, default props и динамических metadata
metadata:
  tags: composition, still, folder, props, metadata
---

`<Composition>` задает компонент, ширину, высоту, `fps` и длительность рендеримого видео.

Обычно такие определения находятся в файле `src/Root.tsx`.

```tsx
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
```

## Значения `defaultProps`

Передавай `defaultProps`, чтобы задать исходные значения для компонента.
Значения должны быть JSON-serializable, при этом `Date`, `Map`, `Set` и `staticFile()` тоже поддерживаются.

```tsx
import { Composition } from "remotion";
import { MyComposition, MyCompositionProps } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={
        {
          title: "Hello World",
          color: "#ff0000",
        } satisfies MyCompositionProps
      }
    />
  );
};
```

Для props лучше использовать `type`, а не `interface`, чтобы типобезопасность `defaultProps` работала корректно.

## Папки

Используй `<Folder>`, чтобы группировать compositions в боковой панели.
Имя папки может содержать только буквы, цифры и дефисы.

```tsx
import { Composition, Folder } from "remotion";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition id="Promo" /* ... */ />
        <Composition id="Ad" /* ... */ />
      </Folder>
      <Folder name="Social">
        <Folder name="Instagram">
          <Composition id="Story" /* ... */ />
          <Composition id="Reel" /* ... */ />
        </Folder>
      </Folder>
    </>
  );
};
```

## Статичные кадры через `Still`

Используй `<Still>` для изображений из одного кадра. Ему не нужны `durationInFrames` и `fps`.

```tsx
import { Still } from "remotion";
import { Thumbnail } from "./Thumbnail";

export const RemotionRoot = () => {
  return (
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  );
};
```

## Использование `calculateMetadata`

Используй `calculateMetadata`, чтобы делать размеры, длительность или props динамическими на основе данных.

```tsx
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition, MyCompositionProps } from "./MyComposition";

const calculateMetadata: CalculateMetadataFunction<
  MyCompositionProps
> = async ({ props, abortSignal }) => {
  const data = await fetch(`https://api.example.com/video/${props.videoId}`, {
    signal: abortSignal,
  }).then((res) => res.json());

  return {
    durationInFrames: Math.ceil(data.duration * 30),
    props: {
      ...props,
      videoUrl: data.url,
    },
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={100} // Заглушка, будет переопределена
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ videoId: "abc123" }}
      calculateMetadata={calculateMetadata}
    />
  );
};
```

Функция может вернуть `props`, `durationInFrames`, `width`, `height`, `fps` и значения codec по умолчанию. Она вызывается один раз перед началом рендера.

## Вложение одной composition в другую

Чтобы вставить одну composition внутрь другой, можно использовать `<Sequence>` с props `width` и `height`, задающими размер вложенной композиции.

```tsx
<AbsoluteFill>
  <Sequence width={COMPOSITION_WIDTH} height={COMPOSITION_HEIGHT}>
    <CompositionComponent />
  </Sequence>
</AbsoluteFill>
```
