import assert from "node:assert/strict";
import test from "node:test";

import {getFlagCode, getFlagSrc, richestWomenEntries} from "./data";

test("richest women dataset resolves a flag code for every entry", () => {
	const missingCodes = richestWomenEntries
		.filter((entry) => !getFlagCode(entry))
		.map((entry) => `${entry.order}:${entry.country}`);

	assert.deepEqual(missingCodes, []);
});

test("richest women dataset resolves every flag to the shared SVG baseline", () => {
	const unitedStatesEntry = richestWomenEntries.find((entry) => entry.country === "United States");
	const germanyEntry = richestWomenEntries.find((entry) => entry.country === "Germany");

	assert.ok(unitedStatesEntry);
	assert.ok(germanyEntry);
	assert.equal(getFlagSrc(unitedStatesEntry), "/flags/us.svg");
	assert.equal(getFlagSrc(germanyEntry), "/flags/de.svg");
});
