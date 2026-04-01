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
};

export const PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH = 1220;
export const PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT = 1040;

export const portraitBiographySteleDefaultTheme: PortraitBiographySteleTheme = {
	shell: "linear-gradient(180deg, rgba(18, 11, 14, 0.98) 0%, rgba(28, 17, 22, 0.98) 100%)",
	secondaryShell: "rgba(235, 170, 150, 0.25)",
	wealth: "#FACC15",
	text: "#FFF3F3",
	muted: "#E8C8CD",
	originBg: "rgba(235, 170, 150, 0.16)",
	originText: "#FFD4B8",
	tilt: "perspective(1600px) rotateY(-5deg)",
};

const baseCardStyle: CSSProperties = {
	position: "relative",
	width: PORTRAIT_BIOGRAPHY_STELE_BASE_WIDTH,
	height: PORTRAIT_BIOGRAPHY_STELE_BASE_HEIGHT,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
};

const fixedInfoCardWidth = 470;

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

const usePortraitBiographySteleMotion = (delay: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
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

const ProductionPedestal = ({
	bodyHeightTarget,
	motion,
}: {
	bodyHeightTarget: number;
	motion: ReturnType<typeof usePortraitBiographySteleMotion>;
}) => {
	const bodyHeightTargetNum = bodyHeightTarget; // Just to make sure we don't break logic by removing too much
	const bodyHeight = Math.max(24, Math.round(interpolate(motion.enter, [0, 1], [24, bodyHeightTargetNum])));

	const stoneNoise = (
		<div
			style={{
				position: "absolute",
				inset: 0,
				opacity: 0.55,
				background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='1.5'/%3E%3CfeFuncG type='linear' slope='1.5'/%3E%3CfeFuncB type='linear' slope='1.5'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
				mixBlendMode: "multiply",
				pointerEvents: "none",
			}}
		/>
	);

	return (
		<>
			{/* Ambient ground shadow */}
			<div
				style={{
					position: "absolute",
					left: 130,
					bottom: -15,
					width: 300,
					height: 44,
					borderRadius: "50%",
					background: "radial-gradient(ellipse at 50% 50%, rgba(6,10,18,0.88) 0%, rgba(6,10,18,0.4) 40%, transparent 100%)",
					filter: "blur(6px)",
					opacity: motion.opacity,
					transform: `scale(${0.8 + motion.enter * 0.2})`,
				}}
			/>

			<div
				style={{
					position: "absolute",
					left: 160, // 240 width, centered at 280 -> left: 160
					bottom: 0,
					width: 240, 
					height: bodyHeight + 15,
					transform: `translateY(${Math.round((1 - motion.enter) * 90)}px)`,
					opacity: motion.opacity,
					filter: "drop-shadow(0px 15px 30px rgba(0,0,0,0.65))",
				}}
			>
				{/* FACET 1: Darkest Back/Right jagged slab */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: "linear-gradient(135deg, #4A4D58 0%, #292B32 100%)",
						clipPath: "polygon(5% 10%, 82% 0%, 98% 18%, 100% 45%, 94% 80%, 98% 100%, 85% 98%, 15% 100%, 5% 85%, 0% 50%, 5% 20%)",
					}}
				>
					{stoneNoise}
				</div>

				{/* FACET 2: Mid-Front face (adds thickness) */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: "linear-gradient(190deg, #6C6E7A 0%, #4D4E56 100%)",
						clipPath: "polygon(10% 12%, 78% 6%, 88% 22%, 90% 48%, 82% 82%, 88% 97%, 75% 96%, 22% 98%, 12% 82%, 8% 48%, 12% 24%)",
					}}
				>
					{stoneNoise}
				</div>

				{/* FACET 3: Bright Left-lit face (creates 3D corner) */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: "linear-gradient(160deg, #9699A6 0%, #686A75 100%)",
						clipPath: "polygon(10% 12%, 48% 18%, 52% 48%, 45% 78%, 52% 97%, 22% 98%, 12% 82%, 8% 48%, 12% 24%)",
					}}
				>
					{stoneNoise}
				</div>

				{/* FACET 4: Jagged Top Cap Surface (The flat top of the stone) */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						height: 50,
						background: "linear-gradient(110deg, #AFB1C0 0%, #898A94 100%)",
						clipPath: "polygon(5% 10%, 82% 0%, 98% 18%, 88% 22%, 48% 18%, 10% 12%)",
					}}
				>
					{stoneNoise}
				</div>

				{/* Crack details / structural lines in the stone */}
				<div style={{
					position: "absolute", left: "62%", top: "30%", width: "3%", height: "45%",
					background: "linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0))", 
					transform: "rotate(12deg)", filter: "blur(1px)", clipPath: "polygon(0 0, 100% 15%, 80% 100%, 10% 85%)"
				}} />
				<div style={{
					position: "absolute", left: "45%", top: "65%", width: "2%", height: "35%",
					background: "linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0))", 
					transform: "rotate(-18deg)", filter: "blur(1.5px)",
				}} />
			</div>
		</>
	);
};

const InfoSideCard = ({
	moneyFrom,
	fact,
	theme,
	motion,
	moneyFromMaxLines,
	factMaxLines,
	contentFontSize,
	contentLineHeight,
}: {
	moneyFrom: string;
	fact: string;
	theme: PortraitBiographySteleTheme;
	motion: ReturnType<typeof usePortraitBiographySteleMotion>;
	moneyFromMaxLines: number;
	factMaxLines: number;
	contentFontSize: number;
	contentLineHeight: number;
}) => {
	const moneyFromWrapped = wrapPortraitBiographySteleLines(moneyFrom, 34, moneyFromMaxLines);
	const factWrapped = wrapPortraitBiographySteleLines(fact, 40, factMaxLines);
	const moneyFromLines = moneyFromWrapped.join("\n");
	const factLines = factWrapped.join("\n");

	return (
		<div
			style={{
				position: "absolute",
				left: 488,
				top: 160,
				width: fixedInfoCardWidth,
				borderRadius: 26,
				background: "linear-gradient(180deg, rgba(18,11,14,0.98) 0%, rgba(24,14,18,0.98) 100%)",
				boxShadow: `0 24px 70px rgba(0,0,0,0.42), 0 0 0 1px ${theme.secondaryShell} inset`,
				transform: `translateX(${Math.round((1 - motion.copy) * 56)}px) translateY(${Math.round((1 - motion.copy) * 12)}px)`,
				opacity: motion.copyOpacity,
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					top: 0,
					height: 4,
					background: "linear-gradient(90deg, rgba(255,180,120,0.1) 0%, rgba(255,180,120,0.82) 26%, rgba(255,180,120,0.1) 100%)",
				}}
			/>
			<div
				style={{
					padding: "26px 28px 24px",
					display: "flex",
					flexDirection: "column",
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						fontSize: 13,
						textTransform: "uppercase",
						letterSpacing: "0.12em",
						fontWeight: 800,
						color: "rgba(225, 175, 160, 0.74)",
						marginBottom: 8,
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
						whiteSpace: "pre-line",
						marginBottom: 18,
					}}
				>
					{moneyFromLines}
				</div>
				<div
					style={{
						height: 1,
						background: "linear-gradient(90deg, rgba(148,163,184,0.08) 0%, rgba(148,163,184,0.42) 18%, rgba(148,163,184,0.08) 100%)",
						marginBottom: 18,
					}}
				/>
				<div
					style={{
						fontSize: 13,
						textTransform: "uppercase",
						letterSpacing: "0.12em",
						fontWeight: 800,
						color: "rgba(225, 175, 160, 0.74)",
						marginBottom: 12,
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
						whiteSpace: "pre-line",
					}}
				>
					{factLines}
				</div>
			</div>
		</div>
	);
};

const FlagMast = ({
	flagCode,
	delay,
}: {
	flagCode?: string | null;
	delay: number;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
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
				<AnimatedFlagCloth countryCode={flagCode} width={clothWidth} height={clothHeight} />
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

const shimmerOverlay = (motion: ReturnType<typeof usePortraitBiographySteleMotion>) => (
	<div
		style={{
			position: "absolute",
			inset: 0,
			background: "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.05) 42%, rgba(255,255,255,0.18) 52%, transparent 65%)",
			transform: `translateX(${motion.shimmer}%)`,
			opacity: motion.media * 0.9,
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
}: {
	countryCode: string;
	width: number;
	height: number;
}) => {
	const [texture, setTexture] = useState<THREE.Texture | null>(null);
	const [renderHandle] = useState(() => delayRender("Loading portrait biography stele flag texture"));
	const frame = useCurrentFrame();

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

export const PortraitBiographySteleHero = ({
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
	moneyFromMaxLines = 6,
	factMaxLines = 8,
	contentFontSize = 22,
	contentLineHeight = 1.18,
}: PortraitBiographySteleHeroProps) => {
	const motion = usePortraitBiographySteleMotion(delay);

	return (
		<div style={baseCardStyle}>
			<ProductionPedestal bodyHeightTarget={pedestalBodyHeight} motion={motion} />
			<InfoSideCard
				moneyFrom={moneyFrom}
				fact={fact}
				theme={theme}
				motion={motion}
				moneyFromMaxLines={moneyFromMaxLines}
				factMaxLines={factMaxLines}
				contentFontSize={contentFontSize}
				contentLineHeight={contentLineHeight}
			/>
			<FlagMast flagCode={flagCode} delay={delay} />
			<div
				style={{
					position: "absolute",
					left: 78,
					top: 72,
					width: 404,
					height: 790,
					borderRadius: 36,
					background: theme.shell,
					boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px ${theme.secondaryShell} inset, 0 0 44px rgba(255,180,120,${0.12 + motion.glow * 0.08})`,
					transform: `${theme.tilt} translateY(${Math.round(motion.y)}px) scale(${motion.scale})`,
					opacity: motion.opacity,
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
						opacity={motion.media}
						scale={motion.mediaScale}
						radius={28}
					/>
					{shimmerOverlay(motion)}
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
						transform: `translateY(${Math.round(motion.copyY)}px)`,
						opacity: motion.copyOpacity,
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
								fontSize: 16,
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
