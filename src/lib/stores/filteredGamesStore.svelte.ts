import type { Game } from '$lib/types/game';
import { appStore, type TabValue } from './app.svelte';
import { filtersStore } from './filters.svelte';
import { gamesStore } from './games.svelte';
import {
	filterGamesByTab,
	filterGamesWithBaseFilters,
	sortGames,
	type FilterTab,
	type SortOption,
} from '$lib/utils/filtering';

function toFilterTab(tab: TabValue): FilterTab {
	if (tab === 'all' || tab === 'completed' || tab === 'planned' || tab === 'tierlist') return tab;
	return 'all';
}

class FilteredGamesStore {
	private sortedMasters = new Map<string, { games: Game[]; sorted: Game[] }>();

	private getSortedMaster(games: Game[], tab: FilterTab, sort: SortOption | null): Game[] {
		const key = `${tab}|${sort?.key ?? ''}|${sort?.direction ?? ''}`;
		const cached = this.sortedMasters.get(key);
		if (cached && cached.games === games) return cached.sorted;

		const sorted = sortGames(games, sort, tab);
		this.sortedMasters.set(key, { games, sorted });
		return sorted;
	}

	private _filteredGames = $derived.by(() => {
		const allGames = gamesStore.games;
		const filters = filtersStore.state;
		const activeTab = appStore.activeTab;

		if (!allGames || allGames.length === 0 || !filters) {
			return [];
		}

		const tab = toFilterTab(activeTab);
		const effectiveSort = tab === 'tierlist' ? null : (filters.sortOption ?? null);

		// The sort comparator only depends on each game's own fields, so sorting the
		// master array once and then filtering (order-preserving) yields the same
		// result as filtering then sorting — but skips the O(n log n) sort on every
		// keystroke. The sorted master is cached per tab/sort configuration.
		const sortedMaster = this.getSortedMaster(allGames, tab, effectiveSort);
		const baseFiltered = filterGamesWithBaseFilters(sortedMaster, filters);
		return filterGamesByTab(baseFiltered, tab);
	});

	get games(): Game[] {
		return this._filteredGames;
	}

	getFilteredGames(tab?: string): Game[] {
		const activeTab = typeof tab === 'string' ? toFilterTab(tab as TabValue) : toFilterTab(appStore.activeTab);

		if (activeTab === toFilterTab(appStore.activeTab)) {
			return this._filteredGames;
		}

		const allGames = gamesStore.games;
		const filters = filtersStore.state;

		if (!allGames || allGames.length === 0 || !filters) return [];

		const effectiveSort = activeTab === 'tierlist' ? null : (filters.sortOption ?? null);
		const sortedMaster = this.getSortedMaster(allGames, activeTab, effectiveSort);
		const baseFiltered = filterGamesWithBaseFilters(sortedMaster, filters);
		return filterGamesByTab(baseFiltered, activeTab);
	}
}

export const filteredGamesStore = new FilteredGamesStore();
export const filteredGames = filteredGamesStore;
