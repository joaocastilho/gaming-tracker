import { browser } from '$app/environment';
import type { Game } from '$lib/types/game';
import { transformGameData, type RawGameData } from '$lib/utils/dataTransformer';
import { createGameSlug } from '$lib/utils/slugUtils';
import { db } from '$lib/db';
import { completedGamesCache } from './completedGamesCache.svelte';
import { computeAllCardHeights, type CardHeights } from '$lib/utils/textMeasure';
import { CARD_WIDTHS } from '$lib/constants/fonts';

class GamesStore {
	private _games = $state<Game[]>([]);
	loading = $state<boolean>(true);
	error = $state<string | null>(null);

	private _cardHeights = $state<Map<string, Record<number, CardHeights>>>(new Map());

	get cardHeights(): Map<string, Record<number, CardHeights>> {
		return this._cardHeights;
	}

	get games(): Game[] {
		return this._games;
	}

	private set games(value: Game[]) {
		this._games = value;
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
				const transformed = transformGameData(gameRaw as RawGameData);
				return transformed;
			});

			this.games = normalized;
			this.updateCardHeights();

			if (browser && typeof indexedDB !== 'undefined') {
				const plainGames = structuredClone(normalized);
				db.games.bulkPut(plainGames).catch((err) => console.error('Failed to cache games to Dexie:', err));
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
		this.updateCardHeights();
	}

	updateCardHeights(): void {
		const widthValues = Object.values(CARD_WIDTHS);
		this._cardHeights = computeAllCardHeights(this._games, widthValues);
	}

	getCardHeight(gameId: string, cardWidth: number): CardHeights | undefined {
		const widthKey = Math.round(cardWidth);
		return this._cardHeights.get(gameId)?.[widthKey];
	}

	updateGame(id: string, updatedGame: Partial<Game>): void {
		this.games = this._games.map((game) => (game.id === id ? { ...game, ...updatedGame } : game));
		completedGamesCache.updateCache(this._games);
		this.updateCardHeights();
	}

	setAllGames(games: Game[]): void {
		this.games = games;
		completedGamesCache.updateCache(this._games);
		this.updateCardHeights();

		if (browser && typeof indexedDB !== 'undefined') {
			const plainGames = structuredClone(games);
			db.games.bulkPut(plainGames).catch((err) => console.error('Failed to cache games to Dexie:', err));
		}
	}

	async loadFromIDB(): Promise<void> {
		if (typeof window === 'undefined') return;

		try {
			const cachedGames = await db.games.toArray();
			if (cachedGames && cachedGames.length > 0 && this._games.length === 0) {
				this._games = cachedGames;
				this.loading = false;
				completedGamesCache.updateCache(cachedGames);
			}
		} catch (err) {
			console.error('Failed to load games from Dexie:', err);
		}
	}
}

export const gamesStore = new GamesStore();
export type { GamesStore };
