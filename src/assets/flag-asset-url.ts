import {staticFile} from "remotion";

const normalizeFlagCountryCode = (countryCode: string) => {
	return countryCode.trim().toLowerCase();
};

export const getFlagAssetExtension = () => {
	return "svg";
};

export const getFlagAssetPath = (countryCode: string) => {
	const normalizedCountryCode = normalizeFlagCountryCode(countryCode);
	return `flags/${normalizedCountryCode}.${getFlagAssetExtension()}`;
};

export const getFlagAssetUrl = (countryCode: string) => {
	return staticFile(getFlagAssetPath(countryCode));
};
