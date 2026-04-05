import type { ConstructorCatalog } from "./types";

export const CONSTRUCTOR_CATALOG = {
    sceneCounts: [
        {
            id: "scene-count-4",
            sceneCount: 4,
            label: "4 сцены",
            description: "Базовый и единственный поддерживаемый scene-count для v1.",
        },
    ],
    worldOptions: [
        {
            id: "horizon-mountain-ridge-v1",
            label: "Горный хребет",
            description: "Дальний горный горизонт для природных и приключенческих corridor-сцен.",
            slot: "horizon",
            sourceProjects: ["2026-03-25-strongest-pokemon", "2026-03-30-richest-women"],
            references: [
                {
                    kind: "library-module",
                    id: "horizon-mountain-ridge-v1",
                    path: "src/lib/ranking-corridor/art/world/horizon-mountain-ridge.tsx",
                },
            ],
            recommendedFor: ["природа", "путешествия", "фэнтези", "биографии"],
        },
        {
            id: "forest-backdrop-v1",
            label: "Лесной массив",
            description: "Густой лесной backdrop для сцен с природной глубиной.",
            slot: "horizon",
            sourceProjects: ["2026-03-25-strongest-pokemon"],
            references: [
                {
                    kind: "library-module",
                    id: "forest-backdrop-v1",
                    path: "src/lib/ranking-corridor/art/world/forest-backdrop.tsx",
                },
            ],
            recommendedFor: ["животные", "природа", "покемоны"],
        },
        {
            id: "birch-backdrop-v1",
            label: "Березовый край",
            description: "Светлый березовый боковой фон для мягких природных или биографических сцен.",
            slot: "side-dressing",
            sourceProjects: ["2026-03-30-richest-women"],
            references: [
                {
                    kind: "library-module",
                    id: "birch-backdrop-v1",
                    path: "src/lib/ranking-corridor/art/world/birch-backdrop.tsx",
                },
            ],
            recommendedFor: ["биографии", "природа", "светлые сцены"],
        },
        {
            id: "wind-turbine-v1",
            label: "Ветряки",
            description: "Высокие турбины как дальние боковые акценты и масштабные ориентиры.",
            slot: "side-dressing",
            sourceProjects: ["2026-03-25-strongest-pokemon"],
            references: [
                {
                    kind: "library-module",
                    id: "wind-turbine-v1",
                    path: "src/lib/ranking-corridor/art/objects/wind-turbine.tsx",
                },
            ],
            recommendedFor: ["энергетика", "технологии", "ландшафт"],
        },
        {
            id: "low-poly-cloud-v1",
            label: "Облака",
            description: "Мягкие облачные формы для атмосферного движения в кадре.",
            slot: "atmospheric-motion",
            sourceProjects: ["2026-03-25-strongest-pokemon", "2026-03-30-richest-women"],
            references: [
                {
                    kind: "library-module",
                    id: "low-poly-cloud-v1",
                    path: "src/lib/ranking-corridor/art/objects/low-poly-cloud.tsx",
                },
            ],
            recommendedFor: ["природа", "биографии", "спокойные сцены"],
        },
        {
            id: "steam-train-line-v1",
            label: "Поезд",
            description: "Направленное движение поезда вдоль коридора как вторичная жизнь сцены.",
            slot: "directed-motion",
            sourceProjects: ["2026-03-25-strongest-pokemon"],
            references: [
                {
                    kind: "library-module",
                    id: "steam-train-line-v1",
                    path: "src/lib/ranking-corridor/art/world/steam-train-line.tsx",
                },
            ],
            recommendedFor: ["история", "транспорт", "путешествия"],
        },
        {
            id: "highway-ribbon-v1",
            label: "Шоссе с машинами",
            description: "Движущаяся дорожная лента с транспортом для более техногенных сцен.",
            slot: "directed-motion",
            sourceProjects: ["2026-03-20-most-visited-websites"],
            references: [
                {
                    kind: "library-module",
                    id: "highway-ribbon-v1",
                    path: "src/lib/ranking-corridor/art/world/highway-ribbon.tsx",
                },
            ],
            recommendedFor: ["сайты", "бренды", "технологии", "индустрия"],
        },
        {
            id: "corridor-relief-ground-v1",
            label: "Рельефная земля",
            description: "Живой ground-слой вместо плоской подложки.",
            slot: "ground",
            sourceProjects: ["2026-03-25-strongest-pokemon", "2026-03-30-richest-women"],
            references: [
                {
                    kind: "library-module",
                    id: "corridor-relief-ground-v1",
                    path: "src/lib/ranking-corridor/art/world/corridor-relief-ground.tsx",
                },
            ],
            recommendedFor: ["универсально", "природа", "биографии"],
        },
        {
            id: "storm-effects-v1",
            label: "Грозовые эффекты",
            description: "Свето-погодный акцент для late-game сцен и драматического усиления.",
            slot: "light-weather",
            sourceProjects: ["2026-03-25-strongest-pokemon"],
            references: [
                {
                    kind: "library-module",
                    id: "storm-effects-v1",
                    path: "src/lib/ranking-corridor/art/world/storm-effects.tsx",
                },
            ],
            recommendedFor: ["драма", "топ-лидеры", "экшен"],
        },
    ],
    cameraPackages: [
        {
            id: "camera-soft-side-orbit-classic-v1",
            packageId: "soft-side-orbit-classic-v1",
            label: "Классический башенный проход",
            description: "Мягкий боковой проход для башенных и altar-based corridor-роликов.",
            sourceProjects: ["ranking-towers", "2026-03-25-strongest-pokemon"],
            references: [
                {
                    kind: "scene-preset-package",
                    id: "soft-side-orbit-classic-v1",
                    path: "src/lib/ranking-corridor/scene-presets/soft-side-orbit-classic-v1/package.ts",
                },
            ],
        },
        {
            id: "camera-rail-focus-vip-finale-v1",
            packageId: "rail-focus-vip-finale-v1",
            label: "Прямой рельсовый фокус",
            description: "Линейный rail-focus проход с читаемым движением к лидерам.",
            sourceProjects: ["2026-03-20-most-visited-websites"],
            references: [
                {
                    kind: "scene-preset-package",
                    id: "rail-focus-vip-finale-v1",
                    path: "src/lib/ranking-corridor/scene-presets/rail-focus-vip-finale-v1/package.ts",
                },
            ],
        },
        {
            id: "camera-biography-stele-focus-hold-v1",
            packageId: "biography-stele-focus-hold-v1",
            label: "Biography hold",
            description: "Удерживающая биографическая подача для portrait / stele family.",
            sourceProjects: ["2026-03-30-richest-women"],
            references: [
                {
                    kind: "scene-preset-package",
                    id: "biography-stele-focus-hold-v1",
                    path: "src/lib/ranking-corridor/scene-presets/biography-stele-focus-hold-v1/package.ts",
                },
            ],
        },
    ],
    heroPackages: [
        {
            id: "hero-tower-hologram-monolith-v1",
            label: "Башенный монолит",
            description: "Базовая башенная family для classic corridor-роликов.",
            sourceProjects: ["ranking-towers"],
            references: [
                {
                    kind: "library-module",
                    id: "tower-hologram-monolith-v1",
                    path: "src/lib/ranking-corridor/hero/tower-hologram-monolith.tsx",
                },
            ],
        },
        {
            id: "hero-media-stele-shell-v1",
            label: "Медиа-стела",
            description: "Image-first stele family для сайтов, брендов и медийных тем.",
            sourceProjects: ["2026-03-20-most-visited-websites", "2026-03-25-strongest-pokemon"],
            references: [
                {
                    kind: "library-module",
                    id: "media-stele-shell-v1",
                    path: "src/lib/ranking-corridor/art/objects/media-stele-shell.tsx",
                },
            ],
        },
        {
            id: "hero-portrait-biography-stele-v1",
            label: "Портретная biography-стела",
            description: "Биографическая portrait-stele family для персон и историй.",
            sourceProjects: ["2026-03-30-richest-women"],
            references: [
                {
                    kind: "library-module",
                    id: "portrait-biography-stele-v1",
                    path: "src/lib/ranking-corridor/hero/portrait-biography-stele.tsx",
                },
            ],
        },
        {
            id: "hero-stone-altar-pedestal-v1",
            label: "Каменный altar-пьедестал",
            description: "Более тяжелая altar-based family для природных и монументальных тем.",
            sourceProjects: ["2026-03-25-strongest-pokemon"],
            references: [
                {
                    kind: "library-module",
                    id: "stone-altar-pedestal-v1",
                    path: "src/lib/ranking-corridor/art/objects/stone-altar-pedestal.tsx",
                },
            ],
        },
    ],
} as const satisfies ConstructorCatalog;
