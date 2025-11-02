import { filtersStore } from '$lib/stores/filters.js';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	// Read search query from URL parameters and update filters store
	filtersStore.readFromURL(url.searchParams);

	return {
		// Pass URL data to the page for potential use in components
		url: {
			searchParams: url.searchParams,
			path: url.pathname
		}
	};
};
