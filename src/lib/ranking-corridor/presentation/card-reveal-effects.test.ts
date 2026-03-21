import test from "node:test";
import assert from "node:assert/strict";

import {
    CARD_REVEAL_EFFECT_IDS,
    CARD_REVEAL_EFFECTS,
    getCardRevealEffectIdForIndex,
    scrambleRevealText,
    type CardRevealRenderers,
} from "./card-reveal-effects";

test("card reveal effect registry stays aligned with effect ids", () => {
    assert.equal(CARD_REVEAL_EFFECTS.length, CARD_REVEAL_EFFECT_IDS.length);
});

test("card reveal effect id wraps by index without hardcoded branches", () => {
    assert.equal(getCardRevealEffectIdForIndex(0), "glitch-teleport");
    assert.equal(getCardRevealEffectIdForIndex(9), "hologram-flicker");
    assert.equal(getCardRevealEffectIdForIndex(10), "glitch-teleport");
    assert.equal(getCardRevealEffectIdForIndex(-1), "hologram-flicker");
});

test("scramble reveal text decodes back to the original string", () => {
    assert.equal(scrambleRevealText("1.6 B", 1, "visits"), "1.6 B");
    assert.notEqual(scrambleRevealText("1.6 B", 0.35, "visits"), "1.6 B");
});

test("digital-rain keeps scramble choreography for rank and visits", () => {
    const calls = {
        rank: [] as Array<{ text?: string; opacity?: number; posY?: number }>,
        visits: [] as Array<{ text?: string; fillOpacity?: number; counterProgress?: number }>,
    };
    const renderers: CardRevealRenderers = {
        renderScreenBox: () => null,
        renderDataPanel: () => null,
        renderRankText: (options = {}) => {
            calls.rank.push(options);
            return null;
        },
        renderMedia: () => null,
        renderDomain: () => null,
        renderVisits: (options = {}) => {
            calls.visits.push(options);
            return null;
        },
        renderBadge: () => null,
    };
    const effect = CARD_REVEAL_EFFECTS[3];

    effect({
        rank: 7,
        index: 3,
        animFrame: 20,
        fps: 60,
        counterProgress: 0.2,
        visitsText: "1.6 B",
        renderers,
        layout: {
            screenWidth: 10,
            screenHeight: 10,
            dataPanelHeight: 10,
            rankY: 1,
        },
        theme: {
            accentColor: "#00E5FF",
            shellColor: "#1E293B",
        },
    });

    assert.equal(calls.rank.length, 1);
    assert.equal(calls.visits.length, 1);
    assert.notEqual(calls.rank[0]?.text, "#7");
    assert.notEqual(calls.visits[0]?.text, "1.6 B");
});
