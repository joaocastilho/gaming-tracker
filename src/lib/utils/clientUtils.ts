import { transformGameData } from './dataTransformer';
import type { FilterState } from '$lib/stores/filters';

// Define goto as a no-op for test environments
const goto = (
	url: string,
	options?: { replaceState?: boolean; noScroll?: boolean; keepFocus?: boolean }
) => {
	if (typeof window !== 'undefined') {
		// In browser environment, use window.location as fallback
		if (options?.replaceState) {
			window.history.replaceState(null, '', url);
		} else {
			window.location.href = url;
		}
	}
};

export function transformGamesData(games: Record<string, unknown>[]): Record<string, unknown>[] {
	return games.map(transformGameData);
}

export function getUrlParams(searchParams: URLSearchParams): Partial<FilterState> {
	const params: Partial<FilterState> = {};

	const searchTerm = searchParams.get('searchTerm');
	if (searchTerm) params.searchTerm = searchTerm;

	const platforms = searchParams.getAll('platforms');
	if (platforms.length > 0) params.platforms = platforms;

	const genres = searchParams.getAll('genres');
	if (genres.length > 0) params.genres = genres;

	const statuses = searchParams.getAll('statuses');
	if (statuses.length > 0) params.statuses = statuses;

	return params;
}

/**
 * Update URL with current filter state
 * Note: Status parameters are intentionally excluded from URL to avoid
 * conflicts with tier list view which shows all tiered games regardless of status
 */
export function setUrlParams(
	filters: FilterState,
	allPlatforms: string[],
	allGenres: string[]
): void {
	const searchParams = new URLSearchParams();

	if (filters.searchTerm) searchParams.set('searchTerm', filters.searchTerm);

	if (filters.platforms.length !== allPlatforms.length) {
		filters.platforms.forEach((p) => searchParams.append('platforms', p));
	}

	if (filters.genres.length !== allGenres.length) {
		filters.genres.forEach((g) => searchParams.append('genres', g));
	}

	const queryString = searchParams.toString();
	const newUrl = queryString
		? `${window.location.pathname}?${queryString}`
		: window.location.pathname;

	goto(newUrl, { replaceState: true, noScroll: true, keepFocus: true });
}
