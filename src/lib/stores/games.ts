import { writable, get, derived, type Readable } from 'svelte/store';
import type { Game } from '$lib/types/game';
import { transformGameData } from '$lib/utils/dataTransformer';
import { completedGamesCache } from './completedGamesCache';

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
			// Check if games are already loaded to prevent duplicate initialization
			const currentGames = get({ subscribe });
			if (currentGames && currentGames.length > 0) {
				if (rawGames && Array.isArray(rawGames) && rawGames.length === currentGames.length) {
					console.log('🎮 GamesStore: Skipping initialization - games already loaded (same length)');
					return;
				} else if (rawGames && Array.isArray(rawGames) && rawGames.length !== currentGames.length) {
					console.log('🎮 GamesStore: Re-initializing with different game count - old:', currentGames.length, 'new:', rawGames.length);
				}
			}

			console.log('🎮 GamesStore: Initializing games with raw data length:', rawGames?.length);
			loadingStore.set(true);
			errorStore.set(null);
			try {
				if (!Array.isArray(rawGames)) {
					throw new Error('Invalid games data: expected array');
				}

				const normalized = rawGames
					.map((g) => {
						const transformed = transformGameData(g as Record<string, unknown>);
						return transformed;
					})
					.filter((g) => {
						const isValid = g && typeof g.id === 'string' && typeof g.title === 'string';
						if (!isValid) {
							console.log('🎮 GamesStore: Filtering out invalid game:', g);
						}
						return isValid;
					}) as unknown as Game[];

				console.log('🎮 GamesStore: Final normalized games length:', normalized.length);
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
				console.error('🎮 GamesStore: Error initializing games:', err);
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
