import type { Game } from '$lib/types/game';
import type { SortKey, SortDirection } from '$lib/stores/filters.svelte';
import { parseDate } from '$lib/utils/dateUtils';
import { getTierDisplayName, getTierWeight } from '$lib/utils/tierUtils';

export interface BaseFilters {
	searchTerm: string;
	platforms: string[];
	genres: string[];
	statuses: string[];
	tiers: string[];
	coOp: string[];
}

export interface SortOption {
	key: SortKey;
	direction: SortDirection;
}

export type FilterTab = 'all' | 'completed' | 'planned' | 'tierlist';

export function filterGamesWithBaseFilters(games: Game[], filters: BaseFilters | null): Game[] {
	if (!filters) return games;

	let filtered = games;

	if (filters.searchTerm?.trim()) {
		const query = filters.searchTerm.toLowerCase().trim();
		filtered = filtered.filter((game) => game.title.toLowerCase().includes(query));
	}

	if (filters.platforms.length > 0) {
		filtered = filtered.filter((game) => filters.platforms.includes(game.platform));
	}
	if (filters.genres.length > 0) {
		filtered = filtered.filter((game) => filters.genres.includes(game.genre));
	}
	if (filters.statuses.length > 0) {
		filtered = filtered.filter((game) => filters.statuses.includes(game.status));
	}

	if (filters.tiers.length > 0) {
		filtered = filtered.filter((game) => {
			if (!game.tier) return false;
			return filters.tiers.includes(getTierDisplayName(game.tier));
		});
	}

	if (filters.coOp.length > 0) {
		filtered = filtered.filter((game) => filters.coOp.includes(game.coOp));
	}

	return filtered;
}

export function filterGamesByTab(games: Game[], activeTab: FilterTab): Game[] {
	switch (activeTab) {
		case 'completed':
			return games.filter((game) => game.status === 'Completed');
		case 'planned':
			return games.filter((game) => game.status === 'Planned');
		case 'tierlist':
			return games.filter((game) => game.tier);
		default:
			return games;
	}
}

function parsePlaytime(time: string | null | undefined): number | null {
	if (!time) return null;
	const match = time.match(/^(\d+)h\s*(\d+)m$/);
	if (!match) return null;
	const hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10);
	return hours * 60 + minutes;
}

function compareNullableNumbers(a: number | null | undefined, b: number | null | undefined): number {
	if (a != null && b != null) {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	}
	if (a != null) return 1;
	if (b != null) return -1;
	return 0;
}

function compareDates(a: string | null | undefined, b: string | null | undefined): number {
	const aTime = parseDate(a ?? null);
	const bTime = parseDate(b ?? null);

	if (aTime === null && bTime === null) return 0;
	if (aTime === null) return 1;
	if (bTime === null) return -1;
	return aTime - bTime;
}

function comparePlaytimes(a: string | null | undefined, b: string | null | undefined): number {
	const aMinutes = parsePlaytime(a);
	const bMinutes = parsePlaytime(b);
	if (aMinutes === null && bMinutes === null) return 0;
	if (aMinutes === null) return 1;
	if (bMinutes === null) return -1;
	return aMinutes - bMinutes;
}

function sortByFinishedDate(a: Game, b: Game, direction: number): number {
	if (!a.finishedDate && !b.finishedDate) return 0;
	if (!a.finishedDate) return 1;
	if (!b.finishedDate) return -1;

	const aTime = parseDate(a.finishedDate);
	const bTime = parseDate(b.finishedDate);

	if (aTime === null && bTime === null) return 0;
	if (aTime === null) return 1;
	if (bTime === null) return -1;

	const timeDiff = aTime - bTime;
	if (timeDiff !== 0) return timeDiff * direction;

	const aOrder = a.completionOrder ?? 0;
	const bOrder = b.completionOrder ?? 0;
	return (aOrder - bOrder) * direction;
}

function sortByRatingField(a: Game, b: Game, sortKey: string, direction: number): number {
	let gameKey: keyof Game;
	switch (sortKey) {
		case 'presentation':
			gameKey = 'ratingPresentation';
			break;
		case 'story':
			gameKey = 'ratingStory';
			break;
		case 'gameplay':
			gameKey = 'ratingGameplay';
			break;
		case 'score':
			gameKey = 'score';
			break;
		default:
			gameKey = 'score';
	}

	return compareNullableNumbers(a[gameKey], b[gameKey]) * direction;
}

export function sortGames(games: Game[], sort: SortOption | null, activeTab: FilterTab): Game[] {
	const dir = sort?.direction === 'desc' ? -1 : 1;
	const finalDir = activeTab === 'completed' && !sort ? -1 : dir;

	return [...games].toSorted((a, b) => sortGamePair(a, b, sort, activeTab, finalDir));
}

function sortGamePair(a: Game, b: Game, sort: SortOption | null, activeTab: FilterTab, direction: number): number {
	if (activeTab === 'tierlist') {
		const weightA = getTierWeight(a.tier ?? '');
		const weightB = getTierWeight(b.tier ?? '');
		if (weightA !== weightB) return weightB - weightA;
		return a.title.localeCompare(b.title);
	}

	const isFinishedDateSort = sort?.key === 'finishedDate' || (activeTab === 'completed' && !sort?.key);

	if (isFinishedDateSort) {
		return sortByFinishedDate(a, b, direction);
	}

	if (sort?.key === 'playtime') {
		return sortByPlaytime(a, b, direction);
	}

	if (sort?.key && ['presentation', 'story', 'gameplay', 'score'].includes(sort.key) && activeTab !== 'planned') {
		return sortByRatingField(a, b, sort.key, direction);
	}

	const baseResult = getBaseSortValue(a, b, sort, activeTab);
	return baseResult * direction;
}

function getBaseSortValue(a: Game, b: Game, sort: SortOption | null, activeTab: FilterTab): number {
	if (sort?.key === 'alphabetical' || activeTab === 'planned') {
		return a.title.localeCompare(b.title);
	}
	if (sort?.key && ['presentation', 'story', 'gameplay', 'score'].includes(sort.key)) {
		const gameKey =
			sort.key === 'presentation'
				? 'ratingPresentation'
				: sort.key === 'story'
					? 'ratingStory'
					: sort.key === 'gameplay'
						? 'ratingGameplay'
						: 'score';
		return compareNullableNumbers(a[gameKey], b[gameKey]);
	}
	if (activeTab === 'completed') {
		return compareDates(a.finishedDate, b.finishedDate);
	}
	return a.title.localeCompare(b.title);
}

function sortByPlaytime(a: Game, b: Game, direction: number): number {
	return comparePlaytimes(a.playtime, b.playtime) * direction;
}

export function filterAndSortGames(
	games: Game[],
	filters: BaseFilters | null,
	activeTab: FilterTab,
	sort: SortOption | null
): Game[] {
	let filtered = filterGamesWithBaseFilters(games, filters);
	filtered = filterGamesByTab(filtered, activeTab);
	const effectiveSort = activeTab === 'tierlist' ? null : sort;
	return sortGames(filtered, effectiveSort, activeTab);
}
