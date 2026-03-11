import { useMemo } from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import * as THREE from "three";

import { GROUND_Y } from "../scene-logic";

const treeTrunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 4, 7);
const treeTrunkMat = new THREE.MeshStandardMaterial({ color: "#8B5A2B", roughness: 0.9 });
const treeLeavesGeo = new THREE.DodecahedronGeometry(3, 0);
const treeLeavesMat = new THREE.MeshStandardMaterial({ color: "#4CAF50", roughness: 0.8 });
const cloudGeo = new THREE.SphereGeometry(1, 6, 6);

const airplaneGeoBody = new THREE.CylinderGeometry(1.5, 1.5, 10, 16);
const airplaneMatBody = new THREE.MeshStandardMaterial({ color: "#e2e8f0", metalness: 0.6, roughness: 0.4 });
const airplaneGeoNose = new THREE.ConeGeometry(1.5, 2.5, 16);
const airplaneMatNose = new THREE.MeshStandardMaterial({ color: "#334155" });
const airplaneGeoWingMain = new THREE.BoxGeometry(3, 0.2, 18);
const airplaneGeoWingTail = new THREE.BoxGeometry(1.5, 3, 0.2);
const airplaneGeoWingBack = new THREE.BoxGeometry(1.5, 0.2, 6);
const airplaneMatWings = new THREE.MeshStandardMaterial({ color: "#cbd5e1" });
const airplaneMatTail = new THREE.MeshStandardMaterial({ color: "#94a3b8" });

const birdWingGeo = new THREE.BoxGeometry(1.5, 0.1, 0.4);
const birdMat = new THREE.MeshBasicMaterial({ color: "#111", side: THREE.DoubleSide });

const skylineGeo = new THREE.BoxGeometry(1, 1, 1);
const skylineMatFar = new THREE.MeshStandardMaterial({ color: "#64748B", roughness: 0.9, flatShading: true });
const skylineMatMid = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.9, flatShading: true });

const Airplane = ({ frame }: { frame: number }) => {
    const loopDuration = 1800;
    const localFrame = frame % loopDuration;
    const x = interpolate(localFrame, [0, loopDuration], [-300, 1800]);
    const y = 55 + Math.sin(frame * 0.02) * 5;
    const z = -45;

    return (
        <group position={[x, y, z]} rotation={[0, 0, Math.sin(frame * 0.05) * 0.02]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={airplaneGeoBody} material={airplaneMatBody} />
            <mesh position={[5, 0, 0]} rotation={[0, 0, -Math.PI / 2]} geometry={airplaneGeoNose} material={airplaneMatNose} />
            <mesh position={[1, 0, 0]} geometry={airplaneGeoWingMain} material={airplaneMatWings} />
            <mesh position={[-4, 1.5, 0]} geometry={airplaneGeoWingTail} material={airplaneMatTail} />
            <mesh position={[-4, 0, 0]} geometry={airplaneGeoWingBack} material={airplaneMatTail} />
        </group>
    );
};

const Birds = ({ frame }: { frame: number }) => {
    const birds = useMemo(() => {
        const vShape = [
            [0, 0, 0],
            [-2, 0, -2],
            [-2, 0, 2],
            [-4, 0, -4],
            [-4, 0, 4],
            [-6, 0, -6],
            [-6, 0, 6],
        ];

        return vShape.map((pos, i) => ({
            offsetX: pos[0] + (random(`b-x-${i}`) - 0.5) * 1,
            offsetY: pos[1] + (random(`b-y-${i}`) - 0.5) * 1,
            offsetZ: pos[2] + (random(`b-z-${i}`) - 0.5) * 1,
            flapSpeed: 0.3 + random(`b-f-${i}`) * 0.1,
            flapOffset: random(`b-fo-${i}`) * Math.PI * 2,
        }));
    }, []);

    const loopDuration = 2500;
    const localFrame = frame % loopDuration;
    const baseX = interpolate(localFrame, [0, loopDuration], [1500, -300]);
    const baseZ = interpolate(localFrame, [0, loopDuration], [-40, -60]);
    const baseY = 45 + Math.sin(localFrame * 0.01) * 8;

    return (
        <group position={[baseX, baseY, baseZ]} rotation={[0, -Math.PI / 2, 0]}>
            {birds.map((bird, i) => {
                const flap = Math.sin(frame * bird.flapSpeed + bird.flapOffset);

                return (
                    <group key={i} position={[bird.offsetX, bird.offsetY + Math.sin(frame * 0.05 + i), bird.offsetZ]}>
                        <mesh position={[0.5, 0, 0.5]} rotation={[flap * 0.5, -0.5, 0]} geometry={birdWingGeo} material={birdMat} />
                        <mesh position={[0.5, 0, -0.5]} rotation={[-flap * 0.5, 0.5, 0]} geometry={birdWingGeo} material={birdMat} />
                    </group>
                );
            })}
        </group>
    );
};

const LowPolyTree = ({
    position,
    scale,
    index,
    frame,
}: {
    position: [number, number, number];
    scale: number;
    index: number;
    frame: number;
}) => {
    const sway = Math.sin(frame * 0.02 + index * 0.5) * 0.04;

    return (
        <group position={position} scale={scale} rotation={[0, 0, sway]}>
            <mesh position={[0, 2, 0]} geometry={treeTrunkGeo} material={treeTrunkMat} />
            <mesh position={[0, 5, 0]} geometry={treeLeavesGeo} material={treeLeavesMat} />
            <mesh position={[1.5, 6, 1]} scale={0.8} geometry={treeLeavesGeo} material={treeLeavesMat} />
            <mesh position={[-1.5, 6, -1]} scale={0.7} geometry={treeLeavesGeo} material={treeLeavesMat} />
        </group>
    );
};

const CloudShape = ({ opacity }: { opacity: number }) => {
    return (
        <group>
            <mesh position={[0, 0, 0]} geometry={cloudGeo}>
                <meshStandardMaterial color="#ffffff" transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[1.2, -0.2, 0]} scale={0.8} geometry={cloudGeo}>
                <meshStandardMaterial color="#ffffff" transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[-1.2, -0.2, 0]} scale={0.7} geometry={cloudGeo}>
                <meshStandardMaterial color="#ffffff" transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[0, 0.5, 0.3]} scale={0.65} geometry={cloudGeo}>
                <meshStandardMaterial color="#ffffff" transparent opacity={opacity} roughness={1} />
            </mesh>
        </group>
    );
};

const Clouds = ({ frame }: { frame: number }) => {
    const clouds = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 90; i++) {
            arr.push({
                x: (random(`c-x-${i}`) - 0.2) * 2000,
                y: 45 + random(`c-y-${i}`) * 55,
                z: -50 - random(`c-z-${i}`) * 80,
                scale: 3 + random(`c-s-${i}`) * 6,
                opacity: 0.5 + random(`c-op-${i}`) * 0.4,
                speed: 0.1 + random(`c-v-${i}`) * 0.2,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {clouds.map((cloud, i) => {
                const xPos = cloud.x - frame * cloud.speed;
                const width = 2500;
                const loopedX = ((xPos % width) + width) % width - 500;

                return (
                    <group key={i} position={[loopedX, cloud.y, cloud.z]} scale={cloud.scale}>
                        <CloudShape opacity={cloud.opacity} />
                    </group>
                );
            })}
        </group>
    );
};

const CitySkyline = () => {
    const buildings = useMemo(() => {
        const arr = [];
        for (let i = -40; i < 150; i++) {
            arr.push({
                x: i * 80 + random(`sky-1-x-${i}`) * 60,
                z: -1800 - random(`sky-1-z-${i}`) * 400,
                w: 80 + random(`sky-1-w-${i}`) * 120,
                h: 400 + random(`sky-1-h-${i}`) * 600,
                d: 80 + random(`sky-1-d-${i}`) * 120,
                isFar: true,
            });
            arr.push({
                x: i * 60 + random(`sky-2-x-${i}`) * 50,
                z: -1200 - random(`sky-2-z-${i}`) * 300,
                w: 60 + random(`sky-2-w-${i}`) * 100,
                h: 200 + random(`sky-2-h-${i}`) * 400,
                d: 60 + random(`sky-2-d-${i}`) * 100,
                isFar: false,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {buildings.map((building, i) => (
                <mesh
                    key={i}
                    position={[building.x, building.h / 2, building.z]}
                    scale={[building.w, building.h, building.d]}
                    geometry={skylineGeo}
                    material={building.isFar ? skylineMatFar : skylineMatMid}
                />
            ))}
        </group>
    );
};

export const BackgroundEnvironment = () => {
    const frame = useCurrentFrame();

    const trees = useMemo(() => {
        const arr = [];
        for (let i = -8; i < 45; i++) {
            arr.push({
                x: i * 20 + random(`t-b-x-${i}`) * 10,
                z: -30 - random(`t-b-z-${i}`) * 20,
                scale: 1.5 + random(`t-b-s-${i}`),
            });
            arr.push({
                x: i * 25 + random(`t-m-x-${i}`) * 12,
                z: -15 - random(`t-m-z-${i}`) * 5,
                scale: 1 + random(`t-m-s-${i}`) * 0.5,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            <ambientLight intensity={0.6} />
            <directionalLight position={[20, 60, 30]} intensity={1.5} color="#fff" />
            <directionalLight position={[-10, 40, -10]} intensity={0.5} color="#aaddff" />

            <mesh position={[600, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10000, 10000]} />
                <meshStandardMaterial color="#7CB342" roughness={1} />
            </mesh>

            {trees.map((tree, idx) => (
                <LowPolyTree key={idx} index={idx} position={[tree.x, 0, tree.z]} scale={tree.scale} frame={frame} />
            ))}

            <CitySkyline />
            <Clouds frame={frame} />
            <Birds frame={frame} />
            <Airplane frame={frame} />
        </group>
    );
};
