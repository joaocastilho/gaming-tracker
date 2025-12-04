import { writable, derived, get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import { debounce } from '$lib/utils/debounce';

const browser = typeof window !== 'undefined';

export type SortKey =
	| 'presentation'
	| 'story'
	| 'gameplay'
	| 'score'
	| 'finishedDate'
	| 'alphabetical';

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
	key: SortKey;
	direction: SortDirection;
}

export interface FilterState {
	searchTerm: string;
	platforms: string[];
	genres: string[];
	statuses: string[];
	tiers: string[];
	coOp: string[];
	sortOption: SortOption | null;
}

const baseFilters: Pick<FilterState, 'searchTerm'> = {
	searchTerm: ''
};

function createFiltersStore() {
	const filters = writable<FilterState | null>(null);

	// Initialize filters if needed
	if (browser && !get(filters)) {
		const initialFilters: FilterState = {
			...baseFilters,
			platforms: [],
			genres: [],
			statuses: [],
			tiers: [],
			coOp: [],
			sortOption: null
		};
		filters.set(initialFilters);
	}

	return {
		subscribe: filters.subscribe,
		set: filters.set,
		update: filters.update,

		isAnyFilterApplied(): boolean {
			const state = get(filters);
			if (!state) return false;

			const defaultSearchTerm = baseFilters.searchTerm;
			const hasSearch = state.searchTerm.trim() !== defaultSearchTerm;
			const hasPlatforms = state.platforms.length > 0;
			const hasGenres = state.genres.length > 0;
			const hasStatuses = state.statuses.length > 0;
			const hasTiers = state.tiers.length > 0;
			const hasCoOp = state.coOp.length > 0;

			return hasSearch || hasPlatforms || hasGenres || hasStatuses || hasTiers || hasCoOp;
		},

		resetFilters: () => {
			const resetFilters: FilterState = {
				...baseFilters,
				platforms: [],
				genres: [],
				statuses: [],
				tiers: [],
				coOp: [],
				sortOption: null
			};
			filters.set(resetFilters);
		},

		togglePlatform(platform: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const platforms = $filters.platforms.includes(platform)
					? $filters.platforms.filter((p) => p !== platform)
					: [...$filters.platforms, platform];
				return { ...$filters, platforms };
			});
		},

		toggleGenre(genre: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const genres = $filters.genres.includes(genre)
					? $filters.genres.filter((g) => g !== genre)
					: [...$filters.genres, genre];
				return { ...$filters, genres };
			});
		},

		toggleStatus(status: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const statuses = $filters.statuses.includes(status)
					? $filters.statuses.filter((s) => s !== status)
					: [...$filters.statuses, status];
				return { ...$filters, statuses };
			});
		},

		toggleTier(tier: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const tiers = $filters.tiers.includes(tier)
					? $filters.tiers.filter((t) => t !== tier)
					: [...$filters.tiers, tier];
				return { ...$filters, tiers };
			});
		},

		toggleCoOp(coOpValue: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const coOp = $filters.coOp.includes(coOpValue)
					? $filters.coOp.filter((c) => c !== coOpValue)
					: [...$filters.coOp, coOpValue];
				return { ...$filters, coOp };
			});
		},

		removePlatform(platform: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, platforms: $filters.platforms.filter((p) => p !== platform) };
			});
		},

		removeGenre(genre: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, genres: $filters.genres.filter((g) => g !== genre) };
			});
		},

		removeTier(tier: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, tiers: $filters.tiers.filter((t) => t !== tier) };
			});
		},

		removeCoOp(coOpValue: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, coOp: $filters.coOp.filter((c) => c !== coOpValue) };
			});
		},

		resetAllFilters() {
			this.resetFilters();
		},

		setSearchTerm(term: string) {
			filters.update(($filters) => {
				if (!$filters) return $filters;
				return { ...$filters, searchTerm: term };
			});
		},

		setSort(sortOption: SortOption | null) {
			filters.update(($filters) => {
				if (!$filters) return $filters;
				return { ...$filters, sortOption };
			});
		},

		selectedPlatforms: derived(filters, ($filters) => $filters?.platforms ?? []),
		selectedGenres: derived(filters, ($filters) => $filters?.genres ?? []),
		selectedTiers: derived(filters, ($filters) => $filters?.tiers ?? []),
		selectedCoOp: derived(filters, ($filters) => $filters?.coOp ?? []),
		searchQuery: derived(filters, ($filters) => $filters?.searchTerm ?? ''),

		readSearchFromURL(searchParams: URLSearchParams) {
			const search = searchParams.get('s');
			if (search) {
				this.setSearchTerm(search);
			}
		},

		writeSearchToURL: debounce(async () => {
			if (typeof window === 'undefined') return;
			try {
				const state = get(filters);
				const url = new URL(window.location.href);
				if (state?.searchTerm) {
					url.searchParams.set('s', state.searchTerm);
				} else {
					url.searchParams.delete('s');
				}
				await replaceState(url.toString(), { noscroll: true, keepFocus: true });
			} catch {
				// Ignore router initialization errors
			}
		}, 500)
	};
}

export const filtersStore = createFiltersStore();
