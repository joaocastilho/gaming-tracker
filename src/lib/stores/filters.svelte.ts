import { replaceState } from '$app/navigation';
import { browser } from '$app/environment';
import { debounce } from '$lib/utils/debounce';
import { toSlug, fromSlug } from '$lib/utils/slugUtils';
import { extractFilterOptions } from '$lib/utils/filterOptions';
import { gamesStore } from './games.svelte';
import { lastManualClearTime } from './searchClearCoordinator';

export type SortKey = 'presentation' | 'story' | 'gameplay' | 'score' | 'finishedDate' | 'alphabetical' | 'playtime';

export type SortDirection = 'asc' | 'desc';

const VALID_SORT_KEYS = new Set<string>([
	'presentation',
	'story',
	'gameplay',
	'score',
	'finishedDate',
	'alphabetical',
	'playtime',
]);
const VALID_SORT_DIRECTIONS = new Set<string>(['asc', 'desc']);

function isSortKey(value: string | null): value is SortKey {
	return value !== null && VALID_SORT_KEYS.has(value);
}

function isSortDirection(value: string | null): value is SortDirection {
	return value !== null && VALID_SORT_DIRECTIONS.has(value);
}

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
	searchTerm: '',
};

const initialFilters: FilterState = {
	...baseFilters,
	platforms: [],
	genres: [],
	statuses: [],
	tiers: [],
	coOp: [],
	sortOption: null,
};

class FiltersStore {
	private _state = $state<FilterState | null>(null);
	public isInternalUpdate = $state(false);
	private internalUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

	public isDesktopFiltersExpanded = $state(true);

	private static readonly FILTERS_EXPANDED_KEY = 'filtersExpanded';
	private static readonly FILTERS_STATE_KEY = 'filtersState';

	constructor() {
		if (browser) {
			this.state = { ...initialFilters };
			const savedExpanded = sessionStorage.getItem(FiltersStore.FILTERS_EXPANDED_KEY);
			if (savedExpanded !== null) {
				this.isDesktopFiltersExpanded = savedExpanded === 'true';
			}

			this.loadFromSession();
		}
	}

	get state(): FilterState | null {
		return this._state;
	}

	private set state(value: FilterState | null) {
		this._state = value;
	}

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

	set searchQuery(value: string) {
		this.setSearchTerm(value);
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
		if (!this._state) return;
		if (!this.isAnyFilterApplied() && this._state.sortOption === null) return;
		this.state = { ...initialFilters };
	}

	private startInternalUpdate(): void {
		this.isInternalUpdate = true;
		if (this.internalUpdateTimeout) clearTimeout(this.internalUpdateTimeout);
		this.internalUpdateTimeout = setTimeout(() => {
			this.isInternalUpdate = false;
		}, 1000);
	}

	togglePlatform(platform: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		const platforms = this._state.platforms.includes(platform)
			? this._state.platforms.filter((p) => p !== platform)
			: [...this._state.platforms, platform];
		this.state = { ...this._state, platforms };
	}

	toggleGenre(genre: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		const genres = this._state.genres.includes(genre)
			? this._state.genres.filter((g) => g !== genre)
			: [...this._state.genres, genre];
		this.state = { ...this._state, genres };
	}

	toggleStatus(status: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		const statuses = this._state.statuses.includes(status)
			? this._state.statuses.filter((s) => s !== status)
			: [...this._state.statuses, status];
		this.state = { ...this._state, statuses };
	}

	toggleTier(tier: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		const tiers = this._state.tiers.includes(tier)
			? this._state.tiers.filter((t) => t !== tier)
			: [...this._state.tiers, tier];
		this.state = { ...this._state, tiers };
	}

	toggleCoOp(coOpValue: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		const coOp = this._state.coOp.includes(coOpValue)
			? this._state.coOp.filter((c) => c !== coOpValue)
			: [...this._state.coOp, coOpValue];
		this.state = { ...this._state, coOp };
	}

	removePlatform(platform: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		this.state = {
			...this._state,
			platforms: this._state.platforms.filter((p) => p !== platform),
		};
	}

	removeGenre(genre: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		this.state = { ...this._state, genres: this._state.genres.filter((g) => g !== genre) };
	}

	removeTier(tier: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		this.state = { ...this._state, tiers: this._state.tiers.filter((t) => t !== tier) };
	}

	removeCoOp(coOpValue: string): void {
		if (!this._state) return;
		this.startInternalUpdate();
		this.state = { ...this._state, coOp: this._state.coOp.filter((c) => c !== coOpValue) };
	}

	setFilters(filters: Partial<FilterState>): void {
		if (!this._state) return;
		this.startInternalUpdate();
		this.state = { ...this._state, ...filters };
	}

	resetAllFilters(): void {
		this.startInternalUpdate();
		this.resetFilters();
	}

	setSearchTerm(term: string): void {
		if (!this._state) return;
		if (this._state.searchTerm === term) {
			return;
		}

		this.startInternalUpdate();

		this.state = { ...this._state, searchTerm: term };
	}

	setSort(sortOption: SortOption | null): void {
		if (!this._state) return;
		const currentSort = this._state.sortOption;
		if (currentSort === sortOption) return;
		if (
			currentSort &&
			sortOption &&
			currentSort.key === sortOption.key &&
			currentSort.direction === sortOption.direction
		)
			return;

		this.startInternalUpdate();

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
			sessionStorage.setItem(FiltersStore.FILTERS_EXPANDED_KEY, String(this.isDesktopFiltersExpanded));
		}
	}

	setDesktopFiltersExpanded(expanded: boolean): void {
		if (this.isDesktopFiltersExpanded === expanded) return;
		this.isDesktopFiltersExpanded = expanded;
		if (browser) {
			sessionStorage.setItem(FiltersStore.FILTERS_EXPANDED_KEY, String(this.isDesktopFiltersExpanded));
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

	readSearchFromURL(searchParams: URLSearchParams, _pathname?: string): void {
		if (!this._state) return;

		// Skip if we just updated the URL ourselves to avoid race conditions
		if (this.isInternalUpdate) {
			return;
		}

		if (lastManualClearTime > 0 && Date.now() - lastManualClearTime < 500) {
			return;
		}

		const games = gamesStore.games;
		const options = extractFilterOptions(games);

		const newState: FilterState = {
			searchTerm: searchParams.get('s') ?? '',
			platforms: [],
			genres: [],
			statuses: [],
			tiers: [],
			coOp: [],
			sortOption: null,
		};

		// For platforms, genres, and tiers:
		// If they are in the URL but options are empty, preserve current state to avoid clearing
		// filters while games are loading. If they are NOT in the URL, they should be empty.

		if (searchParams.has('platform')) {
			if (options.platforms.length > 0) {
				newState.platforms = searchParams
					.getAll('platform')
					.map((slug) => fromSlug(slug, options.platforms))
					.filter((v): v is string => !!v);
			} else {
				newState.platforms = this._state?.platforms ?? [];
			}
		}

		if (searchParams.has('genre')) {
			if (options.genres.length > 0) {
				newState.genres = searchParams
					.getAll('genre')
					.map((slug) => fromSlug(slug, options.genres))
					.filter((v): v is string => !!v);
			} else {
				newState.genres = this._state?.genres ?? [];
			}
		}

		newState.statuses = searchParams
			.getAll('status')
			.map((slug) => fromSlug(slug, ['Completed', 'Planned', 'Dropped', 'Playing']))
			.filter((v): v is string => !!v);

		if (searchParams.has('tier')) {
			if (options.tiers.length > 0) {
				newState.tiers = searchParams
					.getAll('tier')
					.map((slug) => fromSlug(slug, options.tiers))
					.filter((v): v is string => !!v);
			} else {
				newState.tiers = this._state?.tiers ?? [];
			}
		}

		newState.coOp = searchParams
			.getAll('coop')
			.map((slug) => fromSlug(slug, ['Yes', 'No']))
			.filter((v): v is string => !!v);

		const rawSortKey = searchParams.get('sort');
		const rawSortDir = searchParams.get('dir');
		const sortKey = isSortKey(rawSortKey) ? rawSortKey : null;
		const sortDir = isSortDirection(rawSortDir) ? rawSortDir : null;
		if (sortKey && sortDir) {
			newState.sortOption = { key: sortKey, direction: sortDir };
		}

		if (JSON.stringify(this._state) === JSON.stringify(newState)) return;

		this.state = newState;
	}

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
			this.saveToSession();
			const url = new URL(window.location.href);
			const newParams = new URLSearchParams();

			if (state.searchTerm) newParams.set('s', state.searchTerm);
			state.platforms.forEach((p) => newParams.append('platform', toSlug(p)));
			state.genres.forEach((g) => newParams.append('genre', toSlug(g)));
			state.statuses.forEach((s) => newParams.append('status', toSlug(s)));
			state.tiers.forEach((t) => newParams.append('tier', toSlug(t)));
			state.coOp.forEach((c) => newParams.append('coop', toSlug(c)));
			if (state.sortOption) {
				newParams.set('sort', state.sortOption.key);
				newParams.set('dir', state.sortOption.direction);
			}

			if (url.searchParams.toString() === newParams.toString()) return;

			url.search = newParams.toString();
			await replaceState(url.toString(), pageState);
		} catch {
			// Ignore URL replaceState errors during rapid filter updates
		}
	}, 300);
}

export const filtersStore = new FiltersStore();
