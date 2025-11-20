import { describe, it, expect, mock } from 'bun:test';
import { memoize } from '$lib/utils/memoize';
import { debounce } from '$lib/utils/debounce';
import {
	extractFilterOptions,
	getPlatformColor,
	getGenreColor,
	getTierColor
} from '$lib/utils/filterOptions';
import { getUrlParams } from '$lib/utils/clientUtils';
import type { Game } from '$lib/types/game';

describe('Utility Tests', () => {
	describe('Memoize', () => {
		it('caches function results', () => {
			const fn = mock((x: number) => x * 2);
			const memoized = memoize(fn);

			expect(memoized(2)).toBe(4);
			expect(memoized(2)).toBe(4);
			expect(fn).toHaveBeenCalledTimes(1);

			expect(memoized(3)).toBe(6);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('respects TTL', async () => {
			const fn = mock((x: number) => x * 2);
			const memoized = memoize(fn, { ttl: 10 });

			expect(memoized(2)).toBe(4);
			expect(fn).toHaveBeenCalledTimes(1);

			await new Promise((resolve) => setTimeout(resolve, 20));

			expect(memoized(2)).toBe(4);
			expect(fn).toHaveBeenCalledTimes(2);
		});

		it('respects maxSize', () => {
			const fn = mock((x: number) => x * 2);
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
			const fn = mock(() => {});
			const debounced = debounce(fn, 20);

			debounced();
			debounced();
			debounced();

			expect(fn).not.toHaveBeenCalled();

			await new Promise((resolve) => setTimeout(resolve, 30));

			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('supports immediate execution', async () => {
			const fn = mock(() => {});
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
			{ platform: 'PC', genre: 'RPG', tier: 'S' },
			{ platform: 'PS5', genre: 'Action', tier: 'A' },
			{ platform: 'PC', genre: 'Action', tier: 'S' }
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

	describe('Client Utils', () => {
		it('parses URL params correctly', () => {
			const params = new URLSearchParams();
			params.set('searchTerm', 'test');
			params.append('platforms', 'PC');
			params.append('platforms', 'PS5');
			params.set('sortBy', 'score');
			params.set('sortDir', 'desc');

			const parsed = getUrlParams(params);

			expect(parsed.searchTerm).toBe('test');
			expect(parsed.platforms).toEqual(['PC', 'PS5']);
			expect(parsed.sortOption).toEqual({ key: 'score', direction: 'desc' });
		});
	});
});
