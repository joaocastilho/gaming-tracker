import { writable, get, derived, type Readable } from 'svelte/store';
import type { Game } from '$lib/types/game';
import { transformGameData } from '$lib/utils/dataTransformer';
import { completedGamesCache } from './completedGamesCache';

// Production optimization flag
const IS_PRODUCTION = import.meta.env?.PROD || false;

function createGamesStore() {
	const { subscribe, set, update } = writable<Game[]>([]);
	const loadingStore = writable<boolean>(true);
	const errorStore = writable<string | null>(null);

	function createDerivedOptions(games: Readable<Game[]>, key: keyof Game): Readable<string[]> {
		return derived(games, ($games) => {
			if (!$games || $games.length === 0) return [];
			const optionsSet = new Set<string>();
			for (const game of $games) {
				const value = game[key];
				if (typeof value === 'string' && value) {
					optionsSet.add(value);
				} else if (Array.isArray(value)) {
					value.forEach((item) => typeof item === 'string' && optionsSet.add(item));
				}
			}
			return Array.from(optionsSet).sort((a, b) => a.localeCompare(b));
		});
	}

	const allPlatforms = createDerivedOptions({ subscribe }, 'platform');
	const allGenres = createDerivedOptions({ subscribe }, 'genre');

	return {
		subscribe,
		loading: loadingStore,
		error: errorStore,
		allPlatforms,
		allGenres,
		initializeGames(rawGames: unknown[]): void {
			loadingStore.set(true);
			errorStore.set(null);
			try {
				if (!Array.isArray(rawGames)) {
					throw new Error('Invalid games data: expected array');
				}

				// Production optimization: skip transformation and validation
				if (IS_PRODUCTION && rawGames.length > 0) {
					const firstGame = rawGames[0] as Record<string, unknown>;
					if (firstGame && typeof firstGame.id === 'string') {
						// Assume data is already in correct format for production
						const games = rawGames as Game[];
						set(games);

						if (games.length === 0) {
							errorStore.set('No valid games found from pre-loaded data.');
						} else {
							// Update the completed games cache when games are initialized
							completedGamesCache.updateCache(games);
						}
						return;
					}
				}

				// Development mode: transform and validate data
				const normalized = rawGames.map((gameRaw): Game => {
					const transformed = transformGameData(gameRaw as Record<string, unknown>);
					return transformed as unknown as Game;
				});

				set(normalized);

				if (normalized.length === 0) {
					errorStore.set('No valid games found from pre-loaded data.');
				} else {
					// Update the completed games cache when games are initialized
					completedGamesCache.updateCache(normalized);
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				errorStore.set(`Failed to initialize games: ${errorMessage}`);
				set([]);
			} finally {
				loadingStore.set(false);
			}
		},

		getGameById(id: string): Game | undefined {
			return get({ subscribe }).find((game) => game.id === id);
		},

		getGameBySlug(slug: string): Game | undefined {
			const games = get({ subscribe });
			return games.find(
				(game) =>
					game.title
						.toLowerCase()
						.replace(/[^a-z0-9\s-]/g, '')
						.replace(/\s+/g, '-') === slug
			);
		},

		addGame(newGame: Game): void {
			update(($games) => {
				const newGames = [...$games, newGame];
				// Update the completed games cache when a new game is added
				completedGamesCache.updateCache(newGames);
				return newGames;
			});
		},

		updateGame(id: string, updatedGame: Partial<Game>): void {
			update(($games) => {
				const updatedGames = $games.map((game) =>
					game.id === id ? { ...game, ...updatedGame } : game
				);
				// Update the completed games cache when a game is modified
				completedGamesCache.updateCache(updatedGames);
				return updatedGames;
			});
		}
	};
}

export const gamesStore = createGamesStore();
export type GamesStore = ReturnType<typeof createGamesStore>;
