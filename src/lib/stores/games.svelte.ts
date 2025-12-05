/**
 * Games Store - Svelte 5 Runes
 * Manages the collection of games
 */
import type { Game } from '$lib/types/game';
import { transformGameData } from '$lib/utils/dataTransformer';
import { createGameSlug } from '$lib/utils/slugUtils';
import { completedGamesCache } from './completedGamesCache.svelte';

class GamesStore {
	games = $state<Game[]>([]);
	loading = $state<boolean>(true);
	error = $state<string | null>(null);

	get allPlatforms(): string[] {
		if (!this.games || this.games.length === 0) return [];
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Set is used for temporary collection, converted to array
		const optionsSet = new Set<string>();
		for (const game of this.games) {
			if (typeof game.platform === 'string' && game.platform) {
				optionsSet.add(game.platform);
			}
		}
		return Array.from(optionsSet).sort((a, b) => a.localeCompare(b));
	}

	get allGenres(): string[] {
		if (!this.games || this.games.length === 0) return [];
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Set is used for temporary collection, converted to array
		const optionsSet = new Set<string>();
		for (const game of this.games) {
			if (typeof game.genre === 'string' && game.genre) {
				optionsSet.add(game.genre);
			}
		}
		return Array.from(optionsSet).sort((a, b) => a.localeCompare(b));
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
		return this.games.find((game) => game.id === id);
	}

	getGameBySlug(slug: string): Game | undefined {
		return this.games.find((game) => createGameSlug(game.title) === slug);
	}

	addGame(newGame: Game): void {
		this.games = [...this.games, newGame];
		completedGamesCache.updateCache(this.games);
	}

	updateGame(id: string, updatedGame: Partial<Game>): void {
		this.games = this.games.map((game) => (game.id === id ? { ...game, ...updatedGame } : game));
		completedGamesCache.updateCache(this.games);
	}

	// For backwards compatibility with $gamesStore subscription
	subscribe(fn: (value: Game[]) => void): () => void {
		fn(this.games);
		return () => {};
	}
}

export const gamesStore = new GamesStore();
export type { GamesStore };
