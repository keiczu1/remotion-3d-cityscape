import { useEffect, useRef } from "react";

import { getFlagTextureUrl } from "../assets/asset-urls";
import { preloadSharedTexture } from "../assets/texture-cache";
import { reversedData, type SteleRenderMode } from "../scene/scene-logic";
import { getFlagCode } from "../model/data";

const preloadSteleAssets = (index: number) => {
    const item = reversedData[index];
    if (!item) {
        return;
    }

    const flagCode = getFlagCode(item);
    if (flagCode) {
        preloadSharedTexture(getFlagTextureUrl(flagCode), "flag");
    }
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
