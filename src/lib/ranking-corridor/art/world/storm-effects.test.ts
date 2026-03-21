import test from "node:test";
import assert from "node:assert/strict";

import { getStormLightningBurstState, getStormRainIntensity } from "./storm-effects";

test("storm rain intensity ramps up and then fades out", () => {
    assert.equal(getStormRainIntensity(0.6), 0);
    assert.ok(getStormRainIntensity(0.85) > getStormRainIntensity(0.7));
    assert.ok(getStormRainIntensity(0.9) > getStormRainIntensity(0.98));
    assert.equal(getStormRainIntensity(0.99), 0);
});

test("storm lightning burst state uses explicit anchors instead of hidden cloud seeds", () => {
    let burst = null;

    for (let frame = 0; frame < 2000; frame++) {
        burst = getStormLightningBurstState({
            frame,
            progress: 0.8,
            anchors: [{ x: 777, y: 123, z: -321, scale: 9, speed: 0.11 }],
            cloudSpeedMultiplier: 1.6,
        });
        if (burst !== null) {
            break;
        }
    }

    assert.notEqual(burst, null);
    assert.equal(burst?.flashY, 123);
    assert.equal(burst?.flashZ, -321);
    assert.equal(burst?.cloudScale, 9);
});
