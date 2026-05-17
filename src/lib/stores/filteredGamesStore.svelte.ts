import type { Game } from '$lib/types/game';
import { appStore, type TabValue } from './app.svelte';
import { filtersStore } from './filters.svelte';
import { gamesStore } from './games.svelte';
import { filterAndSortGames, type FilterTab } from '$lib/utils/filtering';

function toFilterTab(tab: TabValue): FilterTab {
	if (tab === 'all' || tab === 'completed' || tab === 'planned' || tab === 'tierlist') return tab;
	return 'all';
}

class FilteredGamesStore {
	private _filteredGames = $derived.by(() => {
		const games = gamesStore.games;
		const filters = filtersStore.state;
		const activeTab = appStore.activeTab;

		if (!games || games.length === 0) {
			return [];
		}

		return filterAndSortGames(games, filters, toFilterTab(activeTab), filters?.sortOption ?? null);
	});

	get games(): Game[] {
		return this._filteredGames;
	}

	getFilteredGames(tab?: string): Game[] {
		const resolvedTab = tab ?? appStore.activeTab;
		const activeTab =
			typeof resolvedTab === 'string' ? toFilterTab(resolvedTab as TabValue) : toFilterTab(appStore.activeTab);

		if (activeTab === toFilterTab(appStore.activeTab)) {
			return this._filteredGames;
		}

		const games = gamesStore.games;
		const filters = filtersStore.state;

		if (!games || games.length === 0) return [];

		return filterAndSortGames(games, filters, activeTab, filters?.sortOption ?? null);
	}
}

export const filteredGamesStore = new FilteredGamesStore();
export const filteredGames = filteredGamesStore;
