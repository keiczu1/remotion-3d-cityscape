import { memo, useMemo } from "react";
import { useCurrentFrame, random, interpolate } from "remotion";
import * as THREE from "three";

import {
    LowPolyCloud,
    SteamTrainLine,
    HighwayRibbon,
    StormLightningBursts,
    StormRainLayer,
    BackgroundAirTraffic,
} from "../../../lib/ranking-corridor/art";
import { LocalCorridorReliefGround, localGetCorridorReliefHeight } from "./LocalCorridorReliefGround";
import { LocalCitySkyline, LocalHorizonMountainRidge } from "./LocalBackdrops";
import {LocalMixedVegetation, LocalTrafficOverlay} from "./LocalLivingBackdrop";
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
            const worldY = GROUND_Y + localGetCorridorReliefHeight({ worldX, worldZ, maxX }) + 1.5;

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
   CLOUD ENGINE
   ============================================================ */

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
    const flashCarrier = frame * (0.018 + cloud.speed * 0.025) + cloud.id * 1.37;
    const flashEnvelope = Math.max(
        0,
        Math.sin(flashCarrier) * 0.7 + Math.sin(flashCarrier * 2.1 + cloud.id) * 0.45 - 0.9,
    );
    const flashIntensity = stormIntensity * flashEnvelope * (cloud.scale / 5) * 1.8;

    return (
        <group position={[loopedX, cloud.y, cloud.z]} scale={cloud.scale}>
            <LowPolyCloud opacity={cloud.opacity * globalOpacity} color={color} flashIntensity={flashIntensity} />
            {flashIntensity > 0 ? (
                <pointLight intensity={flashIntensity * 30} distance={1500} color="#E0F2FE" />
            ) : null}
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
    maxVisibleClouds = clouds.length,
}: {
    clouds: readonly CloudDescriptor[];
    frame: number;
    speedMultiplier: number;
    color: THREE.Color;
    globalOpacity?: number;
    stormIntensity?: number;
    maxVisibleClouds?: number;
}) => {
    return (
        <group>
            {clouds.slice(0, maxVisibleClouds).map((cloud, i) => (
                <CloudEntity key={i} cloud={cloud} frame={frame} speedMultiplier={speedMultiplier} color={color} globalOpacity={globalOpacity} stormIntensity={stormIntensity} />
            ))}
        </group>
    );
};

/* ============================================================
   FIREWORKS
   ============================================================ */

const Fireworks = ({ frame }: { frame: number }) => {
    const finaleStart = FINALE_FRAME;
    const localFrame = frame - finaleStart;
    const lastMs = milestones[milestones.length - 1];
    const anchorX = lastMs.xCenter;
    const anchorY = lastMs.yCenter;

    const bursts = useMemo(() => {
        const arr: FireworkBurst[] = [];
        for (let wave = 0; wave < 10; wave++) {
            const particleGroups = new Map<string, FireworkParticle[]>();
            const isMixed = random(`fw-mix-${wave}`) > 0.6;
            const primaryColor = FIREWORK_COLORS[Math.floor(random(`fw-pc-${wave}`) * FIREWORK_COLORS.length)];
            const secondaryColor = FIREWORK_COLORS[Math.floor(random(`fw-sc-${wave}`) * FIREWORK_COLORS.length)];

            for (let p = 0; p < 56; p++) {
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

            arr.push({
                startFrame: wave * 45 + Math.floor(random(`fw-sf-${wave}`) * 10),
                offsetX: (random(`fw-ox-${wave}`) - 0.5) * 60,
                offsetY: 15 + random(`fw-oy-${wave}`) * 30,
                flickerPhase: random(`fw-fl-${wave}`) * Math.PI * 2,
                particleGroups: Array.from(particleGroups, ([color, particles]) => ({ color, particles })),
            });
        }
        return arr;
    }, []);

    if (localFrame < 10 || localFrame > 600) {
        return null;
    }

    return (
        <group position={[anchorX, anchorY, 10]}>
            {bursts.map((burst, bi) => {
                const burstLocal = localFrame - burst.startFrame;
                if (burstLocal < 0 || burstLocal > 120) {
                    return null;
                }

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
                        {flashOpacity > 0 ? (
                            <mesh geometry={fireworkGeo} scale={interpolate(burstLocal, [0, 15], [1, 20])}>
                                <meshBasicMaterial color="#FFFFFF" transparent opacity={flashOpacity * 0.8} depthWrite={false} />
                            </mesh>
                        ) : null}
                        {burst.particleGroups.map((group) => {
                            const matrices = group.particles.map((particle) => {
                                const dist = easedT * particle.baseSpeed * maxDist;
                                return composeInstanceMatrix({
                                    position: [
                                        particle.vx * dist,
                                        particle.vy * dist + particle.baseSpeed * easedT * 10 - gravityDrop,
                                        particle.vz * dist,
                                    ],
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

const Sun = ({ progress }: { progress: number }) => {
    const sunOpacity = interpolate(progress, [0, 0.25, 0.3], [1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sunX = interpolate(progress, [0, 0.3], [-2000, 3000]);
    const sunY = interpolate(progress, [0, 0.3], [3000, 300]);
    const sunZ = -8000;

    if (sunOpacity <= 0) {
        return null;
    }

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

    const skyR = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.42, 0.3, 0.12, 0.04, 0.015]);
    const skyG = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.58, 0.38, 0.17, 0.06, 0.018]);
    const skyB = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.72, 0.48, 0.26, 0.12, 0.045]);
    const skyColor = new THREE.Color(skyR, skyG, skyB);
    const fogColor = skyColor.clone();

    const mainLightIntensity = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [1.25, 0.88, 0.36, 0.12, 0.1]);
    const mainLightColor = new THREE.Color(
        interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.95, 0.85, 0.74, 0.66, 0.62]),
        interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.98, 0.88, 0.76, 0.7, 0.68]),
        interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [1.0, 0.96, 0.9, 0.86, 0.84]),
    );
    const ambientIntensity = interpolate(env.totalProgress, [0, 0.25, 0.5, 0.75, 1], [0.7, 0.55, 0.28, 0.13, 0.12]);
    const vegetationOpacity = interpolate(env.totalProgress, [0.42, 0.7], [1, 0.68], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cloudColor = new THREE.Color(
        interpolate(env.totalProgress, [0, 0.25, 0.75, 1], [0.82, 0.58, 0.16, 0.06]),
        interpolate(env.totalProgress, [0, 0.25, 0.75, 1], [0.9, 0.64, 0.18, 0.06]),
        interpolate(env.totalProgress, [0, 0.25, 0.75, 1], [0.96, 0.74, 0.24, 0.08]),
    );
    const cloudSpeed = interpolate(env.totalProgress, [0, 0.5, 1], [0.8, 1.2, 2.0]);
    const rainIntensity = interpolate(env.totalProgress, [0.45, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const stormIntensity = interpolate(env.totalProgress, [0.7, 0.85, 1], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fogNear = interpolate(env.totalProgress, [0, 0.5, 1], [360, 560, 760]);
    const fogFar = interpolate(env.totalProgress, [0, 0.5, 1], [3600, 5600, 9400]);
    const cityAccentIntensity = interpolate(env.totalProgress, [0, 0.45, 1], [0.08, 0.18, 0.32]);

    const maxX = (milestones.length - 1) * X_SPACING;
    const showHighway = true;
    const showCity = env.act <= 2;
    const showMountains = env.act >= 3;
    const showStormSystems = env.act >= 3;
    const showTrainAct = env.act >= 3;
    const extraTrainLane = false;
    const visibleCloudCount = env.act === 1 ? 22 : env.act === 2 ? 30 : env.act === 3 ? 40 : 36;
    const cloudOpacity = env.act === 1 ? 0.92 : env.act === 2 ? 0.96 : 1;

    return (
        <>
            <color attach="background" args={[skyColor.r, skyColor.g, skyColor.b]} />
            <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

            <ambientLight intensity={ambientIntensity} />
            <directionalLight position={[20, 80, 40]} intensity={mainLightIntensity} color={mainLightColor} />
            <directionalLight position={[-15, 50, -20]} intensity={0.45} color="#BAE6FD" />
            <pointLight position={[env.focusedX, 85, -900]} intensity={cityAccentIntensity} distance={1300} color="#FDE68A" />

            <LocalCorridorReliefGround
                maxX={maxX}
                groundY={GROUND_Y}
                terrainColor="#A9B9BE"
                rockColor="#6E7D83"
                puddleColor="#4FB3C7"
                puddleOpacity={0.22}
            />

            {showTrainAct ? (
                <>
                    <TrainLane startX={maxX * 0.4} endX={maxX} frame={frame} seed={84} speed={0.9} maxX={maxX} direction={1} />
                    <TrainLane startX={maxX * 0.4} endX={maxX} frame={frame} seed={99} speed={0.85} maxX={maxX} direction={-1} />
                    {extraTrainLane ? (
                        <TrainLane startX={maxX * 0.5} endX={maxX} frame={frame} seed={111} speed={1.0} maxX={maxX} direction={-1} />
                    ) : null}
                </>
            ) : null}

            {showHighway ? <HighwayRibbon frame={frame} groundY={GROUND_Y} /> : null}
            {showHighway ? <LocalTrafficOverlay frame={frame} groundY={GROUND_Y} /> : null}

            {vegetationOpacity > 0.01 ? (
                <group scale={[1, vegetationOpacity, 1]}>
                    <LocalMixedVegetation maxX={maxX} groundY={GROUND_Y} />
                </group>
            ) : null}

            {showCity ? <LocalCitySkyline maxX={maxX} groundY={GROUND_Y} /> : null}
            {showMountains ? <LocalHorizonMountainRidge maxX={maxX} groundY={GROUND_Y} /> : null}

            <Sun progress={env.totalProgress} />

            <Clouds
                clouds={clouds}
                frame={frame}
                speedMultiplier={cloudSpeed}
                color={cloudColor}
                globalOpacity={cloudOpacity}
                stormIntensity={showStormSystems ? stormIntensity : 0}
                maxVisibleClouds={visibleCloudCount}
            />

            {showStormSystems && rainIntensity > 0 ? (
                <StormRainLayer frame={frame} progress={rainIntensity} maxX={maxX} />
            ) : null}

            {showStormSystems && stormIntensity > 0 ? (
                <StormLightningBursts
                    frame={frame}
                    progress={stormIntensity}
                    anchors={clouds}
                    cloudSpeedMultiplier={cloudSpeed}
                    groundY={GROUND_Y}
                />
            ) : null}

            <BackgroundAirTraffic />

            {env.act === 4 ? <Fireworks frame={frame} /> : null}
        </>
    );
};
