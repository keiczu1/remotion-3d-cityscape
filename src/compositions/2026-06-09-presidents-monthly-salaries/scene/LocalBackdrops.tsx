import { memo, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { StaticInstances } from "../../../lib/ranking-corridor/three";

const mountainGeo = new THREE.ConeGeometry(1, 1, 5, 1);
const mountainMatFar = new THREE.MeshStandardMaterial({
    color: "#3B4656",
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
});
const mountainMatMid = new THREE.MeshStandardMaterial({
    color: "#556675",
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
});
const mountainMatNear = new THREE.MeshStandardMaterial({
    color: "#6F7F89",
    roughness: 0.94,
    metalness: 0.0,
    flatShading: true,
});
const snowCapGeo = new THREE.ConeGeometry(1, 1, 5, 1);
const snowCapMat = new THREE.MeshStandardMaterial({
    color: "#DDE7EF",
    roughness: 0.86,
    metalness: 0.0,
    flatShading: true,
});

export const LocalHorizonMountainRidge = memo(({ groundY, maxX }: { groundY: number; maxX: number }) => {
    const mountains = useMemo(() => {
        const far: { x: number; z: number; w: number; h: number; d: number; rotY: number; rotZ: number; snow: boolean; }[] = [];
        const mid: typeof far = [];
        const near: typeof far = [];

        for (let layer = 0; layer < 3; layer++) {
            const target = layer === 0 ? far : layer === 1 ? mid : near;
            const count = layer === 0 ? 110 : layer === 1 ? 96 : 58;
            const zBase = layer === 0 ? -6200 : layer === 1 ? -4100 : -2350;
            const xStep = layer === 0 ? 145 : layer === 1 ? 118 : 155;
            const startX = maxX * 0.18 - 2200;

            for (let i = 0; i < count; i++) {
                const xPos = startX + i * xStep + (random(`pm-${layer}-x-${i}`) - 0.5) * xStep * 2.2;
                const baseHeight = layer === 0
                    ? 150 + random(`pm-${layer}-h-${i}`) * 260
                    : layer === 1
                        ? 210 + random(`pm-${layer}-h-${i}`) * 430
                        : 120 + random(`pm-${layer}-h-${i}`) * 310;
                const peakBoost = random(`pm-${layer}-peak-${i}`) > 0.84 ? 1.85 : 1;
                const height = baseHeight * peakBoost;
                const width = height * (layer === 2 ? 1.55 : 1.15) * (0.8 + random(`pm-${layer}-w-${i}`) * 1.2);

                target.push({
                    x: xPos,
                    z: zBase - random(`pm-${layer}-z-${i}`) * (layer === 0 ? 1500 : layer === 1 ? 950 : 620),
                    w: width,
                    h: height,
                    d: width * (0.7 + random(`pm-${layer}-d-${i}`) * 0.7),
                    rotY: random(`pm-${layer}-ry-${i}`) * Math.PI * 2,
                    rotZ: (random(`pm-${layer}-rz-${i}`) - 0.5) * 0.12,
                    snow: height > 420 && random(`pm-${layer}-snow-${i}`) > 0.35,
                });
            }
        }

        return {far, mid, near};
    }, [maxX]);

    const matrices = useMemo(() => {
        const build = (items: typeof mountains.far) => items.map((m) => new THREE.Matrix4().compose(
            new THREE.Vector3(m.x, groundY + m.h * 0.48, m.z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, m.rotY, m.rotZ)),
            new THREE.Vector3(m.w, m.h, m.d),
        ));

        const buildSnow = (items: typeof mountains.far) => items
            .filter((m) => m.snow)
            .map((m) => new THREE.Matrix4().compose(
                new THREE.Vector3(m.x, groundY + m.h * 0.88, m.z),
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, m.rotY, m.rotZ)),
                new THREE.Vector3(m.w * 0.34, m.h * 0.22, m.d * 0.34),
            ));

        return {
            far: build(mountains.far),
            mid: build(mountains.mid),
            near: build(mountains.near),
            snow: [
                ...buildSnow(mountains.far),
                ...buildSnow(mountains.mid),
                ...buildSnow(mountains.near),
            ],
        };
    }, [groundY, mountains]);

    return (
        <group>
            <StaticInstances geometry={mountainGeo} material={mountainMatFar} matrices={matrices.far} />
            <StaticInstances geometry={mountainGeo} material={mountainMatMid} matrices={matrices.mid} />
            <StaticInstances geometry={mountainGeo} material={mountainMatNear} matrices={matrices.near} />
            <StaticInstances geometry={snowCapGeo} material={snowCapMat} matrices={matrices.snow} />
        </group>
    );
});

const skylineGeo = new THREE.BoxGeometry(1, 1, 1);
const skylineMatFar = new THREE.MeshStandardMaterial({ color: "#314052", roughness: 0.9, flatShading: true });
const skylineMatMid = new THREE.MeshStandardMaterial({ color: "#1F2A3A", roughness: 0.88, flatShading: true });
const skylineWindowGeo = new THREE.BoxGeometry(1, 1, 0.08);
const skylineWindowWarmMat = new THREE.MeshBasicMaterial({
    color: "#F59E0B",
    transparent: true,
    opacity: 0.48,
    toneMapped: false,
});
const skylineWindowCoolMat = new THREE.MeshBasicMaterial({
    color: "#38BDF8",
    transparent: true,
    opacity: 0.34,
    toneMapped: false,
});
const skylineRoofBeaconGeo = new THREE.SphereGeometry(1, 8, 6);
const skylineRoofBeaconMat = new THREE.MeshBasicMaterial({
    color: "#FDE68A",
    transparent: true,
    opacity: 0.72,
    toneMapped: false,
});

type SkylineBuilding = {
    matrix: THREE.Matrix4;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
    seed: string;
};

const composeSkylineMatrix = ({
    x,
    y,
    z,
    width,
    height,
    depth,
}: {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
}) =>
    new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion(),
        new THREE.Vector3(width, height, depth),
    );

const buildWindowMatrices = (buildings: SkylineBuilding[], density: number) => {
    const warm: THREE.Matrix4[] = [];
    const cool: THREE.Matrix4[] = [];

    buildings.forEach((building) => {
        const columns = Math.max(2, Math.min(5, Math.floor(building.width / 34)));
        const rows = Math.max(3, Math.min(11, Math.floor(building.height / 72)));
        const windowWidth = Math.max(4, building.width / (columns * 4.2));
        const windowHeight = Math.max(8, building.height / (rows * 5.2));
        const frontZ = building.z + building.depth / 2 + 0.7;

        for (let column = 0; column < columns; column++) {
            for (let row = 0; row < rows; row++) {
                if (random(`${building.seed}-window-${column}-${row}`) > density) {
                    continue;
                }

                const offsetX = ((column + 0.5) / columns - 0.5) * building.width * 0.66;
                const offsetY = ((row + 0.72) / (rows + 1)) * building.height - building.height / 2;
                const matrix = composeSkylineMatrix({
                    x: building.x + offsetX,
                    y: building.y + offsetY,
                    z: frontZ,
                    width: windowWidth,
                    height: windowHeight,
                    depth: 1,
                });

                if (random(`${building.seed}-window-tone-${column}-${row}`) > 0.42) {
                    warm.push(matrix);
                } else {
                    cool.push(matrix);
                }
            }
        }
    });

    return { warm, cool };
};

const buildRoofBeaconMatrices = (buildings: SkylineBuilding[]) =>
    buildings
        .filter((building) => building.height > 460 && random(`${building.seed}-roof-beacon`) > 0.72)
        .map((building) =>
            composeSkylineMatrix({
                x: building.x + (random(`${building.seed}-roof-x`) - 0.5) * building.width * 0.35,
                y: building.y + building.height / 2 + 12,
                z: building.z + building.depth / 2 + 1,
                width: 3.2,
                height: 3.2,
                depth: 3.2,
            }),
        );

export const LocalCitySkyline = memo(({ maxX, groundY }: { maxX: number; groundY: number }) => {
    const buildings = useMemo(() => {
        const far: SkylineBuilding[] = [];
        const mid: SkylineBuilding[] = [];

        for (let i = -40; i < 150; i++) {
            const farX = i * 80 + random(`sky-1-x-${i}`) * 60;
            if (farX < maxX * 0.45) {
                const width = 80 + random(`sky-1-w-${i}`) * 120;
                const height = 400 + random(`sky-1-h-${i}`) * 600;
                const depth = 80 + random(`sky-1-d-${i}`) * 120;
                const z = -1800 - random(`sky-1-z-${i}`) * 400;
                const y = groundY + height / 2;
                far.push({
                    matrix: composeSkylineMatrix({ x: farX, y, z, width, height, depth }),
                    x: farX,
                    y,
                    z,
                    width,
                    height,
                    depth,
                    seed: `sky-1-${i}`,
                });
            }

            const midX = i * 60 + random(`sky-2-x-${i}`) * 50;
            if (midX < maxX * 0.45) {
                const width = 60 + random(`sky-2-w-${i}`) * 100;
                const height = 200 + random(`sky-2-h-${i}`) * 400;
                const depth = 60 + random(`sky-2-d-${i}`) * 100;
                const z = -1200 - random(`sky-2-z-${i}`) * 300;
                const y = groundY + height / 2;
                mid.push({
                    matrix: composeSkylineMatrix({ x: midX, y, z, width, height, depth }),
                    x: midX,
                    y,
                    z,
                    width,
                    height,
                    depth,
                    seed: `sky-2-${i}`,
                });
            }
        }

        return {
            far: far.map((building) => building.matrix),
            mid: mid.map((building) => building.matrix),
            farWindows: buildWindowMatrices(far, 0.22),
            midWindows: buildWindowMatrices(mid, 0.34),
            roofBeacons: buildRoofBeaconMatrices([...far, ...mid]),
        };
    }, [groundY, maxX]);

    return (
        <group>
            <StaticInstances geometry={skylineGeo} material={skylineMatFar} matrices={buildings.far} />
            <StaticInstances geometry={skylineGeo} material={skylineMatMid} matrices={buildings.mid} />
            <StaticInstances geometry={skylineWindowGeo} material={skylineWindowCoolMat} matrices={buildings.farWindows.cool} />
            <StaticInstances geometry={skylineWindowGeo} material={skylineWindowWarmMat} matrices={buildings.farWindows.warm} />
            <StaticInstances geometry={skylineWindowGeo} material={skylineWindowCoolMat} matrices={buildings.midWindows.cool} />
            <StaticInstances geometry={skylineWindowGeo} material={skylineWindowWarmMat} matrices={buildings.midWindows.warm} />
            <StaticInstances geometry={skylineRoofBeaconGeo} material={skylineRoofBeaconMat} matrices={buildings.roofBeacons} />
        </group>
    );
});
