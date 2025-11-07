/**
 * Client-side utilities for game data transformation and URL handling
 * Note: This file should only be used on the client side
 */

import { transformGameData } from './dataTransformer';

/**
 * Transform array of games (client-side only)
 */
export function transformGamesData(games: Record<string, unknown>[]): Record<string, unknown>[] {
	return games.map(transformGameData);
}

import type { FilterState } from '$lib/stores/filters';

/**
 * Get filter parameters from URL
 */
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

	if (filters.statuses.length > 0) {
		filters.statuses.forEach((s) => searchParams.append('statuses', s));
	}

	if (filters.years[0] !== 1980 || filters.years[1] !== new Date().getFullYear()) {
		searchParams.set('years', JSON.stringify(filters.years));
	}

	if (filters.ratings[0] !== 0 || filters.ratings[1] !== 10) {
		searchParams.set('ratings', JSON.stringify(filters.ratings));
	}

	const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
	window.history.replaceState(null, '', newUrl);
}
