---
name: parameters
description: Параметризация видео через добавление Zod-схемы
metadata:
  tags: parameters, zod, schema
---

Чтобы сделать видео параметризуемым, можно добавить к composition схему Zod.

Сначала нужно установить `zod`.

Проверь lockfile проекта и запусти подходящую команду в зависимости от package manager:

Если найден `package-lock.json`, используй:

```bash
npm i zod
```

Если найден `bun.lockb`, используй:

```bash
bun i zod
```

Если найден `yarn.lock`, используй:

```bash
yarn add zod
```

Если найден `pnpm-lock.yaml`, используй:

```bash
pnpm i zod
```

После этого можно определить Zod-схему рядом с компонентом:

```tsx title="src/MyComposition.tsx"
import { z } from "zod";

export const MyCompositionSchema = z.object({
  title: z.string(),
});

const MyComponent: React.FC<z.infer<typeof MyCompositionSchema>> = () => {
  return (
    <div>
      <h1>{props.title}</h1>
    </div>
  );
};
```

В корневом файле эту схему можно передать в composition:

```tsx title="src/Root.tsx"
import { Composition } from "remotion";
import { MycComponent, MyCompositionSchema } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComponent}
      durationInFrames={100}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{ title: "Hello World" }}
      schema={MyCompositionSchema}
    />
  );
};
```

После этого пользователь сможет редактировать параметр визуально через sidebar.

Все схемы, которые поддерживает Zod, поддерживаются и в Remotion.

Remotion требует, чтобы верхнеуровневый тип был `z.object()`, потому что набор props у React-компонента всегда является объектом.

## Выбор цвета

Чтобы добавить color picker, используй `zColor()` из `@remotion/zod-types`.

Если пакет еще не установлен, используй одну из следующих команд:

```bash
npx remotion add @remotion/zod-types # If project uses npm
bunx remotion add @remotion/zod-types # If project uses bun
yarn remotion add @remotion/zod-types # If project uses yarn
pnpm exec remotion add @remotion/zod-types # If project uses pnpm
```

Затем импортируй `zColor` из `@remotion/zod-types`:

```tsx
import { zColor } from "@remotion/zod-types";
```

После этого используй его в схеме:

```tsx
export const MyCompositionSchema = z.object({
  color: zColor(),
});
```
