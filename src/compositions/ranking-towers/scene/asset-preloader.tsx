import { useEffect, useRef } from "react";

import { getFaviconTextureUrl, getFlagTextureUrl } from "../assets/asset-urls";
import { preloadSharedTexture } from "../assets/texture-cache";
import { reversedData, type TowerRenderMode } from "./scene-logic";

const preloadTowerAssets = (index: number) => {
    const item = reversedData[index];
    if (!item) {
        return;
    }

    preloadSharedTexture(getFaviconTextureUrl(item.domain), "favicon");
    preloadSharedTexture(getFlagTextureUrl(item.country), "flag");
};

export const SceneAssetPreloader = ({
    renderModes,
    isCinematic,
}: {
    renderModes: TowerRenderMode[];
    isCinematic: boolean;
}) => {
    const preloadSignatureRef = useRef<string | null>(null);
    const requestedTowerIndicesRef = useRef(new Set<number>());

    useEffect(() => {
        const preloadSignature = isCinematic ? "cinematic" : renderModes.join("|");
        if (preloadSignature === preloadSignatureRef.current) {
            return;
        }

        preloadSignatureRef.current = preloadSignature;

        if (isCinematic) {
            reversedData.forEach((_, index) => {
                if (requestedTowerIndicesRef.current.has(index)) {
                    return;
                }

                preloadTowerAssets(index);
                requestedTowerIndicesRef.current.add(index);
            });
            return;
        }

        renderModes.forEach((mode, index) => {
            if (mode === "minimal" || requestedTowerIndicesRef.current.has(index)) {
                return;
            }

            preloadTowerAssets(index);
            requestedTowerIndicesRef.current.add(index);
        });
    }, [isCinematic, renderModes]);

    return null;
};
