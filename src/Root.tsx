import "./index.css";
import { Composition } from "remotion";
import { Scene, durationInFrames } from "./Scene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RankingTower"
        component={Scene}
        durationInFrames={durationInFrames}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
