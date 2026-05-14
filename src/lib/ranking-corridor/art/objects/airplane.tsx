import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

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
    
    // Create 5 planes with random offsets
    const planes = useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => {
            return {
                id: i,
                altitude: 60 + Math.random() * 40, // Height from 60 to 100
                depth: -100 - Math.random() * 200,  // Z-depth from -100 to -300
                speed: 0.2 + Math.random() * 0.1,  // Flying speed
                intervalOffset: Math.random() * 2000, // Time offset
            };
        });
    }, []);

    useFrame((state) => {
        if (!planesRef.current) return;
        
        const cameraX = state.camera.position.x;
        const time = state.clock.getElapsedTime() * 60; // Approximate frames
        
        // Move each plane
        planesRef.current.children.forEach((planeMesh, i) => {
            const plane = planes[i];
            const viewWidth = 800;
            const cycle = (time * plane.speed + plane.intervalOffset) % viewWidth;
            
            // Plane goes from cameraX - 400 to cameraX + 400
            const xOffset = cycle - 400;
            
            planeMesh.position.set(cameraX + xOffset, plane.altitude, plane.depth);
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
