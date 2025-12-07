/**
 * URL Sync Integration Tests
 * Tests the interaction between SearchBar clearing and layout URL sync effect
 * These tests verify the searchClearCoordinator prevents race conditions
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { gamesStore } from '$lib/stores/games.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { lastManualClearTime, markSearchCleared } from '$lib/stores/searchClearCoordinator';
import type { Game } from '$lib/types/game';

const mockGames: Partial<Game>[] = [
	{ id: '1', title: 'Elden Ring', platform: 'PC', genre: 'Action RPG', status: 'Planned' },
	{ id: '2', title: 'Dark Souls III', platform: 'PC', genre: 'Action RPG', status: 'Completed' }
];

function resetStores() {
	filtersStore.resetAllFilters();
	filtersStore.setSearchTerm('');
	filteredGamesStore.clearCache();
	gamesStore.initializeGames(mockGames);
}

// Simulates the URL sync effect logic from +layout.svelte
function simulateURLSyncEffect(urlSearchParam: string | null, currentSearchTerm: string): boolean {
	const timeSinceLastClear = Date.now() - lastManualClearTime;
	if (timeSinceLastClear < 100) return false;

	if (urlSearchParam !== currentSearchTerm && urlSearchParam) {
		filtersStore.setSearchTerm(urlSearchParam);
		return true;
	}
	return false;
}

describe('URL Sync Integration Tests', () => {
	beforeEach(resetStores);

	it('should prevent URL sync from restoring search immediately after manual clear', () => {
		filtersStore.setSearchTerm('Ring');
		markSearchCleared();
		filtersStore.setSearchTerm('');

		const syncHappened = simulateURLSyncEffect('Ring', '');

		expect(syncHappened).toBe(false);
		expect(filtersStore.state?.searchTerm).toBe('');
	});

	it('should allow URL sync after 100ms has passed', async () => {
		markSearchCleared();
		await new Promise((resolve) => setTimeout(resolve, 101));

		const syncHappened = simulateURLSyncEffect('Ring', '');

		expect(syncHappened).toBe(true);
		expect(filtersStore.state?.searchTerm).toBe('Ring');
	});

	it('should verify search -> tab change -> clear scenario', async () => {
		const { appStore } = await import('$lib/stores/app.svelte');

		filtersStore.setSearchTerm('Ring');
		appStore.setActiveTab('planned');

		markSearchCleared();
		filtersStore.setSearchTerm('');

		const syncHappened = simulateURLSyncEffect('Ring', '');

		expect(syncHappened).toBe(false);
		expect(filtersStore.state?.searchTerm).toBe('');
		expect(filteredGamesStore.games.every((g) => g.status === 'Planned')).toBe(true);
	});
});
