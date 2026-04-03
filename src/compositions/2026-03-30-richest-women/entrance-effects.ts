import { spring, interpolate } from "remotion";

/**
 * 15 entrance effects for the richest-women overlay cards.
 *
 * Each effect returns CSS properties for:
 * - `shell`   — the main biography card wrapper (portrait + info)
 * - `sidebar` — the InfoSideCard wrapper
 *
 * `progress` is 0→1 (entrance). For sidebar exit we use a separate `sidebarExitProgress` 0→1.
 */

export type EntranceStyle = {
    opacity: number;
    transform: string;
    filter?: string;
};

export type EntranceEffectResult = {
    shell: EntranceStyle;
    sidebar: EntranceStyle;
};

// ─── helpers ────────────────────────────────────────────────────────
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const easeOutBack = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const easeOutElastic = (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};

const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
};

type EffectInput = {
    /** Frame offset from the card's arrival (0 = just arrived). */
    animFrame: number;
    fps: number;
    /** Stele index in the sequence. */
    index: number;
};

type EffectFn = (input: EffectInput) => EntranceEffectResult;

// ─── sidebar appear/exit presets ────────────────────────────────────
const sidebarAppear = (animFrame: number, fps: number, delayFrames: number, variant: "right" | "left" | "up" | "down" | "scale" | "fade" = "right"): EntranceStyle => {
    const p = spring({ fps, frame: Math.max(0, animFrame - delayFrames), config: { damping: 16, mass: 0.85, stiffness: 100 } });
    const opacity = interpolate(p, [0, 1], [0, 1]);

    switch (variant) {
        case "right":
            return { opacity, transform: `translateX(${interpolate(p, [0, 1], [60, 0])}px) translateY(${interpolate(p, [0, 1], [12, 0])}px)` };
        case "left":
            return { opacity, transform: `translateX(${interpolate(p, [0, 1], [-60, 0])}px) translateY(${interpolate(p, [0, 1], [12, 0])}px)` };
        case "up":
            return { opacity, transform: `translateY(${interpolate(p, [0, 1], [-50, 0])}px)` };
        case "down":
            return { opacity, transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px)` };
        case "scale":
            return { opacity, transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})` };
        case "fade":
        default:
            return { opacity, transform: "none" };
    }
};

// ─── 15 effects ─────────────────────────────────────────────────────

// #1 Fade Rise — classic vertical lift + fade
const effectFadeRise: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 16, mass: 0.88, stiffness: 110 } });
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
        },
        sidebar: sidebarAppear(animFrame, fps, 18, "right"),
    };
};

// #2 Slide Left — entrance from the left
const effectSlideLeft: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 14, mass: 0.9, stiffness: 95 } });
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(p, [0, 1], [-200, 0])}px)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 22, "left"),
    };
};

// #3 Slide Right — entrance from the right
const effectSlideRight: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 14, mass: 0.9, stiffness: 95 } });
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(p, [0, 1], [200, 0])}px)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 20, "right"),
    };
};

// #4 Scale Pop — burst from center point
const effectScalePop: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 10, mass: 0.7, stiffness: 140 } });
    const scale = interpolate(p, [0, 1], [0.3, 1]);
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `scale(${scale})`,
        },
        sidebar: sidebarAppear(animFrame, fps, 16, "scale"),
    };
};

// #5 Flip Horizontal — CSS 3D flip around Y axis
const effectFlipHorizontal: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 14, mass: 1.2, stiffness: 90 } });
    const rotY = interpolate(p, [0, 1], [90, 0]);
    return {
        shell: {
            opacity: interpolate(p, [0, 0.3, 1], [0, 0.6, 1]),
            transform: `perspective(1200px) rotateY(${rotY}deg)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 24, "right"),
    };
};

// #6 Zoom Blur — come from far away with blur
const effectZoomBlur: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 16, mass: 1.0, stiffness: 80 } });
    const scale = interpolate(p, [0, 1], [2.5, 1]);
    const blur = interpolate(p, [0, 1], [16, 0]);
    return {
        shell: {
            opacity: interpolate(p, [0, 0.3, 1], [0, 0.7, 1]),
            transform: `scale(${scale})`,
            filter: `blur(${blur}px)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 20, "fade"),
    };
};

// #7 Glitch Shift — jitter + RGB split feel
const effectGlitchShift: EffectFn = ({ animFrame, fps }) => {
    const stabilize = spring({ fps, frame: Math.max(0, animFrame - 5), config: { damping: 8, mass: 0.6, stiffness: 130 } });
    const jitterX = stabilize < 0.95 ? Math.sin(animFrame * 7.3) * (1 - stabilize) * 30 : 0;
    const jitterY = stabilize < 0.95 ? Math.cos(animFrame * 5.1) * (1 - stabilize) * 20 : 0;
    const opacity = stabilize < 0.8 ? (Math.sin(animFrame * 11) > 0 ? 0.75 : 0.35) : Math.min(1, stabilize * 1.1);
    return {
        shell: {
            opacity,
            transform: `translate(${jitterX}px, ${jitterY}px)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 22, "right"),
    };
};

// #8 Cascade Down — drop from above with staggered opacity
const effectCascadeDown: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 12, mass: 1.3, stiffness: 100 } });
    const dropY = interpolate(p, [0, 1], [-120, 0]);
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `translateY(${dropY}px) scale(${interpolate(p, [0, 1], [0.96, 1])})`,
        },
        sidebar: sidebarAppear(animFrame, fps, 20, "down"),
    };
};

// #9 Swing Door — rotation pivot from left edge
const effectSwingDoor: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 13, mass: 1.2, stiffness: 85 } });
    const rotY = interpolate(p, [0, 1], [-70, 0]);
    return {
        shell: {
            opacity: interpolate(p, [0, 0.2, 1], [0, 0.5, 1]),
            transform: `perspective(1400px) rotateY(${rotY}deg)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 22, "right"),
    };
};

// #10 Elastic Bounce — springy overshoot entrance
const effectElasticBounce: EffectFn = ({ animFrame, fps }) => {
    const raw = clamp01(animFrame / (fps * 0.7));
    const p = easeOutElastic(raw);
    const opacity = smoothstep(0, 0.15, raw);
    return {
        shell: {
            opacity,
            transform: `translateY(${interpolate(p, [0, 1], [100, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        },
        sidebar: sidebarAppear(animFrame, fps, 18, "scale"),
    };
};

// #11 Dissolve — pure opacity fade, soft and elegant
const effectDissolve: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 22, mass: 1.0, stiffness: 60 } });
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `scale(${interpolate(p, [0, 1], [1.02, 1])})`,
        },
        sidebar: sidebarAppear(animFrame, fps, 24, "fade"),
    };
};

// #12 Rotate Spiral — spin + scale in
const effectRotateSpiral: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 14, mass: 1.5, stiffness: 90 } });
    const rotZ = interpolate(p, [0, 1], [-15, 0]);
    const scale = interpolate(p, [0, 1], [0.6, 1]);
    return {
        shell: {
            opacity: interpolate(p, [0, 0.3, 1], [0, 0.6, 1]),
            transform: `rotate(${rotZ}deg) scale(${scale})`,
        },
        sidebar: sidebarAppear(animFrame, fps, 20, "right"),
    };
};

// #13 Curtain Reveal — vertical unveil with scale
const effectCurtainReveal: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 18, mass: 1.0, stiffness: 70 } });
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `scaleY(${interpolate(p, [0, 1], [0.3, 1])}) translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 22, "down"),
    };
};

// #14 Slide Up Bounce — from bottom with overshoot
const effectSlideUpBounce: EffectFn = ({ animFrame, fps }) => {
    const raw = clamp01(animFrame / (fps * 0.6));
    const p = easeOutBack(raw);
    const opacity = smoothstep(0, 0.12, raw);
    return {
        shell: {
            opacity,
            transform: `translateY(${interpolate(p, [0, 1], [140, 0])}px)`,
        },
        sidebar: sidebarAppear(animFrame, fps, 16, "up"),
    };
};

// #15 Diagonal Wipe — diagonal motion entry
const effectDiagonalWipe: EffectFn = ({ animFrame, fps }) => {
    const p = spring({ fps, frame: Math.max(0, animFrame), config: { damping: 15, mass: 1.0, stiffness: 85 } });
    const tx = interpolate(p, [0, 1], [-100, 0]);
    const ty = interpolate(p, [0, 1], [80, 0]);
    return {
        shell: {
            opacity: interpolate(p, [0, 1], [0, 1]),
            transform: `translate(${tx}px, ${ty}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
        },
        sidebar: sidebarAppear(animFrame, fps, 20, "left"),
    };
};

// ─── registry ───────────────────────────────────────────────────────

const ENTRANCE_EFFECTS: EffectFn[] = [
    effectFadeRise,        // 0
    effectSlideLeft,       // 1
    effectSlideRight,      // 2
    effectScalePop,        // 3
    effectFlipHorizontal,  // 4
    effectZoomBlur,        // 5
    effectGlitchShift,     // 6
    effectCascadeDown,     // 7
    effectSwingDoor,       // 8
    effectElasticBounce,   // 9
    effectDissolve,        // 10
    effectRotateSpiral,    // 11
    effectCurtainReveal,   // 12
    effectSlideUpBounce,   // 13
    effectDiagonalWipe,    // 14
];

export const ENTRANCE_EFFECT_COUNT = ENTRANCE_EFFECTS.length;

export const getEntranceEffectByIndex = (index: number): EffectFn => {
    const safeIndex = ((index % ENTRANCE_EFFECT_COUNT) + ENTRANCE_EFFECT_COUNT) % ENTRANCE_EFFECT_COUNT;
    return ENTRANCE_EFFECTS[safeIndex];
};

/**
 * Compute sidebar exit style.
 * `exitProgress` should be 0 (fully visible) → 1 (fully gone).
 */
export const getSidebarExitStyle = (exitProgress: number, index: number): EntranceStyle => {
    const p = clamp01(exitProgress);
    const variant = index % 4;

    switch (variant) {
        case 0: // fade + slide right
            return {
                opacity: 1 - p,
                transform: `translateX(${p * 40}px) translateY(${p * 8}px) scale(${1 - p * 0.05})`,
            };
        case 1: // fade + slide down
            return {
                opacity: 1 - p,
                transform: `translateY(${p * 30}px) scale(${1 - p * 0.04})`,
            };
        case 2: // fade + scale down
            return {
                opacity: 1 - p,
                transform: `scale(${1 - p * 0.12})`,
            };
        case 3: // fade + slide up
        default:
            return {
                opacity: 1 - p,
                transform: `translateY(${-p * 25}px) scale(${1 - p * 0.05})`,
            };
    }
};

/**
 * Get the complete entrance effect result for a given stele index + animation frame.
 * This is the main entry point.
 */
export const getEntranceEffect = (
    index: number,
    animFrame: number,
    fps: number,
): EntranceEffectResult => {
    const effectFn = getEntranceEffectByIndex(index);
    return effectFn({ animFrame, fps, index });
};
