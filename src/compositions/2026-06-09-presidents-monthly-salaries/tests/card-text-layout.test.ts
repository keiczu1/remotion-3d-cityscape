import assert from "node:assert/strict";
import test from "node:test";

import {dataset} from "../data/dataset";
import {formatDisplayName, getCardTextLayout} from "../components/card-text-layout";

test("card text layout keeps all metric rows separated for the full dataset", () => {
    for (const item of dataset) {
        const typeLabel = `${item.country_en} - ${item.iso3}`;
        const layout = getCardTextLayout({
            name: item.display_name,
            salary: item.salary_usd_monthly_display,
            typeLabel,
            relHeight: item.relHeight,
        });

        assert.ok(
            layout.nameBottom - layout.salaryTop >= 0.55,
            `${item.rank} ${item.display_name}: name overlaps salary`,
        );
        assert.ok(
            layout.salaryBottom - layout.salarySuffixTop >= 0.12,
            `${item.rank} ${item.display_name}: salary overlaps suffix`,
        );
        assert.ok(
            layout.salarySuffixBottom - layout.badgeTop >= 0.12,
            `${item.rank} ${item.display_name}: suffix overlaps badge`,
        );
        assert.ok(
            layout.badgeBottom >= -18.65,
            `${item.rank} ${item.display_name}: badge falls below panel`,
        );
    }
});

test("long leader names are explicitly split before Three text wrapping can collide rows", () => {
    assert.deepEqual(formatDisplayName("Hassan Sheikh Mohamud").lines, [
        "Hassan",
        "Sheikh",
        "Mohamud",
    ]);
    assert.equal(formatDisplayName("Salman bin Abdulaziz Al Saud").lineCount, 3);
});
