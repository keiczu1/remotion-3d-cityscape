import { interpolate } from "remotion";
import * as THREE from "three";

import {
    STELE_DASHBOARD_BOTTOM_LOCAL_Y,
    STELE_DASHBOARD_CENTER_LOCAL_Y,
    STELE_DASHBOARD_TOP_LOCAL_Y,
} from "../components/stele-dashboard-layout";
import { data } from "../model/data";

export const reversedData = [...data].reverse();

export const INTRO_REVEAL_FRAMES = 45;
export const INTRO_HOLD_FRAMES = 40;
export const INTRO_PUSH_IN_FRAMES = 90;
export const INTRO_DURATION_IN_FRAMES = INTRO_REVEAL_FRAMES + INTRO_HOLD_FRAMES + INTRO_PUSH_IN_FRAMES;
export const INTRO_TITLE_EXIT_FRAMES = 30;

export const X_SPACING = 30;
export const STELE_WIDTH = 14;
export const STELE_DEPTH = 4;
export const BASE_HEIGHT = 15;
export const STELE_ROW_Z = 10;
export const GROUND_Y = -0.02;

const CINEMATIC_RAMP_FRAMES = 300;
const CINEMATIC_OVERVIEW_FRAMES = 540;
const CINEMATIC_TURN_FRAMES = 180;
const CINEMATIC_RETURN_FRAMES = 600;
const FINAL_CINEMATIC_FRAMES =
    CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES + CINEMATIC_TURN_FRAMES + CINEMATIC_RETURN_FRAMES;

/* Dolly-Push continuous camera mode */
const CAMERA_ORBIT_HOLD_FRAMES = 60;
const STELE_PRELOAD_LEAD_FRAMES = 120;
const FULL_DETAIL_RADIUS = 2;
const STANDBY_RADIUS = 3;
const CINEMATIC_CARD_RADIUS = 3;
const CINEMATIC_STANDBY_RADIUS_MIN = CINEMATIC_CARD_RADIUS + 2;
const CINEMATIC_STANDBY_RADIUS_MAX = 11;
const CINEMATIC_OVERVIEW_HEIGHT_NEAR = 120;
const CINEMATIC_OVERVIEW_HEIGHT_FAR = 260;
const CINEMATIC_OVERVIEW_DEPTH_NEAR = 165;
const CINEMATIC_OVERVIEW_DEPTH_FAR = 340;
const CINEMATIC_VISIBILITY_VIEWPORT_WIDTH = 1920;
const CINEMATIC_VISIBILITY_VIEWPORT_HEIGHT = 1080;
const CINEMATIC_VISIBILITY_MARGIN_X = 0.06;
const CINEMATIC_VISIBILITY_MARGIN_Y = 0.1;
export const FINAL_CAMERA_SLOWDOWN_START_FRAME = Math.floor((4 * 60 * 60 + 42 * 60) * 0.9) + INTRO_DURATION_IN_FRAMES;
export const FINAL_CAMERA_SLOWDOWN_FACTOR = 3;

const cinematicVisibilityCamera = new THREE.PerspectiveCamera(
    45,
    CINEMATIC_VISIBILITY_VIEWPORT_WIDTH / CINEMATIC_VISIBILITY_VIEWPORT_HEIGHT,
    1,
    7000,
);
const cinematicVisibilityWorldVector = new THREE.Vector3();
const cinematicVisibilityViewVector = new THREE.Vector3();
const cinematicVisibilityUpAxis = new THREE.Vector3(0, 1, 0);

export const getSteleHeight = (relHeight: number) => {
    const scaledHeight = Math.pow(relHeight, 1.45) * 6.5;
    return Math.max(3, scaledHeight);
};

const getMilestones = () => {
    let frame = INTRO_DURATION_IN_FRAMES;
    const list: { arriveFrame: number; leaveFrame: number; xCenter: number; yCenter: number; index: number }[] = [];

    for (let i = 0; i < reversedData.length; i++) {
        const item = reversedData[i];
        const isFirstPlace = i === reversedData.length - 1;
        const moveFrames = i === 0 ? 0 : 72; // -10% faster
        // Делаем значимую паузу. Остальные места стоят ~4.8 сек (288 фреймов). 
        // Если вы просили добавить задержку 5 сек на первом месте — ставим 600 фреймов (ровно 10 секунд).
        const pauseFrames = isFirstPlace ? 600 : 288; 
        const arriveFrame = frame + moveFrames;
        const leaveFrame = arriveFrame + pauseFrames;
        const height = getSteleHeight(item.relHeight);

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

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
const smoothstep = (edge0: number, edge1: number, value: number) => {
    if (edge0 === edge1) {
        return value >= edge1 ? 1 : 0;
    }

    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
};

const easeInOutCubic = (value: number) => {
    const t = clamp01(value);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const sortedSteleCenters = milestones.map((milestone) => milestone.yCenter).sort((a, b) => a - b);
const pickSteleCenterPercentile = (percentile: number) =>
    sortedSteleCenters[Math.min(sortedSteleCenters.length - 1, Math.floor((sortedSteleCenters.length - 1) * percentile))];

const VIP_HEIGHT_THRESHOLD = pickSteleCenterPercentile(0.95);
const VIP_MAX_HEIGHT = sortedSteleCenters[sortedSteleCenters.length - 1];
const VIP_SETTLE_MIN_FRAMES = 30;
const VIP_SETTLE_MAX_FRAMES = 84;
const VIP_ORBIT_SIDE_OFFSET_MIN = 3.0;
const VIP_ORBIT_SIDE_OFFSET_MAX = 1.6;
const VIP_ORBIT_X_RADIUS_MIN = 1.9;
const VIP_ORBIT_X_RADIUS_MAX = 3.8;
const VIP_ORBIT_Z_RADIUS_MIN = 1.0;
const VIP_ORBIT_Z_RADIUS_MAX = 2.8;
const VIP_ORBIT_Y_RADIUS_MIN = 0.45;
const VIP_ORBIT_Y_RADIUS_MAX = 1.8;
const VIP_ORBIT_SWEEP_RADIANS = 0.9;
const FINAL_VIP_FRONT_SWEEP_X_RADIUS_MIN = 4.6;
const FINAL_VIP_FRONT_SWEEP_X_RADIUS_MAX = 8.4;
const FINAL_VIP_FRONT_EDGE_Z_BONUS_MIN = 0.9;
const FINAL_VIP_FRONT_EDGE_Z_BONUS_MAX = 2.2;
const FINAL_VIP_FRONT_Y_RADIUS_MIN = 0.35;
const FINAL_VIP_FRONT_Y_RADIUS_MAX = 1.4;
const FINAL_VIP_FRONT_LOOK_X_LEAD = 0.07;
const FINAL_VIP_PULL_AWAY_START = 0.72;
const FINAL_VIP_PULL_AWAY_Z_MIN = 1.6;
const FINAL_VIP_PULL_AWAY_Z_MAX = 4.8;
const FINAL_VIP_PULL_AWAY_Y_MIN = 0.4;
const FINAL_VIP_PULL_AWAY_Y_MAX = 1.8;
const FINAL_VIP_PULL_AWAY_LOOK_X_LEAD = 0.03;
const VIP_LAUNCH_TRAVEL_DELAY = 0.04;
const VIP_LAUNCH_LIFT_DELAY = 0.18;
const VIP_LAUNCH_LIFT_POWER = 1.35;

type CameraState = {
    camX: number;
    camY: number;
    lookX: number;
    lookY: number;
    camZOffset: number;
};

type VipFocusProfile = {
    index: number;
    heightNorm: number;
    arriveFrame: number;
    focusLockFrame: number;
    leaveFrame: number;
    segmentEndFrame: number;
    xCenter: number;
    yCenter: number;
};

const getPushInForIndex = (indexPosition: number) => {
    const pushInFactor = Math.max(0, (indexPosition - 25) / 14);
    return clamp01(pushInFactor * pushInFactor);
};

const getDroneOffsets = (frame: number) => ({
    sine: Math.sin(frame * 0.015),
    cosine: Math.cos(frame * 0.012),
});

const mixCameraStates = (from: CameraState, to: CameraState, progress: number): CameraState => ({
    camX: mix(from.camX, to.camX, progress),
    camY: mix(from.camY, to.camY, progress),
    lookX: mix(from.lookX, to.lookX, progress),
    lookY: mix(from.lookY, to.lookY, progress),
    camZOffset: mix(from.camZOffset, to.camZOffset, progress),
});

export const isVipStele = (index: number) => {
    const milestone = milestones[index];
    return Boolean(milestone && milestone.yCenter >= VIP_HEIGHT_THRESHOLD);
};

const getVipFocusProfile = (index: number): VipFocusProfile | null => {
    const milestone = milestones[index];
    if (!milestone || !isVipStele(index)) {
        return null;
    }

    const heightNorm = clamp01((milestone.yCenter - VIP_HEIGHT_THRESHOLD) / Math.max(1, VIP_MAX_HEIGHT - VIP_HEIGHT_THRESHOLD));
    const settleFrames = Math.round(mix(VIP_SETTLE_MIN_FRAMES, VIP_SETTLE_MAX_FRAMES, heightNorm));
    const nextMilestone = milestones[index + 1];

    return {
        index,
        heightNorm,
        arriveFrame: milestone.arriveFrame,
        focusLockFrame: Math.min(milestone.leaveFrame, milestone.arriveFrame + settleFrames),
        leaveFrame: milestone.leaveFrame,
        segmentEndFrame: nextMilestone?.arriveFrame ?? milestone.leaveFrame,
        xCenter: milestone.xCenter,
        yCenter: milestone.yCenter,
    };
};

const vipFocusProfiles = milestones.map((_, index) => getVipFocusProfile(index));

const getVipFocusProfileForFrame = (frame: number) => {
    for (const profile of vipFocusProfiles) {
        if (!profile) {
            continue;
        }

        const isFinalOrbitHold = profile.segmentEndFrame === profile.leaveFrame;
        const isWithinProfile =
            frame >= profile.arriveFrame &&
            (frame < profile.segmentEndFrame || (isFinalOrbitHold && frame === profile.leaveFrame));

        if (isWithinProfile) {
            return profile;
        }
    }

    return null;
};

export const getSteleFocusLockFrame = (index: number) => {
    const vipProfile = vipFocusProfiles[index];
    return vipProfile ? vipProfile.focusLockFrame : milestones[index]?.arriveFrame ?? 0;
};

/* ---- Environment Act Boundaries ---- */
// Act I: #40–#30 (indices 0–10), Act II: #29–#15 (indices 11–25), Act III: #14–#2 (indices 26–38), Finale: #1 (index 39)
const ACT1_END_INDEX = 10;  // after position #30
const ACT2_END_INDEX = 25;  // after position #15
const ACT3_END_INDEX = 38;  // after position #2
export const ACT1_END_FRAME = milestones[ACT1_END_INDEX].leaveFrame;
export const ACT2_END_FRAME = milestones[ACT2_END_INDEX].leaveFrame;
export const ACT3_END_FRAME = milestones[ACT3_END_INDEX].leaveFrame;
export const FINALE_FRAME = milestones[39]?.arriveFrame ?? milestones[milestones.length - 1].arriveFrame;

export function getEnvironmentState(frame: number) {
    // Determine which stele is currently in focus
    let focusedIndex = 0;
    for (let i = milestones.length - 1; i >= 0; i--) {
        if (frame >= milestones[i].arriveFrame) {
            focusedIndex = i;
            break;
        }
    }
    const focusedX = focusedIndex * X_SPACING;

    // Overall progress 0→1 across the entire video
    const totalProgress = interpolate(frame, [INTRO_DURATION_IN_FRAMES, sequenceCompleteFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Act-specific progress (0→1 within each act)
    let act: 1 | 2 | 3 | 4 = 1;
    let actProgress = 0;
    if (frame < ACT1_END_FRAME) {
        act = 1;
        actProgress = interpolate(frame, [INTRO_DURATION_IN_FRAMES, ACT1_END_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    } else if (frame < ACT2_END_FRAME) {
        act = 2;
        actProgress = interpolate(frame, [ACT1_END_FRAME, ACT2_END_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    } else if (frame < ACT3_END_FRAME) {
        act = 3;
        actProgress = interpolate(frame, [ACT2_END_FRAME, ACT3_END_FRAME], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    } else {
        act = 4; // Finale
        actProgress = interpolate(frame, [ACT3_END_FRAME, sequenceCompleteFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }

    return { act, actProgress, totalProgress, focusedIndex, focusedX };
}

export function getCameraTimelineFrame(frame: number) {
    if (frame <= FINAL_CAMERA_SLOWDOWN_START_FRAME) {
        return frame;
    }

    const slowedFrame =
        FINAL_CAMERA_SLOWDOWN_START_FRAME + (frame - FINAL_CAMERA_SLOWDOWN_START_FRAME) / FINAL_CAMERA_SLOWDOWN_FACTOR;

    return Math.min(baseDurationInFrames, slowedFrame);
}

export function isIntroFrame(frame: number) {
    return frame < INTRO_DURATION_IN_FRAMES;
}

export function getIntroTitleState(frame: number) {
    const clampedFrame = Math.max(0, Math.min(INTRO_DURATION_IN_FRAMES, frame));
    const revealProgress = Math.min(1, clampedFrame / INTRO_REVEAL_FRAMES);
    const revealEased = revealProgress * revealProgress * (3 - 2 * revealProgress);
    const exitStartFrame = INTRO_DURATION_IN_FRAMES - INTRO_TITLE_EXIT_FRAMES;
    const exitProgress =
        clampedFrame <= exitStartFrame ? 0 : Math.min(1, (clampedFrame - exitStartFrame) / INTRO_TITLE_EXIT_FRAMES);
    const exitEased = exitProgress * exitProgress * (3 - 2 * exitProgress);
    const opacity = interpolate(revealEased, [0, 1], [0, 1]) * interpolate(exitEased, [0, 1], [1, 0]);
    const revealTranslateY = interpolate(revealEased, [0, 1], [28, 0]);
    const exitTranslateY = interpolate(exitEased, [0, 1], [0, -36]);
    const scale = exitProgress > 0 ? interpolate(exitEased, [0, 1], [1, 0.94]) : interpolate(revealEased, [0, 1], [0.94, 1]);

    return {
        isVisible: opacity > 0.01,
        opacity,
        scale,
        translateY: revealTranslateY + exitTranslateY,
    };
}

function getContinuousCameraState(frame: number): CameraState {
    // Determine the exact midpoint of each stele's "pause" window
    const getPeak = (i: number) => (milestones[i].arriveFrame + milestones[i].leaveFrame) / 2;

    let continuousIndex = 0;
    const firstPeak = getPeak(0);
    const lastPeak = getPeak(milestones.length - 1);

    if (frame <= firstPeak) {
        // Linearly extrapolate backwards for the intro to link perfectly
        const secondPeak = getPeak(1);
        const dist = secondPeak - firstPeak;
        continuousIndex = (frame - firstPeak) / dist; 
    } else if (frame >= lastPeak) {
        // Linearly extrapolate forwards for finale
        const prevPeak = getPeak(milestones.length - 2);
        const dist = lastPeak - prevPeak;
        continuousIndex = (milestones.length - 1) + (frame - lastPeak) / dist;
    } else {
        // Continuous linear movement for all steles, no rigid stops.
        const getHold = () => 0;

        for (let i = 0; i < milestones.length - 1; i++) {
            const p1 = getPeak(i);
            const p2 = getPeak(i + 1);
            if (frame >= p1 && frame < p2) {
                const t = frame - p1;
                const hold1 = getHold();
                const hold2 = getHold();
                
                const startMove = hold1 / 2;
                const endMove = (p2 - p1) - (hold2 / 2);
                
                if (t <= startMove) {
                    continuousIndex = i;
                } else if (t >= endMove) {
                    continuousIndex = i + 1;
                } else {
                    const pRaw = (t - startMove) / (endMove - startMove);
                    let prog = pRaw;
                    if (hold1 > 0 || hold2 > 0) {
                        prog = pRaw * pRaw * (3 - 2 * pRaw); // smoothstep for VIP mode smoothly accelerating/decelerating
                    }
                    continuousIndex = i + prog;
                }
                break;
            }
        }
    }

    const i0 = Math.max(0, Math.floor(continuousIndex));
    const i1 = Math.min(milestones.length - 1, i0 + 1);
    const fraction = continuousIndex - Math.floor(continuousIndex);

    const m0 = milestones[i0];
    const m1 = milestones[i1];

    const currentX = continuousIndex * X_SPACING;

    // Smoothed Y tracking with anticipation logic
    let yProgress = fraction;
    // If the next building is significantly taller, pan up quickly at the start of the move 
    // to avoid UI assembling off-screen
    if (m1.yCenter > m0.yCenter + 1.0) {
        yProgress = 1 - Math.pow(1 - fraction, 3);
    } else {
        yProgress = fraction * fraction * (3 - 2 * fraction);
    }
    const targetY = m0.yCenter + (m1.yCenter - m0.yCenter) * yProgress;

    // Dolly Push mapping: Normal distance for indices 0..25, push in progressively from 26..39
    const pushInFactor0 = Math.max(0, (i0 - 25) / 14); // 0 to 1
    const pushInFactor1 = Math.max(0, (i1 - 25) / 14);
    
    // Quad ease for dramatic push in
    const pushIn0 = pushInFactor0 * pushInFactor0; 
    const pushIn1 = pushInFactor1 * pushInFactor1;
    let currentPushIn = pushIn0 + (pushIn1 - pushIn0) * fraction;
    
    // Safety clamp for intro/outro extrapolations
    currentPushIn = Math.max(0, Math.min(1, currentPushIn));

    // Dynamic camera placement (Variable Distance Dolly)
    // Far from top steles: Z = 38 (wide). Top 1: Z = 16 (close)
    const zOffset = 38 - currentPushIn * 22;     
    
    // When wide, we look from further left (X offset 7). When close, move more frontal (X offset 2).
    const xOffset = 7 - currentPushIn * 5;       
    
    // Look ahead. Wide: look at next stele (20 units ahead). Close: look tightly at current stele (5 units ahead).
    const lookXOffset = 20 - currentPushIn * 15; 

    // Vertical framing
    // Height of camera: slightly above target
    const camY = targetY + 3 + currentPushIn * 2;
    // Look height: look standard when wide, look up creatively when close
    const lookY = targetY - 2 + currentPushIn * 8; 
    
    // Subtle organic breathing of the drone
    const drone = getDroneOffsets(frame);

    return {
        camX: currentX + xOffset,
        camY: camY + drone.sine * 2.0,
        lookX: currentX + lookXOffset,
        lookY: lookY + drone.cosine * 1.5,
        camZOffset: zOffset, 
    };
}

const getVipOrbitCameraState = (profile: VipFocusProfile, frame: number): CameraState => {
    const holdRange = Math.max(1, profile.leaveFrame - profile.focusLockFrame);
    const orbitProgress = clamp01((frame - profile.focusLockFrame) / holdRange);
    const pushIn = getPushInForIndex(profile.index);
    const drone = getDroneOffsets(frame);
    const isFinalOrbitHold = profile.segmentEndFrame === profile.leaveFrame;

    if (isFinalOrbitHold) {
        const sweepProgress = easeInOutCubic(orbitProgress);
        const frontSweepXRadius = mix(FINAL_VIP_FRONT_SWEEP_X_RADIUS_MIN, FINAL_VIP_FRONT_SWEEP_X_RADIUS_MAX, profile.heightNorm);
        const frontEdgeZBonus = mix(FINAL_VIP_FRONT_EDGE_Z_BONUS_MIN, FINAL_VIP_FRONT_EDGE_Z_BONUS_MAX, profile.heightNorm);
        const frontYRadius = mix(FINAL_VIP_FRONT_Y_RADIUS_MIN, FINAL_VIP_FRONT_Y_RADIUS_MAX, profile.heightNorm);
        const pullAwayProgress = smoothstep(FINAL_VIP_PULL_AWAY_START, 1, sweepProgress);
        const pullAwayZ = mix(FINAL_VIP_PULL_AWAY_Z_MIN, FINAL_VIP_PULL_AWAY_Z_MAX, profile.heightNorm) * pullAwayProgress;
        const pullAwayY = mix(FINAL_VIP_PULL_AWAY_Y_MIN, FINAL_VIP_PULL_AWAY_Y_MAX, profile.heightNorm) * pullAwayProgress;
        const framingZOffset = Math.max(11.4, 38 - pushIn * 22 - mix(2.4, 4.8, profile.heightNorm));
        const frontSweepX = mix(-frontSweepXRadius, frontSweepXRadius, sweepProgress);
        const edgeDistance = Math.abs(sweepProgress * 2 - 1);
        const frontOrbitY = Math.sin(sweepProgress * Math.PI) * frontYRadius;
        const lookXLead = mix(FINAL_VIP_FRONT_LOOK_X_LEAD, FINAL_VIP_PULL_AWAY_LOOK_X_LEAD, pullAwayProgress);

        return {
            camX: profile.xCenter + frontSweepX + drone.sine * 0.3,
            camY: profile.yCenter + mix(4.2, 8.8, profile.heightNorm) + frontOrbitY + pullAwayY + drone.sine * 0.22,
            lookX: profile.xCenter + frontSweepX * lookXLead + drone.cosine * 0.04,
            lookY: profile.yCenter + mix(-0.6, 3.2, profile.heightNorm) + Math.cos(sweepProgress * Math.PI) * frontYRadius * 0.16 + drone.cosine * 0.16,
            camZOffset: framingZOffset + edgeDistance * frontEdgeZBonus + pullAwayZ,
        };
    }

    const orbitAngle = mix(-VIP_ORBIT_SWEEP_RADIANS, VIP_ORBIT_SWEEP_RADIANS, orbitProgress);
    const orbitWave = orbitProgress * Math.PI * 2;

    const sideOffset = mix(VIP_ORBIT_SIDE_OFFSET_MIN, VIP_ORBIT_SIDE_OFFSET_MAX, profile.heightNorm);
    const orbitRadiusX = mix(VIP_ORBIT_X_RADIUS_MIN, VIP_ORBIT_X_RADIUS_MAX, profile.heightNorm);
    const orbitRadiusZ = mix(VIP_ORBIT_Z_RADIUS_MIN, VIP_ORBIT_Z_RADIUS_MAX, profile.heightNorm);
    const orbitRadiusY = mix(VIP_ORBIT_Y_RADIUS_MIN, VIP_ORBIT_Y_RADIUS_MAX, profile.heightNorm);
    const framingZOffset = Math.max(12, 38 - pushIn * 22 - mix(1.2, 3.8, profile.heightNorm));
    const orbitX = Math.sin(orbitAngle) * orbitRadiusX;
    const orbitZ = Math.sin(orbitProgress * Math.PI) * orbitRadiusZ;
    const orbitY = Math.sin(orbitWave) * orbitRadiusY;

    return {
        camX: profile.xCenter + sideOffset + orbitX + drone.sine * 0.55,
        camY: profile.yCenter + mix(4.0, 8.5, profile.heightNorm) + orbitY + drone.sine * 0.45,
        lookX: profile.xCenter + drone.cosine * 0.08,
        lookY: profile.yCenter + mix(-0.8, 3.4, profile.heightNorm) + Math.cos(orbitWave) * orbitRadiusY * 0.22 + drone.cosine * 0.25,
        camZOffset: framingZOffset + orbitZ,
    };
};

const getVipCameraState = (frame: number): CameraState | null => {
    const profile = getVipFocusProfileForFrame(frame);
    if (!profile) {
        return null;
    }

    const baseState = getContinuousCameraState(frame);
    const orbitLockState = getVipOrbitCameraState(profile, profile.focusLockFrame);

    if (frame < profile.focusLockFrame) {
        const settleProgress = smoothstep(profile.arriveFrame, profile.focusLockFrame, frame);
        return mixCameraStates(baseState, orbitLockState, settleProgress);
    }

    if (frame <= profile.leaveFrame || profile.segmentEndFrame === profile.leaveFrame) {
        return getVipOrbitCameraState(profile, frame);
    }

    const launchProgress = smoothstep(profile.leaveFrame, profile.segmentEndFrame, frame);
    const sourceState = getVipOrbitCameraState(profile, profile.leaveFrame);
    const targetState = getContinuousCameraState(profile.segmentEndFrame);
    const travelProgress = smoothstep(VIP_LAUNCH_TRAVEL_DELAY, 1, launchProgress);
    const liftProgress = Math.pow(smoothstep(VIP_LAUNCH_LIFT_DELAY, 1, launchProgress), VIP_LAUNCH_LIFT_POWER);

    return {
        camX: mix(sourceState.camX, targetState.camX, travelProgress),
        camY: mix(sourceState.camY, targetState.camY, liftProgress),
        lookX: mix(sourceState.lookX, targetState.lookX, travelProgress),
        lookY: mix(sourceState.lookY, targetState.lookY, liftProgress),
        camZOffset: mix(sourceState.camZOffset, targetState.camZOffset, launchProgress),
    };
};

export function getCameraState(frame: number) {
    return getVipCameraState(frame) ?? getContinuousCameraState(frame);
}

type CinematicCameraState = {
    camX: number;
    camY: number;
    camZ: number;
    lookX: number;
    lookY: number;
    lookZ: number;
};

export type IntroCameraState = CinematicCameraState;

export function getIntroCameraState(frame: number): IntroCameraState {
    const firstMainCameraState = getCameraState(milestones[0].arriveFrame);
    const clampedFrame = Math.max(0, Math.min(INTRO_DURATION_IN_FRAMES, frame));
    const pushInStartFrame = INTRO_REVEAL_FRAMES + INTRO_HOLD_FRAMES;
    const pushInProgress =
        clampedFrame <= pushInStartFrame ? 0 : Math.min(1, (clampedFrame - pushInStartFrame) / INTRO_PUSH_IN_FRAMES);
    const eased = pushInProgress * pushInProgress * (3 - 2 * pushInProgress);

    const introStart: IntroCameraState = {
        camX: firstMainCameraState.camX - 42,
        camY: firstMainCameraState.camY + 58,
        camZ: 210,
        lookX: firstMainCameraState.lookX - 18,
        lookY: firstMainCameraState.lookY + 10,
        lookZ: 10,
    };
    const introEnd: IntroCameraState = {
        camX: firstMainCameraState.camX,
        camY: firstMainCameraState.camY,
        camZ: 55 + firstMainCameraState.camZOffset,
        lookX: firstMainCameraState.lookX,
        lookY: firstMainCameraState.lookY,
        lookZ: 10,
    };

    if (clampedFrame >= INTRO_DURATION_IN_FRAMES) {
        return introEnd;
    }

    return {
        camX: interpolate(eased, [0, 1], [introStart.camX, introEnd.camX]),
        camY: interpolate(eased, [0, 1], [introStart.camY, introEnd.camY]),
        camZ: interpolate(eased, [0, 1], [introStart.camZ, introEnd.camZ]),
        lookX: interpolate(eased, [0, 1], [introStart.lookX, introEnd.lookX]),
        lookY: interpolate(eased, [0, 1], [introStart.lookY, introEnd.lookY]),
        lookZ: 10,
    };
}

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
        const t = easeInOutCubic(rampProgress);

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

export function getFocusedSteleIndex(frame: number) {
    if (frame <= milestones[0].arriveFrame) {
        return milestones[0].index;
    }

    const cameraFrame = getCameraTimelineFrame(frame);

    if (cameraFrame > sequenceCompleteFrame) {
        const cinematicFrame = cameraFrame - sequenceCompleteFrame;
        const cinematicState = getCinematicCameraState(cinematicFrame);
        const focusedIndex = Math.round(cinematicState.lookX / X_SPACING);

        return Math.max(0, Math.min(milestones.length - 1, focusedIndex));
    }

    if (cameraFrame >= sequenceCompleteFrame) {
        return milestones[milestones.length - 1].index;
    }

    for (let i = 0; i < milestones.length; i++) {
        const cur = milestones[i];

        if (cameraFrame >= cur.arriveFrame && cameraFrame <= cur.leaveFrame) {
            return cur.index;
        }

        if (i < milestones.length - 1) {
            const next = milestones[i + 1];
            if (cameraFrame > cur.leaveFrame && cameraFrame < next.arriveFrame) {
                const midpoint = cur.leaveFrame + (next.arriveFrame - cur.leaveFrame) / 2;
                return cameraFrame < midpoint ? cur.index : next.index;
            }
        }
    }

    return milestones[milestones.length - 1].index;
}

export type SteleRenderMode = "minimal" | "standby" | "full" | "cinematic";

function shouldPreloadSteleAssetsForFocus(frame: number, index: number, focusedIndex: number) {
    if (frame > sequenceCompleteFrame) {
        return true;
    }

    const milestone = milestones[index];
    if (!milestone) {
        return false;
    }

    if (Math.abs(index - focusedIndex) <= STANDBY_RADIUS) {
        return true;
    }

    return frame >= milestone.arriveFrame - STELE_PRELOAD_LEAD_FRAMES && frame <= milestone.leaveFrame + CAMERA_ORBIT_HOLD_FRAMES;
}

export function shouldPreloadSteleAssets(frame: number, index: number) {
    return shouldPreloadSteleAssetsForFocus(frame, index, getFocusedSteleIndex(frame));
}

function getCinematicDetailWindow(frame: number) {
    const cameraFrame = getCameraTimelineFrame(frame);
    const cinematicFrame = Math.max(0, cameraFrame - sequenceCompleteFrame);
    const cinematicState = getCinematicCameraState(cinematicFrame);
    const overviewCoverage = Math.max(
        smoothstep(CINEMATIC_OVERVIEW_HEIGHT_NEAR, CINEMATIC_OVERVIEW_HEIGHT_FAR, cinematicState.camY),
        smoothstep(CINEMATIC_OVERVIEW_DEPTH_NEAR, CINEMATIC_OVERVIEW_DEPTH_FAR, cinematicState.camZ),
    );
    const standbyRadius = Math.round(
        mix(CINEMATIC_STANDBY_RADIUS_MIN, CINEMATIC_STANDBY_RADIUS_MAX, overviewCoverage),
    );

    return {
        cinematicRadius: CINEMATIC_CARD_RADIUS,
        standbyRadius: Math.max(CINEMATIC_CARD_RADIUS + 1, standbyRadius),
    };
}

const projectCinematicViewportPoint = ({
    point,
    cameraState,
}: {
    point: readonly [number, number, number];
    cameraState: CinematicCameraState;
}) => {
    cinematicVisibilityCamera.position.set(cameraState.camX, cameraState.camY, cameraState.camZ);
    cinematicVisibilityCamera.up.copy(cinematicVisibilityUpAxis);
    cinematicVisibilityCamera.lookAt(cameraState.lookX, cameraState.lookY, cameraState.lookZ);
    cinematicVisibilityCamera.updateProjectionMatrix();
    cinematicVisibilityCamera.updateMatrixWorld(true);

    cinematicVisibilityWorldVector.set(point[0], point[1], point[2]);
    cinematicVisibilityViewVector.copy(cinematicVisibilityWorldVector).applyMatrix4(cinematicVisibilityCamera.matrixWorldInverse);
    cinematicVisibilityWorldVector.project(cinematicVisibilityCamera);

    return {
        x: (cinematicVisibilityWorldVector.x + 1) / 2,
        y: (1 - cinematicVisibilityWorldVector.y) / 2,
        isInFront: cinematicVisibilityViewVector.z < -1,
    };
};

type CinematicVisibilityState = {
    visibleIndices: Set<number>;
    detailWindow: {
        cinematicRadius: number;
        standbyRadius: number;
    };
};

function getCinematicVisibilityState(frame: number): CinematicVisibilityState {
    const cameraFrame = getCameraTimelineFrame(frame);
    const cinematicFrame = Math.max(0, cameraFrame - sequenceCompleteFrame);
    const cameraState = getCinematicCameraState(cinematicFrame);
    const detailWindow = getCinematicDetailWindow(frame);
    const visibleIndices = new Set<number>();

    for (const milestone of milestones) {
        const worldX = milestone.xCenter;
        const rootWorldY = milestone.yCenter;
        const top = projectCinematicViewportPoint({
            point: [worldX, rootWorldY + STELE_DASHBOARD_TOP_LOCAL_Y, STELE_ROW_Z],
            cameraState,
        });
        const bottom = projectCinematicViewportPoint({
            point: [worldX, rootWorldY + STELE_DASHBOARD_BOTTOM_LOCAL_Y, STELE_ROW_Z],
            cameraState,
        });
        const center = projectCinematicViewportPoint({
            point: [worldX, rootWorldY + STELE_DASHBOARD_CENTER_LOCAL_Y, STELE_ROW_Z],
            cameraState,
        });

        const isVisibleToCamera = top.isInFront && bottom.isInFront && center.isInFront;
        const intersectsViewport =
            isVisibleToCamera &&
            center.x >= -CINEMATIC_VISIBILITY_MARGIN_X &&
            center.x <= 1 + CINEMATIC_VISIBILITY_MARGIN_X &&
            bottom.y >= -CINEMATIC_VISIBILITY_MARGIN_Y &&
            top.y <= 1 + CINEMATIC_VISIBILITY_MARGIN_Y;

        if (intersectsViewport) {
            visibleIndices.add(milestone.index);
        }
    }

    return {
        visibleIndices,
        detailWindow,
    };
}

function getSteleRenderModeForFocus(frame: number, index: number, focusedIndex: number): SteleRenderMode {
    if (frame > sequenceCompleteFrame) {
        const distance = Math.abs(index - focusedIndex);
        const detailWindow = getCinematicDetailWindow(frame);

        if (distance <= detailWindow.cinematicRadius) {
            return "cinematic";
        }

        if (distance <= detailWindow.standbyRadius) {
            return "standby";
        }

        return "minimal";
    }

    const distance = Math.abs(index - focusedIndex);

    if (distance <= FULL_DETAIL_RADIUS) {
        return "full";
    }

    if (distance <= STANDBY_RADIUS || shouldPreloadSteleAssetsForFocus(frame, index, focusedIndex)) {
        return "standby";
    }

    return "minimal";
}

export function getSteleRenderMode(frame: number, index: number) {
    return getSteleFrameState(frame).renderModes[index];
}

export function getSteleFrameState(frame: number) {
    const isCinematic = frame > sequenceCompleteFrame;
    const focusedIndex = getFocusedSteleIndex(frame);

    if (isCinematic) {
        const cinematicVisibility = getCinematicVisibilityState(frame);

        return {
            focusedIndex,
            isIntro: isIntroFrame(frame),
            isCinematic,
            renderModes: reversedData.map((_, index) => {
                const distance = Math.abs(index - focusedIndex);

                if (distance <= cinematicVisibility.detailWindow.cinematicRadius) {
                    return "cinematic";
                }

                if (
                    cinematicVisibility.visibleIndices.has(index) ||
                    distance <= cinematicVisibility.detailWindow.standbyRadius
                ) {
                    return "standby";
                }

                return "minimal";
            }),
        };
    }

    return {
        focusedIndex,
        isIntro: isIntroFrame(frame),
        isCinematic,
        renderModes: reversedData.map((_, index) => getSteleRenderModeForFocus(frame, index, focusedIndex)),
    };
}
