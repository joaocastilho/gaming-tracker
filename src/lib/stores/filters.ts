import { writable, derived, get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import type { Game } from '../types/game.js';
import { memoizeGameFilter } from '../utils/memoize.js';

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

// TypeScript interfaces for app state
export interface AppState {
	viewMode: 'gallery' | 'table';
	theme: 'dark' | 'light';
	activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
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

	// Core filtering logic (memoized for performance)
	const filterGames = memoizeGameFilter((games: Game[], filters: FilterState): Game[] => {
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
	});

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

		// Enhanced URL Parameter Management
		readFromURL(searchParams: URLSearchParams) {
			// Read search query
			const query = searchParams.get('search');
			if (query !== null) {
				searchQuery.set(query);
			}

			// Read platforms (comma-separated)
			const platformsParam = searchParams.get('platforms');
			if (platformsParam !== null && platformsParam.trim()) {
				const platforms = platformsParam
					.split(',')
					.map((p) => p.trim())
					.filter((p) => p);
				selectedPlatforms.set(platforms);
			}

			// Read genres (comma-separated)
			const genresParam = searchParams.get('genres');
			if (genresParam !== null && genresParam.trim()) {
				const genres = genresParam
					.split(',')
					.map((g) => g.trim())
					.filter((g) => g);
				selectedGenres.set(genres);
			}

			// Read tiers (comma-separated)
			const tiersParam = searchParams.get('tiers');
			if (tiersParam !== null && tiersParam.trim()) {
				const tiers = tiersParam
					.split(',')
					.map((t) => t.trim())
					.filter((t) => t);
				selectedTiers.set(tiers);
			}

			// Read rating ranges (range format: "min,max")
			const ratingPresentationParam = searchParams.get('ratingPresentation');
			const ratingStoryParam = searchParams.get('ratingStory');
			const ratingGameplayParam = searchParams.get('ratingGameplay');
			const ratingTotalParam = searchParams.get('ratingTotal');

			const currentRanges = get(ratingRanges);
			const newRanges = { ...currentRanges };

			// Helper function to parse range
			function parseRange(param: string | null, defaultRange: [number, number]): [number, number] {
				if (!param || !param.includes(',')) return defaultRange;
				const [minStr, maxStr] = param.split(',');
				const min = parseFloat(minStr);
				const max = parseFloat(maxStr);
				if (isNaN(min) || isNaN(max)) return defaultRange;
				return [min, max];
			}

			newRanges.presentation = parseRange(ratingPresentationParam, currentRanges.presentation);
			newRanges.story = parseRange(ratingStoryParam, currentRanges.story);
			newRanges.gameplay = parseRange(ratingGameplayParam, currentRanges.gameplay);
			newRanges.total = parseRange(ratingTotalParam, currentRanges.total);

			ratingRanges.set(newRanges);
		},

		writeToURL() {
			if (typeof window === 'undefined') return;

			try {
				const currentQuery = get(searchQuery);
				const currentPlatforms = get(selectedPlatforms);
				const currentGenres = get(selectedGenres);
				const currentTiers = get(selectedTiers);
				const currentRanges = get(ratingRanges);
				const url = new URL(window.location.href);

				// Handle search query
				if (currentQuery.trim()) {
					url.searchParams.set('search', currentQuery.trim());
				} else {
					url.searchParams.delete('search');
				}

				// Handle platforms (comma-separated)
				if (currentPlatforms.length > 0) {
					url.searchParams.set('platforms', currentPlatforms.join(','));
				} else {
					url.searchParams.delete('platforms');
				}

				// Handle genres (comma-separated)
				if (currentGenres.length > 0) {
					url.searchParams.set('genres', currentGenres.join(','));
				} else {
					url.searchParams.delete('genres');
				}

				// Handle tiers (comma-separated)
				if (currentTiers.length > 0) {
					url.searchParams.set('tiers', currentTiers.join(','));
				} else {
					url.searchParams.delete('tiers');
				}

				// Handle rating ranges (range format: "min,max")
				const [pMin, pMax] = currentRanges.presentation;
				const [sMin, sMax] = currentRanges.story;
				const [gMin, gMax] = currentRanges.gameplay;
				const [tMin, tMax] = currentRanges.total;

				// Only add rating parameters if they differ from defaults
				if (pMin > 0 || pMax < 10) {
					url.searchParams.set('ratingPresentation', `${pMin},${pMax}`);
				} else {
					url.searchParams.delete('ratingPresentation');
				}

				if (sMin > 0 || sMax < 10) {
					url.searchParams.set('ratingStory', `${sMin},${sMax}`);
				} else {
					url.searchParams.delete('ratingStory');
				}

				if (gMin > 0 || gMax < 10) {
					url.searchParams.set('ratingGameplay', `${gMin},${gMax}`);
				} else {
					url.searchParams.delete('ratingGameplay');
				}

				if (tMin > 0 || tMax < 20) {
					url.searchParams.set('ratingTotal', `${tMin},${tMax}`);
				} else {
					url.searchParams.delete('ratingTotal');
				}

				// Use replaceState to avoid adding to browser history
				replaceState(url.toString(), {});
			} catch (error) {
				// Silently ignore router initialization errors
				if (!(error instanceof Error) || !error.message.includes('router is initialized')) {
					console.warn('Failed to update URL:', error);
				}
			}
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

		setRatingRange(
			type: 'presentation' | 'story' | 'gameplay' | 'total',
			min: number,
			max: number
		) {
			ratingRanges.update((ranges) => ({ ...ranges, [type]: [min, max] }));
		},

		// Utility methods
		getActiveFilterCount(): number {
			const currentQuery = get(searchQuery);
			const currentPlatforms = get(selectedPlatforms);
			const currentGenres = get(selectedGenres);
			const currentTiers = get(selectedTiers);
			const currentRanges = get(ratingRanges);

			let count = 0;

			// Count active search query
			if (currentQuery.trim().length > 0) {
				count++;
			}

			// Count selected platforms, genres, and tiers
			count += currentPlatforms.length;
			count += currentGenres.length;
			count += currentTiers.length;

			// Count non-default rating ranges
			if (currentRanges.presentation[0] > 0 || currentRanges.presentation[1] < 10) count++;
			if (currentRanges.story[0] > 0 || currentRanges.story[1] < 10) count++;
			if (currentRanges.gameplay[0] > 0 || currentRanges.gameplay[1] < 10) count++;
			if (currentRanges.total[0] > 0 || currentRanges.total[1] < 20) count++;

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
		},

		// Alias for reset() method for better naming consistency
		resetAllFilters() {
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
		}
	};
}

export const filtersStore = createFiltersStore();

export type FiltersStore = ReturnType<typeof createFiltersStore>;
