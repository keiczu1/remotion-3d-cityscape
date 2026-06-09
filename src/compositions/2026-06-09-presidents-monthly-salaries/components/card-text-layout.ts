const SCREEN_WIDTH = 18;

export type FormattedName = {
    text: string;
    lines: string[];
    lineCount: number;
    longestLineLength: number;
};

export type CardTextLayout = {
    nameY: number;
    nameFontSize: number;
    nameLineHeight: number;
    nameTop: number;
    nameBottom: number;
    salaryY: number;
    salaryFontSize: number;
    salaryTop: number;
    salaryBottom: number;
    salarySuffixY: number;
    salarySuffixFontSize: number;
    salarySuffixTop: number;
    salarySuffixBottom: number;
    badgeY: number;
    badgeHeight: number;
    badgeTop: number;
    badgeBottom: number;
    badgeFontSize: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const splitIntoBalancedLines = (words: string[], lineCount: number) => {
    const lines: string[] = [];
    let remainingWords = words;

    for (let i = lineCount; i > 0; i--) {
        const remainingLength = remainingWords.join(" ").length;
        const targetLength = remainingLength / i;
        let take = 1;
        let bestScore = Number.POSITIVE_INFINITY;

        for (let candidate = 1; candidate <= remainingWords.length - i + 1; candidate++) {
            const line = remainingWords.slice(0, candidate).join(" ");
            const score = Math.abs(line.length - targetLength);

            if (score <= bestScore) {
                bestScore = score;
                take = candidate;
            }
        }

        lines.push(remainingWords.slice(0, take).join(" "));
        remainingWords = remainingWords.slice(take);
    }

    return lines;
};

export const formatDisplayName = (text: string): FormattedName => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    let lines: string[];

    if (words.length <= 1) {
        lines = [text.trim()];
    } else if (words.length === 2) {
        lines = words;
    } else if (words.length === 3 && `${words[0]} ${words[1]}`.length > 11) {
        lines = words;
    } else if (words.length <= 4) {
        const midpoint = Math.ceil(words.length / 2);
        lines = [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
    } else {
        lines = splitIntoBalancedLines(words, 3);
    }

    return {
        text: lines.join("\n"),
        lines,
        lineCount: lines.length,
        longestLineLength: Math.max(...lines.map((line) => line.length), 1),
    };
};

export const getCardTextLayout = ({
    name,
    salary,
    typeLabel,
    relHeight,
}: {
    name: string;
    salary: string;
    typeLabel: string;
    relHeight: number;
}): CardTextLayout => {
    const formattedName = formatDisplayName(name);
    const nameLineHeight = formattedName.lineCount >= 3 ? 0.86 : 0.9;
    const nameMaxFontSize = formattedName.lineCount >= 3 ? 2.22 : formattedName.lineCount === 2 ? 2.72 : 3.32;
    const nameMinFontSize = formattedName.lineCount >= 3 ? 1.68 : 1.92;
    const nameFontSize = clamp(
        (SCREEN_WIDTH - 1.3) / (formattedName.longestLineLength * 0.5),
        nameMinFontSize,
        nameMaxFontSize,
    );
    const nameHeight = nameFontSize * (1 + (formattedName.lineCount - 1) * nameLineHeight);
    const nameTop = -3.45;
    const nameY = nameTop - nameHeight / 2;
    const nameBottom = nameTop - nameHeight;

    const salaryFontSize = clamp(
        Math.min(3.3 + relHeight * 0.35, (SCREEN_WIDTH - 1.7) / (Math.max(4, salary.length) * 0.54)),
        2.58,
        3.65,
    );
    const salaryY = Math.min(-10.55, nameBottom - 0.62 - salaryFontSize * 0.45);
    const salaryTop = salaryY + salaryFontSize * 0.45;
    const salaryBottom = salaryY - salaryFontSize * 0.45;

    const salarySuffixFontSize = 1.0;
    const salarySuffixY = salaryY - 2.3;
    const salarySuffixTop = salarySuffixY + salarySuffixFontSize * 0.45;
    const salarySuffixBottom = salarySuffixY - salarySuffixFontSize * 0.45;

    const badgeHeight = 1.95;
    const badgeY = salarySuffixY - 1.75;
    const badgeTop = badgeY + badgeHeight / 2;
    const badgeBottom = badgeY - badgeHeight / 2;
    const badgeFontSize = clamp((SCREEN_WIDTH - 1.4) / (typeLabel.length * 0.62), 0.82, 1.08);

    return {
        nameY,
        nameFontSize,
        nameLineHeight,
        nameTop,
        nameBottom,
        salaryY,
        salaryFontSize,
        salaryTop,
        salaryBottom,
        salarySuffixY,
        salarySuffixFontSize,
        salarySuffixTop,
        salarySuffixBottom,
        badgeY,
        badgeHeight,
        badgeTop,
        badgeBottom,
        badgeFontSize,
    };
};
