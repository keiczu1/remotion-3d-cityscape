import { memo, useMemo } from "react";
import * as THREE from "three";

import { StaticInstances } from "../../../lib/ranking-corridor/three";
import { getFlagCode } from "../model/data";
import { type SteleRenderMode, reversedData } from "../scene/scene-logic";
import { Flag } from "./Flag";
import { STELE_DEPTH, STELE_ROW_Z, STELE_WIDTH, X_SPACING, getSteleHeight } from "../scene/scene-logic";

const sharedSteleBodyGeometry = new THREE.BoxGeometry(1, 1, 1);
const sharedSteleBodyMaterial = new THREE.MeshStandardMaterial({
    color: "#1E293B",
    roughness: 0.34,
    metalness: 0.54,
});
const sharedTopCapGeometry = new THREE.BoxGeometry(1, 1, 1);
const sharedTopCapMaterial = new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    emissive: "#00E5FF",
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.7,
});
const sharedEdgeStripGeometry = new THREE.BoxGeometry(1, 1, 1);
const sharedEdgeStripMaterial = new THREE.MeshStandardMaterial({
    color: "#00E5FF",
    emissive: "#00E5FF",
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.5,
});
const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({ color: "#FBBF24" });
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({ color: "#94A3B8" });
const sharedFlagPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 12);

const STELE_POLE_X = 12.2;
const STELE_FLAG_X = 15.2;

const composeMatrix = ({
    position,
    rotation = [0, 0, 0] as [number, number, number],
    scale = [1, 1, 1] as [number, number, number],
}: {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
}) =>
    new THREE.Matrix4().compose(
        new THREE.Vector3(...position),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(...scale),
    );

export const CinematicSteleBatch = memo(({
    mountedIndices,
    renderModes,
}: {
    mountedIndices: number[];
    renderModes: SteleRenderMode[];
}) => {
    const stelePack = useMemo(() => {
        const bodyMatrices: THREE.Matrix4[] = [];
        const topCapMatrices: THREE.Matrix4[] = [];
        const edgeStripMatrices: THREE.Matrix4[] = [];
        const flagPoleMatrices: THREE.Matrix4[] = [];
        const flagTopMatrices: THREE.Matrix4[] = [];
        const flags: { key: string; flagCode: string; position: [number, number, number] }[] = [];

        mountedIndices.forEach((index) => {
            const item = reversedData[index];
            if (!item) {
                return;
            }

            const xPos = index * X_SPACING;
            const height = getSteleHeight(item.relHeight);
            const poleTopY = height + 10;
            const flagY = height + 8;
            const flagCode = getFlagCode(item);

            bodyMatrices.push(
                composeMatrix({
                    position: [xPos, height / 2, STELE_ROW_Z],
                    scale: [STELE_WIDTH, height, STELE_DEPTH],
                }),
            );
            topCapMatrices.push(
                composeMatrix({
                    position: [xPos, height + 0.3, STELE_ROW_Z],
                    scale: [STELE_WIDTH + 0.4, 0.6, STELE_DEPTH + 0.4],
                }),
            );
            edgeStripMatrices.push(
                composeMatrix({
                    position: [xPos - (STELE_WIDTH / 2 + 0.12), height / 2, STELE_ROW_Z],
                    scale: [0.2, height, 0.2],
                }),
                composeMatrix({
                    position: [xPos + (STELE_WIDTH / 2 + 0.12), height / 2, STELE_ROW_Z],
                    scale: [0.2, height, 0.2],
                }),
            );

            if (!flagCode || renderModes[index] !== "cinematic") {
                return;
            }

            flagPoleMatrices.push(
                composeMatrix({
                    position: [xPos + STELE_POLE_X, poleTopY / 2, STELE_ROW_Z],
                    scale: [1, poleTopY, 1],
                }),
            );
            flagTopMatrices.push(
                composeMatrix({
                    position: [xPos + STELE_POLE_X, poleTopY, STELE_ROW_Z],
                }),
            );
            flags.push({
                key: `${item.order}-${flagCode}`,
                flagCode,
                position: [xPos + STELE_FLAG_X, flagY, STELE_ROW_Z],
            });
        });

        return {
            bodyMatrices,
            topCapMatrices,
            edgeStripMatrices,
            flagPoleMatrices,
            flagTopMatrices,
            flags,
        };
    }, [mountedIndices, renderModes]);

    return (
        <group>
            <StaticInstances
                geometry={sharedSteleBodyGeometry}
                material={sharedSteleBodyMaterial}
                matrices={stelePack.bodyMatrices}
            />
            <StaticInstances
                geometry={sharedTopCapGeometry}
                material={sharedTopCapMaterial}
                matrices={stelePack.topCapMatrices}
            />
            <StaticInstances
                geometry={sharedEdgeStripGeometry}
                material={sharedEdgeStripMaterial}
                matrices={stelePack.edgeStripMatrices}
            />
            <StaticInstances
                geometry={sharedFlagPoleGeometry}
                material={sharedFlagPoleMaterial}
                matrices={stelePack.flagPoleMatrices}
            />
            <StaticInstances
                geometry={sharedFlagTopGeometry}
                material={sharedFlagTopMaterial}
                matrices={stelePack.flagTopMatrices}
            />
            {stelePack.flags.map((flag) => (
                <Flag key={flag.key} flagCode={flag.flagCode} position={flag.position} />
            ))}
        </group>
    );
});

CinematicSteleBatch.displayName = "CinematicSteleBatch";
