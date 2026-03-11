import { interpolate } from "remotion";

export const LaserStrike = ({ frame, triggerFrame }: { frame: number; triggerFrame: number }) => {
    const activeFrame = frame - triggerFrame;
    if (activeFrame < 0 || activeFrame > 15) return null;

    const opacity = interpolate(activeFrame, [0, 5, 15], [1, 1, 0], { extrapolateRight: "clamp" });
    const scaleY = interpolate(activeFrame, [0, 5], [10, 0], { extrapolateRight: "clamp" });

    return (
        <mesh position={[0, scaleY * 20, 0]}>
            <cylinderGeometry args={[2, 2, scaleY * 40, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
        </mesh>
    );
};
