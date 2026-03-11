import type { AppearanceEvent, ResolvedSoundCue, ResolvedSoundLayer } from "../model/types";
import { applyAppearanceCueDensityPolicy } from "./density-policy";
import { appearanceSoundLibrary } from "./appearance-library";
import { resolveAppearanceSoundProfile } from "./appearance-profile";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const hashSeed = (seed: string) => {
    let hash = 0;

    for (let index = 0; index < seed.length; index++) {
        hash += seed.charCodeAt(index);
    }

    return hash;
};

const getVariantIndex = (seed: string, count: number) => {
    if (count <= 1) {
        return 0;
    }

    return hashSeed(seed) % count;
};

const getCueVolume = (intensity: number, layer: ResolvedSoundLayer) => {
    const layerWeight = layer === "transient" ? 0.92 : layer === "body" ? 1 : 0.7;
    return Number((clamp(0.25 + intensity * 0.75, 0.25, 1) * layerWeight).toFixed(3));
};

const getCueStartFrame = (event: AppearanceEvent, layer: ResolvedSoundLayer) => {
    if (layer === "body" && event.descriptor.direction !== "none") {
        return event.startFrame - 1;
    }

    if (layer === "tail") {
        return event.startFrame + 2;
    }

    return event.startFrame;
};

const getPlaybackRate = (durationFrames: number) => {
    if (durationFrames >= 36) {
        return 0.92;
    }

    if (durationFrames >= 28) {
        return 0.96;
    }

    return 1;
};

export const resolveAppearanceSoundCues = (event: AppearanceEvent): ResolvedSoundCue[] => {
    const profile = resolveAppearanceSoundProfile(event.descriptor);
    const variants = appearanceSoundLibrary[profile];
    const recipe = variants[getVariantIndex(event.seed, variants.length)];
    const playbackRate = getPlaybackRate(event.descriptor.durationFrames);

    const cues: ResolvedSoundCue[] = [];

    for (const layer of ["transient", "body", "tail"] as const) {
        const layerConfig = recipe[layer];

        if (!layerConfig) {
            continue;
        }

        cues.push({
            id: `${event.id}-${layer}`,
            eventId: event.id,
            profile,
            layer,
            startFrame: getCueStartFrame(event, layer),
            src: layerConfig.src,
            volume: getCueVolume(event.descriptor.intensity, layer),
            playbackRate,
        });
    }

    return cues;
};

export const resolveAppearanceSoundtrack = (events: AppearanceEvent[]): ResolvedSoundCue[] => {
    const cues = events
        .flatMap((event) => resolveAppearanceSoundCues(event))
        .sort((left, right) => left.startFrame - right.startFrame);

    return applyAppearanceCueDensityPolicy(cues);
};
