import "./index.css";
import { Composition } from "remotion";
import { Scene, durationInFrames } from "./compositions/ranking-towers";
import { Scene as WebsitesScene, durationInFrames as websitesDuration } from "./compositions/most-visited-websites";

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
      <Composition
        id="MostVisitedWebsites"
        component={WebsitesScene}
        durationInFrames={websitesDuration}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
