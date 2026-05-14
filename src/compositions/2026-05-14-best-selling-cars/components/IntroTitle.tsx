import { useCurrentFrame, useVideoConfig } from "remotion";
import { getIntroTitleState } from "../scene/scene-logic";

const TITLE_TEXT = "Best-Selling\nCars in the World";

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
                    color: "#0F172A",
                    fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                    fontSize: Math.max(58, Math.min(126, Math.round(width * 0.08))),
                    fontWeight: 700,
                    lineHeight: 0.95,
                    letterSpacing: "0.08em",
                    textAlign: "center",
                    textTransform: "uppercase",
                    textShadow: "0 4px 20px rgba(255, 255, 255, 0.6), 0 8px 40px rgba(250, 204, 21, 0.4)",
                    opacity: titleState.opacity,
                    transform: `translateY(${titleState.translateY}px) scale(${titleState.scale})`,
                    transformOrigin: "center center",
                    willChange: "transform, opacity",
                    whiteSpace: "pre-wrap",
                }}
            >
                {TITLE_TEXT}
            </div>
        </div>
    );
};
