import { memo, useMemo } from "react";
import { useCurrentFrame, random, interpolate } from "remotion";
import * as THREE from "three";

import {
    CorridorReliefGround,
    ForestBackdrop,
    getCorridorReliefHeight,
    HorizonMountainRidge,
    LowPolyCloud,
    SteamTrainLine,
    StormLightningBursts,
    StormRainLayer,
} from "../../../lib/ranking-corridor/art";
import { composeInstanceMatrix, DynamicInstances } from "../../../lib/ranking-corridor/three";
import {
    X_SPACING,
    FINALE_FRAME,
    GROUND_Y,
    milestones,
    getEnvironmentState,
} from "./scene-logic";

/* ============================================================
   SHARED RESOURCES
   ============================================================ */

const fireworkGeo = new THREE.SphereGeometry(1.0, 4, 4);
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

/* ============================================================
   REALISTIC STEAM TRAIN SYSTEM
   ============================================================ */
const TrainLane = memo(({ startX, endX, frame, seed, speed, maxX, direction = 1 }: { startX: number; endX: number; frame: number; seed: number; speed: number; maxX: number; direction?: 1 | -1 }) => {
    const curve = useMemo(() => {
        const points = [];
        const steps = 60;
        const dx = (endX - startX) / steps;

        for (let i = 0; i <= steps; i++) {
            const worldX = startX + i * dx;
            const worldZ = -60 - Math.abs(Math.sin(worldX * 0.002 + seed)) * 240;
            const worldY = GROUND_Y + getCorridorReliefHeight({ worldX, worldZ, maxX }) + 1.5;

            points.push(new THREE.Vector3(worldX, worldY, worldZ));
        }

        return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
    }, [startX, endX, seed, maxX]);

    return (
        <SteamTrainLine curve={curve} frame={frame} seed={seed} speed={speed} direction={direction} />
    );
});
TrainLane.displayName = "TrainLane";

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
            {/* Ореол вокруг молнии (желто-голубое свечение) */}
            <mesh scale={[2, 1, 2]}>
                <cylinderGeometry args={[Math.max(0.02, thickness * 0.8), Math.max(0.02, thickness), distance, 5]} />
                <meshBasicMaterial color="#FEF08A" transparent opacity={opacity * 0.3} depthWrite={false} fog={false} />
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

    let activeFlashOffset = -1;
    if (stormIntensity > 0) {
        for(let i=0; i<3; i++) {
            if (random(`flash-in-${cloud.id}-${frame - i}`) < 0.012 * stormIntensity) {
                activeFlashOffset = i;
                break;
            }
        }
    }
    
    const flashIntensity = activeFlashOffset !== -1 
        ? stormIntensity * (1 - activeFlashOffset * 0.3) * (cloud.scale / 5)
        : 0;

    let boltActiveOffset = -1;
    if (stormIntensity > 0.5) {
        for(let i=0; i<4; i++) {
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
        let currP = new THREE.Vector3(0, -2, 0); 
        const steps = 6 + Math.floor(random(`b-steps-${cloud.id}-${anchorFrame}`) * 4);
        
        for (let i = 0; i < steps; i++) {
            const nextX = currP.x + (random(`bx-${cloud.id}-${anchorFrame}-${i}`) - 0.5) * 6; 
            const nextY = currP.y - 4 - random(`by-${cloud.id}-${anchorFrame}-${i}`) * 6;
            const nextZ = currP.z + (random(`bz-${cloud.id}-${anchorFrame}-${i}`) - 0.5) * 4;
            const nextP = new THREE.Vector3(nextX, nextY, nextZ);
            
            const thickness = 0.5 - (i * 0.05);
            segments.push({ p1: currP, p2: nextP, t: thickness });
            
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
            <LowPolyCloud opacity={cloud.opacity * globalOpacity} color={color} flashIntensity={flashIntensity} />
            {flashIntensity > 0 && <pointLight intensity={flashIntensity * 30} distance={1500} color="#E0F2FE" />}
            {boltActiveOffset !== -1 && bolts.map((b, i) => (
                <LightningSegment key={i} p1={b.p1} p2={b.p2} thickness={Math.max(0.01, b.t)} opacity={boltOpacity} />
            ))}
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
   8. FIREWORKS & GOLDEN RAIN — салют на финале (#1)
   ============================================================ */

const Fireworks = ({ frame }: { frame: number }) => {
    const finaleStart = FINALE_FRAME;
    const localFrame = frame - finaleStart;
    const lastMs = milestones[milestones.length - 1];
    const anchorX = lastMs.xCenter;
    const anchorY = lastMs.yCenter;

    const bursts = useMemo(() => {
        const arr: FireworkBurst[] = [];
        for (let wave = 0; wave < 12; wave++) {
            const particleGroups = new Map<string, FireworkParticle[]>();
            const isMixed = random(`fw-mix-${wave}`) > 0.6;
            const primaryColor = FIREWORK_COLORS[Math.floor(random(`fw-pc-${wave}`) * FIREWORK_COLORS.length)];
            const secondaryColor = FIREWORK_COLORS[Math.floor(random(`fw-sc-${wave}`) * FIREWORK_COLORS.length)];

            for (let p = 0; p < 80; p++) {
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
                const progress = burstLocal / 120;
                const easedT = 1 - Math.pow(1 - progress, 3);
                const maxDist = 45; 
                const gravityDrop = progress * progress * 25;
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
                                    <meshBasicMaterial color={group.color} transparent opacity={particleOpacity} depthWrite={false} />
                                </DynamicInstances>
                            );
                        })}
                    </group>
                );
            })}
        </group>
    );
};

/* Sun and cloud-direction remain project-local even after world-module promotion. */

const Sun = ({ progress }: { progress: number }) => {
    // В первом акте солнце яркое, во втором садится/скрывается
    const sunOpacity = interpolate(progress, [0, 0.25, 0.3], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const sunX = interpolate(progress, [0, 0.3], [-2000, 3000]);
    const sunY = interpolate(progress, [0, 0.3], [3000, 300]);
    const sunZ = -8000;

    if (sunOpacity <= 0) return null;

    return (
        <group position={[sunX, sunY, sunZ]}>
            <mesh>
                <circleGeometry args={[500, 64]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={sunOpacity} fog={false} />
            </mesh>
            <mesh>
                <circleGeometry args={[1000, 64]} />
                <meshBasicMaterial color="#FEF08A" transparent opacity={sunOpacity * 0.6} fog={false} />
            </mesh>
            <mesh>
                <circleGeometry args={[2500, 64]} />
                <meshBasicMaterial color="#FDE047" transparent opacity={sunOpacity * 0.2} fog={false} />
            </mesh>
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

export const EnvironmentLayer = () => {
    const frame = useCurrentFrame();
    const env = getEnvironmentState(frame);
    const clouds = useMemo(() => buildCloudDescriptors(), []);

    /* ---- SKY COLOR: progression from Sunny Forest to Dark Storm Night ---- */
    // Act 1 (100-76): Sunny (0..0.25)
    // Act 2 (75-51): Grey/Cold (0.25..0.5)
    // Act 3 (50-26): Dark Dusk (0.5..0.75)
    // Act 4 (25-1): Deep Night (0.75..1.0)
    const skyR = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.55, 0.40, 0.15, 0.05, 0.02]);
    const skyG = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.85, 0.50, 0.20, 0.08, 0.02]);
    const skyB = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [1.00, 0.65, 0.30, 0.15, 0.05]);
    const skyColor = new THREE.Color(skyR, skyG, skyB);
    const fogColor = skyColor.clone();

    /* ---- LIGHTING ---- */
    const mainLightIntensity = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [1.5, 1.0, 0.4, 0.1, 0.1]); 
    const mainLightColorR = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [1.0, 0.9, 0.8, 0.7, 0.7]);
    const mainLightColorG = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [1.0, 0.9, 0.8, 0.7, 0.7]);
    const mainLightColorB = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.9, 1.0, 1.0, 1.0, 1.0]);
    const mainLightColor = new THREE.Color(mainLightColorR, mainLightColorG, mainLightColorB);
    const ambientIntensity = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.8, 0.6, 0.3, 0.1, 0.1]);

    /* ---- FORESTS ---- */
    // Лес редеет и пропадает к 3ей сцене (0.5 progress)
    const forestOpacity = interpolate(env.totalProgress, [0.35, 0.50], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    /* ---- WEATHER & CLOUDS ---- */
    // Тучи в начале белые, потом серые, потом черные
    const cloudR = interpolate(env.totalProgress, [0, 0.25, 0.75, 1], [1.0, 0.6, 0.1, 0.05]);
    const cloudG = interpolate(env.totalProgress, [0, 0.25, 0.75, 1], [1.0, 0.65, 0.12, 0.05]);
    const cloudB = interpolate(env.totalProgress, [0, 0.25, 0.75, 1], [1.0, 0.7, 0.15, 0.05]);
    const cloudColor = new THREE.Color(cloudR, cloudG, cloudB);
    
    const cloudSpeed = interpolate(env.totalProgress, [0, 0.5, 1], [0.8, 1.2, 2.0]);
    
    // Дождь начинается в Акте 3 (0.5)
    const rainIntensity = interpolate(env.totalProgress, [0.45, 0.55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    
    // Гроза начинается в Акте 4 (0.75)
    const stormIntensity = interpolate(env.totalProgress, [0.70, 0.85, 1], [0, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    /* ---- FOG DISTANCE ---- */
    // В лесу видимость меньше, в горах и ночью дальше
    const fogNear = interpolate(env.totalProgress, [0, 0.5, 1], [400, 600, 800]);
    const fogFar = interpolate(env.totalProgress, [0, 0.5, 1], [4000, 6000, 10000]);

    const maxX = (milestones.length - 1) * X_SPACING;

    return (
        <>
            <color attach="background" args={[skyColor.r, skyColor.g, skyColor.b]} />
            <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

            <ambientLight intensity={ambientIntensity} />
            <directionalLight position={[20, 80, 40]} intensity={mainLightIntensity} color={mainLightColor} />
            <directionalLight position={[-15, 50, -20]} intensity={0.4} color="#E0F2FE" />

            <CorridorReliefGround maxX={maxX} groundY={GROUND_Y} />
            
            {/* Winding Steam Trains (Живая ЖД-сеть) */}
            <TrainLane startX={0} endX={maxX * 0.5} frame={frame} seed={42} speed={0.7} maxX={maxX} direction={1} />
            <TrainLane startX={0} endX={maxX * 0.5} frame={frame} seed={57} speed={0.8} maxX={maxX} direction={-1} />
            
            <TrainLane startX={maxX * 0.4} endX={maxX} frame={frame} seed={84} speed={0.9} maxX={maxX} direction={1} />
            <TrainLane startX={maxX * 0.4} endX={maxX} frame={frame} seed={99} speed={0.85} maxX={maxX} direction={-1} />
            
            <TrainLane startX={0} endX={maxX} frame={frame} seed={111} speed={1.0} maxX={maxX} direction={-1} />
            
            {/* Лес исчезает */}
            {forestOpacity > 0.01 && (
                <group scale={[1, forestOpacity, 1]}>
                    <ForestBackdrop maxX={maxX} groundY={GROUND_Y} />
                </group>
            )}
            
            {/* Горы всегда на горизонте */}
            <HorizonMountainRidge groundY={GROUND_Y} />

            <Sun progress={env.totalProgress} />
            
            <Clouds
                clouds={clouds}
                frame={frame}
                speedMultiplier={cloudSpeed}
                color={cloudColor}
                globalOpacity={1}
                stormIntensity={stormIntensity}
            />

            {/* Weather */}
            {rainIntensity > 0 && (
                <StormRainLayer frame={frame} progress={rainIntensity} maxX={maxX} />
            )}
            
            {stormIntensity > 0 && (
                <StormLightningBursts
                    frame={frame}
                    progress={stormIntensity}
                    anchors={clouds}
                    cloudSpeedMultiplier={cloudSpeed}
                    groundY={GROUND_Y}
                />
            )}

            {/* Finale effects */}
            {env.act === 4 && <Fireworks frame={frame} />}
        </>
    );
};
