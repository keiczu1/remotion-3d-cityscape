import { memo, useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { composeInstanceMatrix, DynamicInstances, StaticInstances } from "../../three";

const sharedCarMaterialRed = new THREE.MeshBasicMaterial({ color: "#EF4444" });
const sharedCarMaterialWhite = new THREE.MeshBasicMaterial({ color: "#F8FAFC" });

export const HighwayRibbon = memo(({ frame, groundY }: { frame: number; groundY: number }) => {
    const curve = useMemo(
        () =>
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-800, 0, -800),
                new THREE.Vector3(-200, 0, -120),
                new THREE.Vector3(400, 0, -80),
                new THREE.Vector3(800, 0, -800),
                new THREE.Vector3(1200, 0, -150),
                new THREE.Vector3(1800, 0, -1200),
                new THREE.Vector3(2500, 0, -600),
                new THREE.Vector3(3500, 0, -1500),
            ], false, "catmullrom", 0.5),
        [],
    );

    const roadGeo = useMemo(() => new THREE.TubeGeometry(curve, 350, 22, 6, false), [curve]);
    const roadMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#475569", roughness: 1.0, metalness: 0 }), []);
    const carGeo = useMemo(() => new THREE.BoxGeometry(1.6, 0.5, 3.8), []);

    const lineObject = useMemo(() => {
        const points = curve.getPoints(500);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineDashedMaterial({
            color: 0xffffff,
            dashSize: 15,
            gapSize: 15,
            transparent: true,
            opacity: 0.5,
        });
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        return line;
    }, [curve]);

    const signs = useMemo(() => {
        const arr: { x: number; z: number; rotY: number }[] = [];
        for (let i = 0.05; i < 0.95; i += 0.08) {
            const pos = curve.getPointAt(i);
            const tangent = curve.getTangentAt(i);
            const rotY = Math.atan2(tangent.x, tangent.z);
            const perpX = -tangent.z;
            const perpZ = tangent.x;
            const offsetDist = 14;
            arr.push({ x: pos.x + perpX * offsetDist, z: pos.z + perpZ * offsetDist, rotY });
        }
        return arr;
    }, [curve]);

    const signPoleGeo = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 12), []);
    const signPoleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#94A3B8" }), []);
    const signBoardGeo = useMemo(() => new THREE.BoxGeometry(7, 4.5, 0.5), []);
    const signBoardMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0F172A" }), []);
    const signGlowGeo = useMemo(() => new THREE.PlaneGeometry(6, 3.5), []);
    const signGlowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#10B981" }), []);
    const signMatrices = useMemo(() => {
        const poleMatrices: THREE.Matrix4[] = [];
        const boardMatrices: THREE.Matrix4[] = [];
        const glowMatrices: THREE.Matrix4[] = [];

        signs.forEach((sign) => {
            const signBaseMatrix = new THREE.Matrix4().compose(
                new THREE.Vector3(sign.x, 6, sign.z),
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, sign.rotY, 0)),
                new THREE.Vector3(1, 1, 1),
            );

            poleMatrices.push(signBaseMatrix.clone());

            const boardMatrix = signBaseMatrix.clone().multiply(
                new THREE.Matrix4().compose(
                    new THREE.Vector3(3.5, 4, 0),
                    new THREE.Quaternion(),
                    new THREE.Vector3(1, 1, 1),
                ),
            );
            boardMatrices.push(boardMatrix);

            glowMatrices.push(
                boardMatrix.clone().multiply(
                    new THREE.Matrix4().compose(
                        new THREE.Vector3(0, 0, 0.26),
                        new THREE.Quaternion(),
                        new THREE.Vector3(1, 1, 1),
                    ),
                ),
            );
        });

        return {
            poleMatrices,
            boardMatrices,
            glowMatrices,
        };
    }, [signs]);

    const cars = useMemo(() => {
        const arr: {
            idx: number;
            lane: 1 | -1;
            laneOffset: number;
            speed: number;
            color: string;
            startT: number;
        }[] = [];

        for (let i = 0; i < 70; i++) {
            const lane = random(`hd-lane-${i}`) > 0.5 ? 1 : -1;
            const offset = random(`hd-o-${i}`) * 3;
            const laneOffset = lane === 1 ? -4.5 - offset : 4.5 + offset;
            const speed = 0.00008 + random(`hd-sp-${i}`) * 0.0001;
            const color = lane === 1 ? "#EF4444" : "#F8FAFC";

            arr.push({ idx: i, lane, laneOffset, speed, color, startT: random(`hd-st-${i}`) });
        }

        return arr;
    }, []);

    return (
        <group position={[0, groundY + 0.05, 0]}>
            <mesh geometry={roadGeo} material={roadMat} scale={[1, 0.02, 1]} />
            <primitive object={lineObject} position={[0, 0.45, 0]} />

            <StaticInstances geometry={signPoleGeo} material={signPoleMat} matrices={signMatrices.poleMatrices} />
            <StaticInstances geometry={signBoardGeo} material={signBoardMat} matrices={signMatrices.boardMatrices} />
            <StaticInstances geometry={signGlowGeo} material={signGlowMat} matrices={signMatrices.glowMatrices} />

            {(() => {
                const redMatrices: THREE.Matrix4[] = [];
                const whiteMatrices: THREE.Matrix4[] = [];

                cars.forEach((car) => {
                    const rawT = car.startT + frame * car.speed * car.lane;
                    const t = ((rawT % 1.0) + 1.0) % 1.0;
                    const pos = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t);
                    let rotY = Math.atan2(tangent.x, tangent.z);
                    if (car.lane === -1) {
                        rotY += Math.PI;
                    }
                    const perpX = -tangent.z;
                    const perpZ = tangent.x;
                    const finalX = pos.x + perpX * car.laneOffset;
                    const finalZ = pos.z + perpZ * car.laneOffset;
                    const matrix = composeInstanceMatrix({
                        position: [finalX, 0.5, finalZ],
                        rotation: [0, rotY, 0],
                    });

                    if (car.color === "#EF4444") {
                        redMatrices.push(matrix);
                    } else {
                        whiteMatrices.push(matrix);
                    }
                });

                return (
                    <>
                        <DynamicInstances geometry={carGeo} matrices={redMatrices}>
                            <primitive object={sharedCarMaterialRed} attach="material" />
                        </DynamicInstances>
                        <DynamicInstances geometry={carGeo} matrices={whiteMatrices}>
                            <primitive object={sharedCarMaterialWhite} attach="material" />
                        </DynamicInstances>
                    </>
                );
            })()}
        </group>
    );
});

HighwayRibbon.displayName = "HighwayRibbon";
