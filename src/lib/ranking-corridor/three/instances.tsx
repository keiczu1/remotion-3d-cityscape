import * as THREE from "three";
import { memo, type ReactNode, useLayoutEffect, useRef } from "react";

export const composeInstanceMatrix = ({
    position,
    scale = 1,
    rotation = [0, 0, 0] as [number, number, number],
}: {
    position: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
}) =>
    new THREE.Matrix4().compose(
        new THREE.Vector3(...position),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
        new THREE.Vector3(scale, scale, scale),
    );

export const StaticInstances = memo(({
    geometry,
    material,
    matrices,
}: {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    matrices: THREE.Matrix4[];
}) => {
    const ref = useRef<THREE.InstancedMesh>(null);

    useLayoutEffect(() => {
        const mesh = ref.current;
        if (!mesh) {
            return;
        }

        mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        matrices.forEach((matrix, index) => {
            mesh.setMatrixAt(index, matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [matrices]);

    if (matrices.length === 0) {
        return null;
    }

    return <instancedMesh ref={ref} args={[geometry, material, matrices.length]} />;
});
StaticInstances.displayName = "StaticInstances";

export const DynamicInstances = memo(({
    geometry,
    matrices,
    children,
}: {
    geometry: THREE.BufferGeometry;
    matrices: THREE.Matrix4[];
    children: ReactNode;
}) => {
    const ref = useRef<THREE.InstancedMesh>(null);

    useLayoutEffect(() => {
        const mesh = ref.current;
        if (!mesh) {
            return;
        }

        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.count = matrices.length;
        matrices.forEach((matrix, index) => {
            mesh.setMatrixAt(index, matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    }, [matrices]);

    if (matrices.length === 0) {
        return null;
    }

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} frustumCulled={false}>
            <primitive object={geometry} attach="geometry" />
            {children}
        </instancedMesh>
    );
});
DynamicInstances.displayName = "DynamicInstances";
