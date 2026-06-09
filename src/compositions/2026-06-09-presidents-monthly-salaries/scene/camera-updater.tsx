import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";

import { getResolvedCameraPose } from "./camera-presentation";

export const CameraUpdater = () => {
    const frame = useCurrentFrame();
    const { camera } = useThree();
    const state = getResolvedCameraPose(frame);

    camera.position.set(state.camX, state.camY, state.camZ);
    camera.lookAt(state.lookX, state.lookY, state.lookZ);

    return null;
};
