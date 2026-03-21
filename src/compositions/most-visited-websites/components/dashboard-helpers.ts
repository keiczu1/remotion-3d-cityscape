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

/**
 * Счётчик-одометр: прокручивает числовое значение от 0 до финального.
 * Для строки "1.6 B" прокрутит "1.6" от 0.0 до 1.6, суффикс (" B") останется.
 * progress: 0 → "0.0 B", 0.5 → "0.8 B", 1 → "1.6 B"
 */
export function rollCounterValue(finalText: string, progress: number): string {
    if (progress >= 1) return finalText;
    if (progress <= 0) return "";

    // Разделяем число и суффикс: "1.6 B" → num=1.6, suffix=" B"
    const match = finalText.match(/^([\d.]+)\s*(.*)$/);
    if (!match) return finalText;

    const finalNum = parseFloat(match[1]);
    const suffix = match[2] ? " " + match[2] : "";

    if (isNaN(finalNum)) return finalText;

    const currentNum = finalNum * easeOutCubic(progress);

    // Формат: если оригинал имел десятичную точку, сохраняем
    if (match[1].includes(".")) {
        const decimalPlaces = match[1].split(".")[1]?.length || 1;
        return currentNum.toFixed(decimalPlaces) + suffix;
    }

    return Math.round(currentNum).toString() + suffix;
}

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}
