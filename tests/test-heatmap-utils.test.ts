import { describe, expect, it } from 'vitest';
import {
	getMonthlyHeatLevel,
	getMonthlyHeatClass,
	getMonthlyMax,
	getRatingHeatLevel,
	getRatingHeatClass,
	getScoreHeatLevel,
	getScoreHeatClass,
} from '$lib/utils/heatmapUtils';

describe('Heatmap Utils', () => {
	it('returns 0 for empty or non-positive values', () => {
		expect(getMonthlyHeatLevel(0, 10)).toBe(0);
		expect(getMonthlyHeatLevel(-1, 10)).toBe(0);
		expect(getMonthlyHeatLevel(5, 0)).toBe(0);
		expect(getMonthlyHeatLevel(0, 0)).toBe(0);
	});

	it('scales levels 1-5 by ratio to max', () => {
		expect(getMonthlyHeatLevel(1, 10)).toBe(1);
		expect(getMonthlyHeatLevel(2, 10)).toBe(1);
		expect(getMonthlyHeatLevel(3, 10)).toBe(2);
		expect(getMonthlyHeatLevel(4, 10)).toBe(2);
		expect(getMonthlyHeatLevel(5, 10)).toBe(3);
		expect(getMonthlyHeatLevel(6, 10)).toBe(3);
		expect(getMonthlyHeatLevel(7, 10)).toBe(4);
		expect(getMonthlyHeatLevel(8, 10)).toBe(4);
		expect(getMonthlyHeatLevel(9, 10)).toBe(5);
		expect(getMonthlyHeatLevel(10, 10)).toBe(5);
	});

	it('returns class names for heat levels', () => {
		expect(getMonthlyHeatClass(0, 10)).toBe('');
		expect(getMonthlyHeatClass(1, 10)).toBe('mt-heat-1');
		expect(getMonthlyHeatClass(10, 10)).toBe('mt-heat-5');
	});

	it('computes max across yearly month data', () => {
		expect(getMonthlyMax([])).toBe(0);
		expect(
			getMonthlyMax([
				{ year: 2024, data: [0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
				{ year: 2025, data: [0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 3] },
			])
		).toBe(5);
	});

	it('maps 0-10 ratings to heat levels 1-5', () => {
		expect(getRatingHeatLevel(null)).toBe(0);
		expect(getRatingHeatLevel(0)).toBe(1);
		expect(getRatingHeatLevel(2)).toBe(1);
		expect(getRatingHeatLevel(3)).toBe(2);
		expect(getRatingHeatLevel(4)).toBe(2);
		expect(getRatingHeatLevel(5)).toBe(3);
		expect(getRatingHeatLevel(6)).toBe(3);
		expect(getRatingHeatLevel(7)).toBe(4);
		expect(getRatingHeatLevel(8)).toBe(4);
		expect(getRatingHeatLevel(9)).toBe(5);
		expect(getRatingHeatLevel(10)).toBe(5);
	});

	it('returns generic heat classes for ratings', () => {
		expect(getRatingHeatClass(null)).toBe('');
		expect(getRatingHeatClass(2)).toBe('heat-1');
		expect(getRatingHeatClass(10)).toBe('heat-5');
	});

	it('maps 0-20 scores to heat levels 1-5', () => {
		expect(getScoreHeatLevel(null)).toBe(0);
		expect(getScoreHeatLevel(0)).toBe(1);
		expect(getScoreHeatLevel(4)).toBe(1);
		expect(getScoreHeatLevel(8)).toBe(2);
		expect(getScoreHeatLevel(12)).toBe(3);
		expect(getScoreHeatLevel(16)).toBe(4);
		expect(getScoreHeatLevel(20)).toBe(5);
	});

	it('returns generic heat classes for scores', () => {
		expect(getScoreHeatClass(null)).toBe('');
		expect(getScoreHeatClass(4)).toBe('heat-1');
		expect(getScoreHeatClass(20)).toBe('heat-5');
	});
});
