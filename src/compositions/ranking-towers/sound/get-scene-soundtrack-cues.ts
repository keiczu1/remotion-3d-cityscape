import { getAppearanceEvents } from "../scene/scene-logic";
import { resolveAppearanceSoundtrack } from "./resolve-appearance-cues";

export const getSceneSoundtrackCues = () => resolveAppearanceSoundtrack(getAppearanceEvents());
