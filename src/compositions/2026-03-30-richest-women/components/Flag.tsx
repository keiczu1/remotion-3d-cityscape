import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

import { getFlagTextureUrl } from "../assets/asset-urls";
import { useSharedTexture } from "../assets/texture-cache";

export const Flag = ({
    flagCode,
    position,
}: {
    flagCode: string;
    position: [number, number, number];
}) => {
    const texture = useSharedTexture(getFlagTextureUrl(flagCode), "flag");
    const frame = useCurrentFrame();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTexture: { value: texture },
        }),
        [texture]
    );

    if (!texture) {
        return null;
    }

    uniforms.uTime.value = frame * 0.05;

    return (
        <mesh position={position} castShadow>
            <planeGeometry args={[6, 4, 16, 16]} />
            <shaderMaterial
                vertexShader={`
                    varying vec2 vUv;
                    uniform float uTime;
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        float wave = sin(pos.x * 2.0 - uTime * 3.0) * uv.x * 1.5;
                        pos.z += wave;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
                fragmentShader={`
                    uniform sampler2D uTexture;
                    varying vec2 vUv;
                    void main() {
                        gl_FragColor = texture2D(uTexture, vUv);
                    }
                `}
                uniforms={uniforms}
                side={THREE.DoubleSide}
                transparent
            />
        </mesh>
    );
};
