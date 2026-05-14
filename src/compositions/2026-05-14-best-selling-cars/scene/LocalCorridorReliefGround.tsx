import {memo, useMemo} from "react";
import {random, interpolate} from "remotion";
import * as THREE from "three";

import {composeInstanceMatrix, DynamicInstances} from "../../../lib/ranking-corridor/three";

const seededRange = (seed: string, min: number, max: number) => min + random(seed) * (max - min);
const seededSign = (seed: string) => (random(seed) > 0.5 ? 1 : -1);

export type CorridorReliefHeightOptions = {
    worldX: number;
    worldZ: number;
    maxX: number;
    laneCenterZ?: number;
};

export const localGetCorridorReliefHeight = ({
    worldX,
    worldZ,
    maxX,
    laneCenterZ = 10,
}: CorridorReliefHeightOptions) => {
    const progress = Math.min(1, Math.max(0, worldX / Math.max(1, maxX)));
    const absZ = Math.abs(worldZ - laneCenterZ);
    const pathClearing = Math.max(0, 1 - Math.exp(-absZ * 0.008));
    const hills = Math.sin(worldX * 0.005) * Math.cos(worldZ * 0.005) * 40;
    const rocks = (Math.sin(worldX * 0.03) + Math.sin(worldX * 0.07 + worldZ * 0.05)) * 25 * (Math.sin(worldZ * 0.04) + 1);
    const rawY = hills * (1 - progress) + rocks * progress;
    const microNoise = Math.sin(worldX * 0.1) * Math.cos(worldZ * 0.1) * 0.5;

    let y = rawY * pathClearing + microNoise * pathClearing;
    
    // Flatten for acts 1 and 2
    if (worldX < maxX * 0.5) {
        let flattenFactor = 0;
        if (worldX > maxX * 0.4) {
             flattenFactor = interpolate(worldX, [maxX * 0.4, maxX * 0.5], [0, 1], {extrapolateRight: "clamp"});
        }
        y *= flattenFactor;
    }

    return y;
};

export const LocalCorridorReliefGround = memo(({
    maxX,
    groundY,
    laneCenterZ = 10,
    terrainWidthPadding = 4000,
    terrainDepth = 3000,
    terrainColor = "#cbd5e1",
    rockColor = "#94a3b8",
    puddleColor = "#64748b",
    puddleOpacity = 0.32,
    puddles = true,
}: {
    maxX: number;
    groundY: number;
    laneCenterZ?: number;
    terrainWidthPadding?: number;
    terrainDepth?: number;
    terrainColor?: string;
    rockColor?: string;
    puddleColor?: string;
    puddleOpacity?: number;
    puddles?: boolean;
}) => {
    const terrainWidth = maxX + terrainWidthPadding;

    const terrainGeometry = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(terrainWidth, terrainDepth, 300, 30);
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let index = 0; index < positions.count; index++) {
            vertex.fromBufferAttribute(positions, index);
            const worldX = vertex.x + maxX / 2;
            const worldZ = vertex.z;
            const worldY = localGetCorridorReliefHeight({worldX, worldZ, maxX, laneCenterZ});
            positions.setXYZ(index, vertex.x, worldY, vertex.z);
        }

        geometry.computeVertexNormals();
        return geometry;
    }, [laneCenterZ, maxX, terrainDepth, terrainWidth]);

    const rockGeometry = useMemo(() => {
        const geometry = new THREE.DodecahedronGeometry(1, 0);
        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let index = 0; index < positions.count; index++) {
            vertex.fromBufferAttribute(positions, index);
            vertex.x *= seededRange(`corridor-relief-rock-geo-x-${index}`, 1, 1.5);
            vertex.y *= seededRange(`corridor-relief-rock-geo-y-${index}`, 0.5, 1);
            vertex.z *= seededRange(`corridor-relief-rock-geo-z-${index}`, 1, 1.5);
            positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();
        return geometry;
    }, []);

    const puddleGeometry = useMemo(() => new THREE.CircleGeometry(1, 16), []);

    const rockMatrices = useMemo(() => {
        const matrices: THREE.Matrix4[] = [];

        for (let index = 0; index < 400; index++) {
            const worldX = seededRange(`corridor-relief-rock-world-x-${index}`, -500, maxX + 500);
            const worldZ = seededSign(`corridor-relief-rock-side-${index}`) * seededRange(`corridor-relief-rock-z-${index}`, 150, 1350);
            const progress = Math.min(1, Math.max(0, worldX / Math.max(1, maxX)));
            const scale = seededRange(`corridor-relief-rock-scale-${index}`, 2, 7) * (1 + progress * 1.5);
            const terrainY = localGetCorridorReliefHeight({worldX, worldZ, maxX, laneCenterZ});
            const rockLift = Math.max(0.8, scale * 0.48);

            matrices.push(
                composeInstanceMatrix({
                    position: [worldX - maxX / 2, terrainY + rockLift, worldZ],
                    rotation: [
                        seededRange(`corridor-relief-rock-rx-${index}`, 0, Math.PI),
                        seededRange(`corridor-relief-rock-ry-${index}`, 0, Math.PI),
                        seededRange(`corridor-relief-rock-rz-${index}`, 0, Math.PI),
                    ],
                    scale,
                }),
            );
        }

        return matrices;
    }, [laneCenterZ, maxX]);

    const puddleMatrices = useMemo(() => {
        const matrices: THREE.Matrix4[] = [];

        if (!puddles) {
            return matrices;
        }

        for (let index = 0; index < 150; index++) {
            const worldX = seededRange(`corridor-relief-puddle-world-x-${index}`, maxX * 0.3, maxX * 1.1);
            const laneOffset = seededRange(`corridor-relief-puddle-offset-${index}`, 34, 88);
            const worldZ = laneCenterZ + seededSign(`corridor-relief-puddle-side-${index}`) * laneOffset;
            const radius = seededRange(`corridor-relief-puddle-radius-${index}`, 5, 25);
            const terrainY = localGetCorridorReliefHeight({worldX, worldZ, maxX, laneCenterZ});

            matrices.push(
                composeInstanceMatrix({
                    position: [worldX - maxX / 2, terrainY + 0.05, worldZ],
                    rotation: [-Math.PI / 2, 0, 0],
                    scale: radius,
                }),
            );
        }

        return matrices;
    }, [laneCenterZ, maxX, puddles]);

    return (
        <group position={[maxX / 2, groundY, 0]}>
            <mesh geometry={terrainGeometry}>
                <meshStandardMaterial color={terrainColor} roughness={0.92} flatShading />
            </mesh>

            <DynamicInstances geometry={rockGeometry} matrices={rockMatrices}>
                <meshStandardMaterial color={rockColor} roughness={0.92} flatShading />
            </DynamicInstances>

            {puddleMatrices.length > 0 && (
                <DynamicInstances geometry={puddleGeometry} matrices={puddleMatrices}>
                    <meshStandardMaterial
                        color={puddleColor}
                        roughness={0.18}
                        metalness={0.55}
                        transparent
                        opacity={puddleOpacity}
                        depthWrite={false}
                    />
                </DynamicInstances>
            )}
        </group>
    );
});

LocalCorridorReliefGround.displayName = "LocalCorridorReliefGround";
