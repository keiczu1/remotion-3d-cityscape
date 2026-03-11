import type { AppearanceDescriptor, AppearanceSoundProfile } from "../model/types";

export const resolveAppearanceSoundProfile = (
    descriptor: AppearanceDescriptor,
): AppearanceSoundProfile => {
    if (descriptor.kind === "tech") {
        return "tech-reveal";
    }

    if (descriptor.kind === "scale" && descriptor.hasOvershoot) {
        return "pop-reveal";
    }

    if (descriptor.kind === "slide" && descriptor.direction !== "none") {
        return "sweep-reveal";
    }

    if (
        descriptor.kind === "impact" ||
        (descriptor.intensity >= 0.8 && descriptor.hasSettle)
    ) {
        return "impact-reveal";
    }

    return "soft-reveal";
};
