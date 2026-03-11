import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig, random, spring, interpolate, staticFile } from "remotion";
import { data } from "./data";
import { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { Text, RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
    BASE_HEIGHT,
    GROUND_Y,
    TOWER_DEPTH,
    TOWER_ROW_Z,
    TOWER_WIDTH,
    X_SPACING,
    getCameraState,
    getCameraTimelineFrame,
    getCinematicCameraState,
    getFocusedTowerIndex,
    getTowerHeight,
    getTowerRenderMode,
    milestones,
    reversedData,
    sequenceCompleteFrame,
    shouldPreloadTowerAssets,
    type TowerRenderMode,
} from "./scene-logic";

// --- GLOBAL CACHE FOR PERFORMANCE ---
const sharedBoxGeo = new THREE.BoxGeometry(20, 32, 0.4);
const sharedEdgesGeo = new THREE.EdgesGeometry(sharedBoxGeo);
const treeTrunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 4, 7);
const treeTrunkMat = new THREE.MeshStandardMaterial({ color: "#8B5A2B", roughness: 0.9 });
const treeLeavesGeo = new THREE.DodecahedronGeometry(3, 0);
const treeLeavesMat = new THREE.MeshStandardMaterial({ color: "#4CAF50", roughness: 0.8 });
const cloudGeo = new THREE.SphereGeometry(1, 6, 6);

export function formatVisits(visits: number): string {
    if (visits >= 1e9) {
        return (visits / 1e9).toFixed(1) + " B";
    }
    if (visits >= 1e6) {
        return (visits / 1e6).toFixed(1) + " M";
    }
    return visits.toString();
}
export { durationInFrames } from "./scene-logic";

type SharedTextureKind = "favicon" | "flag";

const sharedTextureLoader = new THREE.TextureLoader();
const sharedTextureCache = new Map<string, THREE.Texture>();
const sharedTexturePromises = new Map<string, Promise<THREE.Texture>>();

sharedTextureLoader.setCrossOrigin("anonymous");

const getFaviconTextureUrl = (domain: string) => staticFile(`favicons/${domain}.png`);
const getFlagTextureUrl = (country: string) => staticFile(`flags/${country.toLowerCase()}.png`);

const configureSharedTexture = (texture: THREE.Texture, kind: SharedTextureKind) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = kind === "favicon";
    texture.needsUpdate = true;
};

const loadSharedTexture = (url: string, kind: SharedTextureKind) => {
    const cachedTexture = sharedTextureCache.get(url);
    if (cachedTexture) {
        return Promise.resolve(cachedTexture);
    }

    const pendingTexture = sharedTexturePromises.get(url);
    if (pendingTexture) {
        return pendingTexture;
    }

    const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
        sharedTextureLoader.load(
            url,
            (texture) => {
                configureSharedTexture(texture, kind);
                sharedTextureCache.set(url, texture);
                resolve(texture);
            },
            undefined,
            (error) => reject(error),
        );
    }).finally(() => {
        sharedTexturePromises.delete(url);
    });

    sharedTexturePromises.set(url, texturePromise);

    return texturePromise;
};

const preloadSharedTexture = (url: string, kind: SharedTextureKind) => {
    void loadSharedTexture(url, kind).catch(() => undefined);
};

const useSharedTexture = (url: string, kind: SharedTextureKind) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(() => sharedTextureCache.get(url) ?? null);

    useEffect(() => {
        let cancelled = false;
        const cachedTexture = sharedTextureCache.get(url);

        if (cachedTexture) {
            setTexture(cachedTexture);
            return;
        }

        loadSharedTexture(url, kind)
            .then((loadedTexture) => {
                if (!cancelled) {
                    setTexture(loadedTexture);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setTexture(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [kind, url]);

    return texture;
};

const Flag = ({ country, position }: { country: string, position: [number, number, number] }) => {
    const texture = useSharedTexture(getFlagTextureUrl(country), "flag");
    const frame = useCurrentFrame();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uTexture: { value: texture }
    }), [texture]);

    if (!texture) {
        return null;
    }

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
    const texture = useSharedTexture(getFaviconTextureUrl(domain), "favicon");

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

const preloadTowerAssets = (index: number) => {
    const item = reversedData[index];
    if (!item) {
        return;
    }

    preloadSharedTexture(getFaviconTextureUrl(item.domain), "favicon");
    preloadSharedTexture(getFlagTextureUrl(item.country), "flag");
};

const SceneAssetPreloader = () => {
    const frame = useCurrentFrame();
    const focusedIndex = getFocusedTowerIndex(frame);
    const isCinematic = frame > sequenceCompleteFrame;

    useEffect(() => {
        if (isCinematic) {
            reversedData.forEach((_, index) => preloadTowerAssets(index));
            return;
        }

        for (let i = 0; i < reversedData.length; i++) {
            if (shouldPreloadTowerAssets(frame, i)) {
                preloadTowerAssets(i);
            }
        }
    }, [focusedIndex, frame, isCinematic]);

    return null;
};

const StaticDashboardCard = ({
    item,
    yPos,
    floatY,
    rank,
    domainFontSize,
    typeBadgeWidth,
}: {
    item: typeof data[0];
    yPos: number;
    floatY: number;
    rank: number;
    domainFontSize: number;
    typeBadgeWidth: number;
}) => {
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
            <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
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
};

const HologramDashboard = ({
    item,
    yPos,
    rank,
    arriveFrame,
    index,
    renderMode,
}: {
    item: typeof data[0];
    yPos: number;
    rank: number;
    arriveFrame: number;
    index: number;
    renderMode: TowerRenderMode;
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // DELAY: 25 frames of pure silence and suspense before ANYTHING happens
    const localFrame = frame - arriveFrame;
    const isReady = localFrame >= 25;
    const animFrame = Math.max(0, localFrame - 25);
    const isCinematic = frame > sequenceCompleteFrame;

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

    if (!isReady) {
        return null;
    }

    if (isCinematic || renderMode === "standby") {
        return (
            <StaticDashboardCard
                item={item}
                yPos={yPos}
                floatY={floatY}
                rank={rank}
                domainFontSize={domainFontSize}
                typeBadgeWidth={typeBadgeWidth}
            />
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
                    {animFrame > 20 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}
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
                        <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
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

                {animFrame > 40 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}

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
                        <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
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
                {animFrame > 20 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}
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
    const height = getTowerHeight(item.relHeight);
    const xPos = index * X_SPACING;
    const renderMode = getTowerRenderMode(frame, index);
    const showDashboard = renderMode !== "minimal";
    const showProjector = renderMode === "full";
    const showFlag = renderMode === "full";

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

            {/* Projector Beams only render in the active focus window */}
            {showProjector && (
                <mesh position={[0, height + 9, 0]}>
                    <cylinderGeometry args={[9, 5, 16, 32]} />
                    <meshStandardMaterial color="#00E5FF" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            )}

            {/* Floating Holographic Dashboard */}
            {showDashboard && (
                <HologramDashboard
                    item={item}
                    yPos={height + 20}
                    rank={rank}
                    arriveFrame={arriveFrame}
                    index={index}
                    renderMode={renderMode}
                />
            )}

            {/* Flag shader only stays live for the current focus tower window */}
            {showFlag && (
                <>
                    <Flag country={item.country} position={[12, height + 8, 0]} />
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
    const cameraFrame = getCameraTimelineFrame(frame);

    if (cameraFrame <= sequenceCompleteFrame) {
        // NORMAL TOWER-TO-TOWER LOGIC uses guaranteed continuous camera states
        const state = getCameraState(cameraFrame);

        // The camera distances and views the hologram directly, with dynamic Z offset for wide shots
        const distanceOut = 55 + (state.camZOffset || 0);

        // Smooth transition into position
        camera.position.set(state.camX, state.camY, distanceOut);
        
        // IMPORTANT: We make lookAt.x match camPosX or follow a linear path without centering
        // By syncing lookX to camX, the camera never rotates along the Y axis, it slides strictly right.
        camera.lookAt(state.lookX, state.lookY, 10);
    } else {
        const cinematicFrame = cameraFrame - sequenceCompleteFrame;
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
            <SceneAssetPreloader />
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
