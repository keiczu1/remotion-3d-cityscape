import {staticFile} from "remotion";

import rawRankingFile from "../../../public/final_ranking.json";

type RawRichestWomenEntry = {
	order: number;
	name: string;
	country: string;
	life_years: string;
	wealth_source?: string;
	source_detail?: string;
	wealth_origin: string;
	fact: string;
	wealth: string;
	image_path: string;
	money_from?: string;
};

type RawRichestWomenFile = {
	meta: {
		title: string;
		entries_count: number;
		images_dir: string;
		fields: string[];
	};
	entries: RawRichestWomenEntry[];
};

export type RichestWomenEntry = RawRichestWomenEntry;

const rankingFile = rawRankingFile as RawRichestWomenFile;

export const richestWomenEntries: RichestWomenEntry[] = rankingFile.entries;
export const richestWomenMeta = rankingFile.meta;
export const defaultPreviewOrder = 16;
export const fallbackPreviewOrder = 13;

const countryToFlagCode: Record<string, string> = {
	"Australia": "au",
	"Barbados": "bb",
	"Brazil": "br",
	"Canada": "ca",
	"Chile": "cl",
	"China": "cn",
	"Czech Republic": "cz",
	"France": "fr",
	"Germany": "de",
	"Greece": "gr",
	"Hong Kong": "hk",
	"India": "in",
	"Israel": "il",
	"Italy": "it",
	"Mexico": "mx",
	"Monaco": "mc",
	"Netherlands": "nl",
	"Poland": "pl",
	"Russia": "ru",
	"Spain": "es",
	"Sweden": "se",
	"Switzerland": "ch",
	"United Kingdom": "gb",
	"United States": "us",
};

const locallyAvailableFlags = new Set([
	"ae",
	"au",
	"br",
	"cn",
	"jp",
	"kr",
	"ru",
	"us",
]);

export const getPreviewEntry = (order = defaultPreviewOrder): RichestWomenEntry => {
	return richestWomenEntries.find((entry) => entry.order === order)
		?? richestWomenEntries.find((entry) => entry.order === fallbackPreviewOrder)
		?? richestWomenEntries[0];
};

export const getPhotoSrc = (entry: RichestWomenEntry) => {
	return staticFile(entry.image_path);
};

export const getFlagCode = (entry: RichestWomenEntry) => {
	const code = countryToFlagCode[entry.country];
	if (!code || !locallyAvailableFlags.has(code)) {
		return null;
	}

	return code;
};

export const getFlagSrc = (entry: RichestWomenEntry) => {
	const code = getFlagCode(entry);
	if (!code) {
		return null;
	}

	return staticFile(`flags/${code}.png`);
};
