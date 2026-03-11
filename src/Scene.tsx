import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig, random, spring, interpolate, delayRender, continueRender, staticFile } from "remotion";
import { data } from "./data";
import { useMemo, Suspense, useState, useEffect } from "react";
import * as THREE from "three";
import { Text, RoundedBox } from "@react-three/drei";
import { useThree, useLoader } from "@react-three/fiber";

// --- GLOBAL CACHE FOR PERFORMANCE ---
const sharedBoxGeo = new THREE.BoxGeometry(20, 32, 0.4);
const sharedEdgesGeo = new THREE.EdgesGeometry(sharedBoxGeo);
const treeTrunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 4, 7);
const treeTrunkMat = new THREE.MeshStandardMaterial({ color: "#8B5A2B", roughness: 0.9 });
const treeLeavesGeo = new THREE.DodecahedronGeometry(3, 0);
const treeLeavesMat = new THREE.MeshStandardMaterial({ color: "#4CAF50", roughness: 0.8 });
const cloudGeo = new THREE.SphereGeometry(1, 6, 6);

// Use all 40 items and reverse them so rank 40 is first, layout from left to right
const reversedData = [...data].reverse();

export function formatVisits(visits: number): string {
    if (visits >= 1e9) {
        return (visits / 1e9).toFixed(1) + " B";
    }
    if (visits >= 1e6) {
        return (visits / 1e6).toFixed(1) + " M";
    }
    return visits.toString();
}

const X_SPACING = 30;
const TOWER_WIDTH = 12;
const TOWER_DEPTH = 10;
const BASE_HEIGHT = 15;
const TOWER_ROW_Z = 10;
const GROUND_Y = -0.02;
const CINEMATIC_RAMP_FRAMES = 300;
const CINEMATIC_OVERVIEW_FRAMES = 540;
const CINEMATIC_TURN_FRAMES = 180;
const CINEMATIC_RETURN_FRAMES = 600;
const FINAL_CINEMATIC_FRAMES =
    CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES + CINEMATIC_TURN_FRAMES + CINEMATIC_RETURN_FRAMES;

const getMilestones = () => {
    let frame = 0;
    const milestones: { arriveFrame: number; leaveFrame: number; xCenter: number; yCenter: number; index: number }[] = [];
    for (let i = 0; i < reversedData.length; i++) {
        const item = reversedData[i];

        // SIGNIFICANTLY LONGER PAUSE: 320 frames (~5.3 seconds)
        // This extends the video length and allows for slower, non-rushed presentation
        const moveFrames = i === 0 ? 0 : 80;
        const pauseFrames = 320;              

        const arriveFrame = frame + moveFrames;
        const leaveFrame = arriveFrame + pauseFrames;

        // Massive exponential scale difference to feel the volume, making top towers absolutely colossal
        const scaledHeight = Math.pow(item.relHeight, 1.45) * 6.5;
        const height = Math.max(scaledHeight, 3);

        milestones.push({
            index: i,
            arriveFrame,
            leaveFrame,
            xCenter: i * X_SPACING,
            yCenter: height + 20 // Target the hologram center which is above the tower
        });
        frame = leaveFrame;
    }

    const lastArrive = milestones[milestones.length - 1].leaveFrame;

    return { milestones, durationInFrames: lastArrive + FINAL_CINEMATIC_FRAMES + 60 };
};

export const { milestones, durationInFrames } = getMilestones();
export const sequenceCompleteFrame = milestones[milestones.length - 1].leaveFrame;

const CAMERA_SWEEP_X_OFFSET = 24;
const CAMERA_SWEEP_Z_OFFSET = 16;
const CAMERA_ORBIT_X_RADIUS = 10;
const CAMERA_ORBIT_Z_RADIUS = 6;
const CAMERA_ORBIT_LOOK_X_RADIUS = 3;
const CAMERA_ORBIT_HOLD_FRAMES = 45;

export function getCameraState(frame: number) {
    function getMilestoneState(m: typeof milestones[0], localFrame = 0) {
        const totalPause = m.leaveFrame - m.arriveFrame;
        const orbitFrames = Math.max(1, totalPause - CAMERA_ORBIT_HOLD_FRAMES);
        const orbitProgress =
            localFrame <= CAMERA_ORBIT_HOLD_FRAMES
                ? 0
                : Math.min(1, (localFrame - CAMERA_ORBIT_HOLD_FRAMES) / orbitFrames);
        const orbitAngle = -0.6 + orbitProgress * 1.0;
        const orbitX = Math.sin(orbitAngle) * CAMERA_ORBIT_X_RADIUS;
        const orbitZ = (Math.cos(orbitAngle) - Math.cos(-0.6)) * CAMERA_ORBIT_Z_RADIUS;
        const orbitLookX = Math.sin(orbitAngle) * CAMERA_ORBIT_LOOK_X_RADIUS;

        return {
            camX: m.xCenter + CAMERA_SWEEP_X_OFFSET + orbitX,
            camY: m.yCenter + 2,
            lookX: m.xCenter + orbitLookX,
            lookY: m.yCenter,
            camZOffset: CAMERA_SWEEP_Z_OFFSET + orbitZ
        };
    }

    if (frame <= milestones[0].arriveFrame) {
        return getMilestoneState(milestones[0]);
    }

    const last = milestones[milestones.length - 1];
    if (frame >= last.leaveFrame) {
        return getMilestoneState(last);
    }

    for (let i = 0; i < milestones.length; i++) {
        const cur = milestones[i];
        
        if (frame >= cur.arriveFrame && frame <= cur.leaveFrame) {
            return getMilestoneState(cur, frame - cur.arriveFrame);
        }

        if (i < milestones.length - 1) {
            const next = milestones[i + 1];
            if (frame > cur.leaveFrame && frame < next.arriveFrame) {
                const p = (frame - cur.leaveFrame) / (next.arriveFrame - cur.leaveFrame);
                // Smooth step easing for flyways as well
                const eased = p * p * (3 - 2 * p);
                const startState = getMilestoneState(cur, cur.leaveFrame - cur.arriveFrame);
                const endState = getMilestoneState(next, 0);
                
                return {
                    camX: startState.camX + (endState.camX - startState.camX) * eased,
                    camY: startState.camY + (endState.camY - startState.camY) * eased,
                    lookX: startState.lookX + (endState.lookX - startState.lookX) * eased,
                    lookY: startState.lookY + (endState.lookY - startState.lookY) * eased,
                    camZOffset: startState.camZOffset + (endState.camZOffset - startState.camZOffset) * eased
                };
            }
        }
    }
    
    return getMilestoneState(last);
}

export function getSceneLayoutMetrics() {
    return {
        towerRange: [TOWER_ROW_Z - TOWER_DEPTH / 2, TOWER_ROW_Z + TOWER_DEPTH / 2] as const,
        roadRange: null,
    };
}

type CinematicCameraState = {
    camX: number;
    camY: number;
    camZ: number;
    lookX: number;
    lookY: number;
    lookZ: number;
};

export function getCinematicCameraState(cinematicFrame: number): CinematicCameraState {
    const firstMilestone = milestones[0];
    const lastMilestone = milestones[milestones.length - 1];
    const startState = getCameraState(lastMilestone.leaveFrame);

    const rampTarget: CinematicCameraState = {
        camX: lastMilestone.xCenter + 120,
        camY: 260,
        camZ: 340,
        lookX: lastMilestone.xCenter - 50,
        lookY: 78,
        lookZ: 0
    };
    const overviewEnd: CinematicCameraState = {
        camX: firstMilestone.xCenter - 70,
        camY: 225,
        camZ: 290,
        lookX: firstMilestone.xCenter + 80,
        lookY: 62,
        lookZ: 0
    };
    const returnStart: CinematicCameraState = {
        camX: firstMilestone.xCenter - 50,
        camY: 120,
        camZ: 185,
        lookX: firstMilestone.xCenter + 30,
        lookY: 48,
        lookZ: 0
    };
    const returnEnd: CinematicCameraState = {
        camX: lastMilestone.xCenter + 80,
        camY: 132,
        camZ: 165,
        lookX: lastMilestone.xCenter - 40,
        lookY: 56,
        lookZ: 0
    };

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES) {
        const rampProgress = Math.min(1, cinematicFrame / CINEMATIC_RAMP_FRAMES);
        const speedRamp = rampProgress < 0.4
            ? (rampProgress / 0.4) * 0.9
            : 0.9 + ((rampProgress - 0.4) / 0.6) * 0.1;
        const t = speedRamp * speedRamp * (3 - 2 * speedRamp);

        return {
            camX: interpolate(t, [0, 1], [startState.camX, rampTarget.camX]),
            camY: interpolate(t, [0, 1], [startState.camY, rampTarget.camY]),
            camZ: interpolate(t, [0, 1], [55 + startState.camZOffset, rampTarget.camZ]),
            lookX: interpolate(t, [0, 1], [startState.lookX, rampTarget.lookX]),
            lookY: interpolate(t, [0, 1], [startState.lookY, rampTarget.lookY]),
            lookZ: interpolate(t, [0, 1], [10, rampTarget.lookZ])
        };
    }

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES) {
        const overviewFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES;
        const progress = Math.min(1, overviewFrame / CINEMATIC_OVERVIEW_FRAMES);
        const eased = progress * progress * (3 - 2 * progress);
        const glideY = Math.sin(progress * Math.PI) * 18;
        const glideZ = Math.sin(progress * Math.PI * 1.2) * 16;

        return {
            camX: interpolate(eased, [0, 1], [rampTarget.camX, overviewEnd.camX]),
            camY: interpolate(eased, [0, 1], [rampTarget.camY, overviewEnd.camY]) + glideY,
            camZ: interpolate(eased, [0, 1], [rampTarget.camZ, overviewEnd.camZ]) + glideZ,
            lookX: interpolate(eased, [0, 1], [rampTarget.lookX, overviewEnd.lookX]),
            lookY: interpolate(eased, [0, 1], [rampTarget.lookY, overviewEnd.lookY]),
            lookZ: 0
        };
    }

    if (cinematicFrame <= CINEMATIC_RAMP_FRAMES + CINEMATIC_OVERVIEW_FRAMES + CINEMATIC_TURN_FRAMES) {
        const turnFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES - CINEMATIC_OVERVIEW_FRAMES;
        const progress = Math.min(1, turnFrame / CINEMATIC_TURN_FRAMES);
        const eased = progress * progress * (3 - 2 * progress);

        return {
            camX: interpolate(eased, [0, 1], [overviewEnd.camX, returnStart.camX]),
            camY: interpolate(eased, [0, 1], [overviewEnd.camY, returnStart.camY]),
            camZ: interpolate(eased, [0, 1], [overviewEnd.camZ, returnStart.camZ]),
            lookX: interpolate(eased, [0, 1], [overviewEnd.lookX, returnStart.lookX]),
            lookY: interpolate(eased, [0, 1], [overviewEnd.lookY, returnStart.lookY]),
            lookZ: 0
        };
    }

    const returnFrame = cinematicFrame - CINEMATIC_RAMP_FRAMES - CINEMATIC_OVERVIEW_FRAMES - CINEMATIC_TURN_FRAMES;
    const returnProgress = Math.min(1, returnFrame / CINEMATIC_RETURN_FRAMES);
    const eased = returnProgress * returnProgress * (3 - 2 * returnProgress);
    const swayY = Math.sin(returnProgress * Math.PI * 1.5) * 10;
    const swayZ = Math.sin(returnProgress * Math.PI) * 14;
    const leadLookX = Math.sin(returnProgress * Math.PI) * 12;

    return {
        camX: interpolate(eased, [0, 1], [returnStart.camX, returnEnd.camX]),
        camY: interpolate(eased, [0, 1], [returnStart.camY, returnEnd.camY]) + swayY,
        camZ: interpolate(eased, [0, 1], [returnStart.camZ, returnEnd.camZ]) + swayZ,
        lookX: interpolate(eased, [0, 1], [returnStart.lookX, returnEnd.lookX]) + leadLookX,
        lookY: interpolate(eased, [0, 1], [returnStart.lookY, returnEnd.lookY]),
        lookZ: 0
    };
}

const Flag = ({ country, position }: { country: string, position: [number, number, number] }) => {
    const url = `https://flagcdn.com/w160/${country.toLowerCase()}.png`;
    const texture = useLoader(THREE.TextureLoader, url, (loader) => {
        loader.setCrossOrigin("anonymous");
    });
    const frame = useCurrentFrame();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uTexture: { value: texture }
    }), [texture]);

    // Update time smoothly for waviness
    uniforms.uTime.value = frame * 0.05;

    return (
        <mesh position={position} castShadow>
            <planeGeometry args={[6, 4, 16, 16]} />
            <shaderMaterial
                vertexShader={`
                    varying vec2 vUv;
                    uniform float uTime;
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        // wave effect: uv.x = 0 is left (pole), uv.x = 1 is right (edge)
                        float wave = sin(pos.x * 2.0 - uTime * 3.0) * uv.x * 1.5;
                        pos.z += wave;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform sampler2D uTexture;
                    varying vec2 vUv;
                    void main() {
                        gl_FragColor = texture2D(uTexture, vUv);
                    }
                `}
                uniforms={uniforms}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

const Favicon = ({ domain, yPos, zPos, opacity }: { domain: string, yPos: number, zPos: number, opacity: number }) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [handle] = useState(() => delayRender("Loading favicon " + domain));

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");

        // Load the locally downloaded favicon instead of making an external request
        // This is much faster and doesn't rely on CORS or external servers!
        const localUrl = staticFile(`favicons/${domain}.png`);

        loader.load(
            localUrl,
            (tex) => {
                // Fix washed out colors and pixelation in WebGL
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.generateMipmaps = true;

                setTexture(tex);
                continueRender(handle);
            },
            undefined,
            () => {
                console.warn(`Could not load favicon for ${domain}, skipping`);
                continueRender(handle);
            }
        );
    }, [domain, handle]);

    return (
        <group position={[0, yPos, zPos]}>
            {/* Cyan border glow to mimic real CSS border/box-shadow */}
            <RoundedBox args={[11, 11, 0.1]} radius={1.5} smoothness={2} position={[0, 0, -0.1]}>
                <meshBasicMaterial color="#00E5FF" transparent opacity={opacity * 0.8} />
            </RoundedBox>

            {/* White background with smooth rounded corners */}
            <RoundedBox args={[10, 10, 0.15]} radius={1.3} smoothness={2} position={[0, 0, -0.05]}>
                <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.95} />
            </RoundedBox>

            {/* Favicon texture properly scaled down to recreate CSS "padding" effect */}
            {texture && (
                <mesh position={[0, 0, 0.1]}>
                    <planeGeometry args={[7, 7]} />
                    <meshBasicMaterial map={texture} transparent opacity={opacity} />
                </mesh>
            )}
        </group>
    );
};

const assembleScramble = (text: string, progress: number, seed: string) => {
    if (progress >= 1) return text;
    if (progress <= 0) return "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*0123456789";
    return text.split('').map((char, i) => {
        if (char === ' ' || char === '.') return char;
        const charProgress = i / text.length;
        if (progress > charProgress + 0.15) return text[i];
        return chars[Math.floor(random(`${seed}-${i}-${Math.floor(progress * 20)}`) * chars.length)];
    }).join('');
};

const Shockwave = ({ frame, triggerFrame }: { frame: number, triggerFrame: number }) => {
    const activeFrame = frame - triggerFrame;
    if (activeFrame < 0 || activeFrame > 20) return null;
    const size = interpolate(activeFrame, [0, 20], [0, 40], { extrapolateRight: 'clamp' });
    const opacity = interpolate(activeFrame, [0, 15, 20], [1, 0.5, 0], { extrapolateRight: 'clamp' });
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[size * 0.8, size, 32]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={opacity} side={THREE.DoubleSide} />
        </mesh>
    );
};

const LaserStrike = ({ frame, triggerFrame }: { frame: number, triggerFrame: number }) => {
    const activeFrame = frame - triggerFrame;
    if (activeFrame < 0 || activeFrame > 15) return null;
    const opacity = interpolate(activeFrame, [0, 5, 15], [1, 1, 0], { extrapolateRight: 'clamp' });
    const scaleY = interpolate(activeFrame, [0, 5], [10, 0], { extrapolateRight: 'clamp' });
    return (
        <mesh position={[0, scaleY * 20, 0]}>
            <cylinderGeometry args={[2, 2, scaleY * 40, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
        </mesh>
    );
};

const HologramDashboard = ({ item, yPos, rank, arriveFrame, index }: { item: typeof data[0], yPos: number, rank: number, arriveFrame: number, index: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // DELAY: 25 frames of pure silence and suspense before ANYTHING happens
    const localFrame = frame - arriveFrame;
    const isReady = localFrame >= 25;
    const animFrame = Math.max(0, localFrame - 25);

    // Subtle float effect constantly happening
    const floatY = Math.sin(frame * 0.05 + yPos) * 0.5;
    const domainFontSize = Math.min(2.4, 30 / item.domain.length);
    const typeBadgeWidth = Math.max(7, item.type.length * 1.0 + 2.0);

    // Universal roulette/slot-machine scramble for domain, visits, and rank
    // DELAYED: Text starts spinning after 120 frames (~2 full seconds)
    const scrambleProgress = interpolate(animFrame, [120, 180], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const decodedDomain = assembleScramble(item.domain, scrambleProgress, `${index}-domain`);
    const decodedVisits = assembleScramble(formatVisits(item.monthlyVisits), scrambleProgress, `${index}-visits`);
    const decodedRank = assembleScramble(`#${rank}`, scrambleProgress, `${index}-rank`);

    if (!isReady) return null; // Complete invisibility during structural delay

    // --- LOD: During the final cinematic flyover, show full dashboard without complex animations ---
    // Now using GPU-based Favicon (texture on plane), so it's lightweight!
    const isCinematic = frame > sequenceCompleteFrame;
    if (isCinematic) {
        return (
            <group position={[0, yPos + floatY, 0]}>
                <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                    <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
                </RoundedBox>
                <lineSegments geometry={sharedEdgesGeo}>
                    <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
                </lineSegments>
                <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">
                    #{rank}
                </Text>
                <Suspense fallback={null}>
                    <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
                </Suspense>
                <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">
                    {item.domain}
                </Text>
                <Text position={[0, -9.5, 0.3]} color="#00FF9D" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">
                    {formatVisits(item.monthlyVisits)}
                </Text>
                <group position={[0, -13.5, 0.3]}>
                    <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                        <meshStandardMaterial color="#2563EB" transparent opacity={0.88} />
                    </RoundedBox>
                    <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">
                        {item.type.toUpperCase()}
                    </Text>
                </group>
            </group>
        );
    }

    const effectType = index % 5;

    // --- MODE 0: ORBITAL STRIKE ---
    if (effectType === 0) {
        const bgScaleX = interpolate(animFrame, [10, 20], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
        const textDropY = interpolate(animFrame, [20, 35], [50, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
        const rankDropY = interpolate(animFrame, [20, 35], [-50, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
        const opacity = interpolate(animFrame, [10, 15], [0, 0.88], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

        return (
            <group position={[0, yPos + floatY, 0]}>
                <LaserStrike frame={animFrame} triggerFrame={5} />
                <Shockwave frame={animFrame} triggerFrame={10} />

                <group scale={[bgScaleX, 1, 1]}>
                    <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                        <meshStandardMaterial color="#0A1128" transparent opacity={opacity} />
                    </RoundedBox>
                    <lineSegments geometry={sharedEdgesGeo}>
                        <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={opacity * 0.7} />
                    </lineSegments>
                </group>

                <Text position={[0, 12 + rankDropY, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={opacity / 0.88}>
                    {decodedRank}
                </Text>

                <group position={[0, textDropY, 0]}>
                    <Suspense fallback={null}>
                        {animFrame > 20 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}
                    </Suspense>
                    <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={opacity / 0.88}>
                        {decodedDomain}
                    </Text>
                    <Text position={[0, -9.5, 0.3]} color="#00FF9D" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={opacity / 0.88}>
                        {decodedVisits}
                    </Text>
                    <group position={[0, -13.5, 0.3]}>
                        <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                            <meshStandardMaterial color="#2563EB" transparent opacity={opacity / 0.88} />
                        </RoundedBox>
                        <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold" fillOpacity={opacity / 0.88}>
                            {item.type.toUpperCase()}
                        </Text>
                    </group>
                </group>
            </group>
        );
    }

    // --- MODE 1: THE AXIS SPLIT ---
    if (effectType === 1) {
        // Pieces fly in from completely different extreme coordinates
        const bgX = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 0)), config: { damping: 12 } });
        const outX = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 5)), config: { damping: 12 } });
        const textY = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 15)), config: { damping: 15 } });
        const favZ = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 25)), config: { damping: 15 } });

        const posX_bg = (1 - bgX) * -100;
        const posX_out = (1 - outX) * 100;
        const posZ_fav = (1 - favZ) * 200;
        const posY_txt = (1 - textY) * 100;

        return (
            <group position={[0, yPos + floatY, 0]}>
                <group position={[posX_bg, 0, 0]}>
                    <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                        <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
                    </RoundedBox>
                </group>

                <group position={[posX_out, 0, 0]}>
                    <lineSegments geometry={sharedEdgesGeo}>
                        <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
                    </lineSegments>
                </group>

                {animFrame > 25 && (
                    <group position={[0, 0, posZ_fav]}>
                        <Suspense fallback={null}>
                            <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
                        </Suspense>
                    </group>
                )}

                <group position={[0, posY_txt, 0]}>
                    <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">{decodedRank}</Text>
                    <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">{decodedDomain}</Text>
                    <Text position={[0, -9.5, 0.3]} color="#00FF9D" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">{decodedVisits}</Text>
                    <group position={[0, -13.5, 0.3]}>
                        <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}><meshStandardMaterial color="#2563EB" /></RoundedBox>
                        <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">{item.type.toUpperCase()}</Text>
                    </group>
                </group>
            </group>
        );
    }

    // --- MODE 2: MATRIX DATA DECODE ---
    if (effectType === 2) {
        const scale = spring({ fps, frame: Math.min(150, animFrame), config: { damping: 14, mass: 1.5 } });
        const progress = interpolate(animFrame, [15, 60], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

        const decodedDomain = assembleScramble(item.domain.toUpperCase(), progress, `${index}-domain`);
        const decodedVisits = assembleScramble(formatVisits(item.monthlyVisits), progress, `${index}-visits`);

        return (
            <group position={[0, yPos + floatY, 0]} scale={scale}>
                <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                    <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
                </RoundedBox>
                <lineSegments geometry={sharedEdgesGeo}>
                    <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
                </lineSegments>

                <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">{decodedRank}</Text>

                <Suspense fallback={null}>
                    {animFrame > 40 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}
                </Suspense>

                <Text position={[0, -5, 0.3]} color="#00FF9D" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">
                    {decodedDomain}
                </Text>
                <Text position={[0, -9.5, 0.3]} color="#ffffff" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">
                    {decodedVisits}
                </Text>

                {animFrame > 50 && (
                    <group position={[0, -13.5, 0.3]}>
                        <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}><meshStandardMaterial color="#2563EB" /></RoundedBox>
                        <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">{item.type.toUpperCase()}</Text>
                    </group>
                )}
            </group>
        );
    }

    // --- MODE 3: SUBSPACE TEAR (Portal) ---
    if (effectType === 3) {
        const holeScale = interpolate(animFrame, [0, 15, 45, 60], [0, 25, 25, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
        const holeRot = animFrame * 0.1;
        const pushZ = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 15)), config: { mass: 2, damping: 10 } });
        const finalZ = interpolate(pushZ, [0, 1], [-50, 0]);
        const holeOpacity = interpolate(animFrame, [45, 60], [1, 0], { extrapolateRight: 'clamp' });

        return (
            <group position={[0, yPos + floatY, 0]}>
                {animFrame < 60 && (
                    <mesh position={[0, 0, -2]} rotation={[0, 0, holeRot]} scale={[holeScale, holeScale, 1]}>
                        <torusGeometry args={[1, 0.2, 16, 50]} />
                        <meshBasicMaterial color="#a855f7" transparent opacity={holeOpacity} />
                    </mesh>
                )}
                {animFrame > 15 && (
                    <group position={[0, 0, finalZ]} scale={Math.min(1, pushZ * 1.5)}>
                        <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                            <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
                        </RoundedBox>
                        <lineSegments geometry={sharedEdgesGeo}>
                            <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
                        </lineSegments>
                        <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">{decodedRank}</Text>
                        <Suspense fallback={null}>
                            <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
                        </Suspense>
                        <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">{decodedDomain}</Text>
                        <Text position={[0, -9.5, 0.3]} color="#00FF9D" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">{decodedVisits}</Text>
                        <group position={[0, -13.5, 0.3]}>
                            <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}><meshStandardMaterial color="#2563EB" /></RoundedBox>
                            <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">{item.type.toUpperCase()}</Text>
                        </group>
                    </group>
                )}
            </group>
        );
    }

    // --- MODE 4: SEQUENTIAL PRINTER ---
    if (effectType === 4) {
        // Elements pop in one by one top to bottom sequentially
        return (
            <group position={[0, yPos + floatY, 0]}>
                <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                    <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
                </RoundedBox>
                <lineSegments geometry={sharedEdgesGeo}>
                    <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
                </lineSegments>

                {animFrame > 10 && <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">{decodedRank}</Text>}
                {animFrame > 20 && <Suspense fallback={null}><Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} /></Suspense>}
                {animFrame > 30 && <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">{decodedDomain}</Text>}
                {animFrame > 40 && <Text position={[0, -9.5, 0.3]} color="#00FF9D" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">{decodedVisits}</Text>}

                {animFrame > 50 && (
                    <group position={[0, -13.5, 0.3]}>
                        <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}><meshStandardMaterial color="#2563EB" /></RoundedBox>
                        <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">{item.type.toUpperCase()}</Text>
                    </group>
                )}

                {animFrame < 60 && (
                    <mesh position={[0, 16 - (animFrame / 60) * 32, 0.5]}>
                        <boxGeometry args={[22, 0.5, 2]} />
                        <meshBasicMaterial color="#00E5FF" transparent opacity={0.8} />
                    </mesh>
                )}
            </group>
        );
    }

    return null;
};

// --- GLOBAL CACHE FOR FLYING OBJECTS ---
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
            [0, 0, 0], [-2, 0, -2], [-2, 0, 2], [-4, 0, -4], [-4, 0, 4], [-6, 0, -6], [-6, 0, 6]
        ];
        return vShape.map((pos, i) => ({
            offsetX: pos[0] + (random(`b-x-${i}`) - 0.5) * 1,
            offsetY: pos[1] + (random(`b-y-${i}`) - 0.5) * 1,
            offsetZ: pos[2] + (random(`b-z-${i}`) - 0.5) * 1,
            flapSpeed: 0.3 + random(`b-f-${i}`) * 0.1,
            flapOffset: random(`b-fo-${i}`) * Math.PI * 2
        }));
    }, []);

    const loopDuration = 2500;
    const localFrame = frame % loopDuration;
    const baseX = interpolate(localFrame, [0, loopDuration], [1500, -300]);
    const baseZ = interpolate(localFrame, [0, loopDuration], [-40, -60]);
    const baseY = 45 + Math.sin(localFrame * 0.01) * 8;

    return (
        <group position={[baseX, baseY, baseZ]} rotation={[0, -Math.PI / 2, 0]}>
            {birds.map((b, i) => {
                const flap = Math.sin(frame * b.flapSpeed + b.flapOffset);
                return (
                    <group key={i} position={[b.offsetX, b.offsetY + Math.sin(frame * 0.05 + i), b.offsetZ]}>
                        <mesh position={[0.5, 0, 0.5]} rotation={[flap * 0.5, -0.5, 0]} geometry={birdWingGeo} material={birdMat} />
                        <mesh position={[0.5, 0, -0.5]} rotation={[-flap * 0.5, 0.5, 0]} geometry={birdWingGeo} material={birdMat} />
                    </group>
                )
            })}
        </group>
    );
};

const LowPolyTree = ({ position, scale, index, frame }: { position: [number, number, number], scale: number, index: number, frame: number }) => {
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
                speed: 0.1 + random(`c-v-${i}`) * 0.2
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {clouds.map((c, i) => {
                const xPos = c.x - frame * c.speed;
                const width = 2500;
                const loopedX = ((xPos % width) + width) % width - 500;

                return (
                    <group key={i} position={[loopedX, c.y, c.z]} scale={c.scale}>
                        <CloudShape opacity={c.opacity} />
                    </group>
                );
            })}
        </group>
    );
};

const skylineGeo = new THREE.BoxGeometry(1, 1, 1);
const skylineMatFar = new THREE.MeshStandardMaterial({ color: "#64748B", roughness: 0.9, flatShading: true });
const skylineMatMid = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.9, flatShading: true });

const CitySkyline = () => {
    const buildings = useMemo(() => {
        const arr = [];
        for (let i = -40; i < 150; i++) {
            // Far layer
            arr.push({
                x: i * 80 + random(`sky-1-x-${i}`) * 60,
                z: -1800 - random(`sky-1-z-${i}`) * 400,
                w: 80 + random(`sky-1-w-${i}`) * 120,
                h: 400 + random(`sky-1-h-${i}`) * 600,
                d: 80 + random(`sky-1-d-${i}`) * 120,
                isFar: true
            });
            // Mid layer
            arr.push({
                x: i * 60 + random(`sky-2-x-${i}`) * 50,
                z: -1200 - random(`sky-2-z-${i}`) * 300,
                w: 60 + random(`sky-2-w-${i}`) * 100,
                h: 200 + random(`sky-2-h-${i}`) * 400,
                d: 60 + random(`sky-2-d-${i}`) * 100,
                isFar: false
            });
        }
        return arr;
    }, []);

    return (
        <group>
            {buildings.map((b, i) => (
                <mesh
                    key={i}
                    position={[b.x, b.h / 2, b.z]}
                    scale={[b.w, b.h, b.d]}
                    geometry={skylineGeo}
                    material={b.isFar ? skylineMatFar : skylineMatMid}
                />
            ))}
        </group>
    );
};

const BackgroundEnvironment = () => {
    const frame = useCurrentFrame();

    const trees = useMemo(() => {
        const arr = [];
        for (let i = -8; i < 45; i++) {
            arr.push({ x: i * 20 + random(`t-b-x-${i}`) * 10, z: -30 - random(`t-b-z-${i}`) * 20, scale: 1.5 + random(`t-b-s-${i}`) });
            arr.push({ x: i * 25 + random(`t-m-x-${i}`) * 12, z: -15 - random(`t-m-z-${i}`) * 5, scale: 1 + random(`t-m-s-${i}`) * 0.5 });
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

            {trees.map((t, idx) => (
                <LowPolyTree key={idx} index={idx} position={[t.x, 0, t.z]} scale={t.scale} frame={frame} />
            ))}

            <CitySkyline />
            <Clouds frame={frame} />
            <Birds frame={frame} />
            <Airplane frame={frame} />
        </group>
    );
};

const Tower = ({ item, index, arriveFrame }: { item: typeof data[0]; index: number; arriveFrame: number }) => {
    const frame = useCurrentFrame();
    const rank = 40 - index;
    const height = Math.max(Math.pow(item.relHeight, 1.45) * 6.5, 3);
    const xPos = index * X_SPACING;
    const isCinematic = frame > sequenceCompleteFrame;

    return (
        <group position={[xPos, 0, TOWER_ROW_Z]}>
            {/* Monolith Pedestal */}
            <RoundedBox args={[TOWER_WIDTH, height, TOWER_DEPTH]} position={[0, height / 2, 0]} radius={0.5} smoothness={2}>
                <meshStandardMaterial color="#0A0F1A" roughness={0.5} metalness={0.6} />
            </RoundedBox>

            {/* Huge Glow on top of the Pedestal (Base for hologram) */}
            <mesh position={[0, height + 0.5, 0]}>
                <cylinderGeometry args={[5, 5.5, 1, 32]} />
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.5} transparent opacity={0.7} />
            </mesh>

            {/* Projector Beams - hide during cinematic for perf */}
            {!isCinematic && (
                <mesh position={[0, height + 9, 0]}>
                    <cylinderGeometry args={[9, 5, 16, 32]} />
                    <meshStandardMaterial color="#00E5FF" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            )}

            {/* Floating Holographic Dashboard */}
            <HologramDashboard item={item} yPos={height + 20} rank={rank} arriveFrame={arriveFrame} index={index} />

            {/* Flag - hide during cinematic flyover to save perf (40 shader materials + textures!) */}
            {!isCinematic && (
                <>
                    <Suspense fallback={null}>
                        <Flag country={item.country} position={[12, height + 8, 0]} />
                    </Suspense>
                    <mesh position={[9, (height + 10) / 2, 0]}>
                        <cylinderGeometry args={[0.15, 0.15, height + 10]} />
                        <meshStandardMaterial color="#71717A" />
                    </mesh>
                    <mesh position={[9, height + 10, 0]}>
                        <sphereGeometry args={[0.3]} />
                        <meshStandardMaterial color="#FBBF24" />
                    </mesh>
                </>
            )}
        </group>
    );
};

const CameraUpdater = () => {
    const frame = useCurrentFrame();
    const { camera } = useThree();

    const lastMilestone = milestones[milestones.length - 1];
    const sequenceCompleteFrame = lastMilestone.leaveFrame;

    if (frame <= sequenceCompleteFrame) {
        // NORMAL TOWER-TO-TOWER LOGIC uses guaranteed continuous camera states
        const state = getCameraState(frame);

        // The camera distances and views the hologram directly, with dynamic Z offset for wide shots
        const distanceOut = 55 + (state.camZOffset || 0);

        // Smooth transition into position
        camera.position.set(state.camX, state.camY, distanceOut);
        
        // IMPORTANT: We make lookAt.x match camPosX or follow a linear path without centering
        // By syncing lookX to camX, the camera never rotates along the Y axis, it slides strictly right.
        camera.lookAt(state.lookX, state.lookY, 10);
    } else {
        const cinematicFrame = frame - sequenceCompleteFrame;
        const state = getCinematicCameraState(cinematicFrame);
        camera.position.set(state.camX, state.camY, state.camZ);
        camera.lookAt(state.lookX, state.lookY, state.lookZ);
    }

    return null;
};

export const Scene = () => {
    const { width, height } = useVideoConfig();

    return (
        <ThreeCanvas width={width} height={height} camera={{ position: [0, BASE_HEIGHT, 45], fov: 45, near: 1, far: 7000 }}>
            <color attach="background" args={["#87CEEB"]} />
            <fog attach="fog" args={["#87CEEB", 500, 4500]} />
            <BackgroundEnvironment />

            <group>
                {reversedData.map((item, i) => (
                    <Tower key={item.domain} item={item} index={i} arriveFrame={milestones[i].arriveFrame} />
                ))}
            </group>

            <CameraUpdater />
        </ThreeCanvas>
    );
};
