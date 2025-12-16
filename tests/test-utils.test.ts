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
import { memoize } from '$lib/utils/memoize';


describe('Utility Tests', () => {
	describe('Memoize', () => {
		it('caches function results', () => {
			const fn = vi.fn((x: number) => x * 2);
			const memoized = memoize(fn);

			expect(memoized(2)).toBe(4);
			expect(memoized(2)).toBe(4);
			expect(fn).toHaveBeenCalledTimes(1);

			expect(memoized(3)).toBe(6);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('respects TTL', async () => {
			const fn = vi.fn((x: number) => x * 2);
			const memoized = memoize(fn, { ttl: 10 });

			expect(memoized(2)).toBe(4);
			expect(fn).toHaveBeenCalledTimes(1);

			await new Promise((resolve) => setTimeout(resolve, 20));

			expect(memoized(2)).toBe(4);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('respects maxSize', () => {
			const fn = vi.fn((x: number) => x * 2);
			const memoized = memoize(fn, { maxSize: 2 });

			memoized(1);
			memoized(2);
			memoized(3); // Evicts 1

			expect(fn).toHaveBeenCalledTimes(3);

			memoized(2); // Cached
			expect(fn).toHaveBeenCalledTimes(3);

			memoized(1); // Re-calculated
			expect(fn).toHaveBeenCalledTimes(4);
		});
	});

	describe('Debounce', () => {
		it('delays execution', async () => {
			const fn = vi.fn(() => { });
			const debounced = debounce(fn, 20);

			debounced();
			debounced();
			debounced();

			expect(fn).not.toHaveBeenCalled();

			await new Promise((resolve) => setTimeout(resolve, 30));

			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('supports immediate execution', async () => {
			const fn = vi.fn(() => { });
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
		const mockGames = [
			{ platform: 'PC', genre: 'RPG', tier: 'S - Masterpiece' },
			{ platform: 'PS5', genre: 'Action', tier: 'A - Amazing' },
			{ platform: 'PC', genre: 'Action', tier: 'S - Masterpiece' }
		] as Game[];

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
