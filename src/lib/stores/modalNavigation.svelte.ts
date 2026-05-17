import { getTierDisplayName, getTierWeight } from '$lib/utils/tierUtils';
import { parseDate } from '$lib/utils/dateUtils';
import type { Game } from '../types/game.js';
import type { SortOption } from './filters.svelte';

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

	let filteredGames = [...allGames];

	if (filterContext.searchTerm.trim()) {
		const query = filterContext.searchTerm.toLowerCase().trim();
		filteredGames = filteredGames.filter((game) => game.title.toLowerCase().includes(query));
	}

	if (filterContext.platforms.length > 0) {
		filteredGames = filteredGames.filter((game) => filterContext.platforms.includes(game.platform));
	}

	if (filterContext.genres.length > 0) {
		filteredGames = filteredGames.filter((game) => filterContext.genres.includes(game.genre));
	}
	if (filterContext.statuses.length > 0) {
		filteredGames = filteredGames.filter((game) => filterContext.statuses.includes(game.status));
	}

	if (filterContext.tiers.length > 0) {
		filteredGames = filteredGames.filter((game) => {
			if (!game.tier) return false;
			const gameTierFullName = getTierDisplayName(game.tier);
			return filterContext.tiers.includes(gameTierFullName);
		});
	}

	switch (filterContext.activeTab) {
		case 'completed':
			filteredGames = filteredGames.filter((game) => game.status === 'Completed');
			break;
		case 'planned':
			filteredGames = filteredGames.filter((game) => game.status === 'Planned');
			break;
		case 'tierlist':
			filteredGames = filteredGames.filter((game) => game.tier);
			break;
		default:
			break;
	}

	if (filterContext.sortOption) {
		const { key, direction } = filterContext.sortOption;
		const dir = direction === 'asc' ? 1 : -1;

		filteredGames = filteredGames.toSorted((a, b) => {
			const aVal =
				key === 'presentation'
					? (a.ratingPresentation ?? 0)
					: key === 'story'
						? (a.ratingStory ?? 0)
						: key === 'gameplay'
							? (a.ratingGameplay ?? 0)
							: (a.score ?? 0);

			const bVal =
				key === 'presentation'
					? (b.ratingPresentation ?? 0)
					: key === 'story'
						? (b.ratingStory ?? 0)
						: key === 'gameplay'
							? (b.ratingGameplay ?? 0)
							: (b.score ?? 0);

			if (aVal === bVal) return 0;
			return aVal > bVal ? dir : -dir;
		});
	} else {
		switch (filterContext.activeTab) {
			case 'completed':
				filteredGames = filteredGames.toSorted((a, b) => {
					if (!a.finishedDate && !b.finishedDate) return 0;
					if (!a.finishedDate) return 1;
					if (!b.finishedDate) return -1;
					const dateA = parseDate(a.finishedDate);
					const dateB = parseDate(b.finishedDate);
					if (!dateA || !dateB) return 0;
					return dateB - dateA;
				});
				break;
			case 'planned':
				filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
				break;
			case 'tierlist':
				filteredGames = filteredGames.toSorted((a, b) => {
					const weightA = getTierWeight(a.tier || '');
					const weightB = getTierWeight(b.tier || '');
					if (weightA !== weightB) return weightB - weightA;
					return a.title.localeCompare(b.title);
				});
				break;
			default:
				filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
				break;
		}
	}

	return filteredGames;
}
