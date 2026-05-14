import type {CSSProperties} from "react";
import {useEffect, useMemo, useState} from "react";
import {ThreeCanvas} from "@remotion/three";
import {
	Img,
	cancelRender,
	continueRender,
	delayRender,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import * as THREE from "three";

import {getFlagAssetUrl} from "../../../assets/flag-asset-url";

export type PortraitBiographySteleTheme = {
	shell: string;
	secondaryShell: string;
	wealth: string;
	text: string;
	muted: string;
	originBg: string;
	originText: string;
	tilt: string;
};

export type PortraitBiographySteleHeroProps = {
	photoSrc: string;
	flagCode?: string | null;
	order: number;
	name: string;
	lifeYears: string;
	wealth: string;
	wealthOrigin: string;
	country: string;
	moneyFrom: string;
	fact: string;
	pedestalBodyHeight?: number;
	delay?: number;
	theme?: PortraitBiographySteleTheme;
	moneyFromMaxLines?: number;
	factMaxLines?: number;
	contentFontSize?: number;
	contentLineHeight?: number;
	frame?: number;
	fps?: number;
	showPedestal?: boolean;
	showFlagMast?: boolean;
	showInfoSideCard?: boolean;
	shellOpacityMultiplier?: number;
	preserveEntranceColors?: boolean;
	freezeMediaEffects?: boolean;
	infoSideCardTextEffect?: "default" | "typewriter";
	infoSideCardTypewriterFrame?: number;
};

export const PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH = 1380;
export const PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT = 1040;
const TYPEWRITER_CHARS_PER_SECOND = 28;
const TYPEWRITER_SECTION_PAUSE_FRAMES = 10;
const INFO_SIDE_CARD_TYPEWRITER_MAX_CHARS = 29;
const TYPEWRITER_SECTION_HEIGHT_PADDING_PX = 6;

export const portraitBiographySteleDefaultTheme: PortraitBiographySteleTheme = {
	shell: "linear-gradient(180deg, rgba(18, 11, 14, 0.98) 0%, rgba(28, 17, 22, 0.98) 100%)",
	secondaryShell: "rgba(235, 170, 150, 0.25)",
	wealth: "#FACC15",
	text: "#FFF3F3",
	muted: "#E8C8CD",
	originBg: "rgba(235, 170, 150, 0.16)",
	originText: "#FFD4B8",
	tilt: "",
};

const baseCardStyle: CSSProperties = {
	position: "relative",
	width: PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH,
	height: PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
};

const fixedInfoCardWidth = 580;

const titleCase = (value: string) => value
	.split(" ")
	.filter(Boolean)
	.map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
	.join(" ");

export const shortenPortraitBiographySteleOrigin = (origin: string) => {
	switch (origin) {
		case "self-made":
			return "Self-made";
		case "inherited and expanded":
			return "Inherited+";
		case "family business":
			return "Family Biz";
		case "family wealth":
			return "Family Wealth";
		case "widow inheritance":
			return "Widow";
		case "divorce settlement":
			return "Divorce";
		default:
			return titleCase(origin);
	}
};

export const formatPortraitBiographySteleLifeYears = (value: string) => {
	if (value.endsWith("-")) {
		return `${value.slice(0, -1)} - ...`;
	}

	return value.replace("-", " - ");
};

export const formatPortraitBiographySteleName = (value: string) => {
	const normalized = value.trim().replace(/\s+/g, " ");
	if (normalized.length <= 15 || !normalized.includes(" ")) {
		return normalized;
	}

	const words = normalized.split(" ");
	let bestSplit = normalized;
	let bestScore = Number.POSITIVE_INFINITY;

	for (let index = 1; index < words.length; index += 1) {
		const firstLine = words.slice(0, index).join(" ");
		const secondLine = words.slice(index).join(" ");
		const longestLine = Math.max(firstLine.length, secondLine.length);
		const imbalance = Math.abs(firstLine.length - secondLine.length);
		const score = longestLine * 10 + imbalance;

		if (score < bestScore) {
			bestScore = score;
			bestSplit = `${firstLine}\n${secondLine}`;
		}
	}

	return bestSplit;
};

export const wrapPortraitBiographySteleLines = (text: string, maxChars: number, maxLines: number) => {
	const normalized = text.trim();
	if (!normalized) {
		return [];
	}

	const words = normalized.split(/\s+/).filter(Boolean);

	const buildBalancedLines = () => {
		const memo = new Map<string, {score: number; lines: string[]} | null>();

		const solve = (wordIndex: number, linesUsed: number): {score: number; lines: string[]} | null => {
			const key = `${wordIndex}:${linesUsed}`;
			const cached = memo.get(key);
			if (cached !== undefined) {
				return cached;
			}

			if (wordIndex >= words.length) {
				const done = {score: 0, lines: []};
				memo.set(key, done);
				return done;
			}

			if (linesUsed >= maxLines) {
				memo.set(key, null);
				return null;
			}

			let best: {score: number; lines: string[]} | null = null;
			let currentLine = "";

			for (let nextIndex = wordIndex; nextIndex < words.length; nextIndex += 1) {
				currentLine = currentLine ? `${currentLine} ${words[nextIndex]}` : words[nextIndex];
				if (currentLine.length > maxChars) {
					break;
				}

				const lineWordsCount = nextIndex - wordIndex + 1;
				const isLastLine = nextIndex === words.length - 1;
				const remainingChars = maxChars - currentLine.length;
				const raggednessPenalty = isLastLine ? remainingChars * remainingChars * 0.18 : remainingChars * remainingChars;
				const singleWordPenalty = !isLastLine && lineWordsCount === 1 ? 420 : 0;
				const shortLastLinePenalty = isLastLine && lineWordsCount === 1 && currentLine.length < Math.max(8, Math.floor(maxChars * 0.42)) ? 240 : 0;
				const localScore = raggednessPenalty + singleWordPenalty + shortLastLinePenalty;
				const rest = solve(nextIndex + 1, linesUsed + 1);

				if (!rest) {
					continue;
				}

				const totalScore = localScore + rest.score;
				if (!best || totalScore < best.score) {
					best = {
						score: totalScore,
						lines: [currentLine, ...rest.lines],
					};
				}
			}

			memo.set(key, best);
			return best;
		};

		return solve(0, 0)?.lines ?? null;
	};

	const balancedLines = buildBalancedLines();
	if (balancedLines && balancedLines.length <= maxLines) {
		return balancedLines;
	}

	const lines: string[] = [];
	let current = "";
	let truncated = false;

	for (const word of words) {
		const next = current ? `${current} ${word}` : word;
		if (next.length <= maxChars) {
			current = next;
			continue;
		}

		if (current) {
			lines.push(current);
		}

		if (lines.length === maxLines) {
			truncated = true;
			break;
		}

		current = word.length > maxChars ? `${word.slice(0, Math.max(0, maxChars - 3))}...` : word;
	}

	if (!truncated && current) {
		lines.push(current);
	}

	if (lines.length > maxLines) {
		truncated = true;
		lines.length = maxLines;
	}

	if (truncated || lines.join(" ").length < normalized.length) {
		const lastIndex = Math.min(lines.length - 1, maxLines - 1);
		if (lastIndex >= 0) {
			const lastLine = lines[lastIndex];
			lines[lastIndex] = lastLine.endsWith("...") ? lastLine : `${lastLine.slice(0, Math.max(0, maxChars - 3))}...`;
		}
	}

	return lines.slice(0, maxLines);
};

export const wrapPortraitBiographySteleLinesFull = (text: string, maxChars: number) => {
	const normalized = text.trim();
	if (!normalized) {
		return [];
	}

	const words = normalized.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let current = "";

	for (const word of words) {
		const next = current ? `${current} ${word}` : word;
		if (next.length <= maxChars) {
			current = next;
			continue;
		}

		if (current) {
			lines.push(current);
		}

		current = word;
	}

	if (current) {
		lines.push(current);
	}

	return lines;
};

export const getTypewriterTextState = ({
	text,
	frame,
	fps,
	charsPerSecond = TYPEWRITER_CHARS_PER_SECOND,
}: {
	text: string;
	frame: number;
	fps: number;
	charsPerSecond?: number;
}) => {
	const normalizedText = text.trim().replace(/\s+/g, " ");
	const framesPerCharacter = Math.max(1, fps / charsPerSecond);
	const durationFrames = normalizedText
		? Math.max(1, Math.ceil(normalizedText.length * framesPerCharacter))
		: 0;

	if (!normalizedText) {
		return {
			text: "",
			isComplete: true,
			durationFrames,
		};
	}

	if (frame < 0) {
		return {
			text: "",
			isComplete: false,
			durationFrames,
		};
	}

	const safeFrame = Math.max(0, frame);
	const visibleCharacterCount = Math.min(
		normalizedText.length,
		Math.floor(safeFrame / framesPerCharacter) + 1,
	);
	const isComplete = visibleCharacterCount >= normalizedText.length;

	return {
		text: normalizedText.slice(0, visibleCharacterCount),
		isComplete,
		durationFrames,
	};
};

export const getWrappedTypewriterTextState = ({
	text,
	frame,
	fps,
	maxChars,
	charsPerSecond = TYPEWRITER_CHARS_PER_SECOND,
}: {
	text: string;
	frame: number;
	fps: number;
	maxChars: number;
	charsPerSecond?: number;
}) => {
	const plannedLines = wrapPortraitBiographySteleLinesFull(text, maxChars);
	const flattenedText = plannedLines.join(" ");
	const typewriter = getTypewriterTextState({
		text: flattenedText,
		frame,
		fps,
		charsPerSecond,
	});
	let remainingVisibleCharacters = typewriter.text.length;
	const visibleLines = plannedLines.map((line, index) => {
		const visibleCharacterCount = Math.max(0, Math.min(line.length, remainingVisibleCharacters));
		const visibleLine = line.slice(0, visibleCharacterCount);

		remainingVisibleCharacters -= visibleCharacterCount;
		if (index < plannedLines.length - 1 && remainingVisibleCharacters > 0) {
			remainingVisibleCharacters = Math.max(0, remainingVisibleCharacters - 1);
		}

		return visibleLine;
	});

	return {
		...typewriter,
		plannedLines,
		visibleLines,
	};
};

const getPortraitBiographySteleMotion = ({
	frame,
	fps,
	delay,
}: {
	frame: number;
	fps: number;
	delay: number;
}) => {
	const animatedFrame = Math.max(0, frame - delay);
	const enter = spring({
		fps,
		frame: animatedFrame,
		config: {
			damping: 16,
			mass: 0.88,
			stiffness: 110,
		},
	});
	const media = spring({
		fps,
		frame: Math.max(0, animatedFrame - 12),
		config: {
			damping: 14,
			mass: 0.9,
			stiffness: 95,
		},
	});
	const copy = spring({
		fps,
		frame: Math.max(0, animatedFrame - 24),
		config: {
			damping: 15,
			mass: 0.85,
			stiffness: 90,
		},
	});
	const shimmer = interpolate((frame + delay * 2) % 180, [0, 90, 180], [-28, 124, -28]);

	return {
		enter,
		media,
		copy,
		shimmer,
		y: interpolate(enter, [0, 1], [90, 0]),
		opacity: interpolate(enter, [0, 1], [0, 1]),
		scale: interpolate(enter, [0, 1], [0.94, 1]),
		copyOpacity: interpolate(copy, [0, 1], [0, 1]),
		copyY: interpolate(copy, [0, 1], [22, 0]),
		mediaScale: interpolate(media, [0, 1], [1.08, 1]),
		glow: 0.55 + Math.sin(frame * 0.055 + delay * 0.12) * 0.08,
	};
};

type PortraitBiographySteleMotion = ReturnType<typeof getPortraitBiographySteleMotion>;

export const getPortraitBiographySteleShellAnimationState = ({
	motion,
	preserveEntranceColors,
	freezeMediaEffects,
}: {
	motion: PortraitBiographySteleMotion;
	preserveEntranceColors: boolean;
	freezeMediaEffects: boolean;
}) => ({
	shellTranslateY: preserveEntranceColors ? 0 : motion.y,
	shellScale: preserveEntranceColors ? 1 : motion.scale,
	shellGlow: preserveEntranceColors || freezeMediaEffects ? 0.55 : motion.glow,
	mediaScale: preserveEntranceColors || freezeMediaEffects ? 1 : motion.mediaScale,
	shimmerTranslateX: preserveEntranceColors || freezeMediaEffects ? 0 : motion.shimmer,
	shimmerOpacity: preserveEntranceColors || freezeMediaEffects ? 0 : motion.media * 0.9,
	mainCopyTranslateY: preserveEntranceColors ? 0 : motion.copyY,
});

/** Seeded pseudo-random */
const srand = (s: number) => {
	const v = Math.sin(s * 127.1 + 311.7) * 43758.5453;
	return v - Math.floor(v);
};

/** Creates a tapered stone pillar with natural erosion texture.
 *  The geometry is based on a high-segment cylinder so it has:
 *  - No inherent straight vertical seams (enough radial segments)
 *  - A tapered silhouette (wider base, slightly narrower top)
 *  - Controlled displacement that never exceeds the canvas bounds
 */
const createRockGeometry = (heightScale: number, seed: number) => {
	// 48 radial segments remove visible straight edges.
	// 32 height segments give enough vertical resolution for erosion detail.
	// Top radius < bottom radius = natural tapered stone column.
	const geo = new THREE.CylinderGeometry(0.7, 1.0, 2.0, 48, 32, true);
	const pos = geo.attributes.position;

	for (let i = 0; i < pos.count; i++) {
		let x = pos.getX(i);
		let y = pos.getY(i);
		let z = pos.getZ(i);

		// Height in 0..1 range (bottom=0, top=1)
		const h = (y + 1.0) / 2.0;

		// --- Erosion layers (coordinate-based, NOT vertex-index-based) ---
		// Large weathering chunks
		const n1 = srand(Math.floor(x * 3.1 + seed) * 73 + Math.floor(z * 3.1 + seed) * 137 + Math.floor(y * 2.0 + seed) * 59);
		// Medium cracks and ridges
		const n2 = srand(Math.floor(x * 7.7 + seed) * 31 + Math.floor(z * 7.7 + seed) * 97 + Math.floor(y * 5.0 + seed) * 43);
		// Fine surface grit
		const n3 = srand(i * 17.3 + seed * 3.7);

		// Weighted combination: large features dominant, fine detail subtle
		const erosion = n1 * 0.12 + n2 * 0.06 + n3 * 0.03;

		// Taper the displacement so bottom stays wider and more stable
		const taperMult = 0.7 + h * 0.3;

		// Radial direction from center (XZ plane)
		const r = Math.sqrt(x * x + z * z) || 0.001;
		const dirX = x / r;
		const dirZ = z / r;

		// Push vertices inward by erosion amount (carve INTO the stone)
		x -= dirX * erosion * taperMult;
		z -= dirZ * erosion * taperMult;

		// Slight vertical wobble for organic feel
		y += (n1 - 0.5) * 0.04;

		pos.setXYZ(i, x, y * heightScale, z);
	}

	geo.computeVertexNormals();

	// Add flat cap at the top and bottom so it's not an open cylinder
	const topCap = new THREE.CircleGeometry(0.7, 48);
	topCap.rotateX(-Math.PI / 2);
	topCap.translate(0, 1.0 * heightScale, 0);
	const bottomCap = new THREE.CircleGeometry(1.0, 48);
	bottomCap.rotateX(Math.PI / 2);
	bottomCap.translate(0, -1.0 * heightScale, 0);

	// Merge all parts
	const merged = new THREE.BufferGeometry();
	const geos = [geo, topCap, bottomCap];
	// Manually merge positions and normals
	let totalVerts = 0;
	for (const g of geos) totalVerts += g.attributes.position.count;
	const mergedPos = new Float32Array(totalVerts * 3);
	const mergedNorm = new Float32Array(totalVerts * 3);
	let offset = 0;
	for (const g of geos) {
		const p = g.attributes.position;
		const n = g.attributes.normal;
		for (let j = 0; j < p.count; j++) {
			mergedPos[offset * 3] = p.getX(j);
			mergedPos[offset * 3 + 1] = p.getY(j);
			mergedPos[offset * 3 + 2] = p.getZ(j);
			mergedNorm[offset * 3] = n.getX(j);
			mergedNorm[offset * 3 + 1] = n.getY(j);
			mergedNorm[offset * 3 + 2] = n.getZ(j);
			offset++;
		}
	}
	// Merge indices
	let totalIdx = 0;
	for (const g of geos) totalIdx += (g.index?.count ?? 0);
	const mergedIdx = new Uint32Array(totalIdx);
	let idxOffset = 0;
	let vertOffset = 0;
	for (const g of geos) {
		const idx = g.index;
		if (idx) {
			for (let j = 0; j < idx.count; j++) {
				mergedIdx[idxOffset + j] = idx.getX(j) + vertOffset;
			}
			idxOffset += idx.count;
		}
		vertOffset += g.attributes.position.count;
	}

	merged.setAttribute("position", new THREE.BufferAttribute(mergedPos, 3));
	merged.setAttribute("normal", new THREE.BufferAttribute(mergedNorm, 3));
	merged.setIndex(new THREE.BufferAttribute(mergedIdx, 1));
	merged.computeVertexNormals();

	return merged;
};

// Light grey stone material with subtle warm tint
const stoneMaterial = new THREE.MeshStandardMaterial({
	color: new THREE.Color("#B8BAC8"),
	roughness: 0.92,
	metalness: 0.02,
	flatShading: true,
});

const StonePedestalMesh = ({
	scaleY,
	seed,
}: {
	scaleY: number;
	seed: number;
}) => {
	const geometry = useMemo(
		() => createRockGeometry(scaleY, seed),
		[scaleY, seed],
	);

	return (
		<mesh geometry={geometry} material={stoneMaterial} position={[0, -0.2, 0]} castShadow receiveShadow />
	);
};

// Canvas sized to comfortably contain the rock with breathing room on all sides.
// The rock maxes out at ~2.0 units wide, camera at z=5 with fov=35 sees ~3.2 units wide,
// so the rock will never clip.
const PEDESTAL_CANVAS_WIDTH = 420;
const PEDESTAL_CANVAS_HEIGHT = 380;

const ProductionPedestal = ({
	bodyHeightTarget,
	motion,
}: {
	bodyHeightTarget: number;
	motion: PortraitBiographySteleMotion;
}) => {
	const stoneScaleY = interpolate(bodyHeightTarget, [140, 280], [1.0, 1.8]);
	const animatedScaleY = interpolate(motion.enter, [0, 1], [0.2, stoneScaleY]);

	// Center of glass card = left 78 + width 404/2 = 280
	// Canvas center = left + width/2, so left = 280 - 420/2 = 70
	const canvasLeft = 70;

	return (
		<div
			style={{
				position: "absolute",
				left: canvasLeft,
				bottom: -60,
				width: PEDESTAL_CANVAS_WIDTH,
				height: PEDESTAL_CANVAS_HEIGHT,
				transform: `translateY(${Math.round((1 - motion.enter) * 60)}px)`,
				opacity: motion.opacity,
				filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.55))",
			}}
		>
			<ThreeCanvas
				width={PEDESTAL_CANVAS_WIDTH}
				height={PEDESTAL_CANVAS_HEIGHT}
				camera={{position: [0, 1.0, 5.0], fov: 35, near: 0.1, far: 100}}
				style={{width: "100%", height: "100%"}}
			>
				<ambientLight intensity={0.85} color="#dde4f0" />
				<directionalLight position={[3, 5, 4]} intensity={1.6} color="#fff5ec" castShadow />
				<directionalLight position={[-3, 2, 2]} intensity={0.7} color="#b0b8d0" />
				<pointLight position={[-2, 0.5, -2]} intensity={2.0} distance={8} color="#ffc080" />
				<pointLight position={[2, -0.5, -1.5]} intensity={1.5} distance={8} color="#88aaee" />

				<group rotation={[0, -0.12, 0]}>
					<StonePedestalMesh scaleY={animatedScaleY} seed={212} />
				</group>
			</ThreeCanvas>
		</div>
	);
};

const InfoSideCard = ({
	moneyFrom,
	fact,
	theme,
	motion,
	contentFontSize,
	contentLineHeight,
	contentOpacity,
	textEffect,
	typewriterFrame,
	fps,
}: {
	moneyFrom: string;
	fact: string;
	theme: PortraitBiographySteleTheme;
	motion: PortraitBiographySteleMotion;
	contentFontSize: number;
	contentLineHeight: number;
	contentOpacity: number;
	textEffect: "default" | "typewriter";
	typewriterFrame: number;
	fps: number;
}) => {
	const normalizedMoneyFrom = moneyFrom.trim().replace(/\s+/g, " ");
	const normalizedFact = fact.trim().replace(/\s+/g, " ");
	const freezeContentMotion = textEffect === "typewriter";
	const contentTranslateX = freezeContentMotion ? 0 : (1 - motion.copy) * 32;
	const contentTranslateY = freezeContentMotion ? 0 : (1 - motion.copy) * 10;
	const moneyFromTypewriter = getWrappedTypewriterTextState({
		text: normalizedMoneyFrom,
		frame: typewriterFrame,
		fps,
		maxChars: INFO_SIDE_CARD_TYPEWRITER_MAX_CHARS,
	});
	const factTypewriterStartFrame = moneyFromTypewriter.durationFrames + TYPEWRITER_SECTION_PAUSE_FRAMES;
	const factTypewriter = getWrappedTypewriterTextState({
		text: normalizedFact,
		frame: typewriterFrame - factTypewriterStartFrame,
		fps,
		maxChars: INFO_SIDE_CARD_TYPEWRITER_MAX_CHARS,
	});
	const renderTypewriterText = (value: {visibleLines: string[]}) => {
		let lastVisibleLineIndex = -1;
		for (let index = value.visibleLines.length - 1; index >= 0; index -= 1) {
			if (value.visibleLines[index] && value.visibleLines[index].length > 0) {
				lastVisibleLineIndex = index;
				break;
			}
		}

		if (lastVisibleLineIndex === -1) {
			return "";
		}

		return value.visibleLines.slice(0, lastVisibleLineIndex + 1).join("\n");
	};
	const moneyFromSectionMinHeight =
		textEffect === "typewriter"
			? Math.ceil(moneyFromTypewriter.plannedLines.length * contentFontSize * contentLineHeight) +
				TYPEWRITER_SECTION_HEIGHT_PADDING_PX
			: undefined;
	const factSectionMinHeight =
		textEffect === "typewriter"
			? Math.ceil(factTypewriter.plannedLines.length * contentFontSize * contentLineHeight) +
				TYPEWRITER_SECTION_HEIGHT_PADDING_PX
			: undefined;

	return (
		<div
			style={{
				position: "absolute",
				left: 510,
				top: 100,
				width: fixedInfoCardWidth,
				borderRadius: 44,
				background: "linear-gradient(180deg, rgba(18,11,14,0.98) 0%, rgba(24,14,18,0.98) 100%)",
				boxShadow: `0 24px 70px rgba(0,0,0,0.42), 0 0 0 1px ${theme.secondaryShell} inset`,
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					top: 0,
					height: 6,
					background: "linear-gradient(90deg, rgba(255,180,120,0.1) 0%, rgba(255,180,120,0.82) 26%, rgba(255,180,120,0.1) 100%)",
				}}
			/>
			<div
				style={{
					padding: "44px 48px 40px",
					display: "flex",
					flexDirection: "column",
					boxSizing: "border-box",
					transform: `translateX(${contentTranslateX}px) translateY(${contentTranslateY}px)`,
					opacity: contentOpacity,
				}}
			>
				<div
					style={{
						fontSize: 13,
						textTransform: "uppercase",
						letterSpacing: "0.12em",
						fontWeight: 800,
						color: "rgba(225, 175, 160, 0.74)",
						marginBottom: 14,
					}}
				>
					Money From
				</div>
				<div
					style={{
						fontSize: contentFontSize,
						lineHeight: contentLineHeight,
						fontWeight: 700,
						color: "#FFF5F0",
						whiteSpace: textEffect === "typewriter" ? "pre-line" : "normal",
						textWrap: textEffect === "typewriter" ? "wrap" : "pretty",
						overflowWrap: "break-word",
						minHeight: moneyFromSectionMinHeight,
						marginBottom: 30,
					}}
				>
					{textEffect === "typewriter" ? renderTypewriterText(moneyFromTypewriter) : normalizedMoneyFrom}
				</div>
				<div
					style={{
						height: 1,
						background: "linear-gradient(90deg, rgba(148,163,184,0.08) 0%, rgba(148,163,184,0.42) 18%, rgba(148,163,184,0.08) 100%)",
						marginBottom: 30,
					}}
				/>
				<div
					style={{
						fontSize: 22,
						textTransform: "uppercase",
						letterSpacing: "0.12em",
						fontWeight: 800,
						color: "rgba(225, 175, 160, 0.74)",
						marginBottom: 20,
					}}
				>
					Key Fact
				</div>
				<div
					style={{
						fontSize: contentFontSize,
						lineHeight: contentLineHeight,
						fontWeight: 600,
						color: "#FFECD9",
						whiteSpace: textEffect === "typewriter" ? "pre-line" : "normal",
						textWrap: textEffect === "typewriter" ? "wrap" : "pretty",
						overflowWrap: "break-word",
						minHeight: factSectionMinHeight,
					}}
				>
					{textEffect === "typewriter" ? renderTypewriterText(factTypewriter) : normalizedFact}
				</div>
			</div>
		</div>
	);
};

const FlagMast = ({
	flagCode,
	delay,
	frame,
	fps,
}: {
	flagCode?: string | null;
	delay: number;
	frame: number;
	fps: number;
}) => {
	const rise = spring({
		fps,
		frame: Math.max(0, frame - (delay + 10)),
		config: {
			damping: 16,
			mass: 0.9,
			stiffness: 96,
		},
	});
	const clothReveal = spring({
		fps,
		frame: Math.max(0, frame - (delay + 22)),
		config: {
			damping: 15,
			mass: 0.82,
			stiffness: 92,
		},
	});
	const mastHeight = interpolate(rise, [0, 1], [0, 236]);
	const mastOpacity = interpolate(rise, [0, 1], [0.3, 1]);
	const clothOffset = interpolate(clothReveal, [0, 1], [-8, 0]);
	const clothScale = interpolate(clothReveal, [0, 1], [0.9, 1]);
	const clothWidth = 164;
	const clothHeight = 109;
	const clothBottom = Math.max(18, mastHeight - clothHeight + 2);

	if (!flagCode) {
		return null;
	}

	return (
		<div
			style={{
				position: "absolute",
				left: 472,
				bottom: 18,
				width: 212,
				height: 300,
				pointerEvents: "none",
				zIndex: 2,
			}}
		>
			<div
				style={{
					position: "absolute",
					left: 18,
					bottom: 0,
					width: 4,
					height: mastHeight,
					borderRadius: 999,
					background: "linear-gradient(180deg, #64748B 0%, #3F4752 100%)",
					boxShadow: "0 0 10px rgba(255,255,255,0.08)",
					opacity: mastOpacity,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 14,
					bottom: Math.max(-2, mastHeight - 6),
					width: 12,
					height: 12,
					borderRadius: 999,
					background: "#FBBF24",
					boxShadow: "0 0 8px rgba(251,191,36,0.45)",
					opacity: mastOpacity,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 16,
					bottom: clothBottom,
					width: clothWidth,
					height: clothHeight,
					transform: `translateX(${clothOffset}px) scale(${clothScale})`,
					transformOrigin: "left center",
					opacity: clothReveal,
				}}
			>
				<AnimatedFlagCloth countryCode={flagCode} width={clothWidth} height={clothHeight} frame={frame} />
			</div>
		</div>
	);
};

const PortraitImage = ({
	src,
	opacity,
	scale,
	radius,
}: {
	src: string;
	opacity: number;
	scale: number;
	radius: number;
}) => (
	<div
		style={{
			position: "absolute",
			inset: 0,
			overflow: "hidden",
			borderRadius: radius,
			opacity,
			transform: `scale(${scale})`,
			background: "linear-gradient(180deg, rgba(14,9,11,0.96) 0%, rgba(20,11,14,0.96) 100%)",
		}}
	>
		<Img
			src={src}
			style={{
				width: "100%",
				height: "100%",
				objectFit: "contain",
				objectPosition: "center center",
				filter: "contrast(1.04) saturate(1.02)",
			}}
		/>
	</div>
);

const shimmerOverlay = ({
	translateX,
	opacity,
}: {
	translateX: number;
	opacity: number;
}) => (
	<div
		style={{
			position: "absolute",
			inset: 0,
			background: "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.05) 42%, rgba(255,255,255,0.18) 52%, transparent 65%)",
			transform: `translateX(${translateX}%)`,
			opacity,
			mixBlendMode: "screen",
			pointerEvents: "none",
		}}
	/>
);

const headerBadge = ({
	label,
	theme,
	style,
}: {
	label: string;
	theme: PortraitBiographySteleTheme;
	style?: CSSProperties;
}) => (
	<div
		style={{
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "7px 14px",
			borderRadius: 999,
			background: theme.originBg,
			color: theme.originText,
			fontSize: 14,
			fontWeight: 700,
			letterSpacing: "0.08em",
			textTransform: "uppercase",
			whiteSpace: "nowrap",
			...style,
		}}
	>
		{label}
	</div>
);

const AnimatedFlagCloth = ({
	countryCode,
	width,
	height,
	frame,
}: {
	countryCode: string;
	width: number;
	height: number;
	frame: number;
}) => {
	const [texture, setTexture] = useState<THREE.Texture | null>(null);
	const [renderHandle] = useState(() => delayRender("Loading portrait biography stele flag texture"));

	useEffect(() => {
		let cancelled = false;
		let settled = false;
		const textureLoader = new THREE.TextureLoader();
		const releaseRenderHandle = () => {
			if (settled) {
				return;
			}

			settled = true;
			continueRender(renderHandle);
		};

		textureLoader.load(
			getFlagAssetUrl(countryCode),
			(loadedTexture) => {
				if (cancelled) {
					loadedTexture.dispose();
					releaseRenderHandle();
					return;
				}

				loadedTexture.colorSpace = THREE.SRGBColorSpace;
				loadedTexture.magFilter = THREE.LinearFilter;
				loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
				loadedTexture.generateMipmaps = false;
				loadedTexture.needsUpdate = true;

				setTexture(loadedTexture);
				releaseRenderHandle();
			},
			undefined,
			(error) => {
				if (cancelled) {
					releaseRenderHandle();
					return;
				}

				settled = true;
				cancelRender(error instanceof Error ? error : new Error(String(error)));
			},
		);

		return () => {
			cancelled = true;
			releaseRenderHandle();
		};
	}, [countryCode, renderHandle]);

	const uniforms = useMemo(
		() => ({
			uTime: {value: 0},
			uTexture: {value: texture},
		}),
		[texture],
	);

	if (!texture) {
		return null;
	}

	uniforms.uTime.value = frame * 0.05;

	return (
		<div style={{width: "100%", height: "100%"}}>
			<ThreeCanvas width={width} height={height} camera={{position: [0, 0, 7], fov: 45, near: 1, far: 100}}>
				<mesh position={[-1.55, 0, 0]} castShadow>
					<planeGeometry args={[6, 4, 16, 16]} />
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
					/>
				</mesh>
			</ThreeCanvas>
		</div>
	);
};

const PortraitBiographySteleHeroBase = ({
	photoSrc,
	flagCode = null,
	order,
	name,
	lifeYears,
	wealth,
	wealthOrigin,
	country,
	moneyFrom,
	fact,
	pedestalBodyHeight = 170,
	delay = 0,
	theme = portraitBiographySteleDefaultTheme,
	contentFontSize = 28,
	contentLineHeight = 1.22,
	frame,
	fps,
	showPedestal = true,
	showFlagMast = true,
	showInfoSideCard = true,
	shellOpacityMultiplier = 1,
	preserveEntranceColors = false,
	freezeMediaEffects = false,
	infoSideCardTextEffect = "default",
	infoSideCardTypewriterFrame,
}: PortraitBiographySteleHeroProps & {
	frame: number;
	fps: number;
}) => {
	const motion = getPortraitBiographySteleMotion({
		frame,
		fps,
		delay,
	});
	const shellAnimation = getPortraitBiographySteleShellAnimationState({
		motion,
		preserveEntranceColors,
		freezeMediaEffects,
	});
	const shellOpacity = preserveEntranceColors ? shellOpacityMultiplier : motion.opacity * shellOpacityMultiplier;
	const mediaOpacity = preserveEntranceColors ? 1 : motion.media;
	const copyOpacity = preserveEntranceColors ? 1 : motion.copyOpacity;
	const typewriterFrameSource = infoSideCardTypewriterFrame ?? frame;
	const typewriterFrame = typewriterFrameSource - (delay + 24);

	return (
		<div style={baseCardStyle}>
			{showPedestal ? <ProductionPedestal bodyHeightTarget={pedestalBodyHeight} motion={motion} /> : null}
			{showInfoSideCard ? (
				<InfoSideCard
					moneyFrom={moneyFrom}
					fact={fact}
					theme={theme}
					motion={motion}
					contentFontSize={contentFontSize}
					contentLineHeight={contentLineHeight}
					contentOpacity={copyOpacity}
					textEffect={infoSideCardTextEffect}
					typewriterFrame={typewriterFrame}
					fps={fps}
				/>
			) : null}
			{showFlagMast ? <FlagMast flagCode={flagCode} delay={delay} frame={frame} fps={fps} /> : null}
			<div
				style={{
					position: "absolute",
					left: 78,
					top: 72,
					width: 404,
					height: 790,
					borderRadius: 36,
					background: theme.shell,
					boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px ${theme.secondaryShell} inset, 0 0 44px rgba(255,180,120,${0.12 + shellAnimation.shellGlow * 0.08})`,
					transform: `${theme.tilt} translateY(${shellAnimation.shellTranslateY}px) scale(${shellAnimation.shellScale})`,
					opacity: shellOpacity,
					overflow: "hidden",
				}}
			>
				<div
					style={{
						position: "absolute",
						inset: 16,
						borderRadius: 28,
						border: `1px solid ${theme.secondaryShell}`,
						pointerEvents: "none",
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 24,
						top: 24,
						width: 356,
						height: 438,
						borderRadius: 28,
						background: "rgba(255,255,255,0.04)",
						overflow: "hidden",
						boxShadow: `0 0 0 1px ${theme.secondaryShell} inset`,
					}}
				>
					<PortraitImage
						src={photoSrc}
						opacity={mediaOpacity}
						scale={shellAnimation.mediaScale}
						radius={28}
					/>
					{shimmerOverlay({
						translateX: shellAnimation.shimmerTranslateX,
						opacity: shellAnimation.shimmerOpacity,
					})}
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: "linear-gradient(180deg, transparent 0%, rgba(3,7,18,0.24) 72%, rgba(3,7,18,0.52) 100%)",
						}}
					/>
					<div
						style={{
							position: "absolute",
							top: 16,
							left: 16,
							padding: "8px 14px",
							borderRadius: 999,
							background: "rgba(20, 10, 12, 0.72)",
							color: theme.text,
							fontSize: 22,
							fontWeight: 800,
							letterSpacing: "0.06em",
						}}
					>
						#{order}
					</div>
				</div>
				<div
					style={{
						position: "absolute",
						left: 26,
						right: 26,
						bottom: 34,
						display: "flex",
						flexDirection: "column",
						gap: 8,
						transform: `translateY(${shellAnimation.mainCopyTranslateY}px)`,
						opacity: copyOpacity,
					}}
				>
					<div
						style={{
							fontSize: 48,
							lineHeight: 0.96,
							fontWeight: 700,
							color: theme.text,
							letterSpacing: "-0.035em",
							whiteSpace: "pre-line",
						}}
					>
						{formatPortraitBiographySteleName(name)}
					</div>
					<div
						style={{
							fontSize: 25,
							lineHeight: 1,
							color: theme.muted,
							fontWeight: 600,
							letterSpacing: "-0.01em",
						}}
					>
						{formatPortraitBiographySteleLifeYears(lifeYears)}
					</div>
					<div
						style={{
							fontSize: 50,
							fontWeight: 800,
							color: theme.wealth,
							letterSpacing: "-0.04em",
						}}
					>
						{wealth}
					</div>
					<div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12}}>
						{headerBadge({label: shortenPortraitBiographySteleOrigin(wealthOrigin), theme})}
						<div
							style={{
								fontSize: 28,
								color: theme.muted,
								fontWeight: 600,
							}}
						>
							{country}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const PortraitBiographySteleHeroWithHooks = (props: PortraitBiographySteleHeroProps) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return <PortraitBiographySteleHeroBase {...props} frame={frame} fps={fps} />;
};

export const PortraitBiographySteleHero = (props: PortraitBiographySteleHeroProps) => {
	if (typeof props.frame === "number" && typeof props.fps === "number") {
		return <PortraitBiographySteleHeroBase {...props} frame={props.frame} fps={props.fps} />;
	}

	return <PortraitBiographySteleHeroWithHooks {...props} />;
};

