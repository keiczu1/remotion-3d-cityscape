import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";

import { BackgroundEnvironment } from "./components/BackgroundEnvironment";
import { Tower } from "./components/Tower";
import { BASE_HEIGHT, milestones, reversedData } from "./scene-logic";
import { CameraUpdater } from "./scene/camera-updater";
import { SceneAssetPreloader } from "./scene/asset-preloader";

export { durationInFrames } from "./scene-logic";

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
