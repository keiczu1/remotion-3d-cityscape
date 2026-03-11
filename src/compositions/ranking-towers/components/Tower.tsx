import { memo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

import { type RankingTowerItem } from "../model/types";
import { TOWER_DEPTH, TOWER_ROW_Z, TOWER_WIDTH, X_SPACING, getTowerHeight, type TowerRenderMode } from "../scene/scene-logic";
import { Flag } from "./Flag";
import { HologramDashboard } from "./HologramDashboard";

const sharedTopCapGeometry = new THREE.CylinderGeometry(5, 5.5, 1, 32);
const sharedTopCapMaterial = new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    emissive: "#00E5FF",
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.7,
});
const sharedProjectorGeometry = new THREE.CylinderGeometry(9, 5, 16, 32);
const sharedProjectorMaterial = new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
});
const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({ color: "#FBBF24" });
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({ color: "#71717A" });

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
        const showDashboard = renderMode !== "minimal";
        const showProjector = renderMode === "full";
        const showFlag = renderMode === "full";

        return (
            <group position={[xPos, 0, TOWER_ROW_Z]}>
                <RoundedBox args={[TOWER_WIDTH, height, TOWER_DEPTH]} position={[0, height / 2, 0]} radius={0.5} smoothness={2}>
                    <meshStandardMaterial color="#0A0F1A" roughness={0.5} metalness={0.6} />
                </RoundedBox>

                <mesh position={[0, height + 0.5, 0]} geometry={sharedTopCapGeometry} material={sharedTopCapMaterial} />

                {showProjector && (
                    <mesh position={[0, height + 9, 0]} geometry={sharedProjectorGeometry} material={sharedProjectorMaterial} />
                )}

                {showDashboard && (
                    <HologramDashboard
                        item={item}
                        yPos={height + 20}
                        rank={rank}
                        arriveFrame={arriveFrame}
                        index={index}
                        renderMode={renderMode}
                    />
                )}

                {showFlag && (
                    <>
                        <Flag country={item.country} position={[12, height + 8, 0]} />
                        <mesh position={[9, (height + 10) / 2, 0]} material={sharedFlagPoleMaterial}>
                            <cylinderGeometry args={[0.15, 0.15, height + 10]} />
                        </mesh>
                        <mesh position={[9, height + 10, 0]} geometry={sharedFlagTopGeometry} material={sharedFlagTopMaterial} />
                    </>
                )}
            </group>
        );
    }
);

Tower.displayName = "Tower";
