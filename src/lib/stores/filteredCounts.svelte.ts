import { gamesStore } from './games.svelte';
import { filtersStore } from './filters.svelte';
import type { Game } from '$lib/types/game';
import type { FilterState } from './filters.svelte';

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

		const filtered = this.filterGamesWithoutTabFilter(games, filters);

		return {
			all: filtered.length,
			completed: filtered.filter((g) => g.status === 'Completed').length,
			planned: filtered.filter((g) => g.status === 'Planned').length,
			tierlist: filtered.filter((g) => g.tier).length,
		};
	});

	private filterGamesWithoutTabFilter(games: Game[], filters: FilterState | null): Game[] {
		if (!filters) return games;

		return games.filter((game) => {
			if (filters.searchTerm) {
				const search = filters.searchTerm.toLowerCase();
				const matchesTitle = game.title.toLowerCase().includes(search);
				const matchesMainTitle = game.mainTitle?.toLowerCase().includes(search);
				const matchesSubtitle = game.subtitle?.toLowerCase().includes(search);
				if (!matchesTitle && !matchesMainTitle && !matchesSubtitle) return false;
			}

			if (filters.platforms.length > 0 && !filters.platforms.includes(game.platform)) return false;
			if (filters.genres.length > 0 && !filters.genres.includes(game.genre)) return false;
			if (filters.statuses.length > 0 && !filters.statuses.includes(game.status)) return false;
			if (filters.tiers.length > 0 && (!game.tier || !filters.tiers.includes(game.tier))) return false;
			if (filters.coOp.length > 0 && !filters.coOp.includes(game.coOp)) return false;

			return true;
		});
	}
}

export const filteredCountsStore = new FilteredCountsStore();
