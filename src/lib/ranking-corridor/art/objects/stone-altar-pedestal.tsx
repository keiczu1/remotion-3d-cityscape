import {memo, useMemo} from "react";
import * as THREE from "three";

const RoughStoneGeometry = ({
    width,
    height,
    depth,
    seed,
}: {
    width: number;
    height: number;
    depth: number;
    seed: number;
}) => {
    const geometry = useMemo(() => {
        const segX = Math.max(3, Math.floor(width * 1.5));
        const segY = Math.max(3, Math.floor(height * 1.5));
        const segZ = Math.max(3, Math.floor(depth * 1.5));
        const boxGeometry = new THREE.BoxGeometry(width, height, depth, segX, segY, segZ);
        const positions = boxGeometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let index = 0; index < positions.count; index++) {
            vertex.fromBufferAttribute(positions, index);
            const nx = vertex.x * 1.2 + seed * 13.37;
            const ny = vertex.y * 1.2 + seed * 13.37;
            const nz = vertex.z * 1.2 + seed * 13.37;
            const noise = Math.sin(nx) * Math.cos(ny) * Math.sin(nz) * 0.4;
            const noise2 = Math.sin(nx * 2.3) * Math.cos(ny * 2.3 + nz * 2.3) * 0.15;
            const totalNoise = noise + noise2;
            const distFromCenterX = Math.abs(vertex.x) / (width / 2) || 0;
            const distFromCenterY = Math.abs(vertex.y) / (height / 2) || 0;
            const distFromCenterZ = Math.abs(vertex.z) / (depth / 2) || 0;

            vertex.x += Math.sign(vertex.x) * totalNoise * 0.5 * (0.2 + 0.8 * distFromCenterX);
            vertex.y += Math.sign(vertex.y) * totalNoise * 0.5 * (0.2 + 0.8 * distFromCenterY);
            vertex.z += Math.sign(vertex.z) * totalNoise * 0.5 * (0.2 + 0.8 * distFromCenterZ);

            positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
        }

        boxGeometry.computeVertexNormals();
        return boxGeometry;
    }, [depth, height, seed, width]);

    return <primitive object={geometry} attach="geometry" />;
};

export const StoneAltarPedestal = memo(({
    width,
    height,
    depth,
    seed,
    baseColor = "#57534e",
    capColor = "#78716c",
}: {
    width: number;
    height: number;
    depth: number;
    seed: number;
    baseColor?: string;
    capColor?: string;
}) => {
    const capWidth = width * 0.75;
    const capDepth = depth * 0.75;
    const capHeight = Math.min(2.5, height * 0.35);
    const baseHeight = height - capHeight;

    return (
        <group>
            <mesh position={[0, baseHeight / 2, 0]}>
                <RoughStoneGeometry width={width} height={baseHeight} depth={depth} seed={seed} />
                <meshStandardMaterial color={baseColor} roughness={1} metalness={0} flatShading />
            </mesh>

            <mesh position={[0, baseHeight + capHeight / 2, 0]}>
                <RoughStoneGeometry width={capWidth} height={capHeight} depth={capDepth} seed={seed + 100} />
                <meshStandardMaterial color={capColor} roughness={1} metalness={0} flatShading />
            </mesh>
        </group>
    );
});

StoneAltarPedestal.displayName = "StoneAltarPedestal";
