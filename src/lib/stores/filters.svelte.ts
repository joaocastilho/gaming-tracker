/**
 * Filters Store - Svelte 5 Runes
 * Manages filter state for games filtering
 */
import { replaceState } from '$app/navigation';
import { debounce } from '$lib/utils/debounce';

const browser = typeof window !== 'undefined';

export type SortKey =
	| 'presentation'
	| 'story'
	| 'gameplay'
	| 'score'
	| 'finishedDate'
	| 'alphabetical'
	| 'playtime';

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

const initialFilters: FilterState = {
	...baseFilters,
	platforms: [],
	genres: [],
	statuses: [],
	tiers: [],
	coOp: [],
	sortOption: null
};

class FiltersStore {
	private _state = $state<FilterState | null>(null);
	private subscribers = new Set<(value: FilterState | null) => void>();

	// UI State - Desktop Filters Expansion
	// Default to TRUE as per original behavior
	// Persisted to sessionStorage to survive page refreshes within session
	public isDesktopFiltersExpanded = $state(true);

	private static readonly FILTERS_EXPANDED_KEY = 'filtersExpanded';

	constructor() {
		// Initialize filters if in browser
		if (browser) {
			this.state = { ...initialFilters };
			// Restore desktop filters expanded state from sessionStorage
			const savedExpanded = sessionStorage.getItem(FiltersStore.FILTERS_EXPANDED_KEY);
			if (savedExpanded !== null) {
				this.isDesktopFiltersExpanded = savedExpanded === 'true';
			}
		}
	}

	get state(): FilterState | null {
		return this._state;
	}

	private set state(value: FilterState | null) {
		this._state = value;
		// Notify all subscribers
		for (const fn of this.subscribers) {
			fn(value);
		}
	}

	// For backwards compatibility with $filtersStore subscription
	subscribe(fn: (value: FilterState | null) => void): () => void {
		// Immediately call with current value
		fn(this._state);
		// Add to subscribers
		this.subscribers.add(fn);
		// Return unsubscribe function
		return () => {
			this.subscribers.delete(fn);
		};
	}

	// Derived getters for backwards compatibility
	get selectedPlatforms(): string[] {
		return this._state?.platforms ?? [];
	}

	get selectedGenres(): string[] {
		return this._state?.genres ?? [];
	}

	get selectedTiers(): string[] {
		return this._state?.tiers ?? [];
	}

	get selectedCoOp(): string[] {
		return this._state?.coOp ?? [];
	}

	get searchQuery(): string {
		return this._state?.searchTerm ?? '';
	}

	isAnyFilterApplied(): boolean {
		const state = this._state;
		if (!state) return false;

		const defaultSearchTerm = baseFilters.searchTerm;
		const hasSearch = state.searchTerm.trim() !== defaultSearchTerm;
		const hasPlatforms = state.platforms.length > 0;
		const hasGenres = state.genres.length > 0;
		const hasStatuses = state.statuses.length > 0;
		const hasTiers = state.tiers.length > 0;
		const hasCoOp = state.coOp.length > 0;

		return hasSearch || hasPlatforms || hasGenres || hasStatuses || hasTiers || hasCoOp;
	}

	resetFilters(): void {
		// Guard: only reset if not already in initial state
		if (!this._state) return;
		if (!this.isAnyFilterApplied() && this._state.sortOption === null) return;
		this.state = { ...initialFilters };
	}

	togglePlatform(platform: string): void {
		if (!this._state) return;
		const platforms = this._state.platforms.includes(platform)
			? this._state.platforms.filter((p) => p !== platform)
			: [...this._state.platforms, platform];
		this.state = { ...this._state, platforms };
	}

	toggleGenre(genre: string): void {
		if (!this._state) return;
		const genres = this._state.genres.includes(genre)
			? this._state.genres.filter((g) => g !== genre)
			: [...this._state.genres, genre];
		this.state = { ...this._state, genres };
	}

	toggleStatus(status: string): void {
		if (!this._state) return;
		const statuses = this._state.statuses.includes(status)
			? this._state.statuses.filter((s) => s !== status)
			: [...this._state.statuses, status];
		this.state = { ...this._state, statuses };
	}

	toggleTier(tier: string): void {
		if (!this._state) return;
		const tiers = this._state.tiers.includes(tier)
			? this._state.tiers.filter((t) => t !== tier)
			: [...this._state.tiers, tier];
		this.state = { ...this._state, tiers };
	}

	toggleCoOp(coOpValue: string): void {
		if (!this._state) return;
		const coOp = this._state.coOp.includes(coOpValue)
			? this._state.coOp.filter((c) => c !== coOpValue)
			: [...this._state.coOp, coOpValue];
		this.state = { ...this._state, coOp };
	}

	removePlatform(platform: string): void {
		if (!this._state) return;
		this.state = {
			...this._state,
			platforms: this._state.platforms.filter((p) => p !== platform)
		};
	}

	removeGenre(genre: string): void {
		if (!this._state) return;
		this.state = { ...this._state, genres: this._state.genres.filter((g) => g !== genre) };
	}

	removeTier(tier: string): void {
		if (!this._state) return;
		this.state = { ...this._state, tiers: this._state.tiers.filter((t) => t !== tier) };
	}

	removeCoOp(coOpValue: string): void {
		if (!this._state) return;
		this.state = { ...this._state, coOp: this._state.coOp.filter((c) => c !== coOpValue) };
	}

	resetAllFilters(): void {
		this.resetFilters();
	}

	setSearchTerm(term: string): void {
		if (!this._state) return;
		// Guard: only update if value changed to prevent effect loops
		if (this._state.searchTerm === term) {
			return;
		}
		this.state = { ...this._state, searchTerm: term };
	}

	setSort(sortOption: SortOption | null): void {
		if (!this._state) return;
		// Guard: only update if value changed to prevent effect loops
		const currentSort = this._state.sortOption;
		if (currentSort === sortOption) return;
		if (
			currentSort &&
			sortOption &&
			currentSort.key === sortOption.key &&
			currentSort.direction === sortOption.direction
		)
			return;
		this.state = { ...this._state, sortOption };
	}

	set(newState: FilterState | null): void {
		this.state = newState;
	}

	update(fn: (state: FilterState | null) => FilterState | null): void {
		this.state = fn(this._state);
	}

	toggleDesktopFiltersExpanded(): void {
		this.isDesktopFiltersExpanded = !this.isDesktopFiltersExpanded;
		if (browser) {
			sessionStorage.setItem(
				FiltersStore.FILTERS_EXPANDED_KEY,
				String(this.isDesktopFiltersExpanded)
			);
		}
	}

	readSearchFromURL(searchParams: URLSearchParams): void {
		const search = searchParams.get('s');
		if (search) {
			this.setSearchTerm(search);
		}
	}

	/**
	 * Initialize the store for testing purposes.
	 * This bypasses the browser check and ensures state is set.
	 */
	initializeForTesting(): void {
		if (!this._state) {
			this.state = { ...initialFilters };
		}
	}

	writeSearchToURL = debounce(async (pageState: App.PageState) => {
		if (typeof window === 'undefined') return;
		try {
			const state = this._state;
			const url = new URL(window.location.href);
			if (state?.searchTerm) {
				url.searchParams.set('s', state.searchTerm);
			} else {
				url.searchParams.delete('s');
			}
			await replaceState(url.toString(), pageState);
		} catch {
			// Ignore router initialization errors
		}
	}, 300);
}

export const filtersStore = new FiltersStore();
