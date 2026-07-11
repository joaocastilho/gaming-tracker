import { describe, expect, it, vi } from 'vitest';
import type { Game } from '$lib/types/game';
import { debounce } from '$lib/utils/debounce';
import {
	extractFilterOptions,
	getCoOpColor,
	getGenreColor,
	getPlatformColor,
	getTierColor,
} from '$lib/utils/filterOptions';
import { formatRating } from '$lib/validation/game';
import { getTierClass, getTierDisplayName, getTierWeight } from '$lib/utils/tierUtils';
import { toSlug, fromSlug, createGameSlug, isValidSlug } from '$lib/utils/slugUtils';
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

		it('enforces maxWait by invoking at least once per interval', async () => {
			const fn = vi.fn(() => {});
			const debounced = debounce(fn, 50, false, 80);

			debounced();
			await new Promise((resolve) => setTimeout(resolve, 40));
			expect(fn).not.toHaveBeenCalled();

			debounced();
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});

	describe('Filter Options', () => {
		const mockGames: Game[] = [
			createCompletedGame({ platform: 'PC', genre: 'RPG', tier: 'S - Masterpiece' }),
			createCompletedGame({ platform: 'PS5', genre: 'Action', tier: 'A - Amazing' }),
			createCompletedGame({ platform: 'PC', genre: 'Action', tier: 'S - Masterpiece' }),
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

	describe('Tier Utilities', () => {
		it('returns correct class for known tiers', () => {
			expect(getTierClass('S')).toBe('tier-s');
			expect(getTierClass('A')).toBe('tier-a');
			expect(getTierClass('E')).toBe('tier-e');
		});

		it('returns fallback class for unknown tiers', () => {
			expect(getTierClass('Z')).toBe('bg-gray-600 text-white');
		});

		it('handles full tier names', () => {
			expect(getTierClass('S - Masterpiece')).toBe('tier-s');
		});

		it('returns display name for short codes', () => {
			expect(getTierDisplayName('S')).toBe('S - Masterpiece');
			expect(getTierDisplayName('A')).toBe('A - Amazing');
		});

		it('returns tier as-is if no mapping exists', () => {
			expect(getTierDisplayName('Z')).toBe('Z');
		});

		it('returns correct weight for tiers', () => {
			expect(getTierWeight('S')).toBe(6);
			expect(getTierWeight('A')).toBe(5);
			expect(getTierWeight('B')).toBe(4);
			expect(getTierWeight('C')).toBe(3);
			expect(getTierWeight('D')).toBe(2);
			expect(getTierWeight('E')).toBe(1);
		});

		it('returns 0 for unknown or empty tiers', () => {
			expect(getTierWeight('Z')).toBe(0);
			expect(getTierWeight('')).toBe(0);
		});
	});

	describe('Slug Utilities', () => {
		it('converts text to slug', () => {
			expect(toSlug('The Legend of Zelda')).toBe('the-legend-of-zelda');
			expect(toSlug('Metroid Dread')).toBe('metroid-dread');
		});

		it('handles special characters and diacritics', () => {
			expect(toSlug('Pokémon')).toBe('pokemon');
			expect(toSlug('Résumé')).toBe('resume');
		});

		it('handles empty or invalid input', () => {
			expect(toSlug('')).toBe('');
			expect(toSlug(null as unknown as string)).toBe('');
			expect(toSlug(undefined as unknown as string)).toBe('');
		});

		it('createGameSlug matches toSlug', () => {
			expect(createGameSlug('Hello World')).toBe(toSlug('Hello World'));
		});

		it('validates slugs correctly', () => {
			expect(isValidSlug('hello-world')).toBe(true);
			expect(isValidSlug('test123')).toBe(true);
			expect(isValidSlug('')).toBe(false);
			expect(isValidSlug('Hello World')).toBe(false);
			expect(isValidSlug('hello--world')).toBe(false);
			expect(isValidSlug(null as unknown as string)).toBe(false);
		});

		it('resolves slugs back to original options with fromSlug', () => {
			const options = ['S - Masterpiece', 'A - Amazing', 'B - Great'];
			expect(fromSlug('s-masterpiece', options)).toBe('S - Masterpiece');
			expect(fromSlug('b-great', options)).toBe('B - Great');
		});

		it('fromSlug returns undefined for non-matching slugs', () => {
			expect(fromSlug('z-tier', ['S - Masterpiece'])).toBeUndefined();
		});

		it('fromSlug handles empty input', () => {
			expect(fromSlug('', ['A - Amazing'])).toBeUndefined();
		});
	});

	describe('CoOp Color', () => {
		it('returns correct colors for known values', () => {
			expect(getCoOpColor('Yes')).toBe('coop-yes');
			expect(getCoOpColor('No')).toBe('coop-no');
		});

		it('returns fallback for unknown values', () => {
			expect(getCoOpColor('Maybe')).toBe('bg-gray-600 text-white');
		});
	});
});
