import { interpolate } from "remotion";
import { data } from "../model/data";

export const reversedData = [...data].reverse();

export const X_SPACING = 30;
export const TOWER_WIDTH = 12;
export const TOWER_DEPTH = 10;
export const BASE_HEIGHT = 15;
export const TOWER_ROW_Z = 10;
export const GROUND_Y = -0.02;

const CINEMATIC_RAMP_FRAMES = 300;
const CINEMATIC_OVERVIEW_FRAMES = 540;
const CINEMATIC_TURN_FRAMES = 180;
const CINEMATIC_RETURN_FRAMES = 600;
const FINAL_CINEMATIC_FRAMES =
    CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES + CINEMATIC_TURN_FRAMES + CINEMATIC_RETURN_FRAMES;

const CAMERA_SWEEP_X_OFFSET = 24;
const CAMERA_SWEEP_Z_OFFSET = 16;
const CAMERA_ORBIT_X_RADIUS = 10;
const CAMERA_ORBIT_Z_RADIUS = 6;
const CAMERA_ORBIT_LOOK_X_RADIUS = 3;
const CAMERA_ORBIT_HOLD_FRAMES = 45;
const TOWER_PRELOAD_LEAD_FRAMES = 45;
const FULL_DETAIL_RADIUS = 1;
const STANDBY_RADIUS = 2;
export const FINAL_CAMERA_SLOWDOWN_START_FRAME = 4 * 60 * 60 + 42 * 60;
export const FINAL_CAMERA_SLOWDOWN_FACTOR = 3;

export const getTowerHeight = (relHeight: number) => {
    const scaledHeight = Math.pow(relHeight, 1.45) * 6.5;
    return Math.max(scaledHeight, 3);
};

const getMilestones = () => {
    let frame = 0;
    const list: { arriveFrame: number; leaveFrame: number; xCenter: number; yCenter: number; index: number }[] = [];

    for (let i = 0; i < reversedData.length; i++) {
        const item = reversedData[i];
        const moveFrames = i === 0 ? 0 : 80;
        const pauseFrames = 320;
        const arriveFrame = frame + moveFrames;
        const leaveFrame = arriveFrame + pauseFrames;
        const height = getTowerHeight(item.relHeight);

        list.push({
            index: i,
            arriveFrame,
            leaveFrame,
            xCenter: i * X_SPACING,
            yCenter: height + 20,
        });

        frame = leaveFrame;
    }

    const lastArrive = list[list.length - 1].leaveFrame;

    return { milestones: list, baseDurationInFrames: lastArrive + FINAL_CINEMATIC_FRAMES + 60 };
};

export const { milestones, baseDurationInFrames } = getMilestones();
export const sequenceCompleteFrame = milestones[milestones.length - 1].leaveFrame;
const slowedTailFrames = baseDurationInFrames - FINAL_CAMERA_SLOWDOWN_START_FRAME;
export const durationInFrames =
    FINAL_CAMERA_SLOWDOWN_START_FRAME + slowedTailFrames * FINAL_CAMERA_SLOWDOWN_FACTOR;

export function getCameraTimelineFrame(frame: number) {
    if (frame <= FINAL_CAMERA_SLOWDOWN_START_FRAME) {
        return frame;
    }

    const slowedFrame =
        FINAL_CAMERA_SLOWDOWN_START_FRAME + (frame - FINAL_CAMERA_SLOWDOWN_START_FRAME) / FINAL_CAMERA_SLOWDOWN_FACTOR;

    return Math.min(baseDurationInFrames, slowedFrame);
}

const getMilestoneState = (m: (typeof milestones)[number], localFrame = 0) => {
    const totalPause = m.leaveFrame - m.arriveFrame;
    const orbitFrames = Math.max(1, totalPause - CAMERA_ORBIT_HOLD_FRAMES);
    const orbitProgress =
        localFrame <= CAMERA_ORBIT_HOLD_FRAMES ? 0 : Math.min(1, (localFrame - CAMERA_ORBIT_HOLD_FRAMES) / orbitFrames);
    const orbitAngle = -0.6 + orbitProgress * 1.0;
    const orbitX = Math.sin(orbitAngle) * CAMERA_ORBIT_X_RADIUS;
    const orbitZ = (Math.cos(orbitAngle) - Math.cos(-0.6)) * CAMERA_ORBIT_Z_RADIUS;
    const orbitLookX = Math.sin(orbitAngle) * CAMERA_ORBIT_LOOK_X_RADIUS;

    return {
        camX: m.xCenter + CAMERA_SWEEP_X_OFFSET + orbitX,
        camY: m.yCenter + 2,
        lookX: m.xCenter + orbitLookX,
        lookY: m.yCenter,
        camZOffset: CAMERA_SWEEP_Z_OFFSET + orbitZ,
    };
};

export function getCameraState(frame: number) {
    if (frame <= milestones[0].arriveFrame) {
        return getMilestoneState(milestones[0]);
    }

    const last = milestones[milestones.length - 1];
    if (frame >= last.leaveFrame) {
        return getMilestoneState(last);
    }

    for (let i = 0; i < milestones.length; i++) {
        const cur = milestones[i];

        if (frame >= cur.arriveFrame && frame <= cur.leaveFrame) {
            return getMilestoneState(cur, frame - cur.arriveFrame);
        }

        if (i < milestones.length - 1) {
            const next = milestones[i + 1];
            if (frame > cur.leaveFrame && frame < next.arriveFrame) {
                const p = (frame - cur.leaveFrame) / (next.arriveFrame - cur.leaveFrame);
                const eased = p * p * (3 - 2 * p);
                const startState = getMilestoneState(cur, cur.leaveFrame - cur.arriveFrame);
                const endState = getMilestoneState(next, 0);

                return {
                    camX: startState.camX + (endState.camX - startState.camX) * eased,
                    camY: startState.camY + (endState.camY - startState.camY) * eased,
                    lookX: startState.lookX + (endState.lookX - startState.lookX) * eased,
                    lookY: startState.lookY + (endState.lookY - startState.lookY) * eased,
                    camZOffset: startState.camZOffset + (endState.camZOffset - startState.camZOffset) * eased,
                };
            }
        }
    }

    return getMilestoneState(last);
}

export function getSceneLayoutMetrics() {
    return {
        towerRange: [TOWER_ROW_Z - TOWER_DEPTH / 2, TOWER_ROW_Z + TOWER_DEPTH / 2] as const,
        roadRange: null,
    };
}

type CinematicCameraState = {
    camX: number;
    camY: number;
    camZ: number;
    lookX: number;
    lookY: number;
    lookZ: number;
};

export function getCinematicCameraState(cinematicFrame: number): CinematicCameraState {
    const firstMilestone = milestones[0];
    const lastMilestone = milestones[milestones.length - 1];
    const startState = getCameraState(lastMilestone.leaveFrame);

    const rampTarget: CinematicCameraState = {
        camX: lastMilestone.xCenter + 120,
        camY: 260,
        camZ: 340,
        lookX: lastMilestone.xCenter - 50,
        lookY: 78,
        lookZ: 0,
    };
    const overviewEnd: CinematicCameraState = {
        camX: firstMilestone.xCenter - 70,
        camY: 225,
        camZ: 290,
        lookX: firstMilestone.xCenter + 80,
        lookY: 62,
        lookZ: 0,
    };
    const returnStart: CinematicCameraState = {
        camX: firstMilestone.xCenter - 50,
        camY: 120,
        camZ: 185,
        lookX: firstMilestone.xCenter + 30,
        lookY: 48,
        lookZ: 0,
    };
    const returnEnd: CinematicCameraState = {
        camX: lastMilestone.xCenter + 80,
        camY: 132,
        camZ: 165,
        lookX: lastMilestone.xCenter - 40,
        lookY: 56,
        lookZ: 0,
    };

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES) {
        const rampProgress = Math.min(1, cinematicFrame / CINEMATIC_RAMP_FRAMES);
        const speedRamp =
            rampProgress < 0.4 ? (rampProgress / 0.4) * 0.9 : 0.9 + ((rampProgress - 0.4) / 0.6) * 0.1;
        const t = speedRamp * speedRamp * (3 - 2 * speedRamp);

        return {
            camX: interpolate(t, [0, 1], [startState.camX, rampTarget.camX]),
            camY: interpolate(t, [0, 1], [startState.camY, rampTarget.camY]),
            camZ: interpolate(t, [0, 1], [55 + startState.camZOffset, rampTarget.camZ]),
            lookX: interpolate(t, [0, 1], [startState.lookX, rampTarget.lookX]),
            lookY: interpolate(t, [0, 1], [startState.lookY, rampTarget.lookY]),
            lookZ: interpolate(t, [0, 1], [10, rampTarget.lookZ]),
        };
    }

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES) {
        const overviewFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES;
        const progress = Math.min(1, overviewFrame / CINEMATIC_OVERVIEW_FRAMES);
        const eased = progress * progress * (3 - 2 * progress);
        const glideY = Math.sin(progress * Math.PI) * 18;
        const glideZ = Math.sin(progress * Math.PI * 1.2) * 16;

        return {
            camX: interpolate(eased, [0, 1], [rampTarget.camX, overviewEnd.camX]),
            camY: interpolate(eased, [0, 1], [rampTarget.camY, overviewEnd.camY]) + glideY,
            camZ: interpolate(eased, [0, 1], [rampTarget.camZ, overviewEnd.camZ]) + glideZ,
            lookX: interpolate(eased, [0, 1], [rampTarget.lookX, overviewEnd.lookX]),
            lookY: interpolate(eased, [0, 1], [rampTarget.lookY, overviewEnd.lookY]),
            lookZ: 0,
        };
    }

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES + CINEMATIC_TURN_FRAMES) {
        const turnFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES - CINEMATIC_OVERVIEW_FRAMES;
        const progress = Math.min(1, turnFrame / CINEMATIC_TURN_FRAMES);
        const eased = progress * progress * (3 - 2 * progress);

        return {
            camX: interpolate(eased, [0, 1], [overviewEnd.camX, returnStart.camX]),
            camY: interpolate(eased, [0, 1], [overviewEnd.camY, returnStart.camY]),
            camZ: interpolate(eased, [0, 1], [overviewEnd.camZ, returnStart.camZ]),
            lookX: interpolate(eased, [0, 1], [overviewEnd.lookX, returnStart.lookX]),
            lookY: interpolate(eased, [0, 1], [overviewEnd.lookY, returnStart.lookY]),
            lookZ: 0,
        };
    }

    const returnFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES - CINEMATIC_OVERVIEW_FRAMES - CINEMATIC_TURN_FRAMES;
    const returnProgress = Math.min(1, returnFrame / CINEMATIC_RETURN_FRAMES);
    const eased = returnProgress * returnProgress * (3 - 2 * returnProgress);
    const swayY = Math.sin(returnProgress * Math.PI * 1.5) * 10;
    const swayZ = Math.sin(returnProgress * Math.PI) * 14;
    const leadLookX = Math.sin(returnProgress * Math.PI) * 12;

    return {
        camX: interpolate(eased, [0, 1], [returnStart.camX, returnEnd.camX]),
        camY: interpolate(eased, [0, 1], [returnStart.camY, returnEnd.camY]) + swayY,
        camZ: interpolate(eased, [0, 1], [returnStart.camZ, returnEnd.camZ]) + swayZ,
        lookX: interpolate(eased, [0, 1], [returnStart.lookX, returnEnd.lookX]) + leadLookX,
        lookY: interpolate(eased, [0, 1], [returnStart.lookY, returnEnd.lookY]),
        lookZ: 0,
    };
}

export function getFocusedTowerIndex(frame: number) {
    if (frame <= milestones[0].arriveFrame) {
        return milestones[0].index;
    }

    if (frame >= sequenceCompleteFrame) {
        return milestones[milestones.length - 1].index;
    }

    for (let i = 0; i < milestones.length; i++) {
        const cur = milestones[i];

        if (frame >= cur.arriveFrame && frame <= cur.leaveFrame) {
            return cur.index;
        }

        if (i < milestones.length - 1) {
            const next = milestones[i + 1];
            if (frame > cur.leaveFrame && frame < next.arriveFrame) {
                const midpoint = cur.leaveFrame + (next.arriveFrame - cur.leaveFrame) / 2;
                return frame < midpoint ? cur.index : next.index;
            }
        }
    }

    return milestones[milestones.length - 1].index;
}

export function shouldPreloadTowerAssets(frame: number, index: number) {
    if (frame > sequenceCompleteFrame) {
        return true;
    }

    const milestone = milestones[index];
    if (!milestone) {
        return false;
    }

    const focusedIndex = getFocusedTowerIndex(frame);
    if (Math.abs(index - focusedIndex) <= STANDBY_RADIUS) {
        return true;
    }

    return frame >= milestone.arriveFrame - TOWER_PRELOAD_LEAD_FRAMES && frame <= milestone.leaveFrame + CAMERA_ORBIT_HOLD_FRAMES;
}

export type TowerRenderMode = "minimal" | "standby" | "full" | "cinematic";

export function getTowerRenderMode(frame: number, index: number): TowerRenderMode {
    if (frame > sequenceCompleteFrame) {
        return "cinematic";
    }

    const focusedIndex = getFocusedTowerIndex(frame);
    const distance = Math.abs(index - focusedIndex);

    if (distance <= FULL_DETAIL_RADIUS) {
        return "full";
    }

    if (distance <= STANDBY_RADIUS || shouldPreloadTowerAssets(frame, index)) {
        return "standby";
    }

    return "minimal";
}
