import { writable } from 'svelte/store';
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
		async loadGames(event?: import('@sveltejs/kit').LoadEvent): Promise<void> {
			loading = true;
			error = null;

			try {
				// Use event.fetch for server context, global fetch for client context
				const fetchFn = event?.fetch ?? globalThis.fetch;
				const response = await fetchFn('/games.json');
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
			let found: Game | undefined;
			update((games) => {
				found = games.find((game) => game.id === id);
				return games;
			});
			return found;
		},

		// Calculate score based on ratings (0-20 scale)
		calculateScore(presentation: number, story: number, gameplay: number): number {
			return Math.round(((presentation + story + gameplay) / 3) * 2);
		},

		// Export games as downloadable JSON
		exportGames(games: Game[]): void {
			try {
				const exportData = {
					games,
					meta: {
						lastUpdated: new Date().toISOString(),
						version: '1.0'
					}
				};

				const jsonString = JSON.stringify(exportData, null, 2);
				const blob = new Blob([jsonString], { type: 'application/json' });
				const url = URL.createObjectURL(blob);

				const link = document.createElement('a');
				link.href = url;
				link.download = `games-${new Date().toISOString().split('T')[0]}.json`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				URL.revokeObjectURL(url);
			} catch (err) {
				console.error('Failed to export games:', err);
				error = 'Failed to export games data';
			}
		},

		// Get games by status
		getGamesByStatus(status: 'Planned' | 'Completed'): Game[] {
			let result: Game[] = [];
			update((games) => {
				result = games.filter((game) => game.status === status);
				return games;
			});
			return result;
		},

		// Get game counts by status
		getGameCounts(): { total: number; planned: number; completed: number } {
			let result = { total: 0, planned: 0, completed: 0 };
			update((games) => {
				result = {
					total: games.length,
					planned: games.filter((g) => g.status === 'Planned').length,
					completed: games.filter((g) => g.status === 'Completed').length
				};
				return games;
			});
			return result;
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
