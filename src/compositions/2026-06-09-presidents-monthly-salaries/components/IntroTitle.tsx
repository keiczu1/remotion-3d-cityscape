import { useCurrentFrame, useVideoConfig } from "remotion";
import { getIntroTitleState } from "../scene/scene-logic";

const TITLE_TEXT = "World Leaders'\nMonthly Salaries";
const SUBTITLE_TEXT = "USD/month estimates, excluding benefits and allowances";

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
            <div
                style={{
                    position: "absolute",
                    bottom: 120,
                    left: 0,
                    right: 0,
                    color: "#0F172A",
                    fontFamily: "Arial, sans-serif",
                    fontSize: 34,
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    textAlign: "center",
                    textShadow: "0 4px 18px rgba(255, 255, 255, 0.8)",
                    opacity: titleState.opacity,
                    transform: `translateY(${titleState.translateY * 0.5}px)`,
                    willChange: "transform, opacity",
                }}
            >
                {SUBTITLE_TEXT}
            </div>
        </div>
    );
};
