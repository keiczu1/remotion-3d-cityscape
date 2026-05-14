import "./index.css";
import { Composition } from "remotion";
import { Scene as AppBestSellingMobileGamesScene, durationInFrames as appBestSellingMobileGamesDuration } from "./compositions/2026-04-07-best-selling-mobile-games";
import { Scene as BestSellingCarsScene, durationInFrames as bestSellingCarsDuration } from "./compositions/2026-05-14-best-selling-cars";
import { Scene, durationInFrames } from "./compositions/ranking-towers";
import { Scene as WebsitesScene, durationInFrames as websitesDuration } from "./compositions/most-visited-websites";
import { Scene as PokemonScene, durationInFrames as pokemonDuration } from "./compositions/2026-03-25-strongest-pokemon";
import {
  Scene as RichestWomenCorridorScene,
  durationInFrames as richestWomenCorridorDuration,
} from "./compositions/2026-03-30-richest-women";
import {
  Scene as RichestWomenCompactScene,
  durationInFrames as richestWomenCompactDuration,
} from "./compositions/2026-05-12-presidents-height";

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
      <Composition
        id="StrongestPokemon"
        component={PokemonScene}
        durationInFrames={pokemonDuration}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="RichestWomenCorridor"
        component={RichestWomenCorridorScene}
        durationInFrames={richestWomenCorridorDuration}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="2026-04-07-best-selling-mobile-games"
        component={AppBestSellingMobileGamesScene}
        durationInFrames={appBestSellingMobileGamesDuration}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="2026-05-14-best-selling-cars"
        component={BestSellingCarsScene}
        durationInFrames={bestSellingCarsDuration}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="PresidentsHeightCompact"
        component={RichestWomenCompactScene}
        durationInFrames={richestWomenCompactDuration}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
