import test from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import path from "node:path";

import {getFaviconTextureUrl, getFlagTextureUrl} from "../compositions/ranking-towers/assets/asset-urls";

test("favicon URLs resolve to local static assets", () => {
	assert.equal(getFaviconTextureUrl("google.com"), "/favicons/google.com.png");
});

test("flag URLs use a uniform SVG baseline", () => {
	assert.equal(getFlagTextureUrl("US"), "/flags/us.svg");
});

test("flag URLs resolve SVG assets for broader country coverage", () => {
	assert.equal(getFlagTextureUrl("DE"), "/flags/de.svg");
});

test("shared flags folder includes broader world coverage samples", () => {
	assert.equal(existsSync(path.join(process.cwd(), "public", "flags", "us.svg")), true);
	assert.equal(existsSync(path.join(process.cwd(), "public", "flags", "za.svg")), true);
	assert.equal(existsSync(path.join(process.cwd(), "public", "flags", "ar.svg")), true);
});
