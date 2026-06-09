import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import test from "node:test";

test("presidents monthly salaries composition does not render the left information overlay", () => {
    const source = readFileSync(
        join(__dirname, "../PresidentsMonthlySalariesComposition.tsx"),
        "utf8",
    );

    assert.equal(source.includes("ActiveLeaderOverlay"), false);
});
