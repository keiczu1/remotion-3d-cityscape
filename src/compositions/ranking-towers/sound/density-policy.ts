import type { ResolvedSoundCue } from "../model/types";

type CueGroup = {
    cueIds: string[];
    eventId: string;
    profile: ResolvedSoundCue["profile"];
    startFrame: number;
    totalVolume: number;
};

const DENSITY_WINDOW_FRAMES = 10;

const groupCuesByEvent = (cues: ResolvedSoundCue[]): CueGroup[] => {
    const groups = new Map<string, CueGroup>();

    for (const cue of cues) {
        const existing = groups.get(cue.eventId);

        if (!existing) {
            groups.set(cue.eventId, {
                cueIds: [cue.id],
                eventId: cue.eventId,
                profile: cue.profile,
                startFrame: cue.startFrame,
                totalVolume: cue.volume,
            });
            continue;
        }

        existing.cueIds.push(cue.id);
        existing.startFrame = Math.min(existing.startFrame, cue.startFrame);
        existing.totalVolume += cue.volume;
    }

    return [...groups.values()].sort((left, right) => left.startFrame - right.startFrame);
};

const getDensityMultiplier = (group: CueGroup, clusterDepth: number) => {
    const isMajor = group.profile === "impact-reveal" || group.totalVolume >= 2;

    if (clusterDepth <= 0) {
        return 1;
    }

    if (isMajor) {
        return clusterDepth === 1 ? 0.58 : 0.42;
    }

    return clusterDepth === 1 ? 0.72 : 0.52;
};

export const applyAppearanceCueDensityPolicy = (cues: ResolvedSoundCue[]): ResolvedSoundCue[] => {
    const groups = groupCuesByEvent(cues);
    const cueMultipliers = new Map<string, number>();
    let clusterDepth = 0;
    let previousStartFrame = Number.NEGATIVE_INFINITY;

    for (const group of groups) {
        if (group.startFrame - previousStartFrame <= DENSITY_WINDOW_FRAMES) {
            clusterDepth += 1;
        } else {
            clusterDepth = 0;
        }

        const multiplier = getDensityMultiplier(group, clusterDepth);

        group.cueIds.forEach((cueId) => {
            cueMultipliers.set(cueId, multiplier);
        });

        previousStartFrame = group.startFrame;
    }

    return cues.map((cue) => {
        const multiplier = cueMultipliers.get(cue.id) ?? 1;

        return {
            ...cue,
            volume: Number((cue.volume * multiplier).toFixed(3)),
        };
    });
};
