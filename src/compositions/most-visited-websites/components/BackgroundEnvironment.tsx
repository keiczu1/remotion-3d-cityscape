import { memo, useMemo } from "react";
import { useCurrentFrame, random, interpolate } from "remotion";
import * as THREE from "three";

import {
    ForestBackdrop,
    HighwayRibbon,
    HorizonMountainRidge,
    LowPolyCloud,
    StormLightningBursts,
    StormRainLayer,
    WindTurbine,
} from "../../../lib/ranking-corridor/art";
import { composeInstanceMatrix, DynamicInstances } from "../../../lib/ranking-corridor/three";
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


/* World backdrops promoted to library:
   ForestBackdrop, HorizonMountainRidge, HighwayRibbon, StormRainLayer, StormLightningBursts. */


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

type CloudDescriptor = {
    id: number;
    x: number;
    y: number;
    z: number;
    scale: number;
    opacity: number;
    speed: number;
};

const buildCloudDescriptors = (): CloudDescriptor[] => {
    const arr: CloudDescriptor[] = [];
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
            <LowPolyCloud opacity={cloud.opacity * globalOpacity} color={color} flashIntensity={flashIntensity} />
            
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

const Clouds = ({
    clouds,
    frame,
    speedMultiplier,
    color,
    globalOpacity = 1,
    stormIntensity = 0,
}: {
    clouds: readonly CloudDescriptor[];
    frame: number;
    speedMultiplier: number;
    color: THREE.Color;
    globalOpacity?: number;
    stormIntensity?: number;
}) => {
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
                    position={[t.x, GROUND_Y, t.z]}
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

                                return composeInstanceMatrix({
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

                    return composeInstanceMatrix({
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

/* Sun and cloud-direction remain project-local even after world-module promotion. */

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
    const clouds = useMemo(() => buildCloudDescriptors(), []);

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
            <HighwayRibbon frame={frame} groundY={GROUND_Y} />
            <ForestBackdrop maxX={maxX} groundY={GROUND_Y} />
            <HorizonMountainRidge groundY={GROUND_Y} />

            {/* Frame-aware sky objects */}
            <Sun progress={env.totalProgress} maxX={maxX} />
            <WindTurbines frame={frame} />
            {globalCloudOpacity > 0 && (
                <Clouds
                    clouds={clouds}
                    frame={frame}
                    speedMultiplier={cloudSpeed}
                    color={cloudColor}
                    globalOpacity={globalCloudOpacity}
                    stormIntensity={stormIntensity}
                />
            )}
            <DataParticles frame={frame} speedMultiplier={cloudSpeed} />

            {/* Storm effects at TOP-15 */}
            <StormRainLayer frame={frame} progress={env.totalProgress} maxX={maxX} />
            <StormLightningBursts
                frame={frame}
                progress={env.totalProgress}
                anchors={clouds}
                cloudSpeedMultiplier={cloudSpeed}
                groundY={GROUND_Y}
            />

            {/* Finale effects */}
            {env.act === 4 && <Fireworks frame={frame} />}
            {env.act === 4 && <GoldenRain frame={frame} />}
        </>
    );
};
