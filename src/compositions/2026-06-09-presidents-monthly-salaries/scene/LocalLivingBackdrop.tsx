import {memo, useMemo} from "react";
import {random} from "remotion";
import * as THREE from "three";

import {composeInstanceMatrix, DynamicInstances, StaticInstances} from "../../../lib/ranking-corridor/three";
import {localGetCorridorReliefHeight} from "./LocalCorridorReliefGround";

const broadleafTrunkGeo = new THREE.CylinderGeometry(0.42, 0.62, 2.4, 6);
const broadleafCrownGeo = new THREE.DodecahedronGeometry(1.45, 1);
const palmTrunkGeo = new THREE.CylinderGeometry(0.28, 0.5, 4.2, 6);
const palmLeafGeo = new THREE.ConeGeometry(1.35, 3.2, 5);
const reedGeo = new THREE.ConeGeometry(0.18, 2.2, 5);
const shrubGeo = new THREE.DodecahedronGeometry(1.2, 1);

const trunkMat = new THREE.MeshStandardMaterial({color: "#6B3F1D", roughness: 0.95, flatShading: true});
const canopyMat = new THREE.MeshStandardMaterial({color: "#2F7D46", roughness: 0.9, flatShading: true});
const canopyLightMat = new THREE.MeshStandardMaterial({color: "#5D9C4F", roughness: 0.92, flatShading: true});
const palmMat = new THREE.MeshStandardMaterial({color: "#256D3D", roughness: 0.92, flatShading: true});
const shrubMat = new THREE.MeshStandardMaterial({color: "#3F8F57", roughness: 0.92, flatShading: true});
const reedMat = new THREE.MeshStandardMaterial({color: "#A8A45A", roughness: 0.9, flatShading: true});

type VegetationItem = {
    x: number;
    z: number;
    y: number;
    scale: number;
    rotY: number;
    kind: "broadleaf" | "palm" | "shrub" | "reed";
};

const composeVegetationMatrix = ({
    item,
    offset = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
}: {
    item: VegetationItem;
    offset?: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
}) => {
    const parent = new THREE.Matrix4().compose(
        new THREE.Vector3(item.x, item.y, item.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, item.rotY, 0)),
        new THREE.Vector3(item.scale, item.scale, item.scale),
    );
    const local = new THREE.Matrix4().compose(
        new THREE.Vector3(...offset),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(...scale),
    );

    return parent.multiply(local);
};

export const LocalMixedVegetation = memo(({maxX, groundY}: {maxX: number; groundY: number}) => {
    const vegetation = useMemo(() => {
        const items: VegetationItem[] = [];

        for (let index = 0; index < 520; index++) {
            const worldX = -700 + Math.pow(random(`pv-x-${index}`), 1.18) * (maxX + 2200);
            const side = random(`pv-side-${index}`) > 0.5 ? 1 : -1;
            const nearRoad = random(`pv-near-${index}`) > 0.62;
            const z = side * (nearRoad ? 120 + random(`pv-z-near-${index}`) * 420 : 520 + random(`pv-z-far-${index}`) * 1700);
            const progress = Math.min(1, Math.max(0, worldX / Math.max(1, maxX)));
            const terrainY = localGetCorridorReliefHeight({worldX, worldZ: z, maxX});
            const typeRoll = random(`pv-kind-${index}`);
            const kind: VegetationItem["kind"] = typeRoll > 0.88 ? "palm" : typeRoll > 0.68 ? "shrub" : typeRoll > 0.56 ? "reed" : "broadleaf";
            const baseScale = kind === "palm" ? 2.0 : kind === "broadleaf" ? 1.65 : kind === "reed" ? 1.2 : 1.35;
            const actScale = 0.75 + progress * 0.35;

            items.push({
                x: worldX,
                z,
                y: groundY + terrainY,
                scale: (baseScale + random(`pv-scale-${index}`) * 2.15) * actScale,
                rotY: random(`pv-ry-${index}`) * Math.PI * 2,
                kind,
            });
        }

        return items;
    }, [groundY, maxX]);

    const matrices = useMemo(() => {
        const trunks: THREE.Matrix4[] = [];
        const crowns: THREE.Matrix4[] = [];
        const lightCrowns: THREE.Matrix4[] = [];
        const palmTrunks: THREE.Matrix4[] = [];
        const palmLeaves: THREE.Matrix4[] = [];
        const shrubs: THREE.Matrix4[] = [];
        const reeds: THREE.Matrix4[] = [];

        vegetation.forEach((item, index) => {
            if (item.kind === "palm") {
                palmTrunks.push(composeVegetationMatrix({item, offset: [0, 2.1, 0], scale: [0.75, 1, 0.75]}));
                for (let leaf = 0; leaf < 5; leaf++) {
                    palmLeaves.push(composeVegetationMatrix({
                        item,
                        offset: [0, 4.5, 0],
                        scale: [0.7, 0.55, 1.25],
                        rotation: [0.72, (leaf / 5) * Math.PI * 2, 0.18],
                    }));
                }
                return;
            }

            if (item.kind === "shrub") {
                shrubs.push(composeVegetationMatrix({item, offset: [0, 0.85, 0], scale: [1.4, 0.78, 1.2]}));
                shrubs.push(composeVegetationMatrix({item, offset: [0.9, 0.75, -0.2], scale: [0.85, 0.6, 0.75]}));
                shrubs.push(composeVegetationMatrix({item, offset: [-0.8, 0.68, 0.25], scale: [0.75, 0.55, 0.7]}));
                return;
            }

            if (item.kind === "reed") {
                reeds.push(composeVegetationMatrix({item, offset: [0, 1.1, 0], scale: [0.6, 1, 0.6]}));
                reeds.push(composeVegetationMatrix({item, offset: [0.55, 0.95, 0.15], scale: [0.46, 0.8, 0.46], rotation: [0, 0.35, 0.18]}));
                reeds.push(composeVegetationMatrix({item, offset: [-0.45, 0.9, -0.1], scale: [0.42, 0.72, 0.42], rotation: [0, -0.28, -0.12]}));
                return;
            }

            trunks.push(composeVegetationMatrix({item, offset: [0, 1.2, 0]}));
            crowns.push(composeVegetationMatrix({item, offset: [0, 3.25, 0], scale: [1.2, 1, 1.15]}));
            crowns.push(composeVegetationMatrix({item, offset: [0.9, 2.8, 0.25], scale: [0.8, 0.7, 0.78]}));
            lightCrowns.push(composeVegetationMatrix({
                item,
                offset: [-0.75, 3.0, -0.25],
                scale: [0.7, 0.64, 0.68],
                rotation: [0, random(`pv-extra-rot-${index}`) * Math.PI, 0],
            }));
        });

        return {trunks, crowns, lightCrowns, palmTrunks, palmLeaves, shrubs, reeds};
    }, [vegetation]);

    return (
        <group>
            <StaticInstances geometry={broadleafTrunkGeo} material={trunkMat} matrices={matrices.trunks} />
            <StaticInstances geometry={broadleafCrownGeo} material={canopyMat} matrices={matrices.crowns} />
            <StaticInstances geometry={broadleafCrownGeo} material={canopyLightMat} matrices={matrices.lightCrowns} />
            <StaticInstances geometry={palmTrunkGeo} material={trunkMat} matrices={matrices.palmTrunks} />
            <StaticInstances geometry={palmLeafGeo} material={palmMat} matrices={matrices.palmLeaves} />
            <StaticInstances geometry={shrubGeo} material={shrubMat} matrices={matrices.shrubs} />
            <StaticInstances geometry={reedGeo} material={reedMat} matrices={matrices.reeds} />
        </group>
    );
});

LocalMixedVegetation.displayName = "LocalMixedVegetation";

type TrafficCar = {
    startT: number;
    speed: number;
    lane: 1 | -1;
    laneOffset: number;
    colorIndex: number;
    scale: number;
};

const trafficCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-820, 0, -780),
    new THREE.Vector3(-260, 0, -110),
    new THREE.Vector3(420, 0, -74),
    new THREE.Vector3(820, 0, -780),
    new THREE.Vector3(1220, 0, -145),
    new THREE.Vector3(1810, 0, -1180),
    new THREE.Vector3(2520, 0, -590),
    new THREE.Vector3(3520, 0, -1480),
], false, "catmullrom", 0.5);

const carBodyGeo = new THREE.BoxGeometry(2.3, 0.72, 4.8);
const carCabinGeo = new THREE.BoxGeometry(1.5, 0.55, 2.1);
const headlightGeo = new THREE.BoxGeometry(0.38, 0.16, 0.08);
const trafficMaterials = [
    new THREE.MeshBasicMaterial({color: "#F97316"}),
    new THREE.MeshBasicMaterial({color: "#22C55E"}),
    new THREE.MeshBasicMaterial({color: "#38BDF8"}),
    new THREE.MeshBasicMaterial({color: "#FACC15"}),
    new THREE.MeshBasicMaterial({color: "#F8FAFC"}),
];
const trafficCabinMat = new THREE.MeshBasicMaterial({color: "#111827"});
const headlightMat = new THREE.MeshBasicMaterial({color: "#FDE68A"});

const composeTrafficPartMatrix = ({
    position,
    scale,
}: {
    position: [number, number, number];
    scale: [number, number, number];
}) =>
    new THREE.Matrix4().compose(
        new THREE.Vector3(...position),
        new THREE.Quaternion(),
        new THREE.Vector3(...scale),
    );

export const LocalTrafficOverlay = memo(({frame, groundY}: {frame: number; groundY: number}) => {
    const cars = useMemo(() => {
        const arr: TrafficCar[] = [];
        for (let index = 0; index < 44; index++) {
            const lane = random(`traffic-lane-${index}`) > 0.5 ? 1 : -1;
            arr.push({
                startT: random(`traffic-t-${index}`),
                speed: 0.00013 + random(`traffic-speed-${index}`) * 0.00017,
                lane,
                laneOffset: (lane === 1 ? -1 : 1) * (8.2 + random(`traffic-offset-${index}`) * 3.5),
                colorIndex: Math.floor(random(`traffic-color-${index}`) * trafficMaterials.length),
                scale: 0.92 + random(`traffic-scale-${index}`) * 0.46,
            });
        }
        return arr;
    }, []);

    const matrices = useMemo(() => {
        const bodies = trafficMaterials.map(() => [] as THREE.Matrix4[]);
        const cabins: THREE.Matrix4[] = [];
        const headlights: THREE.Matrix4[] = [];

        cars.forEach((car) => {
            const t = ((car.startT + frame * car.speed * car.lane) % 1 + 1) % 1;
            const pos = trafficCurve.getPointAt(t);
            const tangent = trafficCurve.getTangentAt(t);
            let rotY = Math.atan2(tangent.x, tangent.z);
            if (car.lane === -1) {
                rotY += Math.PI;
            }

            const perpX = -tangent.z;
            const perpZ = tangent.x;
            const baseX = pos.x + perpX * car.laneOffset;
            const baseZ = pos.z + perpZ * car.laneOffset;
            const bodyMatrix = composeInstanceMatrix({
                position: [baseX, groundY + 0.95, baseZ],
                rotation: [0, rotY, 0],
                scale: car.scale,
            });

            bodies[car.colorIndex].push(bodyMatrix);
            cabins.push(bodyMatrix.clone().multiply(composeTrafficPartMatrix({
                position: [0, 0.55, -0.35],
                scale: [0.86, 0.82, 0.82],
            })));
            headlights.push(bodyMatrix.clone().multiply(composeTrafficPartMatrix({
                position: [-0.62, 0.05, 2.45],
                scale: [1, 1, 1],
            })));
            headlights.push(bodyMatrix.clone().multiply(composeTrafficPartMatrix({
                position: [0.62, 0.05, 2.45],
                scale: [1, 1, 1],
            })));
        });

        return {bodies, cabins, headlights};
    }, [cars, frame, groundY]);

    return (
        <group>
            {matrices.bodies.map((bodyMatrices, index) => (
                <DynamicInstances key={index} geometry={carBodyGeo} matrices={bodyMatrices}>
                    <primitive object={trafficMaterials[index]} attach="material" />
                </DynamicInstances>
            ))}
            <DynamicInstances geometry={carCabinGeo} matrices={matrices.cabins}>
                <primitive object={trafficCabinMat} attach="material" />
            </DynamicInstances>
            <DynamicInstances geometry={headlightGeo} matrices={matrices.headlights}>
                <primitive object={headlightMat} attach="material" />
            </DynamicInstances>
        </group>
    );
});

LocalTrafficOverlay.displayName = "LocalTrafficOverlay";
