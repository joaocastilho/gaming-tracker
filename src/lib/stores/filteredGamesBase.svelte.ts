import { gamesStore } from './games.svelte';
import { filtersStore } from './filters.svelte';
import { filterGamesWithBaseFilters } from '$lib/utils/filtering';
import type { Game } from '$lib/types/game';

class FilteredGamesBaseStore {
	games = $derived.by((): Game[] => {
		const allGames = gamesStore.games;
		const filters = filtersStore.state;
		if (!allGames || !filters) return [];
		return filterGamesWithBaseFilters(allGames, filters);
	});
}

export const filteredGamesBaseStore = new FilteredGamesBaseStore();
