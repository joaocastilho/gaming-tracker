export interface YearlyMonthRow {
	year: number;
	data: number[];
}

/** Number of heat degrees (0 = empty, 1-5 = cold to hot). */
export const HEAT_LEVELS = 5;

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
	const ratio = value / max;
	if (ratio <= 0.2) return 1;
	if (ratio <= 0.4) return 2;
	if (ratio <= 0.6) return 3;
	if (ratio <= 0.8) return 4;
	return 5;
}

export function getMonthlyHeatClass(value: number, max: number): string {
	const level = getMonthlyHeatLevel(value, max);
	return level === 0 ? '' : `mt-heat-${level}`;
}
