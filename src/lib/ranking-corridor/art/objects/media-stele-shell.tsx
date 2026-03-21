import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export type MediaSteleShellRenderMode = "minimal" | "standby" | "full" | "cinematic";

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
const sharedEdgeStripGeometry = new THREE.BoxGeometry(1, 1, 1);
const edgeStripMaterial = new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    emissive: "#00E5FF",
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.5,
});

export const getMediaSteleShellVisualPolicy = (renderMode: MediaSteleShellRenderMode) => ({
    useHeroBody: renderMode === "full",
    showAccentStrips: renderMode !== "minimal",
    showTopCap: renderMode !== "minimal",
});

export const MediaSteleShell = ({
    width,
    height,
    depth,
    renderMode,
    topCapColor = "#00E5FF",
    topCapOpacity = 0.7,
    topCapEmissiveIntensity = 1.2,
}: {
    width: number;
    height: number;
    depth: number;
    renderMode: MediaSteleShellRenderMode;
    topCapColor?: string;
    topCapOpacity?: number;
    topCapEmissiveIntensity?: number;
}) => {
    const visualPolicy = getMediaSteleShellVisualPolicy(renderMode);

    return (
        <>
            {visualPolicy.useHeroBody ? (
                <RoundedBox args={[width, height, depth]} position={[0, height / 2, 0]} radius={0.3} smoothness={2}>
                    <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.6} />
                </RoundedBox>
            ) : (
                <mesh
                    geometry={sharedSteleBodyGeometry}
                    material={renderMode === "standby" || renderMode === "cinematic" ? sharedSteleBodyStandbyMaterial : sharedSteleBodyMinimalMaterial}
                    position={[0, height / 2, 0]}
                    scale={[width, height, depth]}
                />
            )}

            {visualPolicy.showTopCap && (
                <mesh position={[0, height + 0.3, 0]}>
                    <boxGeometry args={[width + 0.4, 0.6, depth + 0.4]} />
                    <meshStandardMaterial
                        color={topCapColor}
                        emissive={topCapColor}
                        emissiveIntensity={topCapEmissiveIntensity}
                        transparent
                        opacity={topCapOpacity}
                    />
                </mesh>
            )}

            {visualPolicy.showAccentStrips && (
                <>
                    <mesh
                        position={[-(width / 2 + 0.12), height / 2, 0]}
                        geometry={sharedEdgeStripGeometry}
                        material={edgeStripMaterial}
                        scale={[0.2, height, 0.2]}
                    />
                    <mesh
                        position={[(width / 2 + 0.12), height / 2, 0]}
                        geometry={sharedEdgeStripGeometry}
                        material={edgeStripMaterial}
                        scale={[0.2, height, 0.2]}
                    />
                </>
            )}
        </>
    );
};
