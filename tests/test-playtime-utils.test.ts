import { describe, expect, it } from 'vitest';
import type { Game } from '#lib/types/game.js';
import {
	computeAveragePlaytimeMinutes,
	computeMedianPlaytimeMinutes,
	computeTotalPlaytimeMinutes,
	formatMinutes,
	parsePlaytimeToMinutes,
} from '#lib/utils/playtimeUtils.js';
import { createTestGame } from './helpers/factories';

function withPlaytime(playtime: string): Game {
	return createTestGame({ playtime });
}

describe('parsePlaytimeToMinutes', () => {
	it('parses the "Xh Ym" format', () => {
		expect(parsePlaytimeToMinutes('2h 30m')).toBe(150);
		expect(parsePlaytimeToMinutes('0h 5m')).toBe(5);
		expect(parsePlaytimeToMinutes('45h 0m')).toBe(2700);
	});

	it('returns 0 for missing or malformed values', () => {
		expect(parsePlaytimeToMinutes('')).toBe(0);
		expect(parsePlaytimeToMinutes(null)).toBe(0);
		expect(parsePlaytimeToMinutes(undefined)).toBe(0);
		expect(parsePlaytimeToMinutes('2.5h')).toBe(0);
	});
});

describe('formatMinutes', () => {
	it('formats hours and minutes', () => {
		expect(formatMinutes(0)).toBe('0h');
		expect(formatMinutes(45)).toBe('45m');
		expect(formatMinutes(120)).toBe('2h');
		expect(formatMinutes(150)).toBe('2h 30m');
	});
});

describe('computeTotalPlaytimeMinutes', () => {
	it('sums playtime across games, treating missing values as zero', () => {
		expect(computeTotalPlaytimeMinutes([withPlaytime('1h 30m'), withPlaytime('2h 0m'), withPlaytime('')])).toBe(210);
	});

	it('returns 0 for no games', () => {
		expect(computeTotalPlaytimeMinutes([])).toBe(0);
	});
});

describe('computeAveragePlaytimeMinutes', () => {
	it('averages only games that have playtime', () => {
		expect(
			computeAveragePlaytimeMinutes([
				withPlaytime('1h 0m'),
				withPlaytime('3h 0m'),
				withPlaytime('0h 0m'),
				withPlaytime(''),
			])
		).toBe(120);
	});

	it('returns 0 when no game has playtime', () => {
		expect(computeAveragePlaytimeMinutes([withPlaytime(''), withPlaytime('0h 0m')])).toBe(0);
		expect(computeAveragePlaytimeMinutes([])).toBe(0);
	});
});

describe('computeMedianPlaytimeMinutes', () => {
	it('returns the middle value of games with playtime, ignoring unplayed ones', () => {
		expect(
			computeMedianPlaytimeMinutes([
				withPlaytime('3h 0m'),
				withPlaytime('1h 0m'),
				withPlaytime('2h 0m'),
				withPlaytime(''),
			])
		).toBe(120);
	});

	it('averages the two middle values for an even count', () => {
		expect(computeMedianPlaytimeMinutes([withPlaytime('1h 0m'), withPlaytime('1h 50m')])).toBe(85);
	});

	it('returns 0 when no game has playtime', () => {
		expect(computeMedianPlaytimeMinutes([withPlaytime('')])).toBe(0);
		expect(computeMedianPlaytimeMinutes([])).toBe(0);
	});
});
