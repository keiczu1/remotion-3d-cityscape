import { random } from "remotion";

export function formatVisits(visits: number): string {
    if (visits >= 1e9) {
        return (visits / 1e9).toFixed(1) + " B";
    }
    if (visits >= 1e6) {
        return (visits / 1e6).toFixed(1) + " M";
    }
    return visits.toString();
}

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
