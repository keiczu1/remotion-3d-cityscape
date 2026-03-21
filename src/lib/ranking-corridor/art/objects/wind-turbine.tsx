import * as THREE from "three";

const turbineTowerGeo = new THREE.CylinderGeometry(0.5, 1.2, 1, 12);
const turbineTowerMat = new THREE.MeshStandardMaterial({ color: "#D0D0D0" });
const turbineNacelleGeo = new THREE.BoxGeometry(1.5, 1.5, 4);
const turbineNacelleMat = new THREE.MeshStandardMaterial({ color: "#C8C8C8" });
const turbineHubGeo = new THREE.SphereGeometry(0.8, 12, 12);
const turbineHubMat = new THREE.MeshStandardMaterial({ color: "#B8B8B8" });
const turbineBladeGeo = new THREE.BoxGeometry(0.8, 20, 0.2);
const turbineBladeMat = new THREE.MeshStandardMaterial({ color: "#E0E0E0" });

const bladeAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3] as const;

const WindTurbineBlade = ({ rotation, bladeAngle }: { rotation: number; bladeAngle: number }) => (
    <group rotation={[0, 0, bladeAngle + rotation]}>
        <mesh position={[0, 10, 0]} geometry={turbineBladeGeo} material={turbineBladeMat} />
    </group>
);

export const WindTurbine = ({
    position,
    height,
    rotSpeed,
    yRot,
    frame,
}: {
    position: [number, number, number];
    height: number;
    rotSpeed: number;
    yRot: number;
    frame: number;
}) => {
    const rotation = (frame * rotSpeed * Math.PI * 2) / 360;

    return (
        <group position={position} rotation={[0, yRot, 0]}>
            <mesh position={[0, height / 2, 0]} scale={[1, height, 1]} geometry={turbineTowerGeo} material={turbineTowerMat} />
            <mesh position={[0, height, -0.5]} geometry={turbineNacelleGeo} material={turbineNacelleMat} />

            <group position={[0, height + 0.2, 1.8]}>
                <mesh geometry={turbineHubGeo} material={turbineHubMat} />
                {bladeAngles.map((angle, index) => (
                    <WindTurbineBlade key={index} rotation={rotation} bladeAngle={angle} />
                ))}
            </group>
        </group>
    );
};
