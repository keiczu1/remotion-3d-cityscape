import { random } from "remotion";

const trimTrailingZero = (value: number) => value.toFixed(1).replace(/\.0$/, "");

export function formatVisits(visits: number): string {
    if (visits >= 1e9) {
        return trimTrailingZero(visits / 1e9) + " B";
    }
    if (visits >= 1e6) {
        return trimTrailingZero(visits / 1e6) + " M";
    }
    return visits.toString();
}

export const getVisitsSecondaryLabel = () => "Monthly";

export const assembleScramble = (text: string, progress: number, seed: string) => {
    if (progress >= 1) return text;
    if (progress <= 0) return "";

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*0123456789";

    return text
        .split("")
        .map((char, i) => {
            if (char === " " || char === ".") return char;

            const charProgress = i / text.length;
            if (progress > charProgress + 0.15) return text[i];

            return chars[Math.floor(random(`${seed}-${i}-${Math.floor(progress * 20)}`) * chars.length)];
        })
        .join("");
};
