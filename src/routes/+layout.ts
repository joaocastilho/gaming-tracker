import { gamesStore } from '$lib/stores/games';

/**
 * Layout load function that initializes the games store
 * Loads games data from games.json and populates the store
 */
export async function load(event) {
	// Start loading games data with event context for proper fetch handling
	gamesStore.loadGames(event);

	// Return any data that needs to be available in the layout
	return {
		// The store will handle loading state and errors internally
		// No additional data needs to be returned from this loader
	};
}
