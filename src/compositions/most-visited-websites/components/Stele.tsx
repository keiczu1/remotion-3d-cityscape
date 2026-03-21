import { memo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

import { type WebsiteItem } from "../model/types";
import { STELE_DEPTH, STELE_ROW_Z, STELE_WIDTH, X_SPACING, getSteleHeight, type SteleRenderMode } from "../scene/scene-logic";
import { Flag } from "./Flag";
import { SteleDashboard } from "./SteleDashboard";
import { STELE_DASHBOARD_ROOT_OFFSET_Y } from "./stele-dashboard-layout";

/* Shared geometries & materials for performance */
const sharedSteleBodyGeometry = new THREE.BoxGeometry(1, 1, 1);
const sharedSteleBodyStandbyMaterial = new THREE.MeshStandardMaterial({
    color: "#1E293B",
    roughness: 0.34,
    metalness: 0.54,
});
const sharedSteleBodyMinimalMaterial = new THREE.MeshStandardMaterial({
    color: "#1E293B",
    roughness: 0.46,
    metalness: 0.28,
});
const sharedTopCapGeometry = new THREE.BoxGeometry(STELE_WIDTH + 0.4, 0.6, STELE_DEPTH + 0.4);
const sharedTopCapMaterial = new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    emissive: "#00E5FF",
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.7,
});

const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({ color: "#FBBF24" });
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({ color: "#94A3B8" });
const sharedFlagPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 12);

/* Vertical edge strip material for the stele body */
const sharedEdgeStripGeometry = new THREE.BoxGeometry(1, 1, 1);
const edgeStripMaterial = new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    emissive: "#00E5FF",
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.5,
});

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
        const useHeroBody = renderMode === "full";
        const showDashboard = renderMode !== "minimal";
        const showAccentStrips = renderMode !== "minimal";
        const showTopCap = renderMode !== "minimal";
        const showFlag = renderMode === "full";

        return (
            <group position={[xPos, 0, STELE_ROW_Z]}>
                {/* Active hero keeps the premium rounded body, distant states switch to a cheaper shared mesh. */}
                {useHeroBody ? (
                    <RoundedBox args={[STELE_WIDTH, height, STELE_DEPTH]} position={[0, height / 2, 0]} radius={0.3} smoothness={2}>
                        <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.6} />
                    </RoundedBox>
                ) : (
                    <mesh
                        geometry={sharedSteleBodyGeometry}
                        material={renderMode === "standby" || renderMode === "cinematic" ? sharedSteleBodyStandbyMaterial : sharedSteleBodyMinimalMaterial}
                        position={[0, height / 2, 0]}
                        scale={[STELE_WIDTH, height, STELE_DEPTH]}
                    />
                )}

                {/* Top cap — cyan glow strip */}
                {showTopCap && (
                    <mesh position={[0, height + 0.3, 0]} geometry={sharedTopCapGeometry} material={sharedTopCapMaterial} />
                )}

                {/* Vertical cyan edge strips (left & right) */}
                {showAccentStrips && (
                    <>
                        <mesh
                            position={[-(STELE_WIDTH / 2 + 0.12), height / 2, 0]}
                            geometry={sharedEdgeStripGeometry}
                            material={edgeStripMaterial}
                            scale={[0.2, height, 0.2]}
                        />
                        <mesh
                            position={[(STELE_WIDTH / 2 + 0.12), height / 2, 0]}
                            geometry={sharedEdgeStripGeometry}
                            material={edgeStripMaterial}
                            scale={[0.2, height, 0.2]}
                        />
                    </>
                )}

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
