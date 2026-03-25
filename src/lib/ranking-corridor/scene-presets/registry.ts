import { RAIL_FOCUS_VIP_FINALE_V1_PACKAGE } from "./rail-focus-vip-finale-v1/package";
import { SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE } from "./soft-side-orbit-classic-v1/package";

export const SCENE_PRESET_PACKAGE_REGISTRY = {
    [RAIL_FOCUS_VIP_FINALE_V1_PACKAGE.id]: RAIL_FOCUS_VIP_FINALE_V1_PACKAGE,
    [SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE.id]: SOFT_SIDE_ORBIT_CLASSIC_V1_PACKAGE,
} as const;
