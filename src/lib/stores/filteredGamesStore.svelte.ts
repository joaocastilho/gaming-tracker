/**
 * Filtered Games Store - Svelte 5 Runes
 * Filters and sorts games based on current filters and active tab
 */
import type { Game } from '$lib/types/game';
import { parseDate } from '$lib/utils/dateUtils';
import { getTierDisplayName } from '$lib/utils/tierUtils';
import { appStore } from './app.svelte';
import { filteredCountsStore } from './filteredCounts.svelte';
import { filtersStore } from './filters.svelte';
import { gamesStore } from './games.svelte';

interface FilterCacheKey {
	searchTerm: string;
	platforms: string[];
	genres: string[];
	tiers: string[];
	coOp: string[];
	activeTab: string;
	sortKey: string;
	sortDirection: string;
}

class FilteredGamesStore {
	private cache = new Map<string, Game[]>();
	private lastCacheKey: string | null = null;
	private lastCachedResult: Game[] = [];

	/**
	 * Get filtered and sorted games based on current state
	 * This is now a getter that reads reactive state directly
	 */
	get games(): Game[] {
		const games = gamesStore.games;
		const filters = filtersStore.state;
		const activeTab = appStore.activeTab;

		if (!games || games.length === 0) {
			return [];
		}

		const cacheKey = this.createCacheKey(filters, activeTab);

		if (this.lastCacheKey === cacheKey && this.lastCachedResult.length > 0) {
			return this.lastCachedResult;
		}

		const filteredGames = this.filterGames(games, filters, activeTab);
		const sortedGames = this.sortGames(filteredGames, filters?.sortOption ?? null, activeTab);

		this.updateCache(cacheKey, sortedGames);

		// Update counts
		// Apply all filters EXCEPT the tab filter, so counts show games in each category
		// that match the active filters (search, platform, genre, tier, coOp)
		const gamesWithFiltersApplied = this.filterGamesWithoutTabFilter(games, filters);

		const total = gamesWithFiltersApplied.length;
		const completed = gamesWithFiltersApplied.filter((g) => g.status === 'Completed').length;
		const planned = gamesWithFiltersApplied.filter((g) => g.status === 'Planned').length;

		filteredCountsStore.setCounts({
			all: total,
			completed,
			planned,
			tierlist: null
		});

		return sortedGames;
	}

	private createCacheKey(
		filters: {
			searchTerm?: string;
			platforms?: string[];
			genres?: string[];
			tiers?: string[];
			coOp?: string[];
			sortOption?: { key: string; direction: 'asc' | 'desc' } | null;
		} | null,
		activeTab: string
	): string {
		const key: FilterCacheKey = {
			searchTerm: filters?.searchTerm || '',
			platforms: filters?.platforms || [],
			genres: filters?.genres || [],
			tiers: filters?.tiers || [],
			coOp: filters?.coOp || [],
			activeTab,
			sortKey: filters?.sortOption?.key || '',
			sortDirection: filters?.sortOption?.direction || ''
		};

		return JSON.stringify(key);
	}

	/**
	 * Apply all filters EXCEPT the tab filter.
	 * Used for calculating counts per tab with the active filters applied.
	 */
	private filterGamesWithoutTabFilter(
		games: Game[],
		filters: {
			searchTerm?: string;
			platforms?: string[];
			genres?: string[];
			tiers?: string[];
			coOp?: string[];
		} | null
	): Game[] {
		let filteredGames = games;

		if (filters?.searchTerm?.trim()) {
			const query = filters.searchTerm.toLowerCase().trim();
			filteredGames = filteredGames.filter((game) => {
				return (
					game.title.toLowerCase().includes(query) ||
					game.genre.toLowerCase().includes(query) ||
					game.platform.toLowerCase().includes(query)
				);
			});
		}

		if (filters?.platforms?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.platforms!.includes(game.platform));
		}
		if (filters?.genres?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.genres!.includes(game.genre));
		}

		if (filters?.tiers?.length > 0) {
			filteredGames = filteredGames.filter((game) => {
				if (!game.tier) return false;
				const gameTierFullName = getTierDisplayName(game.tier);
				return filters.tiers!.includes(gameTierFullName);
			});
		}

		if (filters?.coOp?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.coOp!.includes(game.coOp));
		}

		return filteredGames;
	}

	private filterGames(
		games: Game[],
		filters: {
			searchTerm?: string;
			platforms?: string[];
			genres?: string[];
			tiers?: string[];
			coOp?: string[];
		} | null,
		activeTab: string
	): Game[] {
		// First apply non-tab filters
		let filteredGames = this.filterGamesWithoutTabFilter(games, filters);

		// Then apply tab filter
		switch (activeTab) {
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

		return filteredGames;
	}

	private sortGames(
		games: Game[],
		sort: { key: string; direction: 'asc' | 'desc' } | null,
		activeTab: string
	): Game[] {
		const sortFunctions = {
			presentation: (a: Game, b: Game) =>
				this.compareNullableNumbers(a.ratingPresentation, b.ratingPresentation),
			story: (a: Game, b: Game) => this.compareNullableNumbers(a.ratingStory, b.ratingStory),
			gameplay: (a: Game, b: Game) =>
				this.compareNullableNumbers(a.ratingGameplay, b.ratingGameplay),
			score: (a: Game, b: Game) => this.compareNullableNumbers(a.score, b.score),
			finishedDate: (a: Game, b: Game) => this.compareDates(a.finishedDate, b.finishedDate),
			alphabetical: (a: Game, b: Game) => a.title.localeCompare(b.title),

			default: (a: Game, b: Game) => a.title.localeCompare(b.title),
			completed: (a: Game, b: Game) => this.compareDates(a.finishedDate, b.finishedDate),
			planned: (a: Game, b: Game) => a.title.localeCompare(b.title)
		};

		let sortFunction = sortFunctions.default;

		if (activeTab === 'planned') {
			sortFunction = sortFunctions.planned;
		} else if (sort?.key && sortFunctions[sort.key as keyof typeof sortFunctions]) {
			sortFunction = sortFunctions[sort.key as keyof typeof sortFunctions];
		} else if (activeTab === 'completed') {
			sortFunction = sortFunctions.completed;
		}

		const sortedGames = [...games];

		let direction = sort?.direction === 'desc' ? -1 : 1;

		if (activeTab === 'completed' && !sort) {
			direction = -1;
		}

		return sortedGames.sort((a, b) => {
			const isFinishedDateSort =
				sort?.key === 'finishedDate' || (activeTab === 'completed' && !sort?.key);

			if (isFinishedDateSort) {
				const aTime = parseDate(a.finishedDate);
				const bTime = parseDate(b.finishedDate);

				if (aTime === null && bTime === null) return 0;
				if (aTime === null) return 1;
				if (bTime === null) return -1;

				return (aTime - bTime) * direction;
			}

			if (
				activeTab !== 'planned' &&
				['presentation', 'story', 'gameplay', 'score'].includes(sort?.key || '')
			) {
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

	private compareNullableNumbers(
		a: number | null | undefined,
		b: number | null | undefined
	): number {
		const hasDataA = a !== null && a !== undefined;
		const hasDataB = b !== null && b !== undefined;

		if (hasDataA && !hasDataB) return 1;
		if (!hasDataA && hasDataB) return -1;
		if (!hasDataA && !hasDataB) return 0;

		return (a as number) - (b as number);
	}

	private compareDates(a: string | null | undefined, b: string | null | undefined): number {
		const aTime = parseDate(a);
		const bTime = parseDate(b);

		if (aTime === null && bTime === null) return 0;
		if (aTime === null) return 1;
		if (bTime === null) return -1;
		return aTime - bTime;
	}

	private updateCache(key: string, result: Game[]): void {
		this.lastCacheKey = key;
		this.lastCachedResult = result;

		// Limit cache size to prevent memory leaks
		if (this.cache.size >= 10) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey);
		}

		this.cache.set(key, result);
	}

	clearCache(): void {
		this.cache.clear();
		this.lastCacheKey = null;
		this.lastCachedResult = [];
	}
}

export const filteredGamesStore = new FilteredGamesStore();

// For backwards compatibility with components using $filteredGames
class FilteredGamesSubscription {
	private subscribers = new Set<(value: Game[]) => void>();

	constructor() {
		// Subscribe to underlying stores to trigger updates
		gamesStore.subscribe(() => this.notify());
		filtersStore.subscribe(() => this.notify());
		// Also listen to appStore changes
		if (typeof window !== 'undefined') {
			// Poll appStore since it doesn't have subscribe
			setInterval(() => this.notify(), 100);
		}
	}

	private notify() {
		const currentValue = filteredGamesStore.games;
		// Always notify subscribers when underlying stores change
		// The filteredGamesStore.games getter handles caching internally
		for (const fn of this.subscribers) {
			fn(currentValue);
		}
	}

	get value() {
		return filteredGamesStore.games;
	}

	subscribe(fn: (value: Game[]) => void): () => void {
		// Immediately call with current value
		fn(filteredGamesStore.games);
		// Add to subscribers
		this.subscribers.add(fn);
		// Return unsubscribe function
		return () => {
			this.subscribers.delete(fn);
		};
	}
}

export const filteredGames = new FilteredGamesSubscription();
