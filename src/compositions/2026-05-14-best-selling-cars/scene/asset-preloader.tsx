import { useEffect, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { staticFile } from "remotion";

import { reversedData, type SteleRenderMode } from "./scene-logic";
import type { CarEntry } from "../data/types";

import { getFlagAssetUrl } from "../../../assets/flag-asset-url";
import { COUNTRY_CODES } from "../components/Flag";

const preloadSteleAssets = (index: number) => {
    const item = reversedData[index] as CarEntry;
    if (!item) {
        return;
    }
    useTexture.preload(staticFile(`ranking-corridor/2026-05-14-best-selling-cars/images/${item.image_file}`));
    const country = item.types[0] || "";
    const countryCode = COUNTRY_CODES[country];
    if (countryCode) {
        useTexture.preload(getFlagAssetUrl(countryCode));
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
