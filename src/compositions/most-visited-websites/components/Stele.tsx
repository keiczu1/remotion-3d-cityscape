import { memo } from "react";
import * as THREE from "three";

import { MediaSteleShell } from "../../../lib/ranking-corridor/art";
import { type WebsiteItem } from "../model/types";
import { STELE_DEPTH, STELE_ROW_Z, STELE_WIDTH, X_SPACING, getSteleHeight, type SteleRenderMode } from "../scene/scene-logic";
import { Flag } from "./Flag";
import { SteleDashboard } from "./SteleDashboard";
import { STELE_DASHBOARD_ROOT_OFFSET_Y } from "./stele-dashboard-layout";

const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({ color: "#FBBF24" });
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({ color: "#94A3B8" });
const sharedFlagPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 12);

export const Stele = memo(
    ({
        item,
        index,
        renderMode,
    }: {
        item: WebsiteItem;
        index: number;
        renderMode: SteleRenderMode;
    }) => {
        const rank = 40 - index;
        const height = getSteleHeight(item.relHeight);
        const xPos = index * X_SPACING;
        const showDashboard = renderMode !== "minimal";
        const showFlag = renderMode === "full";

        return (
            <group position={[xPos, 0, STELE_ROW_Z]}>
                <MediaSteleShell
                    width={STELE_WIDTH}
                    height={height}
                    depth={STELE_DEPTH}
                    renderMode={renderMode}
                />

                {/* Dashboard (floating info card above stele) */}
                {showDashboard && (
                    <SteleDashboard
                        item={item}
                        dashboardBaseY={height + STELE_DASHBOARD_ROOT_OFFSET_Y}
                        worldX={xPos}
                        worldZ={STELE_ROW_Z}
                        rank={rank}
                        index={index}
                        renderMode={renderMode}
                    />
                )}

                {/* Flag on pole */}
                {showFlag && (
                    <>
                        <Flag country={item.country} position={[12, height + 8, 0]} />
                        <mesh
                            position={[9, (height + 10) / 2, 0]}
                            geometry={sharedFlagPoleGeometry}
                            material={sharedFlagPoleMaterial}
                            scale={[1, height + 10, 1]}
                        />
                        <mesh position={[9, height + 10, 0]} geometry={sharedFlagTopGeometry} material={sharedFlagTopMaterial} />
                    </>
                )}
            </group>
        );
    }
);

Stele.displayName = "Stele";
