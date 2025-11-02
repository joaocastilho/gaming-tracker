import { writable, derived, get } from 'svelte/store';
import type { Game } from '../types/game.js';

// TypeScript interfaces for filter state
export interface FilterState {
	searchQuery: string;
	selectedPlatforms: string[];
	selectedGenres: string[];
	selectedTiers: string[];
	ratingRanges: {
		presentation: [number, number];
		story: [number, number];
		gameplay: [number, number];
		total: [number, number];
	};
}

export interface FilteredGameData {
	filteredGames: Game[];
	totalCount: number;
	completedCount: number;
	plannedCount: number;
}

function createFiltersStore() {
	const searchQuery = writable<string>('');
	const selectedPlatforms = writable<string[]>([]);
	const selectedGenres = writable<string[]>([]);
	const selectedTiers = writable<string[]>([]);
	const ratingRanges = writable<FilterState['ratingRanges']>({
		presentation: [0, 10],
		story: [0, 10],
		gameplay: [0, 10],
		total: [0, 20]
	});

	// Combined filter state for easy subscription
	const filterState = derived(
		[searchQuery, selectedPlatforms, selectedGenres, selectedTiers, ratingRanges],
		([$searchQuery, $selectedPlatforms, $selectedGenres, $selectedTiers, $ratingRanges]) => ({
			searchQuery: $searchQuery,
			selectedPlatforms: $selectedPlatforms,
			selectedGenres: $selectedGenres,
			selectedTiers: $selectedTiers,
			ratingRanges: $ratingRanges
		})
	);

	// Core filtering logic
	function filterGames(games: Game[], filters: FilterState): Game[] {
		return games.filter((game) => {
			// Search query filter (title matching)
			if (filters.searchQuery.trim()) {
				const query = filters.searchQuery.toLowerCase().trim();
				const titleMatch = game.title.toLowerCase().includes(query);
				const genreMatch = game.genre.toLowerCase().includes(query);
				const platformMatch = game.platform.toLowerCase().includes(query);

				if (!titleMatch && !genreMatch && !platformMatch) {
					return false;
				}
			}

			// Platform filter
			if (filters.selectedPlatforms.length > 0) {
				if (!filters.selectedPlatforms.includes(game.platform)) {
					return false;
				}
			}

			// Genre filter
			if (filters.selectedGenres.length > 0) {
				if (!filters.selectedGenres.includes(game.genre)) {
					return false;
				}
			}

			// Tier filter (only applies to completed games)
			if (filters.selectedTiers.length > 0) {
				if (game.status === 'Completed' && game.tier) {
					if (!filters.selectedTiers.includes(game.tier)) {
						return false;
					}
				} else if (game.status !== 'Completed') {
					// If filtering by tier but game is not completed, exclude it
					return false;
				}
			}

			// Rating range filters (only applies to completed games with ratings)
			if (
				game.status === 'Completed' &&
				game.ratingPresentation !== null &&
				game.ratingStory !== null &&
				game.ratingGameplay !== null
			) {
				const [pMin, pMax] = filters.ratingRanges.presentation;
				const [sMin, sMax] = filters.ratingRanges.story;
				const [gMin, gMax] = filters.ratingRanges.gameplay;
				const [tMin, tMax] = filters.ratingRanges.total;

				// Check if ratings fall within specified ranges
				if (game.ratingPresentation < pMin || game.ratingPresentation > pMax) return false;
				if (game.ratingStory < sMin || game.ratingStory > sMax) return false;
				if (game.ratingGameplay < gMin || game.ratingGameplay > gMax) return false;

				// Calculate total score and check range
				const totalScore = Math.round(
					((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2
				);
				if (totalScore < tMin || totalScore > tMax) return false;
			}

			return true;
		});
	}

	// Derived store for filtered games and counts
	function createFilteredGamesStore(gamesStore: {
		subscribe: (fn: (games: Game[]) => void) => () => void;
	}) {
		return derived(
			[gamesStore, filterState],
			([games, filters]: [Game[], FilterState]): FilteredGameData => {
				const filteredGames = filterGames(games, filters);

				return {
					filteredGames,
					totalCount: filteredGames.length,
					completedCount: filteredGames.filter((g) => g.status === 'Completed').length,
					plannedCount: filteredGames.filter((g) => g.status === 'Planned').length
				};
			}
		);
	}

	return {
		// State stores
		searchQuery,
		selectedPlatforms,
		selectedGenres,
		selectedTiers,
		ratingRanges,
		filterState,

		// Core filtering function
		filterGames,

		// Factory for creating filtered games stores
		createFilteredGamesStore,

		// Filter management methods
		reset() {
			searchQuery.set('');
			selectedPlatforms.set([]);
			selectedGenres.set([]);
			selectedTiers.set([]);
			ratingRanges.set({
				presentation: [0, 10],
				story: [0, 10],
				gameplay: [0, 10],
				total: [0, 20]
			});
		},

		// URL Parameter Management
		readFromURL(searchParams: URLSearchParams) {
			const query = searchParams.get('q');
			if (query !== null) {
				searchQuery.set(query);
			}
		},

		writeToURL() {
			if (typeof window === 'undefined') return;

			const currentQuery = get(searchQuery);
			const url = new URL(window.location.href);

			if (currentQuery.trim()) {
				url.searchParams.set('q', currentQuery.trim());
			} else {
				url.searchParams.delete('q');
			}

			// Use replaceState to avoid adding to browser history
			window.history.replaceState({}, '', url.toString());
		},

		addPlatform(platform: string) {
			selectedPlatforms.update((platforms) =>
				platforms.includes(platform) ? platforms : [...platforms, platform]
			);
		},

		removePlatform(platform: string) {
			selectedPlatforms.update((platforms) => platforms.filter((p) => p !== platform));
		},

		togglePlatform(platform: string) {
			selectedPlatforms.update((platforms) =>
				platforms.includes(platform)
					? platforms.filter((p) => p !== platform)
					: [...platforms, platform]
			);
		},

		addGenre(genre: string) {
			selectedGenres.update((genres) => (genres.includes(genre) ? genres : [...genres, genre]));
		},

		removeGenre(genre: string) {
			selectedGenres.update((genres) => genres.filter((g) => g !== genre));
		},

		toggleGenre(genre: string) {
			selectedGenres.update((genres) =>
				genres.includes(genre) ? genres.filter((g) => g !== genre) : [...genres, genre]
			);
		},

		addTier(tier: string) {
			selectedTiers.update((tiers) => (tiers.includes(tier) ? tiers : [...tiers, tier]));
		},

		removeTier(tier: string) {
			selectedTiers.update((tiers) => tiers.filter((t) => t !== tier));
		},

		toggleTier(tier: string) {
			selectedTiers.update((tiers) =>
				tiers.includes(tier) ? tiers.filter((t) => t !== tier) : [...tiers, tier]
			);
		},

		setRatingRange(type: keyof FilterState['ratingRanges'], range: [number, number]) {
			ratingRanges.update((ranges) => ({ ...ranges, [type]: range }));
		},

		// Utility methods
		getActiveFilterCount(): number {
			const count = 0;

			// Note: These subscriptions would need to be handled differently in a real implementation
			// For now, this is a placeholder for the logic
			return count;
		},

		hasActiveFilters(): boolean {
			// Check if any filters are active
			const currentQuery = get(searchQuery);
			const currentPlatforms = get(selectedPlatforms);
			const currentGenres = get(selectedGenres);
			const currentTiers = get(selectedTiers);
			const currentRanges = get(ratingRanges);

			return (
				currentQuery.trim().length > 0 ||
				currentPlatforms.length > 0 ||
				currentGenres.length > 0 ||
				currentTiers.length > 0 ||
				currentRanges.presentation[0] > 0 ||
				currentRanges.presentation[1] < 10 ||
				currentRanges.story[0] > 0 ||
				currentRanges.story[1] < 10 ||
				currentRanges.gameplay[0] > 0 ||
				currentRanges.gameplay[1] < 10 ||
				currentRanges.total[0] > 0 ||
				currentRanges.total[1] < 20
			);
		}
	};
}

export const filtersStore = createFiltersStore();

export type FiltersStore = ReturnType<typeof createFiltersStore>;
