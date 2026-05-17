import { gamesStore } from './games.svelte';
import { filtersStore } from './filters.svelte';
import { filterGamesWithBaseFilters } from '$lib/utils/filtering';

export interface FilteredTabCounts {
	all: number;
	completed: number;
	planned: number;
	tierlist: number | null;
}

class FilteredCountsStore {
	counts = $derived.by(() => {
		const games = gamesStore.games;
		const filters = filtersStore.state;

		if (!games) return { all: 0, completed: 0, planned: 0, tierlist: null };

		const filtered = filterGamesWithBaseFilters(games, filters);

		return {
			all: filtered.length,
			completed: filtered.filter((g) => g.status === 'Completed').length,
			planned: filtered.filter((g) => g.status === 'Planned').length,
			tierlist: filtered.filter((g) => g.tier).length,
		};
	});
}

export const filteredCountsStore = new FilteredCountsStore();
