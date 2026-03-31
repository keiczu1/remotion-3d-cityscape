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
	shell: "linear-gradient(180deg, rgba(12,18,33,0.98) 0%, rgba(22,29,45,0.98) 100%)",
	secondaryShell: "rgba(96, 165, 250, 0.18)",
	wealth: "#0EA5E9",
	text: "#F8FCFF",
	muted: "#B2C7D9",
	originBg: "rgba(14, 165, 233, 0.16)",
	originText: "#7DD3FC",
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
	const bodyHeight = Math.max(24, Math.round(interpolate(motion.enter, [0, 1], [24, bodyHeightTarget])));
	const capHeight = 16;
	const capBottom = bodyHeight - 4;

	return (
		<>
			<div
				style={{
					position: "absolute",
					left: 144,
					bottom: -8,
					width: 280,
					height: 38,
					borderRadius: 999,
					background: "radial-gradient(circle at 50% 50%, rgba(6,12,24,0.72) 0%, rgba(6,12,24,0.38) 55%, transparent 100%)",
					filter: "blur(10px)",
					opacity: 0.9 * motion.opacity,
					transform: `scale(${0.9 + motion.enter * 0.1})`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 164,
					bottom: 0,
					width: 200,
					height: bodyHeight,
					background: "linear-gradient(180deg, #05070D 0%, #0A0F18 34%, #060A12 100%)",
					boxShadow: "0 22px 48px rgba(0,0,0,0.52), 0 0 0 1px rgba(30,41,59,0.78) inset",
					transform: `translateY(${Math.round((1 - motion.enter) * 90)}px)`,
					opacity: motion.opacity,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 159,
					bottom: capBottom,
					width: 210,
					height: capHeight,
					borderRadius: 2,
					background: "linear-gradient(180deg, rgba(199,245,255,0.94) 0%, rgba(129,225,255,0.86) 48%, rgba(94,193,239,0.72) 100%)",
					boxShadow: "0 0 22px rgba(88,225,255,0.32), 0 2px 0 rgba(255,255,255,0.32) inset",
					transform: `translateY(${Math.round((1 - motion.enter) * 80)}px)`,
					opacity: motion.opacity,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 159,
					bottom: capBottom - 7,
					width: 210,
					height: 8,
					background: "linear-gradient(180deg, rgba(122,214,250,0.92) 0%, rgba(66,136,175,0.66) 100%)",
					clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)",
					opacity: motion.opacity,
					transform: `translateY(${Math.round((1 - motion.enter) * 80)}px)`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 160,
					bottom: 0,
					width: 4,
					height: bodyHeight,
					background: "linear-gradient(180deg, rgba(0,229,255,0.78) 0%, rgba(0,229,255,0.18) 100%)",
					boxShadow: "0 0 12px rgba(0,229,255,0.22)",
					opacity: 0.75 * motion.opacity,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 364,
					bottom: 0,
					width: 4,
					height: bodyHeight,
					background: "linear-gradient(180deg, rgba(0,229,255,0.78) 0%, rgba(0,229,255,0.18) 100%)",
					boxShadow: "0 0 12px rgba(0,229,255,0.22)",
					opacity: 0.75 * motion.opacity,
				}}
			/>
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
				background: "linear-gradient(180deg, rgba(11,18,34,0.98) 0%, rgba(16,24,41,0.98) 100%)",
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
					background: "linear-gradient(90deg, rgba(88,225,255,0.1) 0%, rgba(88,225,255,0.82) 26%, rgba(88,225,255,0.1) 100%)",
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
						color: "rgba(165, 205, 230, 0.74)",
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
						color: "#F8FCFF",
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
						color: "rgba(165, 205, 230, 0.74)",
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
						color: "#EFF6FF",
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
			background: "linear-gradient(180deg, rgba(9,14,24,0.96) 0%, rgba(14,20,34,0.96) 100%)",
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
					boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px ${theme.secondaryShell} inset, 0 0 44px rgba(88,225,255,${0.12 + motion.glow * 0.08})`,
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
							background: "rgba(7, 11, 20, 0.72)",
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
