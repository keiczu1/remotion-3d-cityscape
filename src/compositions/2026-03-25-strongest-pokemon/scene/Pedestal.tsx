import { memo } from "react";

import { StoneAltarPedestal } from "../../../lib/ranking-corridor/art";
import { type PokemonEntry } from "../data/types";
import { STELE_DEPTH, STELE_ROW_Z, STELE_WIDTH, X_SPACING, getSteleHeight, type SteleRenderMode } from "./scene-logic";
import { HeroPedestal } from "./HeroPedestal";
import { STELE_DASHBOARD_ROOT_OFFSET_Y } from "../components/stele-dashboard-layout";

export const Pedestal = memo(
    ({
        item,
        index,
        renderMode,
    }: {
        item: PokemonEntry;
        index: number;
        renderMode: SteleRenderMode;
    }) => {
        const rank = 100 - index;
        const height = getSteleHeight(item.relHeight);
        const xPos = index * X_SPACING;
        const showDashboard = renderMode !== "minimal";

        return (
            <group position={[xPos, 0, STELE_ROW_Z]}>
                <StoneAltarPedestal width={STELE_WIDTH} height={height} depth={STELE_DEPTH} seed={index} />

                {/* Dashboard (floating info card above stele) */}
                {showDashboard && (
                    <HeroPedestal
                        item={item}
                        dashboardBaseY={height + STELE_DASHBOARD_ROOT_OFFSET_Y}
                        worldX={xPos}
                        worldZ={STELE_ROW_Z}
                        rank={rank}
                        index={index}
                        renderMode={renderMode}
                    />
                )}
            </group>
        );
    }
);

Pedestal.displayName = "Pedestal";
