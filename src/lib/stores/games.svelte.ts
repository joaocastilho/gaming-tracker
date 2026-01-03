import { browser } from '$app/environment';
import type { Game } from '$lib/types/game';
import { transformGameData } from '$lib/utils/dataTransformer';
import { createGameSlug } from '$lib/utils/slugUtils';
import { idb } from '$lib/utils/idb';
import { completedGamesCache } from './completedGamesCache.svelte';

class GamesStore {
	private _games = $state<Game[]>([]);
	private subscribers = new Set<(value: Game[]) => void>();
	loading = $state<boolean>(true);
	error = $state<string | null>(null);

	get games(): Game[] {
		return this._games;
	}

	private set games(value: Game[]) {
		this._games = value;
		// Notify all subscribers
		for (const fn of this.subscribers) {
			fn(value);
		}
	}

	get allPlatforms(): string[] {
		if (!this._games || this._games.length === 0) return [];
		const optionsSet = new Set<string>();
		for (const game of this._games) {
			if (typeof game.platform === 'string' && game.platform) {
				optionsSet.add(game.platform);
			}
		}
		return Array.from(optionsSet).toSorted((a, b) => a.localeCompare(b));
	}

	get allGenres(): string[] {
		if (!this._games || this._games.length === 0) return [];
		const optionsSet = new Set<string>();
		for (const game of this._games) {
			if (typeof game.genre === 'string' && game.genre) {
				optionsSet.add(game.genre);
			}
		}
		return Array.from(optionsSet).toSorted((a, b) => a.localeCompare(b));
	}

	initializeGames(rawGames: unknown[]): void {
		this.loading = true;
		this.error = null;
		try {
			if (!Array.isArray(rawGames)) {
				throw new Error('Invalid games data: expected array');
			}

			const normalized = rawGames.map((gameRaw): Game => {
				const transformed = transformGameData(gameRaw as Record<string, unknown>);
				return transformed as unknown as Game;
			});

			this.games = normalized;

			// Cache to IDB
			if (browser && typeof indexedDB !== 'undefined') {
				idb
					.setGames(normalized)
					.catch((err) => console.error('Failed to cache games to IDB:', err));
			}

			if (normalized.length === 0) {
				this.error = 'No valid games found from pre-loaded data.';
			} else {
				completedGamesCache.updateCache(normalized);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			this.error = `Failed to initialize games: ${errorMessage}`;
			this.games = [];
		} finally {
			this.loading = false;
		}
	}

	getGameById(id: string): Game | undefined {
		return this._games.find((game) => game.id === id);
	}

	getGameBySlug(slug: string): Game | undefined {
		return this._games.find((game) => createGameSlug(game.title) === slug);
	}

	addGame(newGame: Game): void {
		this.games = [...this._games, newGame];
		completedGamesCache.updateCache(this._games);
	}

	updateGame(id: string, updatedGame: Partial<Game>): void {
		this.games = this._games.map((game) => (game.id === id ? { ...game, ...updatedGame } : game));
		completedGamesCache.updateCache(this._games);
	}

	setAllGames(games: Game[]): void {
		this.games = games;
		completedGamesCache.updateCache(this._games);

		// Cache to IDB
		if (browser && typeof indexedDB !== 'undefined') {
			idb.setGames(games).catch((err) => console.error('Failed to cache games to IDB:', err));
		}
	}

	/**
	 * Load games from IndexedDB for instant display
	 */
	async loadFromIDB(): Promise<void> {
		if (typeof window === 'undefined') return;

		try {
			const cachedGames = await idb.getGames();
			if (cachedGames && cachedGames.length > 0 && this._games.length === 0) {
				this._games = cachedGames;
				this.loading = false;
				completedGamesCache.updateCache(cachedGames);
			}
		} catch (err) {
			console.error('Failed to load games from IDB:', err);
		}
	}

	// For backwards compatibility with $gamesStore subscription
	subscribe(fn: (value: Game[]) => void): () => void {
		// Immediately call with current value
		fn(this._games);
		// Add to subscribers
		this.subscribers.add(fn);
		// Return unsubscribe function
		return () => {
			this.subscribers.delete(fn);
		};
	}
}

export const gamesStore = new GamesStore();
export type { GamesStore };
