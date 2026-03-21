import { useEffect, useRef } from "react";

import { getFaviconTextureUrl, getFlagTextureUrl } from "../assets/asset-urls";
import { preloadSharedTexture } from "../assets/texture-cache";
import { reversedData, type SteleRenderMode } from "../scene/scene-logic";

const preloadSteleAssets = (index: number) => {
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
    renderModes: SteleRenderMode[];
    isCinematic: boolean;
}) => {
    const preloadSignatureRef = useRef<string | null>(null);
    const requestedSteleIndicesRef = useRef(new Set<number>());

    useEffect(() => {
        const preloadSignature = isCinematic ? "cinematic" : renderModes.join("|");
        if (preloadSignature === preloadSignatureRef.current) {
            return;
        }

        preloadSignatureRef.current = preloadSignature;

        if (isCinematic) {
            reversedData.forEach((_, index) => {
                if (requestedSteleIndicesRef.current.has(index)) {
                    return;
                }

                preloadSteleAssets(index);
                requestedSteleIndicesRef.current.add(index);
            });
            return;
        }

        renderModes.forEach((mode, index) => {
            if (mode === "minimal" || requestedSteleIndicesRef.current.has(index)) {
                return;
            }

            preloadSteleAssets(index);
            requestedSteleIndicesRef.current.add(index);
        });
    }, [isCinematic, renderModes]);

    return null;
};
