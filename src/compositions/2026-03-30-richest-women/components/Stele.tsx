import { memo } from "react";

import { MediaSteleShell } from "../../../lib/ranking-corridor/art";
import { type RichWomanItem } from "../model/types";
import {
    STELE_DEPTH,
    STELE_ROW_Z,
    STELE_WIDTH,
    X_SPACING,
    getSteleHeight,
    type SteleRenderMode,
} from "../scene/scene-logic";

export const Stele = memo(
    ({
        item,
        index,
        renderMode,
    }: {
        item: RichWomanItem;
        index: number;
        renderMode: SteleRenderMode;
    }) => {
        const height = getSteleHeight(item.relHeight);
        const xPos = index * X_SPACING;
        const shouldHideCarrier = false;

        return (
            <group position={[xPos, 0, STELE_ROW_Z]}>
                {!shouldHideCarrier ? (
                    <MediaSteleShell
                        width={STELE_WIDTH}
                        height={height}
                        depth={STELE_DEPTH}
                        renderMode={renderMode}
                    />
                ) : null}
            </group>
        );
    }
);

Stele.displayName = "Stele";
