import { memo } from "react";
import * as THREE from "three";

import { StoneAltarPedestal } from "../../../lib/ranking-corridor/art";
import { type LeaderSalaryEntry } from "../data/types";
import {
  STELE_DEPTH,
  STELE_ROW_Z,
  STELE_WIDTH,
  X_SPACING,
  getSteleHeight,
  type SteleRenderMode,
} from "./scene-logic";
import { HeroPedestal } from "./HeroPedestal";
import { STELE_DASHBOARD_ROOT_OFFSET_Y } from "../components/stele-dashboard-layout";
import { Flag } from "../components/Flag";

const sharedPopulationBaseGeometry = new THREE.CylinderGeometry(1, 1, 0.08, 64);
const sharedPopulationRingGeometry = new THREE.RingGeometry(0.72, 1, 64);
const sharedFlagTopGeometry = new THREE.SphereGeometry(0.3);
const sharedFlagTopMaterial = new THREE.MeshStandardMaterial({
  color: "#FBBF24",
});
const sharedFlagPoleMaterial = new THREE.MeshStandardMaterial({
  color: "#94A3B8",
});
const sharedFlagPoleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 12);
const sharedPopulationBaseMaterial = new THREE.MeshBasicMaterial({
  color: "#0EA5E9",
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
});
const sharedPopulationRingMaterial = new THREE.MeshBasicMaterial({
  color: "#BAE6FD",
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
  side: THREE.DoubleSide,
});

export const Pedestal = memo(
  ({
    item,
    index,
    renderMode,
  }: {
    item: LeaderSalaryEntry;
    index: number;
    renderMode: SteleRenderMode;
  }) => {
    const rank = item.rank;
    const height = getSteleHeight(item.relHeight);
    const xPos = index * X_SPACING;
    const showDashboard = renderMode !== "minimal";

    const poleHeight = height + 10;
    const poleY = poleHeight / 2;
    const poleX = 10;
    const flagZ = 0;
    const populationRadius = 5.2 + item.populationScale * 10.5;

    return (
      <group position={[xPos, 0, STELE_ROW_Z]}>
        <group position={[0, 0.06, 0]}>
          <mesh
            geometry={sharedPopulationBaseGeometry}
            material={sharedPopulationBaseMaterial}
            scale={[populationRadius, 1, populationRadius]}
          />
          <mesh
            geometry={sharedPopulationRingGeometry}
            material={sharedPopulationRingMaterial}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[populationRadius, populationRadius, 1]}
          />
        </group>
        <StoneAltarPedestal
          width={STELE_WIDTH}
          height={height}
          depth={STELE_DEPTH}
          seed={index}
        />

        {/* Dashboard (floating info card above stele) */}
        {showDashboard && (
          <HeroPedestal
            item={item}
            dashboardBaseY={height + STELE_DASHBOARD_ROOT_OFFSET_Y}
            worldX={xPos}
            worldZ={STELE_ROW_Z}
            rank={rank}
            index={index}
            renderMode={renderMode}
          />
        )}

        {showDashboard && (
          <group>
            <mesh
              position={[poleX, poleY, flagZ]}
              geometry={sharedFlagPoleGeometry}
              material={sharedFlagPoleMaterial}
              scale={[1, poleHeight, 1]}
              castShadow
            />
            <mesh
              position={[poleX, poleHeight, flagZ]}
              geometry={sharedFlagTopGeometry}
              material={sharedFlagTopMaterial}
            />
            <Flag
              country={item.iso3}
              position={[poleX + 2.7, poleHeight - 1.8, flagZ]}
              scale={0.9}
            />
          </group>
        )}
      </group>
    );
  },
);

Pedestal.displayName = "Pedestal";
