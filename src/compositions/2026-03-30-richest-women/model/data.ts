import { staticFile } from "remotion";
import rawRankingFile from "../../../../public/final_ranking.json";

type RawEntry = {
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

type RawFile = {
    meta: { title: string; entries_count: number; images_dir: string; fields: string[] };
    entries: RawEntry[];
};

const rankingFile = rawRankingFile as RawFile;

/**
 * Parse a wealth string like "$134B", "$2.7B-$5.4B", "$17M"
 * into a single float in billions for height comparison.
 */
const parseWealthBillions = (wealth: string): number => {
    const matches = Array.from(wealth.matchAll(/([\d.]+)\s*([BMK]?)/gi));
    if (matches.length === 0) return 0.001;

    let maxVal = 0;
    for (const m of matches) {
        let v = Number(m[1]);
        const unit = (m[2] || "").toUpperCase();
        if (unit === "M") v /= 1000;
        else if (unit === "K") v /= 1_000_000;
        // B or empty → treat as billions
        if (Number.isFinite(v) && v > maxVal) maxVal = v;
    }

    return maxVal || 0.001;
};

const allEntries = rankingFile.entries;
const wealthValues = allEntries.map((e) => parseWealthBillions(e.wealth));
const maxWealth = Math.max(...wealthValues);

/**
 * Build flat data array similar to most-visited-websites.
 * `relHeight` is 0..100 normalised to max wealth (100 = richest).
 */
export const data = allEntries.map((entry, i) => ({
    order: entry.order,
    name: entry.name,
    country: entry.country,
    lifeYears: entry.life_years,
    wealthSource: entry.wealth_source ?? "",
    sourceDetail: entry.source_detail ?? "",
    wealthOrigin: entry.wealth_origin,
    fact: entry.fact,
    wealth: entry.wealth,
    imagePath: entry.image_path,
    moneyFrom: entry.source_detail ?? entry.money_from ?? entry.wealth_source ?? "Not specified",
    relHeight: maxWealth > 0 ? (wealthValues[i] / maxWealth) * 100 : 1,
}));

export const getPhotoSrc = (item: (typeof data)[number]) => staticFile(item.imagePath);

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

export const getFlagCode = (item: (typeof data)[number]): string | null =>
    countryToFlagCode[item.country] ?? null;
