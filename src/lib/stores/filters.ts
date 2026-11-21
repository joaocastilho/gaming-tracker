import type { PageState } from '#lib/types/pageState.js';
import { debounce } from '#lib/utils/debounce.js';
import { browser } from '#lib/utils/env.js';
import { extractFilterOptions } from '#lib/utils/filterOptions.js';
import { goto } from '#lib/utils/routerBridge.js';
import { fromSlug, toSlug } from '#lib/utils/slugUtils.js';
import { gamesStore } from './games.js';
import { getLastManualClearTime } from './searchClearCoordinator.js';
import { createSyncSignal } from './signalHelpers.js';

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

export function createInitialFilters(): FilterState {
	return {
		searchTerm: '',
		platforms: [],
		genres: [],
		statuses: [],
		tiers: [],
		coOp: [],
		sortOption: null,
	};
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
	private _state = createSyncSignal<FilterState | null>(null);
	private _isInternalUpdate = createSyncSignal<boolean>(false);
	private internalUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
	private _isDesktopFiltersExpanded = createSyncSignal<boolean>(true);
	private _isDesktopSearchOpen = createSyncSignal<boolean>(false);

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

	get isInternalUpdate(): boolean {
		return this._isInternalUpdate.get();
	}

	set isInternalUpdate(value: boolean) {
		this._isInternalUpdate.set(value);
	}

	get isDesktopFiltersExpanded(): boolean {
		return this._isDesktopFiltersExpanded.get();
	}

	set isDesktopFiltersExpanded(value: boolean) {
		this._isDesktopFiltersExpanded.set(value);
	}

	get isDesktopSearchOpen(): boolean {
		return this._isDesktopSearchOpen.get();
	}

	set isDesktopSearchOpen(value: boolean) {
		this._isDesktopSearchOpen.set(value);
	}

	get state(): FilterState | null {
		return this._state.get();
	}

	private set state(value: FilterState | null) {
		this._state.set(value);
	}

	get selectedPlatforms(): string[] {
		return this._state.get()?.platforms ?? [];
	}

	get selectedGenres(): string[] {
		return this._state.get()?.genres ?? [];
	}

	get selectedTiers(): string[] {
		return this._state.get()?.tiers ?? [];
	}

	get selectedCoOp(): string[] {
		return this._state.get()?.coOp ?? [];
	}

	get searchQuery(): string {
		return this._state.get()?.searchTerm ?? '';
	}

	set searchQuery(value: string) {
		this.setSearchTerm(value);
	}

	isAnyFilterApplied(): boolean {
		const state = this._state.get();
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
		return (this._state.get()?.sortOption ?? null) !== null;
	}

	resetFilters(): void {
		const current = this._state.get();
		if (!current) return;
		if (!this.isAnyFilterApplied() && current.sortOption === null) return;
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
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		const platforms = current.platforms.includes(platform)
			? current.platforms.filter((p) => p !== platform)
			: [...current.platforms, platform];
		this.state = { ...current, platforms };
	}

	toggleGenre(genre: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		const genres = current.genres.includes(genre)
			? current.genres.filter((g) => g !== genre)
			: [...current.genres, genre];
		this.state = { ...current, genres };
	}

	toggleStatus(status: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		const statuses = current.statuses.includes(status)
			? current.statuses.filter((s) => s !== status)
			: [...current.statuses, status];
		this.state = { ...current, statuses };
	}

	toggleTier(tier: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		const tiers = current.tiers.includes(tier) ? current.tiers.filter((t) => t !== tier) : [...current.tiers, tier];
		this.state = { ...current, tiers };
	}

	toggleCoOp(coOpValue: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		const coOp = current.coOp.includes(coOpValue)
			? current.coOp.filter((c) => c !== coOpValue)
			: [...current.coOp, coOpValue];
		this.state = { ...current, coOp };
	}

	removePlatform(platform: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		this.state = {
			...current,
			platforms: current.platforms.filter((p) => p !== platform),
		};
	}

	removeGenre(genre: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		this.state = { ...current, genres: current.genres.filter((g) => g !== genre) };
	}

	removeTier(tier: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		this.state = { ...current, tiers: current.tiers.filter((t) => t !== tier) };
	}

	removeCoOp(coOpValue: string): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		this.state = { ...current, coOp: current.coOp.filter((c) => c !== coOpValue) };
	}

	setFilters(filters: Partial<FilterState>): void {
		const current = this._state.get();
		if (!current) return;
		this.startInternalUpdate();
		this.state = { ...current, ...filters };
	}

	resetAllFilters(): void {
		this.startInternalUpdate();
		this.resetFilters();
	}

	setSearchTerm(term: string): void {
		const current = this._state.get();
		if (!current) return;
		if (current.searchTerm === term) {
			return;
		}

		this.startInternalUpdate();
		this.state = { ...current, searchTerm: term };
	}

	setSort(sortOption: SortOption | null): void {
		const current = this._state.get();
		if (!current) return;
		const currentSort = current.sortOption;
		if (currentSort === sortOption) return;
		if (
			currentSort &&
			sortOption &&
			currentSort.key === sortOption.key &&
			currentSort.direction === sortOption.direction
		)
			return;

		this.startInternalUpdate();
		this.state = { ...current, sortOption };
	}

	set(newState: FilterState | null): void {
		this.state = newState;
	}

	update(fn: (state: FilterState | null) => FilterState | null): void {
		this.state = fn(this._state.get());
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

	toggleDesktopSearch(): void {
		this.isDesktopSearchOpen = !this.isDesktopSearchOpen;
	}

	setDesktopSearchOpen(open: boolean): void {
		if (this.isDesktopSearchOpen === open) return;
		this.isDesktopSearchOpen = open;
	}

	saveToSession(): void {
		const current = this._state.get();
		if (!browser || !current) return;
		sessionStorage.setItem(FiltersStore.FILTERS_STATE_KEY, JSON.stringify(current));
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

	readSearchFromURL(searchParams: Pick<URLSearchParams, 'get' | 'getAll' | 'has'>, _pathname?: string): void {
		const current = this._state.get();
		if (!current) return;

		// Skip if we just updated the URL ourselves to avoid race conditions
		if (this.isInternalUpdate) {
			return;
		}

		const lastClearTime = getLastManualClearTime();
		if (lastClearTime > 0 && Date.now() - lastClearTime < 500) {
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

		if (searchParams.has('platform')) {
			if (options.platforms.length > 0) {
				newState.platforms = searchParams
					.getAll('platform')
					.map((slug) => fromSlug(slug, options.platforms))
					.filter((v): v is string => !!v);
			} else {
				newState.platforms = current.platforms ?? [];
			}
		}

		if (searchParams.has('genre')) {
			if (options.genres.length > 0) {
				newState.genres = searchParams
					.getAll('genre')
					.map((slug) => fromSlug(slug, options.genres))
					.filter((v): v is string => !!v);
			} else {
				newState.genres = current.genres ?? [];
			}
		}

		newState.statuses = searchParams
			.getAll('status')
			.map((slug) => fromSlug(slug, ['Completed', 'Planned', 'Playing']))
			.filter((v): v is string => !!v);

		if (searchParams.has('tier')) {
			if (options.tiers.length > 0) {
				newState.tiers = searchParams
					.getAll('tier')
					.map((slug) => fromSlug(slug, options.tiers))
					.filter((v): v is string => !!v);
			} else {
				newState.tiers = current.tiers ?? [];
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

		if (JSON.stringify(current) === JSON.stringify(newState)) return;

		this.state = newState;
	}

	writeSearchToURL = debounce(async (pageState: PageState) => {
		if (typeof window === 'undefined') return;
		try {
			const state = this._state.get();
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
			await goto(url.toString(), { shallow: true, replace: true, state: pageState });
		} catch {
			// Ignore URL replaceState errors during rapid filter updates
		}
	}, 300);
}

export const filtersStore = new FiltersStore();
