import { prepare, layout, prepareWithSegments, layoutWithLines } from '@chenglou/pretext';
import { FONT_CONFIG, BREAKPOINTS, LINE_HEIGHT } from '$lib/constants/fonts';
import type { Game } from '$lib/types/game';

type PreparedText = ReturnType<typeof prepare>;
type PreparedTextWithSegments = ReturnType<typeof prepareWithSegments>;

interface TextMeasurementCache {
	prepared: PreparedText;
	preparedWithSegments: PreparedTextWithSegments;
	font: string;
}

const measurementCache = new Map<string, TextMeasurementCache>();

function getCacheKey(text: string, font: string): string {
	return `${text}:${font}`;
}

function getOrCreateMeasurement(text: string, font: string): TextMeasurementCache {
	const key = getCacheKey(text, font);

	const cached = measurementCache.get(key);
	if (cached) return cached;

	const prepared = prepare(text, font);
	const preparedWithSegments = prepareWithSegments(text, font);

	const cache: TextMeasurementCache = {
		prepared,
		preparedWithSegments,
		font,
	};

	measurementCache.set(key, cache);
	return cache;
}

export function measureTextWidth(text: string, font: string): number {
	try {
		const { preparedWithSegments } = getOrCreateMeasurement(text, font);
		const { lines } = layoutWithLines(preparedWithSegments, 100000, 1);
		if (lines && lines.length > 0) {
			return lines[0].width;
		}
	} catch {
		// Canvas unavailable (jsdom, SSR) — return 0
	}
	return 0;
}

export function measureTextHeight(text: string, font: string, maxWidth: number, lineHeight: number): number {
	try {
		const { prepared } = getOrCreateMeasurement(text, font);
		const { height } = layout(prepared, maxWidth, lineHeight);
		return height;
	} catch {
		// Canvas unavailable (jsdom, SSR) — return lineHeight as fallback
		return lineHeight;
	}
}

export function measureTextLines(text: string, font: string, maxWidth: number, lineHeight: number): number {
	try {
		const { prepared } = getOrCreateMeasurement(text, font);
		const { lineCount } = layout(prepared, maxWidth, lineHeight);
		return lineCount;
	} catch {
		return 1;
	}
}

export interface LineInfo {
	text: string;
	width: number;
	start: { segmentIndex: number; graphemeIndex: number };
	end: { segmentIndex: number; graphemeIndex: number };
}

export function getTextLines(text: string, font: string, maxWidth: number, lineHeight: number): LineInfo[] {
	try {
		const { preparedWithSegments } = getOrCreateMeasurement(text, font);
		const { lines } = layoutWithLines(preparedWithSegments, maxWidth, lineHeight);
		return lines;
	} catch {
		return [];
	}
}

export function measureTitleHeight(title: string, maxWidth: number, font?: string): number {
	const fontString = font ?? FONT_CONFIG.cardTitle;
	return measureTextHeight(title, fontString, maxWidth, LINE_HEIGHT.normal);
}

export function measureSubtitleHeight(subtitle: string, maxWidth: number): number {
	return measureTextHeight(subtitle, FONT_CONFIG.cardSubtitle, maxWidth, LINE_HEIGHT.tight);
}

export function measureBadgeWidth(text: string): number {
	return measureTextWidth(text, FONT_CONFIG.badge);
}

export interface CardHeights {
	headerHeight: number;
	infoHeight: number;
	totalHeight: number;
}

export function computeCardHeights(game: Game, cardWidth: number): CardHeights {
	const title = game.mainTitle || game.title;
	const subtitle = game.subtitle;

	const titleHeight = measureTitleHeight(title, cardWidth);

	let headerHeight = titleHeight + 8;
	if (subtitle) {
		const subtitleHeight = measureSubtitleHeight(subtitle, cardWidth);
		headerHeight += subtitleHeight + 4;
	}

	const infoHeight = 240;

	return {
		headerHeight: Math.ceil(headerHeight),
		infoHeight,
		totalHeight: Math.ceil(headerHeight + infoHeight),
	};
}

export function computeAllCardHeights(games: Game[], cardWidths: number[]): Map<string, Record<number, CardHeights>> {
	const result = new Map<string, Record<number, CardHeights>>();

	for (const game of games) {
		const heights: Record<number, CardHeights> = {};
		for (const width of cardWidths) {
			heights[width] = computeCardHeights(game, width);
		}
		result.set(game.id, heights);
	}

	return result;
}

export function clearMeasurementCache(): void {
	measurementCache.clear();
}

export { FONT_CONFIG, BREAKPOINTS, LINE_HEIGHT };
