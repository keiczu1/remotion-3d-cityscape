import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { random, useCurrentFrame } from "remotion";

const AIR_TRAFFIC_VIEW_WIDTH = 2600;
const AIR_TRAFFIC_HALF_VIEW_WIDTH = AIR_TRAFFIC_VIEW_WIDTH / 2;

type AirTrafficPlane = {
    id: number;
    altitude: number;
    depth: number;
    speed: number;
    intervalOffset: number;
    scale: number;
    direction: 1 | -1;
    yDriftPhase: number;
};

const AIR_TRAFFIC_PLANES: Array<{
    altitude: [number, number];
    depth: [number, number];
    speed: [number, number];
    scale: [number, number];
    direction: 1 | -1;
}> = [
    { altitude: [96, 132], depth: [-42, -82], speed: [1.08, 1.32], scale: [1.45, 2.05], direction: 1 },
    { altitude: [88, 124], depth: [-72, -130], speed: [0.92, 1.18], scale: [1.1, 1.55], direction: -1 },
    { altitude: [102, 140], depth: [-145, -230], speed: [0.72, 0.94], scale: [0.72, 1.05], direction: 1 },
    { altitude: [116, 158], depth: [-260, -420], speed: [0.46, 0.68], scale: [0.42, 0.72], direction: -1 },
    { altitude: [128, 170], depth: [-430, -620], speed: [0.32, 0.48], scale: [0.24, 0.42], direction: 1 },
    { altitude: [92, 130], depth: [-95, -170], speed: [0.86, 1.08], scale: [0.95, 1.3], direction: -1 },
    { altitude: [138, 182], depth: [-520, -760], speed: [0.28, 0.42], scale: [0.18, 0.34], direction: 1 },
];

export const Airplane = ({ color = "#E2E8F0" }: { color?: string }) => {
    return (
        <group scale={1}>
            {/* Fuselage */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <cylinderGeometry args={[0.5, 0.5, 4, 8]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* Nose */}
            <mesh position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.5, 1, 8]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* Wings */}
            <mesh position={[0.5, 0, 0]}>
                <boxGeometry args={[1.5, 0.1, 6]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* Tail */}
            <mesh position={[-1.5, 0.4, 0]}>
                <boxGeometry args={[1, 1.2, 0.1]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            <mesh position={[-1.5, 0, 0]}>
                <boxGeometry args={[1, 0.1, 2.5]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
        </group>
    );
};

export const BackgroundAirTraffic = () => {
    const planesRef = useRef<THREE.Group>(null);
    const frame = useCurrentFrame();
    
    const planes = useMemo<AirTrafficPlane[]>(() => {
        return AIR_TRAFFIC_PLANES.map((tier, i) => {
            const mixRange = ([from, to]: [number, number], key: string) => from + random(key) * (to - from);

            return {
                id: i,
                altitude: mixRange(tier.altitude, `airplane-altitude-${i}`),
                depth: mixRange(tier.depth, `airplane-depth-${i}`),
                speed: mixRange(tier.speed, `airplane-speed-${i}`),
                intervalOffset: random(`airplane-offset-${i}`) * AIR_TRAFFIC_VIEW_WIDTH,
                scale: mixRange(tier.scale, `airplane-scale-${i}`),
                direction: tier.direction,
                yDriftPhase: random(`airplane-drift-${i}`) * Math.PI * 2,
            };
        });
    }, []);

    useFrame((state) => {
        if (!planesRef.current) return;
        
        const cameraX = state.camera.position.x;
        // Move each plane
        planesRef.current.children.forEach((planeMesh, i) => {
            const plane = planes[i];
            const cycle = (frame * plane.speed + plane.intervalOffset) % AIR_TRAFFIC_VIEW_WIDTH;
            const xOffset = (cycle - AIR_TRAFFIC_HALF_VIEW_WIDTH) * plane.direction;
            const altitudeDrift = Math.sin(frame * 0.012 + plane.yDriftPhase) * plane.scale * 1.8;

            planeMesh.position.set(cameraX + xOffset, plane.altitude + altitudeDrift, plane.depth);
            planeMesh.rotation.set(0, plane.direction === 1 ? 0 : Math.PI, 0);
            planeMesh.scale.setScalar(plane.scale);
        });
    });

    return (
        <group ref={planesRef}>
            {planes.map((plane) => (
                <group key={plane.id}>
                    <Airplane color="#F8FAFC" />
                </group>
            ))}
        </group>
    );
};
