import "./index.css";
import { Composition } from "remotion";
import { Scene, durationInFrames } from "./compositions/ranking-towers";
import { Scene as WebsitesScene, durationInFrames as websitesDuration } from "./compositions/most-visited-websites";
import { Scene as PokemonScene, durationInFrames as pokemonDuration } from "./compositions/2026-03-25-strongest-pokemon";
import {
  Scene as RichestWomenVariantsScene,
  durationInFrames as richestWomenVariantsDuration,
  type RichestWomenVariantsProps,
} from "./compositions/2026-03-30-richest-women-variants";

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
        id="RichestWomenVariantComparison"
        component={RichestWomenVariantsScene}
        durationInFrames={richestWomenVariantsDuration}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          previewOrder: 16,
        } satisfies RichestWomenVariantsProps}
      />
    </>
  );
};
