import { writable, get, derived, type Readable } from 'svelte/store';
import type { Game } from '$lib/types/game';
import { transformGameData } from '$lib/utils/dataTransformer';

function createGamesStore() {
	const { subscribe, set, update } = writable<Game[]>([]);
	const loadingStore = writable<boolean>(true);
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

		initializeGames(rawGames: unknown[]): void {
			loadingStore.set(true);
			errorStore.set(null);
			try {
				if (!Array.isArray(rawGames)) {
					throw new Error('Invalid games data: expected array');
				}

				// Normalize all incoming games so UI components (cards, tier list, etc.)
				// receive consistent shape: ids, titles, tiers, dates, etc.
				const normalized = rawGames
					.map((g) => transformGameData(g as Record<string, unknown>))
					.filter((g) => g && typeof g.id === 'string' && g.title) as unknown as Game[];

				set(normalized);

				if (normalized.length === 0) {
					errorStore.set('No valid games found from pre-loaded data.');
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
