import type { Game } from '#lib/types/game.js';
import type { SortOption } from './filters.js';
import { type BaseFilters, filterGamesByTab, filterGamesWithBaseFilters, sortGames } from '#lib/utils/filtering.js';

export interface FilterContext {
	searchTerm: string;
	platforms: string[];
	genres: string[];
	statuses: string[];
	tiers: string[];
	sortOption: SortOption | null;
	activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
}

export function filterGamesByContext(allGames: Game[], filterContext: FilterContext): Game[] {
	if (!filterContext) return allGames;

	const baseFilters: BaseFilters = {
		searchTerm: filterContext.searchTerm,
		platforms: filterContext.platforms,
		genres: filterContext.genres,
		statuses: filterContext.statuses,
		tiers: filterContext.tiers,
		coOp: [],
	};

	let filtered = filterGamesWithBaseFilters(allGames, baseFilters);
	filtered = filterGamesByTab(filtered, filterContext.activeTab);

	const effectiveSort = filterContext.activeTab === 'tierlist' ? null : filterContext.sortOption;
	return sortGames(filtered, effectiveSort, filterContext.activeTab);
}
