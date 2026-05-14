import { staticFile } from "remotion";
import rawRankingFile from "../../../../public/Рост президентов стран/data/leaders-by-height.clean.json";

type RawEntry = {
    rank: number;
    country: string;
    iso3: string;
    leader: string;
    height_cm: number;
    photo: string;
};

const rankingFile = rawRankingFile as RawEntry[];
const OPTIMIZED_PHOTO_BASE_PATH = "Рост президентов стран/photos/styled";

const sortedEntries = [...rankingFile].sort((a, b) => {
    if (b.height_cm !== a.height_cm) {
        return b.height_cm - a.height_cm; // tallest first
    }
    return a.rank - b.rank;
});

const heights = sortedEntries.map(e => e.height_cm);
const minHeight = Math.min(...heights);
const maxHeight = Math.max(...heights);

export const data = sortedEntries.map((entry, i) => {
    const progress = maxHeight > minHeight ? (entry.height_cm - minHeight) / (maxHeight - minHeight) : 0;
    const relHeight = 0.5 + progress * 2.0; // Maps to [0.5, 2.5]

    return {
        order: i + 1,
        name: entry.leader,
        country: entry.country,
        lifeYears: "",
        wealthSource: entry.iso3,
        sourceDetail: "",
        wealthOrigin: entry.iso3,
        fact: "",
        wealth: `${entry.height_cm} см`,
        imagePath: entry.photo,
        moneyFrom: "",
        relHeight,
        iso3: entry.iso3,
    };
});

export const getPhotoSrc = (item: (typeof data)[number]) => {
    const fileName = item.imagePath.split("\\").pop() || item.imagePath.split("/").pop();
    if (!fileName) {
        return staticFile(item.imagePath);
    }
    return staticFile(`${OPTIMIZED_PHOTO_BASE_PATH}/${fileName}`);
};

const iso3ToIso2: Record<string, string> = {
    SAU: "sa", ALB: "al", SRB: "rs", ESP: "es", LTU: "lt", POL: "pl", MCO: "mc", AZE: "az", USA: "us", NOR: "no",
    CRI: "cr", TUR: "tr", AUT: "at", BEL: "be", BWA: "bw", CUB: "cu", CYP: "cy", CZE: "cz", GRC: "gr", HUN: "hu",
    KAZ: "kz", MNE: "me", NLD: "nl", QAT: "qa", SVK: "sk", TKM: "tm", BLR: "by", MYS: "my", HRV: "hr", EST: "ee",
    FIN: "fi", LIE: "li", PLW: "pw", ATG: "ag", ARG: "ar", AUS: "au", BHS: "bs", BLZ: "bz", CAN: "ca", CHN: "cn",
    DOM: "do", GAB: "ga", DEU: "de", GRD: "gd", GUY: "gy", JAM: "jm", LUX: "lu", MDV: "mv", MNG: "mn", NZL: "nz",
    OMN: "om", PAN: "pa", PRT: "pt", KNA: "kn", LCA: "lc", VCT: "vc", SWE: "se", CHE: "ch", GBR: "gb", URY: "uy",
    LVA: "lv", ARM: "am", BHR: "bh", NRU: "nr", BGR: "bg", COL: "co", GNQ: "gq", KWT: "kw", SMR: "sm", SYC: "sc",
    SGP: "sg", ARE: "ae", AND: "ad", BRN: "bn", FRA: "fr", KOR: "kr", CHL: "cl", PER: "pe", ISL: "is", IRL: "ie",
    MUS: "mu", MDA: "md", RUS: "ru", THA: "th", BRA: "br", GEO: "ge", BIH: "ba", ROU: "ro", SVN: "si", MKD: "mk",
    BRB: "bb", DMA: "dm", JPN: "jp", MEX: "mx", SUR: "sr", TTO: "tt", ITA: "it", MHL: "mh", MLT: "mt", ECU: "ec"
};

export const getFlagCode = (item: (typeof data)[number]): string | null => {
    return iso3ToIso2[item.iso3] || null;
};
