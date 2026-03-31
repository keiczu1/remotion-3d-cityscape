import {staticFile} from "remotion";

import {getFlagAssetUrl} from "../../../assets/flag-asset-url";

export const getFaviconTextureUrl = (domain: string) => staticFile(`favicons/${domain}.png`);

export const getFlagTextureUrl = (country: string) => getFlagAssetUrl(country);
