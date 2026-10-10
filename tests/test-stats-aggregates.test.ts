import { describe, expect, test } from 'vitest';
import { computeYearMonthAggregates, countInYear, type YearMonthAggregates } from '#lib/utils/statsAggregates.js';
import type { Game } from '#lib/types/game.js';

function game(id: string, finishedDate: string | null): Game {
	return {
		id,
		title: `Game ${id}`,
		mainTitle: `Game ${id}`,
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'RPG',
		coOp: 'No',
		status: 'Completed',
		coverImage: `covers/${id}.webp`,
		playtime: '10h 0m',
		finishedDate,
		ratingPresentation: 8,
		ratingStory: 8,
		ratingGameplay: 8,
		score: 16,
		tier: 'B - Great',
	};
}

const CURRENT_YEAR = new Date().getFullYear();

describe('computeYearMonthAggregates', () => {
	test('aggregates counts and month buckets in one pass', () => {
		const games = [
			game('1', '2024-01-15T00:00:00.000Z'),
			game('2', '2024-01-20T00:00:00.000Z'),
			game('3', '2024-03-02T00:00:00.000Z'),
			game('4', '2023-12-31T00:00:00.000Z'),
			game('5', null),
		];

		const agg = computeYearMonthAggregates(games);

		expect(agg.years).toHaveLength(2);
		expect(agg.years[0].year).toBe(2023);
		expect(agg.years[0].count).toBe(1);
		expect(agg.years[0].months[11]).toBe(1);
		expect(agg.years[1].year).toBe(2024);
		expect(agg.years[1].count).toBe(3);
		expect(agg.years[1].months[0]).toBe(2);
		expect(agg.years[1].months[2]).toBe(1);
	});

	test('summary stats mirror the previous per-derivation math', () => {
		const games = [
			game('1', '2024-01-15T00:00:00.000Z'),
			game('2', '2024-06-20T00:00:00.000Z'),
			game('3', '2025-03-02T00:00:00.000Z'),
		];

		const agg = computeYearMonthAggregates(games);

		expect(agg.totalYears).toBe(2);
		expect(agg.avgPerYear).toBe(1.5); // 3 completed / 2 years
		expect(agg.firstYear).toBe(2024);
		expect(agg.lastYear).toBe(2025);
	});

	test('bestYear keeps the first-seen year on ties (map insertion order)', () => {
		// 2025 appears first in the array, so it wins the tie against 2024
		const games = [
			game('1', '2025-01-15T00:00:00.000Z'),
			game('2', '2024-01-20T00:00:00.000Z'),
			game('3', '2024-06-20T00:00:00.000Z'),
			game('4', '2025-03-02T00:00:00.000Z'),
		];

		const agg = computeYearMonthAggregates(games);

		expect(agg.bestYear).toBe(2025);
		expect(agg.bestCount).toBe(2);
	});

	test('countInYear answers the current-year derivations', () => {
		const games = [
			game('1', new Date(Date.UTC(CURRENT_YEAR, 2, 10)).toISOString()),
			game('2', new Date(Date.UTC(CURRENT_YEAR, 8, 10)).toISOString()),
			game('3', '2020-01-01T00:00:00.000Z'),
		];

		const agg = computeYearMonthAggregates(games);

		expect(countInYear(agg, CURRENT_YEAR)).toBe(2);
		expect(countInYear(agg, CURRENT_YEAR - 1)).toBe(0);
	});

	test('empty input produces safe zeroed aggregates', () => {
		const agg: YearMonthAggregates = computeYearMonthAggregates([]);

		expect(agg.years).toEqual([]);
		expect(agg.totalYears).toBe(0);
		expect(agg.avgPerYear).toBe(0);
		expect(agg.bestYear).toBe(0);
		expect(agg.bestCount).toBe(0);
		expect(agg.firstYear).toBeUndefined();
		expect(agg.lastYear).toBeUndefined();
	});
});
