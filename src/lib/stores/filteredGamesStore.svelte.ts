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
		const sortFunctions = {
			presentation: (a: Game, b: Game) => this.compareNullableNumbers(a.ratingPresentation, b.ratingPresentation),
			story: (a: Game, b: Game) => this.compareNullableNumbers(a.ratingStory, b.ratingStory),
			gameplay: (a: Game, b: Game) => this.compareNullableNumbers(a.ratingGameplay, b.ratingGameplay),
			score: (a: Game, b: Game) => this.compareNullableNumbers(a.score, b.score),
			finishedDate: (a: Game, b: Game) => this.compareDates(a.finishedDate, b.finishedDate),
			alphabetical: (a: Game, b: Game) => a.title.localeCompare(b.title),
			playtime: (a: Game, b: Game) => this.comparePlaytimes(a.playtime, b.playtime),

			default: (a: Game, b: Game) => a.title.localeCompare(b.title),
			completed: (a: Game, b: Game) => this.compareDates(a.finishedDate, b.finishedDate),
			planned: (a: Game, b: Game) => a.title.localeCompare(b.title),
		};

		let sortFunction = sortFunctions.default;

		if (sort?.key && sortFunctions[sort.key as keyof typeof sortFunctions]) {
			sortFunction = sortFunctions[sort.key as keyof typeof sortFunctions];
		} else if (activeTab === 'planned') {
			sortFunction = sortFunctions.planned;
		} else if (activeTab === 'completed') {
			sortFunction = sortFunctions.completed;
		}

		const sortedGames = [...games];

		let direction = sort?.direction === 'desc' ? -1 : 1;

		if (activeTab === 'completed' && !sort) {
			direction = -1;
		}

		return sortedGames.toSorted((a, b) => {
			const isFinishedDateSort = sort?.key === 'finishedDate' || (activeTab === 'completed' && !sort?.key);

			if (isFinishedDateSort) {
				const aTime = parseDate(a.finishedDate);
				const bTime = parseDate(b.finishedDate);

				if (aTime === null && bTime === null) return 0;
				if (aTime === null) return 1;
				if (bTime === null) return -1;

				const timeDiff = aTime - bTime;
				if (timeDiff !== 0) {
					return timeDiff * direction;
				}

				const aOrder = a.completionOrder ?? 0;
				const bOrder = b.completionOrder ?? 0;

				return (aOrder - bOrder) * direction;
			}

			if (sort?.key === 'playtime') {
				const aMinutes = parsePlaytime(a.playtime);
				const bMinutes = parsePlaytime(b.playtime);

				if (aMinutes === null && bMinutes === null) return 0;
				if (aMinutes === null) return 1;
				if (bMinutes === null) return -1;

				return (aMinutes - bMinutes) * direction;
			}

			if (activeTab !== 'planned' && ['presentation', 'story', 'gameplay', 'score'].includes(sort?.key || '')) {
				let key: keyof Game;
				switch (sort?.key) {
					case 'presentation':
						key = 'ratingPresentation';
						break;
					case 'story':
						key = 'ratingStory';
						break;
					case 'gameplay':
						key = 'ratingGameplay';
						break;
					case 'score':
						key = 'score';
						break;
					default:
						key = 'score';
				}

				const aVal = a[key] as number | null | undefined;
				const bVal = b[key] as number | null | undefined;

				const aHasData = aVal !== null && aVal !== undefined;
				const bHasData = bVal !== null && bVal !== undefined;

				if (aHasData && !bHasData) return -1;
				if (!aHasData && bHasData) return 1;
				if (!aHasData && !bHasData) return 0;

				const valA = aVal as number;
				const valB = bVal as number;

				if (valA === valB) return 0;
				return (valA - valB) * direction;
			}

			const result = sortFunction(a, b);
			return result * direction;
		});
	}

	private compareNullableNumbers(a: number | null | undefined, b: number | null | undefined): number {
		const hasDataA = a !== null && a !== undefined;
		const hasDataB = b !== null && b !== undefined;

		if (hasDataA && !hasDataB) return 1;
		if (!hasDataA && hasDataB) return -1;
		if (!hasDataA && !hasDataB) return 0;

		return (a as number) - (b as number);
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
