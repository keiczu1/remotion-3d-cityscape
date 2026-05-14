import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import { EnvironmentLayer } from "./scene/EnvironmentLayer";
import { IntroTitle } from "./components/IntroTitle";
import { Pedestal } from "./scene/Pedestal";
import { BASE_HEIGHT, getSteleFrameState, reversedData } from "./scene/scene-logic";
import { CameraUpdater } from "./scene/camera-updater";
import { SceneAssetPreloader } from "./scene/asset-preloader";

export { durationInFrames } from "./scene/scene-logic";

export const Scene = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const frameState = getSteleFrameState(frame);

    return (
        <AbsoluteFill>
            <ThreeCanvas
                width={width}
                height={height}
                camera={{ position: [0, BASE_HEIGHT, 45], fov: 45, near: 1, far: 7000 }}
            >
                {/* Sky & fog now managed by EnvironmentLayer (dynamic per-act) */}
                <SceneAssetPreloader isCinematic={frameState.isCinematic} renderModes={frameState.renderModes} />
                <EnvironmentLayer />

                <group>
                    {reversedData.map((item, i) => (
                        <Pedestal
                            key={item.model_id}
                            item={item}
                            index={i}
                            renderMode={frameState.renderModes[i]}
                        />
                    ))}
                </group>

                <CameraUpdater />
            </ThreeCanvas>
            <AbsoluteFill style={{ pointerEvents: "none" }}>
                <IntroTitle />
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

