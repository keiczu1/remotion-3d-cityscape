import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";

import { composeInstanceMatrix } from "./instances";

test("composeInstanceMatrix preserves position scale and rotation", () => {
    const matrix = composeInstanceMatrix({
        position: [10, 20, 30],
        scale: 2,
        rotation: [0, 0, Math.PI / 2],
    });

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const rotation = new THREE.Euler();

    matrix.decompose(position, quaternion, scale);
    rotation.setFromQuaternion(quaternion);

    assert.equal(position.x, 10);
    assert.equal(position.y, 20);
    assert.equal(position.z, 30);
    assert.equal(scale.x, 2);
    assert.equal(scale.y, 2);
    assert.equal(scale.z, 2);
    assert.ok(Math.abs(rotation.z - Math.PI / 2) < 0.000001);
});
