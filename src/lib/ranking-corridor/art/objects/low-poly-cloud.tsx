import * as THREE from "three";

const cloudSphereGeo = new THREE.SphereGeometry(1, 6, 6);

export const LowPolyCloud = ({
    opacity,
    color,
    flashIntensity = 0,
}: {
    opacity: number;
    color: THREE.ColorRepresentation;
    flashIntensity?: number;
}) => {
    return (
        <group>
            <mesh position={[0, 0, 0]} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={color} emissive="#E0F2FE" emissiveIntensity={flashIntensity} transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[1.2, -0.2, 0]} scale={0.8} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={color} emissive="#E0F2FE" emissiveIntensity={flashIntensity * 0.9} transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[-1.2, -0.2, 0]} scale={0.7} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={color} emissive="#E0F2FE" emissiveIntensity={flashIntensity * 0.8} transparent opacity={opacity} roughness={1} />
            </mesh>
            <mesh position={[0, 0.5, 0.3]} scale={0.65} geometry={cloudSphereGeo}>
                <meshStandardMaterial color={color} emissive="#E0F2FE" emissiveIntensity={flashIntensity * 0.7} transparent opacity={opacity} roughness={1} />
            </mesh>
        </group>
    );
};
