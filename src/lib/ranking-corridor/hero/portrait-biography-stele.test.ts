import assert from "node:assert/strict";
import test from "node:test";

import {
	formatPortraitBiographySteleLifeYears,
	formatPortraitBiographySteleName,
	shortenPortraitBiographySteleOrigin,
	wrapPortraitBiographySteleLines,
} from "./portrait-biography-stele";

test("portrait biography stele balances long names into two lines", () => {
	assert.equal(
		formatPortraitBiographySteleName("Mary Alice Dorrance Malone"),
		"Mary Alice\nDorrance Malone",
	);
});

test("portrait biography stele keeps short names on one line", () => {
	assert.equal(formatPortraitBiographySteleName("Hetty Green"), "Hetty Green");
});

test("portrait biography stele formats open-ended life years", () => {
	assert.equal(formatPortraitBiographySteleLifeYears("1924-"), "1924 - ...");
});

test("portrait biography stele shortens known wealth origins", () => {
	assert.equal(shortenPortraitBiographySteleOrigin("inherited and expanded"), "Inherited+");
	assert.equal(shortenPortraitBiographySteleOrigin("family business"), "Family Biz");
});

test("portrait biography stele wraps and truncates copy deterministically", () => {
	const lines = wrapPortraitBiographySteleLines(
		"The Harbert fortune started in construction and later spread into investments.",
		14,
		3,
	);

	assert.equal(lines.length, 3);
	assert.equal(lines[lines.length - 1]?.endsWith("..."), true);
});
