import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import { BackgroundEnvironment } from "../components/BackgroundEnvironment";
import { IntroTitle } from "../components/IntroTitle";
import { Stele } from "../components/Stele";
import { BASE_HEIGHT, getSteleFrameState, reversedData } from "./scene-logic";
import { CameraUpdater } from "./camera-updater";
import { SceneAssetPreloader } from "./asset-preloader";

export { durationInFrames } from "./scene-logic";

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
                {/* Sky & fog now managed by BackgroundEnvironment (dynamic per-act) */}
                <SceneAssetPreloader isCinematic={frameState.isCinematic} renderModes={frameState.renderModes} />
                <BackgroundEnvironment />

                <group>
                    {reversedData.map((item, i) => (
                        <Stele
                            key={item.domain}
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
