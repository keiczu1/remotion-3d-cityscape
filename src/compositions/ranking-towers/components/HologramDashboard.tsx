import { RoundedBox, Text } from "@react-three/drei";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

import { LaserStrike } from "../effects/LaserStrike";
import { Shockwave } from "../effects/Shockwave";
import { type RankingTowerItem } from "../model/types";
import { sequenceCompleteFrame, type TowerRenderMode } from "../scene/scene-logic";
import { Favicon } from "./Favicon";
import { assembleScramble, formatVisits, getVisitsSecondaryLabel } from "./dashboard-helpers";

const sharedBoxGeo = new THREE.BoxGeometry(20, 32, 0.4);
const sharedEdgesGeo = new THREE.EdgesGeometry(sharedBoxGeo);
const VISITS_VALUE_Y = -8.6;
const VISITS_LABEL_Y = -11.9;
const TYPE_BADGE_Y = -14.7;

const VisitsMetric = ({
    value,
    fillOpacity,
}: {
    value: string;
    fillOpacity?: number;
}) => {
    return (
        <>
            <Text
                position={[0, VISITS_VALUE_Y, 0.3]}
                color="#00FF9D"
                fontSize={4.0}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                fillOpacity={fillOpacity}
            >
                {value}
            </Text>
            <Text
                position={[0, VISITS_LABEL_Y, 0.3]}
                color="#7CFFCB"
                fontSize={1.55}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                fillOpacity={fillOpacity === undefined ? 0.72 : fillOpacity * 0.72}
                letterSpacing={0.03}
            >
                {getVisitsSecondaryLabel()}
            </Text>
        </>
    );
};

const StaticDashboardCard = ({
    item,
    yPos,
    floatY,
    rank,
    domainFontSize,
    formattedVisits,
    typeBadgeWidth,
    typeLabel,
}: {
    item: RankingTowerItem;
    yPos: number;
    floatY: number;
    rank: number;
    domainFontSize: number;
    formattedVisits: string;
    typeBadgeWidth: number;
    typeLabel: string;
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
            <VisitsMetric value={formattedVisits} />
            <group position={[0, TYPE_BADGE_Y, 0.3]}>
                <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                    <meshStandardMaterial color="#2563EB" transparent opacity={0.88} />
                </RoundedBox>
                <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">
                    {typeLabel}
                </Text>
            </group>
        </group>
    );
};

export const HologramDashboard = ({
    item,
    yPos,
    rank,
    arriveFrame,
    index,
    renderMode,
}: {
    item: RankingTowerItem;
    yPos: number;
    rank: number;
    arriveFrame: number;
    index: number;
    renderMode: TowerRenderMode;
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const localFrame = frame - arriveFrame;
    const domainFontSize = Math.min(2.4, 30 / item.domain.length);
    const formattedVisits = formatVisits(item.monthlyVisits);
    const isReady = localFrame >= 25;
    const isCinematic = frame > sequenceCompleteFrame;
    const typeLabel = item.type.toUpperCase();
    const typeBadgeWidth = Math.max(7, item.type.length * 1.0 + 2.0);
    const floatY = Math.sin(frame * 0.05 + yPos) * 0.5;

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
                formattedVisits={formattedVisits}
                typeBadgeWidth={typeBadgeWidth}
                typeLabel={typeLabel}
            />
        );
    }

    const animFrame = localFrame - 25;
    const scrambleProgress = interpolate(animFrame, [120, 180], [0, 1], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
    });
    const decodedDomain = assembleScramble(item.domain, scrambleProgress, `${index}-domain`);
    const decodedVisits = assembleScramble(formattedVisits, scrambleProgress, `${index}-visits`);
    const decodedRank = assembleScramble(`#${rank}`, scrambleProgress, `${index}-rank`);
    const effectType = index % 5;

    if (effectType === 0) {
        const bgScaleX = interpolate(animFrame, [10, 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
        const textDropY = interpolate(animFrame, [20, 35], [50, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
        const rankDropY = interpolate(animFrame, [20, 35], [-50, 0], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
        });
        const opacity = interpolate(animFrame, [10, 15], [0, 0.88], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

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

                <Text
                    position={[0, 12 + rankDropY, 0.3]}
                    color="#9CA3AF"
                    fontSize={4.0}
                    anchorX="center"
                    anchorY="middle"
                    fontWeight="bold"
                    fillOpacity={opacity / 0.88}
                >
                    {decodedRank}
                </Text>

                <group position={[0, textDropY, 0]}>
                    {animFrame > 20 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}
                    <Text
                        position={[0, -5, 0.3]}
                        color="#ffffff"
                        fontSize={domainFontSize}
                        anchorX="center"
                        anchorY="middle"
                        fontWeight="bold"
                        fillOpacity={opacity / 0.88}
                    >
                        {decodedDomain}
                    </Text>
                    <VisitsMetric value={decodedVisits} fillOpacity={opacity / 0.88} />
                    <group position={[0, TYPE_BADGE_Y, 0.3]}>
                        <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                            <meshStandardMaterial color="#2563EB" transparent opacity={opacity / 0.88} />
                        </RoundedBox>
                        <Text
                            position={[0, 0, 0.12]}
                            color="#ffffff"
                            fontSize={1.4}
                            anchorX="center"
                            anchorY="middle"
                            fontWeight="bold"
                            fillOpacity={opacity / 0.88}
                        >
                            {typeLabel}
                        </Text>
                    </group>
                </group>
            </group>
        );
    }

    if (effectType === 1) {
        const bgX = spring({ fps, frame: Math.min(150, Math.max(0, animFrame)), config: { damping: 12 } });
        const outX = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 5)), config: { damping: 12 } });
        const textY = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 15)), config: { damping: 15 } });
        const favZ = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 25)), config: { damping: 15 } });

        const posXBg = (1 - bgX) * -100;
        const posXOut = (1 - outX) * 100;
        const posZFav = (1 - favZ) * 200;
        const posYText = (1 - textY) * 100;

        return (
            <group position={[0, yPos + floatY, 0]}>
                <group position={[posXBg, 0, 0]}>
                    <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                        <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
                    </RoundedBox>
                </group>

                <group position={[posXOut, 0, 0]}>
                    <lineSegments geometry={sharedEdgesGeo}>
                        <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
                    </lineSegments>
                </group>

                {animFrame > 25 && (
                    <group position={[0, 0, posZFav]}>
                        <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
                    </group>
                )}

                <group position={[0, posYText, 0]}>
                    <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">
                        {decodedRank}
                    </Text>
                    <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">
                        {decodedDomain}
                    </Text>
                    <VisitsMetric value={decodedVisits} />
                    <group position={[0, TYPE_BADGE_Y, 0.3]}>
                        <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                            <meshStandardMaterial color="#2563EB" />
                        </RoundedBox>
                        <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">
                            {typeLabel}
                        </Text>
                    </group>
                </group>
            </group>
        );
    }

    if (effectType === 2) {
        const scale = spring({ fps, frame: Math.min(150, animFrame), config: { damping: 14, mass: 1.5 } });
        const progress = interpolate(animFrame, [15, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
        const uppercaseDomain = assembleScramble(item.domain.toUpperCase(), progress, `${index}-domain`);
        const matrixVisits = assembleScramble(formattedVisits, progress, `${index}-visits`);

        return (
            <group position={[0, yPos + floatY, 0]} scale={scale}>
                <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                    <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
                </RoundedBox>
                <lineSegments geometry={sharedEdgesGeo}>
                    <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
                </lineSegments>

                <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">
                    {decodedRank}
                </Text>

                {animFrame > 40 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}

                <Text position={[0, -5, 0.3]} color="#00FF9D" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">
                    {uppercaseDomain}
                </Text>
                <VisitsMetric value={matrixVisits} />

                {animFrame > 50 && (
                    <group position={[0, TYPE_BADGE_Y, 0.3]}>
                        <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                            <meshStandardMaterial color="#2563EB" />
                        </RoundedBox>
                        <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">
                            {typeLabel}
                        </Text>
                    </group>
                )}
            </group>
        );
    }

    if (effectType === 3) {
        const holeScale = interpolate(animFrame, [0, 15, 45, 60], [0, 25, 25, 0], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
        });
        const holeRot = animFrame * 0.1;
        const pushZ = spring({ fps, frame: Math.min(150, Math.max(0, animFrame - 15)), config: { mass: 2, damping: 10 } });
        const finalZ = interpolate(pushZ, [0, 1], [-50, 0]);
        const holeOpacity = interpolate(animFrame, [45, 60], [1, 0], { extrapolateRight: "clamp" });

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
                        <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">
                            {decodedRank}
                        </Text>
                        <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />
                        <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">
                            {decodedDomain}
                        </Text>
                        <VisitsMetric value={decodedVisits} />
                        <group position={[0, TYPE_BADGE_Y, 0.3]}>
                            <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                                <meshStandardMaterial color="#2563EB" />
                            </RoundedBox>
                            <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">
                                {typeLabel}
                            </Text>
                        </group>
                    </group>
                )}
            </group>
        );
    }

    return (
        <group position={[0, yPos + floatY, 0]}>
            <RoundedBox args={[20, 32, 0.4]} radius={0.6} smoothness={2}>
                <meshStandardMaterial color="#0A1128" transparent opacity={0.88} />
            </RoundedBox>
            <lineSegments geometry={sharedEdgesGeo}>
                <lineBasicMaterial color="#00E5FF" linewidth={3} transparent opacity={0.6} />
            </lineSegments>

            {animFrame > 10 && (
                <Text position={[0, 12, 0.3]} color="#9CA3AF" fontSize={4.0} anchorX="center" anchorY="middle" fontWeight="bold">
                    {decodedRank}
                </Text>
            )}
            {animFrame > 20 && <Favicon domain={item.domain} yPos={4} zPos={0.3} opacity={0.88} />}
            {animFrame > 30 && (
                <Text position={[0, -5, 0.3]} color="#ffffff" fontSize={domainFontSize} anchorX="center" anchorY="middle" fontWeight="bold">
                    {decodedDomain}
                </Text>
            )}
            {animFrame > 40 && <VisitsMetric value={decodedVisits} />}

            {animFrame > 50 && (
                <group position={[0, TYPE_BADGE_Y, 0.3]}>
                    <RoundedBox args={[typeBadgeWidth, 3, 0.2]} radius={0.3}>
                        <meshStandardMaterial color="#2563EB" />
                    </RoundedBox>
                    <Text position={[0, 0, 0.12]} color="#ffffff" fontSize={1.4} anchorX="center" anchorY="middle" fontWeight="bold">
                        {typeLabel}
                    </Text>
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
};
