import { derived, type Readable } from 'svelte/store';
import type { Game } from '$lib/types/game';
import { gamesStore } from './games';
import { filtersStore } from './filters';
import { appStore } from './app';
import { filteredCountsStore } from './filteredCounts';
import { getTierDisplayName } from '$lib/utils/colorConstants';
import { parseDate } from '$lib/utils/dateUtils';

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
				if (!$games || $games.length === 0) {
					return [];
				}

				const cacheKey = this.createCacheKey($filters, $activeTab);

				if (this.lastCacheKey === cacheKey && this.lastCachedResult.length > 0) {
					return this.lastCachedResult;
				}

				const filteredGames = this.filterGames($games, $filters, $activeTab);
				const sortedGames = this.sortGames(filteredGames, $filters?.sortOption ?? null, $activeTab);

				this.updateCache(cacheKey, sortedGames);

				// Update counts
				if (
					$activeTab === 'all' &&
					!$filters?.searchTerm &&
					$filters?.platforms?.length === 0 &&
					$filters?.genres?.length === 0 &&
					$filters?.tiers?.length === 0 &&
					$filters?.coOp?.length === 0 &&
					$filters?.sortOption === null
				) {
					// If no filters are active (except tab), we can use the full counts
					const total = $games.length;
					const completed = $games.filter((g) => g.status === 'Completed').length;
					const planned = $games.filter((g) => g.status === 'Planned').length;
					filteredCountsStore.setCounts({
						all: total,
						completed,
						planned,
						tierlist: null
					});
				} else {
					// When filters are active, we might want to update counts based on the filtered result
					// But typically counts in nav are "total available in that category"
					// For now, let's keep the behavior simple and consistent with the previous implementation
					// which seemed to update counts based on the current view context

					// Actually, looking at the previous implementation in filters.ts, it updated counts based on the *result* of the filter worker.
					// So we should probably update it here too.

					// However, usually nav counts represent "total items in this tab", not "items matching current search".
					// But if the user wants to see "how many RPGs do I have?", the nav count updating is useful.
					// Let's replicate the previous behavior: update counts based on the filtered set if we are in a specific context,
					// or maybe just keep the total counts if we are just searching.

					// The previous worker implementation returned `counts` which were calculated from the filtered results.
					// Let's calculate them here.

					const total = sortedGames.length;
					// These counts below might be misleading if we are already filtered by status 'Completed'
					// e.g. if we are in 'Completed' tab, 'planned' count will be 0.
					// But that seems to be what the previous implementation did (it returned counts from the filtered set).

					// Wait, the previous implementation in filters.ts:
					// const completed = games.filter((game) => game.status === 'Completed').length;
					// This was done on the *filtered* games in the worker.

					const completed = sortedGames.filter((g) => g.status === 'Completed').length;
					const planned = sortedGames.filter((g) => g.status === 'Planned').length;

					filteredCountsStore.setCounts({
						all: total,
						completed,
						planned,
						tierlist: null
					});
				}

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
			filteredGames = filteredGames.filter((game) => filters.platforms.includes(game.platform));
		}
		if (filters?.genres?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.genres.includes(game.genre));
		}

		if (filters?.tiers?.length > 0) {
			filteredGames = filteredGames.filter((game) => {
				if (!game.tier) return false;
				const gameTierFullName = getTierDisplayName(game.tier);
				return filters.tiers.includes(gameTierFullName);
			});
		}

		if (filters?.coOp?.length > 0) {
			filteredGames = filteredGames.filter((game) => filters.coOp.includes(game.coOp));
		}
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
				this.compareRatings(a.ratingPresentation, b.ratingPresentation),
			story: (a: Game, b: Game) => this.compareRatings(a.ratingStory, b.ratingStory),
			gameplay: (a: Game, b: Game) => this.compareRatings(a.ratingGameplay, b.ratingGameplay),
			score: (a: Game, b: Game) => this.compareScores(a.score, b.score),
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

const filteredGamesStore = new FilteredGamesStore();
export const filteredGames = filteredGamesStore.createFilteredGamesStore();

export { filteredGamesStore };
