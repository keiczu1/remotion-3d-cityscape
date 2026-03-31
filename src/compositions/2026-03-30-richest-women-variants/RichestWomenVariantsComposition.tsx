import {AbsoluteFill, useCurrentFrame} from "remotion";

import {
	PortraitBiographySteleHero,
	portraitBiographySteleDefaultTheme,
} from "../../lib/ranking-corridor/hero";
import {
	defaultPreviewOrder,
	getFlagCode,
	getPhotoSrc,
	getPreviewEntry,
	richestWomenEntries,
	type RichestWomenEntry,
} from "./data";

export const durationInFrames = 480;

const sampleEntry = getPreviewEntry(defaultPreviewOrder);

const parseWealthBillions = (wealth: string) => {
	const matches = Array.from(wealth.matchAll(/(\d+(?:\.\d+)?)/g))
		.map((match) => Number(match[1]))
		.filter((value) => Number.isFinite(value));

	if (matches.length === 0) {
		return 1;
	}

	return Math.max(...matches);
};

const wealthValuesBillions = richestWomenEntries.map((entry) => parseWealthBillions(entry.wealth));
const minWealthBillions = Math.min(...wealthValuesBillions);
const maxWealthBillions = Math.max(...wealthValuesBillions);

const getPedestalBodyHeight = (entry: RichestWomenEntry) => {
	if (maxWealthBillions <= minWealthBillions) {
		return 170;
	}

	const progress = (parseWealthBillions(entry.wealth) - minWealthBillions) / (maxWealthBillions - minWealthBillions);
	return Math.round(170 + progress * 80);
};

const getMoneyFromCopy = (entry: RichestWomenEntry) => {
	return entry.source_detail ?? entry.money_from ?? entry.wealth_source ?? "Not specified";
};

export const Scene = () => {
	const frame = useCurrentFrame();
	const frameGlow = 0.24 + Math.sin(frame * 0.028) * 0.04;

	return (
		<AbsoluteFill
			style={{
				background: "linear-gradient(180deg, #08111d 0%, #101b2d 42%, #0a1220 100%)",
				overflow: "hidden",
				fontFamily: "\"Trebuchet MS\", \"Segoe UI\", sans-serif",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: -240,
					background: "radial-gradient(circle at 18% 22%, rgba(95, 214, 255, 0.18) 0%, transparent 28%), radial-gradient(circle at 82% 14%, rgba(255, 214, 138, 0.13) 0%, transparent 24%), radial-gradient(circle at 52% 88%, rgba(56, 189, 248, 0.1) 0%, transparent 30%)",
					filter: "blur(20px)",
					opacity: 0.92,
				}}
			/>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: `radial-gradient(circle at 50% 78%, rgba(40, 120, 170, ${0.07 + frameGlow * 0.12}) 0%, transparent 34%)`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					top: 24,
					bottom: 0,
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "center",
				}}
			>
				<PortraitBiographySteleHero
					photoSrc={getPhotoSrc(sampleEntry)}
					flagCode={getFlagCode(sampleEntry)}
					order={sampleEntry.order}
					name={sampleEntry.name}
					lifeYears={sampleEntry.life_years}
					wealth={sampleEntry.wealth}
					wealthOrigin={sampleEntry.wealth_origin}
					country={sampleEntry.country}
					moneyFrom={getMoneyFromCopy(sampleEntry)}
					fact={sampleEntry.fact}
					pedestalBodyHeight={getPedestalBodyHeight(sampleEntry)}
					theme={portraitBiographySteleDefaultTheme}
				/>
			</div>
		</AbsoluteFill>
	);
};
