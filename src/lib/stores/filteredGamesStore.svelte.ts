import type { Game } from '$lib/types/game';
import { appStore, type TabValue } from './app.svelte';
import { filtersStore } from './filters.svelte';
import { filteredGamesBaseStore } from './filteredGamesBase.svelte';
import { filterGamesByTab, sortGames, type FilterTab } from '$lib/utils/filtering';

function toFilterTab(tab: TabValue): FilterTab {
	if (tab === 'all' || tab === 'completed' || tab === 'planned' || tab === 'tierlist') return tab;
	return 'all';
}

class FilteredGamesStore {
	private _filteredGames = $derived.by(() => {
		const baseFiltered = filteredGamesBaseStore.games;
		const filters = filtersStore.state;
		const activeTab = appStore.activeTab;

		if (!baseFiltered || baseFiltered.length === 0) {
			return [];
		}

		const tabFiltered = filterGamesByTab(baseFiltered, toFilterTab(activeTab));
		const effectiveSort = activeTab === 'tierlist' ? null : (filters?.sortOption ?? null);
		return sortGames(tabFiltered, effectiveSort, toFilterTab(activeTab));
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

		const baseFiltered = filteredGamesBaseStore.games;
		const filters = filtersStore.state;

		if (!baseFiltered || baseFiltered.length === 0) return [];

		const tabFiltered = filterGamesByTab(baseFiltered, activeTab);
		const effectiveSort = activeTab === 'tierlist' ? null : (filters?.sortOption ?? null);
		return sortGames(tabFiltered, effectiveSort, activeTab);
	}
}

export const filteredGamesStore = new FilteredGamesStore();
export const filteredGames = filteredGamesStore;
