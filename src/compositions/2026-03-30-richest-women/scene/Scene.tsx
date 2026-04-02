import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";

import { reversedData, getMountedSteleIndices, getSteleFrameState } from "./scene-logic";
import { CameraUpdater } from "./camera-updater";
import { SceneAssetPreloader } from "./asset-preloader";
import { Stele } from "../components/Stele";
import { CinematicSteleBatch } from "../components/CinematicSteleBatch";
import { IntroTitle } from "../components/IntroTitle";
import { BackgroundEnvironment } from "../components/BackgroundEnvironment";
import { FocusedBiographyOverlay } from "../components/FocusedBiographyOverlay";

export const Scene = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const { renderModes, isCinematic, focusedIndex, isIntro } = getSteleFrameState(frame);
    const mountedIndices = getMountedSteleIndices(frame);

    return (
        <AbsoluteFill>
            <ThreeCanvas
                width={width}
                height={height}
                camera={{ fov: 45, near: 1, far: 7000 }}
                style={{ width: "100%", height: "100%" }}
            >
                <CameraUpdater />
                <BackgroundEnvironment />
                {isCinematic ? (
                    <CinematicSteleBatch mountedIndices={mountedIndices} renderModes={renderModes} />
                ) : (
                    mountedIndices.map((index) => {
                        const item = reversedData[index];

                        return (
                            <Stele
                                key={item.order}
                                item={item}
                                index={index}
                                renderMode={renderModes[index]}
                            />
                        );
                    })
                )}
            </ThreeCanvas>

            <FocusedBiographyOverlay focusedIndex={focusedIndex} isIntro={isIntro} renderModes={renderModes} />

            <IntroTitle />

            <SceneAssetPreloader renderModes={renderModes} isCinematic={isCinematic} />
        </AbsoluteFill>
    );
};
