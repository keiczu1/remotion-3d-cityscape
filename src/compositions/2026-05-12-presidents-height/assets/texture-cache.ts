import { useEffect, useState } from "react";
import * as THREE from "three";

export type SharedTextureKind = "photo" | "flag";

const sharedTextureLoader = new THREE.TextureLoader();
const sharedTextureCache = new Map<string, THREE.Texture>();
const sharedTexturePromises = new Map<string, Promise<THREE.Texture>>();

sharedTextureLoader.setCrossOrigin("anonymous");

const configureSharedTexture = (texture: THREE.Texture, kind: SharedTextureKind) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = kind === "photo";
    texture.needsUpdate = true;
};

const loadSharedTexture = (url: string, kind: SharedTextureKind) => {
    const cachedTexture = sharedTextureCache.get(url);
    if (cachedTexture) {
        return Promise.resolve(cachedTexture);
    }

    const pendingTexture = sharedTexturePromises.get(url);
    if (pendingTexture) {
        return pendingTexture;
    }

    const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
        sharedTextureLoader.load(
            url,
            (texture) => {
                configureSharedTexture(texture, kind);
                sharedTextureCache.set(url, texture);
                resolve(texture);
            },
            undefined,
            (error) => reject(error),
        );
    }).finally(() => {
        sharedTexturePromises.delete(url);
    });

    sharedTexturePromises.set(url, texturePromise);

    return texturePromise;
};

export const preloadSharedTexture = (url: string, kind: SharedTextureKind) => {
    void loadSharedTexture(url, kind).catch(() => undefined);
};

export const useSharedTexture = (url: string, kind: SharedTextureKind) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(() => sharedTextureCache.get(url) ?? null);

    useEffect(() => {
        let cancelled = false;
        const cachedTexture = sharedTextureCache.get(url);

        if (cachedTexture) {
            setTexture(cachedTexture);
            return;
        }

        loadSharedTexture(url, kind)
            .then((loadedTexture) => {
                if (!cancelled) {
                    setTexture(loadedTexture);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setTexture(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [kind, url]);

    return texture;
};
