export const MEDIA_FRAME_WIDTH = 18;
export const MEDIA_FRAME_HEIGHT = 18;
export const MEDIA_FRAME_MIN_WIDTH = 15.5;
export const MEDIA_FRAME_MAX_WIDTH = 21.5;
export const MEDIA_FRAME_MIN_HEIGHT = 14.5;
export const MEDIA_FRAME_INSET = 0.9;
export const SCREEN_WIDTH = 13;
export const SCREEN_HEIGHT = 13;
export const DATA_PANEL_HEIGHT = 15.2;
export const RANK_Y = MEDIA_FRAME_HEIGHT / 2 + 7.5;
export const MEDIA_MAX_RANK_Y = 22.5;
export const MEDIA_RANK_GAP = 2.6;
export const VISITS_VALUE_Y = -11.2;
export const VISITS_LABEL_Y = -13.5;
export const TYPE_BADGE_Y = -15.6;
export const DOMAIN_Y = -7.9;
export const DATA_PANEL_POS_Y = -10.9;
export const MEDIA_REGION_BOTTOM_Y = DATA_PANEL_POS_Y + DATA_PANEL_HEIGHT / 2 + 0.8;
export const MEDIA_MAX_FRAME_TOP_Y = MEDIA_MAX_RANK_Y - MEDIA_RANK_GAP;
export const MEDIA_REGION_TOP_Y = RANK_Y - MEDIA_RANK_GAP;
export const MEDIA_FRAME_AUTO_CENTER_Y = (MEDIA_MAX_FRAME_TOP_Y + MEDIA_REGION_BOTTOM_Y) / 2;
export const MEDIA_FRAME_MAX_HEIGHT = MEDIA_MAX_FRAME_TOP_Y - MEDIA_REGION_BOTTOM_Y;

export const STELE_DASHBOARD_ROOT_OFFSET_Y = 20;
export const STELE_DASHBOARD_FLOAT_AMPLITUDE = 0.4;
export const STELE_DASHBOARD_REVEAL_FRAMES = 150;
export const STELE_DASHBOARD_PRESENCE_FADE_FRAMES = 18;

const SCREEN_BOX_CENTER_Y = MEDIA_FRAME_AUTO_CENTER_Y;
const SCREEN_BOX_OUTER_HEIGHT = MEDIA_FRAME_MAX_HEIGHT + 1;
const TYPE_BADGE_HEIGHT = 2.3;
export const RANK_TEXT_ASCENT = 3.0;

export const STELE_DASHBOARD_TOP_LOCAL_Y = Math.max(
    SCREEN_BOX_CENTER_Y + SCREEN_BOX_OUTER_HEIGHT / 2,
    RANK_Y + RANK_TEXT_ASCENT,
);
export const STELE_DASHBOARD_BOTTOM_LOCAL_Y = Math.min(
    DATA_PANEL_POS_Y - DATA_PANEL_HEIGHT / 2,
    TYPE_BADGE_Y - TYPE_BADGE_HEIGHT / 2,
);
export const STELE_DASHBOARD_CENTER_LOCAL_Y =
    (STELE_DASHBOARD_TOP_LOCAL_Y + STELE_DASHBOARD_BOTTOM_LOCAL_Y) / 2;

export type WorldPoint = readonly [number, number, number];

export const getSteleDashboardWorldMetrics = ({
    worldX,
    worldZ,
    dashboardBaseY,
    floatY,
    cardTopLocalY = STELE_DASHBOARD_TOP_LOCAL_Y,
    cardBottomLocalY = STELE_DASHBOARD_BOTTOM_LOCAL_Y,
}: {
    worldX: number;
    worldZ: number;
    dashboardBaseY: number;
    floatY: number;
    cardTopLocalY?: number;
    cardBottomLocalY?: number;
}) => {
    const rootWorldY = dashboardBaseY + floatY;
    const cardCenterLocalY = (cardTopLocalY + cardBottomLocalY) / 2;

    return {
        rootWorld: [worldX, rootWorldY, worldZ] as WorldPoint,
        cardTopWorld: [worldX, rootWorldY + cardTopLocalY, worldZ] as WorldPoint,
        cardBottomWorld: [worldX, rootWorldY + cardBottomLocalY, worldZ] as WorldPoint,
        cardCenterWorld: [worldX, rootWorldY + cardCenterLocalY, worldZ] as WorldPoint,
    };
};
