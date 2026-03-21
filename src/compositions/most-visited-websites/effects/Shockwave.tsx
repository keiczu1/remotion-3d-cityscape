import { interpolate } from "remotion";
import * as THREE from "three";

export const Shockwave = ({ frame, triggerFrame }: { frame: number; triggerFrame: number }) => {
    const activeFrame = frame - triggerFrame;
    if (activeFrame < 0 || activeFrame > 20) return null;

    const size = interpolate(activeFrame, [0, 20], [0, 40], { extrapolateRight: "clamp" });
    const opacity = interpolate(activeFrame, [0, 15, 20], [1, 0.5, 0], { extrapolateRight: "clamp" });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[size * 0.8, size, 32]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={opacity} side={THREE.DoubleSide} />
        </mesh>
    );
};
