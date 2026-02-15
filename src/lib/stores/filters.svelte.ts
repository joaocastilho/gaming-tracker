/**
 * Filters Store - Svelte 5 Runes
 * Manages filter state for games filtering
 */
import { replaceState } from '$app/navigation';
import { browser } from '$app/environment';
import { debounce } from '$lib/utils/debounce';
import { appStore } from './app.svelte';
import { toSlug, fromSlug } from '$lib/utils/slugUtils';
import { extractFilterOptions } from '$lib/utils/filterOptions';
import { gamesStore } from './games.svelte';
import { get } from 'svelte/store';

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
	private static readonly FILTERS_STATE_KEY = 'filtersState';

	constructor() {
		// Initialize filters if in browser
		if (browser) {
			this.state = { ...initialFilters };
			// Restore desktop filters expanded state from sessionStorage
			const savedExpanded = sessionStorage.getItem(FiltersStore.FILTERS_EXPANDED_KEY);
			if (savedExpanded !== null) {
				this.isDesktopFiltersExpanded = savedExpanded === 'true';
			}

			// Restore filter state from sessionStorage (for hidden Tier List context)
			this.loadFromSession();
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

	isSortModified(): boolean {
		return (this._state?.sortOption ?? null) !== null;
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

	setDesktopFiltersExpanded(expanded: boolean): void {
		if (this.isDesktopFiltersExpanded === expanded) return;
		this.isDesktopFiltersExpanded = expanded;
		if (browser) {
			sessionStorage.setItem(
				FiltersStore.FILTERS_EXPANDED_KEY,
				String(this.isDesktopFiltersExpanded)
			);
		}
	}

	saveToSession(): void {
		if (!browser || !this._state) return;
		sessionStorage.setItem(FiltersStore.FILTERS_STATE_KEY, JSON.stringify(this._state));
	}

	loadFromSession(): void {
		if (!browser) return;
		const saved = sessionStorage.getItem(FiltersStore.FILTERS_STATE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				this.state = { ...initialFilters, ...parsed };
			} catch (e) {
				console.error('Failed to parse saved filters', e);
			}
		}
	}

	readSearchFromURL(searchParams: URLSearchParams, pathname?: string): void {
		if (!this._state) return;

		// Use provided pathname or fallback to window.location
		const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

		// If we are on tierlist and the URL is clean, we don't reset to defaults
		// because we want to preserve the hidden memory/session context.
		const isCleanUrl = Array.from(searchParams.keys()).length === 0;
		if ((currentPath === '/tierlist' || appStore.activeTab === 'tierlist') && isCleanUrl) {
			return;
		}

		// To de-slugify correctly, we need the available options
		const games = get(gamesStore);
		const options = extractFilterOptions(games);

		// If we have specific catalog-dependent parameters but the options are empty,
		// it means the games haven't loaded or initialized yet. We return early to
		// avoid wiping the current state (or session state) until the catalog is ready.
		// The layout effect's dependency on gamesStore will trigger a re-run once loaded.
		if (searchParams.has('platform') && options.platforms.length === 0) return;
		if (searchParams.has('genre') && options.genres.length === 0) return;
		if (searchParams.has('tier') && options.tiers.length === 0) return;

		const newState: FilterState = {
			searchTerm: searchParams.get('s') ?? '',
			platforms: searchParams
				.getAll('platform')
				.map((slug) => fromSlug(slug, options.platforms))
				.filter((v): v is string => !!v),
			genres: searchParams
				.getAll('genre')
				.map((slug) => fromSlug(slug, options.genres))
				.filter((v): v is string => !!v),
			statuses: searchParams
				.getAll('status')
				.map((slug) => fromSlug(slug, ['Completed', 'Planned', 'Dropped', 'Playing']))
				.filter((v): v is string => !!v),
			tiers: searchParams
				.getAll('tier')
				.map((slug) => fromSlug(slug, options.tiers))
				.filter((v): v is string => !!v),
			coOp: searchParams
				.getAll('coop')
				.map((slug) => fromSlug(slug, ['Yes', 'No']))
				.filter((v): v is string => !!v),
			sortOption: null
		};

		const sortKey = searchParams.get('sort') as SortKey | null;
		const sortDir = searchParams.get('dir') as SortDirection | null;
		if (sortKey && sortDir) {
			newState.sortOption = { key: sortKey, direction: sortDir };
		}

		// Deep equality check to prevent loops
		if (JSON.stringify(this._state) === JSON.stringify(newState)) return;

		this.state = newState;
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
			if (!state) return;

			// Always save to session storage as a silent backup
			this.saveToSession();

			const url = new URL(window.location.href);
			const newParams = new URLSearchParams();

			// If we are on the tierlist tab, we keep the URL clean
			if (appStore.activeTab !== 'tierlist' && url.pathname !== '/tierlist') {
				// Search
				if (state.searchTerm) newParams.set('s', state.searchTerm);

				// Multi-select filters using lowercase slugs
				state.platforms.forEach((p) => newParams.append('platform', toSlug(p)));
				state.genres.forEach((g) => newParams.append('genre', toSlug(g)));
				state.statuses.forEach((s) => newParams.append('status', toSlug(s)));
				state.tiers.forEach((t) => newParams.append('tier', toSlug(t)));
				state.coOp.forEach((c) => newParams.append('coop', toSlug(c)));

				// Sort
				if (state.sortOption) {
					newParams.set('sort', state.sortOption.key);
					newParams.set('dir', state.sortOption.direction);
				}
			}

			// Only replace state if the search params actually changed
			if (url.searchParams.toString() === newParams.toString()) return;

			url.search = newParams.toString();
			await replaceState(url.toString(), pageState);
		} catch {
			// Ignore router initialization errors
		}
	}, 300);
}

export const filtersStore = new FiltersStore();
