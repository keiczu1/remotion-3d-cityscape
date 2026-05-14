import { useMemo, useEffect, useState } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { getFlagAssetUrl } from "../../../assets/flag-asset-url";

const useSvgSafeTexture = (url: string | null) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (!url) return;

        let isCancelled = false;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            if (isCancelled) return;
            const canvas = document.createElement("canvas");
            const width = img.naturalWidth || 640;
            const height = img.naturalHeight || 480;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const tex = new THREE.CanvasTexture(canvas);
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.minFilter = THREE.LinearFilter;
                tex.generateMipmaps = false;
                setTexture(tex);
            }
        };
        img.src = url;

        return () => {
            isCancelled = true;
        };
    }, [url]);

    return texture;
};

export const COUNTRY_CODES: Record<string, string> = {
    "Japan": "jp",
    "United States": "us",
    "Germany": "de",
    "Italy": "it",
    "Russia": "ru",
    "Soviet Union": "ru",
    "South Korea": "kr",
    "France": "fr",
    "United Kingdom": "gb",
    "Czech Republic": "cz",
    "Sweden": "se",
    "Spain": "es",
    "Romania": "ro"
};

export const Flag = ({
    country,
    position,
    scale = 1
}: {
    country: string;
    position: [number, number, number];
    scale?: number;
}) => {
    const countryCode = COUNTRY_CODES[country];
    const flagUrl = countryCode ? getFlagAssetUrl(countryCode) : getFlagAssetUrl("un");
    const texture = useSvgSafeTexture(flagUrl);
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
            <planeGeometry args={[6 * scale, 4 * scale, 16, 16]} />
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
