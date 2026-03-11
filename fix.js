const fs = require('fs');
const path = 'd:/Git/Keiczu1/Remotion/src/Scene.tsx';
let s = fs.readFileSync(path, 'utf8');

// 1. react imports
s = s.replace('import { useMemo, Suspense, useState, useEffect } from "react";', 'import { useMemo, Suspense, useState, useEffect, useRef } from "react";');

// 2. globals
s = s.replace(/import \{ useThree, useLoader \} from "@react-three\/fiber";/, `import { useThree, useLoader } from "@react-three/fiber";

// --- GLOBAL CACHE FOR PERFORMANCE ---
const sharedBoxGeo = new THREE.BoxGeometry(20, 32, 0.4);
const sharedEdgesGeo = new THREE.EdgesGeometry(sharedBoxGeo);
const treeTrunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 4, 7);
const treeTrunkMat = new THREE.MeshStandardMaterial({ color: "#8B5A2B", roughness: 0.9 });
const treeLeavesGeo = new THREE.DodecahedronGeometry(3, 0);
const treeLeavesMat = new THREE.MeshStandardMaterial({ color: "#4CAF50", roughness: 0.8 });
const cloudGeo = new THREE.SphereGeometry(1, 6, 6);
const cloudMat = new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.6, roughness: 1 });`);

// 3. EdgesGeometry
s = s.replace(/<lineSegments>\s+<edgesGeometry args=\{\[new THREE\.BoxGeometry\(20, 32, 0\.4\)\]\} \/>/g, '<lineSegments geometry={sharedEdgesGeo}>');

// 4. Smoothness
s = s.replace(/smoothness=\{4\}/g, 'smoothness={2}');

// 5. LowPolyTree and Clouds
let treeAndCloudsStart = s.indexOf('const LowPolyTree =');
let envEnd = s.indexOf('const BackgroundEnvironment = () => {');
if (treeAndCloudsStart !== -1 && envEnd !== -1) {
    const replacement = `const TreesInstanced = () => {
    const trunkRef = useRef<THREE.InstancedMesh>(null);
    const leavesRef = useRef<THREE.InstancedMesh>(null);
    
    useEffect(() => {
        if (!trunkRef.current || !leavesRef.current) return;
        const dummy = new THREE.Object3D();
        
        const trees = [];
        for (let i = -10; i < 60; i++) {
            trees.push({ x: i * 15 + random(\`t-b-x-\${i}\`) * 8, z: -30 - random(\`t-b-z-\${i}\`) * 20, scale: 1.5 + random(\`t-b-s-\${i}\`) });
            trees.push({ x: i * 20 + random(\`t-m-x-\${i}\`) * 10, z: -15 - random(\`t-m-z-\${i}\`) * 5, scale: 1 + random(\`t-m-s-\${i}\`) * 0.5 });
        }
        
        let leafIdx = 0;
        trees.forEach((t, i) => {
            dummy.position.set(t.x, 2 * t.scale, t.z);
            dummy.scale.set(t.scale, t.scale, t.scale);
            dummy.updateMatrix();
            trunkRef.current!.setMatrixAt(i, dummy.matrix);
            
            dummy.position.set(t.x, 5 * t.scale, t.z);
            dummy.scale.set(t.scale, t.scale, t.scale);
            dummy.updateMatrix();
            leavesRef.current!.setMatrixAt(leafIdx++, dummy.matrix);
            
            dummy.position.set(t.x + 1.5 * t.scale, 6 * t.scale, t.z + 1 * t.scale);
            dummy.scale.set(t.scale * 0.8, t.scale * 0.8, t.scale * 0.8);
            dummy.updateMatrix();
            leavesRef.current!.setMatrixAt(leafIdx++, dummy.matrix);
            
            dummy.position.set(t.x - 1.5 * t.scale, 6 * t.scale, t.z - 1 * t.scale);
            dummy.scale.set(t.scale * 0.7, t.scale * 0.7, t.scale * 0.7);
            dummy.updateMatrix();
            leavesRef.current!.setMatrixAt(leafIdx++, dummy.matrix);
        });
        
        trunkRef.current.instanceMatrix.needsUpdate = true;
        leavesRef.current.instanceMatrix.needsUpdate = true;
    }, []);

    return (
        <group>
            <instancedMesh ref={trunkRef} args={[treeTrunkGeo, treeTrunkMat, 140]} />
            <instancedMesh ref={leavesRef} args={[treeLeavesGeo, treeLeavesMat, 420]} />
        </group>
    );
};

const CloudsInstanced = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    useEffect(() => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        for (let i = 0; i < 200; i++) {
            dummy.position.set((random(\`c-x-\${i}\`) - 0.2) * 1500, 60 + random(\`c-y-\${i}\`) * 250, -80 - random(\`c-z-\${i}\`) * 100);
            const scale = 5 + random(\`c-s-\${i}\`) * 15;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, []);
    return (
        <instancedMesh ref={meshRef} args={[cloudGeo, cloudMat, 200]} />
    );
};

`;
    s = s.substring(0, treeAndCloudsStart) + replacement + s.substring(envEnd);
}

// 6. BackgroundEnvironment runtime hook removals
let bgEnvStart = s.indexOf('const BackgroundEnvironment = () => {');
let retStart = s.indexOf('return (', bgEnvStart);
if (bgEnvStart !== -1 && retStart !== -1) {
    s = s.substring(0, bgEnvStart) + 'const BackgroundEnvironment = () => {\\n    ' + s.substring(retStart);
}

// 7. Render replacement
s = s.replace(/\{trees\.map\(\(t, idx\) => \([\s\S]*?\}\)\}/, '');
s = s.replace(/<Clouds \/>/, '<TreesInstanced />\\n            <CloudsInstanced />');

fs.writeFileSync(path, s);
