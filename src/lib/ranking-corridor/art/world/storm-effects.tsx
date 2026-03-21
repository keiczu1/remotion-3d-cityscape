import { useMemo } from "react";
import { interpolate, random } from "remotion";
import * as THREE from "three";

import { composeInstanceMatrix, DynamicInstances } from "../../three";

const stormRainGeo = new THREE.PlaneGeometry(0.2, 8.0);

type StormRaindrop = {
    x: number;
    z: number;
    yOffset: number;
    speed: number;
};

export type StormLightningAnchor = {
    x: number;
    y: number;
    z: number;
    scale: number;
    speed: number;
};

type StormLightningBurstState = {
    flashX: number;
    flashY: number;
    flashZ: number;
    flashOpacity: number;
    cloudScale: number;
    endX: number;
    endZ: number;
};

const LightningSegment = ({
    p1,
    p2,
    thickness,
    opacity,
}: {
    p1: THREE.Vector3;
    p2: THREE.Vector3;
    thickness: number;
    opacity: number;
}) => {
    const distance = p1.distanceTo(p2);
    const position = p1.clone().add(p2).divideScalar(2);
    const direction = p2.clone().sub(p1).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction,
    );

    return (
        <group position={position} quaternion={quaternion}>
            <mesh>
                <cylinderGeometry args={[Math.max(0.01, thickness * 0.8), Math.max(0.01, thickness), distance, 5]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={opacity} depthWrite={false} fog={false} />
            </mesh>
            <mesh scale={[2, 1, 2]}>
                <cylinderGeometry args={[Math.max(0.02, thickness * 0.8), Math.max(0.02, thickness), distance, 5]} />
                <meshBasicMaterial color="#00E5FF" transparent opacity={opacity * 0.3} depthWrite={false} fog={false} />
            </mesh>
        </group>
    );
};

export const getStormRainIntensity = (progress: number) =>
    interpolate(progress, [0.65, 0.85, 0.95, 0.98], [0, 1, 0.5, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

export const getStormLightningBurstState = ({
    frame,
    progress,
    anchors,
    cloudSpeedMultiplier,
    loopWidth = 2500,
    loopOffsetX = -500,
}: {
    frame: number;
    progress: number;
    anchors: readonly StormLightningAnchor[];
    cloudSpeedMultiplier: number;
    loopWidth?: number;
    loopOffsetX?: number;
}): StormLightningBurstState | null => {
    if (anchors.length === 0 || progress < 0.65 || progress > 0.95) {
        return null;
    }

    let activeFlashFrame = -1;
    for (let f = frame; f >= frame - 4; f--) {
        if (random(`flash-${f}`) > 0.96) {
            activeFlashFrame = f;
            break;
        }
    }

    if (activeFlashFrame === -1) {
        return null;
    }

    const anchorIndex = Math.min(
        anchors.length - 1,
        Math.floor(random(`flash-cloud-${activeFlashFrame}`) * anchors.length),
    );
    const anchor = anchors[anchorIndex];
    const xPos = anchor.x - frame * anchor.speed * cloudSpeedMultiplier;
    const flashX = ((xPos % loopWidth) + loopWidth) % loopWidth + loopOffsetX;
    const flashLife = 1 - Math.min(1, (frame - activeFlashFrame) / 4);
    const flashOpacity = flashLife * interpolate(progress, [0.65, 0.85, 0.95], [0.35, 1, 0.5], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return {
        flashX,
        flashY: anchor.y,
        flashZ: anchor.z,
        flashOpacity,
        cloudScale: anchor.scale,
        endX: flashX + (random(`flash-end-x-${activeFlashFrame}`) - 0.5) * 35,
        endZ: anchor.z + 10 + random(`flash-end-z-${activeFlashFrame}`) * 24,
    };
};

export const StormRainLayer = ({
    frame,
    progress,
    maxX,
}: {
    frame: number;
    progress: number;
    maxX: number;
}) => {
    const rainIntensity = getStormRainIntensity(progress);

    const raindrops = useMemo(() => {
        const arr: StormRaindrop[] = [];
        for (let i = 0; i < 600; i++) {
            arr.push({
                x: random(`sr-x-${i}`) * (maxX + 600) - 300,
                z: 20 - random(`sr-z-${i}`) * 200,
                yOffset: random(`sr-y-${i}`) * 200,
                speed: 4.0 + random(`sr-sp-${i}`) * 3,
            });
        }
        return arr;
    }, [maxX]);

    if (rainIntensity <= 0) {
        return null;
    }

    const matrices = raindrops.map((drop) => {
        const yPos = 120 - ((frame * drop.speed + drop.yOffset) % 150);

        return composeInstanceMatrix({
            position: [drop.x, yPos, drop.z],
            rotation: [0, Math.PI / 4, 0],
        });
    });

    return (
        <group>
            <DynamicInstances geometry={stormRainGeo} matrices={matrices}>
                <meshBasicMaterial color="#94A3B8" transparent opacity={rainIntensity * 0.4} depthWrite={false} />
            </DynamicInstances>
        </group>
    );
};

export const StormLightningBursts = ({
    frame,
    progress,
    anchors,
    cloudSpeedMultiplier,
    groundY,
}: {
    frame: number;
    progress: number;
    anchors: readonly StormLightningAnchor[];
    cloudSpeedMultiplier: number;
    groundY: number;
}) => {
    const burstState = getStormLightningBurstState({
        frame,
        progress,
        anchors,
        cloudSpeedMultiplier,
    });

    if (burstState === null) {
        return null;
    }

    const start = new THREE.Vector3(
        burstState.flashX,
        burstState.flashY - burstState.cloudScale * 1.5,
        burstState.flashZ,
    );
    const end = new THREE.Vector3(burstState.endX, groundY + 2, burstState.endZ);

    return (
        <group>
            <LightningSegment
                p1={start}
                p2={end}
                thickness={0.75 + burstState.cloudScale * 0.04}
                opacity={burstState.flashOpacity}
            />
            <pointLight
                position={[burstState.flashX, burstState.flashY, burstState.flashZ]}
                intensity={burstState.flashOpacity * 55}
                distance={2600}
                color="#E0F2FE"
            />
        </group>
    );
};
