import type { ReactNode } from "react";
import { memo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export type TowerHologramMonolithRenderMode = "minimal" | "standby" | "full" | "cinematic";

export type TowerHologramMonolithTheme = {
    shellColor: string;
    shellRoughness: number;
    shellMetalness: number;
    topCapColor: string;
    topCapEmissive: string;
    topCapEmissiveIntensity: number;
    topCapOpacity: number;
    projectorColor: string;
    projectorOpacity: number;
    flagPoleColor: string;
    flagTopColor: string;
};

export type TowerHologramMonolithProps = {
    position?: readonly [number, number, number];
    height: number;
    width?: number;
    depth?: number;
    showProjector?: boolean;
    showFlagAssembly?: boolean;
    dashboardSlot?: ReactNode;
    flagSlot?: ReactNode;
    flagPoleX?: number;
    flagPoleHeight?: number;
    theme?: TowerHologramMonolithTheme;
};

const sharedTopCapGeometry = new THREE.CylinderGeometry(5, 5.5, 1, 32);
const sharedProjectorGeometry = new THREE.CylinderGeometry(9, 5, 16, 32);
const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);

export const towerHologramMonolithDefaultTheme: TowerHologramMonolithTheme = {
    shellColor: "#0A0F1A",
    shellRoughness: 0.5,
    shellMetalness: 0.6,
    topCapColor: "#00E5FF",
    topCapEmissive: "#00E5FF",
    topCapEmissiveIntensity: 1.5,
    topCapOpacity: 0.7,
    projectorColor: "#00E5FF",
    projectorOpacity: 0.08,
    flagPoleColor: "#71717A",
    flagTopColor: "#FBBF24",
};
const sharedTopCapMaterial = new THREE.MeshStandardMaterial({
    color: towerHologramMonolithDefaultTheme.topCapColor,
    emissive: towerHologramMonolithDefaultTheme.topCapEmissive,
    emissiveIntensity: towerHologramMonolithDefaultTheme.topCapEmissiveIntensity,
    transparent: true,
    opacity: towerHologramMonolithDefaultTheme.topCapOpacity,
});
const sharedProjectorMaterial = new THREE.MeshStandardMaterial({
    color: towerHologramMonolithDefaultTheme.projectorColor,
    transparent: true,
    opacity: towerHologramMonolithDefaultTheme.projectorOpacity,
    side: THREE.DoubleSide,
    depthWrite: false,
});
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({ color: towerHologramMonolithDefaultTheme.flagTopColor });
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({ color: towerHologramMonolithDefaultTheme.flagPoleColor });

export const getTowerHologramMonolithFeatureState = (renderMode: TowerHologramMonolithRenderMode) => {
    return {
        showDashboard: renderMode !== "minimal",
        showProjector: renderMode === "full",
        showFlagAssembly: renderMode === "full",
    };
};

export const TowerHologramMonolithHero = memo(
    ({
        position = [0, 0, 0],
        height,
        width = 12,
        depth = 10,
        showProjector = false,
        showFlagAssembly = false,
        dashboardSlot = null,
        flagSlot = null,
        flagPoleX = 9,
        flagPoleHeight,
        theme = towerHologramMonolithDefaultTheme,
    }: TowerHologramMonolithProps) => {
        const useSharedThemeMaterials = theme === towerHologramMonolithDefaultTheme;
        const resolvedFlagPoleHeight = flagPoleHeight ?? height + 10;

        return (
            <group position={position}>
                <RoundedBox args={[width, height, depth]} position={[0, height / 2, 0]} radius={0.5} smoothness={2}>
                    <meshStandardMaterial
                        color={theme.shellColor}
                        roughness={theme.shellRoughness}
                        metalness={theme.shellMetalness}
                    />
                </RoundedBox>

                <mesh
                    position={[0, height + 0.5, 0]}
                    geometry={sharedTopCapGeometry}
                    material={useSharedThemeMaterials ? sharedTopCapMaterial : undefined}
                >
                    {useSharedThemeMaterials ? null : (
                        <meshStandardMaterial
                            color={theme.topCapColor}
                            emissive={theme.topCapEmissive}
                            emissiveIntensity={theme.topCapEmissiveIntensity}
                            transparent
                            opacity={theme.topCapOpacity}
                        />
                    )}
                </mesh>

                {showProjector ? (
                    <mesh
                        position={[0, height + 9, 0]}
                        geometry={sharedProjectorGeometry}
                        material={useSharedThemeMaterials ? sharedProjectorMaterial : undefined}
                    >
                        {useSharedThemeMaterials ? null : (
                            <meshStandardMaterial
                                color={theme.projectorColor}
                                transparent
                                opacity={theme.projectorOpacity}
                                side={THREE.DoubleSide}
                                depthWrite={false}
                            />
                        )}
                    </mesh>
                ) : null}

                {dashboardSlot}

                {showFlagAssembly ? (
                    <>
                        {flagSlot}
                        <mesh
                            position={[flagPoleX, resolvedFlagPoleHeight / 2, 0]}
                            material={useSharedThemeMaterials ? sharedFlagPoleMaterial : undefined}
                        >
                            <cylinderGeometry args={[0.15, 0.15, resolvedFlagPoleHeight]} />
                            {useSharedThemeMaterials ? null : <meshStandardMaterial color={theme.flagPoleColor} />}
                        </mesh>
                        <mesh
                            position={[flagPoleX, resolvedFlagPoleHeight, 0]}
                            geometry={sharedFlagTopGeometry}
                            material={useSharedThemeMaterials ? sharedFlagTopMaterial : undefined}
                        >
                            {useSharedThemeMaterials ? null : <meshStandardMaterial color={theme.flagTopColor} />}
                        </mesh>
                    </>
                ) : null}
            </group>
        );
    },
);

TowerHologramMonolithHero.displayName = "TowerHologramMonolithHero";
