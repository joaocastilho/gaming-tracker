import { createMemo, createRoot, runWithOwner } from 'solid-js';
import type { Game } from '#lib/types/game.js';
import { filterGamesWithBaseFilters } from '#lib/utils/filtering.js';
import { filtersStore } from './filters.js';
import { gamesStore } from './games.js';

class FilteredGamesBaseStore {
	private _games: () => Game[];

	constructor() {
		this._games = runWithOwner(null, () =>
			createRoot(() =>
				createMemo((): Game[] => {
					const allGames = gamesStore.games;
					const filters = filtersStore.state;
					if (!allGames || !filters) return [];
					return filterGamesWithBaseFilters(allGames, filters);
				})
			)
		);
	}

	get games(): Game[] {
		return this._games();
	}
}

export const filteredGamesBaseStore = new FilteredGamesBaseStore();
