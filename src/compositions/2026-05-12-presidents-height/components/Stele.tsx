import { memo } from "react";
import * as THREE from "three";

import { MediaSteleShell } from "../../../lib/ranking-corridor/art";
import { getFlagCode } from "../model/data";
import { type RichWomanItem } from "../model/types";
import { Flag } from "./Flag";
import {
    STELE_DEPTH,
    STELE_ROW_Z,
    STELE_WIDTH,
    X_SPACING,
    getSteleHeight,
    type SteleRenderMode,
} from "../scene/scene-logic";

const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({ color: "#FBBF24" });
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({ color: "#94A3B8" });
const sharedFlagPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 12);

export const Stele = memo(
    ({
        item,
        index,
        renderMode,
    }: {
        item: RichWomanItem;
        index: number;
        renderMode: SteleRenderMode;
    }) => {
        const height = getSteleHeight(item.relHeight);
        const xPos = index * X_SPACING;
        const shouldHideCarrier = false;
        const flagCode = getFlagCode(item);
        const shouldShowFlag =
            (renderMode === "full" || renderMode === "cinematic") && Boolean(flagCode);
        const poleTopY = height + 10;
        const flagY = height + 8;
        const poleX = 12.2;
        const flagX = 15.2;

        return (
            <group position={[xPos, 0, STELE_ROW_Z]}>
                {!shouldHideCarrier ? (
                    <MediaSteleShell
                        width={STELE_WIDTH}
                        height={height}
                        depth={STELE_DEPTH}
                        renderMode={renderMode}
                    />
                ) : null}
                {shouldShowFlag && flagCode ? (
                    <>
                        <Flag flagCode={flagCode} position={[flagX, flagY, 0]} />
                        <mesh
                            position={[poleX, poleTopY / 2, 0]}
                            geometry={sharedFlagPoleGeometry}
                            material={sharedFlagPoleMaterial}
                            scale={[1, poleTopY, 1]}
                        />
                        <mesh
                            position={[poleX, poleTopY, 0]}
                            geometry={sharedFlagTopGeometry}
                            material={sharedFlagTopMaterial}
                        />
                    </>
                ) : null}
            </group>
        );
    }
);

Stele.displayName = "Stele";
