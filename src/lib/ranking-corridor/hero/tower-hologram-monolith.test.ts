import assert from "node:assert/strict";
import test from "node:test";

import { getTowerHologramMonolithFeatureState } from "./tower-hologram-monolith";

test("tower monolith feature state keeps full mode as the only projector/flag mode", () => {
    assert.deepEqual(getTowerHologramMonolithFeatureState("minimal"), {
        showDashboard: false,
        showProjector: false,
        showFlagAssembly: false,
    });
    assert.deepEqual(getTowerHologramMonolithFeatureState("standby"), {
        showDashboard: true,
        showProjector: false,
        showFlagAssembly: false,
    });
    assert.deepEqual(getTowerHologramMonolithFeatureState("full"), {
        showDashboard: true,
        showProjector: true,
        showFlagAssembly: true,
    });
    assert.deepEqual(getTowerHologramMonolithFeatureState("cinematic"), {
        showDashboard: true,
        showProjector: false,
        showFlagAssembly: false,
    });
});
