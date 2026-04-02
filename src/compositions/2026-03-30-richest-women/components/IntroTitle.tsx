import { useCurrentFrame, useVideoConfig } from "remotion";

import { getIntroTitleState } from "../scene/scene-logic";

const TITLE_TEXT = "RICHEST WOMEN IN HISTORY";

export const IntroTitle = () => {
    const frame = useCurrentFrame();
    const { width } = useVideoConfig();
    const titleState = getIntroTitleState(frame);

    if (!titleState.isVisible) {
        return null;
    }

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 120px",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    maxWidth: Math.round(width * 0.8),
                    color: "#FFF3F3",
                    fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                    fontSize: Math.max(58, Math.min(126, Math.round(width * 0.06))),
                    fontWeight: 700,
                    lineHeight: 0.95,
                    letterSpacing: "0.08em",
                    textAlign: "center",
                    textTransform: "uppercase",
                    textShadow: "0 4px 20px rgba(212, 165, 116, 0.6), 0 8px 40px rgba(180, 83, 9, 0.3)",
                    opacity: titleState.opacity,
                    transform: `translateY(${titleState.translateY}px) scale(${titleState.scale})`,
                    transformOrigin: "center center",
                    willChange: "transform, opacity",
                }}
            >
                {TITLE_TEXT}
            </div>
        </div>
    );
};
