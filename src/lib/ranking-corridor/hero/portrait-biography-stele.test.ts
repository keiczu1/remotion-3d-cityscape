import assert from "node:assert/strict";
import test from "node:test";

import {
	formatPortraitBiographySteleLifeYears,
	formatPortraitBiographySteleName,
	getTypewriterTextState,
	getWrappedTypewriterTextState,
	shortenPortraitBiographySteleOrigin,
	wrapPortraitBiographySteleLines,
	wrapPortraitBiographySteleLinesFull,
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

test("portrait biography stele can wrap full copy without trimming", () => {
	const lines = wrapPortraitBiographySteleLinesFull(
		"She became rich through FCC, a business built on construction, water systems and services.",
		29,
	);

	assert.equal(lines.join(" "), "She became rich through FCC, a business built on construction, water systems and services.");
	assert.equal(lines.some((line) => line.endsWith("...")), false);
	assert.ok(lines.length > 3);
});

test("portrait biography stele typewriter reveals text progressively without cursor", () => {
	const beforeStart = getTypewriterTextState({
		text: "Hello world",
		frame: -1,
		fps: 60,
	});
	const start = getTypewriterTextState({
		text: "Hello world",
		frame: 0,
		fps: 60,
	});
	const mid = getTypewriterTextState({
		text: "Hello world",
		frame: 12,
		fps: 60,
	});
	const complete = getTypewriterTextState({
		text: "Hello world",
		frame: 40,
		fps: 60,
	});

	assert.equal(beforeStart.text, "");
	assert.equal(beforeStart.isComplete, false);
	assert.equal(start.text, "H");
	assert.notEqual(mid.text, "Hello world");
	assert.equal(mid.isComplete, false);
	assert.equal(complete.text, "Hello world");
	assert.equal(complete.isComplete, true);
});

test("portrait biography stele typewriter keeps planned line breaks stable across wraps", () => {
	const wrapped = getWrappedTypewriterTextState({
		text: "Alpha beta gamma delta epsilon zeta eta theta",
		frame: 60,
		fps: 60,
		maxChars: 14,
	});

	assert.deepEqual(wrapped.plannedLines, [
		"Alpha beta",
		"gamma delta",
		"epsilon zeta",
		"eta theta",
	]);
	assert.equal(wrapped.visibleLines[0], "Alpha beta");
	assert.ok(wrapped.visibleLines[1]?.startsWith("g"));
});
