import test from "node:test";
import assert from "node:assert/strict";

import { getMediaSteleShellVisualPolicy } from "./media-stele-shell";

test("media stele shell keeps premium body only for full mode", () => {
    assert.equal(getMediaSteleShellVisualPolicy("full").useHeroBody, true);
    assert.equal(getMediaSteleShellVisualPolicy("standby").useHeroBody, false);
    assert.equal(getMediaSteleShellVisualPolicy("minimal").useHeroBody, false);
});

test("media stele shell hides top cap and accent strips in minimal mode", () => {
    const minimal = getMediaSteleShellVisualPolicy("minimal");
    const standby = getMediaSteleShellVisualPolicy("standby");

    assert.equal(minimal.showTopCap, false);
    assert.equal(minimal.showAccentStrips, false);
    assert.equal(standby.showTopCap, true);
    assert.equal(standby.showAccentStrips, true);
});
