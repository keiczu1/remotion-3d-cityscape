---
name: maps
description: Создание анимированных карт с помощью Mapbox
metadata:
  tags: map, map animation, mapbox
---

Карты можно добавлять в видео на Remotion через Mapbox.
Справочник по API Mapbox находится здесь: https://docs.mapbox.com/mapbox-gl-js/api/

## Подготовка

Нужно установить Mapbox и `@turf/turf`.

Проверь lockfile проекта и используй подходящую команду:

Если найден `package-lock.json`, используй:

```bash
npm i mapbox-gl @turf/turf @types/mapbox-gl
```

Если найден `bun.lock`, используй:

```bash
bun i mapbox-gl @turf/turf @types/mapbox-gl
```

Если найден `yarn.lock`, используй:

```bash
yarn add mapbox-gl @turf/turf @types/mapbox-gl
```

Если найден `pnpm-lock.yaml`, используй:

```bash
pnpm i mapbox-gl @turf/turf @types/mapbox-gl
```

Пользователю нужно создать бесплатный аккаунт Mapbox и получить access token здесь: https://console.mapbox.com/account/access-tokens/

Mapbox token нужно добавить в `.env`:

```txt title=".env"
REMOTION_MAPBOX_TOKEN==pk.your-mapbox-access-token
```

## Добавление карты

Ниже базовый пример карты в Remotion.

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill, useDelayRender, useVideoConfig } from "remotion";
import mapboxgl, { Map } from "mapbox-gl";

export const lineCoordinates = [
  [6.56158447265625, 46.059891147620725],
  [6.5691375732421875, 46.05679376154153],
  [6.5842437744140625, 46.05059898938315],
  [6.594886779785156, 46.04702502069337],
  [6.601066589355469, 46.0460718554722],
  [6.6089630126953125, 46.0365370783104],
  [6.6185760498046875, 46.018420689207964],
];

mapboxgl.accessToken = process.env.REMOTION_MAPBOX_TOKEN as string;

export const MyComposition = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { delayRender, continueRender } = useDelayRender();

  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("Loading map..."));
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    const _map = new Map({
      container: ref.current!,
      zoom: 11.53,
      center: [6.5615, 46.0598],
      pitch: 65,
      bearing: 0,
      style: "mapbox://styles/mapbox/standard",
      interactive: false,
      fadeDuration: 0,
    });

    _map.on("style.load", () => {
      // Скрываем все лишние особенности стиля Mapbox Standard
      const hideFeatures = [
        "showRoadsAndTransit",
        "showRoads",
        "showTransit",
        "showPedestrianRoads",
        "showRoadLabels",
        "showTransitLabels",
        "showPlaceLabels",
        "showPointOfInterestLabels",
        "showPointsOfInterest",
        "showAdminBoundaries",
        "showLandmarkIcons",
        "showLandmarkIconLabels",
        "show3dObjects",
        "show3dBuildings",
        "show3dTrees",
        "show3dLandmarks",
        "show3dFacades",
      ];
      for (const feature of hideFeatures) {
        _map.setConfigProperty("basemap", feature, false);
      }

      _map.setConfigProperty("basemap", "colorTrunks", "rgba(0, 0, 0, 0)");

      _map.addSource("trace", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
          },
        },
      });
      _map.addLayer({
        type: "line",
        source: "trace",
        id: "line",
        paint: {
          "line-color": "black",
          "line-width": 5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });
    });

    _map.on("load", () => {
      continueRender(handle);
      setMap(_map);
    });
  }, [continueRender, handle]);

  const style: React.CSSProperties = useMemo(
    () => ({ width, height, position: "absolute" }),
    [width, height],
  );

  return <AbsoluteFill ref={ref} style={style} />;
};
```

Для Remotion здесь особенно важно следующее:

- Все анимации должны управляться через `useCurrentFrame()`, а встроенные анимации Mapbox нужно отключать. Например, `fadeDuration` должен быть `0`, `interactive` должен быть `false` и так далее.
- Загрузку карты нужно задерживать через `useDelayRender()`, а до полной загрузки карта должна быть `null`.
- Элемент, на который указывает `ref`, обязан иметь явные `width`, `height` и `position: "absolute"`.
- Не добавляй cleanup с `_map.remove();`, если это специально не требуется.

## Отрисовка линий

Если я явно не прошу об этом, не добавляй glow-эффект к линиям.
Если я явно не прошу об этом, не добавляй к линиям дополнительные точки.

## Стиль карты

По умолчанию используй стиль `mapbox://styles/mapbox/standard`.
Подписи базовой карты лучше скрывать.

Если не было отдельной просьбы, убирай все лишние особенности Mapbox Standard:

```tsx
// Скрываем все лишнее в Mapbox Standard
const hideFeatures = [
  "showRoadsAndTransit",
  "showRoads",
  "showTransit",
  "showPedestrianRoads",
  "showRoadLabels",
  "showTransitLabels",
  "showPlaceLabels",
  "showPointOfInterestLabels",
  "showPointsOfInterest",
  "showAdminBoundaries",
  "showLandmarkIcons",
  "showLandmarkIconLabels",
  "show3dObjects",
  "show3dBuildings",
  "show3dTrees",
  "show3dLandmarks",
  "show3dFacades",
];
for (const feature of hideFeatures) {
  _map.setConfigProperty("basemap", feature, false);
}

_map.setConfigProperty("basemap", "colorMotorways", "transparent");
_map.setConfigProperty("basemap", "colorRoads", "transparent");
_map.setConfigProperty("basemap", "colorTrunks", "transparent");
```

## Анимация камеры

Камеру можно анимировать вдоль линии через `useEffect`, обновляя ее положение на основе текущего кадра.

Если я отдельно не прошу, не делай резких прыжков между углами камеры.

```tsx
import * as turf from "@turf/turf";
import { interpolate } from "remotion";
import { Easing } from "remotion";
import { useCurrentFrame, useVideoConfig, useDelayRender } from "remotion";

const animationDuration = 20;
const cameraAltitude = 4000;
```

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const { delayRender, continueRender } = useDelayRender();

useEffect(() => {
  if (!map) {
    return;
  }
  const handle = delayRender("Moving point...");

  const routeDistance = turf.length(turf.lineString(lineCoordinates));

  const progress = interpolate(
    frame / fps,
    [0.00001, animationDuration],
    [0, 1],
    {
      easing: Easing.inOut(Easing.sin),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const camera = map.getFreeCameraOptions();

  const alongRoute = turf.along(
    turf.lineString(lineCoordinates),
    routeDistance * progress,
  ).geometry.coordinates;

  camera.lookAtPoint({
    lng: alongRoute[0],
    lat: alongRoute[1],
  });

  map.setFreeCameraOptions(camera);
  map.once("idle", () => continueRender(handle));
}, [lineCoordinates, fps, frame, handle, map]);
```

Примечания:

IMPORTANT: По умолчанию держи камеру так, чтобы север был сверху.
IMPORTANT: В многошаговых анимациях задавай все свойства на каждом этапе: `zoom`, `position`, `line progress` и остальные. Не полагайся на случайное наследование начальных значений.

- `progress` зажимается снизу, чтобы линия не становилась пустой и не вызывала ошибки в turf.
- Дополнительные варианты тайминга смотри в [Timing](./timing.md).
- Учитывай размеры composition и делай линии достаточно толстыми, а размер шрифта у подписей достаточно большим, чтобы все читалось после масштабирования.

## Анимация линий

### Прямые линии через линейную интерполяцию

Если на карте нужна визуально прямая линия, используй линейную интерполяцию между координатами. Не используй `lineSliceAlong` и `along` из turf: они работают по geodesic или great-circle логике, из-за чего в проекции Меркатора линия выглядит изогнутой.

```tsx
const frame = useCurrentFrame();
const { durationInFrames } = useVideoConfig();

useEffect(() => {
  if (!map) return;

  const animationHandle = delayRender("Animating line...");

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Линейная интерполяция для визуально прямой линии на карте
  const start = lineCoordinates[0];
  const end = lineCoordinates[1];
  const currentLng = start[0] + (end[0] - start[0]) * progress;
  const currentLat = start[1] + (end[1] - start[1]) * progress;

  const lineData: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [start, [currentLng, currentLat]],
    },
  };

  const source = map.getSource("trace") as mapboxgl.GeoJSONSource;
  if (source) {
    source.setData(lineData);
  }

  map.once("idle", () => continueRender(animationHandle));
}, [frame, map, durationInFrames]);
```

### Изогнутые линии через geodesic или great circle

Если нужно показать маршрут по реальной кратчайшей траектории на Земле, например полет, используй `lineSliceAlong` из turf.

```tsx
import * as turf from "@turf/turf";

const routeLine = turf.lineString(lineCoordinates);
const routeDistance = turf.length(routeLine);

const currentDistance = Math.max(0.001, routeDistance * progress);
const slicedLine = turf.lineSliceAlong(routeLine, 0, currentDistance);

const source = map.getSource("route") as mapboxgl.GeoJSONSource;
if (source) {
  source.setData(slicedLine);
}
```

## Маркеры

Добавляй подписи и markers там, где это действительно помогает читать карту.

```tsx
_map.addSource("markers", {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Point 1" },
        geometry: { type: "Point", coordinates: [-118.2437, 34.0522] },
      },
    ],
  },
});

_map.addLayer({
  id: "city-markers",
  type: "circle",
  source: "markers",
  paint: {
    "circle-radius": 40,
    "circle-color": "#FF4444",
    "circle-stroke-width": 4,
    "circle-stroke-color": "#FFFFFF",
  },
});

_map.addLayer({
  id: "labels",
  type: "symbol",
  source: "markers",
  layout: {
    "text-field": ["get", "name"],
    "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
    "text-size": 50,
    "text-offset": [0, 0.5],
    "text-anchor": "top",
  },
  paint: {
    "text-color": "#FFFFFF",
    "text-halo-color": "#000000",
    "text-halo-width": 2,
  },
});
```

Убедись, что markers и подписи достаточно большие. Для composition `1920x1080` размер шрифта подписи должен быть не меньше `40px`.

IMPORTANT: Держи `text-offset` достаточно маленьким, чтобы подпись не уезжала далеко от marker. Для радиуса круга `40` хороший offset выглядит так:

```tsx
"text-offset": [0, 0.5],
```

## 3D-здания

Чтобы включить 3D-здания, используй:

```tsx
_map.setConfigProperty("basemap", "show3dObjects", true);
_map.setConfigProperty("basemap", "show3dLandmarks", true);
_map.setConfigProperty("basemap", "show3dBuildings", true);
```

## Рендер

При рендере анимации карты используй следующие флаги:

```bash
npx remotion render --gl=angle --concurrency=1
```
