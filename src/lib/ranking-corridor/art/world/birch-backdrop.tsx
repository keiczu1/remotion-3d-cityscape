import { memo, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";

import { DynamicInstances, StaticInstances } from "../../three";

const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 6, 5);
const trunkMat = new THREE.MeshStandardMaterial({ color: "#E2E8F0", roughness: 0.9, flatShading: true });

const leavesGeo = new THREE.DodecahedronGeometry(1.5, 1);
const leavesMat1 = new THREE.MeshStandardMaterial({ color: "#FBBF24", roughness: 0.8, flatShading: true });
const leavesMat2 = new THREE.MeshStandardMaterial({ color: "#D97706", roughness: 0.8, flatShading: true });
const leavesMat3 = new THREE.MeshStandardMaterial({ color: "#F59E0B", roughness: 0.8, flatShading: true });

type BirchItem = {
    x: number;
    z: number;
    scale: number;
    rotY: number;
    swayPhase: number;
    swaySpeed: number;
    variant: number;
};

type BirchMatrices = {
    trunks: THREE.Matrix4[];
    leavesGroup1: THREE.Matrix4[];
    leavesGroup2: THREE.Matrix4[];
    leavesGroup3: THREE.Matrix4[];
};

export type BirchBackdropDetailMode = "full" | "tail-safe";

export type BirchBackdropProps = {
    maxX: number;
    groundY: number;
    animationFrame: number;
    detailMode?: BirchBackdropDetailMode;
};

const composeBirchInstanceMatrix = ({
    item,
    groundY,
    partPosition,
    partScale = [1, 1, 1],
    partRotation = [0, 0, 0],
}: {
    item: BirchItem;
    groundY: number;
    partPosition: [number, number, number];
    partScale?: [number, number, number];
    partRotation?: [number, number, number];
}) => {
    const parentMatrix = new THREE.Matrix4().compose(
        new THREE.Vector3(item.x, groundY, item.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, item.rotY, 0)),
        new THREE.Vector3(item.scale, item.scale, item.scale),
    );
    const localMatrix = new THREE.Matrix4().compose(
        new THREE.Vector3(...partPosition),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...partRotation)),
        new THREE.Vector3(...partScale),
    );

    return parentMatrix.multiply(localMatrix);
};

const buildBirchMatrices = ({
    items,
    groundY,
    animatedFrame,
}: {
    items: BirchItem[];
    groundY: number;
    animatedFrame: number | null;
}): BirchMatrices => {
    const trunks: THREE.Matrix4[] = [];
    const leavesGroup1: THREE.Matrix4[] = [];
    const leavesGroup2: THREE.Matrix4[] = [];
    const leavesGroup3: THREE.Matrix4[] = [];

    items.forEach((item) => {
        const globalWindPhase = animatedFrame === null ? 0 : animatedFrame * 0.05;
        const localWindEffect = animatedFrame === null ? 0 : Math.sin(globalWindPhase + item.swayPhase);
        const swayAngleZ = localWindEffect * 0.08 * item.swaySpeed * 20;
        const swayAngleX =
            animatedFrame === null
                ? 0
                : Math.cos(globalWindPhase * 0.8 + item.swayPhase) * 0.04 * item.swaySpeed * 20;

        trunks.push(
            composeBirchInstanceMatrix({
                item,
                groundY,
                partPosition: [0, 3, 0],
                partRotation: [swayAngleX * 0.3, 0, swayAngleZ * 0.3],
            }),
        );

        const dispX = 6.0 * swayAngleZ;
        const dispZ = -6.0 * swayAngleX;

        if (item.variant === 0) {
            leavesGroup1.push(
                composeBirchInstanceMatrix({
                    item,
                    groundY,
                    partPosition: [dispX, 6.0, dispZ],
                    partScale: [1.4, 2.0, 1.4],
                    partRotation: [swayAngleX, 0, swayAngleZ],
                }),
            );
            leavesGroup2.push(
                composeBirchInstanceMatrix({
                    item,
                    groundY,
                    partPosition: [0.8 + dispX * 0.7, 4.5, 0.5 + dispZ * 0.7],
                    partScale: [1.1, 1.3, 1.1],
                    partRotation: [swayAngleX * 1.5, 0, swayAngleZ * 1.5],
                }),
            );
            leavesGroup1.push(
                composeBirchInstanceMatrix({
                    item,
                    groundY,
                    partPosition: [-0.6 + dispX * 0.5, 3.5, -0.6 + dispZ * 0.5],
                    partScale: [0.9, 1.1, 0.9],
                    partRotation: [swayAngleX * 1.2, 0, swayAngleZ * 1.2],
                }),
            );
        } else if (item.variant === 1) {
            leavesGroup2.push(
                composeBirchInstanceMatrix({
                    item,
                    groundY,
                    partPosition: [dispX, 5.8, dispZ],
                    partScale: [1.6, 2.2, 1.6],
                    partRotation: [swayAngleX, 0, swayAngleZ],
                }),
            );
            leavesGroup3.push(
                composeBirchInstanceMatrix({
                    item,
                    groundY,
                    partPosition: [-0.8 + dispX * 0.6, 4.0, 0.8 + dispZ * 0.6],
                    partScale: [1.0, 1.2, 1.0],
                    partRotation: [swayAngleX * 1.3, 0, swayAngleZ * 1.3],
                }),
            );
        } else {
            leavesGroup3.push(
                composeBirchInstanceMatrix({
                    item,
                    groundY,
                    partPosition: [dispX, 6.2, dispZ],
                    partScale: [1.5, 1.8, 1.5],
                    partRotation: [swayAngleX, 0, swayAngleZ],
                }),
            );
            leavesGroup1.push(
                composeBirchInstanceMatrix({
                    item,
                    groundY,
                    partPosition: [0.6 + dispX * 0.6, 4.8, -0.7 + dispZ * 0.6],
                    partScale: [1.2, 1.4, 1.2],
                    partRotation: [swayAngleX * 1.1, 0, swayAngleZ * 1.1],
                }),
            );
        }
    });

    return {
        trunks,
        leavesGroup1,
        leavesGroup2,
        leavesGroup3,
    };
};

export const BirchBackdrop = memo(({
    maxX,
    groundY,
    animationFrame,
    detailMode = "full",
}: BirchBackdropProps) => {
    const swayFrame = Math.floor(animationFrame / 2) * 2;

    const items = useMemo(() => {
        const arr: BirchItem[] = [];
        for (let i = 0; i < 420; i++) {
            const skewedX = Math.pow(random(`b-x-${i}`), 1.5);
            const x = -1000 + skewedX * (maxX + 6000);
            const z = -80 - random(`b-z-${i}`) * 2500;
            const scale = 1.0 + random(`b-s-${i}`) * 3;
            const rotY = random(`b-ry-${i}`) * Math.PI * 2;
            const swayPhase = random(`b-sway-${i}`) * Math.PI * 2;
            const swaySpeed = 0.02 + random(`b-speed-${i}`) * 0.04;
            const variant = Math.floor(random(`b-v-${i}`) * 3);

            arr.push({ x, z, scale, rotY, swayPhase, swaySpeed, variant });
        }
        return arr;
    }, [maxX]);

    const tailSafeItems = useMemo(
        () => items.filter((item, index) => item.z > -500 || item.scale >= 3.0 || index % 3 === 0),
        [items],
    );
    const activeItems = detailMode === "tail-safe" ? tailSafeItems : items;
    const dynamicItems = useMemo(
        () =>
            detailMode === "tail-safe"
                ? []
                : activeItems.filter((item) => item.z > -900 || item.scale >= 2.5),
        [activeItems, detailMode],
    );
    const staticItems = useMemo(
        () =>
            detailMode === "tail-safe"
                ? activeItems
                : activeItems.filter((item) => item.z <= -900 && item.scale < 2.5),
        [activeItems, detailMode],
    );

    const staticMatrices = useMemo(
        () => buildBirchMatrices({ items: staticItems, groundY, animatedFrame: null }),
        [groundY, staticItems],
    );
    const dynamicMatrices = useMemo(
        () => buildBirchMatrices({ items: dynamicItems, groundY, animatedFrame: swayFrame }),
        [dynamicItems, groundY, swayFrame],
    );

    return (
        <group>
            <StaticInstances geometry={trunkGeo} material={trunkMat} matrices={staticMatrices.trunks} />
            <StaticInstances geometry={leavesGeo} material={leavesMat1} matrices={staticMatrices.leavesGroup1} />
            <StaticInstances geometry={leavesGeo} material={leavesMat2} matrices={staticMatrices.leavesGroup2} />
            <StaticInstances geometry={leavesGeo} material={leavesMat3} matrices={staticMatrices.leavesGroup3} />
            {detailMode === "full" ? (
                <>
                    <DynamicInstances geometry={trunkGeo} matrices={dynamicMatrices.trunks}>
                        <primitive object={trunkMat} attach="material" />
                    </DynamicInstances>
                    <DynamicInstances geometry={leavesGeo} matrices={dynamicMatrices.leavesGroup1}>
                        <primitive object={leavesMat1} attach="material" />
                    </DynamicInstances>
                    <DynamicInstances geometry={leavesGeo} matrices={dynamicMatrices.leavesGroup2}>
                        <primitive object={leavesMat2} attach="material" />
                    </DynamicInstances>
                    <DynamicInstances geometry={leavesGeo} matrices={dynamicMatrices.leavesGroup3}>
                        <primitive object={leavesMat3} attach="material" />
                    </DynamicInstances>
                </>
            ) : null}
        </group>
    );
});

BirchBackdrop.displayName = "BirchBackdrop";
