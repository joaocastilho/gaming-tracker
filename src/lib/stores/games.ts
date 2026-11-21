import { CARD_WIDTHS } from '#lib/constants/fonts.js';
import type { Game } from '#lib/types/game.js';
import { type RawGameData, transformGameData } from '#lib/utils/dataTransformer.js';
import { browser } from '#lib/utils/env.js';
import { createGameSlug } from '#lib/utils/slugUtils.js';
import type { CardHeights } from '#lib/utils/textMeasure.js';
import { createSyncSignal } from './signalHelpers.js';

const DB_SEEDED_KEY = 'gaming-tracker-db-seeded';

// Only CARD_WIDTHS.small is consumed today (TierRow), so measuring any other
// width is wasted work. Narrowing the list keeps the map shape compatible.
const MEASURED_WIDTHS = [CARD_WIDTHS.small];

class GamesStore {
	private _games = createSyncSignal<Game[]>([]);
	private _loading = createSyncSignal<boolean>(true);
	private _error = createSyncSignal<string | null>(null);
	private _cardHeights = createSyncSignal<Map<string, Record<number, CardHeights>>>(new Map());

	// Slug/id lookup index, rebuilt only when the games array identity
	// changes. Modal URL parsing and the lookup helpers used to scan the
	// whole array with a slug computation per game on every call.
	private lookupIndex = new Map<string, Game>();
	private lookupIndexSource: Game[] | null = null;

	private buildLookupIndex(): Map<string, Game> {
		const currentGames = this._games.get();
		if (this.lookupIndexSource === currentGames) return this.lookupIndex;

		const index = new Map<string, Game>();
		for (const game of currentGames) {
			if (game.title) {
				const slug = createGameSlug(game.title);
				if (!index.has(slug)) index.set(slug, game);
			}
			if (game.mainTitle && game.subtitle) {
				const mainSlug = createGameSlug(game.mainTitle);
				if (!index.has(mainSlug)) index.set(mainSlug, game);
			}
		}
		for (const game of currentGames) {
			if (game.id && !index.has(game.id)) index.set(game.id, game);
		}

		this.lookupIndex = index;
		this.lookupIndexSource = currentGames;
		return index;
	}

	get loading(): boolean {
		return this._loading.get();
	}

	set loading(value: boolean) {
		this._loading.set(value);
	}

	get error(): string | null {
		return this._error.get();
	}

	set error(value: string | null) {
		this._error.set(value);
	}

	get cardHeights(): Map<string, Record<number, CardHeights>> {
		return this._cardHeights.get();
	}

	get games(): Game[] {
		return this._games.get();
	}

	private set games(value: Game[]) {
		this._games.set(value);
	}

	get allPlatforms(): string[] {
		const currentGames = this._games.get();
		if (!currentGames || currentGames.length === 0) return [];
		const optionsSet = new Set<string>();
		for (const game of currentGames) {
			if (typeof game.platform === 'string' && game.platform) {
				optionsSet.add(game.platform);
			}
		}
		return Array.from(optionsSet).toSorted((a, b) => a.localeCompare(b));
	}

	get allGenres(): string[] {
		const currentGames = this._games.get();
		if (!currentGames || currentGames.length === 0) return [];
		const optionsSet = new Set<string>();
		for (const game of currentGames) {
			if (typeof game.genre === 'string' && game.genre) {
				optionsSet.add(game.genre);
			}
		}
		return Array.from(optionsSet).toSorted((a, b) => a.localeCompare(b));
	}

	/**
	 * Initialize the store from raw data.
	 *
	 * `persist: false` skips the IndexedDB write-back for data that was just
	 * read out of that same database (the layout's cache path), avoiding a
	 * full-table rewrite on every page load. The default keeps the seeding
	 * behavior for network-fetched data.
	 */
	initializeGames(rawGames: unknown[], options: { persist?: boolean } = {}): void {
		const persist = options.persist !== false;
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
			this.scheduleCardHeights();

			if (persist && browser && typeof indexedDB !== 'undefined') {
				this.schedulePersistGamesToDb(normalized);
			}

			if (normalized.length === 0) {
				this.error = 'No valid games found from pre-loaded data.';
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
		return this.buildLookupIndex().get(id);
	}

	getGameBySlug(slug: string): Game | undefined {
		return this.buildLookupIndex().get(slug);
	}

	/**
	 * Resolve the `?game=` URL parameter: the full-title slug, the main-title
	 * slug (for games with a parenthetical subtitle), or the raw game id.
	 */
	findByUrlSlug(slug: string): Game | undefined {
		if (!slug) return undefined;
		return this.buildLookupIndex().get(slug);
	}

	addGame(newGame: Game): void {
		this.games = [...this._games.get(), newGame];
		void this.updateCardHeights([newGame.id]);
	}

	private textMeasurePromise: Promise<typeof import('#lib/utils/textMeasure.js') | null> | null = null;

	// Lazy-load textMeasure (which pulls in @chenglou/pretext) so it stays out of
	// the initial bundle. The promise is cached and never rejects: a failure to
	// load (e.g. Vitest tearing the environment down mid-import) resolves to null
	// and card heights simply stay on their estimated defaults.
	private loadTextMeasure(): Promise<typeof import('#lib/utils/textMeasure.js') | null> {
		if (!this.textMeasurePromise) {
			this.textMeasurePromise = import('#lib/utils/textMeasure.js').catch(() => {
				this.textMeasurePromise = null;
				return null;
			});
		}
		return this.textMeasurePromise;
	}

	async updateCardHeights(gameIds?: string[]): Promise<void> {
		const textMeasure = await this.loadTextMeasure();
		if (!textMeasure) return;

		const currentGames = this._games.get();
		if (gameIds) {
			const newHeights = new Map(this._cardHeights.get());
			for (const id of gameIds) {
				const game = currentGames.find((g) => g.id === id);
				if (game) {
					const heights: Record<number, CardHeights> = {};
					for (const width of MEASURED_WIDTHS) {
						heights[width] = textMeasure.computeCardHeights(game, width);
					}
					newHeights.set(id, heights);
				}
			}
			this._cardHeights.set(newHeights);
		} else {
			this._cardHeights.set(textMeasure.computeAllCardHeights(currentGames, MEASURED_WIDTHS));
		}
	}

	// Full-array measurement blocks the main thread (canvas text shaping for every
	// game), so defer it to idle time. The dynamic import keeps @chenglou/pretext
	// out of the initial bundle. Per-game updates stay fire-and-forget.
	private scheduleCardHeights(): void {
		const run = () => {
			void this.updateCardHeights();
		};
		if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(run, { timeout: 2000 });
		} else {
			setTimeout(run, 0);
		}
	}

	private schedulePersistGamesToDb(games: Game[]): void {
		const run = () => {
			this.persistGamesToDb(games);
		};
		if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(run, { timeout: 2000 });
		} else {
			setTimeout(run, 0);
		}
	}

	updateGame(id: string, updatedGame: Partial<Game>): void {
		this.games = this._games.get().map((game) => (game.id === id ? { ...game, ...updatedGame } : game));
		void this.updateCardHeights([id]);
	}

	private persistGamesToDb(games: Game[]): void {
		const plainGames = structuredClone(games);
		void import('#lib/db.js')
			.then(({ db }) =>
				db.transaction('rw', db.games, async () => {
					await db.games.clear();
					await db.games.bulkPut(plainGames);
				})
			)
			.then(() => {
				try {
					localStorage.setItem(DB_SEEDED_KEY, '1');
				} catch {
					// Ignore storage quota / private-mode restrictions
				}
			})
			.catch((err) => console.error('Failed to cache games to Dexie:', err));
	}

	setAllGames(games: Game[]): void {
		this.games = games;
		this.scheduleCardHeights();

		if (browser && typeof indexedDB !== 'undefined') {
			this.persistGamesToDb(games);
		}
	}

	deleteGame(id: string): void {
		this.games = this._games.get().filter((game) => game.id !== id);
	}
}

export const gamesStore = new GamesStore();
export type { GamesStore };
