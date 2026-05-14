import { memo, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { StaticInstances } from "../../../lib/ranking-corridor/three";

const mountainGeo = new THREE.DodecahedronGeometry(1, 1);
const mountainMat = new THREE.MeshStandardMaterial({
    color: "#64748B",
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
});

export const LocalHorizonMountainRidge = memo(({ groundY, maxX }: { groundY: number; maxX: number }) => {
    const mountains = useMemo(() => {
        const arr: { x: number; z: number; w: number; h: number; d: number; rotY: number; rotZ: number; }[] = [];

        for (let i = 0; i < 150; i++) {
            const xPos = -3000 + i * 80 + (random(`m-x-${i}`) - 0.5) * 500;
            if (xPos < maxX * 0.35) {
                continue;
            }

            const isTitan = random(`m-t-${i}`) > 0.85;
            const baseHeight = 100 + random(`m-h-${i}`) * 300;
            const height = isTitan ? baseHeight * 2.2 : baseHeight;
            const width = height * (0.8 + random(`m-w-${i}`) * 2.0);
            const depth = width * (0.8 + random(`m-d-${i}`) * 0.8);

            arr.push({
                x: xPos,
                z: -3000 - random(`m-z-${i}`) * 4000,
                w: width,
                h: height,
                d: depth,
                rotY: random(`m-ry-${i}`) * Math.PI * 2,
                rotZ: (random(`m-rz-${i}`) - 0.5) * 0.2,
            });
        }
        arr.sort((a, b) => a.z - b.z);
        return arr;
    }, [maxX]);

    const matrices = useMemo(() => mountains.map((m) => new THREE.Matrix4().compose(
        new THREE.Vector3(m.x, groundY + m.h * 0.2, m.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, m.rotY, m.rotZ)),
        new THREE.Vector3(m.w, m.h, m.d),
    )), [groundY, mountains]);

    return <StaticInstances geometry={mountainGeo} material={mountainMat} matrices={matrices} />;
});

const skylineGeo = new THREE.BoxGeometry(1, 1, 1);
const skylineMatFar = new THREE.MeshStandardMaterial({ color: "#64748B", roughness: 0.9, flatShading: true });
const skylineMatMid = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.9, flatShading: true });

export const LocalCitySkyline = memo(({ maxX, groundY }: { maxX: number; groundY: number }) => {
    const buildings = useMemo(() => {
        const far: THREE.Matrix4[] = [];
        const mid: THREE.Matrix4[] = [];

        for (let i = -40; i < 150; i++) {
            const farX = i * 80 + random(`sky-1-x-${i}`) * 60;
            if (farX < maxX * 0.45) {
                const width = 80 + random(`sky-1-w-${i}`) * 120;
                const height = 400 + random(`sky-1-h-${i}`) * 600;
                const depth = 80 + random(`sky-1-d-${i}`) * 120;
                far.push(new THREE.Matrix4().compose(
                    new THREE.Vector3(farX, groundY + height / 2, -1800 - random(`sky-1-z-${i}`) * 400),
                    new THREE.Quaternion(),
                    new THREE.Vector3(width, height, depth),
                ));
            }

            const midX = i * 60 + random(`sky-2-x-${i}`) * 50;
            if (midX < maxX * 0.45) {
                const width = 60 + random(`sky-2-w-${i}`) * 100;
                const height = 200 + random(`sky-2-h-${i}`) * 400;
                const depth = 60 + random(`sky-2-d-${i}`) * 100;
                mid.push(new THREE.Matrix4().compose(
                    new THREE.Vector3(midX, groundY + height / 2, -1200 - random(`sky-2-z-${i}`) * 300),
                    new THREE.Quaternion(),
                    new THREE.Vector3(width, height, depth),
                ));
            }
        }

        return { far, mid };
    }, [groundY, maxX]);

    return (
        <group>
            <StaticInstances geometry={skylineGeo} material={skylineMatFar} matrices={buildings.far} />
            <StaticInstances geometry={skylineGeo} material={skylineMatMid} matrices={buildings.mid} />
        </group>
    );
});
