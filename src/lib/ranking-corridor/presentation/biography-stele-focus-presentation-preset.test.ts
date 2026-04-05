import assert from "node:assert/strict";
import test from "node:test";

import {
    applyBiographySteleCameraFit,
    BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS,
    BIOGRAPHY_STELE_PROJECTION_GATE_PRESET,
} from "./biography-stele-focus-presentation-preset";
import { RAIL_FOCUS_PROJECTION_GATE_PRESET } from "./rail-focus-presentation-preset";

test("biography stele camera fit applies the approved framing offsets", () => {
    const fitted = applyBiographySteleCameraFit({
        camX: 10,
        camY: 20,
        camZ: 30,
        lookX: 40,
        lookY: 50,
        lookZ: 60,
    });

    assert.deepEqual(fitted, {
        camX: 10 + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.camX,
        camY: 20 + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.camY,
        camZ: 30 + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.camZ,
        lookX: 40 + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.lookX,
        lookY: 50 + BIOGRAPHY_STELE_CAMERA_FIT_OFFSETS.lookY,
        lookZ: 60,
    });
});

test("biography stele presentation preset keeps the rail-focus projection gate defaults", () => {
    assert.deepEqual(BIOGRAPHY_STELE_PROJECTION_GATE_PRESET, RAIL_FOCUS_PROJECTION_GATE_PRESET);
});
