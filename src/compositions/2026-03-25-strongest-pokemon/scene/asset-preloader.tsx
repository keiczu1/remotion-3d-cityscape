import { useEffect, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { staticFile } from "remotion";

import { reversedData, type SteleRenderMode } from "./scene-logic";
import type { PokemonEntry } from "../data/types";

const preloadSteleAssets = (index: number) => {
    const item = reversedData[index] as PokemonEntry;
    if (!item) {
        return;
    }
    useTexture.preload(staticFile(`ranking-corridor/2026-03-25-strongest-pokemon/images/${item.image_file}`));
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
