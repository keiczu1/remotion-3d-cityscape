import test from "node:test";
import assert from "node:assert/strict";

import { getFaviconTextureUrl, getFlagTextureUrl } from "../compositions/ranking-towers/assets/asset-urls";

test("favicon URLs resolve to local static assets", () => {
    assert.equal(getFaviconTextureUrl("google.com"), "/favicons/google.com.png");
});

test("flag URLs normalize country codes to lowercase static assets", () => {
    assert.equal(getFlagTextureUrl("US"), "/flags/us.png");
});
