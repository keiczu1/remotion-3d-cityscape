import test from "node:test";
import assert from "node:assert/strict";

import { getTowerRenderMode, milestones } from "../scene/scene-logic";

test("canonical composition path exposes ranking tower scene logic", () => {
    assert.equal(getTowerRenderMode(milestones[0].arriveFrame + 10, 0), "full");
});
