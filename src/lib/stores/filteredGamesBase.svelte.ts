import { gamesStore } from './games.svelte';
import { filtersStore } from './filters.svelte';
import { filterGamesWithBaseFilters } from '#lib/utils/filtering.js';
import type { Game } from '#lib/types/game.js';

class FilteredGamesBaseStore {
	games = $derived.by((): Game[] => {
		const allGames = gamesStore.games;
		const filters = filtersStore.state;
		if (!allGames || !filters) return [];
		return filterGamesWithBaseFilters(allGames, filters);
	});
}

export const filteredGamesBaseStore = new FilteredGamesBaseStore();
