import type { AppearanceSoundProfile } from "../model/types";

export type AppearanceSoundLayerConfig = {
    src: string;
};

export type AppearanceSoundRecipe = {
    transient?: AppearanceSoundLayerConfig;
    body?: AppearanceSoundLayerConfig;
    tail?: AppearanceSoundLayerConfig;
};

export const appearanceSoundLibrary: Record<AppearanceSoundProfile, AppearanceSoundRecipe[]> = {
    "soft-reveal": [
        {
            transient: { src: "sfx/appearance/soft/transient-01.wav" },
            body: { src: "sfx/appearance/soft/body-01.wav" },
            tail: { src: "sfx/appearance/soft/tail-01.wav" },
        },
        {
            transient: { src: "sfx/appearance/soft/transient-02.wav" },
            body: { src: "sfx/appearance/soft/body-02.wav" },
            tail: { src: "sfx/appearance/soft/tail-02.wav" },
        },
    ],
    "pop-reveal": [
        {
            transient: { src: "sfx/appearance/pop/transient-01.wav" },
            body: { src: "sfx/appearance/pop/body-01.wav" },
            tail: { src: "sfx/appearance/pop/tail-01.wav" },
        },
        {
            transient: { src: "sfx/appearance/pop/transient-02.wav" },
            body: { src: "sfx/appearance/pop/body-02.wav" },
            tail: { src: "sfx/appearance/pop/tail-02.wav" },
        },
    ],
    "sweep-reveal": [
        {
            body: { src: "sfx/appearance/sweep/body-01.wav" },
            tail: { src: "sfx/appearance/sweep/tail-01.wav" },
        },
        {
            body: { src: "sfx/appearance/sweep/body-02.wav" },
            tail: { src: "sfx/appearance/sweep/tail-02.wav" },
        },
    ],
    "impact-reveal": [
        {
            transient: { src: "sfx/appearance/impact/transient-01.wav" },
            body: { src: "sfx/appearance/impact/body-01.wav" },
            tail: { src: "sfx/appearance/impact/tail-01.wav" },
        },
        {
            transient: { src: "sfx/appearance/impact/transient-02.wav" },
            body: { src: "sfx/appearance/impact/body-02.wav" },
            tail: { src: "sfx/appearance/impact/tail-02.wav" },
        },
    ],
    "tech-reveal": [
        {
            transient: { src: "sfx/appearance/tech/transient-01.wav" },
            body: { src: "sfx/appearance/tech/body-01.wav" },
            tail: { src: "sfx/appearance/tech/tail-01.wav" },
        },
        {
            transient: { src: "sfx/appearance/tech/transient-02.wav" },
            body: { src: "sfx/appearance/tech/body-02.wav" },
            tail: { src: "sfx/appearance/tech/tail-02.wav" },
        },
    ],
};
