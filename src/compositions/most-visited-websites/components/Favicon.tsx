import { memo } from "react";
import { RoundedBox } from "@react-three/drei";

import { getFaviconTextureUrl } from "../assets/asset-urls";
import { useSharedTexture } from "../assets/texture-cache";

export const Favicon = memo(({
    domain,
    yPos,
    zPos,
    opacity,
    size = 10,
}: {
    domain: string;
    yPos: number;
    zPos: number;
    opacity: number;
    size?: number;
}) => {
    const texture = useSharedTexture(getFaviconTextureUrl(domain), "favicon");

    return (
        <group position={[0, yPos, zPos]}>
            <RoundedBox args={[size + 1, size + 1, 0.1]} radius={1.5} smoothness={2} position={[0, 0, -0.1]}>
                <meshBasicMaterial color="#00E5FF" transparent opacity={opacity * 0.8} />
            </RoundedBox>

            <RoundedBox args={[size, size, 0.15]} radius={1.3} smoothness={2} position={[0, 0, -0.05]}>
                <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.95} />
            </RoundedBox>

            {texture && (
                <mesh position={[0, 0, 0.1]}>
                    <planeGeometry args={[size * 0.7, size * 0.7]} />
                    <meshBasicMaterial map={texture} transparent opacity={opacity} />
                </mesh>
            )}
        </group>
    );
});

Favicon.displayName = "Favicon";
