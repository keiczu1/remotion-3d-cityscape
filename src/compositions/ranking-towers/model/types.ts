import { data } from "./data";

export type RankingTowerItem = (typeof data)[number];

export const appearanceKinds = ["fade", "scale", "slide", "impact", "tech"] as const;
export type AppearanceKind = (typeof appearanceKinds)[number];

export const appearanceDirections = ["left", "right", "up", "down", "none"] as const;
export type AppearanceDirection = (typeof appearanceDirections)[number];

export const appearanceSizeClasses = ["small", "medium", "large"] as const;
export type AppearanceSizeClass = (typeof appearanceSizeClasses)[number];

export const appearanceSoundProfiles = [
    "soft-reveal",
    "pop-reveal",
    "sweep-reveal",
    "impact-reveal",
    "tech-reveal",
] as const;
export type AppearanceSoundProfile = (typeof appearanceSoundProfiles)[number];

export type AppearanceDescriptor = {
    kind: AppearanceKind;
    durationFrames: number;
    intensity: number;
    direction: AppearanceDirection;
    hasOvershoot: boolean;
    hasSettle: boolean;
    sizeClass: AppearanceSizeClass;
};

export type AppearanceEvent = {
    id: string;
    startFrame: number;
    descriptor: AppearanceDescriptor;
    seed: string;
};

export type ResolvedSoundCue = {
    id: string;
    eventId: string;
    profile: AppearanceSoundProfile;
    startFrame: number;
    src: string;
    volume: number;
};
