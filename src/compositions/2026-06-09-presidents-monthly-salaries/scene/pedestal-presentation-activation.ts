import {CAMERA_PRESENTATION_PRESET, findPresentationActivationFrame} from "./camera-presentation";
import {getSteleHeight, milestones, reversedData, sequenceCompleteFrame, STELE_ROW_Z, X_SPACING} from "./scene-logic";
import {STELE_DASHBOARD_REVEAL_FRAMES} from "../components/stele-dashboard-layout";

export const PEDESTAL_ACTIVATION_PRESET = {
    ...CAMERA_PRESENTATION_PRESET,
    safeTopEnter: 0,
    safeTopReady: 0.03,
    minReadableCardPx: 1,
    targetReadableCardPx: 1,
    gateStart: 0.2,
    gateEnd: 0.55,
} as const;

export const PEDESTAL_ACTIVATION_EARLY_LEAD_FRAMES = Math.round(STELE_DASHBOARD_REVEAL_FRAMES * 0.1);

export const getPedestalPresentationMetrics = ({
    worldX,
    worldZ,
    pedestalHeight,
}: {
    worldX: number;
    worldZ: number;
    pedestalHeight: number;
}) => ({
    cardTopWorld: [worldX, pedestalHeight, worldZ] as const,
    cardBottomWorld: [worldX, 0, worldZ] as const,
    cardCenterWorld: [worldX, pedestalHeight / 2, worldZ] as const,
});

export const getPedestalPresentationActivationFrame = ({
    index,
    width,
    height,
}: {
    index: number;
    width: number;
    height: number;
}) => {
    const item = reversedData[index];
    const milestone = milestones[index];

    if (!item || !milestone) {
        return null;
    }

    const rawActivationFrame = findPresentationActivationFrame({
        searchStartFrame: 0,
        searchEndFrame: Math.min(sequenceCompleteFrame, milestone.leaveFrame + STELE_DASHBOARD_REVEAL_FRAMES),
        subject: getPedestalPresentationMetrics({
            worldX: index * X_SPACING,
            worldZ: STELE_ROW_Z,
            pedestalHeight: getSteleHeight(item.relHeight),
        }),
        width,
        height,
        preset: PEDESTAL_ACTIVATION_PRESET,
    });

    if (rawActivationFrame === null) {
        return null;
    }

    return Math.max(0, rawActivationFrame - PEDESTAL_ACTIVATION_EARLY_LEAD_FRAMES);
};

export const getPedestalPresentationActivationFrames = ({
    width,
    height,
}: {
    width: number;
    height: number;
}) =>
    reversedData.map((_, index) =>
        getPedestalPresentationActivationFrame({
            index,
            width,
            height,
        }),
    );
