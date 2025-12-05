import { writable, get, derived, type Readable } from 'svelte/store';
import type { Game } from '$lib/types/game';
import { transformGameData } from '$lib/utils/dataTransformer';
import { completedGamesCache } from './completedGamesCache.svelte';
import { createGameSlug } from '$lib/utils/slugUtils';

function createGamesStore() {
	const { subscribe, set, update } = writable<Game[]>([]);
	const loadingStore = writable<boolean>(true);
	const errorStore = writable<string | null>(null);

	function createDerivedOptions(games: Readable<Game[]>, key: keyof Game): Readable<string[]> {
		return derived(games, ($games) => {
			if (!$games || $games.length === 0) return [];
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Set is used for temporary collection, converted to array
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

				const normalized = rawGames.map((gameRaw): Game => {
					const transformed = transformGameData(gameRaw as Record<string, unknown>);
					return transformed as unknown as Game;
				});

				set(normalized);

				if (normalized.length === 0) {
					errorStore.set('No valid games found from pre-loaded data.');
				} else {
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
			return games.find((game) => createGameSlug(game.title) === slug);
		},

		addGame(newGame: Game): void {
			update(($games) => {
				const newGames = [...$games, newGame];
				completedGamesCache.updateCache(newGames);
				return newGames;
			});
		},

		updateGame(id: string, updatedGame: Partial<Game>): void {
			update(($games) => {
				const updatedGames = $games.map((game) =>
					game.id === id ? { ...game, ...updatedGame } : game
				);
				completedGamesCache.updateCache(updatedGames);
				return updatedGames;
			});
		}
	};
}

export const gamesStore = createGamesStore();
export type GamesStore = ReturnType<typeof createGamesStore>;
