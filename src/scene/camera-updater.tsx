import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";

import { getCameraState, getCameraTimelineFrame, getCinematicCameraState, sequenceCompleteFrame } from "../scene-logic";

export const CameraUpdater = () => {
    const frame = useCurrentFrame();
    const { camera } = useThree();
    const cameraFrame = getCameraTimelineFrame(frame);

    if (cameraFrame <= sequenceCompleteFrame) {
        const state = getCameraState(cameraFrame);
        const distanceOut = 55 + (state.camZOffset || 0);

        camera.position.set(state.camX, state.camY, distanceOut);
        camera.lookAt(state.lookX, state.lookY, 10);
    } else {
        const cinematicFrame = cameraFrame - sequenceCompleteFrame;
        const state = getCinematicCameraState(cinematicFrame);

        camera.position.set(state.camX, state.camY, state.camZ);
        camera.lookAt(state.lookX, state.lookY, state.lookZ);
    }

    return null;
};
