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
    IND: "in", CHN: "cn", USA: "us", IDN: "id", PAK: "pk", NGA: "ng", BRA: "br", BGD: "bd",
    RUS: "ru", MEX: "mx", JPN: "jp", PHL: "ph", COD: "cd", ETH: "et", EGY: "eg", VNM: "vn",
    IRN: "ir", TUR: "tr", DEU: "de", GBR: "gb", FRA: "fr", TZA: "tz", THA: "th", ZAF: "za",
    ITA: "it", KEN: "ke", COL: "co", SDN: "sd", MMR: "mm", KOR: "kr", ESP: "es", DZA: "dz",
    ARG: "ar", IRQ: "iq", UGA: "ug", AFG: "af", CAN: "ca", AGO: "ao", UZB: "uz", POL: "pl",
    MAR: "ma", SAU: "sa", MYS: "my", PER: "pe", MOZ: "mz", GHA: "gh", YEM: "ye", MDG: "mg",
    CIV: "ci", NPL: "np", CMR: "cm", UKR: "ua", VEN: "ve", AUS: "au", NER: "ne", PRK: "kp",
    SYR: "sy", BFA: "bf", TWN: "tw", MLI: "ml", LKA: "lk", MWI: "mw", KAZ: "kz", CHL: "cl",
    ZMB: "zm", SOM: "so", TCD: "td", SEN: "sn", ROU: "ro", ECU: "ec", GTM: "gt", KHM: "kh",
    ZWE: "zw", GIN: "gn", SSD: "ss", RWA: "rw", BEN: "bj", BDI: "bi", TUN: "tn", JOR: "jo",
    BEL: "be", HTI: "ht", BOL: "bo", ARE: "ae", CZE: "cz", DOM: "do", PRT: "pt", TJK: "tj",
    SWE: "se", GRC: "gr", AZE: "az", ISR: "il", PNG: "pg", HND: "hn", CUB: "cu", HUN: "hu",
    AUT: "at", CHE: "ch", SLE: "sl", BLR: "by",
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
