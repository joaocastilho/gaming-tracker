import { writable, get, derived, type Readable } from 'svelte/store';
import { dev } from '$app/environment';
import { GameSchema } from '$lib/validation/game';
import { transformGameData } from '$lib/utils/dataTransformer';
import type { Game } from '$lib/types/game';

function createGamesStore() {
	const { subscribe, set, update } = writable<Game[]>([]);
	const loadingStore = writable<boolean>(false);
	const errorStore = writable<string | null>(null);

	// --- DYNAMIC OPTIONS STORES ---
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

		async loadGames(
			event?: import('@sveltejs/kit').LoadEvent,
			useLargeDataset: boolean = false
		): Promise<void> {
			loadingStore.set(true);
			errorStore.set(null);

			try {
				const fetchFn = event?.fetch ?? globalThis.fetch;
				const datasetPath = useLargeDataset && dev ? `games-large.json` : `games.json`;
				const response = await fetchFn(datasetPath);

				if (!response.ok) throw new Error(`Failed to fetch games: ${response.statusText}`);

				const data = await response.json();
				const gamesArray = Array.isArray(data) ? data : data.games;

				if (!Array.isArray(gamesArray)) {
					throw new Error('Invalid games data format: expected array');
				}

				const validatedGames: Game[] = gamesArray
					.map((game, index) => {
						const transformedGame = transformGameData(game);
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

				set(validatedGames);
				if (validatedGames.length === 0) errorStore.set('No valid games found');
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				errorStore.set(`Failed to load games: ${errorMessage}`);
				set([]);
			} finally {
				loadingStore.set(false);
			}
		},

		// ... keep existing methods like addGame, updateGame, etc. ...

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
			update(($games) => [...$games, newGame]);
		},

		updateGame(id: string, updatedGame: Partial<Game>): void {
			update(($games) =>
				$games.map((game) => (game.id === id ? { ...game, ...updatedGame } : game))
			);
		}
	};
}

export const gamesStore = createGamesStore();
export type GamesStore = ReturnType<typeof createGamesStore>;
