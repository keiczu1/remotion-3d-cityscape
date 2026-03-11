import assert from "node:assert/strict";
import test from "node:test";

import { formatVisits, getVisitsSecondaryLabel } from "../components/dashboard-helpers";

test("formatVisits trims trailing zero for whole millions", () => {
    assert.equal(formatVisits(915000000), "915 M");
    assert.equal(formatVisits(867000000), "867 M");
});

test("formatVisits keeps a decimal when it carries information", () => {
    assert.equal(formatVisits(3200000000), "3.2 B");
});

test("secondary visits label is monthly", () => {
    assert.equal(getVisitsSecondaryLabel(), "Monthly");
});
