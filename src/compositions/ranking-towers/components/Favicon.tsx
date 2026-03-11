import { memo } from "react";
import { RoundedBox } from "@react-three/drei";

import { getFaviconTextureUrl } from "../assets/asset-urls";
import { useSharedTexture } from "../assets/texture-cache";

export const Favicon = memo(({
    domain,
    yPos,
    zPos,
    opacity,
}: {
    domain: string;
    yPos: number;
    zPos: number;
    opacity: number;
}) => {
    const texture = useSharedTexture(getFaviconTextureUrl(domain), "favicon");

    return (
        <group position={[0, yPos, zPos]}>
            <RoundedBox args={[11, 11, 0.1]} radius={1.5} smoothness={2} position={[0, 0, -0.1]}>
                <meshBasicMaterial color="#00E5FF" transparent opacity={opacity * 0.8} />
            </RoundedBox>

            <RoundedBox args={[10, 10, 0.15]} radius={1.3} smoothness={2} position={[0, 0, -0.05]}>
                <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.95} />
            </RoundedBox>

            {texture && (
                <mesh position={[0, 0, 0.1]}>
                    <planeGeometry args={[7, 7]} />
                    <meshBasicMaterial map={texture} transparent opacity={opacity} />
                </mesh>
            )}
        </group>
    );
});

Favicon.displayName = "Favicon";
