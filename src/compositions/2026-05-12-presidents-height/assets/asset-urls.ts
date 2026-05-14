import { staticFile } from "remotion";

import { getFlagAssetUrl } from "../../../assets/flag-asset-url";

export const getPhotoTextureUrl = (imagePath: string) => staticFile(imagePath);

export const getFlagTextureUrl = (country: string) => getFlagAssetUrl(country);
