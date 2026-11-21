import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filtersStore } from '#lib/stores/filters.js';
import { gamesStore } from '#lib/stores/games.js';
import { goto } from '#lib/utils/routerBridge.js';

vi.mock('#lib/utils/routerBridge.js', () => ({
	goto: vi.fn(() => Promise.resolve()),
}));

describe('FiltersStore URL Sync', () => {
	beforeEach(() => {
		gamesStore.initializeGames([
			{ id: '1', title: 'Test', platform: 'PC', genre: 'RPG', status: 'Completed' },
			{ id: '2', title: 'Test 2', platform: 'PS5', genre: 'Action' },
		]);

		filtersStore.resetFilters();
		vi.clearAllMocks();

		Object.defineProperty(window, 'location', {
			value: new URL('http://localhost/'),
			writable: true,
		});
	});

	it('should restore platform filters from URL', () => {
		const params = new URLSearchParams('?platform=pc&platform=ps5');
		filtersStore.readSearchFromURL(params);

		expect(filtersStore.selectedPlatforms).toContain('PC');
		expect(filtersStore.selectedPlatforms).toContain('PS5');
	});

	it('should restore genre filters from URL', () => {
		const params = new URLSearchParams('?genre=rpg&genre=action');
		filtersStore.readSearchFromURL(params);

		expect(filtersStore.selectedGenres).toContain('RPG');
		expect(filtersStore.selectedGenres).toContain('Action');
	});

	it('should restore status filters from URL', () => {
		const params = new URLSearchParams('?status=completed');
		filtersStore.readSearchFromURL(params);

		expect(filtersStore.state?.statuses).toContain('Completed');
	});

	it('should write multiple filter types to URL', async () => {
		vi.useFakeTimers();

		try {
			filtersStore.togglePlatform('PC');
			filtersStore.toggleGenre('RPG');
			filtersStore.setSearchTerm('Zelda');

			filtersStore.writeSearchToURL({});

			await vi.advanceTimersByTimeAsync(300);

			expect(goto).toHaveBeenCalled();

			const lastCall = vi.mocked(goto).mock.calls.at(-1);
			const urlString = lastCall?.[0] as string;
			const url = new URL(urlString);

			expect(url.searchParams.get('s')).toBe('Zelda');
			expect(url.searchParams.getAll('platform')).toContain('pc');
			expect(url.searchParams.getAll('genre')).toContain('rpg');
		} finally {
			vi.useRealTimers();
		}
	});
});
