import { describe, it, expect, beforeEach, vi } from 'vitest';
import { filtersStore } from '../src/lib/stores/filters.svelte';
import { gamesStore } from '../src/lib/stores/games.svelte';

// Mock SvelteKit base modules
vi.mock('$app/navigation', () => ({
	replaceState: vi.fn(() => Promise.resolve())
}));

describe('FiltersStore URL Sync', () => {
	beforeEach(() => {
		// Initialize gamesStore with some mock data so de-slugification works
		gamesStore.initializeGames([
			{ id: '1', title: 'Test', platform: 'PC', genre: 'RPG', status: 'Completed' },
			{ id: '2', title: 'Test 2', platform: 'PS5', genre: 'Action' }
		]);

		// Reset store state
		filtersStore.resetFilters();
		vi.clearAllMocks();

		// Setup window.location mock
		Object.defineProperty(window, 'location', {
			value: new URL('http://localhost/'),
			writable: true
		});
	});

	it('should restore platform filters from URL', () => {
		// Using slugs in URL
		const params = new URLSearchParams('?platform=pc&platform=ps5');
		filtersStore.readSearchFromURL(params);

		expect(filtersStore.selectedPlatforms).toContain('PC');
		expect(filtersStore.selectedPlatforms).toContain('PS5');
	});

	it('should restore genre filters from URL', () => {
		// Using slugs in URL
		const params = new URLSearchParams('?genre=rpg&genre=action');
		filtersStore.readSearchFromURL(params);

		expect(filtersStore.selectedGenres).toContain('RPG');
		expect(filtersStore.selectedGenres).toContain('Action');
	});

	it('should restore status filters from URL', () => {
		// Using slugs in URL
		const params = new URLSearchParams('?status=completed');
		filtersStore.readSearchFromURL(params);

		expect(filtersStore.state?.statuses).toContain('Completed');
	});

	it('should write multiple filter types to URL', async () => {
		filtersStore.togglePlatform('PC');
		filtersStore.toggleGenre('RPG');
		filtersStore.setSearchTerm('Zelda');

		// Manually trigger the write since the automated effect is in +layout.svelte
		filtersStore.writeSearchToURL({});

		// Wait for debounce (300ms + buffer)
		await new Promise((resolve) => setTimeout(resolve, 400));

		const replaceStateMock = (await import('$app/navigation')).replaceState;
		expect(replaceStateMock).toHaveBeenCalled();

		const lastCall = vi.mocked(replaceStateMock).mock.calls.at(-1);
		const urlString = lastCall?.[0] as string;
		const url = new URL(urlString);

		expect(url.searchParams.get('s')).toBe('Zelda');
		expect(url.searchParams.getAll('platform')).toContain('pc');
		expect(url.searchParams.getAll('genre')).toContain('rpg');
	});
});
