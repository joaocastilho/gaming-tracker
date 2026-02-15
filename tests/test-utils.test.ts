import { describe, expect, it, vi } from 'vitest';
import type { Game } from '$lib/types/game';
import { debounce } from '$lib/utils/debounce';
import {
	extractFilterOptions,
	getGenreColor,
	getPlatformColor,
	getTierColor
} from '$lib/utils/filterOptions';
import { formatRating } from '$lib/validation/game';
import { createCompletedGame } from './helpers/factories';

describe('Utility Tests', () => {
	describe('Debounce', () => {
		it('delays execution', async () => {
			const fn = vi.fn(() => {});
			const debounced = debounce(fn, 20);

			debounced();
			debounced();
			debounced();

			expect(fn).not.toHaveBeenCalled();

			await new Promise((resolve) => setTimeout(resolve, 30));

			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('supports immediate execution', async () => {
			const fn = vi.fn(() => {});
			const debounced = debounce(fn, 20, true);

			debounced();
			expect(fn).toHaveBeenCalledTimes(1);

			debounced();
			expect(fn).toHaveBeenCalledTimes(1);

			await new Promise((resolve) => setTimeout(resolve, 30));
			debounced();
			expect(fn).toHaveBeenCalledTimes(2);
		});
	});

	describe('Filter Options', () => {
		const mockGames: Game[] = [
			createCompletedGame({ platform: 'PC', genre: 'RPG', tier: 'S - Masterpiece' }),
			createCompletedGame({ platform: 'PS5', genre: 'Action', tier: 'A - Amazing' }),
			createCompletedGame({ platform: 'PC', genre: 'Action', tier: 'S - Masterpiece' })
		];

		it('extracts unique options', () => {
			const options = extractFilterOptions(mockGames);

			expect(options.platforms).toEqual(['PC', 'PS5']);
			expect(options.genres).toEqual(['Action', 'RPG']);
			expect(options.tiers).toContain('S - Masterpiece');
			expect(options.tiers).toContain('A - Amazing');
		});

		it('returns correct colors', () => {
			expect(getPlatformColor('PC')).toBeDefined();
			expect(getGenreColor('RPG')).toBeDefined();
			expect(getTierColor('S')).toBeDefined();
			expect(getPlatformColor('Unknown')).toContain('bg-gray-600');
		});
	});

	describe('Rating Formatting', () => {
		it('formats whole numbers without decimals', () => {
			expect(formatRating(8)).toBe('8');
			expect(formatRating(10)).toBe('10');
			expect(formatRating(0)).toBe('0');
		});

		it('formats decimals as-is', () => {
			expect(formatRating(7.5)).toBe('7.5');
			expect(formatRating(8.1)).toBe('8.1');
		});

		it('handles null/undefined gracefully', () => {
			expect(formatRating(null)).toBe('-');
			expect(formatRating(undefined)).toBe('-');
		});
	});
});
