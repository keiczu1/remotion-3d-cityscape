import { memo, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";

import { StaticInstances } from "../../three";

const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 2, 5);
const trunkMat = new THREE.MeshStandardMaterial({ color: "#78350F", roughness: 1 });
const pineGeo = new THREE.ConeGeometry(2, 4, 5);
const pineMat = new THREE.MeshStandardMaterial({ color: "#064E3B", roughness: 1, flatShading: true });
const bushGeo = new THREE.DodecahedronGeometry(1.5, 1);
const bushMat = new THREE.MeshStandardMaterial({ color: "#047857", roughness: 0.9, flatShading: true });

type ForestItem = {
    x: number;
    z: number;
    scale: number;
    rotY: number;
    isPine: boolean;
};

const composeForestInstanceMatrix = ({
    item,
    groundY,
    partPosition,
    partScale = [1, 1, 1] as [number, number, number],
}: {
    item: Omit<ForestItem, "isPine">;
    groundY: number;
    partPosition: [number, number, number];
    partScale?: [number, number, number];
}) => {
    const parentMatrix = new THREE.Matrix4().compose(
        new THREE.Vector3(item.x, groundY, item.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, item.rotY, 0)),
        new THREE.Vector3(item.scale, item.scale, item.scale),
    );
    const localMatrix = new THREE.Matrix4().compose(
        new THREE.Vector3(...partPosition),
        new THREE.Quaternion(),
        new THREE.Vector3(...partScale),
    );

    return parentMatrix.multiply(localMatrix);
};

export const ForestBackdrop = memo(({ maxX, groundY }: { maxX: number; groundY: number }) => {
    const items = useMemo(() => {
        const arr: ForestItem[] = [];
        for (let i = 0; i < 800; i++) {
            const skewedX = Math.pow(random(`t-x-${i}`), 1.5);
            const x = -1000 + skewedX * (maxX + 6000);
            const z = -80 - random(`t-z-${i}`) * 2500;
            const isPine = random(`t-type-${i}`) > 0.4;
            const scale = (isPine ? 2 : 1.5) + random(`t-s-${i}`) * 3;
            const rotY = random(`t-ry-${i}`) * Math.PI * 2;

            arr.push({ x, z, scale, rotY, isPine });
        }
        return arr;
    }, [maxX]);

    const forestMatrices = useMemo(() => {
        const pineTrunks: THREE.Matrix4[] = [];
        const pineCanopyBase: THREE.Matrix4[] = [];
        const pineCanopyMid: THREE.Matrix4[] = [];
        const pineCanopyTop: THREE.Matrix4[] = [];
        const bushTrunks: THREE.Matrix4[] = [];
        const bushCore: THREE.Matrix4[] = [];
        const bushRight: THREE.Matrix4[] = [];
        const bushLeft: THREE.Matrix4[] = [];

        items.forEach((item) => {
            if (item.isPine) {
                pineTrunks.push(composeForestInstanceMatrix({ item, groundY, partPosition: [0, 1, 0] }));
                pineCanopyBase.push(composeForestInstanceMatrix({ item, groundY, partPosition: [0, 3, 0] }));
                pineCanopyMid.push(composeForestInstanceMatrix({ item, groundY, partPosition: [0, 5, 0], partScale: [0.8, 0.8, 0.8] }));
                pineCanopyTop.push(composeForestInstanceMatrix({ item, groundY, partPosition: [0, 6.5, 0], partScale: [0.6, 0.6, 0.6] }));
                return;
            }

            bushTrunks.push(composeForestInstanceMatrix({ item, groundY, partPosition: [0, 0.5, 0], partScale: [0.5, 0.5, 0.5] }));
            bushCore.push(composeForestInstanceMatrix({ item, groundY, partPosition: [0, 1.5, 0] }));
            bushRight.push(composeForestInstanceMatrix({ item, groundY, partPosition: [1, 1.2, 0.5], partScale: [0.7, 0.7, 0.7] }));
            bushLeft.push(composeForestInstanceMatrix({ item, groundY, partPosition: [-0.8, 1.0, -0.5], partScale: [0.6, 0.6, 0.6] }));
        });

        return {
            pineTrunks,
            pineCanopyBase,
            pineCanopyMid,
            pineCanopyTop,
            bushTrunks,
            bushCore,
            bushRight,
            bushLeft,
        };
    }, [groundY, items]);

    return (
        <group>
            <StaticInstances geometry={trunkGeo} material={trunkMat} matrices={forestMatrices.pineTrunks} />
            <StaticInstances geometry={pineGeo} material={pineMat} matrices={forestMatrices.pineCanopyBase} />
            <StaticInstances geometry={pineGeo} material={pineMat} matrices={forestMatrices.pineCanopyMid} />
            <StaticInstances geometry={pineGeo} material={pineMat} matrices={forestMatrices.pineCanopyTop} />
            <StaticInstances geometry={trunkGeo} material={trunkMat} matrices={forestMatrices.bushTrunks} />
            <StaticInstances geometry={bushGeo} material={bushMat} matrices={forestMatrices.bushCore} />
            <StaticInstances geometry={bushGeo} material={bushMat} matrices={forestMatrices.bushRight} />
            <StaticInstances geometry={bushGeo} material={bushMat} matrices={forestMatrices.bushLeft} />
        </group>
    );
});

ForestBackdrop.displayName = "ForestBackdrop";
