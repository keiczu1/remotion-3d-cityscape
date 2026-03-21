export const SCREEN_WIDTH = 13;
export const SCREEN_HEIGHT = 13;
export const DATA_PANEL_HEIGHT = 14;
export const RANK_Y = SCREEN_HEIGHT / 2 + 8;
export const VISITS_VALUE_Y = -(SCREEN_HEIGHT / 2 + 5.5);
export const VISITS_LABEL_Y = -(SCREEN_HEIGHT / 2 + 8.0);
export const TYPE_BADGE_Y = -(SCREEN_HEIGHT / 2 + 10.5);
export const DOMAIN_Y = -(SCREEN_HEIGHT / 2 + 2.5);
export const DATA_PANEL_POS_Y = -(DATA_PANEL_HEIGHT / 2 - 3 + SCREEN_HEIGHT / 2 + 1);

export const STELE_DASHBOARD_ROOT_OFFSET_Y = 20;
export const STELE_DASHBOARD_FLOAT_AMPLITUDE = 0.4;
export const STELE_DASHBOARD_REVEAL_FRAMES = 150;
export const STELE_DASHBOARD_PRESENCE_FADE_FRAMES = 18;

const SCREEN_BOX_CENTER_Y = 3;
const SCREEN_BOX_OUTER_HEIGHT = SCREEN_HEIGHT + 1;
const TYPE_BADGE_HEIGHT = 2.6;
const RANK_TEXT_ASCENT = 2.5;

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
}: {
    worldX: number;
    worldZ: number;
    dashboardBaseY: number;
    floatY: number;
}) => {
    const rootWorldY = dashboardBaseY + floatY;

    return {
        rootWorld: [worldX, rootWorldY, worldZ] as WorldPoint,
        cardTopWorld: [worldX, rootWorldY + STELE_DASHBOARD_TOP_LOCAL_Y, worldZ] as WorldPoint,
        cardBottomWorld: [worldX, rootWorldY + STELE_DASHBOARD_BOTTOM_LOCAL_Y, worldZ] as WorldPoint,
        cardCenterWorld: [worldX, rootWorldY + STELE_DASHBOARD_CENTER_LOCAL_Y, worldZ] as WorldPoint,
    };
};
