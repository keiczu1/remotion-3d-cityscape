import { memo, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { StaticInstances } from "../../three";

const mountainGeo = new THREE.DodecahedronGeometry(1, 1);
const mountainMat = new THREE.MeshStandardMaterial({
    color: "#64748B",
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
});

export const HorizonMountainRidge = memo(({ groundY }: { groundY: number }) => {
    const mountains = useMemo(() => {
        const arr: {
            x: number;
            z: number;
            w: number;
            h: number;
            d: number;
            rotY: number;
            rotZ: number;
        }[] = [];

        for (let i = 0; i < 150; i++) {
            const isTitan = random(`m-t-${i}`) > 0.85;
            const baseHeight = 100 + random(`m-h-${i}`) * 300;
            const height = isTitan ? baseHeight * 2.2 : baseHeight;
            const width = height * (0.8 + random(`m-w-${i}`) * 2.0);
            const depth = width * (0.8 + random(`m-d-${i}`) * 0.8);

            arr.push({
                x: -3000 + i * 80 + (random(`m-x-${i}`) - 0.5) * 500,
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
    }, []);
    const matrices = useMemo(
        () =>
            mountains.map((mountain) =>
                new THREE.Matrix4().compose(
                    new THREE.Vector3(mountain.x, groundY + mountain.h * 0.2, mountain.z),
                    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, mountain.rotY, mountain.rotZ)),
                    new THREE.Vector3(mountain.w, mountain.h, mountain.d),
                ),
            ),
        [groundY, mountains],
    );

    return (
        <group>
            <StaticInstances geometry={mountainGeo} material={mountainMat} matrices={matrices} />
        </group>
    );
});

HorizonMountainRidge.displayName = "HorizonMountainRidge";
