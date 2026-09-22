export interface YearlyMonthRow {
	year: number;
	data: number[];
}

/** Number of heat degrees (0 = empty, 1-5 = cold to hot). */
export const HEAT_LEVELS = 5;

/** Max value for a 0-10 rating (presentation, story, gameplay). */
export const RATING_MAX = 10;

/** Max value for a 0-20 total score. */
export const SCORE_MAX = 20;

function levelFromRatio(ratio: number): number {
	if (ratio <= 0.2) return 1;
	if (ratio <= 0.4) return 2;
	if (ratio <= 0.6) return 3;
	if (ratio <= 0.8) return 4;
	return 5;
}

export function getMonthlyMax(rows: YearlyMonthRow[]): number {
	let max = 0;
	for (const row of rows) {
		for (const value of row.data) {
			if (value > max) max = value;
		}
	}
	return max;
}

export function getMonthlyHeatLevel(value: number, max: number): number {
	if (max <= 0 || value <= 0) return 0;
	return levelFromRatio(value / max);
}

export function getMonthlyHeatClass(value: number, max: number): string {
	const level = getMonthlyHeatLevel(value, max);
	return level === 0 ? '' : `mt-heat-${level}`;
}

export function getRatingHeatLevel(rating: number | null): number {
	if (rating === null || rating === undefined) return 0;
	return levelFromRatio(Math.max(0, rating) / RATING_MAX);
}

export function getRatingHeatClass(rating: number | null): string {
	const level = getRatingHeatLevel(rating);
	return level === 0 ? '' : `heat-${level}`;
}

export function getScoreHeatLevel(score: number | null): number {
	if (score === null || score === undefined) return 0;
	return levelFromRatio(Math.max(0, score) / SCORE_MAX);
}

export function getScoreHeatClass(score: number | null): string {
	const level = getScoreHeatLevel(score);
	return level === 0 ? '' : `heat-${level}`;
}
