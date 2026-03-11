import { useCurrentFrame, useVideoConfig } from "remotion";

import { getIntroTitleState } from "../scene/scene-logic";

const TITLE_TEXT = "40 MOST VISITED WEBSITES IN THE WORLD";

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
                    color: "#F8FAFC",
                    fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                    fontSize: Math.max(58, Math.min(126, Math.round(width * 0.06))),
                    fontWeight: 700,
                    lineHeight: 0.95,
                    letterSpacing: "0.08em",
                    textAlign: "center",
                    textTransform: "uppercase",
                    textShadow: "0 10px 30px rgba(15, 23, 42, 0.55)",
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
