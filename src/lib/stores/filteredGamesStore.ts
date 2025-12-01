import { derived, type Readable } from 'svelte/store';
import type { Game } from '$lib/types/game';
import { gamesStore } from './games';
import { filtersStore } from './filters';
import { appStore } from './app';
import { getTierDisplayName } from '$lib/utils/colorConstants';
import { parseDate } from '$lib/utils/dateUtils';

// Memoization cache for filtered results
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

	createFilteredGamesStore(): Readable<Game[]> {
		return derived(
			[gamesStore, filtersStore, appStore.activeTab],
			([$games, $filters, $activeTab]) => {
				// Early return if no games
				if (!$games || $games.length === 0) {
					return [];
				}

				// Create cache key
				const cacheKey = this.createCacheKey($filters, $activeTab);

				// Return cached result if key hasn't changed
				if (this.lastCacheKey === cacheKey && this.lastCachedResult.length > 0) {
					return this.lastCachedResult;
				}

				// Filter games
				const filteredGames = this.filterGames($games, $filters, $activeTab);

				// Sort games
				const sortedGames = this.sortGames(filteredGames, $filters?.sortOption ?? null, $activeTab);

				// Update cache
				this.updateCache(cacheKey, sortedGames);

				return sortedGames;
			}
		);
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
		let filteredGames = games;

		// Apply search filter
		if (filters?.searchTerm?.trim()) {
			const query = filters.searchTerm.toLowerCase().trim();

			// Use a single pass filter with optimized matching
			filteredGames = filteredGames.filter((game) => {
				// Check if any searchable field contains the query
				return (
					game.title.toLowerCase().includes(query) ||
					game.genre.toLowerCase().includes(query) ||
					game.platform.toLowerCase().includes(query)
				);
			});
		}

		// Apply platform filter
		if (filters?.platforms?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.platforms.includes(game.platform));
		}

		// Apply genre filter
		if (filters?.genres?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.genres.includes(game.genre));
		}

		// Apply tier filter
		if (filters?.tiers?.length > 0) {
			filteredGames = filteredGames.filter((game) => {
				if (!game.tier) return false;
				const gameTierFullName = getTierDisplayName(game.tier);
				return filters.tiers.includes(gameTierFullName);
			});
		}

		// Apply co-op filter
		if (filters?.coOp?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.coOp.includes(game.coOp));
		}

		// Apply tab-specific filtering
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
				// For 'all' tab, no additional filtering
				break;
		}

		return filteredGames;
	}

	private sortGames(
		games: Game[],
		sort: { key: string; direction: 'asc' | 'desc' } | null,
		activeTab: string
	): Game[] {
		// Use pre-defined sort functions for better performance
		const sortFunctions = {
			// Rating-based sorts
			presentation: (a: Game, b: Game) =>
				this.compareRatings(a.ratingPresentation, b.ratingPresentation),
			story: (a: Game, b: Game) => this.compareRatings(a.ratingStory, b.ratingStory),
			gameplay: (a: Game, b: Game) => this.compareRatings(a.ratingGameplay, b.ratingGameplay),
			score: (a: Game, b: Game) => this.compareScores(a.score, b.score),
			finishedDate: (a: Game, b: Game) => this.compareDates(a.finishedDate, b.finishedDate),
			alphabetical: (a: Game, b: Game) => a.title.localeCompare(b.title),

			// Default sorts by tab
			default: (a: Game, b: Game) => a.title.localeCompare(b.title),
			completed: (a: Game, b: Game) => this.compareDates(a.finishedDate, b.finishedDate),
			planned: (a: Game, b: Game) => a.title.localeCompare(b.title)
		};

		let sortFunction = sortFunctions.default;

		// Determine sort function based on context
		if (activeTab === 'planned') {
			// Planned tab ALWAYS sorts alphabetically, regardless of the sort key passed
			// It only respects the direction
			sortFunction = sortFunctions.planned;
		} else if (sort?.key && sortFunctions[sort.key as keyof typeof sortFunctions]) {
			sortFunction = sortFunctions[sort.key as keyof typeof sortFunctions];
		} else if (activeTab === 'completed') {
			sortFunction = sortFunctions.completed;
		}

		// Clone array to avoid mutating original
		const sortedGames = [...games];

		// Apply sorting with direction
		let direction = sort?.direction === 'desc' ? -1 : 1;

		// Default to descending for completed tab if no sort option provided
		if (activeTab === 'completed' && !sort) {
			direction = -1;
		}

		return sortedGames.sort((a, b) => {
			// Special handling for finishedDate to ensure nulls are always last
			// This applies if we are explicitly sorting by finishedDate, OR if we are on the completed tab (default sort)
			const isFinishedDateSort =
				sort?.key === 'finishedDate' || (activeTab === 'completed' && !sort?.key);

			if (isFinishedDateSort) {
				const aTime = parseDate(a.finishedDate);
				const bTime = parseDate(b.finishedDate);

				if (aTime === null && bTime === null) return 0;
				if (aTime === null) return 1; // Always last
				if (bTime === null) return -1; // Always last

				// Both valid, apply direction
				// Default compare (Ascending): aTime - bTime
				return (aTime - bTime) * direction;
			}

			// Special handling for ratings/score to ensure no-data is always last
			// Only apply this if we are NOT on the planned tab (which is always alphabetical)
			if (
				activeTab !== 'planned' &&
				['presentation', 'story', 'gameplay', 'score'].includes(sort?.key || '')
			) {
				// Map sort key to actual Game property
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

				// Always put games without data at the bottom
				if (aHasData && !bHasData) return -1;
				if (!aHasData && bHasData) return 1;
				if (!aHasData && !bHasData) return 0;

				// Both have data, compare values
				// We want standard comparison here:
				// ASC: Small -> Large
				// DESC: Large -> Small
				const valA = aVal as number;
				const valB = bVal as number;

				if (valA === valB) return 0;
				return (valA - valB) * direction;
			}

			const result = sortFunction(a, b);
			return result * direction;
		});
	}

	private compareRatings(a: number | null | undefined, b: number | null | undefined): number {
		const hasDataA = a !== null && a !== undefined;
		const hasDataB = b !== null && b !== undefined;

		if (hasDataA && !hasDataB) return 1;
		if (!hasDataA && hasDataB) return -1;
		if (!hasDataA && !hasDataB) return 0;

		return (a as number) - (b as number);
	}

	private compareScores(a: number | null | undefined, b: number | null | undefined): number {
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

// Create singleton instance
const filteredGamesStore = new FilteredGamesStore();

// Export the readable store
export const filteredGames = filteredGamesStore.createFilteredGamesStore();

// Export utility functions
export { filteredGamesStore };
