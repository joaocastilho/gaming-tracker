import type { Game } from '$lib/types/game';
import { parseDate } from '$lib/utils/dateUtils';
import { getTierDisplayName } from '$lib/utils/tierUtils';
import { appStore } from './app.svelte';
import { filtersStore } from './filters.svelte';
import { gamesStore } from './games.svelte';

function parsePlaytime(time: string | null | undefined): number | null {
	if (!time) return null;
	const match = time.match(/^(\d+)h\s*(\d+)m$/);
	if (!match) return null;
	const hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10);
	return hours * 60 + minutes;
}

class FilteredGamesStore {
	private _filteredGames = $derived.by(() => {
		const games = gamesStore.games;
		const filters = filtersStore.state;
		const activeTab = appStore.activeTab;

		if (!games || games.length === 0) {
			return [];
		}

		// Always apply base filters (search, platforms, genres, etc.)
		let filtered = this.filterGamesWithoutTabFilter(games, filters);

		// Apply tab-specific filtering
		switch (activeTab) {
			case 'completed':
				filtered = filtered.filter((game) => game.status === 'Completed');
				break;
			case 'planned':
				filtered = filtered.filter((game) => game.status === 'Planned');
				break;
			case 'tierlist':
				filtered = filtered.filter((game) => game.tier);
				break;
		}

		// Apply sorting
		const effectiveSort = activeTab === 'tierlist' ? null : (filters?.sortOption ?? null);
		return this.sortGames(filtered, effectiveSort, activeTab);
	});

	get games(): Game[] {
		return this._filteredGames;
	}

	/**
	 * Returns filtered games for a specific tab, regardless of current appStore.activeTab
	 * Useful for background counts or specific view overrides
	 */
	getFilteredGames(tab?: string): Game[] {
		const activeTab = tab ?? appStore.activeTab;

		// If it's the current tab, use the optimized derived value
		if (activeTab === appStore.activeTab) {
			return this._filteredGames;
		}

		// Otherwise recalculate (non-reactive or will be tracked by caller)
		const games = gamesStore.games;
		const filters = filtersStore.state;

		if (!games || games.length === 0) return [];

		let filtered = this.filterGamesWithoutTabFilter(games, filters);

		switch (activeTab) {
			case 'completed':
				filtered = filtered.filter((game) => game.status === 'Completed');
				break;
			case 'planned':
				filtered = filtered.filter((game) => game.status === 'Planned');
				break;
			case 'tierlist':
				filtered = filtered.filter((game) => game.tier);
				break;
		}

		const effectiveSort = activeTab === 'tierlist' ? null : (filters?.sortOption ?? null);
		return this.sortGames(filtered, effectiveSort, activeTab);
	}

	private filterGamesWithoutTabFilter(
		games: Game[],
		filters: {
			searchTerm: string;
			platforms: string[];
			genres: string[];
			statuses: string[];
			tiers: string[];
			coOp: string[];
		} | null
	): Game[] {
		let filteredGames = games;

		if (!filters) return filteredGames;

		if (filters.searchTerm?.trim()) {
			const query = filters.searchTerm.toLowerCase().trim();
			filteredGames = filteredGames.filter((game) => game.title.toLowerCase().includes(query));
		}

		if (filters.platforms.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.platforms.includes(game.platform));
		}
		if (filters.genres.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.genres.includes(game.genre));
		}
		if (filters.statuses.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.statuses.includes(game.status));
		}

		if (filters.tiers.length > 0) {
			filteredGames = filteredGames.filter((game) => {
				if (!game.tier) return false;
				const gameTierFullName = getTierDisplayName(game.tier);
				return filters.tiers.includes(gameTierFullName);
			});
		}

		if (filters.coOp.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.coOp.includes(game.coOp));
		}

		return filteredGames;
	}

	private sortGames(games: Game[], sort: { key: string; direction: 'asc' | 'desc' } | null, activeTab: string): Game[] {
		const dir = sort?.direction === 'desc' ? -1 : 1;
		const finalDir = activeTab === 'completed' && !sort ? -1 : dir;

		return [...games].toSorted((a, b) => this.sortGamePair(a, b, sort, activeTab, finalDir));
	}

	private sortGamePair(
		a: Game,
		b: Game,
		sort: { key: string; direction: 'asc' | 'desc' } | null,
		activeTab: string,
		direction: number
	): number {
		const isFinishedDateSort = sort?.key === 'finishedDate' || (activeTab === 'completed' && !sort?.key);

		if (isFinishedDateSort) {
			return this.sortByFinishedDate(a, b, direction);
		}

		if (sort?.key === 'playtime') {
			return this.sortByPlaytime(a, b, direction);
		}

		if (sort?.key && ['presentation', 'story', 'gameplay', 'score'].includes(sort.key) && activeTab !== 'planned') {
			return this.sortByRatingField(a, b, sort.key, direction);
		}

		const baseResult = this.getBaseSortFunction(sort, activeTab)(a, b);
		return baseResult * direction;
	}

	private sortByFinishedDate(a: Game, b: Game, direction: number): number {
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

	private sortByPlaytime(a: Game, b: Game, direction: number): number {
		return this.comparePlaytimes(a.playtime, b.playtime) * direction;
	}

	private sortByRatingField(a: Game, b: Game, sortKey: string, direction: number): number {
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

		const aVal = a[gameKey];
		const bVal = b[gameKey];

		if (aVal == null && bVal == null) return 0;
		if (aVal == null) return 1;
		if (bVal == null) return -1;

		if (aVal === bVal) return 0;
		return (aVal - bVal) * direction;
	}

	private getBaseSortFunction(
		sort: { key: string; direction: 'asc' | 'desc' } | null,
		activeTab: string
	): (a: Game, b: Game) => number {
		if (sort?.key === 'alphabetical' || activeTab === 'planned') {
			return (a, b) => a.title.localeCompare(b.title);
		}
		if (sort?.key === 'presentation' || sort?.key === 'story' || sort?.key === 'gameplay' || sort?.key === 'score') {
			const gameKey = (
				{
					presentation: 'ratingPresentation',
					story: 'ratingStory',
					gameplay: 'ratingGameplay',
					score: 'score',
				} as const
			)[sort.key];
			return (a, b) => this.compareNullableNumbers(a[gameKey], b[gameKey]);
		}
		if (activeTab === 'completed') {
			return (a, b) => this.compareDates(a.finishedDate, b.finishedDate);
		}
		return (a, b) => a.title.localeCompare(b.title);
	}

	private compareNullableNumbers(a: number | null | undefined, b: number | null | undefined): number {
		if (a != null && b != null) {
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
		if (a != null) return 1;
		if (b != null) return -1;
		return 0;
	}

	private compareDates(a: string | null | undefined, b: string | null | undefined): number {
		const aTime = parseDate(a ?? null);
		const bTime = parseDate(b ?? null);

		if (aTime === null && bTime === null) return 0;
		if (aTime === null) return 1;
		if (bTime === null) return -1;
		return aTime - bTime;
	}

	private comparePlaytimes(a: string | null | undefined, b: string | null | undefined): number {
		const aMinutes = parsePlaytime(a);
		const bMinutes = parsePlaytime(b);
		if (aMinutes === null && bMinutes === null) return 0;
		if (aMinutes === null) return 1;
		if (bMinutes === null) return -1;
		return aMinutes - bMinutes;
	}
}

export const filteredGamesStore = new FilteredGamesStore();

export const filteredGames = filteredGamesStore;
