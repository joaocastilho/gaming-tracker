import { transformGameData } from './dataTransformer';

export function transformGamesData(games: Record<string, unknown>[]): Record<string, unknown>[] {
	return games.map(transformGameData);
}

import type { FilterState } from '$lib/stores/filters';

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

	const years = searchParams.get('years');
	if (years) {
		try {
			params.years = JSON.parse(years) as [number, number];
		} catch {
			// Ignore invalid format
		}
	}

	const ratings = searchParams.get('ratings');
	if (ratings) {
		try {
			params.ratings = JSON.parse(ratings) as [number, number];
		} catch {
			// Ignore invalid format
		}
	}

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

	// Only include platforms if not all are selected
	if (filters.platforms.length !== allPlatforms.length) {
		filters.platforms.forEach((p) => searchParams.append('platforms', p));
	}

	// Only include genres if not all are selected
	if (filters.genres.length !== allGenres.length) {
		filters.genres.forEach((g) => searchParams.append('genres', g));
	}

	// Intentionally exclude status parameters from URL
	// Status filtering is handled by view selection (completed/planned tabs)
	// rather than URL parameters to avoid conflicts with tier list view

	if (filters.years[0] !== 1980 || filters.years[1] !== new Date().getFullYear()) {
		searchParams.set('years', JSON.stringify(filters.years));
	}

	if (filters.ratings[0] !== 0 || filters.ratings[1] !== 10) {
		searchParams.set('ratings', JSON.stringify(filters.ratings));
	}

	// Only update URL if there are actually parameters to write
	const queryString = searchParams.toString();
	if (queryString) {
		const newUrl = `${window.location.pathname}?${queryString}`;
		window.history.replaceState(null, '', newUrl);
	} else {
		// If no parameters, remove the query string entirely
		window.history.replaceState(null, '', window.location.pathname);
	}
}
