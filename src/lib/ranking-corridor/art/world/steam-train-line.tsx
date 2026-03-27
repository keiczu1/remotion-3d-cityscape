import {memo, useMemo} from "react";
import * as THREE from "three";

export const SteamTrainLine = memo(({
    curve,
    frame,
    seed,
    speed,
    direction = 1,
    carCount = 6,
    carLength = 14,
    carSpacing = 16.5,
    trackColor = "#292524",
    bodyColor = "#0a0a0a",
    cabinColor = "#292524",
    carriageColor = "#44403c",
    windowColor = "#fef08a",
    smokeColor = "#a8a29e",
    headlightColor = "#fef08a",
}: {
    curve: THREE.Curve<THREE.Vector3>;
    frame: number;
    seed: number;
    speed: number;
    direction?: 1 | -1;
    carCount?: number;
    carLength?: number;
    carSpacing?: number;
    trackColor?: string;
    bodyColor?: string;
    cabinColor?: string;
    carriageColor?: string;
    windowColor?: string;
    smokeColor?: string;
    headlightColor?: string;
}) => {
    const trackShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-3, 0);
        shape.lineTo(3, 0);
        shape.lineTo(2.5, 0.5);
        shape.lineTo(-2.5, 0.5);
        shape.lineTo(-3, 0);
        return shape;
    }, []);

    const trackGeometry = useMemo(
        () =>
            new THREE.ExtrudeGeometry(trackShape, {
                steps: 300,
                extrudePath: curve,
                bevelEnabled: false,
            }),
        [curve, trackShape],
    );

    const smokeGeometry = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
    const cycleDuration = 8000;
    const cyclePhase = (frame * speed + seed * 800) % cycleDuration;
    let tRaw = cyclePhase / (cycleDuration * 0.8);

    if (direction === -1) {
        tRaw = 1 - tRaw;
    }

    const trackLength = curve.getLength();
    const trainLengthT = carSpacing / Math.max(1, trackLength);
    const isVisible =
        direction === 1
            ? tRaw > 0 && tRaw < 1 + trainLengthT * carCount
            : tRaw < 1 && tRaw > -(trainLengthT * carCount);

    return (
        <group>
            <mesh geometry={trackGeometry}>
                <meshStandardMaterial color={trackColor} roughness={1} metalness={0} flatShading />
            </mesh>

            {isVisible && (
                <group>
                    {Array.from({length: carCount}).map((_, carIndex) => {
                        const carOffset = direction * carIndex * trainLengthT;
                        const carT = tRaw - carOffset;
                        if (carT <= 0 || carT >= 1) {
                            return null;
                        }

                        const position = curve.getPointAt(carT);
                        const tangent = curve.getTangentAt(carT);
                        if (direction === -1) {
                            tangent.negate();
                        }

                        const quaternion = new THREE.Quaternion().setFromUnitVectors(
                            new THREE.Vector3(0, 0, 1),
                            tangent,
                        );
                        const isLocomotive = carIndex === 0;

                        return (
                            <group key={carIndex} position={position} quaternion={quaternion}>
                                {isLocomotive ? (
                                    <group position={[0, 1.5, 0]}>
                                        <mesh position={[0, -0.5, 0]}>
                                            <boxGeometry args={[4, 1.5, carLength]} />
                                            <meshStandardMaterial color={bodyColor} roughness={0.8} />
                                        </mesh>
                                        <mesh position={[0, 1.5, 1]} rotation={[Math.PI / 2, 0, 0]}>
                                            <cylinderGeometry args={[1.6, 1.6, carLength - 4, 16]} />
                                            <meshStandardMaterial color="#1c1917" metalness={0.7} roughness={0.4} />
                                        </mesh>
                                        <mesh position={[0, 2.5, -4.5]}>
                                            <boxGeometry args={[4.2, 4, 4]} />
                                            <meshStandardMaterial color={cabinColor} roughness={0.9} />
                                        </mesh>
                                        <mesh position={[0, 3.5, 5]}>
                                            <cylinderGeometry args={[0.6, 0.4, 2, 8]} />
                                            <meshStandardMaterial color="#1c1917" metalness={0.8} />
                                        </mesh>
                                        <mesh position={[0, 0, carLength / 2 + 0.5]}>
                                            <cylinderGeometry args={[1, 1, 0.5, 16]} />
                                            <meshStandardMaterial
                                                color={headlightColor}
                                                emissive={headlightColor}
                                                emissiveIntensity={3}
                                                toneMapped={false}
                                            />
                                        </mesh>
                                        <pointLight
                                            position={[0, 0, carLength / 2 + 2]}
                                            intensity={30}
                                            distance={200}
                                            color={headlightColor}
                                        />
                                    </group>
                                ) : (
                                    <group position={[0, 1.5, 0]}>
                                        <mesh position={[0, -0.5, 0]}>
                                            <boxGeometry args={[3.8, 1, carLength - 1]} />
                                            <meshStandardMaterial color={bodyColor} roughness={0.8} />
                                        </mesh>
                                        <mesh position={[0, 1.5, 0]}>
                                            <boxGeometry args={[4, 3, carLength - 1.5]} />
                                            <meshStandardMaterial color={carriageColor} roughness={0.9} />
                                        </mesh>
                                        <mesh position={[0, 3.2, 0]}>
                                            <boxGeometry args={[4.2, 0.4, carLength - 1.5]} />
                                            <meshStandardMaterial color={cabinColor} roughness={0.8} />
                                        </mesh>
                                        <mesh position={[0, 1.5, 0]}>
                                            <boxGeometry args={[4.1, 1, carLength - 3]} />
                                            <meshStandardMaterial
                                                color={windowColor}
                                                emissive={windowColor}
                                                emissiveIntensity={0.5}
                                                toneMapped={false}
                                            />
                                        </mesh>
                                    </group>
                                )}
                            </group>
                        );
                    })}

                    {Array.from({length: 15}).map((_, puffIndex) => {
                        const smokeDelayT = (5 / Math.max(1, trackLength)) * direction;
                        const puffT = tRaw + smokeDelayT - puffIndex * 0.0015 * direction;
                        if (puffT <= 0 || puffT >= 1) {
                            return null;
                        }

                        const puffPosition = curve.getPointAt(puffT);
                        puffPosition.y += 5.5 + puffIndex * 1.5;
                        puffPosition.x += Math.sin(frame * 0.05 + puffIndex) * puffIndex * 0.3;
                        puffPosition.z += Math.cos(frame * 0.03 + puffIndex) * puffIndex * 0.3;

                        const puffScale = 1 + puffIndex * 0.3;
                        const puffOpacity = Math.max(0, 1 - puffIndex / 15);

                        return (
                            <mesh key={`smoke-${puffIndex}`} position={puffPosition} scale={puffScale} geometry={smokeGeometry}>
                                <meshStandardMaterial
                                    color={smokeColor}
                                    transparent
                                    opacity={puffOpacity * 0.8}
                                    depthWrite={false}
                                    fog={false}
                                />
                            </mesh>
                        );
                    })}
                </group>
            )}
        </group>
    );
});

SteamTrainLine.displayName = "SteamTrainLine";
