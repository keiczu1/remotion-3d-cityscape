import { useEffect } from "react";
import { useCurrentFrame } from "remotion";

import { getFaviconTextureUrl, getFlagTextureUrl } from "../assets/asset-urls";
import { preloadSharedTexture } from "../assets/texture-cache";
import { getFocusedTowerIndex, reversedData, sequenceCompleteFrame, shouldPreloadTowerAssets } from "../scene-logic";

const preloadTowerAssets = (index: number) => {
    const item = reversedData[index];
    if (!item) {
        return;
    }

    preloadSharedTexture(getFaviconTextureUrl(item.domain), "favicon");
    preloadSharedTexture(getFlagTextureUrl(item.country), "flag");
};

export const SceneAssetPreloader = () => {
    const frame = useCurrentFrame();
    const focusedIndex = getFocusedTowerIndex(frame);
    const isCinematic = frame > sequenceCompleteFrame;

    useEffect(() => {
        if (isCinematic) {
            reversedData.forEach((_, index) => preloadTowerAssets(index));
            return;
        }

        for (let i = 0; i < reversedData.length; i++) {
            if (shouldPreloadTowerAssets(frame, i)) {
                preloadTowerAssets(i);
            }
        }
    }, [focusedIndex, frame, isCinematic]);

    return null;
};
