import { writable, get } from 'svelte/store';
import { GameSchema } from '../validation/game';
import { transformGameData } from '../utils/dataTransformer';
import type { Game } from '../types/game';
import type { ZodError } from 'zod';

/**
 * Games Store - Manages game data, loading states, and error handling
 *
 * Features:
 * - games: Game[] (loaded from JSON)
 * - loading: boolean
 * - error: string | null
 */
function createGamesStore() {
	const { subscribe, set, update } = writable<Game[]>([]);
	let loading = false;
	let error: string | null = null;

	return {
		// Subscribe to games array changes
		subscribe,

		// Get current loading state
		get loading() {
			return loading;
		},

		// Get current error state
		get error() {
			return error;
		},

		// Load games from JSON file
		async loadGames(event?: import('@sveltejs/kit').LoadEvent, useLargeDataset: boolean = false): Promise<void> {
			loading = true;
			error = null;

			try {
				// Use event.fetch for server context, global fetch for client context
				const fetchFn = event?.fetch ?? globalThis.fetch;
				const datasetPath = useLargeDataset ? '/games-large.json' : '/games.json';
				const response = await fetchFn(datasetPath);
				if (!response.ok) {
					throw new Error(`Failed to fetch games: ${response.statusText}`);
				}

				const data = await response.json();

				// Handle both array and object with games property formats
				const gamesArray = Array.isArray(data) ? data : data.games;

				if (!Array.isArray(gamesArray)) {
					throw new Error(
						'Invalid games data format: expected array or object with games property'
					);
				}

				// Transform and validate each game against the schema
				const validatedGames: Game[] = gamesArray
					.map((game, index) => {
						try {
							// First transform the data to match schema requirements
							const transformedGame = transformGameData(game);

							// Then validate the transformed data
							return GameSchema.parse(transformedGame);
						} catch (validationError) {
							console.error(
								`Invalid game data at index ${index} (${game.title}):`,
								validationError
							);

							// Log detailed validation info for debugging
							const zodError = validationError as ZodError;
							console.error('Validation issues:', zodError.issues);

							// Skip invalid games but don't fail the entire load
							return null;
						}
					})
					.filter(Boolean) as Game[];

				set(validatedGames);

				if (validatedGames.length === 0) {
					error = 'No valid games found in data file';
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
				error = `Failed to load games: ${errorMessage}`;
				console.error('Error loading games:', err);
				// Set empty array on error to prevent undefined state
				set([]);
			} finally {
				loading = false;
			}
		},

		// Add a new game
		addGame(newGame: Game): void {
			update((games) => [...games, newGame]);
		},

		// Update an existing game
		updateGame(id: string, updates: Partial<Game>): void {
			update((games) => games.map((game) => (game.id === id ? { ...game, ...updates } : game)));
		},

		// Delete a game
		deleteGame(id: string): void {
			update((games) => games.filter((game) => game.id !== id));
		},

		// Get game by ID
		getGameById(id: string): Game | undefined {
			const games = get({ subscribe });
			return games.find((game) => game.id === id);
		},

		// Calculate score based on ratings (0-20 scale)
		calculateScore(presentation: number, story: number, gameplay: number): number {
			return Math.round(((presentation + story + gameplay) / 3) * 2);
		},


		// Get games by status
		getGamesByStatus(status: 'Planned' | 'Completed'): Game[] {
			const games = get({ subscribe });
			return games.filter((game) => game.status === status);
		},

		// Get game counts by status
		getGameCounts(): { total: number; planned: number; completed: number } {
			const games = get({ subscribe });
			return {
				total: games.length,
				planned: games.filter((g) => g.status === 'Planned').length,
				completed: games.filter((g) => g.status === 'Completed').length
			};
		},

		// Reset store state
		reset(): void {
			set([]);
			loading = false;
			error = null;
		}
	};
}

// Create and export the games store instance
export const gamesStore = createGamesStore();

// Export type for store value
export type GamesStore = ReturnType<typeof createGamesStore>;
