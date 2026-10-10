import type { Game } from '#lib/types/game.js';
import type { SortKey, SortDirection } from '#lib/stores/filters.svelte.js';
import { parseDate } from '#lib/utils/dateUtils.js';
import { parsePlaytimeToMinutes } from '#lib/utils/playtimeUtils.js';
import { getTierDisplayName, getTierWeight } from '#lib/utils/tierUtils.js';

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

	// Compute the query and membership sets once, then evaluate every predicate
	// in a single pass. The previous chained .filter() calls re-scanned the
	// array up to six times; combined with the per-game toLowerCase() this was
	// the hot path on every search keystroke.
	const query = filters.searchTerm ? filters.searchTerm.trim().toLowerCase() : '';
	const platforms = new Set(filters.platforms);
	const genres = new Set(filters.genres);
	const statuses = new Set(filters.statuses);
	const coOp = new Set(filters.coOp);
	const tiers = new Set(filters.tiers);

	return games.filter((game) => {
		if (query) {
			const searchKey = game.searchKey ?? game.title.toLowerCase();
			if (!searchKey.includes(query)) return false;
		}

		if (platforms.size > 0 && !platforms.has(game.platform)) return false;
		if (genres.size > 0 && !genres.has(game.genre)) return false;
		if (statuses.size > 0 && !statuses.has(game.status)) return false;
		if (coOp.size > 0 && !coOp.has(game.coOp)) return false;

		if (tiers.size > 0) {
			if (!game.tier || !tiers.has(getTierDisplayName(game.tier))) return false;
		}

		return true;
	});
}

export function filterGamesByTab(games: Game[], activeTab: FilterTab): Game[] {
	switch (activeTab) {
		case 'completed':
			return games.filter((game) => game.status === 'Completed');
		case 'planned':
			return games.filter((game) => game.status === 'Planned' || game.status === 'Playing');
		case 'tierlist':
			return games.filter((game) => game.tier);
		default:
			return games;
	}
}

function parsePlaytime(time: string | null | undefined): number | null {
	const minutes = parsePlaytimeToMinutes(time);
	return minutes === 0 && !time ? null : minutes;
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
