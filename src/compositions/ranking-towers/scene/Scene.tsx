import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";

import { BackgroundEnvironment } from "../components/BackgroundEnvironment";
import { Tower } from "../components/Tower";
import { BASE_HEIGHT, getTowerFrameState, milestones, reversedData } from "./scene-logic";
import { CameraUpdater } from "./camera-updater";
import { SceneAssetPreloader } from "./asset-preloader";

export { durationInFrames } from "./scene-logic";

export const Scene = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const frameState = getTowerFrameState(frame);

    return (
        <ThreeCanvas width={width} height={height} camera={{ position: [0, BASE_HEIGHT, 45], fov: 45, near: 1, far: 7000 }}>
            <color attach="background" args={["#87CEEB"]} />
            <fog attach="fog" args={["#87CEEB", 500, 4500]} />
            <SceneAssetPreloader isCinematic={frameState.isCinematic} renderModes={frameState.renderModes} />
            <BackgroundEnvironment />

            <group>
                {reversedData.map((item, i) => (
                    <Tower
                        key={item.domain}
                        item={item}
                        index={i}
                        arriveFrame={milestones[i].arriveFrame}
                        renderMode={frameState.renderModes[i]}
                    />
                ))}
            </group>

            <CameraUpdater />
        </ThreeCanvas>
    );
};
