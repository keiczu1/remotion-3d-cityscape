import { memo } from "react";
import * as THREE from "three";

import { StoneAltarPedestal } from "../../../lib/ranking-corridor/art";
import { type CarEntry } from "../data/types";
import { STELE_DEPTH, STELE_ROW_Z, STELE_WIDTH, X_SPACING, getSteleHeight, type SteleRenderMode } from "./scene-logic";
import { HeroPedestal } from "./HeroPedestal";
import { STELE_DASHBOARD_ROOT_OFFSET_Y } from "../components/stele-dashboard-layout";
import { Flag } from "../components/Flag";

const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({ color: "#FBBF24" });
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({ color: "#94A3B8" });
const sharedFlagPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 12);

export const Pedestal = memo(
    ({
        item,
        index,
        renderMode,
    }: {
        item: CarEntry;
        index: number;
        renderMode: SteleRenderMode;
    }) => {
        const rank = item.rank;
        const height = getSteleHeight(item.relHeight);
        const xPos = index * X_SPACING;
        const showDashboard = renderMode !== "minimal";

        const poleHeight = height + 10;
        const poleY = poleHeight / 2;
        const poleX = 10;
        const flagZ = 0;

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
                
                {showDashboard && (
                    <group>
                        <mesh 
                            position={[poleX, poleY, flagZ]} 
                            geometry={sharedFlagPoleGeometry} 
                            material={sharedFlagPoleMaterial} 
                            scale={[1, poleHeight, 1]}
                            castShadow 
                        />
                        <mesh 
                            position={[poleX, poleHeight, flagZ]} 
                            geometry={sharedFlagTopGeometry} 
                            material={sharedFlagTopMaterial} 
                        />
                        <Flag country={item.types[0] || ""} position={[poleX + 2.7, poleHeight - 1.8, flagZ]} scale={0.9} />
                    </group>
                )}
            </group>
        );
    }
);

Pedestal.displayName = "Pedestal";
