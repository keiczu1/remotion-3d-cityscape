import { RoundedBox } from "@react-three/drei";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

import { type RankingTowerItem } from "../model/types";
import { TOWER_DEPTH, TOWER_ROW_Z, TOWER_WIDTH, X_SPACING, getTowerHeight, getTowerRenderMode } from "../scene/scene-logic";
import { Flag } from "./Flag";
import { HologramDashboard } from "./HologramDashboard";

export const Tower = ({ item, index, arriveFrame }: { item: RankingTowerItem; index: number; arriveFrame: number }) => {
    const frame = useCurrentFrame();
    const rank = 40 - index;
    const height = getTowerHeight(item.relHeight);
    const xPos = index * X_SPACING;
    const renderMode = getTowerRenderMode(frame, index);
    const showDashboard = renderMode !== "minimal";
    const showProjector = renderMode === "full";
    const showFlag = renderMode === "full";

    return (
        <group position={[xPos, 0, TOWER_ROW_Z]}>
            <RoundedBox args={[TOWER_WIDTH, height, TOWER_DEPTH]} position={[0, height / 2, 0]} radius={0.5} smoothness={2}>
                <meshStandardMaterial color="#0A0F1A" roughness={0.5} metalness={0.6} />
            </RoundedBox>

            <mesh position={[0, height + 0.5, 0]}>
                <cylinderGeometry args={[5, 5.5, 1, 32]} />
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.5} transparent opacity={0.7} />
            </mesh>

            {showProjector && (
                <mesh position={[0, height + 9, 0]}>
                    <cylinderGeometry args={[9, 5, 16, 32]} />
                    <meshStandardMaterial color="#00E5FF" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
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
                    <mesh position={[9, (height + 10) / 2, 0]}>
                        <cylinderGeometry args={[0.15, 0.15, height + 10]} />
                        <meshStandardMaterial color="#71717A" />
                    </mesh>
                    <mesh position={[9, height + 10, 0]}>
                        <sphereGeometry args={[0.3]} />
                        <meshStandardMaterial color="#FBBF24" />
                    </mesh>
                </>
            )}
        </group>
    );
};
