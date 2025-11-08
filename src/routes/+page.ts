import { dev } from '$app/environment';
import { GameSchema } from '$lib/validation/game';
import { transformGameData } from '$lib/utils/dataTransformer';
import type { Game } from '$lib/types/game';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	// This fetch will happen at build time, and the result will be
	// embedded in the generated JavaScript for the page.
	try {
		// We only load the small games.json for the production build.
		const datasetPath = `games.json`;
		const response = await fetch(datasetPath);

		if (!response.ok) {
			throw new Error(`Failed to fetch games: ${response.statusText}`);
		}

		const data = await response.json();

		// Support both:
		// - { games: Game[] }
		// - Game[]
		const gamesArray = Array.isArray(data) ? data : Array.isArray(data.games) ? data.games : null;

		if (!Array.isArray(gamesArray)) {
			throw new Error('Invalid games data format: expected array');
		}

		const validatedGames: Game[] = gamesArray
			.map((game, index) => {
				const transformedGame = transformGameData(game);
				// Run validation during dev/build
				if (dev) {
					try {
						return GameSchema.parse(transformedGame);
					} catch (validationError) {
						console.error(`Invalid game data at index ${index}:`, validationError);
						return null;
					}
				}
				return transformedGame as unknown as Game;
			})
			.filter((g): g is Game => g !== null);

		// Sort games by title to get the default "critical" list
		const initialCriticalGames = validatedGames
			.toSorted((a, b) => a.title.localeCompare(b.title))
			.slice(0, 6); // Get the first 6 for preloading

		return {
			games: validatedGames,
			criticalGames: initialCriticalGames
		};
	} catch (err) {
		console.error('Failed to load games at build time:', err);
		return {
			games: [],
			criticalGames: []
		};
	}
};
