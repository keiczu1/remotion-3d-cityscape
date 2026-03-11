import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

import { getSceneSoundtrackCues } from "../sound/get-scene-soundtrack-cues";

export const SceneSoundtrack = () => {
    const cues = getSceneSoundtrackCues();

    return (
        <>
            {cues.map((cue) => (
                <Sequence key={cue.id} from={cue.startFrame}>
                    <Audio src={staticFile(cue.src)} volume={cue.volume} playbackRate={cue.playbackRate} />
                </Sequence>
            ))}
        </>
    );
};
