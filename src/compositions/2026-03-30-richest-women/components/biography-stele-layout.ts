export const BIO_STELE_WORLD_SCALE = 0.0125;

export const BIO_STELE_SHELL_TOP_PX = 72;
export const BIO_STELE_SHELL_LEFT_PX = 78;
export const BIO_STELE_SHELL_WIDTH_PX = 404;
export const BIO_STELE_SHELL_HEIGHT_PX = 790;
const INFO_CARD_LEFT_FROM_FULL_PX = 510;
const INFO_CARD_WIDTH_PX = 580;
const FULL_SHELL_LEFT_PX = BIO_STELE_SHELL_LEFT_PX;

export const BIO_STELE_DOM_WIDTH_PX = INFO_CARD_LEFT_FROM_FULL_PX + INFO_CARD_WIDTH_PX - FULL_SHELL_LEFT_PX;
export const BIO_STELE_DOM_HEIGHT_PX = BIO_STELE_SHELL_TOP_PX + BIO_STELE_SHELL_HEIGHT_PX;
export const BIO_STELE_SHELL_BOTTOM_CENTER_X_PX = BIO_STELE_SHELL_LEFT_PX + BIO_STELE_SHELL_WIDTH_PX / 2;
export const BIO_STELE_SHELL_BOTTOM_CENTER_Y_PX = BIO_STELE_SHELL_TOP_PX + BIO_STELE_SHELL_HEIGHT_PX;

const wrapperCenterPx = BIO_STELE_DOM_WIDTH_PX / 2;
const shellCenterPx = BIO_STELE_SHELL_WIDTH_PX / 2;
const infoCardCenterPx = INFO_CARD_LEFT_FROM_FULL_PX - FULL_SHELL_LEFT_PX + INFO_CARD_WIDTH_PX / 2;

export const BIO_STELE_DOM_OFFSET_X = (wrapperCenterPx - shellCenterPx) * BIO_STELE_WORLD_SCALE;
export const BIO_STELE_FOCUS_SHIFT_X = ((infoCardCenterPx - shellCenterPx) / 2) * BIO_STELE_WORLD_SCALE;
export const BIO_STELE_DOM_CENTER_FROM_SHELL_BOTTOM = (BIO_STELE_DOM_HEIGHT_PX / 2) * BIO_STELE_WORLD_SCALE;
export const BIO_STELE_SHELL_WORLD_WIDTH = BIO_STELE_SHELL_WIDTH_PX * BIO_STELE_WORLD_SCALE;
export const BIO_STELE_SHELL_WORLD_HEIGHT = BIO_STELE_SHELL_HEIGHT_PX * BIO_STELE_WORLD_SCALE;
export const BIO_STELE_SHELL_CENTER_FROM_BOTTOM = (BIO_STELE_SHELL_HEIGHT_PX / 2) * BIO_STELE_WORLD_SCALE;
export const BIO_STELE_SUBJECT_CENTER_FROM_BOTTOM = BIO_STELE_SHELL_CENTER_FROM_BOTTOM;

export const BIO_STELE_TOP_LOCAL_Y = (BIO_STELE_DOM_HEIGHT_PX - BIO_STELE_SHELL_HEIGHT_PX / 2) * BIO_STELE_WORLD_SCALE;
export const BIO_STELE_BOTTOM_LOCAL_Y = -BIO_STELE_SHELL_CENTER_FROM_BOTTOM;
export const BIO_STELE_CENTER_LOCAL_Y = 0;

export type WorldPoint = readonly [number, number, number];

export const getFocusedBiographyShellWorldHeight = (pedestalHeight: number) => {
	const adaptiveHeight = pedestalHeight * 3.5;
	return Math.max(18, Math.min(32, adaptiveHeight));
};

export const getBiographySteleWorldMetrics = ({
	worldX,
	worldZ,
	pedestalHeight,
    shellWorldHeight = BIO_STELE_SHELL_WORLD_HEIGHT,
}: {
	worldX: number;
	worldZ: number;
	pedestalHeight: number;
    shellWorldHeight?: number;
}) => {
	const shellCenterFromBottom = shellWorldHeight / 2;
	const rootWorldX = worldX;
	const rootWorldY = pedestalHeight + shellCenterFromBottom;

	return {
		rootWorld: [rootWorldX, rootWorldY, worldZ] as WorldPoint,
		cardTopWorld: [rootWorldX, pedestalHeight + shellWorldHeight, worldZ] as WorldPoint,
		cardBottomWorld: [rootWorldX, pedestalHeight, worldZ] as WorldPoint,
		cardCenterWorld: [rootWorldX, rootWorldY, worldZ] as WorldPoint,
	};
};
