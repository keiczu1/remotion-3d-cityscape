import { memo } from "react";
import { TowerHologramMonolithHero, getTowerHologramMonolithFeatureState } from "../../../lib/ranking-corridor/hero";

import { type RankingTowerItem } from "../model/types";
import { TOWER_DEPTH, TOWER_ROW_Z, TOWER_WIDTH, X_SPACING, getTowerHeight, type TowerRenderMode } from "../scene/scene-logic";
import { Flag } from "./Flag";
import { HologramDashboard } from "./HologramDashboard";

export const Tower = memo(
    ({
        item,
        index,
        arriveFrame,
        renderMode,
    }: {
        item: RankingTowerItem;
        index: number;
        arriveFrame: number;
        renderMode: TowerRenderMode;
    }) => {
        const rank = 40 - index;
        const height = getTowerHeight(item.relHeight);
        const xPos = index * X_SPACING;
        const featureState = getTowerHologramMonolithFeatureState(renderMode);

        return (
            <TowerHologramMonolithHero
                position={[xPos, 0, TOWER_ROW_Z]}
                height={height}
                width={TOWER_WIDTH}
                depth={TOWER_DEPTH}
                showProjector={featureState.showProjector}
                showFlagAssembly={featureState.showFlagAssembly}
                dashboardSlot={
                    featureState.showDashboard ? (
                        <HologramDashboard
                            item={item}
                            yPos={height + 20}
                            rank={rank}
                            arriveFrame={arriveFrame}
                            index={index}
                            renderMode={renderMode}
                        />
                    ) : null
                }
                flagSlot={
                    featureState.showFlagAssembly ? <Flag country={item.country} position={[12, height + 8, 0]} /> : null
                }
            />
        );
    }
);

Tower.displayName = "Tower";
