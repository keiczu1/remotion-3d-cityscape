import { staticFile } from "remotion";

export const getFaviconTextureUrl = (domain: string) => staticFile(`favicons/${domain}.png`);

export const getFlagTextureUrl = (country: string) => staticFile(`flags/${country.toLowerCase()}.png`);
