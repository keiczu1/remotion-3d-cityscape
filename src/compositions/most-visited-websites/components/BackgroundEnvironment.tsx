import { memo, type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame, random, interpolate } from "remotion";
import * as THREE from "three";

import {
    X_SPACING,
    FINALE_FRAME,
    GROUND_Y,
    milestones,
    getEnvironmentState,
} from "../scene/scene-logic";

/* ============================================================
   SHARED RESOURCES
   ============================================================ */

const particleGeo = new THREE.BoxGeometry(1, 1, 1);
const particleMat = new THREE.MeshBasicMaterial({ color: "#00E5FF", transparent: true, opacity: 0.3 });
const particleWireMat = new THREE.MeshBasicMaterial({ color: "#00E5FF", wireframe: true, transparent: true, opacity: 0.4 });

const turbineTowerGeo = new THREE.CylinderGeometry(0.5, 1.2, 1, 12);
const turbineTowerMat = new THREE.MeshStandardMaterial({ color: "#D0D0D0" });
const turbineNacelleGeo = new THREE.BoxGeometry(1.5, 1.5, 4);
const turbineNacelleMat = new THREE.MeshStandardMaterial({ color: "#C8C8C8" });
const turbineHubGeo = new THREE.SphereGeometry(0.8, 12, 12);
const turbineHubMat = new THREE.MeshStandardMaterial({ color: "#B8B8B8" });
const turbineBladeGeo = new THREE.BoxGeometry(0.8, 20, 0.2);
const turbineBladeMat = new THREE.MeshStandardMaterial({ color: "#E0E0E0" });

const fireworkGeo = new THREE.SphereGeometry(1.0, 4, 4);
const rainGeo = new THREE.PlaneGeometry(1.5, 1.0);
const FIREWORK_COLORS = ["#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#FBBF24", "#F472B6"];

type FireworkParticle = {
    vx: number;
    vy: number;
    vz: number;
    baseSpeed: number;
};

type FireworkParticleGroup = {
    color: string;
    particles: FireworkParticle[];
};

type FireworkBurst = {
    startFrame: number;
    offsetX: number;
    offsetY: number;
    flickerPhase: number;
    particleGroups: FireworkParticleGroup[];
};

type GoldenRainPiece = {
    x: number;
    z: number;
    speed: number;
    phase: number;
    rotSpeed: number;
    color: string;
};

type GoldenRainGroup = {
    color: string;
    pieces: GoldenRainPiece[];
};

const composeDynamicInstanceMatrix = ({
    position,
    scale = 1,
    rotation = [0, 0, 0] as [number, number, number],
}: {
    position: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
}) =>
    new THREE.Matrix4().compose(
        new THREE.Vector3(...position),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(scale, scale, scale),
    );

/* ============================================================
   1. GRID FLOOR (static)
   ============================================================ */

const GridFloor = memo(() => (
    <group>
        <mesh position={[600, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10000, 10000]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
        </mesh>
        <gridHelper
            args={[10000, 200, "#94A3B8", "#CBD5E1"]}
            position={[600, GROUND_Y + 0.01, 0]}
        />
    </group>
));
GridFloor.displayName = "GridFloor";

const mountainGeo = new THREE.DodecahedronGeometry(1, 1);
const mountainMat = new THREE.MeshStandardMaterial({ 
    color: "#64748B", 
    roughness: 0.95, 
    metalness: 0.0, 
    flatShading: true 
});

/* ============================================================
   2. FOREST / VEGETATION (Dense at the start)
   ============================================================ */

const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 2, 5);
const trunkMat = new THREE.MeshStandardMaterial({ color: "#78350F", roughness: 1 });
const pineGeo = new THREE.ConeGeometry(2, 4, 5);
const pineMat = new THREE.MeshStandardMaterial({ color: "#064E3B", roughness: 1, flatShading: true }); // Dark emerald

const bushGeo = new THREE.DodecahedronGeometry(1.5, 1);
const bushMat = new THREE.MeshStandardMaterial({ color: "#047857", roughness: 0.9, flatShading: true }); // Standard green

type ForestItem = {
    x: number;
    z: number;
    scale: number;
    rotY: number;
    isPine: boolean;
};

const composeForestInstanceMatrix = ({
    item,
    partPosition,
    partScale = [1, 1, 1] as [number, number, number],
}: {
    item: Omit<ForestItem, "isPine">;
    partPosition: [number, number, number];
    partScale?: [number, number, number];
}) => {
    const parentMatrix = new THREE.Matrix4().compose(
        new THREE.Vector3(item.x, GROUND_Y, item.z),
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

const StaticInstances = memo(({
    geometry,
    material,
    matrices,
}: {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    matrices: THREE.Matrix4[];
}) => {
    const ref = useRef<THREE.InstancedMesh>(null);

    useLayoutEffect(() => {
        const mesh = ref.current;
        if (!mesh) {
            return;
        }

        mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        matrices.forEach((matrix, index) => {
            mesh.setMatrixAt(index, matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [matrices]);

    if (matrices.length === 0) {
        return null;
    }

    return <instancedMesh ref={ref} args={[geometry, material, matrices.length]} />;
});
StaticInstances.displayName = "StaticInstances";

const DynamicInstances = memo(({
    geometry,
    matrices,
    children,
}: {
    geometry: THREE.BufferGeometry;
    matrices: THREE.Matrix4[];
    children: ReactNode;
}) => {
    const ref = useRef<THREE.InstancedMesh>(null);

    useLayoutEffect(() => {
        const mesh = ref.current;
        if (!mesh) {
            return;
        }

        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.count = matrices.length;
        matrices.forEach((matrix, index) => {
            mesh.setMatrixAt(index, matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    }, [matrices]);

    if (matrices.length === 0) {
        return null;
    }

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} frustumCulled={false}>
            <primitive object={geometry} attach="geometry" />
            {children}
        </instancedMesh>
    );
});
DynamicInstances.displayName = "DynamicInstances";

const Forest = memo(({ maxX }: { maxX: number }) => {
    const items = useMemo(() => {
        const arr: ForestItem[] = [];
        for (let i = 0; i < 800; i++) {
            // Распределяем деревья с упором на начало видео (X ближе к 0)
            const skewedX = Math.pow(random(`t-x-${i}`), 1.5); 
            const x = -1000 + skewedX * (maxX + 6000);
            
            // Лес тянется от -80 до -2500 вглубь в горы
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
                pineTrunks.push(composeForestInstanceMatrix({ item, partPosition: [0, 1, 0] }));
                pineCanopyBase.push(composeForestInstanceMatrix({ item, partPosition: [0, 3, 0] }));
                pineCanopyMid.push(composeForestInstanceMatrix({ item, partPosition: [0, 5, 0], partScale: [0.8, 0.8, 0.8] }));
                pineCanopyTop.push(composeForestInstanceMatrix({ item, partPosition: [0, 6.5, 0], partScale: [0.6, 0.6, 0.6] }));
                return;
            }

            bushTrunks.push(composeForestInstanceMatrix({ item, partPosition: [0, 0.5, 0], partScale: [0.5, 0.5, 0.5] }));
            bushCore.push(composeForestInstanceMatrix({ item, partPosition: [0, 1.5, 0] }));
            bushRight.push(composeForestInstanceMatrix({ item, partPosition: [1, 1.2, 0.5], partScale: [0.7, 0.7, 0.7] }));
            bushLeft.push(composeForestInstanceMatrix({ item, partPosition: [-0.8, 1.0, -0.5], partScale: [0.6, 0.6, 0.6] }));
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
    }, [items]);

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
Forest.displayName = "Forest";

/* ============================================================
   3. HORIZON MOUNTAINS -> RANDOMIZED MOUNTAIN RIDGE
   ============================================================ */

const HorizonMountains = memo(() => {
    const mountains = useMemo(() => {
        const arr = [];
        // Раскидываем 150 скалистых массивов вдоль всего горизонта
        for (let i = 0; i < 150; i++) {
            // Случайные скачки высоты (чтобы были доминанты и фоновые холмы)
            const isTitan = random(`m-t-${i}`) > 0.85; // 15% огромных пиков
            const baseH = 100 + random(`m-h-${i}`) * 300;
            const h = isTitan ? baseH * 2.2 : baseH;
            
            // Разная пропорция распластанности (узкие пики и широкие горы)
            const w = h * (0.8 + random(`m-w-${i}`) * 2.0);
            const d = w * (0.8 + random(`m-d-${i}`) * 0.8);

            arr.push({
                x: -3000 + i * 80 + (random(`m-x-${i}`) - 0.5) * 500,  // Шире раскидываем
                z: -3000 - random(`m-z-${i}`) * 4000,                  // Отодвигаем далеко на горизонт (от -3000 до -7000)
                w,
                h,
                d,
                rotY: random(`m-ry-${i}`) * Math.PI * 2,               // Хаотичный поворот "камня"
                rotZ: (random(`m-rz-${i}`) - 0.5) * 0.2,               // Легкий наклон
            });
        }
        
        // Рендерим от задних к передним для чистой картинки
        arr.sort((a, b) => a.z - b.z);
        return arr;
    }, []);

    return (
        <group>
            {mountains.map((m, i) => (
                <mesh
                    key={i}
                    geometry={mountainGeo}
                    material={mountainMat}
                    position={[m.x, GROUND_Y + m.h * 0.2, m.z]} // Опускаем часть вниз, чтобы не было "шаров" у основания
                    scale={[m.w, m.h, m.d]}
                    rotation={[0, m.rotY, m.rotZ]}
                />
            ))}
        </group>
    );
});
HorizonMountains.displayName = "HorizonMountains";

/* ============================================================
   CLOUD ENGINE (With integrated storms and flashes)
   ============================================================ */

const LightningSegment = ({ p1, p2, thickness, opacity }: {p1: THREE.Vector3, p2: THREE.Vector3, thickness: number, opacity: number}) => {
    const distance = p1.distanceTo(p2);
    const position = p1.clone().add(p2).divideScalar(2);
    
    const direction = p2.clone().sub(p1).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
    );

    return (
        <group position={position} quaternion={quaternion}>
            {/* Ядро молнии */}
            <mesh>
                <cylinderGeometry args={[Math.max(0.01, thickness * 0.8), Math.max(0.01, thickness), distance, 5]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={opacity} depthWrite={false} fog={false} />
            </mesh>
            {/* Ореол вокруг молнии (голубое свечение) */}
            <mesh scale={[2, 1, 2]}>
                <cylinderGeometry args={[Math.max(0.02, thickness * 0.8), Math.max(0.02, thickness), distance, 5]} />
                <meshBasicMaterial color="#00E5FF" transparent opacity={opacity * 0.3} depthWrite={false} fog={false} />
            </mesh>
        </group>
    );
};

const cloudSphereGeo = new THREE.SphereGeometry(1, 6, 6);

const CloudShape = memo(({ opacity, cloudColor, flashIntensity }: { opacity: number; cloudColor: THREE.Color, flashIntensity: number }) => {
    return (
        <group>
            <mesh position={[0, 0, 0]} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={cloudColor} emissive="#E0F2FE" emissiveIntensity={flashIntensity} transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[1.2, -0.2, 0]} scale={0.8} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={cloudColor} emissive="#E0F2FE" emissiveIntensity={flashIntensity * 0.9} transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[-1.2, -0.2, 0]} scale={0.7} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={cloudColor} emissive="#E0F2FE" emissiveIntensity={flashIntensity * 0.8} transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[0, 0.5, 0.3]} scale={0.65} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={cloudColor} emissive="#E0F2FE" emissiveIntensity={flashIntensity * 0.7} transparent opacity={opacity} roughness={1} />
            </mesh>
        </group>
    );
});
CloudShape.displayName = "CloudShape";

type CloudDescriptor = {
    id: number;
    x: number;
    y: number;
    z: number;
    scale: number;
    opacity: number;
    speed: number;
};

const CloudEntity = ({
    cloud,
    frame,
    speedMultiplier,
    color,
    globalOpacity,
    stormIntensity,
}: {
    cloud: CloudDescriptor;
    frame: number;
    speedMultiplier: number;
    color: THREE.Color;
    globalOpacity: number;
    stormIntensity: number;
}) => {
    const xPos = cloud.x - frame * cloud.speed * speedMultiplier;
    const width = 2500;
    const loopedX = ((xPos % width) + width) % width - 500;

    // Внутриоблачная гроза (Sheet lightning)
    let activeFlashOffset = -1;
    if (stormIntensity > 0) {
        for(let i=0; i<3; i++) {
            if (random(`flash-in-${cloud.id}-${frame - i}`) < 0.012 * stormIntensity) {
                activeFlashOffset = i;
                break;
            }
        }
    }
    
    // Вспышка затухает за 3 кадра
    const flashIntensity = activeFlashOffset !== -1 
        ? stormIntensity * (1 - activeFlashOffset * 0.3) * (cloud.scale / 5)
        : 0;

    // Редкий удар молнии ИЗ этого облака вниз
    let boltActiveOffset = -1;
    if (stormIntensity > 0) {
        for(let i=0; i<4; i++) {
            // Шанс удара молнии
            if (random(`bolt-${cloud.id}-${frame - i}`) < 0.001 * stormIntensity) {
                boltActiveOffset = i;
                break;
            }
        }
    }

    const anchorFrame = frame - boltActiveOffset;
    const bolts = useMemo(() => {
        if (boltActiveOffset === -1) return [];
        const segments: {p1: THREE.Vector3, p2: THREE.Vector3, t: number}[] = [];
        // ВАЖНО: scale облака (обычно 3-9) влияет на локальные координаты!
        let currP = new THREE.Vector3(0, -2, 0); // Старт снизу облака
        const steps = 6 + Math.floor(random(`b-steps-${cloud.id}-${anchorFrame}`) * 4);
        
        for (let i = 0; i < steps; i++) {
            const nextX = currP.x + (random(`bx-${cloud.id}-${anchorFrame}-${i}`) - 0.5) * 6; 
            const nextY = currP.y - 4 - random(`by-${cloud.id}-${anchorFrame}-${i}`) * 6;  // Резко вниз
            const nextZ = currP.z + (random(`bz-${cloud.id}-${anchorFrame}-${i}`) - 0.5) * 4;
            const nextP = new THREE.Vector3(nextX, nextY, nextZ);
            
            const thickness = 0.5 - (i * 0.05);
            segments.push({ p1: currP, p2: nextP, t: thickness });
            
            // Ветвление
            if (random(`br-${cloud.id}-${anchorFrame}-${i}`) > 0.5) {
                let bp = nextP.clone();
                for(let j = 0; j < 3; j++) {
                    const bx = bp.x + (random(`bx2-${cloud.id}-${anchorFrame}-${i}-${j}`) - 0.5) * 4;
                    const by = bp.y - 3 - random(`by2-${cloud.id}-${anchorFrame}-${i}-${j}`) * 4;
                    const bz = bp.z + (random(`bz2-${cloud.id}-${anchorFrame}-${i}-${j}`) - 0.5) * 3;
                    const bNext = new THREE.Vector3(bx, by, bz);
                    segments.push({ p1: bp, p2: bNext, t: thickness * 0.5 - j * 0.1 });
                    bp = bNext;
                }
            }
            currP = nextP;
        }
        return segments;
    }, [boltActiveOffset, anchorFrame, cloud.id]);

    const boltOpacity = boltActiveOffset !== -1 ? (boltActiveOffset % 2 === 0 ? 1 : 0.4) : 0;

    return (
        <group position={[loopedX, cloud.y, cloud.z]} scale={cloud.scale}>
            {/* Отрисовка самой тучи (может подсвечиваться изнутри) */}
            <CloudShape opacity={cloud.opacity * globalOpacity} cloudColor={color} flashIntensity={flashIntensity} />
            
            {/* Источник света ВНУТРИ тучи для освещения */}
            {flashIntensity > 0 && <pointLight intensity={flashIntensity * 30} distance={1500} color="#E0F2FE" />}

            {/* Вырывающаяся наружу молния */}
            {boltActiveOffset !== -1 && bolts.map((b, i) => (
                <LightningSegment key={i} p1={b.p1} p2={b.p2} thickness={Math.max(0.01, b.t)} opacity={boltOpacity} />
            ))}
            
            {/* Яркая вспышка освещающая все вокруг во время главного удара */}
            {boltActiveOffset === 0 && (
                <pointLight intensity={100 * cloud.scale} distance={4000} color="#ffffff" />
            )}
        </group>
    );
};

const Clouds = ({ frame, speedMultiplier, color, globalOpacity = 1, stormIntensity = 0 }: { frame: number; speedMultiplier: number; color: THREE.Color; globalOpacity?: number, stormIntensity?: number }) => {
    const clouds = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 70; i++) {
            arr.push({
                id: i,
                x: (random(`c-x-${i}`) - 0.2) * 2000,
                y: 55 + random(`c-y-${i}`) * 60,
                z: -80 - random(`c-z-${i}`) * 120,
                scale: 3 + random(`c-s-${i}`) * 6,
                opacity: 0.5 + random(`c-op-${i}`) * 0.35,
                speed: 0.08 + random(`c-v-${i}`) * 0.15,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {clouds.map((cloud, i) => (
                <CloudEntity key={i} cloud={cloud} frame={frame} speedMultiplier={speedMultiplier} color={color} globalOpacity={globalOpacity} stormIntensity={stormIntensity} />
            ))}
        </group>
    );
};

/* ============================================================
   4. DATA PARTICLES (existing, slightly enhanced)
   ============================================================ */

const DataParticles = ({ frame, speedMultiplier }: { frame: number; speedMultiplier: number }) => {
    const particles = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 60; i++) {
            arr.push({
                x: random(`dp-x-${i}`) * 2000 - 200,
                y: 10 + random(`dp-y-${i}`) * 40,
                z: -20 + random(`dp-z-${i}`) * 30,
                speed: 0.3 + random(`dp-s-${i}`) * 0.5,
                size: 0.3 + random(`dp-sz-${i}`) * 0.6,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {particles.map((p, i) => {
                const xPos = p.x - frame * p.speed * speedMultiplier;
                const width = 2500;
                const loopedX = ((xPos % width) + width) % width - 300;
                return (
                    <group key={i} position={[loopedX, p.y, p.z]}>
                        <mesh rotation={[frame * p.speed * 0.05, frame * p.speed * 0.05, 0]} geometry={particleGeo} material={particleMat} scale={[p.size, p.size, p.size]} />
                        <mesh rotation={[frame * p.speed * 0.05, frame * p.speed * 0.05, 0]} geometry={particleGeo} material={particleWireMat} scale={[p.size * 2.0, p.size * 2.0, p.size * 2.0]} />
                    </group>
                );
            })}
        </group>
    );
};

/* ============================================================
   5. WIND TURBINES — промышленные ветряки на горизонте
   ============================================================ */

const WindTurbineBlade = ({ rotation, bladeAngle }: { rotation: number; bladeAngle: number }) => (
    <group rotation={[0, 0, bladeAngle + rotation]}>
        <mesh position={[0, 10, 0]} geometry={turbineBladeGeo} material={turbineBladeMat} />
    </group>
);

const WindTurbine = memo(({ x, z, height, rotSpeed, yRot, frame }: {
    x: number; z: number; height: number; rotSpeed: number; yRot: number; frame: number;
}) => {
    const rotation = (frame * rotSpeed * Math.PI * 2) / 360;
    const bladeAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

    return (
        <group position={[x, GROUND_Y, z]} rotation={[0, yRot, 0]}>
            <mesh position={[0, height / 2, 0]} scale={[1, height, 1]} geometry={turbineTowerGeo} material={turbineTowerMat} />
            <mesh position={[0, height, -0.5]} geometry={turbineNacelleGeo} material={turbineNacelleMat} />
            
            <group position={[0, height + 0.2, 1.8]}>
                <mesh geometry={turbineHubGeo} material={turbineHubMat} />
                {bladeAngles.map((angle, i) => (
                    <WindTurbineBlade key={i} rotation={rotation} bladeAngle={angle} />
                ))}
            </group>
        </group>
    );
});

const WindTurbines = ({ frame }: { frame: number }) => {
    const turbines = useMemo(() => {
        const arr = [];
        // Больше ветряков на дальнем фоне
        for (let i = 0; i < 20; i++) {
            // Поворачиваем их немного к камере или вбок (от -60 до +60 градусов)
            const yRot = (random(`wt-yrot-${i}`) - 0.5) * Math.PI * 0.7;
            const distZ = 80 + random(`wt-z-${i}`) * 150; // От -80 до -230
            // Чем дальше ветряк, тем больше он может быть физически (чтобы его было видно), хотя перспектива все равно уменьшит
            const height = 45 + random(`wt-h-${i}`) * 40;
            arr.push({
                x: random(`wt-x-${i}`) * 2500 - 300,
                z: -distZ,
                height,
                rotSpeed: 0.6 + random(`wt-r-${i}`) * 1.5,
                yRot,
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {turbines.map((t, i) => (
                <WindTurbine
                    key={i}
                    x={t.x}
                    z={t.z}
                    height={t.height}
                    rotSpeed={t.rotSpeed}
                    yRot={t.yRot}
                    frame={frame}
                />
            ))}
        </group>
    );
};



/* ============================================================
   8. FIREWORKS — салют на финале (#1)
   ============================================================ */

const Fireworks = ({ frame }: { frame: number }) => {
    const finaleStart = FINALE_FRAME;
    const localFrame = frame - finaleStart;

    // Anchor fireworks around the #1 stele (Google)
    const lastMs = milestones[milestones.length - 1];
    const anchorX = lastMs.xCenter;
    const anchorY = lastMs.yCenter;

    const bursts = useMemo(() => {
        const arr: FireworkBurst[] = [];
        for (let wave = 0; wave < 12; wave++) {
            const particleGroups = new Map<string, FireworkParticle[]>();
            
            // Randomly choose primary/secondary colors for the burst
            const isMixed = random(`fw-mix-${wave}`) > 0.6;
            const primaryColor = FIREWORK_COLORS[Math.floor(random(`fw-pc-${wave}`) * FIREWORK_COLORS.length)];
            const secondaryColor = FIREWORK_COLORS[Math.floor(random(`fw-sc-${wave}`) * FIREWORK_COLORS.length)];

            for (let p = 0; p < 80; p++) {
                // Sphere distribution
                const phi = random(`fw-ph-${wave}-${p}`) * Math.PI * 2;
                const costheta = random(`fw-th-${wave}-${p}`) * 2 - 1;
                const theta = Math.acos(costheta);
                
                const vx = Math.sin(theta) * Math.cos(phi);
                const vy = Math.sin(theta) * Math.sin(phi);
                const vz = Math.cos(theta);
                
                const baseSpeed = 0.5 + random(`fw-sp-${wave}-${p}`) * 0.5;
                const color = isMixed 
                    ? (random(`fw-c-${wave}-${p}`) > 0.5 ? primaryColor : secondaryColor)
                    : primaryColor;

                const particle = { vx, vy, vz, baseSpeed };
                const particlesForColor = particleGroups.get(color);
                if (particlesForColor) {
                    particlesForColor.push(particle);
                } else {
                    particleGroups.set(color, [particle]);
                }
            }
            
            const offsetX = (random(`fw-ox-${wave}`) - 0.5) * 60;
            const offsetY = 15 + random(`fw-oy-${wave}`) * 30;
            const startFrame = wave * 45 + Math.floor(random(`fw-sf-${wave}`) * 10);
            
            arr.push({
                startFrame,
                offsetX,
                offsetY,
                flickerPhase: random(`fw-fl-${wave}`) * Math.PI * 2,
                particleGroups: Array.from(particleGroups, ([color, particles]) => ({ color, particles })),
            });
        }
        return arr;
    }, []);

    if (localFrame < 10 || localFrame > 600) return null;

    return (
        <group position={[anchorX, anchorY, 10]}>
            {bursts.map((burst, bi) => {
                const burstLocal = localFrame - burst.startFrame;
                if (burstLocal < 0 || burstLocal > 120) return null;
                const progress = burstLocal / 120; // 0 to 1
                
                // Explosive expansion (fast start, slow end)
                const easedT = 1 - Math.pow(1 - progress, 3);
                const maxDist = 45; 
                // Gravity increases quadratically
                const gravityDrop = progress * progress * 25;
                
                // Flash intensity
                const flashOpacity = interpolate(burstLocal, [0, 4, 15], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const flicker =
                    progress > 0.6
                        ? 0.65 + 0.35 * (0.5 + 0.5 * Math.sin((burstLocal - 72) * 0.45 + burst.flickerPhase))
                        : 1;
                const particleOpacity = interpolate(progress, [0, 0.1, 0.8, 1], [0, 1, 0.9, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                }) * flicker;
                const particleScale = interpolate(progress, [0, 0.1, 1], [0.1, 1.2, 0.1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                }) * 0.5;

                return (
                    <group key={bi} position={[burst.offsetX, burst.offsetY, 0]}>
                        {/* Flash at the burst origin */}
                        {flashOpacity > 0 && (
                            <mesh geometry={fireworkGeo} scale={interpolate(burstLocal, [0, 15], [1, 20])}>
                                <meshBasicMaterial color="#FFFFFF" transparent opacity={flashOpacity * 0.8} depthWrite={false} />
                            </mesh>
                        )}
                        {burst.particleGroups.map((group) => {
                            const matrices = group.particles.map((particle) => {
                                const dist = easedT * particle.baseSpeed * maxDist;
                                const x = particle.vx * dist;
                                const y = particle.vy * dist + (particle.baseSpeed * easedT * 10) - gravityDrop;
                                const z = particle.vz * dist;

                                return composeDynamicInstanceMatrix({
                                    position: [x, y, z],
                                    scale: particleScale,
                                });
                            });

                            return (
                                <DynamicInstances key={group.color} geometry={fireworkGeo} matrices={matrices}>
                                    <meshBasicMaterial
                                        color={group.color}
                                        transparent
                                        opacity={particleOpacity}
                                        depthWrite={false}
                                    />
                                </DynamicInstances>
                            );
                        })}
                    </group>
                );
            })}
        </group>
    );
};

/* ============================================================
   9. GOLDEN RAIN — золотой дождь на финале
   ============================================================ */

const GoldenRain = ({ frame }: { frame: number }) => {
    const finaleStart = FINALE_FRAME;
    const localFrame = frame - finaleStart;

    const confettiGroups = useMemo(() => {
        const byColor = new Map<string, GoldenRainPiece[]>();
        for (let i = 0; i < 80; i++) {
            const piece: GoldenRainPiece = {
                x: (random(`gr-x-${i}`) - 0.5) * 80,
                z: -10 - random(`gr-z-${i}`) * 30,
                speed: 0.2 + random(`gr-sp-${i}`) * 0.4,
                phase: random(`gr-ph-${i}`) * 200,
                rotSpeed: (random(`gr-r-${i}`) - 0.5) * 0.1,
                color: random(`gr-c-${i}`) > 0.5 ? "#F59E0B" : "#FDE68A",
            };
            const pieces = byColor.get(piece.color);
            if (pieces) {
                pieces.push(piece);
            } else {
                byColor.set(piece.color, [piece]);
            }
        }
        return Array.from(byColor, ([color, pieces]): GoldenRainGroup => ({ color, pieces }));
    }, []);

    if (localFrame < 40 || localFrame > 600) return null;

    const finaleX = (milestones.length - 1) * X_SPACING;
    const rainOpacity = interpolate(localFrame, [40, 80, 500, 600], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
        <group position={[finaleX, 0, 0]}>
            {confettiGroups.map((group) => {
                const matrices = group.pieces.map((piece) => {
                    const yPos = 80 - ((localFrame - 60) * piece.speed + piece.phase) % 90;
                    const rotZ = frame * piece.rotSpeed;

                    return composeDynamicInstanceMatrix({
                        position: [piece.x, yPos, piece.z],
                        rotation: [0, 0, rotZ],
                    });
                });

                return (
                    <DynamicInstances key={group.color} geometry={rainGeo} matrices={matrices}>
                        <meshBasicMaterial
                            color={group.color}
                            transparent
                            opacity={rainOpacity * 0.9}
                            side={THREE.DoubleSide}
                            depthWrite={false}
                        />
                    </DynamicInstances>
                );
            })}
        </group>
    );
};

/* ============================================================
   10. HIGHWAY NETWORK — извилистая трасса (Змейка)
   ============================================================ */

const Highway = memo(({ frame }: { frame: number }) => {
    // Центральная траектория извилистой дороги 
    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(-800, 0, -800),    // Уходит далеко влево
            new THREE.Vector3(-200, 0, -120),    // Подходит ближе к городу
            new THREE.Vector3(400, 0, -80),      // Подходит ВПЛОТНУЮ (стелы на Z=10)
            new THREE.Vector3(800, 0, -800),     // Снова отдаляется
            new THREE.Vector3(1200, 0, -150),    // Опять вплотную к объектам
            new THREE.Vector3(1800, 0, -1200),
            new THREE.Vector3(2500, 0, -600),
            new THREE.Vector3(3500, 0, -1500),
        ], false, 'catmullrom', 0.5);
    }, []);

    // Расплюснутая труба превращается в ровную дорогу, повторяющую любой вираж!
    const roadGeo = useMemo(() => new THREE.TubeGeometry(curve, 350, 22, 6, false), [curve]);
    const roadMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#475569", roughness: 1.0, metalness: 0 }), []);
    const carGeo = useMemo(() => new THREE.BoxGeometry(1.6, 0.5, 3.8), []);

    // Линия разметки (используем точные точки сплайна дороги)
    const lineObject = useMemo(() => {
        const points = curve.getPoints(500);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineDashedMaterial({ 
            color: 0xffffff, dashSize: 15, gapSize: 15, transparent: true, opacity: 0.5 
        });
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances(); // Обязательно для пунктира
        return line;
    }, [curve]);

    // Дорожные знаки по краям трассы
    const signs = useMemo(() => {
        const arr = [];
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
    const signGlowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#10B981" }), []); // Неоновый изумрудный экран

    const cars = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 70; i++) {
            // lane: 1 = едет от нас, -1 = едет к нам
            const lane = random(`hd-lane-${i}`) > 0.5 ? 1 : -1;
            // laneOffset - дистанция по нормали от оси дороги для разъезда по полосам
            const laneOffset = lane === 1 ? -4.5 - random(`hd-o-${i}`) * 3 : 4.5 + random(`hd-o-${i}`) * 3;
            
            // Сверхреалистичная медленная скорость (т.к. путь очень длинный)
            const speed = 0.00008 + random(`hd-sp-${i}`) * 0.0001;
            
            const color = lane === 1 ? "#EF4444" : "#F8FAFC"; // Красные задние огни / Яркие фары
            
            arr.push({ idx: i, lane, laneOffset, speed, color, startT: random(`hd-st-${i}`) });
        }
        return arr;
    }, []);

    return (
        <group position={[0, GROUND_Y + 0.05, 0]}>
            {/* Дорожное полотно (сплющенная по Y труба) */}
            <mesh geometry={roadGeo} material={roadMat} scale={[1, 0.02, 1]} />
            
            {/* Разметка */}
            {/* position y=0.51 чтобы лежать поверх дороги */}
            <primitive object={lineObject} position={[0, 0.45, 0]} />

            {/* Дорожные знаки */}
            {signs.map((sign, i) => (
                <group key={`sign-${i}`} position={[sign.x, 6, sign.z]} rotation={[0, sign.rotY, 0]}>
                    <mesh geometry={signPoleGeo} material={signPoleMat} />
                    <group position={[3.5, 4, 0]}> {/* вывеска нависает над дорогой */}
                        <mesh geometry={signBoardGeo} material={signBoardMat} />
                        <mesh position={[0, 0, 0.26]} geometry={signGlowGeo} material={signGlowMat} />
                    </group>
                </group>
            ))}
            
            {/* Машины */}
            {cars.map((car) => {
                const rawT = car.startT + frame * car.speed * car.lane;
                // Исключаем вылеты за начало и конец пути
                const t = ((rawT % 1.0) + 1.0) % 1.0; 
                
                // Получаем точные мировые координаты точки и вектор направления на конкретном %.
                const pos = curve.getPointAt(t);
                const tangent = curve.getTangentAt(t);
                
                // Вычисляем угол поворота машины точно по ходу трассы
                let rotY = Math.atan2(tangent.x, tangent.z);
                if (car.lane === -1) rotY += Math.PI; // Встречка смотрит назад

                // Перпендикуляр для равномерного сдвига левее/правее от оси (создаем полосы)
                const perpX = -tangent.z;
                const perpZ = tangent.x;
                
                const finalX = pos.x + perpX * car.laneOffset;
                const finalZ = pos.z + perpZ * car.laneOffset;

                return (
                    // position y = 0.5, чтобы машины лежали "сверху" сплющенного асфальта
                    <mesh key={car.idx} position={[finalX, 0.5, finalZ]} rotation={[0, rotY, 0]} geometry={carGeo}>
                        <meshBasicMaterial color={car.color} />
                    </mesh>
                );
            })}
        </group>
    );
});
Highway.displayName = "Highway";

/* ============================================================
   11. STORM EFFECTS (Rain & Lightning starting top-15)
   ============================================================ */

const stormRainGeo = new THREE.PlaneGeometry(0.2, 8.0);

type StormRaindrop = {
    x: number;
    z: number;
    yOffset: number;
    speed: number;
};

const StormRain = ({ frame, progress, maxX }: { frame: number, progress: number, maxX: number }) => {
    // Шторм усиливается до Топ-5 (0.85), а затем полностью затихает к Топ-1 (0.98)
    const rainIntensity = interpolate(progress, [0.65, 0.85, 0.95, 0.98], [0, 1, 0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    
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

    if (rainIntensity <= 0) return null;

    const matrices = raindrops.map((drop) => {
        const yPos = 120 - ((frame * drop.speed + drop.yOffset) % 150);

        return composeDynamicInstanceMatrix({
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

const StormLightning = ({ frame, progress, cloudSpeedMultiplier }: { frame: number, progress: number, cloudSpeedMultiplier: number }) => {
    let activeFlashFrame = -1;
    if (progress >= 0.65 && progress <= 0.95) {
        for (let f = frame; f >= frame - 4; f--) {
            if (random(`flash-${f}`) > 0.96) {
                activeFlashFrame = f;
                break;
            }
        }
    }

    if (activeFlashFrame === -1) {
        return null;
    }

    const cloudIndex = Math.floor(random(`flash-cloud-${activeFlashFrame}`) * 70);
    const baseX = (random(`c-x-${cloudIndex}`) - 0.2) * 2000;
    const flashY = 55 + random(`c-y-${cloudIndex}`) * 60;
    const flashZ = -80 - random(`c-z-${cloudIndex}`) * 120;
    const cloudScale = 3 + random(`c-s-${cloudIndex}`) * 6;
    const cloudSpeed = 0.08 + random(`c-v-${cloudIndex}`) * 0.15;
    const xPos = baseX - frame * cloudSpeed * cloudSpeedMultiplier;
    const width = 2500;
    const flashX = ((xPos % width) + width) % width - 500;
    const flashLife = 1 - Math.min(1, (frame - activeFlashFrame) / 4);
    const flashOpacity = flashLife * interpolate(progress, [0.65, 0.85, 0.95], [0.35, 1, 0.5], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const start = new THREE.Vector3(flashX, flashY - cloudScale * 1.5, flashZ);
    const end = new THREE.Vector3(
        flashX + (random(`flash-end-x-${activeFlashFrame}`) - 0.5) * 35,
        GROUND_Y + 2,
        flashZ + 10 + random(`flash-end-z-${activeFlashFrame}`) * 24,
    );

    return (
        <group>
            <LightningSegment p1={start} p2={end} thickness={0.75 + cloudScale * 0.04} opacity={flashOpacity} />
            <pointLight position={[flashX, flashY, flashZ]} intensity={flashOpacity * 55} distance={2600} color="#E0F2FE" />
        </group>
    );
};



/* ============================================================
   12. SUN (Before storm)
   ============================================================ */

const Sun = ({ progress, maxX }: { progress: number, maxX: number }) => {
    // Sun is visible from 0 to 0.55, fades out at 0.65
    const sunOpacity = interpolate(progress, [0.55, 0.65], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    
    // Sun travels across the horizon
    const sunX = interpolate(progress, [0, 0.6], [-2000, maxX + 2000]);
    // Немного опускаем солнце вниз к финалу (садится за горы)
    const sunY = interpolate(progress, [0, 0.6], [3000, 300]);
    // Убираем ОЧЕНЬ далеко назад, чтобы 100% быть за горами (горы до -7000)
    const sunZ = -8000;

    if (sunOpacity <= 0) return null;

    return (
        <group position={[sunX, sunY, sunZ]}>
            {/* Реалистичное ядро (почти белое) */}
            <mesh>
                <circleGeometry args={[500, 64]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={sunOpacity} fog={false} />
            </mesh>
            {/* Яркая корона */}
            <mesh>
                <circleGeometry args={[1000, 64]} />
                <meshBasicMaterial color="#FEF08A" transparent opacity={sunOpacity * 0.6} fog={false} />
            </mesh>
            {/* Мягкое гало */}
            <mesh>
                <circleGeometry args={[2500, 64]} />
                <meshBasicMaterial color="#FDE047" transparent opacity={sunOpacity * 0.2} fog={false} />
            </mesh>
            {/* Широкий рассветный/закатный градиент на полнеба */}
            <mesh>
                <circleGeometry args={[5000, 64]} />
                <meshBasicMaterial color="#F59E0B" transparent opacity={sunOpacity * 0.05} fog={false} />
            </mesh>
        </group>
    );
};

/* ============================================================
   MAIN EXPORT
   ============================================================ */

export const BackgroundEnvironment = () => {
    const frame = useCurrentFrame();
    const env = getEnvironmentState(frame);

    /* ---- SKY COLOR: transitions by act ---- */
    // Morning (0) -> Bright Sunny (0.3) -> Golden (0.5) -> Dark Storm (0.65) -> Deep Storm (0.85) -> Clear Night (1)
    const skyR = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 0.85, 0.98, 1], [0.87, 0.22, 0.99, 0.27, 0.05, 0.05, 0.05]);
    const skyG = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 0.85, 0.98, 1], [0.95, 0.74, 0.83, 0.33, 0.09, 0.15, 0.15]);
    const skyB = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 0.85, 0.98, 1], [1.00, 0.97, 0.30, 0.41, 0.16, 0.30, 0.30]);
    const skyColor = new THREE.Color(skyR, skyG, skyB);
    const fogColor = skyColor.clone();

    /* ---- CLOUD COLOR: white -> dark inside the storm ---- */
    const cloudR = interpolate(env.totalProgress, [0, 0.3, 0.65, 0.85, 1], [1.0, 1.0, 0.30, 0.10, 0.10]);
    const cloudG = interpolate(env.totalProgress, [0, 0.3, 0.65, 0.85, 1], [1.0, 1.0, 0.32, 0.10, 0.10]);
    const cloudB = interpolate(env.totalProgress, [0, 0.3, 0.65, 0.85, 1], [1.0, 1.0, 0.35, 0.15, 0.15]);
    const cloudColor = new THREE.Color(cloudR, cloudG, cloudB);
    
    /* ---- CLOUD OPACITY: disappear for the Top-1 clear sky ---- */
    const globalCloudOpacity = interpolate(env.totalProgress, [0.85, 0.95], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    /* ---- FOG DISTANCE: pushes back toward finale (very clear sky at the end!) ---- */
    const fogNear = interpolate(env.totalProgress, [0, 0.8, 0.98], [600, 600, 2000], { extrapolateRight: 'clamp' });
    const fogFar = interpolate(env.totalProgress, [0, 0.8, 0.98], [5000, 5000, 12000], { extrapolateRight: 'clamp' });

    /* ---- LIGHTING: brightness curve based on sun presence ---- */
    const mainLightIntensity = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 0.95, 1], [1.2, 1.5, 1.3, 0.3, 0.2, 0.6]); // Возвращаем немного света в финале
    const mainLightColorR = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 1], [1.0, 1.0, 1.0, 0.8, 0.8]);
    const mainLightColorG = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 1], [1.0, 1.0, 0.8, 0.8, 0.8]);
    const mainLightColorB = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 1], [1.0, 1.0, 0.6, 0.9, 0.9]);
    const mainLightColor = new THREE.Color(mainLightColorR, mainLightColorG, mainLightColorB);

    const ambientIntensity = interpolate(env.totalProgress, [0, 0.3, 0.5, 0.65, 0.95, 1], [0.7, 0.9, 0.8, 0.2, 0.1, 0.5]); // Осветляем окружение

    /* ---- CLOUD SPEED: accelerates through acts ---- */
    const cloudSpeed = interpolate(env.totalProgress, [0, 0.3, 0.65, 1], [1.0, 1.0, 1.5, 2.2]);

    /* ---- STORM INTENSITY: mapped explicitly for cloud flashes and bolts ---- */
    const stormIntensity = interpolate(env.totalProgress, [0.65, 0.85, 0.95, 0.98], [0, 1, 0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    /* ---- FINALE FLASH LIGHT ---- */
    const finaleLocal = frame - FINALE_FRAME;
    const flashIntensity = (finaleLocal > 30 && finaleLocal < 50)
        ? interpolate(finaleLocal, [30, 38, 50], [0, 6, 0])
        : 0;

    const maxX = (milestones.length - 1) * X_SPACING;

    return (
        <>
            {/* Sky + Fog — must be direct scene children, not inside <group> */}
            <color attach="background" args={[skyColor.r, skyColor.g, skyColor.b]} />
            <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

            {/* Lighting */}
            <ambientLight intensity={ambientIntensity} />
            <directionalLight
                position={[20, 80, 40]}
                intensity={mainLightIntensity}
                color={mainLightColor}
            />
            <directionalLight position={[-15, 50, -20]} intensity={0.4} color="#E0F2FE" />

            {/* Finale flash */}
            {flashIntensity > 0 && (
                <pointLight
                    position={[maxX, 40, 10]}
                    intensity={flashIntensity}
                    color="#FFFFFF"
                    distance={200}
                />
            )}

            {/* Static environment */}
            <GridFloor />
            <Highway frame={frame} />
            <Forest maxX={maxX} />
            <HorizonMountains />

            {/* Frame-aware sky objects */}
            <Sun progress={env.totalProgress} maxX={maxX} />
            <WindTurbines frame={frame} />
            {globalCloudOpacity > 0 && <Clouds frame={frame} speedMultiplier={cloudSpeed} color={cloudColor} globalOpacity={globalCloudOpacity} stormIntensity={stormIntensity} />}
            <DataParticles frame={frame} speedMultiplier={cloudSpeed} />

            {/* Storm effects at TOP-15 */}
            <StormRain frame={frame} progress={env.totalProgress} maxX={maxX} />
            <StormLightning frame={frame} progress={env.totalProgress} cloudSpeedMultiplier={cloudSpeed} />

            {/* Finale effects */}
            {env.act === 4 && <Fireworks frame={frame} />}
            {env.act === 4 && <GoldenRain frame={frame} />}
        </>
    );
};
