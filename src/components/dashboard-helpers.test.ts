import test from "node:test";
import assert from "node:assert/strict";

import { assembleScramble, formatVisits } from "../compositions/ranking-towers/components/dashboard-helpers";

test("formatVisits compacts large numbers into millions and billions", () => {
    assert.equal(formatVisits(1_500_000_000), "1.5 B");
    assert.equal(formatVisits(2_500_000), "2.5 M");
    assert.equal(formatVisits(999_999), "999999");
});

test("assembleScramble returns stable edge-case values for zero and full progress", () => {
    assert.equal(assembleScramble("HELLO", 0, "seed"), "");
    assert.equal(assembleScramble("HELLO", 1, "seed"), "HELLO");
});
